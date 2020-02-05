import Controller from '@/database/core/controller.js'
export default class TransactionNumber extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_numbers'
  }
  add(entry){
    let controller = new Controller()
    controller.tableName = this.tableName
    return new Promise((resolve, reject) => {
      this.getLastNumber().then(latestNumber => {
        entry['number'] = latestNumber + 1
        controller.add(entry).then(result => {
          resolve(result)
        }).catch(errorResult => {
          reject(errorResult)
        })
      })
    })
  }
  getLastNumber(){
    let query = {
      limit: 1,
      order: {
        by: 'number',
        type: 'desc' // supprted sort type is - asc,desc
      }
    }
    return new Promise((resolve, reject) => {
      this.get(query).then(result => {
        let latestNumber = 0
        if(result.length && result[0]['number']){
          latestNumber = result[0]['number']
        }
        resolve(latestNumber)
      }).catch((errorResult) => {
        result(0)
      })
    })
  }
}
