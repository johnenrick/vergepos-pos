import TransactionNumber from '@/database/controller/transaction-number'
import Transaction from '@/database/controller/transaction'
import TransactionVoid from '@/database/controller/transaction-void'
import APIRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
class TransactNumberUpSync {
  upload(){
    return new Promise((resolve, reject) => {
      let query = {
        limit: 20,
        order: {
          by: 'number',
          type: 'asc'
        },
        where: {
          db_id: 0
        },
        with: {
          transaction: {
            with: {
              transaction_products: {},
              transaction_customers: {}
            }
          },
          transaction_void: {}
        }
      }
      let transactionNumber = new TransactionNumber()
      transactionNumber.get(query).then((result) => {
        if(result.length){
          this.prepareTransactionNumber(result)
          let param = {
            store_terminal_id: localStorage.getItem('is_terminal'),
            transaction_numbers: result
          }
          APIRequest.request('transaction-number/sync', param, (response) => {
            if(response['data']){
              this.updateTransactionNumber(result, response['data'])
            }
            if(this.resync){
              this.resync = false
              this.sync().finally(() => {
                resolve(true)
              })
            }else{
              resolve(true)
            }
          }, (response, status) => {
            console.log('Transaction Number Up Sync API Error', response, status)
            reject(false)
          })
        }else{
          this.resync = false
          resolve(true)
        }
      }).catch(error => {
        resolve(error)
        console.error('Transaction Number Up Sync Error', error)
      })
    })
  }
  prepareTransactionNumber(transactionNumbers){
    for(let x = 0; x < transactionNumbers.length; x++){
      transactionNumbers[x]['created_at'] = DatetimeHelper.serverDatetimeFormat(transactionNumbers[x]['created_at'], true)
      if(typeof transactionNumbers[x]['transaction'] !== 'undefined' && typeof transactionNumbers[x]['transaction']['transaction_customers'] !== 'undefined' && transactionNumbers[x]['transaction']['transaction_customers'].length){
        transactionNumbers[x]['transaction']['transaction_customers'].forEach((transactionCustomer, index) => {
          transactionNumbers[x]['transaction']['transaction_customers'][index]['customer_id'] = transactionCustomer['customer_db_id']
          delete transactionCustomer['id']
          delete transactionCustomer['customer_db_id']
          delete transactionCustomer['name']
          delete transactionCustomer['created_at']
          delete transactionCustomer['updated_at']
          delete transactionCustomer['deleted_at']
        })
      }
    }
  }
  async updateTransactionNumber(uploadedTransactionNumbers, transactionNumbers){
    let transactionDB = new Transaction()
    // let transactionProductDB = new TransactionProduct()
    let transactionNumberDB = new TransactionNumber()
    let transactionVoidDB = new TransactionVoid()
    for(let x = 0; x < transactionNumbers.length; x++){
      if(transactionNumbers[x]['error'] === 'already_exists'){
        // TODO Do something incredible
        await transactionNumberDB.update({ id: uploadedTransactionNumbers[x]['id'], db_id: transactionNumbers[x]['id'] })
      }else{
        await transactionNumberDB.update({ id: uploadedTransactionNumbers[x]['id'], db_id: transactionNumbers[x]['id'] })
        if(transactionNumbers[x]['operation'] * 1 === 1 && typeof transactionNumbers[x]['transaction'] !== 'undefined' && transactionNumbers[x]['transaction']){
          await transactionDB.update({ id: uploadedTransactionNumbers[x]['transaction']['id'], db_id: transactionNumbers[x]['transaction']['id'] })
        }else if(transactionNumbers[x]['operation'] * 1 === 2 && typeof transactionNumbers[x]['transaction_void'] !== 'undefined' && transactionNumbers[x]['transaction_void']){
          await transactionVoidDB.update({ id: uploadedTransactionNumbers[x]['transaction_void']['id'], db_id: transactionNumbers[x]['transaction_void']['id'] })
        }
      }
    }
  }
}
let transactNumberUpSync = new TransactNumberUpSync()
export default transactNumberUpSync
