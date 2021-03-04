// import Migrate from '@/database/migrate'
import CategorySync from './category-sync'
import TransactionSync from './transaction-sync'
import ProductSync from './product-sync'
import DiscountSync from './discount-sync'
import PaymentMethodSync from './payment-method-sync'
import CustomerSync from './customer-sync'
import InventoryAdjustmentSync from './inventory-adjustment-sync'
import WorkShiftSync from './work-shift-sync'
import BatchSync1 from './batch-sync-1'
import UserSync from './user-sync'
import SyncStore from './sync-store'
class SyncAll {
  transactionSync
  categorySync
  productSync
  discountSync
  paymentMethodSync
  inventoryAdjustmentSync
  workShiftSync
  userSync
  batchSync1
  syncItems
  syncSuccessCount
  syncFailCount
  progressListener // needs to be changed to a list
  reSync = false
  onSyncListeners = {}
  isSynching = false // set try while synching including resync
  hasSynched = false // true if it has synched at least once
  constructor(){
    this.transactionSync = new TransactionSync()
    this.categorySync = new CategorySync()
    this.productSync = new ProductSync()
    this.discountSync = new DiscountSync()
    this.paymentMethodSync = new PaymentMethodSync()
    this.customerSync = new CustomerSync()
    this.userSync = new UserSync()
    this.inventoryAdjustmentSync = new InventoryAdjustmentSync()
    this.workShiftSync = new WorkShiftSync()
    this.batchSync1 = new BatchSync1()
  }
  addListener(page, listener){
    this.onSyncListeners[page] = listener
    if(this.hasSynched && !this.isSynching){
      this.onSyncListeners[page]()
    }
  }
  downSync(progressListener){
    this.isSynching = true
    if(SyncStore.getters.isSynching){
      this.reSync = true
    }
    SyncStore.commit('isSynching')
    if(typeof progressListener === 'function'){
      this.progressListener = progressListener
    }
    this.syncSuccess = 0
    this.syncFail = 0
    this.syncItems = [this.batchSync1, this.customerSync, this.transactionSync, this.inventoryAdjustmentSync, this.workShiftSync]
    if(localStorage.getItem('is_terminal') * 1){
      this.syncItems.push(this.userSync)
    }
    let syncItems = this.syncItems
    for(let x = 0; x < syncItems.length; x++){
      setTimeout(() => {
        syncItems[x].downSync().then((result) => {
          this.itemSynched(true)
        }).catch(error => {
          console.error(error)
          this.itemSynched(false)
        })
      }, 500 + (100 * x))
    }
  }
  itemSynched(status){
    if(status){
      this.syncSuccess++
    }else{
      this.syncFail++
    }
    let progress = (this.syncSuccess + this.syncFail) / this.syncItems.length
    if(progress >= 1){
      if(this.reSync){
        this.reSync = false
      }else{
        this.isSynching = false
        this.hasSynched = true
        for(let x in this.onSyncListeners){
          if(typeof this.onSyncListeners[x] === 'function'){
            this.onSyncListeners[x]()
          }
        }
        this.downSync(this.progressListener)
      }
      SyncStore.commit('isNotSynching')
    }
    if(typeof this.progressListener === 'function' && this.reSync === false){
      this.progressListener(progress)
    }
  }
}

export default new SyncAll()
