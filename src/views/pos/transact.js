import TransactionNumber from '@/database/controller/transaction-number'
import Transaction from '@/database/controller/transaction'
import TransactionProduct from '@/database/controller/transaction-product'
export default class Transact {
  transactionNumberDB = new TransactionNumber()
  transactionDB = new Transaction()
  transactionProductDB = new TransactionProduct()
  transact(transaction, transactionProducts){
    return new Promise((resolve, reject) => {
      this.transactionNumberDB.add({ operation: 1, user_id: localStorage.getItem('user_id') * 1 }).then((transactionNumberResult) => {
        if(transactionNumberResult['id']){
          transaction['transaction_number_id'] = transactionNumberResult['id'] * 1
          transaction['store_terminal_id'] = localStorage.getItem('is_terminal') * 1
          this.transactionDB.add(transaction).then((response) => {
            if(response && response['id']){
              this.createTransactionProductRecursion(transactionProducts, 0, response['id']).then(result => {
                resolve(transactionNumberResult)
              }).catch((error) => {
                reject(error)
              })
            }
          })
        }
      }).catch(errorResult => {
        reject(errorResult)
      })
    })
  }
  createTransactionProductRecursion(transactionProducts, index, transactionID){
    return new Promise((resolve, reject) => {
      transactionProducts[index]['transaction_id'] = transactionID * 1
      transactionProducts[index]['product_id'] = transactionProducts[index]['id'] * 1
      delete transactionProducts[index]['id']
      let newTransaction = {
        transaction_id: transactionID,
        product_id: transactionProducts[index]['product_id'] * 1,
        quantity: transactionProducts[index]['quantity'] * 1,
        vat_sales: transactionProducts[index]['vat_sales'] * 1,
        vat_exempt_sales: transactionProducts[index]['vat_exempt_sales'] * 1,
        vat_zero_rated_sales: transactionProducts[index]['vat_zero_rated_sales'] * 1,
        vat_amount: transactionProducts[index]['vat_amount'] * 1,
        discount_amount: transactionProducts[index]['discount_amount'] * 1,
        discount_id: transactionProducts[index]['discount_id'] * 1
      }
      this.transactionProductDB.add(newTransaction).then(response => {
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
