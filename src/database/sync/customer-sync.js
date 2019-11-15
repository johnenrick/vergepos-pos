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
    return this.retrieveAPIData('customer/retrieve', param).then(response => {
      if (response['data']) {
        let customer = new Customer()
        for (let x in response['data']) {
          customer.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              customer.delete(result[0].id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result[0].id)
            } else if (result) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              result = { ...(result[0]), ...(response['data'][x]) }
              result['birthdate'] = (new Date(result['birthdate'])).getTime()
              customer.update(result)
            } else if (!result && !response['data'][x]['deleted_at']) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              customer.add(response['data'][x])
            }
          })
          // localStorage.setItem('latest_customers_datetime', new Date(response['data'][x]['updated_at']))
        }
      }
      return true
    }).catch((error, status) => {
      console.log('failed to sync', error, status)
      return error
    })
  }
}
