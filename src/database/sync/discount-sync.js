import Sync from '../core/sync.js'
import Discount from '@/database/controller/discount.js'
export default class DiscountSync extends Sync{
  downSync(){
    let latestDate = new Date(localStorage.getItem('latest_discounts_datetime'))
    let param = {
      select: [
        'description',
        'type',
        'value',
        'is_vat_exempt',
        'require_identification_card',
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
      this.retrieveAPIData('discount/retrieve', param).then(response => {
        if (response['data']) {
          let discount = new Discount()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            discount.getByIndex('db_id', response['data'][x]['id']).then((result) => {
              response['data'][x]['type'] = response['data'][x]['type'] * 1
              response['data'][x]['value'] = response['data'][x]['value'] * 1
              response['data'][x]['is_vat_exempt'] = response['data'][x]['is_vat_exempt'] * 1
              response['data'][x]['require_identification_card'] = response['data'][x]['require_identification_card'] * 1
              if (response['data'][x]['deleted_at'] && result) {
                discount.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result && response['data'][x]['deleted_at']) {
                discount.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                result = { ...(result[0]), ...(response['data'][x]) }
                discount.update(result).then(result => {
                  counter++
                })
              } else if (!result && !response['data'][x]['deleted_at']) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                discount.add(response['data'][x]).then(result => {
                  counter++
                })
              }
            })
            // localStorage.setItem('latest_discounts_datetime', new Date(response['data'][x]['updated_at']))
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              resolve(3)
              clearInterval(interval)
            }
          }, 100)
        }else{
          resolve(3)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
}
