import { connection } from '../js_store/js-store-con'
let us = require('underscore')
var pluralize = require('pluralize')

export default class Controller {
  tableName
  add(data){
    if(typeof data.length === 'undefined') data = [data]
    for(let x = 0; x < data.length; x++){
      if(typeof data[x]['created_at'] === 'undefined' || data[x]['created_at'] === null){
        data[x]['created_at'] = (new Date()).getTime()
      }else{
        data[x]['created_at'] = (new Date(data[x]['created_at'])).getTime()
      }
      if(typeof data[x]['updated_at'] === 'undefined' || data[x]['updated_at'] === null){
        data[x]['updated_at'] = data[x]['created_at']
      }else{
        data[x]['updated_at'] = (new Date(data[x]['updated_at'])).getTime()
      }
    }
    return new Promise((resolve, reject) => {
      connection.insert({
        into: this.tableName,
        values: data,
        return: true
      }).then(response => {
        resolve(response.length ? response[0] : null)
      }).catch(error => {
        console.log(this.tableName)
        reject(error)
      })
    })
  }
  update(data){
    data['updated_at'] = (new Date()).getTime()
    if(isNaN(data['created_at'] * 1)){
      // data['created_at'] = (new Date(data['created_at'])).getTime()
    }
    if(data['created_at']){
      data['created_at'] = (new Date(data['created_at'])).getTime()
    }
    return new Promise((resolve, reject) => {
      connection.update({
        in: this.tableName,
        set: data,
        where: {
          id: data['id']
        }
      }).then(response => {
        resolve(response)
      }).catch(error => {
        console.log(this.tableName, data)
        reject(error)
      })
    })
  }
  get(query){
    let hasId = false
    if(typeof query !== 'object'){
      query = {}
    }
    if(typeof query['from'] === 'undefined'){
      query['from'] = this.tableName
    }

    if(typeof query['id'] !== 'undefined'){
      if(typeof query['where'] === 'undefined'){
        query['where'] = {}
      }
      query['where']['id'] = query['id']
      hasId = true
      delete query['id']
    }
    return new Promise((resolve, reject) => {
      connection.select(query).then(result => {
        if(result.length && typeof query['with'] !== 'undefined'){
          this.executeWithQuery(query, result).then(withResult => {
            result = withResult
            if(!hasId){
              resolve(result.length ? result : [])
            }else{
              resolve(result.length ? result[0] : null)
            }
          })
        }else{
          if(!hasId){
            resolve(result.length ? result : [])
          }else{
            resolve(result.length ? result[0] : null)
          }
        }
      }).catch(error => {
        console.log('error', error)
      })
    })
  }
  executeWithQuery(query, result){
    let rootTableIdList = []
    let idLookUp = {}
    for(let x = 0; x < result.length; x++){
      idLookUp[result[x]['id']] = x
      rootTableIdList.push(result[x]['id'])
    }
    let withCount = Object.keys(query['with']).length
    let completedQuery = 0
    return new Promise((resolve, reject) => {
      for(let withTable in query['with']){
        let parentTable = pluralize.singular(query['from'])
        let withQuery = {
          from: withTable,
          where: {}
        }
        withQuery['where'][parentTable + '_id'] = {
          in: rootTableIdList
        }
        this.get(withQuery).then(response => {
          let groupedResult = us.groupBy(response, parentTable + '_id')
          for(let parentId in groupedResult){
            result[idLookUp[parentId]][withTable] = groupedResult[parentId]
          }
        }).finally(() => {
          completedQuery++
          if(completedQuery === withCount){
            resolve(result)
          }
        })
      }
    })
  }
  getByIndex(index, value){
    let where = {}
    where[index] = value
    return new Promise((resolve, reject) => {
      connection.select({
        from: this.tableName,
        where: where
      }).then(result => {
        resolve(result.length ? result : null)
      })
    })
  }
  getAll(){
    return new Promise((resolve, reject) => {
      connection.getDbList().then(result => {
      })
      connection.select({
        from: this.tableName
      }).then(result => {
        resolve(result)
      }).finally(result => {
      })
    })
  }
}
