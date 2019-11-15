import Sync from '../core/sync.js'
import Category from '@/database/controller/category.js'
export default class CategorySync extends Sync{
  downSync(){
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
    return this.retrieveAPIData('category/retrieve', param).then(response => {
      if (response['data']) {
        let category = new Category()
        for (let x in response['data']) {
          category.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              category.delete(result[0].id)
            } else if (result && response['data'][x]['deleted_at']) {
              category.delete(result[0].id)
            } else if (result) {
              result[0].description = response['data'][x]['description']
              category.update(result[0])
            } else if (!result && !response['data'][x]['deleted_at']) {
              category.add({
                db_id: response['data'][x]['id'],
                description: response['data'][x]['description']
              })
            }
          })
          // localStorage.setItem('latest_categories_datetime', new Date(response['data'][x]['updated_at']))
        }
      }
      return true
    }).catch((error, status) => {
      console.log('failed to sync', error, status)
      return error
    })
  }
}
