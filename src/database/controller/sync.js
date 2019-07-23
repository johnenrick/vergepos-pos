import QueryBuilder from '@/database/core/query-builder.js'
export default class Sync extends QueryBuilder {
  constructor () {
    super()
    this.tableName = 'sync'
  }
}
