import apiRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import userStore from '@/vue-web-core/system/store'
export default class Sync {
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
}
