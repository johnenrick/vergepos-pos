import TransactionNumber from '@/database/controller/transaction-number'
import Transaction from '@/database/controller/transaction'
import TransactionProduct from '@/database/controller/transaction-product'
import TransactionCustomer from '@/database/controller/transaction-customer'
export default class Transact {
  transactionNumberDB = new TransactionNumber()
  transactionDB = new Transaction()
  transactionProductDB = new TransactionProduct()
  transact(transaction, transactionProducts){
    return new Promise((resolve, reject) => {
      let transactionNumberEntry = {
        db_id: 0,
        operation: 1,
        store_terminal_id: localStorage.getItem('is_terminal') * 1,
        user_id: localStorage.getItem('user_id') * 1
      }
      if(typeof transaction['created_at'] !== 'undefined'){
        transactionNumberEntry['created_at'] = transaction['created_at']
      }
      this.transactionNumberDB.add(transactionNumberEntry).then((transactionNumberResult) => {
        if(transactionNumberResult['id']){
          transaction['transaction_number_id'] = transactionNumberResult['id'] * 1
          transaction['db_id'] = 0
          const customers = transaction['customers']
          delete transaction['customers']
          this.transactionDB.add(transaction).then((response) => {
            localStorage.setItem('has_transactions', 1)
            if(response && response['id']){
              let transactionDate = typeof transaction['created_at'] !== 'undefined' ? transaction['created_at'] : null
              if(customers.length){
                this.createTransactionCustomers(response['id'], customers)
              }
              if(transactionProducts.length){
                this.createTransactionProductRecursion(transactionProducts, 0, response['id'], transactionNumberResult['number'], transactionDate).then(result => {
                  resolve(transactionNumberResult)
                }).catch((error) => {
                  reject(error)
                })
              }else{
                resolve(transactionNumberResult)
              }
            }
          })
        }
      }).catch(errorResult => {
        console.error(errorResult)
        reject(errorResult)
      })
    })
  }
  createTransactionCustomers(transactionId, customers){
    const transactionCustomerDB = new TransactionCustomer()
    customers.forEach((customer, index) => {
      customers[index]['transaction_id'] = transactionId
      customers[index]['customer_id'] = customer['id']
      customers[index]['customer_db_id'] = customer['db_id']
      delete customers[index]['id']
    })
    transactionCustomerDB.add(customers).then(result => {
      console.log('createTransactionCustomers', result)
    })
  }
  createTransactionProductRecursion(transactionProducts, index, transactionID, transactionNumber, transactionDate = null){
    return new Promise((resolve, reject) => {
      transactionProducts[index]['transaction_id'] = transactionID * 1
      transactionProducts[index]['product_id'] = transactionProducts[index]['id'] * 1
      delete transactionProducts[index]['id']
      let newTransactionProduct = {
        transaction_id: transactionID,
        db_id: 0,
        product_id: transactionProducts[index]['product_id'] * 1,
        cost: transactionProducts[index]['cost'] * transactionProducts[index]['quantity'],
        quantity: transactionProducts[index]['quantity'] * 1,
        vat_sales: transactionProducts[index]['vat_sales'] * 1,
        vat_exempt_sales: transactionProducts[index]['vat_exempt_sales'] * 1,
        vat_zero_rated_sales: transactionProducts[index]['vat_zero_rated_sales'] * 1,
        vat_amount: transactionProducts[index]['vat_amount'] * 1,
        discount_amount: transactionProducts[index]['discount_amount'] * 1,
        discount_id: transactionProducts[index]['discount_id'] * 1
      }
      if(transactionDate){
        newTransactionProduct['created_at'] = transactionDate
      }
      this.transactionProductDB.add(newTransactionProduct, { 'transaction_number': transactionNumber, trace_inventory: true }).then(response => {
        index++
        if(index < transactionProducts.length){
          this.createTransactionProductRecursion(transactionProducts, index, transactionID, transactionNumber, transactionDate).then(result => {
            resolve(result)
          }).catch(error => {
            reject(error)
          })
        }else{
          resolve(response['id'])
        }
      }).catch((error) => {
        console.error('Critical Error in Transaction Product Insertion', error, transactionProducts[index])
        reject(error)
      })
    })
  }
  createTransactionNumber(operation, transaction){
    return new Promise((resolve, reject) => {

    })
  }
}
