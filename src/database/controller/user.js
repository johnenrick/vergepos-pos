import Controller from '@/database/core/controller.js'
export default class User extends Controller {
  constructor () {
    super()
    this.tableName = 'users'
  }
}
