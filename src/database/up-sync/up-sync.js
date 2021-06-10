import TransactionNumberUpSync from './transaction-number-up-sync'
import CustomerUpSync from './customer-up-sync'
import WorkShiftUpSync from './work-shift-up-sync'
import InventoryAdjustmentUpSync from './inventory-adjustment-up-sync'
import UserSession from '@/vue-web-core/system/store'
class UpSync {
  isSynchingSilently = false
  isSyncing = null
  silentSyncTimeoutId = 0
  silentSyncFrequency = 20000 // 20000
  silentSync(){
    this.isSynchingSilently = true
    this.sync().finally(() => {
      this.silentSyncTimeoutId = setTimeout(() => {
        this.silentSync()
      }, this.silentSyncFrequency)
    })
  }
  sync(){
    if(this.isSyncing){
      return this.isSyncing
    }
    this.isSyncing = new Promise((resolve, reject) => {
      if(localStorage.getItem('is_terminal') === null || !localStorage.getItem('is_terminal')){
        reject('not_terminal')
      }else if(UserSession.getters.mode === 'online'){
        clearTimeout(this.silentSyncTimeoutId)
        this.upload().then((result) => {
          resolve(result)
        }).catch((error) => {
          reject(error)
        })
      }else{
        resolve(false)
      }
    })
    this.isSyncing.finally(() => {
      this.isSyncing = null
    })
    return this.isSyncing
  }
  upload(){
    return new Promise((resolve, reject) => {
      CustomerUpSync.upload().finally(() => {
        TransactionNumberUpSync.upload().then(result => {
          resolve(result)
        }).catch(result => {
          reject(result)
        }).finally(() => {
          console.log('InventoryAdjustmentUpSync')
          InventoryAdjustmentUpSync.upload().finally(InventoryAdjustmentResult => {
            WorkShiftUpSync.upload()
          })
        })
      })
    })
  }
}
let upSync = new UpSync()
export default upSync
