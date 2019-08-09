import Controller from '@/database/core/controller.js'
export default class Category extends Controller {
  constructor () {
    super()
    this.tableName = 'categories'
  }
}
