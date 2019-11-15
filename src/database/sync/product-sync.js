import Sync from '../core/sync.js'
import Product from '@/database/controller/product.js'
export default class ProductSync extends Sync{
  downSync(){
    let latestDate = new Date(localStorage.getItem('latest_products_datetime'))
    let param = {
      select: {
        0: 'description',
        1: 'updated_at',
        2: 'deleted_at',
        3: 'cost',
        4: 'price',
        5: 'short_description',
        6: 'category_id'
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    return this.retrieveAPIData('product/retrieve', param).then(response => {
      if (response['data']) {
        let product = new Product()
        for (let x in response['data']) {
          product.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              product.delete(result[0].id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result[0].id)
            } else if (result) {
              result[0].description = response['data'][x]['description']
              result[0].cost = response['data'][x]['cost'] * 1
              result[0].price = response['data'][x]['price'] * 1
              result[0].short_description = response['data'][x]['short_description']
              result[0].category_id = response['data'][x]['category_id'] * 1
              result[0].required_identification_card = response['data'][x]['required_identification_card'] * 1
              product.update(result[0])
            } else if (!result && !response['data'][x]['deleted_at']) {
              product.add({
                db_id: response['data'][x]['id'],
                description: response['data'][x]['description'],
                cost: response['data'][x]['cost'] * 1,
                price: response['data'][x]['price'] * 1,
                short_description: response['data'][x]['short_description'],
                category_id: response['data'][x]['category_id'] * 1
              })
            }else{
            }
          })
          // localStorage.setItem('latest_product_datetime', new Date(response['data'][x]['updated_at']))
        }
      }
      return true
    }).catch((error, status) => {
      console.log('failed to sync', error, status)
      return error
    })
  }
}
