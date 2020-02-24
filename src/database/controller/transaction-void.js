import Controller from '@/database/core/controller.js'
export default class TransactionVoid extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_voids'
  }
}
