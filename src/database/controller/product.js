import Controller from '@/database/core/controller.js'
export default class Product extends Controller {
  constructor () {
    super()
    this.tableName = 'products'
  }
}
