<template>
  <div class="text-center pt-3">
    <h3><fa icon="exclamation-triangle" /> Cannot Talk to the Server!</h3>
    <p>Please make sure you have <strong>internet connection</strong> then refresh or try logging in using <strong>Offline Mode</strong></p>
    <button class="btn btn-outline-dark mr-1" @click="refreshPage">Refresh Page</button>
    <button class="btn btn-outline-dark" @click="loginPage">Go to Log In Page</button>
  </div>
</template>
<script>
export default {
  methods: {
    refreshPage(){
      location.reload(true)
    },
    loginPage(){
      localStorage.removeItem('default_auth_token')
      this.$router.push({
        path: '/'
      })
      location.reload(true)
    }
  }
}
</script>
