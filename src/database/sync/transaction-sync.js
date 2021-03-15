import Sync from '../core/sync.js'
import TransactionNumber from '@/database/controller/transaction-number.js'
import Transaction from '@/database/controller/transaction.js'
import TransactionProduct from '@/database/controller/transaction-product.js'
import TransactionCustomer from '@/database/controller/transaction-customer.js'
import TransactionVoid from '@/database/controller/transaction-void.js'
import Customer from '@/database/controller/customer.js'
let us = require('underscore')
export default class TransactionNumberSync extends Sync{
  resolveId = 6
  customersToUpdate = {} // the customers that is being used in transaction_customers where customer_id is not set yet
  async downSync(){
    let idb = new TransactionNumber()
    let query = {
      limit: 1,
      order: {
        by: 'number',
        type: 'asc'
      }
    }
    return new Promise((resolve, reject) => {
      idb.get(query).then(response => {
        let oldestNumber = null
        if(response.length){
          oldestNumber = response[0]['number']
        }
        this.download(oldestNumber).then(result => {
          resolve(result)
        })
      })
    })
  }
  async download(oldestNumber){
    // NOTE If adding a limit, you need to modify the transaction void
    let param = {
      select: {
        0: 'number',
        1: 'operation',
        2: 'user_id',
        3: 'store_terminal_id',
        4: 'created_at',
        5: 'updated_at',
        6: 'deleted_at',
        transaction: {
          select: {
            0: 'transaction_number_id',
            1: 'customer_id',
            2: 'status',
            3: 'cash_tendered',
            4: 'cash_amount_paid',
            5: 'discount_remarks',
            6: 'discount_id',
            7: 'created_at',
            8: 'updated_at',
            9: 'deleted_at',
            10: 'remarks',
            transaction_products: {
              select: {
                0: 'transaction_id',
                1: 'product_id',
                2: 'quantity',
                3: 'vat_sales',
                4: 'vat_exempt_sales',
                5: 'vat_zero_rated_sales',
                6: 'vat_amount',
                7: 'discount_amount',
                8: 'created_at',
                9: 'updated_at',
                10: 'deleted_at',
                11: 'cost'
              }
            },
            transaction_computation: {
              select: ['transaction_id', 'total_vat_sales', 'total_vat_exempt_sales', 'total_vat_zero_rated_sales', 'total_vat_amount', 'total_discount_amount']
            },
            transaction_payments: {
              select: {
                0: 'transaction_id',
                1: 'payment_method_id',
                2: 'amount',
                3: 'remarks'
              }
            },
            transaction_customers: {
              select: {
                0: 'transaction_id',
                1: 'customer_id'
              }
            },
          }
        },
        transaction_void: {
          select: ['transaction_number_id', 'transaction_id', 'remarks', 'created_at', 'voided_transaction_number']
        }
      },
      condition: [{
        column: 'store_terminal_id',
        value: localStorage.getItem('is_terminal')
      }],
      sort: [{
        column: 'number',
        order: 'desc'
      }],
      // limit: 10
    }
    if(oldestNumber){
      param['condition'].push({
        column: 'number',
        clause: '<',
        value: oldestNumber
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('transaction-number/retrieve', param).then(response => {
        resolve(this.resolveId)
        if (response['data'].length) {
          let updatedTransactionNumbers = response['data']
          this.customersToUpdate = {}
          let transactionNumber = new TransactionNumber()

          let counter = 0
          let maxCount = updatedTransactionNumbers.length
          let transactionVoids = []
          let idbParam = {
            where: {
              db_id: {
                in: us.pluck(updatedTransactionNumbers, 'id')
              }
            }
          }
          let result = transactionNumber.get(idbParam)
          let transactionNumbers = us.groupBy(result, 'db_id')
          let transactionNumbersToAdd = []
          let transactionNumbersIndexLookUp = {} // determine the index base on transaction_number_id
          for (let x in updatedTransactionNumbers) {
            let iDBTransactionNumber = typeof transactionNumbers[updatedTransactionNumbers[x]['id']] !== 'undefined' ? transactionNumbers[updatedTransactionNumbers[x]['id']][0] : null
            let updatedTransactionNumber = updatedTransactionNumbers[x]
            transactionNumbersIndexLookUp[updatedTransactionNumber['id']] = x
            let transactionNumberData = this.prepareTransactionNumber(updatedTransactionNumber)
            if (!iDBTransactionNumber) {
              if(transactionNumberData['operation'] === 2 && updatedTransactionNumber['transaction_void']){ // voided transactions
                transactionVoids.push(updatedTransactionNumber)
                counter++
              }else{
                transactionNumbersToAdd.push(transactionNumberData)
              }
            }else{
              counter++
            }
          }
          if(transactionNumbersToAdd.length){
            transactionNumber.add(transactionNumbersToAdd).then(transactionNumberResult => {
              this.batchInsertTransactionNumberTransaction(
                transactionNumberResult, updatedTransactionNumbers, transactionNumbersIndexLookUp
              ).catch(error => {
                console.error(error)
              })
                .finally(() => {
                  counter += transactionNumbersToAdd.length
                })
            })
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              clearInterval(interval)
              this.syncTransactionVoid(transactionVoids).finally(() => {
              })
            }
          }, 100)
        }else{
          resolve(this.resolveId)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(this.resolveId)
      })
    })
  }
  async batchInsertTransactionNumberTransaction(localTransactionNumbers, transactionNumbers, transactionNumbersIndexLookUp){
    let transactionDB = new Transaction()
    let transactionToAdd = []
    let transactionTransactionProducts = {} // the  key is the db id of transaction
    let transactionTransactionCustomers = {} // the  key is the db id of transaction
    localTransactionNumbers.forEach((localTransactionNumber, index) => {
      const transactionNumberIndex = transactionNumbersIndexLookUp[localTransactionNumber['db_id']]
      let updatedTransactionNumber = transactionNumbers[transactionNumberIndex]
      if(localTransactionNumber['operation'] === 1 && updatedTransactionNumber['transaction']){
        const transactionResponse = updatedTransactionNumber['transaction']
        let transactionData = this.prepareTransactionData(transactionResponse, localTransactionNumber['id'])
        transactionToAdd.push(transactionData)
        transactionTransactionProducts[transactionResponse['id']] = transactionResponse['transaction_products']
        transactionTransactionCustomers[transactionResponse['id']] = transactionResponse['transaction_customers']
      }
    })
    let localTransactions = await transactionDB.add(transactionToAdd)
    this.batchInsertTransactionProducts(localTransactions, transactionTransactionProducts)
    this.batchInsertTransactionCustomer(localTransactions, transactionTransactionCustomers)
    return true
  }
  async batchInsertTransactionProducts(localTransactions, transactionTransactionProducts){
    let transactionProductDB = new TransactionProduct()
    let transactionProductsDBToAdd = []
    localTransactions.forEach(localTransaction => {
      let transactionProducts = transactionTransactionProducts[localTransaction['db_id']]
      let newTransactionProducts = this.prepareTransactionProducts(transactionProducts, localTransaction['id'] * 1)
      transactionProductsDBToAdd = transactionProductsDBToAdd.concat(newTransactionProducts)
    })
    await transactionProductDB.add(transactionProductsDBToAdd, { traceInventory: false })
    return true
  }
  async batchInsertTransactionCustomer(localTransactions, transactionTransactionCustomers){
    let transactionCustomerDB = new TransactionCustomer()
    let transactionCustomerToAdd = []
    let localTransactionIdLookUp = {} // key is db id
    localTransactions.forEach(localTransaction => {
      let transactionCustomers = transactionTransactionCustomers[localTransaction['db_id']]
      transactionCustomerToAdd = transactionCustomerToAdd.concat(transactionCustomers)
      localTransactionIdLookUp[localTransaction['db_id']] = localTransaction['id'] * 1
    })
    let idbParam = {
      where: {
        db_id: {
          in: us.pluck(transactionCustomerToAdd, 'id')
        }
      }
    }
    let customerDB = new Customer()
    let localCustomers = await customerDB.get(idbParam)
    let localCustomerIdLookUp = {} // key is db id
    localCustomers.forEach(localCustomer => {
      localCustomerIdLookUp[localCustomer['db_id']] = localCustomer['id'] * 1
    })
    for(let index in transactionCustomerToAdd){
      transactionCustomerToAdd[index]['transaction_id'] = localTransactionIdLookUp[transactionCustomerToAdd[index]['transaction_id']] * 1
      if(typeof localCustomerIdLookUp[transactionCustomerToAdd[index]['customer_id']] !== 'undefined'){
        transactionCustomerToAdd[index]['customer_db_id'] = transactionCustomerToAdd[index]['customer_id'] * 1
        transactionCustomerToAdd[index]['customer_id'] = localCustomerIdLookUp[transactionCustomerToAdd[index]['customer_id']] * 1
      }else{
        transactionCustomerToAdd[index]['customer_id'] = transactionCustomerToAdd[index]['customer_id'] * 1
        transactionCustomerToAdd[index]['customer_db_id'] = 0
        transactionCustomerToAdd[index]['customer_unsync'] = true // customer does not exist yet
      }
    }
    await transactionCustomerDB.add(transactionCustomerToAdd)
  }
  syncTransactionVoid(voidTransactionNumbers){ // transactionNumbers are voided transaction numbers only
    // NOTE Modify this code if transaction sync only sync partially
    /*
      Steps:
      1. Retrieve All existing transactions that has been voided
      2. Create voided transactions that has not yet created
      3. Create Transaction Void
    */
    let transactionNumberDB = new TransactionNumber()
    let transactionVoidDB = new TransactionVoid()
    return new Promise((resolve, reject) => {
      if(voidTransactionNumbers.length === 0){
        resolve(true)
        return false
      }
      let voidedTransactionNumberId = []
      for(let x = 0; x < voidTransactionNumbers.length; x++){
        voidedTransactionNumberId.push(voidTransactionNumbers[x]['transaction_void']['voided_transaction_number'] * 1)
        voidedTransactionNumberId.push(voidTransactionNumbers[x]['number'] * 1)
      }
      let query = {
        where: {
          number: {
            in: voidedTransactionNumberId
          }
        },
        with: {
          transaction: {}
        }
      }
      let doneCounter = 0
      let transactionNumberCount = voidTransactionNumbers.length
      transactionNumberDB.get(query).then((existingTransactionNumbers) => {
        let existingTransactionNumberLookUp = {}
        existingTransactionNumbers.forEach((existingTransactionNumber, index) => {
          existingTransactionNumberLookUp[existingTransactionNumber['number']] = index
        })
        voidTransactionNumbers.forEach(voidTransactionNumber => {
          const voidedTransactionNumber = voidTransactionNumber['transaction_void']['voided_transaction_number']
          if(typeof existingTransactionNumberLookUp[voidTransactionNumber['number']] === 'undefined'){
            if(typeof existingTransactionNumberLookUp[voidedTransactionNumber] !== 'undefined'){ // voided transaction already exists
              const exisitingTransactionNumberIndex = existingTransactionNumberLookUp[voidedTransactionNumber]
              voidTransactionNumber['transaction_void']['transaction_number_id'] = existingTransactionNumbers[exisitingTransactionNumberIndex]['id']
              voidTransactionNumber['transaction_void']['transaction_id'] = existingTransactionNumbers[exisitingTransactionNumberIndex]['transaction']['id']
              voidTransactionNumber['db_id'] = voidTransactionNumber['id']
              const transactionData = this.prepareTransactionNumber(voidTransactionNumber)
              transactionNumberDB.add(transactionData).then(result => {
                if(result){
                  const transactionVoidData = this.prepareTransactionVoid(
                    result['id'],
                    voidTransactionNumber['transaction_void'],
                    voidTransactionNumber['transaction_void']['transaction_id']
                  )
                  transactionVoidDB.add(transactionVoidData).finally(() => {
                    ++doneCounter
                    if(doneCounter === transactionNumberCount){
                      resolve(true)
                    }
                  })
                }
              })
            }else{ // voided transaction not created yet
              // TODO transaction_void.transaction is not yet retrieved. Modify the retrieve parameter
            }
          }
        })
      }).catch(() => {
        resolve(false)
      })
    })
  }
  prepareTransactionVoid(transactionNumberId, transactionVoid, voidedTransactionId){
    return {
      db_id: transactionVoid['id'] * 1,
      transaction_number_id: transactionNumberId,
      transaction_id: voidedTransactionId,
      voided_transaction_number: transactionVoid['voided_transaction_number'] * 1,
      remarks: transactionVoid['remarks'],
    }
  }
  prepareTransactionNumber(transactionNumber){
    return {
      db_id: transactionNumber['id'] * 1,
      user_id: transactionNumber['user_id'] * 1,
      number: transactionNumber['number'] * 1,
      operation: transactionNumber['operation'] * 1,
      created_at: (new Date(transactionNumber['created_at'])).getTime() + 28800000,
      deleted_at: transactionNumber['deleted_at'],
      updated_at: (new Date(transactionNumber['updated_at'])).getTime() + 28800000
    }
  }
  prepareTransactionData(transaction, transactionNumberId){
    let transactionData = {
      db_id: transaction['id'] * 1,
      transaction_number_id: transactionNumberId * 1,
      customer: transaction['customer_id'] ? transaction['customer_id'] : 'Guest',
      cash_tendered: transaction['cash_tendered'] * 1,
      cash_amount_paid: transaction['cash_amount_paid'] * 1,
      status: transaction['status'] * 1,
      discount_id: transaction['discount_id'] * 1,
      discount_remarks: transaction['discount_remarks'],
      remarks: transaction['remarks'],
      total_vat_sales: 0,
      total_vat_exempt_sales: 0,
      total_vat_zero_rated_sales: 0,
      total_vat_amount: 0,
      total_discount_amount: 0,
      created_at: (new Date(transaction['created_at'])).getTime() + 28800000,
      updated_at: (new Date(transaction['updated_at'])).getTime() + 28800000,
    }
    if(transaction['transaction_computation']){
      transactionData['total_vat_sales'] = transaction['transaction_computation']['total_vat_sales'] * 1
      transactionData['total_vat_exempt_sales'] = transaction['transaction_computation']['total_vat_exempt_sales'] * 1
      transactionData['total_vat_zero_rated_sales'] = transaction['transaction_computation']['total_vat_zero_rated_sales'] * 1
      transactionData['total_vat_amount'] = transaction['transaction_computation']['total_vat_amount'] * 1
      transactionData['total_discount_amount'] = transaction['transaction_computation']['total_discount_amount'] * 1
    }
    transactionData['sub_total_amount'] = transactionData['total_vat_sales'] + transactionData['total_vat_exempt_sales'] + transactionData['total_vat_zero_rated_sales'] + transactionData['total_vat_amount']
    transactionData['total_amount'] = transactionData['sub_total_amount'] - transactionData['total_discount_amount']
    transactionData['transaction_payments'] = transaction['transaction_payments']
    return transactionData
  }
  prepareTransactionProducts(transactionProducts, transactionId){
    let transactionProductData = []
    for(let x = 0; x < transactionProducts.length; x++){
      transactionProductData.push({
        db_id: transactionProducts[x]['id'] * 1,
        transaction_id: transactionId,
        product_id: transactionProducts[x]['product_id'] * 1,
        quantity: transactionProducts[x]['quantity'] * 1,
        cost: transactionProducts[x]['cost'] * 1,
        vat_sales: transactionProducts[x]['vat_sales'] * 1,
        vat_exempt_sales: transactionProducts[x]['vat_exempt_sales'] * 1,
        vat_zero_rated_sales: transactionProducts[x]['vat_zero_rated_sales'] * 1,
        vat_amount: transactionProducts[x]['vat_amount'] * 1,
        discount_id: transactionProducts[x]['discount_id'] ? transactionProducts[x]['discount_id'] * 1 : null,
        discount_amount: transactionProducts[x]['discount_amount'] * 1,
        created_at: (new Date(transactionProducts[x]['created_at'])).getTime() + 28800000,
        updated_at: (new Date(transactionProducts[x]['updated_at'])).getTime() + 28800000
      })
    }
    return transactionProductData
  }
}
