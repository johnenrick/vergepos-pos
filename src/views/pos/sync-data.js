import APIRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import Category from '@/database/controller/category.js'
import Product from '@/database/controller/product.js'
import Discount from '@/database/controller/discount.js'

import DBMigrate from '@/database/migrate.js'

export default class SyncData {
  isSyncingDone = 0 // 3 is done
  resolve = null
  sync () {
    // TODO check latest db
    return this.getDatabase()
  }
  getDatabase () {
    localStorage.setItem('syncing_pos', true)

    return new Promise((resolve, reject) => {
      let migration = new DBMigrate()
      migration.migrate(() => {
        this.resolve = resolve
        this.getCategories()
        this.getProducts()
        this.getDiscounts()
      })
    })
  }
  syncDone () {
    ++this.isSyncingDone
    if (this.isSyncingDone === 3) {
      this.resolve('done')
    }
  }
  getCategories () {
    let latestDate = new Date(localStorage.getItem('latest_categories_datetime'))
    let param = {
      select: {
        0: 'description',
        1: 'updated_at',
        2: 'deleted_at'
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    let dateRequested = new Date()
    APIRequest.request('category/retrieve', param, (response) => {
      if (response['data']) {
        let category = new Category()
        for (let x in response['data']) {
          category.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              category.delete(result.id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result.id)
            } else if (result) {
              result.description = response['data'][x]['description']
              category.update('db_id', result)
            } else if (!result && !response['data'][x]['deleted_at']) {
              category.add({
                db_id: response['data'][x]['id'],
                description: response['data'][x]['description']
              })
            }
          })
        }
        localStorage.setItem('latest_categories_datetime', dateRequested)
      }
      this.syncDone()
    }, (errorResponse, status) => {
      console.log(errorResponse, status)
    })
  }
  getDiscounts () {
    let latestDate = new Date(localStorage.getItem('latest_discounts_datetime'))
    let param = {
      select: [
        'description',
        'type',
        'value',
        'is_vat_exempt',
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
    let dateRequested = new Date()
    APIRequest.request('discount/retrieve', param, (response) => {
      if (response['data']) {
        let discount = new Discount()
        for (let x in response['data']) {
          discount.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              discount.delete(result.id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result.id)
            } else if (result) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              result = { ...result, ...(response['data'][x]) }
              discount.update('db_id', result)
            } else if (!result && !response['data'][x]['deleted_at']) {
              response['data'][x]['db_id'] = response['data'][x]['id']
              delete response['data'][x]['id']
              discount.add(response['data'][x])
            }
          })
        }
        localStorage.setItem('latest_discounts_datetime', dateRequested)
      }
      this.syncDone()
    })
  }
  getProducts () {
    let latestDate = new Date(localStorage.getItem('latest_product_datetime'))
    console.log(latestDate)
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
    let dateRequested = new Date()
    APIRequest.request('product/retrieve', param, (response) => {
      if (response['data']) {
        let product = new Product()
        for (let x in response['data']) {
          product.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              product.delete(result.id)
            } else if (result && response['data'][x]['deleted_at']) {
              product.delete(result.id)
            } else if (result) {
              result.description = response['data'][x]['description']
              result.cost = response['data'][x]['cost']
              result.price = response['data'][x]['price']
              result.short_description = response['data'][x]['short_description']
              result.category_id = response['data'][x]['category_id']
              product.update('db_id', result)
            } else if (!result && !response['data'][x]['deleted_at']) {
              product.add({
                db_id: response['data'][x]['id'],
                description: response['data'][x]['description'],
                cost: response['data'][x]['cost'],
                price: response['data'][x]['price'],
                short_description: response['data'][x]['short_description'],
                category_id: response['data'][x]['category_id']
              })
            }
          })
        }
        localStorage.setItem('latest_product_datetime', dateRequested)
      }
      this.syncDone()
    })
  }
}
