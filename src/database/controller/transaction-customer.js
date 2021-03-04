import Controller from '@/database/core/controller.js'
export default class TransactionCustomer extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_customers'
  }
}
