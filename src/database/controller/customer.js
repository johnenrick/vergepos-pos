import Controller from '@/database/core/controller.js'
export default class Customer extends Controller {
  constructor () {
    super()
    this.tableName = 'customers'
  }
}
