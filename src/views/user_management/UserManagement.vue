<template>
  <div class="section p-3">
    <basic-module :config="config" >
      <template ref="additionalFormInput" v-slot:additionalFormField="slotProps">
        <label class="font-weight-bold">Roles</label>
        <span style="display:none">{{formSlotProp = slotProps}}</span>
          <div v-for="role in roles" class="pl-2">
            <label class="mr-3 item">
              <input
                @change="roleClicked($event)"
                v-bind:checked="typeof selectedRoles[role['id']] !== 'undefined' && !selectedRoles[role['id']]['deleted']"
                v-bind:value="role['id']" type="checkbox" >
                {{role['description']}}
            </label>
          </div>
      </template>
    </basic-module>
  </div>
</template>
<script>
import Vue from 'vue'
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import VueCoreStore from '@/vue-web-core/system/store'
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule
  },
  mounted () {
    this.retrieveRoles()
  },
  data () {
    let tableSettingRetrieveParameter = {
      select: {
        0: 'email',
        1: 'user_type_id',
        2: 'status',
        user_roles: {
          select: {
            role: {
              select: ['description']
            }
          }
        }
        // company_user: {
        //   select: ['company_id']
        // }
      },
      condition: [{
        column: 'company_user.company_id',
        value: VueCoreStore.state.companyInformation.id
      }]
    }
    let tableColumnSetting = {
      email: {},
      'user_basic_information.full_name': {
        name: 'Name'
      },
      roles: {
        type: 'html',
        value_function: (rowData) => {
          let roles = ''
          console.log(rowData, rowData['user_roles.array_key_list'], rowData['id'])
          if(typeof rowData['user_roles.array_key_list'] !== 'undefined' && (rowData['user_roles.array_key_list']).length){
            for(let x in rowData['user_roles.array_key_list']){
              let key = rowData['user_roles.array_key_list'][x]
              roles += (x > 0 ? ', ' : ' ') + rowData['user_roles.' + key + '.role.description']
            }
          }
          return roles !== '' ? roles : 'Unknown'
        }
      },
      status: {
        type: 'html',
        value_function: (rowData) => {
          switch(rowData['status'] * 1){
            case 0:
              return '<span class="badge badge-pill badge-secondary">Not Activated</span>'
            case 1:
              return '<span class="badge badge-pill badge-success">Ok</span>'
            case 2:
              return '<span class="badge badge-pill badge-danger">Rejected</span>'
            case 3:
              return '<span class="badge badge-pill badge-warning">Deactivated</span>'
          }
        }
      }
    }
    let formSetting = {
      fields: {
        email: {
        },
        password: {
          type: 'password'
        },
        pin: {
          name: 'PIN',
          placeholder: 'A four digit letter and number combination',
          type: 'password',
          help_text: 'PIN code will be used to log in, and void transaction when you are in OFFLINE mode',
          config: {
            maxlength: 4,
          }
        },
        'user_basic_information.first_name': {
          name: 'First Name'
        },
        'user_basic_information.last_name': {
          name: 'Last Name'
        },
        // 'user_basic_information.mobile_number': {
        //   name: 'Mobile Number'
        // },
        // 'user_basic_information.address': {
        //   name: 'Address'
        // },
        status: {
          type: 'select',
          default_value: 1,
          config: {
            options: [
              { text: 'Inactive', value: 0, is_default: true },
              { text: 'Active', value: 1 }
              // { text: 'Rejected', value: '2'},
              // { text: 'Staff', value: '3'}
            ]
          }
        },
      },
      hooks: {
        get_form_data: (formData) => {
          let roleAccessList = []
          for(let x in this.selectedRoles){
            roleAccessList.push({
              id: this.selectedRoles[x]['id'],
              role_id: x,
              deleted: this.selectedRoles[x]['deleted'],
            })
          }
          formData['user_roles'] = roleAccessList
          return formData
        }
      }
    }
    return {
      config: {
        module_name: 'User Management',
        api: 'user',
        table_setting: {
          retrieve_parameter: tableSettingRetrieveParameter,
          table_column_setting: tableColumnSetting,
        },
        form_setting: {
          retrieve_parameter: {
            select: {
              user_roles: {
                select: ['role_id']
              }
            }
          },
          form_field_setting: formSetting,
          listeners: {
            form_open: () => {
              this.fillUpSelectedServiceAction()
            },
            form_reset: () => {
              this.selectedRoles = {}
            }
          }
        }

      },
      formSlotProp: null,
      roles: [],
      selectedRoles: {}
    }
  },
  methods: {
    retrieveRoles(){
      let param = {
        select: {
          0: 'description',
          role_actions: {
            select: ['description']
          }
        }
      }
      this.apiRequest('role/retrieve', param, response => {
        this.roles = response['data']
      })
    },
    fillUpSelectedServiceAction(){
      this.selectedRoles = {}
      let formData = this.formSlotProp.formData
      if(typeof formData['user_roles.array_key_list'] !== 'undefined'){
        for(let x = 0; x < formData['user_roles.array_key_list'].length; x++){
          let roleAccessListId = formData['user_roles.' + formData['user_roles.array_key_list'][x] + '.id'] * 1
          Vue.set(this.selectedRoles, formData['user_roles.' + formData['user_roles.array_key_list'][x] + '.role_id'], {
            form_index: x,
            id: roleAccessListId,
            deleted: false
          })
        }
      }
    },
    roleClicked(event){
      let element = event.target
      if(element.checked){
        if(typeof this.selectedRoles[element.value] !== 'undefined'){
          Vue.set(this.selectedRoles[element.value], 'deleted', false)
        }else{
          Vue.set(this.selectedRoles, element.value, {
            form_index: null,
            id: null,
            deleted: false
          })
        }
      }else{
        if(typeof this.selectedRoles[element.value] !== 'undefined'){
          if(this.selectedRoles[element.value]['id']){
            Vue.set(this.selectedRoles[element.value], 'deleted', true)
          }else{
            Vue.delete(this.selectedRoles, element.value)
          }
        }else{
          console.error('unchecking not selected role action', element.value)
        }
      }
    },
  }
}

export default { ...ModuleDefault }
</script>
