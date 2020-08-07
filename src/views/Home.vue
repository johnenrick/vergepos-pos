<template>
  <div class="home px-3">
    <modal ref="modal" size="" :closeable="false">
      <template v-slot:body>
        <div class="p- text-center">
          <p class="">You are trying to log in a <strong>different company</strong>. This will clear the data of the previous company on this machine. Do you still want to continue?</p>
          <div class="row">
            <div class="col-1"></div>
            <button :disabled="!isLoading" class="col-4 btn btn-primary" @click="proceed">Proceed</button>
            <div class="col-2"></div>
            <button :disabled="!isLoading" class="col-4 btn btn-outline-secondary" @click="decline">No</button>
            <div class="col-1"></div>
          </div>
        </div>
      </template>
    </modal>
    <div class="row">
      <div class="col-sm-9 col-md-7 col-lg-4 ml-auto">
        <div class="card card-signin my-3">
          <div v-if="isOffline" class="card-header text-white bg-secondary text-center text-uppercase font-weight-bold">Offline Mode <fa icon="wifi" /></div>
          <div v-bind:class="isOffline ? 'bg-light' : ''" class="card-body ">
            <!-- <div v-if="isOffline" class="alert alert-info mb-2"><fa icon="info-circle" /> You will be logging in using <strong>Offline Mode</strong>. Please use your <strong>PIN</strong> instead of password</div> -->
            <h5 v-bind:class="isOffline ? 'text-secondary' : 'text-primary'" class="card-title text-center font-weight-bold">Welcome to VergePOS </h5>
            <p>Empower your business and be more!</p>
            <div v-if="isOffline === null" class="text-center">
              Checking Connectivity...
            </div>
            <template v-else>
              <div v-if="errorMessage !== ''" class="alert alert-danger ">
                <strong>Failed!</strong> {{errorMessage}}
              </div>
              <form class="form-signin">
                <div class="form-group">
                  <label ><fa icon="envelope" /> Email Address</label>
                  <input @keyup="isTypingUsername" v-model="username" type="email" class="form-control" placeholder="Email address" required autofocus autocomplete="username">
                </div>
                <div class="form-group">
                  <label class="w-100"><fa icon="lock" />  {{isOffline === false ? 'Password' : 'PIN'}}
                    <!-- <router-link v-if="!isOffline" to="/password-reset" tabindex="-1" class="float-right text-info"><small class="">Forgot Password?</small></router-link> -->
                  </label>
                  <input ref="passwordInput" @keyup="isTypingPassword" v-model="password" type="password" id="inputPassword" class="form-control" v-bind:placeholder="isOffline === false ? 'Password' : 'PIN'" required autocomplete="current-password" :maxlength="isOffline ? 4 : null">
                </div>
                <div v-if="loginSwitch && !isLoading" class="text-hover-underline text-center">
                  <span v-if="!isOffline" @click="switchLoginMode" class="c-pointer"><big><fa icon="wifi" class=""  /></big> Sign in using <strong class="">Offline Mode</strong></span>
                  <span v-else @click="switchLoginMode" class="c-pointer text-primary"><big><fa icon="wifi"  class="text-primary" /></big> Exit <strong>Offline Mode</strong></span>
                </div>
                <button v-if="isOffline" @click="offlineSignIn" v-bind:disabled="isLoading" class="btn btn-lg btn-secondary btn-block text-uppercase mt-3 mb-2" type="button">{{isLoading ? 'Logging In' : 'Log In'}}</button>
                <button v-else @click="signIn" v-bind:disabled="isLoading" class="btn btn-lg btn-block btn-primary text-uppercase mt-3 mb-2" type="button">{{isLoading ? 'Logging In' : 'Log In'}}</button>
                <p :hidden="!(isOffline === false) && !isLoading" class="text-center pt-1">Don't have an account?<router-link to="/company-registration"><b> Sign Up</b></router-link></p>
              </form>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- <button @click="checkIfOnline">Test</button> -->
  </div>
</template>

