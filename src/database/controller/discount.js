import Controller from '@/database/core/controller.js'
export default class Discount extends Controller {
  constructor () {
    super()
    this.tableName = 'discounts'
  }
}
