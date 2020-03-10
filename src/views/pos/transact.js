import TransactionNumber from '@/database/controller/transaction-number'
import Transaction from '@/database/controller/transaction'
import TransactionProduct from '@/database/controller/transaction-product'
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
          this.transactionDB.add(transaction).then((response) => {
            if(response && response['id']){
              let transactionDate = typeof transaction['created_at'] !== 'undefined' ? transaction['created_at'] : null
              this.createTransactionProductRecursion(transactionProducts, 0, response['id'], transactionDate).then(result => {
                resolve(transactionNumberResult)
              }).catch((error) => {
                reject(error)
              })
            }
          })
        }
      }).catch(errorResult => {
        console.error(errorResult)
        reject(errorResult)
      })
    })
  }
  createTransactionProductRecursion(transactionProducts, index, transactionID, transactionDate = null){
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
      this.transactionProductDB.add(newTransactionProduct).then(response => {
        index++
        if(index < transactionProducts.length){
          this.createTransactionProductRecursion(transactionProducts, index, transactionID).then(result => {
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
