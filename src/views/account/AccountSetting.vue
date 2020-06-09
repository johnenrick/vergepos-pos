<template>
  <div>
    <h2>Account Settings <small v-if="isConnected === false">(Offline <fa icon="wifi" class="text-secondary"/>)</small></h2>
    <div class="row justify-content-center">
      <div class="col">
        <div class="card p-3">
           <div class="row justify-content-center" :hidden="isHidden">
            <div class="col-12">
                <div class="form-group">
                  <div :class="prompt" class="alert">
                    {{feedback}}
                  </div>
              </div>
            </div>
          </div>
          <div class="form-group row">
           <label class="col-2 col-form-label">Email</label>
            <div class="col-10">
              <input type="text" readonly class="form-control-plaintext" v-model="email">
            </div>
          </div>
          <div class="form-group row">
           <label class="col-2 col-form-label">First Name</label>
            <div class="col-10">
              <input v-if="isConnected === true" v-model="fName" class='form-control' :disabled="isConnected === true && isEdit === true? false : true">
              <input v-else type="text" readonly class="form-control-plaintext" v-model="fName">
            </div>
          </div>
          <div class="form-group row">
           <label class="col-2 col-form-label">Last Name</label>
            <div class="col-10">
              <input v-if="isConnected === true" v-model="lName" class='form-control' :disabled="isConnected === true  && isEdit === true? false : true">
              <input v-else type="text" readonly class="form-control-plaintext" v-model="lName">
            </div>
          </div>
          <div class="form-group row" v-if="isConnected === true">
           <label class="col-2 col-form-label">Password</label>
            <div class="col-10">
              <input type="password" :class="passwordClass" v-model="password" class='form-control' :disabled="isEdit === false ? true : false" autocomplete="off">
              <div class="invalid-feedback">
                {{passwordPrompt}}
              </div>
              <div class="valid-feedback">
                {{passwordPrompt}}
              </div>
            </div>
          </div>
          <div class="form-group row">
           <label class="col-2 col-form-label">PIN</label>
            <div class="col-10">
              <input type="password" :class="pinClass" v-model="pin" class='form-control' :disabled="isEdit === false ? true : false" autocomplete="off">
              <div class="invalid-feedback">
                {{pinPrompt}}
              </div>
              <div class="valid-feedback">
                {{pinPrompt}}
              </div>
            </div>
          </div>
          <div v-if="isEdit === false" class="row">
            <div class="col form-group text-right">
              <button @click="editDetails" class="btn btn-outline-primary"><fa icon="edit" />Edit Details</button>
            </div>
          </div>
          <div v-else class="row text-right">
            <div class="col form-group ">
              <button @click="saveEdit" class="btn btn-outline-success"><fa icon="check" /> Save</button>
              <button @click="cancelEdit" class="btn btn-outline-secondary ml-2"><fa icon="times" /> Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
