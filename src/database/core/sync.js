import apiRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
export default class Sync {
  retrieveAPIData(link, param){
    return new Promise((resolve, reject) => {
      apiRequest.request(link, param, response => {
        resolve(response)
      }, (errorResponse, status) => {
        reject(errorResponse, status)
      })
    })
  }
}
