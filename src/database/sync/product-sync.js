import Sync from '../core/sync.js'
import Product from '@/database/controller/product.js'
import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
let us = require('underscore')
export default class ProductSync extends Sync{
  async downSync(){
    let idb = new Product()
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
      select: {
        0: 'description',
        1: 'updated_at',
        2: 'deleted_at',
        3: 'cost',
        4: 'price',
        5: 'short_description',
        6: 'category_id',
        7: 'barcode',
        8: 'created_at'
      },
      condition: [
        {
          column: 'categories.deleted_at',
          value: null
        }
      ],
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
      this.retrieveAPIData('product/retrieve', param).then(response => {
        if (response['data']) {
          let product = new Product()
          let counter = 0
          let maxCount = response['data'].length
          let idbParam = {
            where: {
              db_id: {
                in: us.pluck(response['data'], 'id')
              }
            }
          }
          product.get(idbParam).then((result) => {
            let products = us.groupBy(result, 'db_id')
            let productToAdd = []
            for (let x in response['data']) {
              // these are the entries that will be added in bulk in the idb
              let productData = {
                db_id: response['data'][x]['id'] * 1,
                description: response['data'][x]['description'],
                barcode: response['data'][x]['barcode'],
                category_id: response['data'][x]['category_id'] * 1,
                price: response['data'][x]['price'] * 1,
                cost: response['data'][x]['cost'] * 1,
                created_at: response['data'][x]['created_at'],
                updated_at: response['data'][x]['updated_at']
              }
              let iDBProduct = typeof products[response['data'][x]['id']] !== 'undefined' ? products[response['data'][x]['id']][0] : null
              if (iDBProduct && response['data'][x]['deleted_at']) {
                product.delete(iDBProduct.id).then(() => {
                  counter++
                })
              } else if (iDBProduct) {
                productData['id'] = iDBProduct['id']
                product.update(productData).then(() => {
                  counter++
                })
              } else if (!iDBProduct && !response['data'][x]['deleted_at']) {
                productToAdd.push(productData)
              }else{
                counter++
              }
            }
            if(productToAdd.length){
              product.add(productToAdd).then((result) => {
                if(result){
                  counter += productToAdd.length
                }
              })
            }
          })
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
        resolve(4)
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
}
