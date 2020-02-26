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
            let idbParam = {
              where: {
                db_id: response['data'][x]['id'] * 1
              }
            }
            let discountData = {
              db_id: response['data'][x]['id'] * 1,
              description: response['data'][x]['description'],
              type: response['data'][x]['type'] * 1,
              value: response['data'][x]['value'] * 1,
              is_vat_exempt: response['data'][x]['is_vat_exempt'] * 1,
              require_identification_card: response['data'][x]['require_identification_card'] * 1,
              created_at: response['data'][x]['created_at'],
              updated_at: response['data'][x]['updated_at']
            }
            discount.get(idbParam).then((result) => {
              if (response['data'][x]['deleted_at'] && result.length) {
                discount.delete(result[0].id).then(() => {
                  counter++
                })
              } else if (result.length && response['data'][x]['deleted_at']) {
                discount.delete(result[0].id).then(() => {
                  counter++
                })
              } else if (result.length) {
                discountData['id'] = result[0]['id']
                discount.update(discountData).then(() => {
                  counter++
                })
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                discount.add(discountData).then(() => {
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
