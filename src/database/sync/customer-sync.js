import Sync from '../core/sync.js'
import Customer from '@/database/controller/customer.js'
import TransactionCustomer from '@/database/controller/transaction-customer.js'
import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class CustomerSync extends Sync{
  async downSync(){
    let idb = new Customer()
    let query = {
      limit: 1,
      order: {
        by: 'updated_at',
        type: 'desc'
      }
    }
    return new Promise((resolve, reject) => {
      idb.get(query).then(response => {
        let latestDate = null
        if(response.length){
          latestDate = datetimeHelper.serverDatetimeFormat(response[0]['updated_at'], true)
        }
        this.download(latestDate).then(result => {
          resolve(result)
        })
      })
    })
  }
  async download(latestDate){
    let param = {
      select: [
        'name',
        'address',
        'birthdate',
        'gender',
        'notes',
        'updated_at',
        'created_at',
        'deleted_at'
      ],
      condition: [],
      with_trash: true
    }
    if(latestDate){
      param['condition'].push({
        column: 'updated_at',
        clause: '>',
        value: latestDate
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('customer/retrieve', param).then(response => {
        if (response['data']) {
          let customer = new Customer()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            let idbParam = {
              where: {
                db_id: response['data'][x]['id'] * 1
              }
            }

            let customerData = {
              db_id: response['data'][x]['id'] * 1,
              name: response['data'][x]['name'],
              gender: response['data'][x]['gender'] * 1,
              notes: response['data'][x]['notes'],
              birthdate: response['data'][x]['birthdate'] ? (new Date(response['data'][x]['birthdate'])).getTime() : null,
              created_at: new Date(response['data'][x]['created_at']).getTime() + 28800000,
              updated_at: new Date(response['data'][x]['updated_at']).getTime() + 28800000
            }
            customer.get(idbParam).then((result) => {
              if (response['data'][x]['deleted_at'] && result.length) {
                customer.delete(result[0].id).finally(result => {
                  counter++
                })
              } else if (result.length) {
                customerData['id'] = result[0]['id']
                customer.update(customerData).finally(() => {
                  counter++
                })
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                customer.add(customerData).then(result => {
                  const updateTransactionCustomerData = {
                    customer_id: result['id'],
                    where: {
                      customer_db_id: customerData['db_id']
                    }
                  }
                  const transactionCustomerDB = new TransactionCustomer()
                  transactionCustomerDB.update(updateTransactionCustomerData)
                }).finally(result => {
                  counter++
                })
              }else{
                counter++
              }
            })
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              resolve(2)
              clearInterval(interval)
            }
          }, 100)
        }else{
          resolve(2)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(2)
        reject(error)
      })
    })
  }
}
