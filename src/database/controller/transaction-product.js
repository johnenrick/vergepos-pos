import Controller from '@/database/core/controller.js'
import TransactionAdjustment from './inventory-adjustment.js'
export default class TransactionProduct extends Controller {
  constructor () {
    super()
    this.tableName = 'transaction_products'
  }
  add(entry, { transaction_number: transactionNumber = null, trace_inventory: traceInventory = false }){
    let controller = new Controller()
    controller.tableName = this.tableName
    return new Promise((resolve, reject) => {
      controller.add(entry).then(result => {
        if(result && typeof traceInventory !== 'undefined' && traceInventory){
          this.addInventoryAdjustment(entry['product_id'], entry['quantity'], transactionNumber)
        }
        resolve(result)
      }).catch(failedResult => {
        reject(failedResult)
      })
    })
  }
  addInventoryAdjustment(productId, quantity, transactionNumber){
    const terminalDetails = JSON.parse(localStorage.getItem('terminal_details'))
    const transactionAdjustmentDB = new TransactionAdjustment()
    const data = {
      product_id: productId,
      type: 3,
      quantity: quantity,
      remarks: JSON.stringify({
        store_id: terminalDetails['store_id'],
        store_terminal_id: localStorage.getItem('is_terminal'),
        transaction_number: transactionNumber
      })
    }
    transactionAdjustmentDB.add(data)
  }
}
