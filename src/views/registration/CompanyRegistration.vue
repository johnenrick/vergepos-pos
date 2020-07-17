<template>
  <div class="container p-3">

    <form-component
      ref="form"
      :config="formConfig"
      :validation-messages="validationMessage"
    />

    <div class="text-center">
      <img
        v-if="isLoading"
        src="/loading-circle.gif"
        width="70px"
      >
      <button
        v-else
        @click="register"
        type="button"
        class="btn btn-primary btn-lg"
      >
        Join the Future
      </button>
    </div>
    <modal ref="modal" size="lg">
      <template v-slot:body>
        <div class="p-4 text-center">
          <h1 class="display-5 font-weight-bold">
            Congratulation, {{username}}!
          </h1>
          <p class="lead mt-4">Your account has been successfully created! You can now start exploring VergePOS and transform your business!</p>
          <button v-if="isTerminal === false" @click="logIn" class="btn btn-success btn-lg">Proceed To My Account <fa :icon="'arrow-right'"  /></button>
          <button v-else @click="goHome" class="btn btn-success btn-lg">Go to Log In Page <fa :icon="'arrow-right'"  /></button>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import FormComponent from '@/vue-web-core/components/form/Form'
import ResponseUtil from '@/vue-web-core/helper/api/response-util.js'
import APIUtil from '@/vue-web-core/helper/api/util.js'
import Modal from '@/vue-web-core/components/bootstrap/Modal.vue'
import VueCoreStore from '@/vue-web-core/system/store'
export default {
  name: 'CompanyRegistration',
  components: {
    FormComponent,
    Modal
  },
  mounted(){
    if(localStorage.getItem('is_terminal')){
      this.isTerminal = true
    } else{
      this.isTerminal = false
    }
  },
  data () {
    return {
      isTerminal: Boolean,
      passwordMatched: false,
      isLoading: false,
      validationMessage: {},
      username: 'John',
      credential: {},
      formConfig: {
        fields: {
          your_company: {
            label_col_span: 12,
            label_style: 'text-center font-weight-bold text-uppercase pt-4',
            type: 'label'
          },
          name: {
            name: 'Company Name'
          },
          // code: {
          //   name: 'Short Name',
          //   placeholder: 'e.g. GMA, ABSCBN, SMC'
          // },
          'company_detail.nature': {
            name: 'Nature of Business'
          },
          'company_detail.address': {
            name: 'Company Address'
          },
          // 'company_detail.contact_number': {
          //   name: 'Contact Number'
          // },
          personal_information: {
            label_col_span: 12,
            label_style: 'text-center font-weight-bold text-uppercase pt-4',
            type: 'label'
          },
          'your_name': {
            type: 'label',
            col: 4
          },
          'user.user_basic_information.first_name': {
            name: 'First Name',
            field_col_style_class: 'pr-1',
            label_col_span: 0,
            col: 4
          },
          'user.user_basic_information.last_name': {
            name: 'Your Last Name',
            field_col_style_class: 'pl-1',
            label_col_span: 0,
            col: 4
          },
          'user.email': {
            name: 'Your Email'
          },
          'user.password': {
            name: 'Your Password',
            type: 'password'
          },
          password_verification: {
            type: 'password',
            on_form_data_change: (changedField, formData) => {
              if ((changedField === 'password_verification' || changedField === 'user.password') && typeof formData['user.password'] !== 'undefined') {
                if (formData['user.password'] !== formData['password_verification'] && formData['user.password'] !== '') {
                  this.passwordMatched = false
                  this.validationMessage['password_verification'] = {
                    type: 'error',
                    message: 'Password Mismatched'
                  }
                  return {
                  }
                }
                if (formData['user.password'] !== '' && formData['user.password'] !== '') {
                  this.passwordMatched = true
                  this.validationMessage['password_verification'] = {
                    type: 'success',
                    message: 'Password Matched!'
                  }
                  return {
                  }
                } else {
                  this.passwordMatched = false
                  if(typeof this.validationMessage['password_verification'] !== 'undefined'){
                    delete this.validationMessage['password_verification']
                  }
                  return {
                  }
                }
              }
            }
          },
          'user.pin': {
            name: 'PIN',
            config: {
              maxlength: 10
            }
          },
        }

      }
    }
  },
  methods: {
    congratulate(){
      this.$refs.modal._open()
    },
    register () {
      if(!this.passwordMatched || this.isLoading){
        return false
      }
      this.validationMessage = {}
      let param = APIUtil.textKeyToArray(this.$refs.form._getFormData())
      this.isLoading = true
      this.username = param.name
      this.apiRequest('company/create', param, (response) => {
        if (response.data.id) {
          this.credential = {
            email: param['user']['email'],
            password: param['user']['password']
          }
          this.username = param.name
          this.congratulate()
        }
        this.isLoading = false
      }, (errorResponse, status) => {
        this.isLoading = false
        if(typeof errorResponse.error !== 'undefined'){
          if (errorResponse.error.code === 1) {
            let errorMessages = ResponseUtil.renderValidationError(errorResponse.error.message)
            this.validationMessage = errorMessages
          }
        }else{
          console.error('Register Company', errorResponse, status)
        }
        this.isLoading = false
      })
    },
    logIn(){
      this.$auth.login({
        params: this.credential,
        rememberMe: false,
        success: (response) => {
          console.log('response ni siya', response)
          localStorage.removeItem('is_terminal')
          localStorage.setItem('company_id', response.data.user.company_id)
          localStorage.setItem('user_id', response.data.user.id)
          localStorage.setItem('roles', JSON.stringify(response.data.user.roles))
          VueCoreStore.dispatch('setUserInformation')
          this.isLoading = false
          setTimeout(() => {
            window.location = '/'
          }, 1000)
        },
        error: (response) => {
          if (response.status === 401) {
            this.errorMessage = 'Invalid credentials'
          }
          this.isLoading = false
        }
      })
    },
    goHome(){
      window.location = '/'
    }
  }
}
</script>
