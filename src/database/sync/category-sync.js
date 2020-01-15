import Sync from '../core/sync.js'
import Category from '@/database/controller/category.js'
export default class CategorySync extends Sync{
  async downSync(){
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
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('category/retrieve', param).then(response => {
        if (response['data']) {
          let category = new Category()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            category.getByIndex('db_id', response['data'][x]['id']).then((result) => {
              if (response['data'][x]['deleted_at'] && result) {
                category.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result && response['data'][x]['deleted_at']) {
                category.delete(result[0].id).then(result => {
                  counter++
                })
              } else if (result) {
                result[0].description = response['data'][x]['description']
                category.update(result[0]).then(result => {
                  counter++
                })
              } else if (!result && !response['data'][x]['deleted_at']) {
                category.add({
                  db_id: response['data'][x]['id'],
                  description: response['data'][x]['description']
                }).then(result => {
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
