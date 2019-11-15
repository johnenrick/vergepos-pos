import Sync from '../core/sync.js'
import User from '@/database/controller/user.js'
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
        user_basic_information: {
          select: ['first_name', 'last_name']
        },
        user_roles: {
          select: ['role_id']
        }
      },
      condition: [{
        column: 'updated_at',
        clause: '>',
        value: latestDate
      }],
      with_trashed: true
    }
    return this.retrieveAPIData('user/retrieve', param).then(response => {
      if (response['data']) {
        let user = new User()
        for (let x in response['data']) {
          let userRoles = response['data'][x]['user_roles']
          let userData = {
            db_id: response['data'][x]['id'],
            email: response['data'][x]['email'],
            pin: response['data'][x]['pin'],
            is_cashier: 0,
            is_manager: 0,
            is_admin: 0,
            user_roles: userRoles,
            first_name: response['data'][x]['user_basic_information'] ? response['data'][x]['user_basic_information']['first_name'] : null,
            last_name: response['data'][x]['user_basic_information'] ? response['data'][x]['user_basic_information']['last_name'] : null
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
          user.getByIndex('db_id', response['data'][x]['id']).then((result) => {
            if (response['data'][x]['deleted_at'] && result) {
              user.delete(result[0].id)
            } else if (result) {
              userData['id'] = result[0]['id']
              user.update(userData)
            } else if (!result && !response['data'][x]['deleted_at']) {
              user.add(userData)
            }
          })
        }
      }
      return true
    }).catch((error, status) => {
      console.log('failed to sync', error, status)
      return error
    })
  }
}