import User from '@/database/controller/user'
export default {
  mounted(){
    this.isHidden = false
    this.feedback = 'Loading... Please wait'
    this.prompt = 'alert-primary'
    let connection = UserStore.getters.sessionConnection
    if(localStorage.getItem('is_terminal')){
      if(connection === 'online'){
        this.isConnected = true
        this.retrieveDetailOnline()
      } else if(connection === 'offline'){
        this.isConnected = false
        this.retrieveDetailOffline()
      }
    } else{
      this.feedback = 'This device is not a terminal. Details are unavailable'
      this.prompt = 'alert-danger'
    }
  },
  data() {
    return {
      isHidden: Boolean,
      isConnected: Boolean,
      prompt: 'invisible',
      passwordPrompt: '',
      passwordClass: '',
      password: '',
      feedback: '',
      fName: '',
      lName: '',
      email: '',
      pin: '',
      pinClass: '',
      pinPrompt: '',
      isEdit: false,
      fNameTemp: '',
      lNameTemp: '',
      passwordTemp: '',
      pinTemp: '',
      emailTemp: '',
      updatedAt: '',
      userBasicInformationId: '',
      responseTempOnline: {},
      responseTempOffline: {}
    }
  },
  watch: {
    password: function () {
      if(this.password === '' && this.isEdit === true){
        this.passwordClass = 'is-valid'
        this.passwordPrompt = 'Leaving this blank will not change the password'
      }else if(this.password.length < 6 && this.password.length > 0){
        this.passwordPrompt = 'Must contain at least 6 characters'
        this.passwordClass = 'is-invalid'
      } else{
        this.passwordClass = 'is-valid'
        this.passwordPrompt = ''
      }
    },
    pin: function () {
      if(this.pin === ''){
        this.pinClass = 'is-valid'
        this.pinPrompt = 'Leaving this blank will not change the pin'
      } else if(this.pin.length < 4){
        this.pinPrompt = 'Must contain at least 4 characters'
        this.pinClass = 'is-invalid'
      } else if(this.pin.length > 10){
        this.pinPrompt = 'Maximum of 10 characters'
        this.pinClass = 'is-invalid'
      } else{
        this.pinClass = 'is-valid'
        this.pinPrompt = ''
      }
    }
  },
  methods: {
    setDetails(num){
      if(num === 2){
        this.fName = this.responseTempOffline['first_name']
        this.lName = this.responseTempOffline['last_name']
        this.email = this.responseTempOffline['email']
      } else if(num === 1){
        this.fName = this.responseTempOnline['user_basic_information']['first_name']
        this.lName = this.responseTempOnline['user_basic_information']['last_name']
        this.email = this.responseTempOnline['email']
      }
    },
    retrieveDetailOnline(){
      let param = {
        id: UserStore.getters.user.id,
        select: {
          0: 'email',
          user_basic_information: {
            select: {
              0: 'first_name',
              1: 'last_name',
              2: 'updated_at'
            }
          }
        }
      }
      let query = {
        where: {
          db_id: UserStore.getters.userInformation.id * 1
        }
      };
      (new User()).get(query).then((response) => {
        if(response){
          this.responseTempOffline = response[0]
        }
        this.apiRequest('user/retrieve', param, (response2) => {
          if(response2){
            this.responseTempOnline = response2['data']
            if(this.responseTempOffline === response[0]){
              let onlineDate = this.responseTempOnline['user_basic_information']['updated_at'].replace(/-/g, ' ').replace(/:/g, ' ').split(' ')
              if(new Date(onlineDate[0], onlineDate[1], onlineDate[2], onlineDate[3], onlineDate[4], onlineDate[5]) > new Date(this.responseTempOffline['updated_at'])){
                this.setDetails(1)
              } else{
                this.setDetails(2)
              }
            } else{
              this.setDetails(1)
            }
          } else{
            if(this.responseTempOffline === response[0]){
              this.setDetails(2)
            } else{
              this.isHidden = false
              this.feedback = 'An unexpected error occured. No details available'
              this.prompt = 'alert-danger'
            }
          }
        })
        this.feedback = ''
        this.isHidden = true
      })
    },
    retrieveDetailOffline(){
      let query = {
        where: {
          db_id: UserStore.getters.userInformation.id * 1
        }
      };
      (new User()).get(query).then((response) => {
        this.responseTempOffline = response[0]
        this.setDetails(2)
        this.feedback = ''
        this.isHidden = true
      })
    },
    updateDetailOffline(){
      let query = {
        db_id: UserStore.getters.userInformation.id * 1,
        pin: this.pin
      }
      if(this.pin === ''){
        delete query.pin
      }
      if(this.pinClass === 'is-valid'){
        (new User()).update(query).then((response) => {
          this.isEdit = false
          this.resetTemp()
          this.isHidden = false
          this.prompt = 'alert-success'
          this.feedback = 'Changes have been saved'
          UserStore.dispatch('setUserInformationOffline')
          setTimeout(() => { this.isHidden = true }, 700)
        })
      } else{
        this.isHidden = false
        this.prompt = 'alert-warning'
        this.feedback = 'Please make sure to input valid details'
        setTimeout(() => { this.isHidden = true }, 700)
      }
    },
    updateDetailOnline(){
      let query = {
        db_id: UserStore.getters.userInformation.id * 1,
        pin: this.pin,
        first_name: this.fName,
        last_name: this.lName
      }
      let param = {
        id: UserStore.getters.user.id,
        password: this.password,
        pin: this.pin,
        user_basic_information: {
          id: this.responseTempOnline['user_basic_information']['id'],
          first_name: this.fName,
          last_name: this.lName
        }
      }
      if(this.password === '' || this.password.length === 0){
        delete param.password
      }
      if(this.pin === '' || this.pin.length === 0){
        delete param.pin
        delete query.pin
      }
      if(this.passwordClass === 'is-valid' && this.pinClass === 'is-valid'){
        this.apiRequest('user/update', param, (response) => {
          (new User()).update(query).then((response) => {
          })
          this.isEdit = false
          this.resetTemp()
          this.isHidden = false
          this.prompt = 'alert-success'
          this.feedback = 'Changes have been saved'
          UserStore.dispatch('setUserInformation')
          setTimeout(() => { this.isHidden = true }, 700)
        })
      } else{
        this.isHidden = false
        this.prompt = 'alert-warning'
        this.feedback = 'Please make sure to input valid details'
        setTimeout(() => { this.isHidden = true }, 700)
      }
    },
    editDetails(){
      this.isEdit = true
      this.prepDetailsForEdit()
    },
    cancelEdit(){
      this.fName = this.fNameTemp
      this.lName = this.lNameTemp
      this.password = this.passwordTemp
      this.pin = this.pinTemp
      this.resetTemp()
      this.isEdit = false
      this.isHidden = false
      this.prompt = 'alert-secondary'
      this.feedback = 'Changes have been discarded'
      setTimeout(() => { this.isHidden = true }, 700)
    },
    saveEdit(){
      if(this.isConnected === true){
        this.updateDetailOnline()
      } else{
        this.updateDetailOffline()
      }
    },
    prepDetailsForEdit(){
      this.fNameTemp = this.fName
      this.lNameTemp = this.lName
      this.password = ''
      this.pin = ''
      this.emailTemp = this.email
      this.passwordClass = 'is-valid'
      this.passwordPrompt = 'Leaving this blank will not change the password'
      this.pinClass = 'is-valid'
      this.pinPrompt = 'Leaving this blank will not change the pin'
    },
    resetTemp(){
      this.fNameTemp = ''
      this.lNameTemp = ''
      this.passwordTemp = ''
      this.pinTemp = ''
      this.passwordClass = ''
      this.pinClass = ''
      this.emailTemp = ''
      this.passwordClass = ''
      this.passwordPrompt = ''
      this.pinClass = ''
      this.pinPrompt = ''
    }
  }
}
</script>
<style scoped>
input{
    background: white!important;
  }
</style>
