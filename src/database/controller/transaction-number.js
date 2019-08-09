import Controller from '@/database/core/controller.js'
export default class TransactionNumber extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_numbers'
  }
}
