import Controller from '@/database/core/controller.js'
export default class TransactionProduct extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_products'
  }
}
