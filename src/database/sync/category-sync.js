import Sync from '../core/sync.js'
import Category from '@/database/controller/category.js'
export default class CategorySync extends Sync{
  async downSync(){
    let latestDate = new Date(localStorage.getItem('latest_categories_datetime'))
    let param = {
      select: {
        0: 'description',
        1: 'updated_at',
        2: 'deleted_at',
        3: 'created_at',
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('category/retrieve', param).then(response => {
        if (response['data']) {
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
            }
            category.get(idbParam).then((result) => {
              if (response['data'][x]['deleted_at'] && result.length) {
                category.delete(result[0]['id'] * 1).then(() => {
                  counter++
                })
              } else if (result.length && response['data'][x]['deleted_at']) {
                category.delete(result[0]['id'] * 1).then(() => {
                  counter++
                })
              } else if (result.length) {
                categoryData['id'] = result[0]['id']
                category.update(categoryData).then(() => {
                  counter++
                })
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                console.log('Adding Product to iDB', result, response['data'][x]['id'])
                category.add(categoryData).then(() => {
                  counter++
                })
              }
            })
            // localStorage.setItem('latest_categories_datetime', new Date(response['data'][x]['updated_at']))
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
        reject(error)
      })
    })
  }
}
