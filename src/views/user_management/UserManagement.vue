<template>
  <div class="section">
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
        1: 'first_name',
        2: 'user_type_id',
        3: 'status',
        user_basic_information: {
          select: {
            0: 'first_name',
            1: 'last_name',
          }
        }
      }
    }
    let tableColumnSetting = {
      email: {},
      'user_information.full_name': {
        name: 'Name'
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
        'user_basic_information.first_name': {
          name: 'First Name'
        },
        'user_basic_information.last_name': {
          name: 'Last Name'
        },
        'user_basic_information.mobile_number': {
          name: 'Mobile Number'
        },
        'user_basic_information.address': {
          name: 'Address'
        },
        status: {
          type: 'select',
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
              role_action_registry_id: x,
              deleted: this.selectedRoles[x]['deleted'],
            })
          }
          formData['role_access_lists'] = roleAccessList
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
              console.log('open')
            },
            form_reset: () => {
              this.selectedRoles = {}
              console.log('reset')
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
        console.log(response['data'])
        this.roles = response['data']
      })
    },
    fillUpSelectedServiceAction(){
      this.selectedRoles = {}
      let formData = this.formSlotProp.formData
      console.log(formData)
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
