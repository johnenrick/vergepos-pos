<template>
  <div class="">
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
  </div>
</template>
<script>
import FormComponent from '@/vue-web-core/components/form/Form'
import ResponseUtil from '@/vue-web-core/helper/api/response-util.js'

export default {
  name: 'CompanyRegistration',
  components: {
    FormComponent
  },
  data () {
    return {
      passwordMatched: false,
      isLoading: false,
      validationMessage: {},
      formConfig: {
        fields: {
          company_name: {},
          business_nature: {
            name: 'Nature of Business'
          },
          address: {},
          contact_number: {},
          email: {},

          password: {},
          password_verification: {
            on_form_data_change: (changedField, formData) => {
              this.passwordMatched = false
              if ((changedField === 'password_verification' || changedField === 'password')) {
                if (formData['password'] !== formData['password_verification']) {
                  return {
                    validation_message: {
                      password_verification: {
                        type: 'error',
                        message: 'Password Mismatched'
                      }
                    }
                  }
                } if (formData['password'] !== '' && formData['password'] !== '') {
                  this.passwordMatched = true
                  return {
                    validation_message: {
                      password_verification: {
                        type: 'success',
                        message: 'Password Matched'
                      }
                    }
                  }
                } else {
                  return {
                    validation_message: {
                      password_verification: {
                      }
                    }
                  }
                }
              }
            }
          }
        }

      }
    }
  },
  methods: {
    register () {
      this.validationMessage = {}
      let formData = this.$refs.form._getFormData()
      this.apiRequest('company/create', formData, (response) => {
        console.log(response)
        if (response.data.id) {
          this.logIn(formData['email'], formData['password'])
        }
      }, (errorResponse, status) => {
        if (errorResponse.error.code === 1) {
          console.log(errorResponse.error.message)
          let errorMessages = ResponseUtil.renderValidationError(errorResponse.error.message)
          this.validationMessage = errorMessages
        }
      })
    },
    logIn (username, password) {
      this.$auth.login({
        params: { email: username, password: password },
        rememberMe: false,
        success: (response) => {
          this.isLoading = false
          this.$router.push('dashboard')
        },
        error: (response) => {
          if (response.status === 401) {
            this.errorMessage = 'Invalid credentials'
          }
          this.isLoading = false
        }
      })
    }
  }
}
</script>
