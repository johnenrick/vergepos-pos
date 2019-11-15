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
    return this.retrieveAPIData('discount/retrieve', param).then(response => {
      if (response['data']) {
        let discount = new Discount()
        for (let x in response['data']) {
          discount.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              discount.delete(result[0].id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result[0].id)
            } else if (result) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              result = { ...(result[0]), ...(response['data'][x]) }
              discount.update(result)
            } else if (!result && !response['data'][x]['deleted_at']) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              discount.add(response['data'][x])
            }
          })
          // localStorage.setItem('latest_discounts_datetime', new Date(response['data'][x]['updated_at']))
        }
      }
      return true
    }).catch((error, status) => {
      console.log('failed to sync', error, status)
      return error
    })
  }
}
