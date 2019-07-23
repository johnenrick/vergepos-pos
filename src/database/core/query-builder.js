export default class QueryBuilder {
  tableName
  async add (data, childData) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let result = {}
        let tx = db.transaction(this.tableName, 'readwrite')
        var txStore = tx.objectStore(this.tableName).add(data)
        txStore.onsuccess = (event) => {
          result.id = event.target.result
          if (typeof childData !== 'undefined') { // create child

          } else {
            resolve(result)
          }
        }
        txStore.onerror = function (event) {
          console.error('Failed to add data in query builder', this.tableName, event)
          reject(false, event)
        }
      })
    })
  }
  async retrieve (condition) {
    let result
    if (typeof condition === 'number') { // get by id
      await this.getByID(condition).then((txResult) => {
        result = txResult
      }).catch((event) => { console.error('Failed to get by ID', this.tableName) })
    } else if (typeof condition === 'undefined' || condition === null) { // get all
      await this.getAll().then((txResult) => {
        result = txResult
      }).catch((event) => { console.error('Failed to get all', this.tableName) })
    } else {
      await this.getWithCondition(condition).then((txResult) => {
        result = txResult
      }).catch((event) => { console.error('Failed to get all', this.tableName) })
    }
    return result
  }
  getWithCondition (condition) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let tx = db.transaction(this.tableName, 'readonly')
        let store = tx.objectStore(this.tableName)
        let equalConditionValue = []
        let index = ''
        for (let column in condition) {
          index += (index.length ? ', ' : '') + column
          equalConditionValue.push(condition[column])
        }
        let indexedStore = store.index(index)
        let keyRange = IDBKeyRange.bound(equalConditionValue, equalConditionValue)

        let result = []
        indexedStore.openCursor(keyRange).onsuccess = (event) => {
          var cursor = event.target.result
          if (cursor) {
            result.push(cursor.value)
            cursor.continue()
          } else {
            resolve(result)
          }
        }
        store.onerror = (event) => {
          reject(event)
        }
      })
    })
  }
  getByIndex (index, value) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let tx = db.transaction(this.tableName, 'readonly')
        let store = tx.objectStore(this.tableName).index(index).get(value)
        store.onsuccess = (event) => {
          resolve(event.target.result)
        }
        store.onerror = (event) => {
          reject(event)
        }
      })
    })
  }
  getByID (id) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let tx = db.transaction(this.tableName, 'readonly')
        let store = tx.objectStore(this.tableName).get(id)
        store.onsuccess = (event) => {
          resolve(event.target.result)
        }
        store.onerror = (event) => {
          reject(event)
        }
      })
    })
  }
  getAll () {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let tx = db.transaction(this.tableName, 'readonly')
        let store = tx.objectStore(this.tableName).getAll()
        store.onsuccess = (event) => {
          resolve(event.target.result.length ? event.target.result : null)
        }
        store.onerror = (event) => {
          reject(event)
        }
      })
    })
  }
  with () {

  }
  async update (index, data) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let result = {}
        let tx = db.transaction(this.tableName, 'readwrite')
        var txStore = tx.objectStore(this.tableName).put(data)
        txStore.onsuccess = (event) => {
          result.id = event.target.result
          resolve(result)
        }
        txStore.onerror = function (event) {
          console.error('Failed to add data in query builder', this.tableName, event)
          reject(false, event)
        }
      })
    })
  }
  async delete (id) {
    return new Promise((resolve, reject) => {
      this.openDB().then((db) => {
        let result = {}
        let tx = db.transaction(this.tableName, 'readwrite')
        console.log('delete', id)
        var txStore = tx.objectStore(this.tableName).delete(id)
        txStore.onsuccess = (event) => {
          result.id = event.target.result
          resolve(result)
        }
        txStore.onerror = function (event) {
          console.error('Failed to add data in query builder', this.tableName, event)
          reject(false, event)
        }
      })
    })
  }
  openDB () {
    return new Promise((resolve, reject) => {
      let request = window.indexedDB.open('my-db')
      request.onerror = (event) => {
        console.error('Database Error, failed to open connection in query builder - openDB: ', event)
        reject(event)
      }
      request.onsuccess = (event) => {
        resolve(request.result)
      }
    })
  }
}
