<template>
  <div class="pt-5">
    <div v-if="!isRegistered">
      <div class="row justify-content-center">
        <div class="col-sm-12 col-md-8 ">
          <form-component
            ref="form"
            :config="formConfig"
            :validation-messages="validationMessages"
          />
        </div>
      </div>
      <div class="row justify-content-center">
        <div class="col-sm-12 col-md-8  text-center">
          <button
            @click="register"
            type="button"
            class="btn btn-primary text-uppercase"
          >
            Register
          </button>
        </div>
      </div>
    </div>
    <div
      v-else
      class="row justify-content-center"
    >
      <div class="col-sm-12 col-md-8  text-center">
        <div
          class="alert alert-success"
          role="alert"
        >
          Registration successful! You will receive
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import APIUtil from '@/vue-web-core/helper/api/util.js'
import FormComponent from '@/vue-web-core/components/form/Form.vue'
export default {
  components: {
    FormComponent
  },
  data () {
    return {
      isRegistered: false,
      formConfig: {
        fields: {
          company_code: {
          },
          email: {},
          password: {
            type: 'password'
          },
          'user_basic_information.first_name': {
            name: 'First Name'
          },
          'user_basic_information.last_name': {
            name: 'Last Name'
          },
          'user_basic_information.middle_name': {
            name: 'Middle Name'
          }
        }
      },
      validationMessages: {}
    }
  },
  methods: {
    register () {
      let param = APIUtil.textKeyToArray(this.$refs.form._getFormData())
      this.validationMessages = {}
      this.apiRequest('user/create', param, (response) => {
        this.isRegistered = true
      }, (response, status) => {
        console.log(status, response)
        if (status === 422) {
          if (response['error']['code'] === 1) { // validtion
            let errorMessages = response.error.message
            for (let error in errorMessages) {
              let messageText = ''
              for (let x = 0; x < errorMessages[error].length; x++) {
                // TODO apply convertMessage
                // messageText += ResponseUtil.convertMessage(errorMessages[error][x]) + '.'
                messageText += errorMessages[error][x]
              }
              Vue.set(this.validationMessages, error, { type: 'error', message: messageText })
            }
          }
        }
      })
    }
  }

}
</script>
