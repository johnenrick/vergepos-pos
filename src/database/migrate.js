import BaseMigration from './migration/v0-001-000000-base'
import CreateCategory from './migration/v0-001-000001-create-category'
import CreateTransaction from './migration/v0-001-000002-create-transaction'
import Category from './controller/category.js'

class DBMigrate {
  db
  version = localStorage.getItem('version')
  constructor (isReadyCallback) {
    this.migrate(this.version, isReadyCallback)
  }

  async migrate (version, isReadyCallback) {
    await (new BaseMigration(1)).run()
    await (new CreateCategory(2)).run()
    await (new CreateTransaction(3)).run()
    isReadyCallback(true)
  }
}
export default DBMigrate
