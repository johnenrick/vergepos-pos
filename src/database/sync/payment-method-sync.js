import Sync from '../core/sync.js'
import PaymentMethod from '@/database/controller/payment-method.js'
let us = require('underscore')
export default class PaymentMethodSync extends Sync{
  db = new PaymentMethod()
  async download(latestDate){
    let param = {
      select: [
        'description',
        'updated_at',
        'created_at',
        'deleted_at'
      ],
      condition: [],
      with_trash: true
    }
    if(latestDate){
      param['condition'].push({
        column: 'updated_at',
        clause: '>',
        value: latestDate
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('payment-method/retrieve', param).then(response => {
        this.saveLocalDB(response['data']).then(() => {
          resolve(3)
        })
      }).catch((error, status) => {
        resolve(3)
        console.log('failed to sync', error, status)
        return error
      })
    })
  }
  async saveLocalDB(updatedPaymentMethods){
    if (updatedPaymentMethods && updatedPaymentMethods.length) {
      let toAddEntries = []
      let paymentMethod = new PaymentMethod()
      let idbParam = {
        where: {
          db_id: {
            in: us.pluck(updatedPaymentMethods, 'id')
          }
        }
      }
      let result = await paymentMethod.get(idbParam)
      let paymentMethods = us.groupBy(result, 'db_id')
      for (let x in updatedPaymentMethods) {
        let paymentMethodData = {
          db_id: updatedPaymentMethods[x]['id'] * 1,
          description: updatedPaymentMethods[x]['description'],
          created_at: new Date(updatedPaymentMethods[x]['created_at']).getTime() + 28800000,
          updated_at: new Date(updatedPaymentMethods[x]['updated_at']).getTime() + 28800000
        }
        let iDBPaymentMethod = typeof paymentMethods[updatedPaymentMethods[x]['id']] !== 'undefined' ? paymentMethods[updatedPaymentMethods[x]['id']][0] : null
        if (updatedPaymentMethods[x]['deleted_at'] && iDBPaymentMethod) {
          await paymentMethod.delete(iDBPaymentMethod['id'])
        } else if (iDBPaymentMethod) {
          paymentMethodData['id'] = iDBPaymentMethod['id']
          await paymentMethod.update(paymentMethodData)
        } else if (!iDBPaymentMethod && !updatedPaymentMethods[x]['deleted_at']) {
          updatedPaymentMethods[x]['db_id'] = updatedPaymentMethods[x]['id']
          delete updatedPaymentMethods[x]['id']
          toAddEntries.push(paymentMethodData)
        }
      }
      if(toAddEntries.length){
        await paymentMethod.add(toAddEntries)
      }
    }
    return true
  }
}
