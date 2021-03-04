import Controller from '@/database/core/controller.js'
export default class workShiftCashReading extends Controller {
  constructor () {
    super()
    this.tableName = 'work_shift_cash_readings'
  }
  add(entry){
    let controller = new Controller()
    controller.tableName = this.tableName
    const bills = ['bill_1_cent', 'bill_5_cent', 'bill_10_cent', 'bill_25_cent', 'bill_1_peso', 'bill_5_peso', 'bill_10_peso', 'bill_20_peso', 'bill_50_peso', 'bill_100_peso', 'bill_200_peso', 'bill_500_peso', 'bill_1000_peso']
    bills.forEach(bill => {
      entry[bill] = typeof entry[bill] === 'undefined' ? 0 : entry[bill] * 1
    })
    entry['db_id'] = typeof entry['db_id'] === 'undefined' ? 0 : entry['db_id'] * 1
    return controller.add(entry)
  }
}
