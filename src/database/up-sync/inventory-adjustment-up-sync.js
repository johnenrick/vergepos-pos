import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
import APIRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import InventoryAdjustment from '@/database/controller/inventory-adjustment'
import InventoryAdjustmentSync from '@/database/sync/inventory-adjustment-sync'
class InventoryAdjustmentUpSync {
  upload(){
    return new Promise((resolve, reject) => {
      this.retrieveUnsynchedInventoryAdjustment().then(unsynchedInventoryAdjustments => {
        if(unsynchedInventoryAdjustments.length){
          this.uploadInventoryAdjustment(unsynchedInventoryAdjustments).then(uploadResult => {
            resolve(1)
          }).catch(() => {
            resolve(1)
          })
        }else{
          resolve(1)
        }
      }).catch(() => {
        resolve(1)
      })
    })
  }
  retrieveUnsynchedInventoryAdjustment(){
    return new Promise((resolve, reject) => {
      const inventoryAdjustmentDB = new InventoryAdjustment()
      const param = {
        where: {
          db_id: 0
        },
        order: {
          by: 'created_at',
          type: 'asc'
        }
      }
      inventoryAdjustmentDB.get(param).then(result => {
        if(result.length){
          result.forEach((inventoryAdjustment, index) => {
            result[index]['created_at'] = DatetimeHelper.serverDatetimeFormat(inventoryAdjustment['created_at'], true) // second parameter means use server time
            result[index]['updated_at'] = DatetimeHelper.serverDatetimeFormat(inventoryAdjustment['updated_at'], true) // second parameter means use server time
            result[index]['deleted_at'] = DatetimeHelper.serverDatetimeFormat(inventoryAdjustment['deleted_at'], true) // second parameter means use server time
            delete result[index]['db_id']
          })
        }
        resolve(result)
      })
    })
  }
  uploadInventoryAdjustment(inventoryAdjustments){
    return new Promise(async(resolve, reject) => {
      const latestDatetimeUpdate = DatetimeHelper.serverDatetimeFormat(await this.getLatestSynchedDatetime(), true)
      const terminalDetails = JSON.parse(localStorage.getItem('terminal_details'))
      const param = {
        inventory_adjustments: inventoryAdjustments,
        store_id: terminalDetails['store_id'],
        last_datetime_update: latestDatetimeUpdate
      }
      APIRequest.request('inventory-adjustment/batch-create', param, (response) => {
        if(response['data']){
          if(response['data']['new_inventory_adjustment_ids'].length === inventoryAdjustments.length){
            const inventoryAdjustmentDBIds = response['data']['new_inventory_adjustment_ids']
            const inventoryAdjustmentDB = new InventoryAdjustment()
            let remainingInventoryAdjustment = inventoryAdjustmentDBIds.length
            inventoryAdjustments.forEach((inventoryAdjustment, index) => {
              inventoryAdjustments[index]['db_id'] = inventoryAdjustmentDBIds[index]
              const newInventoryAdjustmentData = {
                id: inventoryAdjustment['id'],
                db_id: inventoryAdjustments[index]['db_id']
              }
              inventoryAdjustmentDB.update(newInventoryAdjustmentData).then((result) => {
                --remainingInventoryAdjustment
                if(remainingInventoryAdjustment === 0){
                  resolve(inventoryAdjustments)
                }
              }).catch(() => {
                --remainingInventoryAdjustment
                if(remainingInventoryAdjustment === 0){
                  resolve(inventoryAdjustments)
                }
              })
            })
          }
          console.log('updated_inventory_adjustments', latestDatetimeUpdate, response['data']['updated_inventory_adjustments'])
          if(response['data']['updated_inventory_adjustments'].length){
            let inventoryAdjustmentSync = new InventoryAdjustmentSync()
            inventoryAdjustmentSync.updateInventoryAdjustments(response['data']['updated_inventory_adjustments'])
          }
        }else{
          resolve(true)
        }
      }, () => {
        reject(false)
      })
    })
  }
  updateInventoryAdjustments(updatedInventoryAdjustments, newIds){

  }
  async getLatestSynchedDatetime(){
    return new Promise((resolve, reject) => {
      const inventoryAdjustmentDB = new InventoryAdjustment()
      const param = {
        where: {
          db_id: {
            '>': 0
          }
        },
        limit: 1,
        order: {
          by: 'updated_at',
          type: 'desc'
        }
      }
      inventoryAdjustmentDB.get(param).then(result => {
        if(result.length){
          resolve(new Date(result[0]['updated_at']))
        }else{
          resolve(new Date('2000'))
        }
      })
    })
  }
}
let inventoryAdjustmentUpSync = new InventoryAdjustmentUpSync()
export default inventoryAdjustmentUpSync
