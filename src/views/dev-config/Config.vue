<template>
  <div class="container">
    <div class="form-group">
      <label for="exampleFormControlInput1">Debug</label>
      <select v-model="config.debug" class="form-control">
        <option value="1">Yes</option>
        <option value="0">No</option>
      </select>
    </div>
    <div class="form-group">
      <label for="exampleFormControlInput1">Connection</label>
      <select v-model="config.connection" class="form-control">
        <option value="1">Connected</option>
        <option value="0">Offline</option>
      </select>
    </div>
    <div class="form-group">
      <label for="exampleFormControlInput1">Default Username</label>
      <input v-model="config.default_username" class="form-control">
    </div>
    <div class="form-group">
      <label for="exampleFormControlInput1">Default Password</label>
      <input v-model="config.default_password" class="form-control">
    </div>
    <div class="form-group">
      <label for="exampleFormControlInput1">Default PIN</label>
      <input v-model="config.default_pin" class="form-control">
    </div>
    <div class="w-100 text-right">
      <button @click="save" class="btn btn-primary"><fa icon="save" /> Save</button>
    </div>
  </div>
</template>
<script>
export default {
  data(){
    let defaultUsername = 'juancruz@gmail.com'
    let defaultPassword = 123456
    let defaultPIN = 1234
    let defaultConfig = {
      debug: 1,
      connection: 1,
      default_username: defaultUsername,
      default_password: defaultPassword,
      default_pin: defaultPIN,
    }
    if(!localStorage.getItem('dev-config')){
      localStorage.setItem('dev-config', JSON.stringify(defaultConfig))
    }else{
      defaultConfig = JSON.parse(localStorage.getItem('dev-config'))
    }
    return {
      config: defaultConfig
    }
  },
  methods: {
    save(){
      localStorage.setItem('dev-config', JSON.stringify(this.config))
      window.location = '/'
    }
  }
}
</script>
<style>
  label{
    font-weight: bold
  }
</style>
