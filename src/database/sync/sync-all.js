// import Migrate from '@/database/migrate'
import CategorySync from './category-sync'
import TransactionSync from './transaction-sync'
import ProductSync from './product-sync'
import DiscountSync from './discount-sync'
import CustomerSync from './customer-sync'
import UserSync from './user-sync'
import SyncStore from './sync-store'
class SyncAll {
  transactionSync
  categorySync
  productSync
  discountSync
  userSync
  syncItems
  syncSuccessCount
  syncFailCount
  progressListener // needs to be changed to a list
  reSync = false
  constructor(){
    this.transactionSync = new TransactionSync()
    this.categorySync = new CategorySync()
    this.productSync = new ProductSync()
    this.discountSync = new DiscountSync()
    this.customerSync = new CustomerSync()
    this.userSync = new UserSync()
  }
  downSync(progressListener){
    if(SyncStore.getters.isSynching){
      this.reSync = true
    }
    SyncStore.commit('isSynching')
    if(typeof progressListener === 'function'){
      this.progressListener = progressListener
    }
    this.syncSuccess = 0
    this.syncFail = 0
    this.syncItems = [this.categorySync, this.productSync, this.discountSync, this.customerSync, this.transactionSync]
    if(localStorage.getItem('is_terminal') * 1){
      this.syncItems.push(this.userSync)
    }
    let syncItems = this.syncItems
    for(let x = 0; x < syncItems.length; x++){
      syncItems[x].downSync().then((result) => {
        this.itemSynched(true)
      }).catch(error => {
        console.error(error)
        this.itemSynched(false)
      })
    }
  }
  itemSynched(status){
    if(status){
      this.syncSuccess++
    }else{
      this.syncFail++
    }
    let progress = (this.syncSuccess + this.syncFail) / this.syncItems.length
    if(progress === 1){
      if(this.reSync){
        this.reSync = false
      }else{
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
