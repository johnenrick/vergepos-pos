import Sync from '../core/sync.js'
import Product from '@/database/controller/product.js'
let us = require('underscore')
export default class ProductSync extends Sync{
  db = new Product()
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
        8: 'created_at',
        9: 'is_sellable',
        10: 'has_inventory'
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
        this.saveLocalDB(response['data']).then(() => {
          resolve(4)
        })
      }).catch((error, status) => {
        resolve(4)
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
  async saveLocalDB(updatedProducts){
    if (updatedProducts && updatedProducts.length) {
      let toAddEntries = []
      let product = new Product()
      let idbParam = {
        where: {
          db_id: {
            in: us.pluck(updatedProducts, 'id')
          }
        }
      }
      let result = await product.get(idbParam)
      let products = us.groupBy(result, 'db_id')
      for (let x in updatedProducts) {
        // these are the entries that will be added in bulk in the idb
        let productData = {
          db_id: updatedProducts[x]['id'] * 1,
          description: updatedProducts[x]['description'],
          barcode: updatedProducts[x]['barcode'],
          category_id: updatedProducts[x]['category_id'] * 1,
          price: updatedProducts[x]['price'] * 1,
          cost: updatedProducts[x]['cost'] * 1,
          is_sellable: updatedProducts[x]['is_sellable'] * 1,
          has_inventory: updatedProducts[x]['has_inventory'] * 1,
          created_at: new Date(updatedProducts[x]['created_at']).getTime() + 28800000,
          updated_at: new Date(updatedProducts[x]['updated_at']).getTime() + 28800000
        }
        let iDBProduct = typeof products[updatedProducts[x]['id']] !== 'undefined' ? products[updatedProducts[x]['id']][0] : null
        if (iDBProduct && updatedProducts[x]['deleted_at']) {
          await product.delete(iDBProduct['id'])
        } else if (iDBProduct) {
          productData['id'] = iDBProduct['id']
          await product.update(productData)
        } else if (!iDBProduct && !updatedProducts[x]['deleted_at']) {
          toAddEntries.push(productData)
        }
      }
      if(toAddEntries.length){
        await product.add(toAddEntries)
      }
    }
    return true
  }
}
