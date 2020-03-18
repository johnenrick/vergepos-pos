import Sync from '../core/sync.js'
import User from '@/database/controller/user.js'
import Store from '@/vue-web-core/system/store'
export default class UserSync extends Sync{
  downSync(){
    let latestDate = new Date(localStorage.getItem('latest_users_datetime'))
    let param = {
      select: {
        0: 'email',
        1: 'pin',
        2: 'status',
        3: 'updated_at',
        4: 'deleted_at',
        5: 'created_at',
        user_basic_information: {
          select: ['first_name', 'last_name']
        },
        user_roles: {
          select: ['role_id']
        },
        company_user: {
          select: ['user_id', 'company_id']
        }
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }, {
        column: 'company_user.company_id',
        value: Store.getters.companyInformation.id
      }],
      with_trashed: true
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('user/retrieve', param).then(response => {
        if (response['data']) {
          let user = new User()
          let counter = 0
          let maxCount = response['data'].length
          for (let x in response['data']) {
            let userRoles = response['data'][x]['user_roles']
            let userData = {
              db_id: response['data'][x]['id'] * 1,
              email: response['data'][x]['email'],
              pin: response['data'][x]['pin'] ? response['data'][x]['pin'] : '',
              is_cashier: 0,
              is_manager: 0,
              is_admin: 0,
              user_roles: userRoles,
              first_name: response['data'][x]['user_basic_information'] ? response['data'][x]['user_basic_information']['first_name'] : null,
              last_name: response['data'][x]['user_basic_information'] ? response['data'][x]['user_basic_information']['last_name'] : null,
              created_at: response['data'][x]['created_at'],
              updated_at: response['data'][x]['updated_at']
            }
            for(let y = 0; y < userRoles.length; y++){
              if(userRoles[y]['role_id'] * 1 === 101){ // cashier
                userData['is_cashier'] = 1
              }else if(userRoles[y]['role_id'] * 1 === 102){ // manager
                userData['is_manager'] = 1
              }else if(userRoles[y]['role_id'] * 1 === 100){ // admin
                userData['is_admin'] = 1
              }
            }
            let idbParam = {
              where: {
                db_id: response['data'][x]['id'] * 1
              }
            }
            user.get(idbParam).then((result) => {
              if (response['data'][x]['deleted_at'] && result.length) {
                user.delete(result[0].id).then(() => {
                  counter++
                })
              } else if (result.length) {
                if((new Date(userData['updated_at'])).getTime() < result[0]['updated_at']){
                  userData['pin'] = result[0]['pin']
                  this.updateUser(userData).then(response => {
                    if(!response['data']){
                      console.error('failed to sync new pin', response)
                    }
                  }).finally(() => {
                    counter++
                  })
                }else{
                  userData['id'] = result[0]['id']
                  user.update(userData).then(() => {
                    counter++
                  })
                }
              } else if (!result.length && !response['data'][x]['deleted_at']) {
                user.add(userData).then(() => {
                  counter++
                })
              }
            })
          }
          let interval = setInterval(() => {
            if(counter === maxCount){
              resolve(5)
              clearInterval(interval)
            }
          }, 100)
        }else{
          resolve(5)
        }
      }).catch((error, status) => {
        resolve(5)
        console.log('failed to sync', error, status)
        reject(error)
      })
    })
  }
  updateUser(userData){
    let param = {
      id: userData['db_id'],
      pin: userData['pin'],
    }
    return this.retrieveAPIData('user/update', param)
  }
}
