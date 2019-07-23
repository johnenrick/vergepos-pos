// import Helper from './helper'
export default class SchemaBuilder {
  action
  tableName
  columns
  constructor (action, tableName, columns) {
    this.action = action
    this.tableName = tableName
    this.columns = columns
  }
  create (db) {
    let objectStore = db.createObjectStore(this.tableName, { keyPath: 'id', autoIncrement: true })
    for (let column in this.columns) {
      // if(Helper.hasForeignKey(column, schemaBlueprint)){
      objectStore.createIndex(column, column, this.columns[column])
      // }
    }
  }
}
