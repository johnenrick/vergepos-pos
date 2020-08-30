import { connection } from '../js_store/js-store-con' // https://jsstore.net/tutorial/get-started/
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
        if(data.length > 1){
          resolve(response.length ? response : null)
        }else{
          resolve(response.length ? response[0] : null)
        }
      }).catch(error => {
        console.error(this.tableName, data, error)
        reject(error)
      })
    })
  }
  update(data){
    if(isNaN(data['created_at'] * 1)){
      // data['created_at'] = (new Date(data['created_at'])).getTime()
    }
    if(data['created_at']){
      data['created_at'] = (new Date(data['created_at'])).getTime()
    }
    if(typeof data['updated_at'] !== 'undefined' || data['updated_at']){
      data['updated_at'] = (new Date(data['updated_at'])).getTime()
    }else{
      data['updated_at'] = (new Date()).getTime()
    }
    return new Promise((resolve, reject) => {
      let where = {}
      if(typeof data['id'] === 'undefined' && typeof data['db_id'] !== 'undefined'){
        where['db_id'] = data['db_id']
      }else if(typeof data['id'] !== 'undefined'){
        where['id'] = data['id']
      }
      connection.update({
        in: this.tableName,
        set: data,
        where: where
      }).then(response => {
        resolve(response)
      }).catch(error => {
        console.error(this.tableName, data)
        reject(error)
      })
    })
  }
  get(query){
    let hasId = false
    if(typeof query !== 'object'){
      query = {}
    }else{
      query = JSON.parse(JSON.stringify(query))
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
    }else if(typeof query['db_id'] !== 'undefined'){
      if(typeof query['where'] === 'undefined'){
        query['where'] = {}
      }
      query['where']['db_id'] = query['db_id']
      hasId = true
      delete query['db_id']
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
        console.error('error', query['from'], error, query)
        reject(error)
      }).finally(() => {
      })
    })
  }
  executeWithQuery(query, result){
    const withCount = Object.keys(query['with']).length
    let completedQuery = 0
    return new Promise((resolve, reject) => {
      for(let withTable in query['with']){
        let withQuery = query['with'][withTable]
        withQuery['from'] = pluralize.plural(withTable)
        if(typeof withQuery['where'] === 'undefined'){
          withQuery['where'] = {}
        }

        let withTablename = pluralize.singular(withTable)

        if(typeof query['with'][withTable]['is_parent'] === 'undefined' || !query['with'][withTable]['is_parent']){ // if with table is child
          this.executeWithChildQuery(query, result, withTable, withQuery, withTablename).finally(() => { // note that query and result are modified in the function
            completedQuery++
            if(completedQuery === withCount){
              resolve(result)
            }
          })
        }else{ // if with table is a parent
          this.executeWithParentQuery(query, result, withTable, withQuery, withTablename).finally(() => { // note that query and result are modified in the function
            completedQuery++
            if(completedQuery === withCount){
              resolve(result)
            }
          })
        }
      }
    })
  }
  executeWithChildQuery(query, result, withTable, withQuery, withTablename){
    let mainTable = pluralize.singular(query['from'])
    let idLookUp = {}
    let rootTableIdList = []
    for(let x = 0; x < result.length; x++){
      idLookUp[result[x]['id']] = x
      rootTableIdList.push(result[x]['id'])
    }
    withQuery['where'][mainTable + '_id'] = {
      in: rootTableIdList
    }
    // query['with'][withTable]['is_parent'] = false
    const isOnlyOne = withTable === withTablename
    return new Promise((resolve, reject) => {
      this.get(withQuery).then(withTableResult => {
        let groupedResult = us.groupBy(withTableResult, mainTable + '_id')
        for(let parentId in groupedResult){
          if(typeof result[idLookUp[parentId]] !== 'undefined'){
            result[idLookUp[parentId]][withTable] = !isOnlyOne ? groupedResult[parentId] : groupedResult[parentId][0]
          }else{
            console.error('The aliasing of joined table might be overidding the main table column')
          }
        }
        resolve(true)
      }).finally(() => {
        resolve(false)
      })
    })
  }
  executeWithParentQuery(query, result, withTable, withQuery, withTablename){
    let childTableLookUp = {} // Used if the with table is a parent table, determine which index of result of a given parent id
    let withTableIdList = []
    for(let x = 0; x < result.length; x++){
      const parentTableId = result[x][withTablename + '_id']
      if(parentTableId){
        if(typeof childTableLookUp[parentTableId] === 'undefined'){
          childTableLookUp[parentTableId] = []
        }
        childTableLookUp[parentTableId].push(x)
        withTableIdList.push(parentTableId)
      }
    }
    withQuery['where']['id'] = {
      in: withTableIdList
    }
    return new Promise((resolve) => {
      this.get(withQuery).then(withTableResult => { // if with table is a parent table
        const parentTableResult = withTableResult
        parentTableResult.forEach((parentTable, index) => {
          const parentTableId = parentTable['id']
          let resultIndices = childTableLookUp[parentTableId]
          resultIndices.forEach(resultIndex => {
            result[resultIndex][withTable] = parentTable
          })
        })
        resolve(true)
      }).finally(() => {
        resolve(false)
      })
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
  delete(query){
    let where = {}
    if(typeof query === 'object'){
      where = query['where']
    }else{
      where['id'] = query * 1
    }
    return new Promise((resolve, reject) => {
      if(typeof query === 'undefined' || !query){
        reject(false)
      }else{
        connection.remove({
          from: this.tableName,
          where: where
        }).then(response => {
          resolve(response)
        }).catch(error => {
          console.error(this.tableName, error)
          reject(error)
        })
      }
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
