import QueryBuilder from '@/database/core/query-builder.js'
export default class Product extends QueryBuilder {
  constructor () {
    super()
    this.tableName = 'products'
  }
}
