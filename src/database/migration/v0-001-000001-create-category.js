import Migration from '../core/migration'

export default class CreateCategory extends Migration {
  constructor (version) {
    super()
    this.version = version
  }
  async run () {
    this.blueprint = {
      sync: {
        columns: {
          table: {}
        },
        timestamp: true
      },
      categories: {
        timestamp: true,
        columns: {
          db_id: {},
          description: {},
          parent_category: {}
        }
      },
      products: {
        timestamp: true,
        columns: {
          db_id: {},
          category_id: {},
          description: {},
          price: {},
          cost: {}
        }
      }
    }
    return this.doMigrate().catch((error) => {
      console.error('Error in Create Categor Migration', error)
    })
  }
}