<script>
// import store from '@/system/store'
import VueCoreStore from '@/vue-web-core/system/store'
import User from '@/database/controller/user'
import Modal from '@/vue-web-core/components/bootstrap/Modal.vue'
export default {
  name: 'home',
  components: {
    Modal
  },
  mounted(){
    if(VueCoreStore.getters.devConfig){
      let devConfig = VueCoreStore.getters.devConfig
      this.username = devConfig.default_username
      if(devConfig.connection * 1){
        this.password = devConfig.default_password + ''
      }else{
        this.password = devConfig.default_pin + ''
      }
    }
    this.checkIfOnline(() => {
      VueCoreStore.commit('isReady', () => {
        if(localStorage.getItem('is_terminal') && this.isOffline === false){
          this.loginSwitch = true
          if(localStorage.getItem('selected_login_mode') !== null){
            this.isOffline = localStorage.getItem('selected_login_mode') === 'true'
          }
        }
      })
    })
  },
  updated(){
  },
  data(){
    return {
      authData: Object,
      username: '',
      password: '',
      isLoading: false,
      errorMessage: '',
      token: null,
      tokenAge: 0,
      tokenBirth: '',
      intervalID: 0,
      isOffline: null,
      loginSwitch: false,
    }
  },
  methods: {
    checkIfOnline(callback){
      // return this.isOffline = true
      this.checkConnectivity().then((ping) => {
        this.isOffline = false
      }).catch((status) => {
        this.isOffline = true
      }).finally(() => {
        if(typeof callback === 'function'){
          callback()
        }
      })
    },
    switchLoginMode(){
      this.isOffline = !this.isOffline
      localStorage.setItem('selected_login_mode', this.isOffline)
    },
    offlineSignIn(){
      if(!localStorage.getItem('is_terminal')){
        this.$auth.logout()
        this.errorMessage = 'Offline Mode is only available for Terminals. You need to log in with internet then set this device as a terminal'
        return false
      }
      this.isLoading = true
      this.errorMessage = ''
      let userDB = new User()
      let param = {
        where: {
          email: this.username,
          pin: this.password
        }
      }
      userDB.get(param).then((result) => {
        if(result.length){
          localStorage.setItem('user_id', result[0]['db_id'])
          VueCoreStore.dispatch('setUserInformationOffline')
        }else{
          this.errorMessage = 'Invalid credentials' + (this.isOffline ? '. Be sure to use your PIN instead of password because you are in Offline Mode' : '.')
        }
        this.isLoading = false
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        this.isLoading = false
      })
    },
    proceed(){
      localStorage.removeItem('is_terminal')
      localStorage.removeItem('company_detail')
      localStorage.removeItem('terminal_details')
      localStorage.removeItem('cart-cache')
      this.removeTerminal(() => {
        localStorage.setItem('company_id', this.authData.data.user.company_id)
        localStorage.setItem('user_id', this.authData.data.user.id)
        localStorage.setItem('roles', JSON.stringify(this.authData.data.user.roles))
        // store.commit('setAuthToken', response.data.access_token)
        VueCoreStore.dispatch('setUserInformation')
        // store.commit('isReady', () => {

        // })
        this.$refs.modal._close()
        this.isLoading = true
      })
    },
    decline(){
      this.isLoading = false
      this.$refs.modal._close()
    },
    signIn(){
      this.isLoading = true
      this.errorMessage = ''
      this.$auth.login({
        params: { email: this.username, password: this.password },
        rememberMe: false,
        success: (response) => {
          if(localStorage.getItem('company_id') * 1 !== response.data.user.company_id * 1 && localStorage.getItem('company_id') * 1 !== 0){
            this.authData = response
            this.$refs.modal._open()
          } else{
            localStorage.setItem('company_id', response.data.user.company_id)
            localStorage.setItem('user_id', response.data.user.id)
            localStorage.setItem('roles', JSON.stringify(response.data.user.roles))
            // store.commit('setAuthToken', response.data.access_token)
            VueCoreStore.dispatch('setUserInformation')
            // this.isLoading = false
          }
        }
      }).catch((error, status) => {
        if(error.response && error.response.status === 401){
          this.errorMessage = 'Invalid credentials'
        }else{
          this.isOffline = true
          this.loginSwitch = false
        }
        this.isLoading = false
      })
    },
    async removeTerminal(callback){
      const dbs = await window.indexedDB.databases()
      if(typeof window.indexedDB.databases === 'undefined'){
        alter('Please update your Google Chrome Browser to all the features of VergePOS')
        // callback()
      }else{
        for(let ctr = 0; ctr < dbs.length; ctr++){
          await window.indexedDB.deleteDatabase(dbs[ctr]['name'])
        }
      }
      callback()
    },
    redirect(){
      if(VueCoreStore.getters.user){
        if(typeof VueCoreStore.getters.userRoles['100'] !== 'undefined'){
          this.$router.push({
            path: '/dashboard'
          }, () => {})
        }else if(typeof VueCoreStore.getters.userRoles['101'] !== 'undefined'){
          this.$router.push({
            path: '/pos'
          }, () => {})
        }else{
          console.log('Cant seem to find your place mortal', VueCoreStore.getters.user, VueCoreStore.getters.userRoles)
        }
      }else{
        console.info('not logged in')
      }
    },
    isTypingUsername(e){
      if(e.code === 'Enter'){
        this.$refs.passwordInput.focus()
      }
    },
    isTypingPassword(e){
      if(e.which === 13){
        e.target.blur()
        if(this.isOffline){
          this.offlineSignIn()
        }else{
          this.signIn()
        }
      }
    }
  },
  // computed: mapState(['authToken']),
  // computed: mapState(VueCoreStore.getters),
  computed: {
    userRoles(){
      return VueCoreStore.state.userRoles
    }
  },
  watch: {
    userRoles(newData){
      VueCoreStore.commit('isReady', () => {
        this.redirect()
      })
    }
  }
}
</script>
