import Migration from '../core/migration'

export default class CreateTransaction extends Migration {
  constructor (version) {
    super()
    this.version = version
  }
  async run () {
    this.blueprint = {
      discounts: {
        columns: {
          db_id: {},
          description: {},
          type: {}, // 1 - percentage on receipt, 2 - percentage on items,  3 - exact value on receipt, 4 - exact value on  items1 - percentage on receipt, 2 - exact value on receipt, 3 percentage on items, 4 - exact value on  items
          value: {},
          is_vat_exempt: {}
        }
      },
      transaction_number: {
        timestamp: true,
        columns: {
          db_id: {},
          transaction_id: {},
          operation: {} // 1 - transaction, 2 void, 3 - reprint
        }
      },
      transactions: {
        timestamp: true,
        columns: {
          db_id: {},
          transaction_number: {},
          customer_name: {},
          cash_tendered: {},
          discount_id: {},
          discount_amount: {},
          net_amount: {}
        }
      }
    }
    return this.doMigrate().catch((error) => {
      console.log('error in migration', error)
    })
  }
}
