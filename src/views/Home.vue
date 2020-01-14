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
                  <input v-model="username" type="text" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
                </div>

                <div class="form-group">
                  <label>{{isOffline === false ? 'Password' : 'PIN'}}</label>
                  <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
                </div>
                <button @click="isOffline ? offlineSignIn(): signIn()" v-bind:disabled="isLoading" class="btn btn-lg btn-primary btn-block text-uppercase mt-3" type="button">{{isLoading ? 'Signing In' : 'Sign In'}} <small v-if="isOffline">(Offline)</small></button>
              </form>
            </template>
          </div>
        </div>
      </div>
    </div>
    <button @click="checkIfOnline">Test</button>
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
    // this.$auth.ready(() => {
    //   console.log('piskot')
    //   store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    //   if(this.$auth.check()){
    //     this.redirect()
    //   }else{
    //
    //   }
    //
    // })
    // this.username = 'plenosjohn@yahoo.com'
    // this.password = 'dev'
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
        console.log('ping', ping)
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
      this.isLoading = true
      this.errorMessage = ''
      let userDB = new User()
      userDB.get({
        where: {
          email: this.username,
          pin: this.password
        }
      }).then(result => {
        if(result.length){
          localStorage.setItem('offline_id', result[0]['id'])
        }else{
          this.errorMessage = 'Invalid credentials'
        }
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
      if(this.$auth.user().id){
        if(typeof VueCoreStore.state.userRoles[100] !== 'undefined'){
          this.$router.push({
            path: '/dashboard'
          })
        }else if(typeof VueCoreStore.state.userRoles[101] !== 'undefined'){
          this.$router.push({
            path: '/pos'
          }, () => {})
        }else{
          // alert('cant seem to find your place')
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
