import QueryBuilder from '@/database/core/query-builder.js'
export default class Discount extends QueryBuilder {
  constructor () {
    super()
    this.tableName = 'discounts'
  }
}
