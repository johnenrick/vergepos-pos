import Sync from '../core/sync.js'
import Category from '@/database/controller/category.js'
let us = require('underscore')
export default class CategorySync extends Sync{
  db = new Category()
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
        this.saveLocalDB(response['data']).then(() => {
          resolve(1)
        })
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(1)
      })
    })
  }
  async saveLocalDB(updatedCategories){
    if(updatedCategories && updatedCategories.length){
      let toAddEntries = []
      let category = this.db
      let idbParam = {
        where: {
          db_id: {
            in: us.pluck(updatedCategories, 'id')
          }
        }
      }
      let result = await category.get(idbParam)
      let categories = us.groupBy(result, 'db_id') // group by db_id, expect the result of each object is a select element array
      for (let x in updatedCategories) {
        let categoryData = {
          db_id: updatedCategories[x]['id'] * 1,
          description: updatedCategories[x]['description'],
          created_at: new Date(updatedCategories[x]['created_at']).getTime() + 28800000,
          updated_at: new Date(updatedCategories[x]['updated_at']).getTime() + 28800000
        }
        let iDBCategory = typeof categories[updatedCategories[x]['id']] !== 'undefined' ? categories[updatedCategories[x]['id']][0] : null
        if (iDBCategory && updatedCategories[x]['deleted_at']) {
          await category.delete(iDBCategory['id'])
        } else if (iDBCategory) {
          categoryData['id'] = iDBCategory['id']
          await category.update(categoryData)
        } else if (!iDBCategory && !updatedCategories[x]['deleted_at']) {
          toAddEntries.push(categoryData)
        }
      }
      if(toAddEntries.length){
        await category.add(toAddEntries)
      }
    }
    return true
  }
}
