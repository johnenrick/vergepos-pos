<template>
  <div>
    <h2>Account Settings <small v-if="isConnected === false">(Offline <fa icon="wifi" class="text-secondary"/>)</small></h2>
    <div class="row justify-content-center">
      <div class="col">
        <div class="card p-3">
           <div class="row justify-content-center">
            <div class="col-12">
                <div class="form-group">
                  <div :class="prompt" class="alert">
                    {{feedback}}
                  </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <label>First Name</label>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <input v-model="fName" class='form-control' :disabled="isConnected === true && isEdit === true? false : true">
            </div>
          </div>
           <div class="row">
            <div class="col form-group">
              <label>Last Name</label>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <input v-model="lName" class='form-control' :disabled="isConnected === true  && isEdit === true? false : true">
            </div>
          </div>
           <div class="row">
            <div class="col form-group">
              <label>E-mail Address</label>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
              <input v-model="email" class='form-control' disabled>
            </div>
          </div>
           <div class="row" v-if="isConnected === true">
            <div class="col form-group">
              <label>Password</label>
            </div>
          </div>
          <div class="row" v-if="isConnected === true">
            <div class="col form-group">
              <input type="password" :class="passwordClass" v-model="password" class='form-control' :disabled="isEdit === false ? true : false" autocomplete="off">
              <div class="invalid-feedback">
                {{passwordPrompt}}
              </div>
              <div class="valid-feedback">
                {{passwordPrompt}}
              </div>
            </div>
          </div>
           <div class="row">
            <div class="col form-group">
              <label>PIN</label>
            </div>
          </div>
          <div class="row">
            <div class="col form-group">
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
    if(UserStore.getters.sessionConnection === 'online'){
      this.isConnected = true
      this.retrieveDetailOnline()
    } else{
      this.isConnected = false
      this.retrieveDetailOffline()
    }
  },
  data() {
    return {
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
        this.pinPrompt = 'Leaving this blank will not change te pin'
      } else if(this.pin.length < 4 || this.pin.length > 4){
        this.pinPrompt = 'Must contain 4 characters'
        this.pinClass = 'is-invalid'
      } else{
        this.pinClass = 'is-valid'
        this.pinPrompt = ''
      }
    }
  },
  methods: {
    setDetails(data){
      if(!data.hasOwnProperty('user_basic_information')){
        this.fName = data['first_name']
        this.lName = data['last_name']
        this.email = data['email']
      } else{
        this.fName = data['user_basic_information']['first_name']
        this.lName = data['user_basic_information']['last_name']
        this.email = data['email']
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
        this.responseTempOffline = response[0]
        this.apiRequest('user/retrieve', param, (response2) => {
          this.responseTempOnline = response2['data']
          if(new Date(this.responseTempOnline['user_basic_information']['updated_at']) > new Date(this.responseTempOffline['updated_at'])){
            this.setDetails(this.retrieveDetailOnline)
          } else{
            this.setDetails(this.responseTempOffline)
          }
        })
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
        this.setDetails(this.responseTempOffline)
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
          this.prompt = 'alert-success'
          this.feedback = 'Changes have been saved'
          UserStore.dispatch('setUserInformationOffline')
          setTimeout(() => { this.prompt = 'invisible' }, 700)
        })
      } else{
        this.prompt = 'alert-warning'
        this.feedback = 'Please make sure to input valid details'
        setTimeout(() => { this.prompt = 'invisible' }, 700)
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
          this.prompt = 'alert-success'
          this.feedback = 'Changes have been saved'
          UserStore.dispatch('setUserInformation')
          setTimeout(() => { this.prompt = 'invisible' }, 700)
        })
      } else{
        this.prompt = 'alert-warning'
        this.feedback = 'Please make sure to input valid details'
        setTimeout(() => { this.prompt = 'invisible' }, 700)
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
      this.prompt = 'alert-secondary'
      this.feedback = 'Changes have been discarded'
      setTimeout(() => { this.prompt = 'invisible' }, 700)
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
