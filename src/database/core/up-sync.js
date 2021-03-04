import apiRequest from '@/vue-web-core/system/http-request-handling/apiRequest'
import userStore from '@/vue-web-core/system/store'
var pluralize = require('pluralize')
export default class UpSync {
  tableController
  isUploading = null
  limitPerUpload = 10
  reUploadResolves = []
  lastUploadDatetime = null
  onUpdateEntry(entry){ // to be overriden by the extending class
    return entry
  }
  upSync(entryFunction, additionalIDBParameter = {}, additionalAPIParameter = {}){
    return new Promise((resolve, reject) => {
      if(this.isUploading){
        this.reUploadResolves.push(resolve)
        if(this.reUploadResolves.length === 1){
          this.isUploading.then(() => {
            const reUploadResolves = this.reUploadResolves
            this.reUploadResolves = []
            this.upSync(entryFunction, additionalIDBParameter, additionalAPIParameter).then(result => {
              reUploadResolves.forEach(reUploadResolve => {
                reUploadResolve(result)
              })
            }).catch(error => {
              this.reUploadResolves.forEach(reUploadResolve => {
                reUploadResolve(error)
              })
            })
          }).catch(error => {
            this.reUploadResolves.forEach(reUploadResolve => {
              reUploadResolve(error)
            })
          })
        }
      }else{
        this.isUploading = this.startUpSync(entryFunction, additionalIDBParameter, additionalAPIParameter).then(result => {
          this.isUploading = null
          resolve(result)
        }).catch(error => {
          this.isUploading = null
          reject(error)
        })
      }
    })
  }
  startUpSync(entryFunction, additionalIDBParameter = {}, additionalAPIParameter = {}){ // entry function can be an array of entries, or a function that maps the entries
    return new Promise((resolve, reject) => {
      if(userStore.getters.mode === 'offline'){ // offline up sync is not allowed
        reject({ code: 1, message: 'Cannot sync in offline mode' })
      }else{
        this.retrieveEntries(entryFunction, additionalIDBParameter).then(entries => { // retrieve entries from idb
          this.uploadEntries(entries, additionalAPIParameter).then(apiResponse => { // upload entries to api
            localStorage.setItem(this.tableController.tableName + '-last-up-sync-date-time', this.lastUploadDatetime)
            this.updateLocalDB(apiResponse['data']).finally(() => { // update idb with the result from api
              resolve(true)
            })
          }).catch(error => {
            reject({ code: 2, message: 'Failed Uploading', error: error })
          })
        }).catch(error => {
          if(error === null){
            resolve(true)
          }else{
            reject({ code: 3, message: 'Error retrieve entries in IDB' })
          }
        })
      }
    })
  }
  updateLocalDB(apiResponse){
    return new Promise((resolve, reject) => {
      if(apiResponse === null){
        reject(false)
        return false
      }
      let isDoneCounter = 0 // if 2, means create and update is done
      /* The response is seperated in to created(entries that have been created in api) and updated(data that was updated in api) */
      if(typeof apiResponse['created'] !== 'undefined' && apiResponse['created'].length){
        this.updateDBId(apiResponse['created']).finally(() => {
          ++isDoneCounter
          if(isDoneCounter === 2){
            resolve(true)
          }
        })
      }else{
        ++isDoneCounter
      }
      if(typeof apiResponse['updated'] !== 'undefined' && apiResponse['updated'].length){
        this.updateExisting(apiResponse['updated']).finally(() => {
          ++isDoneCounter
          if(isDoneCounter === 2){
            resolve(true)
          }
        })
      }else {
        ++isDoneCounter
      }
      if(isDoneCounter === 2){
        resolve(true)
      }
    })
  }
  updateExisting(updatedEntries){
    return new Promise((resolve) => {
      const tableControler = this.tableController
      let totalUpdated = 0
      updatedEntries.forEach(entry => {
        let param = {
          id: entry['local_id'],
        }
        if(entry['error'] && entry['error'].length){
          switch(entry['error'][0] * 1){
            case 1: // newer data found
              param = { ...param, ...this.onUpdateEntry(entry['error'][1]) }
              param['id'] = entry['local_id']
              break
            case 2: // already deleted
              param['deleted_at'] = (new Date()).getTime()
              break
            case 3: // Database Update Failed
              param = null
              break
          }
        }else{
          param = null
        }
        if(param){
          tableControler.update(param).finally(() => {
            ++totalUpdated
            if(totalUpdated === updatedEntries.length){
              resolve(totalUpdated)
            }
          })
        }else{
          ++totalUpdated
          if(totalUpdated === updatedEntries.length){
            resolve(totalUpdated)
          }
        }
      })
    })
  }
  updateDBId(createdEntries){
    return new Promise((resolve) => {
      const tableControler = this.tableController
      let totalUpdated = 0
      createdEntries.forEach(entry => {
        let param = {
          id: entry['local_id'],
          db_id: entry['id']
        }
        tableControler.update(param).finally(() => {
          ++totalUpdated
          if(totalUpdated === createdEntries.length){
            resolve(totalUpdated)
          }
        })
      })
    })
  }
  uploadEntries(entries, additionalAPIParameter = {}){
    let param = additionalAPIParameter
    param[this.tableController.tableName] = entries
    let link = pluralize.singular((this.tableController.tableName).replace(/_/g, '-')) + '/sync'
    return new Promise((resolve, reject) => {
      apiRequest.request(link, param, response => {
        resolve(response)
      }, (errorResponse, status) => {
        reject([errorResponse, status])
      })
    })
  }
  retrieveEntries(entryFunction = null, additionalIDBParameter = {}){ // entry function can be an array of entries, or a function that maps the entries
    return new Promise((resolve, reject) => {
      if(typeof entryFunction === 'object'){
        resolve(entryFunction)
        return true
      }
      const tableName = this.tableController.tableName
      const tableControler = this.tableController
      const lastSyncDate = localStorage.getItem(tableName + '-last-up-sync-date-time')
      let param = additionalIDBParameter
      param['limit'] = this.limitPerUpload
      param['order'] = {
        by: 'updated_at',
        type: 'asc'
      }
      if(lastSyncDate){
        param['where'] = {
          updated_at: {
            '>=': lastSyncDate * 1
          }
        }
      }
      tableControler.get(param).then(response => {
        if(response.length){
          this.lastUploadDatetime = response[response.length - 1]['updated_at']
          let processedResponse = []
          if(typeof entryFunction === 'function'){
            response.forEach(responseItem => {
              const processedResult = entryFunction(responseItem)
              if(processedResult){
                processedResponse.push(processedResult)
              }
            })
          }
          resolve(response)
        }else{
          reject(null)
        }
      }).catch(error => {
        reject(error)
      })
    })
  }
}
