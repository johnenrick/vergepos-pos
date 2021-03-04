import Sync from '../core/sync.js'
import CategorySync from './category-sync'
import ProductSync from './product-sync'
import DiscountySync from './discount-sync'
import PaymentMethodSync from './payment-method-sync'
export default class BatchSync1 extends Sync {
  categorySync = new CategorySync()
  productSync = new ProductSync()
  discountSync = new DiscountySync()
  paymentMethodSync = new PaymentMethodSync()
  async downSync(){
    const param = {
      category_latest_datetime: await this.categorySync.getLatestDatetime(),
      product_latest_datetime: await this.productSync.getLatestDatetime(),
      discount_latest_datetime: await this.discountSync.getLatestDatetime(),
      payment_method_latest_datetime: await this.paymentMethodSync.getLatestDatetime(),
    }
    console.log('downSync param', param)
    let result = await this.retrieveAPIData('sync/sync', param)
    if(result['data']){
      await this.saveLocalDB(result['data'])
    }
  }
  async saveLocalDB(newData){
    console.log('saveLocalDB', newData)
    await this.categorySync.saveLocalDB(newData['categories'])
    await this.productSync.saveLocalDB(newData['products'])
    await this.discountSync.saveLocalDB(newData['discounts'])
    await this.paymentMethodSync.saveLocalDB(newData['payment_methods'])
    return true
  }
}
