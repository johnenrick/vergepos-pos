
11<template>
  <div class="home">
    {{token}}
    <div class="row">
      <div class="col-sm-9 col-md-7 col-lg-4 ml-auto">
        <div class="card card-signin my-5">
          <div class="card-body">
            <h5 class="card-title text-center">Welcome to IntraActiveOPS</h5>
            <p>Maximizing potentials through collaboration</p>
            <div v-if="errorMessage !== ''" class="alert alert-danger ">
              <strong>Failed!</strong> {{errorMessage}}
            </div>
            <form class="form-signin">
              <div class="form-label-group">
                <label for="inputEmail">Email address</label>
                <input v-model="username" type="text" id="inputEmail" class="form-control" placeholder="Email address" required autofocus>
              </div>

              <div class="form-label-group">
                <label for="inputPassword">Password</label>
                <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
              </div>

              <button @click="signIn" v-bind:disabled="isLoading" class="btn btn-lg btn-primary btn-block text-uppercase mt-3" type="button">{{isLoading ? 'Signing In' : 'Sign In'}}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import store from '@/system/store'
import { mapState } from 'vuex'

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
    // this.username = 'plenosjan@deliotte.com'
    // this.password = '123456'
  },
  updated(){
    this.redirect()
  },
  data(){
    return {
      username: 'plenosjohn@yahoo.com',
      password: 'dev',
      isLoading: false,
      errorMessage: '',
      token: null,
      tokenAge: 0,
      tokenBirth: '',
      intervalID: 0
    }
  },
  methods: {
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
          // store.dispatch('setCompanyInformation')
          // store.dispatch('setUserInformation')
          this.isLoading = false
        }
      }).catch((response, status) => {
        this.errorMessage = 'Invalid credentials'
        this.isLoading = false
      })
    },
    redirect(){
      alert('hey')
      if(this.$auth.user().id){
        this.$router.push({
          path: '/pos'
        })
      }
    }
  },
  computed: mapState(['authToken']),
  watch: {
    authToken(newValue, oldValue){
      setTimeout(() => {
        this.redirect()
      }, 500)
    }
  }
}
</script>
