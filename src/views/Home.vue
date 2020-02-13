<template>
  <div class="home">
    <div class="row">
      <div class="col-sm-9 col-md-7 col-lg-4 ml-auto">
        <div class="card card-signin my-5">
          <div  class="card-body">
            <h5 class="card-title text-center font-weight-bold">Welcome to VergePOS <span v-if="isOffline"  class="text-secondary"><fa icon="wifi" /></span></h5>
            <p>Empowering your business and become more</p>
            <div v-if="isOffline === null" class="text-center">
              Checking Connectivity...
            </div>
            <template v-else>
              <div v-if="errorMessage !== ''" class="alert alert-danger ">
                <strong>Failed!</strong> {{errorMessage}}
              </div>
              <form class="form-signin">
                <div class="form-group">
                  <label >Email address</label>
                  <input @keyup="isTypingUsername" v-model="username" type="text" id="inputEmail" class="form-control" placeholder="Email address" required autofocus autocomplete="username">
                </div>

                <div class="form-group">
                  <label>{{isOffline === false ? 'Password' : 'PIN'}}</label>
                  <input ref="passwordInput" @keyup="isTypingPassword" v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required autocomplete="current-password">
                </div>
                <button @click="isOffline ? offlineSignIn(): signIn()" v-bind:disabled="isLoading" class="btn btn-lg btn-primary btn-block text-uppercase mt-3 mb-2" type="button">{{isLoading ? 'Signing In' : 'Sign In'}} <small v-if="isOffline">(Offline)</small></button>
                <router-link :hidden="isOffline === false ? false : true" to="/company-registration">Register</router-link>
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
export default {
  name: 'home',
  components: {
  },
  mounted(){
    this.clearOfflineAuthentication()
    this.checkIfOnline(() => {
      this.redirect()
    })
  },
  updated(){
  },
  data(){
    return {
      username: 'juancruz@gmail.com',
      password: '123456',
      isLoading: false,
      errorMessage: '',
      token: null,
      tokenAge: 0,
      tokenBirth: '',
      intervalID: 0,
      isOffline: null
    }
  },
  methods: {
    clearOfflineAuthentication(){
    },
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
    offlineSignIn(){
      if(!localStorage.getItem('is_terminal')){
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
          console.log('signin result', result, result[0]['db_id'])
          localStorage.setItem('user_id', result[0]['db_id'])
          VueCoreStore.dispatch('setCompanyInformationOffline')
          VueCoreStore.dispatch('setUserInformationOffline')
        }else{
          this.errorMessage = 'Invalid credentials'
        }
        this.isLoading = false
      }).catch(error => {
        console.error(error)
      }).finally(() => {
        this.isLoading = false
      })
    },
    signIn(){
      this.isLoading = true
      this.errorMessage = ''
      this.$auth.login({
        params: { email: this.username, password: this.password },
        rememberMe: false,
        success: (response) => {
          localStorage.setItem('company_id', response.data.user.company_id)
          localStorage.setItem('user_id', response.data.user.id)
          localStorage.setItem('roles', JSON.stringify(response.data.user.roles))
          // store.commit('setAuthToken', response.data.access_token)
          VueCoreStore.dispatch('setCompanyInformation')
          VueCoreStore.dispatch('setUserInformation')
          this.isLoading = false
        }
      }).catch((error, status) => {
        if(error.response && error.response.status === 401){
          this.errorMessage = 'Invalid credentials'
        }else{
          this.isOffline = true
        }
        this.isLoading = false
      })
    },
    redirect(){
      if(VueCoreStore.getters.user){
        if(typeof VueCoreStore.state.userRoles['100'] !== 'undefined'){
          this.$router.push({
            path: '/dashboard'
          }, () => {
          })
        }else if(typeof VueCoreStore.state.userRoles['101'] !== 'undefined'){
          this.$router.push({
            path: '/pos'
          }, () => {})
        }else{
          console.log(VueCoreStore.state.userRoles)
          alert('cant seem to find your place')
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
      if(e.code === 'Enter'){
        this.signIn()
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
      this.redirect()
    },
    authToken(newValue, oldValue){
      setTimeout(() => {
        this.redirect()
      }, 500)
    }
  }
}
</script>
