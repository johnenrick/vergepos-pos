import schemaV1 from './migration/v1'
// import Category from './controller/category.js'
import { connection } from './js_store/js-store-con'

class DBMigrate {
  schema = {
    name: null,
    tables: []
  }

  async migrate (isReadyCallback) {
    this.prepareSchema()
    let isDbCreated = await connection.initDb(this.schema)
    if(isDbCreated){
      console.info('DB Created or Updated', schemaV1, schemaV1.tables)
    }
    isReadyCallback(true)
  }
  prepareSchema(){
    this.schema['name'] = schemaV1['dbName']
    this.schema['version'] = schemaV1['version']
    for(let x = 0; x < schemaV1.tables.length; x++){
      this.schema.tables.push({
        name: schemaV1.tables[x]['name'],
        columns: this.initColumn(schemaV1.tables[x])
      })
    }
  }
  initColumn(table){
    table['columns']['id'] = { primaryKey: true, autoIncrement: true }
    if(typeof table['timestamp'] === 'undefined' || table['timestamp']){
      table['columns']['created_at'] = { notNull: false, dataType: 'number' }
      table['columns']['updated_at'] = { notNull: false, dataType: 'number' }
      table['columns']['deleted_at'] = { notNull: false, dataType: 'number' }
    }
    if(typeof table['columns']['db_id'] !== 'undefined'){
      table['columns']['db_id'] = { notNull: false, dataType: 'number', unique: true }
    }
    return table['columns']
  }
}
export default DBMigrate
