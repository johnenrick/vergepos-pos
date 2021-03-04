import Controller from '@/database/core/controller.js'
import WorkShiftCashReading from './work-shift-cash-reading'
export default class WorkShift extends Controller {
  constructor () {
    super()
    this.tableName = 'work_shifts'
  }
  add(entry){
    return new Promise((resolve, reject) => {
      let controller = new Controller()
      controller.tableName = this.tableName
      const { work_shift_cash_readings: workShiftCashReadings = null } = entry
      delete entry['work_shift_cash_readings']
      controller.add(entry).then(result => {
        if(result && workShiftCashReadings){
          this.addWorkShiftCashReadings(result['id'], workShiftCashReadings).then(() => resolve(result))
        }else{
          resolve(result)
        }
      }).catch(error => {
        reject(error)
      })
    })
  }
  addWorkShiftCashReadings(workShiftId, workShiftCashReadings){
    return new Promise(resolve => {
      if(!Array.isArray(workShiftCashReadings)){
        workShiftCashReadings = [workShiftCashReadings]
      }
      const workShiftCashReadingDB = new WorkShiftCashReading()
      let doneCountDown = workShiftCashReadings.length
      workShiftCashReadings.forEach(workShiftCashReading => {
        let newData = {
          db_id: typeof workShiftCashReading['id'] !== 'undefined' && workShiftCashReading['id'] ? workShiftCashReading['id'] : 0,
          work_shift_id: workShiftId,
          type: workShiftCashReading['type'] * 1,
          approved_by_user_id: typeof workShiftCashReading['approved_by_user_id'] !== 'undefined' ? workShiftCashReading['approved_by_user_id'] : 0,
          bill_1_cent: typeof workShiftCashReading['bill_1_cent'] !== 'undefined' ? parseInt(workShiftCashReading['bill_1_cent']) : 0,
          bill_5_cent: typeof workShiftCashReading['bill_5_cent'] !== 'undefined' ? parseInt(workShiftCashReading['bill_5_cent']) : 0,
          bill_10_cent: typeof workShiftCashReading['bill_10_cent'] !== 'undefined' ? parseInt(workShiftCashReading['bill_10_cent']) : 0,
          bill_25_cent: typeof workShiftCashReading['bill_25_cent'] !== 'undefined' ? parseInt(workShiftCashReading['bill_25_cent']) : 0,
          bill_1_peso: typeof workShiftCashReading['bill_1_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_1_peso']) : 0,
          bill_5_peso: typeof workShiftCashReading['bill_5_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_5_peso']) : 0,
          bill_10_peso: typeof workShiftCashReading['bill_10_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_10_peso']) : 0,
          bill_20_peso: typeof workShiftCashReading['bill_20_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_20_peso']) : 0,
          bill_50_peso: typeof workShiftCashReading['bill_50_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_50_peso']) : 0,
          bill_100_peso: typeof workShiftCashReading['bill_100_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_100_peso']) : 0,
          bill_200_peso: typeof workShiftCashReading['bill_200_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_200_peso']) : 0,
          bill_500_peso: typeof workShiftCashReading['bill_500_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_500_peso']) : 0,
          bill_1000_peso: typeof workShiftCashReading['bill_1000_peso'] !== 'undefined' ? parseInt(workShiftCashReading['bill_1000_peso']) : 0,
          discrepancy: typeof workShiftCashReading['discrepancy'] !== 'undefined' ? parseFloat(workShiftCashReading['discrepancy']) : 0,
        }
        workShiftCashReadingDB.add(newData).finally(() => {
          --doneCountDown
          if(!doneCountDown){
            resolve(true)
          }
        })
      })
    })
  }
  closeShift(param){
    let controller = new Controller()
    controller.tableName = this.tableName
    return new Promise((resolve, reject) => {
      const { work_shift_cash_readings: workShiftCashReadings = {} } = param
      delete param['work_shift_cash_readings']
      controller.update(param).then(result => {
        this.addWorkShiftCashReadings(param['id'], workShiftCashReadings).then(() => resolve(result))
      }).catch(error => reject(error))
    })
  }
}
