import UpSync from '../core/up-sync'
import TableController from '../controller/work-shift'
import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
import WorkShiftCashReadingUpSync from './work-shift-cash-readings-up-sync'
class WorkShiftUpSync extends UpSync{
  constructor () {
    super()
    this.tableController = new TableController()
  }
  onUpdateEntry(entry){
    if(entry['end_datetime']){
      entry['end_datetime'] = (new Date(entry['end_datetime'])).getTime() + 28800000
    }
    if(entry['created_at']){
      entry['created_at'] = (new Date(entry['created_at'])).getTime() + 28800000
    }
    if(entry['updated_at']){
      entry['updated_at'] = (new Date(entry['updated_at'])).getTime() + 28800000
    }
    if(entry['deleted_at']){
      entry['deleted_at'] = (new Date(entry['deleted_at'])).getTime() + 28800000
    }
    return entry
  }
  upload(){
    return new Promise((resolve, reject) => {
      const storeTerminal = localStorage.getItem('is_terminal')
      if(storeTerminal){
        const additionalParameter = {
          store_terminal_id: storeTerminal
        }
        this.upSync(this.processEntry, {}, additionalParameter).then(() => { // upSync parameters: (entryFunction, additionalIDBParameter = {}, additionalAPIParameter = {})
          // console.log('workshift-synced')
          WorkShiftCashReadingUpSync.upload().finally(() => {
            // console.log('workshift-cashreading-synced')
            resolve(true)
          })
        }).catch(error => {
          reject(error)
        })
      }else{
        reject('not_terminal')
      }
    })
  }
  processEntry(entry){
    if(typeof entry['closed_by_user_id'] !== 'undefined' && entry['closed_by_user_id'] === 0){
      entry['closed_by_user_id'] = null
    }
    entry['created_at'] = DatetimeHelper.serverDatetimeFormat(entry['created_at'], true) // second parameter means use server time
    entry['updated_at'] = DatetimeHelper.serverDatetimeFormat(entry['updated_at'], true) // second parameter means use server time
    entry['deleted_at'] = DatetimeHelper.serverDatetimeFormat(entry['deleted_at'], true) // second parameter means use server time
    entry['end_datetime'] = DatetimeHelper.serverDatetimeFormat(entry['end_datetime'], true) // second parameter means use server time
    return entry
  }
}
let upSync = new WorkShiftUpSync()
export default upSync
