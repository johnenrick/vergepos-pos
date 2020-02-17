import Transaction from '@/database/controller/transaction'
import TransactionNumber from '@/database/controller/transaction-number'
import TransactionProduct from '@/database/controller/transaction-product'
import APIRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
let currentlySyncingDataUp = false
class UpSync {
  lastTransactionId = null
  doneUploadCallBacks = []
  silentSync(){
    this.sync().finally(() => {
      setTimeout(() => {
        this.silentSync()
      }, 10000)
    })
  }
  sync(){
    if(currentlySyncingDataUp){
      return currentlySyncingDataUp
    }
    currentlySyncingDataUp = new Promise((resolve, reject) => {
      this.uploadTransactions().finally(() => {
        currentlySyncingDataUp = null
        resolve(true)
      })
    })
    return currentlySyncingDataUp
  }
  uploadTransactions(limit = 10){
    let transaction = new Transaction()
    let query = {
      where: {
        db_id: 0
      },
      with: {
        transaction_products: {}
      },
      join: {
        with: 'transaction_numbers',
        on: 'transactions.transaction_number_id=transaction_numbers.id',
        type: 'inner',
        as: {
          id: 'transaction_number_id',
          db_id: 'transaction_number_db_id',
          user_id: 'transaction_number_user_id',
          number: 'transaction_number_number',
          operation: 'transaction_number_operation',
          created_at: 'transaction_number_created_at',
          updated_at: 'transaction_number_updated_at',
          deleted_at: 'transaction_number_deleted_at',
        },
        order: {
          by: 'created_at',
          type: 'asc'
        }
      }
    }
    if(limit){
      query['limit'] = limit
    }
    return new Promise((resolve, reject) => {
      transaction.get(query).then(result => {
        if(result.length){
          if(this.lastTransactionId === result[result.length - 1]){
            reject({
              reason: 'equal_transaction_id',
              transaction_id: this.lastTransactionId
            })
            return false
          }else{
            this.lastTransactionId = result[result.length - 1]
          }
          for(let x = 0; x < result.length; x++){
            this.prepareTransactionNumber(result[x])
          }
          this.requestTransaction(result).then(result => {
            resolve(result)
          }).catch(result => {
            reject({
              reason: 'upload_failed'
            })
          })
        }else{
          resolve(true)
          console.info('No transaction to be uploaded')
        }
      })
    })
  }
  requestTransaction(transactions){
    let param = {
      store_terminal_id: localStorage.getItem('is_terminal') * 1,
      transactions: transactions
    }
    return new Promise((resolve, reject) => {
      APIRequest.request('transaction/sync', param, response => {
        if(!response['error'] && transactions.length === response['data'].length){
          let doneCounter = 0
          for(let x = 0; x < transactions.length; x++){
            if(!response['data'][x]['error']){
              this.updateTransactionDBId(transactions[x], response['data'][x]).then((result) => {
                ++doneCounter
                if(doneCounter === transactions.length){
                  resolve(true)
                }
              })
            }
          }
        }else{
          resolve(true)
        }
      }, () => {
        reject(true)
      })
    })
  }
  async updateTransactionDBId(transaction, transactionResponse){
    let transactionDB = new Transaction()
    let transactionProductDB = new TransactionProduct()
    let transactionNumberDB = new TransactionNumber()
    return new Promise(async(resolve, reject) => {
      await transactionDB.update({ id: transaction['id'], db_id: transactionResponse['id'] })
      await transactionNumberDB.update({ id: transaction['transaction_number_id'], db_id: transactionResponse['transaction_number']['id'] })
      if(transactionResponse['transaction_products'].length === transaction['transaction_products'].length){
        for(let x = 0; x < transactionResponse['transaction_products'].length; x++){
          if(!transaction['transaction_products'][x]['id']){
            let transactionProductParam = {
              id: transaction['transaction_products'][x]['id'],
              db_id: transactionResponse['transaction_products'][x]['id'],
            }
            await transactionProductDB.update(transactionProductParam)
          }
        }
      }else{
        console.error('Tranasction Products Length are not equal.Transaction ID: ', transaction['id'])
      }
      resolve(true)
    })
  }
  prepareTransactionNumber(transaction){
    // console.log('transaction', transaction['id'], transaction['transaction_number_user_id'], typeof transaction['transaction_number_user_id'], transaction['transaction_number_user_id'] * 1)
    transaction['transaction_number'] = {
      user_id: transaction['transaction_number_user_id'],
      number: transaction['transaction_number_number'],
      operation: transaction['transaction_number_operation'],
    }
    // delete transaction['transaction_number_db_id']
    // delete transaction['transaction_number_user_id']
    // delete transaction['transaction_number_number']
    // delete transaction['transaction_number_operation']
    // delete transaction['transaction_number_created_at']
    // delete transaction['transaction_number_updated_at']
    // delete transaction['transaction_number_deleted_at']
    // console.log('transaction 2', transaction)
  }
}
let upSync = new UpSync()
export default upSync
