<template>
  <modal ref="modal" title="Customer Details" icon="user-friends" :closeable="false">
    <template slot="body">
      <CommonForm ref="customerForm" :config="formConfig" :validation-messages="validationMessages" :mode="mode !== 'online' ? 'view' : null" />
      <div class="text-right">
        <span v-if="isLoading">Please wait...</span>
        <template v-else-if="mode === 'online'">
          <button @click="save" class="btn btn-success mr-1"><fa icon="check" /> Save</button>
        </template>
        <span v-else class="pr-2">You cannot edit this in Offline Mode </span>
        <button v-if="!isLoading" @click="close" class="btn btn-outline-dark">Close</button>
      </div>
    </template>
  </modal>
</template>
<script>
import Vue from 'vue'
import Customer from '@/database/controller/customer'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import CommonForm from '@/vue-web-core/components/form/Form'
import UserStore from '@/vue-web-core/system/store'
export default {
  components: {
    Modal,
    CommonForm
  },
  data(){
    return {
      isLoading: false,
      isOffline: true,
      validationMessages: {},
      formConfig: {
        fields: {
          name: {},
          address: {},
          gender: {
            type: 'select',
            config: {
              default_option: {
                value: 0,
                text: 'Unknown'
              },
              options: [{
                value: 1,
                text: 'Male'
              }, {
                value: 2,
                text: 'Female'
              }, {
                value: 3,
                text: 'Gay'
              }, {
                value: 4,
                text: 'Lesbian'
              }]
            }
          },
          birthdate: {
            name: 'Birthday',
            type: 'date',
            help_text: 'Who doesn\'t want to be greeted on their birthday?'
          },
          notes: {
          }
        }
      }
    }
  },
  methods: {
    _open(customerLocalId, customerDBId = null){
      this.isLoading = true
      this.$refs.modal._open()
      this.$refs.customerForm._resetForm()
      if(customerLocalId){
        this.openOffline(customerLocalId).finally(() => {
          this.isLoading = false
        })
      }else{
        this.isLoading = false
      }
    },
    close(){
      this.$refs.modal._close()
    },
    openOffline(customerLocalId){
      return new Promise((resolve, reject) => {
        const customerDB = new Customer()
        customerDB.get({ id: customerLocalId }).then(result => {
          if(result){
            if(typeof result['gender'] === 'undefined' || result['gender'] === null){
              result['gender'] = 0
            }
            this.$refs.customerForm._fillFormData(result)
            resolve(true)
          }else{
            reject(false)
          }
        })
      })
    },
    save(){
      this.isLoading = true
      this.validationMessages = {}
      let formData = this.$refs.customerForm._getFormData()
      const localId = formData['id']
      formData['id'] = formData['db_id']
      if(formData['birthdate']){
        if((new Date(formData['birthdate'])).getFullYear() <= 1970){
          formData['birthdate'] = null
        }
      }
      console.log('formData', formData)
      this.apiRequest('customer/update', formData, response => {
        if(response['data'] && localStorage.getItem('is_terminal')){
          formData['db_id'] = formData['id']
          formData['id'] = localId
          this.saveLocal(formData).then(result => {
            this.$emit('update', result)
            this.isLoading = false
          })
        }else{
          this.isLoading = false
        }
      }, (errorResponse) => {
        if(errorResponse.error.code === 1){
          let errorMessages = errorResponse.error.message
          for(let error in errorMessages){
            let messageText = ''
            for(let x = 0; x < errorMessages[error].length; x++){
              // TODO apply convertMessage
              // messageText += ResponseUtil.convertMessage(errorMessages[error][x]) + '.'
              messageText += errorMessages[error][x]
            }
            Vue.set(this.validationMessages, error, { type: 'error', message: messageText })
          }
        }
        this.isLoading = false
      })
    },
    saveLocal(updatedData){
      return new Promise((resolve) => {
        const customerDB = new Customer()
        if(typeof updatedData['birthdate'] !== 'undefined'){
          updatedData['birthdate'] = updatedData['birthdate'] ? (new Date(updatedData['birthdate'])).getTime() : null
        }
        customerDB.update(updatedData).finally(() => {
          resolve(updatedData)
        })
      })
    }
  },
  computed: {
    mode(){
      return UserStore.getters.mode
    }
  }
}
</script>
