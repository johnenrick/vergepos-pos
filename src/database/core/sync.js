import apiRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import userStore from '@/vue-web-core/system/store'
import datetimeHelper from '@/vue-web-core/helper/mixin/datetime'
export default class Sync {
  db
  async downSync(){
    let latestDate = await this.getLatestDatetime()
    return new Promise((resolve) => {
      this.download(latestDate).then(result => {
        resolve(result)
      })
    })
  }
  retrieveAPIData(link, param, workOffline = false){
    return new Promise((resolve, reject) => {
      if(userStore.getters.mode === 'online' || (userStore.getters.mode === 'offline' && workOffline === true)){
        apiRequest.request(link, param, response => {
          resolve(response)
        }, (errorResponse, status) => {
          reject(errorResponse, status)
        })
      }else{
        reject(null, 401)
      }
    })
  }
  async getLatestDatetime(){
    // let categoryDB = this.db
    let query = {
      limit: 1,
      order: {
        by: 'updated_at',
        type: 'desc'
      }
    }
    let latestDate = null
    await this.db.get(query).then(response => {
      if(response.length){
        latestDate = datetimeHelper.serverDatetimeFormat(response[0]['updated_at'], true)
      }
    })
    return latestDate
  }
}
