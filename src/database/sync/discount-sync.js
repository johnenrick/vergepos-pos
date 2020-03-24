import Sync from '../core/sync.js'
import Discount from '@/database/controller/discount.js'
import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class DiscountSync extends Sync{
  async downSync(){
    let idb = new Discount()
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
          latestDate = datetimeHelper.serverDatetimeFormat(response[0]['updated_at'])
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
        'description',
        'type',
        'value',
        'is_vat_exempt',
        'require_identification_card',
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
                discount.delete(result[0].id).finally(() => {
                  counter++
                })
              } else if (result.length) {
                discountData['id'] = result[0]['id']
                discount.update(discountData).finally(() => {
                  counter++
                })
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                response['data'][x]['db_id'] = response['data'][x]['id']
                delete response['data'][x]['id']
                discount.add(discountData).finally(() => {
                  counter++
                })
              }else{
                counter++
              }
            })
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
        resolve(3)
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
}
