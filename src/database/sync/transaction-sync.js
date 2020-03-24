import Sync from '../core/sync.js'
import TransactionNumber from '@/database/controller/transaction-number.js'
import Transaction from '@/database/controller/transaction.js'
import TransactionProduct from '@/database/controller/transaction-product.js'
import TransactionVoid from '@/database/controller/transaction-void.js'
// import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class TransactionNumberSync extends Sync{
  resolveId = 6
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
            }
          }
        },
        transaction_void: {
          select: ['transaction_number_id', 'transaction_id', 'remarks', 'created_at', 'voided_transaction_number']
        }
      },
      condition: [],
      sort: [{
        column: 'number',
        order: 'desc'
      }]
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
        console.log(response)
        resolve(this.resolveId)
        console.log(response['data'])
        if (response['data'].length) {
          let transactionNumber = new TransactionNumber()
          let transaction = new Transaction()
          let transactionProduct = new TransactionProduct()
          let counter = 0
          let maxCount = response['data'].length
          let transactionVoids = []
          for (let x in response['data']) {
            let idbParam = {
              where: {
                db_id: response['data'][x]['id'] * 1
              }
            }
            let transactionNumberData = this.prepareTransactionNumber(response['data'][x])
            transactionNumber.get(idbParam).then((result) => {
              if (!result.length) {
                if(transactionNumberData['operation'] === 2 && response['data'][x]['transaction_void']){
                  console.log(x, response['data'][x])
                  transactionVoids.push(response['data'][x])
                  counter++
                }else{
                  transactionNumber.add(transactionNumberData).then((transactionNumberResult) => {
                    if(transactionNumberData['operation'] === 1 && response['data'][x]['transaction']){
                      let transactionResponse = response['data'][x]['transaction']
                      let transactionData = this.prepareTransactionData(transactionResponse, transactionNumberResult['id'])
                      transaction.add(transactionData).then((transactionResult) => {
                        if(transactionResponse['transaction_products'].length){
                          // TODO Insert Many
                          let transactionProductsData = this.prepareTransactionProducts(transactionResponse['transaction_products'], transactionResult['id'])
                          transactionProduct.add(transactionProductsData).finally(() => {
                            counter++
                          })
                        }else{
                          counter++
                        }
                      }).catch(() => {
                        counter++
                      })
                    }else{
                      counter++
                    }
                  })
                }
              }else{
                counter++
              }
            })
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              this.syncTransactionVoid(transactionVoids).finally(() => {
                resolve(this.resolveId)
              })
              clearInterval(interval)
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
  syncTransactionVoid(transactionNumbers){
    // NOTE Modify this code if transaction sync only sync partially
    let transactionNumberDB = new TransactionNumber()
    let transactionVoidDB = new TransactionVoid()
    return new Promise((resolve, reject) => {
      console.log(transactionNumbers)
      let transactionNumberNumbers = []
      let transactionNumberLookUp = {}
      for(let x = 0; x < transactionNumbers.length; x++){
        transactionNumberLookUp[transactionNumbers[x]['transaction_void']['voided_transaction_number']] = x
        transactionNumberNumbers.push(transactionNumbers[x]['transaction_void']['voided_transaction_number'] * 1)
      }
      let query = {
        where: {
          number: {
            in: transactionNumberNumbers
          }
        },
        with: {
          transaction: {}
        }
      }
      transactionNumberDB.get(query).then((result) => {
        let doneCounter = 0
        let transactionNumberCount = result.length
        console.log(query, transactionNumberNumbers)
        for(let x = 0; x < transactionNumberCount; x++){
          let transactionNumberIndex = transactionNumberLookUp[result[x]['number']]
          let transactionNumberData = this.prepareTransactionNumber(transactionNumbers[transactionNumberIndex])
          transactionNumberDB.add(transactionNumberData).then(transactionNumberResult => {
            let transactionVoidData = this.prepareTransactionVoid(
              transactionNumberResult['id'],
              transactionNumbers[transactionNumberIndex]['transaction_void'],
              result[x]['transaction']['id']
            )
            transactionVoidDB.add(transactionVoidData).finally(() => {
              ++doneCounter
              if(doneCounter === transactionNumberCount){
                resolve(true)
              }
            })
          }).catch(() => {
            ++doneCounter
            if(doneCounter === transactionNumberCount){
              resolve(true)
            }
          })
        }
      }).catch(() => {
        resolve(true)
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
      updated_at: transactionNumber['updated_at']
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
