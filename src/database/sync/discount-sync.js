import Sync from '../core/sync.js'
import Discount from '@/database/controller/discount.js'
let us = require('underscore')
export default class DiscountSync extends Sync{
  db = new Discount()
  async download(latestDate){
    let param = {
      select: [
        'description',
        'type',
        'value',
        'is_vat_exempt',
        'require_identification_card',
        'updated_at',
        'created_at',
        'deleted_at'
      ],
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
      this.retrieveAPIData('discount/retrieve', param).then(response => {
        this.saveLocalDB(response['data']).then(() => {
          resolve(5)
        })
      })
    })
  }
  async saveLocalDB(updatedDiscounts){
    if (updatedDiscounts && updatedDiscounts.length) {
      let toAddEntries = []
      let discount = new Discount()
      let idbParam = {
        where: {
          db_id: {
            in: us.pluck(updatedDiscounts, 'id')
          }
        }
      }
      let result = await discount.get(idbParam)
      let discounts = us.groupBy(result, 'db_id')
      for (let x in updatedDiscounts) {
        let discountData = {
          db_id: updatedDiscounts[x]['id'] * 1,
          description: updatedDiscounts[x]['description'],
          type: updatedDiscounts[x]['type'] * 1,
          value: updatedDiscounts[x]['value'] * 1,
          is_vat_exempt: updatedDiscounts[x]['is_vat_exempt'] * 1,
          require_identification_card: updatedDiscounts[x]['require_identification_card'] * 1,
          created_at: new Date(updatedDiscounts[x]['created_at']).getTime() + 28800000,
          updated_at: new Date(updatedDiscounts[x]['updated_at']).getTime() + 28800000
        }
        let iDBProduct = typeof discounts[updatedDiscounts[x]['id']] !== 'undefined' ? discounts[updatedDiscounts[x]['id']][0] : null
        if (updatedDiscounts[x]['deleted_at'] && iDBProduct) {
          await discount.delete(iDBProduct['id'])
        } else if (iDBProduct) {
          discountData['id'] = iDBProduct['id']
          await discount.update(discountData)
        } else if (!iDBProduct && !updatedDiscounts[x]['deleted_at']) {
          updatedDiscounts[x]['db_id'] = updatedDiscounts[x]['id']
          delete updatedDiscounts[x]['id']
          toAddEntries.push(discountData)
        }
      }
      if(toAddEntries.length){
        await discount.add(toAddEntries)
      }
    }
  }
}
