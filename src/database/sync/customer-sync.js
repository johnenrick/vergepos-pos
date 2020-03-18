import Sync from '../core/sync.js'
import Customer from '@/database/controller/customer.js'
export default class CustomerSync extends Sync{
  downSync(){
    let latestDate = new Date(localStorage.getItem('latest_customers_datetime'))
    let param = {
      select: [
        'name',
        'address',
        'birthdate',
        'updated_at',
        'created_at',
        'deleted_at'
      ],
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('customer/retrieve', param).then(response => {
        if (response['data']) {
          let customer = new Customer()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            customer.getByIndex('db_id', response['data'][x]['id']).then((result) => {
              if (response['data'][x]['deleted_at'] && result) {
                customer.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result && response['data'][x]['deleted_at']) {
                product.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                result = { ...(result[0]), ...(response['data'][x]) }
                result['birthdate'] = (new Date(result['birthdate'])).getTime()
                customer.update(result).then(result => {
                  counter++
                })
              } else if (!result && !response['data'][x]['deleted_at']) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                customer.add(response['data'][x]).then(result => {
                  counter++
                })
              }
            })
            // localStorage.setItem('latest_customers_datetime', new Date(response['data'][x]['updated_at']))
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
