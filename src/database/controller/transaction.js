import Controller from '@/database/core/controller.js'
export default class Transaction extends Controller {
  constructor () {
    super()
    this.tableName = 'transactions'
  }
}
