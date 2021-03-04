import Controller from '@/database/core/controller.js'
export default class PaymentMethod extends Controller {
  constructor () {
    super()
    this.tableName = 'payment_methods'
  }
}
