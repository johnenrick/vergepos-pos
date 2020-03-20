import Sync from '../core/sync.js'
import TransactionNumber from '@/database/controller/transaction-number.js'
// import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class CategorySync extends Sync{
  resolveId = 6
  async downSync(){
    let idb = new TransactionNumber()
    let query = {
      limit: 1,
      order: {
        by: 'number',
        type: 'asc'
      }
    }
    return new Promise((resolve, reject) => {
      idb.get(query).then(response => {
        let oldestNumber = null
        if(response.length){
          oldestNumber = response[0]['number']
        }
        this.download(oldestNumber).then(result => {
          resolve(result)
        })
      })
    })
  }
  async download(oldestNumber){
    let param = {
      select: {
        0: 'number',
        1: 'operation',
        2: 'user_id',
        3: 'store_terminal_id',
        4: 'created_at',
        5: 'updated_at',
        6: 'deleted_at',
        transaction: {
          select: {
            0: 'transaction_number_id',
            1: 'customer_id',
            2: 'status',
            3: 'cash_tendered',
            4: 'cash_amount_paid',
            5: 'discount_remarks',
            transaction_products: {
              select: {
                0: 'transaction_id',
                1: 'product_id',
                2: 'quantity',
                3: 'vat_sales',
                4: 'vat_exempt_sales',
                5: 'vat_zero_rated_sales',
                6: 'vat_amount',
                7: 'discount_amount',
                8: 'created_at',
                9: 'updated_at',
                10: 'deleted_at',
              }
            }
          }
        }
      },
      condition: [],
      with_trash: true,
      sort: [{
        column: 'number',
        order: 'asc'
      }]
    }
    if(oldestNumber){
      param['condition'].push({
        column: 'number',
        clause: '<',
        value: oldestNumber
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('transaction-number/retrieve', param).then(response => {
        console.log(param, response)
        resolve(this.resolveId)
        return false
        // if (response['data'].length) {
        //   let category = new Category()
        //   let counter = 0
        //   let maxCount = response['data'].length
        //   for (let x in response['data']) {
        //     let idbParam = {
        //       where: {
        //         db_id: response['data'][x]['id'] * 1
        //       }
        //     }
        //     let categoryData = {
        //       db_id: response['data'][x]['id'] * 1,
        //       description: response['data'][x]['description'],
        //       created_at: response['data'][x]['created_at'],
        //       deleted_at: response['data'][x]['deleted_at'],
        //       updated_at: response['data'][x]['updated_at']
        //     }
        //     category.get(idbParam).then((result) => {
        //       // console.log(result, response['data'][x])
        //       if (result.length && response['data'][x]['deleted_at']) {
        //         console.log('deletskie')
        //         category.delete(result[0]['id']).finally(() => {
        //           console.log('count')
        //           counter++
        //         })
        //       } else if (result.length) {
        //         categoryData['id'] = result[0]['id']
        //         category.update(categoryData).finally(() => {
        //           counter++
        //         })
        //       } else if (!result.length && !response['data'][x]['deleted_at']) {
        //         category.add(categoryData).finally(() => {
        //           counter++
        //         })
        //       }else{
        //         counter++
        //       }
        //     })
        //   }
        //   let interval = setInterval(() => {
        //     if(counter === maxCount){
        //       resolve(this.resolveId)
        //       clearInterval(interval)
        //     }
        //   }, 100)
        // }else{
        //   resolve(this.resolveId)
        // }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(this.resolveId)
      })
    })
  }
}
