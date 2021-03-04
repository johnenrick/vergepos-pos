import Controller from '@/database/core/controller.js'
import UserSession from '@/vue-web-core/system/store'
export default class InventoryAdjustment extends Controller {
  constructor () {
    super()
    this.tableName = 'inventory_adjustments'
  }
  add(entry){
    let controller = new Controller()
    controller.tableName = this.tableName
    if(typeof entry['previous_quantity'] !== 'undefined' && typeof entry['user_id'] !== 'undefined'){
      return controller.add(entry)
    }
    return new Promise((resolve, reject) => {
      const getLatestProductAdjustmentQuery = {
        where: {
          product_id: entry['product_id']
        },
        order: {
          by: 'created_at',
          type: 'desc'
        },
        limit: 1
      }
      controller.get(getLatestProductAdjustmentQuery).then(result => {
        let currentQuantity = 0
        if(result.length){
          let quantity = result[0]['quantity'] * (result[0]['type'] === 1 ? 1 : -1)
          currentQuantity = (result[0]['previous_quantity'] * 1) + quantity
        }
        entry['previous_quantity'] = currentQuantity
        entry['user_id'] = UserSession.getters.userId * 1
        entry['db_id'] = 0
        controller.add(entry).then(addResult => {
          resolve(addResult)
        }).catch(addResultFail => {
          reject(addResultFail)
        })
      })
    })
  }
}
