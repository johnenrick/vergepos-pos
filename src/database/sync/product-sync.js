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
        6: 'category_id',
        7: 'barcode'
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('product/retrieve', param).then(response => {
        if (response['data']) {
          let product = new Product()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            product.getByIndex('db_id', response['data'][x]['id']).then((result) => {
              if (response['data'][x]['deleted_at'] && result) {
                product.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result && response['data'][x]['deleted_at']) {
                product.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result) {
                product.update(this.newProductDetail(response['data'][x], result[0])).then(result => {
                  counter++
                })
              } else if (!result && !response['data'][x]['deleted_at']) {
                product.add(this.newProductDetail(response['data'][x])).then(result => {
                  counter++
                })
              }else{
              }
            })
            // localStorage.setItem('latest_product_datetime', new Date(response['data'][x]['updated_at']))
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              resolve(4)
              clearInterval(interval)
            }
          }, 100)
        }else{
          resolve(4)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
  newProductDetail(dbProduct, idProduct = {}){
    idProduct.db_id = dbProduct['id']
    idProduct.description = dbProduct['description']
    idProduct.barcode = dbProduct['barcode']
    idProduct.cost = dbProduct['cost'] * 1
    idProduct.price = dbProduct['price'] * 1
    idProduct.short_description = dbProduct['short_description']
    idProduct.category_id = dbProduct['category_id'] * 1
    return idProduct
  }
}
