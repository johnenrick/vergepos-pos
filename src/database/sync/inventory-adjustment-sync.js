import Sync from '../core/sync.js'
import InventoryAdjustment from '@/database/controller/inventory-adjustment.js'
import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
let us = require('underscore')
export default class InventoryAdjustmentSync extends Sync{
  async downSync(){
    let inventoryAdjustmentDB = new InventoryAdjustment()
    let query = {
      limit: 1,
      where: {
        db_id: {
          '>': 0
        }
      },
      order: {
        by: 'updated_at',
        type: 'desc'
      }
    }
    return new Promise((resolve, reject) => {
      inventoryAdjustmentDB.get(query).then(response => {
        let latestDate = null
        if(response.length){
          latestDate = DatetimeHelper.serverDatetimeFormat(response[0]['updated_at'], true)
        }
        this.download(latestDate).then(result => {
          resolve(result)
        })
      })
    })
  }
  async download(latestDate){
    const terminalDetails = JSON.parse(localStorage.getItem('terminal_details'))
    let param = {
      select: {
        0: 'product_id',
        1: 'user_id',
        2: 'type',
        3: 'quantity',
        4: 'previous_quantity',
        5: 'updated_at',
        6: 'deleted_at',
        7: 'created_at',
        8: 'remarks',
      },
      condition: [{
        column: 'store_id',
        value: terminalDetails['store_id']
      }],
      with_trash: true
    }
    if(latestDate){
      param['condition'].push({
        column: 'updated_at',
        clause: '>',
        value: latestDate // already a server time
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('inventory-adjustment/retrieve', param).then(response => {
        if (response['data'].length) {
          this.updateInventoryAdjustments(response['data']).finally(() => {
            resolve(1)
          })
        }else{
          resolve(1)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(1)
      })
    })
  }
  async updateInventoryAdjustments(updatedInventoryAdjustments){
    if(!updatedInventoryAdjustments.length){
      return 1
    }
    let inventoryAdjustmentDB = new InventoryAdjustment()
    let toAddEntries = []
    let idbParam = {
      where: {
        db_id: {
          in: us.pluck(updatedInventoryAdjustments, 'id')
        }
      }
    }
    let result = await inventoryAdjustmentDB.get(idbParam)
    let inventoryAdjustments = us.groupBy(result, 'db_id') // group by db_id, expect the result of each object is a select element array
    for (let x in updatedInventoryAdjustments) {
      let inventoryAdjustmentData = {
        db_id: updatedInventoryAdjustments[x]['id'] * 1,
        product_id: updatedInventoryAdjustments[x]['product_id'] * 1,
        user_id: updatedInventoryAdjustments[x]['user_id'] * 1,
        type: updatedInventoryAdjustments[x]['type'] * 1,
        remarks: updatedInventoryAdjustments[x]['remarks'],
        quantity: updatedInventoryAdjustments[x]['quantity'] * 1,
        previous_quantity: updatedInventoryAdjustments[x]['previous_quantity'] * 1,
        created_at: (new Date(updatedInventoryAdjustments[x]['created_at'])).getTime() + 28800000, // +8 hours
        deleted_at: updatedInventoryAdjustments[x]['deleted_at'] ? (new Date(updatedInventoryAdjustments[x]['deleted_at'])).getTime() + 28800000 : 0, // +8 hours
        updated_at: (new Date(updatedInventoryAdjustments[x]['updated_at'])).getTime() + 28800000, // +8 hours
      }
      let iDBInventoryAdjustment = typeof inventoryAdjustments[updatedInventoryAdjustments[x]['id']] !== 'undefined' ? inventoryAdjustments[updatedInventoryAdjustments[x]['id']][0] : null
      if (iDBInventoryAdjustment && updatedInventoryAdjustments[x]['deleted_at']) {
        await inventoryAdjustmentDB.delete(iDBInventoryAdjustment['id'])
      } else if (iDBInventoryAdjustment) {
        inventoryAdjustmentData['id'] = iDBInventoryAdjustment['id']
        await inventoryAdjustmentDB.update(inventoryAdjustmentData)
      } else if (!iDBInventoryAdjustment && !updatedInventoryAdjustments[x]['deleted_at']) {
        toAddEntries.push(inventoryAdjustmentData)
      }
    }
    if(toAddEntries.length){
      await inventoryAdjustmentDB.addExisting(toAddEntries)
    }
    return 1
  }
}
