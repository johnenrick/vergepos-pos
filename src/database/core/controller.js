import { connection } from '../js_store/js-store-con'

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
        reject(error)
      })
    })
  }
  update(data){
    data['updated_at'] = (new Date()).getTime()
    if(isNaN(data['created_at'] * 1)){
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
        reject(error)
      })
    })
  }
  get(query){
    let hasId = false
    if(typeof query !== 'object'){
      query = {}
    }
    query['from'] = this.tableName
    if(typeof query['where'] === 'undefined'){
      query['where'] = {}
    }
    if(typeof query['id'] !== 'undefined'){
      query['where']['id'] = query['id']
      hasId = true
      delete query['id']
    }
    console.log('query', query)
    return new Promise((resolve, reject) => {
      connection.select(query).then(result => {
        if(!hasId){
          resolve(result.length ? result : null)
        }else{
          resolve(result.length ? result[0] : null)
        }
      })
    })
  }
  getByIndex(index, value){
    let where = {}
    where[index] = value
    console.log('where', where)
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
      connection.select({
        from: this.tableName
      }).then(result => {
        resolve(result)
      })
    })
  }
}
