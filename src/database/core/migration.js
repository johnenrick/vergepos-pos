import SchemaBuilder from './schema-builder'
import QuickHelper from '@/vue-web-core/helper/mixin/quick'
export default class DatabaseMigration {
  tableList = null
  isBaseMigration = false
  blueprint = {}
  version

  constructor (isBaseMigration) {
    this.isBaseMigration = isBaseMigration
  }

  getTableList () {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        if (this.tableList) {
          resolve(true)
        } else {
          let tx = db.transaction('db_tables', 'readonly')
          let store = tx.objectStore('db_tables').getAll()
          store.onsuccess = (event) => {
            this.tableList = event.target.result
            db.close()
            resolve(true)
          }
          store.onerror = (event) => {
            console.error('Cannot get table list', event)
            reject(event)
          }
        }
      })
    })
  }
  upgradeDB () {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open('my-db', this.version)
      request.onerror = (event) => {
        if (event.target.error.name === 'VersionError') {
          console.info('Nothing to migrate. The version is behind')
        } else {
          console.error('Database Error, failed to open connection in db migration - upgradeDB: ', event)
        }
        reject(event)
      }
      let upgraded = false
      request.onsuccess = (event) => {
        if (upgraded === false) {
          reject(event)
        }
      }
      request.onupgradeneeded = (upgradeDb) => {
        upgraded = true
        resolve(request.result, upgradeDb)
      }
    })
  }
  openDB () {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open('my-db')
      request.onerror = (event) => {
        console.error('Database Error, failed to open connection in db migration - openDB: ', event)
      }
      request.onsuccess = (event) => {
        resolve(request.result)
      }
    })
  }
  validateBlueprint () {
    return new Promise((resolve, reject) => {
      this.getTableList().then(() => {
        let blueprint = this.blueprint
        for (let schema in blueprint) {
          let hasTimestamp = QuickHelper.isset(blueprint[schema], 'timestamp')

          if (hasTimestamp) {
            blueprint[schema]['columns']['updated_datetime'] = {}
            blueprint[schema]['columns']['created_datetime'] = {}
          }
          QuickHelper.setDefault(blueprint[schema], 'operation', 'create')
        }
        this.blueprint = blueprint
        resolve(true)
      }).catch((error) => {
        console.error('Failed Get Table List')
        reject(error)
      })
    })
  }
  doMigrate (version) {
    return new Promise((resolve, reject) => {
      this.validateBlueprint().then(() => {
        this.upgradeDB().then((db, upgradeDB) => {
          let blueprint = this.blueprint
          for (let schema in blueprint) {
            if (blueprint[schema]['operation'] === 'create') {
              let schemaBuilder = new SchemaBuilder('create', schema, blueprint[schema]['columns'])
              schemaBuilder.create(db)
            }
          }
          resolve(true)
        }).catch((event) => {
          if(event.type === 'success'){
            resolve(null)
          }else{
            reject(event)
          }
        })
      }).catch((error) => {
        console.error('Failed validation in doMigrate', error)
      })
    })
  }
}
