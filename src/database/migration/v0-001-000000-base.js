import Migration from '../core/migration'

export default class BaseMigration extends Migration {
  constructor (version) {
    super(true)
    this.version = version
  }
  // run(){
  //   this.walk()
  // }
  async run () {
    return this.upgradeDB().then((db, upgradeDb) => {
      if (!db.objectStoreNames.contains('db_tables')) {
        let objectStore = db.createObjectStore('db_tables', { keyPath: 'table_name' })
        objectStore.createIndex('version', 'number')
      }
      // db.close()
    }).catch((event) => {

    })
  }
}
