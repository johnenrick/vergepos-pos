import Customer from '@/database/controller/customer'
import TransactionCustomer from '@/database/controller/transaction-customer'
import APIRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
class CustomerUpSync {
  upload(){
    return new Promise((resolve, reject) => {
      this.retrieveUnsynchedCustomer().finally(() => {
        resolve(true)
      })
    })
  }
  retrieveUnsynchedCustomer(){
    return new Promise((resolve, reject) => {
      const customerDB = new Customer()
      const param = {
        where: {
          db_id: 0
        }
      }
      customerDB.get(param).then(result => {
        if(result.length){
          result.forEach((customer, index) => {
            if(customer['birthdate']){
              result[index]['birthdate'] = DatetimeHelper.serverDatetimeFormat(customer['birthdate'], false, true)
            }else{
              delete result[index]['birthdate']
            }
          })
          this.uploadCustomer(result).finally(() => {
            resolve(true)
          })
        }else{
          resolve(false)
        }
      })
    })
  }
  uploadCustomer(customers){
    return new Promise((resolve, reject) => {
      APIRequest.request('customer/batch-create', { customers: customers }, (response) => {
        if(response['data'] && response['data']['customer_ids'].length === customers.length){
          const customerDBIds = response['data']['customer_ids']
          const customerDB = new Customer()
          let remainingCustomer = customerDBIds.length
          customers.forEach((customer, index) => {
            customers[index]['db_id'] = customerDBIds[index]
            const newCustomerData = {
              id: customer['id'],
              db_id: customerDBIds[index]
            }
            customerDB.update(newCustomerData).then((result) => {
              if(result){
                const transactionCustomerData = {
                  customer_db_id: customerDBIds[index],
                  where: {
                    customer_id: newCustomerData['id'],
                  }
                };
                (new TransactionCustomer()).update(transactionCustomerData).finally(() => {
                  --remainingCustomer
                  if(remainingCustomer === 0){
                    resolve(customers)
                  }
                })
              }else{
                --remainingCustomer
                if(remainingCustomer === 0){
                  resolve(customers)
                }
              }
            }).catch(() => {
              --remainingCustomer
              if(remainingCustomer === 0){
                resolve(customers)
              }
            })
          })
        }else{
          resolve(true)
        }
      }, () => {
        reject(false)
      })
    })
  }
}

let customerUpSync = new CustomerUpSync()
export default customerUpSync
