import Sync from '../core/sync.js'
import Category from '@/database/controller/category.js'
import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class CategorySync extends Sync{
  async downSync(){
    let categoryDB = new Category()
    let query = {
      limit: 1,
      order: {
        by: 'updated_at',
        type: 'desc'
      }
    }
    return new Promise((resolve, reject) => {
      categoryDB.get(query).then(response => {
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
        3: 'created_at',
      },
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
      this.retrieveAPIData('category/retrieve', param).then(response => {
        console.log(param, response)
        if (response['data'].length) {
          let category = new Category()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            let idbParam = {
              where: {
                db_id: response['data'][x]['id'] * 1
              }
            }
            let categoryData = {
              db_id: response['data'][x]['id'] * 1,
              description: response['data'][x]['description'],
              created_at: response['data'][x]['created_at'],
              deleted_at: response['data'][x]['deleted_at'],
              updated_at: response['data'][x]['updated_at']
            }
            category.get(idbParam).then((result) => {
              // console.log(result, response['data'][x])
              if (result.length && response['data'][x]['deleted_at']) {
                console.log('deletskie')
                category.delete(result[0]['id']).finally(() => {
                  console.log('count')
                  counter++
                })
              } else if (result.length) {
                categoryData['id'] = result[0]['id']
                category.update(categoryData).finally(() => {
                  counter++
                })
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                category.add(categoryData).finally(() => {
                  counter++
                })
              }else{
                counter++
              }
            })
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              resolve(1)
              clearInterval(interval)
            }
          }, 100)
        }else{
          resolve(1)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(1)
      })
    })
  }
}
