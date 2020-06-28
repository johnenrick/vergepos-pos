<template>
  <div class="section p-3">
    <h2>Business Details</h2>
    <div class="row justify-content-center">
      <div class='col'>
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
          <div class="row justify-content-center">
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <div class="row">
                  <div class="col-12">
                    <label>Company Name</label>
                  </div>
                  <div class="col-12">
                    <input v-bind:disabled="isActive" class='form-control' :class="companyNameClass" v-model="companyName">
                    <div class="invalid-feedback">
                      {{companyNameError}}
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="row">
                  <div class="col-12">
                    <label>Company Code</label>
                  </div>
                  <div class="col-12">
                    <input v-bind:disabled="isActive" class='form-control' :class="companyCodeClass" v-model="companyCode">
                    <div class="invalid-feedback">
                      {{companyCodeError}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-sm-12 col-md-6">
              <div class="form-group">
                <div class="row">
                  <div class="col-12">
                    <label>Nature of Business</label>
                  </div>
                  <div class="col-12">
                    <input v-bind:disabled="isActive" class='form-control' :class="natureOfBusinessClass" v-model="natureOfBusiness">
                    <div class="invalid-feedback">
                      {{natureOfBusinessError}}
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="row">
                  <div class="col-12">
                    <label>Company Address</label>
                  </div>
                  <div class="col-12">
                    <input v-bind:disabled="isActive" class='form-control' :class="companyAddressClass" v-model="companyAddress">
                    <div class="invalid-feedback">
                      {{companyAddressError}}
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <div class="row">
                  <div class="col-12">
                    <label>Company Number</label>
                  </div>
                  <div class="col-12">
                    <input v-bind:disabled="isActive" class='form-control' :class="companyNumberClass" v-model="companyNumber">
                    <div class="invalid-feedback">
                      {{companyNumberError}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-12 text-right">
              <div class="form-group">
                <div v-if="isActive==true">
                  <div class="row">
                    <div class="col-12">
                      <button @click="stateSwitch()" align="center" type="button" class="btn btn-outline-primary" :class="btnEditClass"><fa icon="edit" /> Edit Details</button>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div class="row">
                    <div class="col-12">
                      <button @click="save()" align="center" type="button" class="btn btn-outline-success" :class="btnSaveClass" :disabled="isAllValid == 5 ? false : true"><fa icon="check"/> Save</button>
                      <button @click="discard()" align="center" type="button" class="btn btn-outline-secondary ml-2" :class="btnCancelClass"><fa icon="times"/> Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
export default {
  mounted(){
    this.retrieveDetail()
  },
  data(){
    return{
      companyDetailId: '',
      companyCode: '',
      companyName: '',
      natureOfBusiness: '',
      companyAddress: '',
      companyNumber: '',
      companyNameError: '',
      companyCodeError: '',
      natureOfBusinessError: '',
      companyAddressError: '',
      companyNumberError: '',
      isActive: true,
      companyNameClass: '',
      companyCodeClass: '',
      natureOfBusinessClass: '',
      companyAddressClass: '',
      companyNumberClass: '',
      btnSaveClass: '',
      btnCancelClass: '',
      btnEditClass: 'invisible',
      cnValid: 0,
      nobValid: 0,
      caValid: 0,
      cnumValid: 0,
      ccValid: 0,
      isAllValid: 0,
      prompt: '',
      feedback: '',
      temp: {
        cname: '',
        nob: '',
        address: '',
        number: '',
        code: ''
      }
    }
  },
  watch: {
    companyName: function (val) {
      if((this.companyName.length) >= 4) {
        this.companyNameClass = 'is-valid'
        this.cnValid = 1
      } else {
        this.companyNameClass = 'is-invalid'
        this.cnValid = 0
        this.companyNameError = 'Must have at least 4 characters'
      }
      if(!this.companyName.length) {
        this.companyNameClass = 'is-invalid'
        this.cnValid = 0
        this.companyNameError = 'This is required'
      }
    },
    natureOfBusiness: function (val){
      if((this.natureOfBusiness.length) >= 4){
        this.natureOfBusinessClass = 'is-valid'
        this.nobValid = 1
      }else{
        this.natureOfBusinessClass = 'is-invalid'
        this.nobValid = 0
        this.natureOfBusinessError = 'Must have at least 4 characters'
      }
      if(!this.natureOfBusiness.length){
        this.natureOfBusinessClass = 'is-invalid'
        this.nobValid = 0
        this.natureOfBusinessError = 'This is required'
      }
    },
    companyAddress: function (val){
      if((this.companyAddress.length) >= 4){
        this.companyAddressClass = 'is-valid'
        this.caValid = 1
      }else{
        this.companyAddressClass = 'is-invalid'
        this.caValid = 0
        this.companyAddressError = 'Must have at least 4 characters'
      }
      if(!this.companyAddress.length){
        this.companyAddressClass = 'is-invalid'
        this.caValid = 0
        this.companyAddressError = 'This is required'
      }
    },
    companyCode: function (val){
      if((this.companyCode.length) >= 4){
        this.companyCodeClass = 'is-valid'
        this.ccValid = 1
      }else{
        this.companyCodeClass = 'is-invalid'
        this.ccValid = 0
        this.companyCodeError = 'Must have at least 4 characters'
      }
      if(!this.companyCode.length){
        this.companyCodeClass = 'is-invalid'
        this.ccValid = 0
        this.companyCodeError = 'This is required'
      }
      if((this.companyCode.length) > 20){
        this.companyCodeClass = 'is-invalid'
        this.ccValid = 0
        this.companyCodeError = 'Maximum character exceeded'
      }
    },
    companyNumber: function (val){
      if((this.companyNumber.length) >= 4){
        this.companyNumberClass = 'is-valid'
        this.cnumValid = 1
      }else{
        this.companyNumberClass = 'is-invalid'
        this.cnumValid = 0
        this.companyNumberError = 'Must have at least 4 characters'
      }
      if(!this.companyNumber.length){
        this.companyNumberClass = 'is-invalid'
        this.cnumValid = 0
        this.companyNumberError = 'This is required'
      }
    },
    ccValid: function (){
      if(this.cnumValid === 1 && this.caValid === 1 && this.nobValid === 1 && this.cnValid === 1 && this.ccValid === 1){
        this.isAllValid = 5
      }else{
        this.isAllValid = 0
      }
    }
  },
  methods: {
    stateSwitch(action){
      if(!action) {
        this.prepEdit()
      }
      this.isActive = !this.isActive
    },
    save() {
      this.updateDetail()
      this.prompt = 'alert-light'
      this.feedback = 'Loading. Please wait'
      this.btnSaveClass = 'invisible'
      this.btnCancelClass = 'invisible'
      setTimeout(() => this.resetInputClass(), 200)
    },
    resetInputClass(){
      this.companyNumberClass = ''
      this.companyAddressClass = ''
      this.natureOfBusinessClass = ''
      this.companyNameClass = ''
      this.companyCodeClass = ''
    },

    discard(){
      this.valRevert()
      this.tempClear()
      this.prompt = 'alert-secondary'
      this.feedback = 'Changes have been discarded'
      setTimeout(() => { this.prompt = 'invisible' }, 700)
      setTimeout(() => this.resetInputClass(), 200)
      this.stateSwitch('cancel')
    },
    prepEdit(){
      this.temp.cname = this.companyName
      this.temp.nob = this.natureOfBusiness
      this.temp.address = this.companyAddress
      this.temp.number = this.companyNumber
      this.temp.code = this.companyCode
    },
    tempClear(){
      this.temp.cname = ''
      this.temp.nob = ''
      this.temp.address = ''
      this.temp.number = ''
      this.temp.code = ''
    },
    valRevert(){
      this.companyName = this.temp.cname
      this.natureOfBusiness = this.temp.nob
      this.companyAddress = this.temp.address
      this.companyNumber = this.temp.number
      this.companyCode = this.temp.code
    },
    retrieveDetail(){
      let param = {
        id: UserStore.getters.companyInformation.id,
        select: {
          0: 'name',
          1: 'code',
          company_detail: {
            select: ['nature', 'address', 'contact_number']
          }
        }
      }
      this.apiRequest('company/retrieve', param, (response) => {
        console.log(response)
        if(!response['error']){
          this.prompt = 'invisible'
          this.btnEditClass = ''
          this.companyName = response.data.name
          this.companyCode = response.data.code
          this.natureOfBusiness = response.data.company_detail.nature
          this.companyAddress = response.data.company_detail.address
          this.companyNumber = response.data.company_detail.contact_number
          this.companyDetailId = response.data.company_detail.id
        }
        setTimeout(() => {
          this.resetInputClass()
        }, 100)
      })
    },
    updateDetail(){
      let param = {
        id: UserStore.getters.companyInformation.id,
        name: this.companyName,
        code: this.companyCode,
        company_detail: {
          id: this.companyDetailId,
          nature: this.natureOfBusiness,
          address: this.companyAddress,
          contact_number: this.companyNumber
        }
      }
      this.apiRequest('company/update', param, (response) => {
        console.log(response)
        this.tempClear()
        this.prompt = 'alert-success'
        this.feedback = 'Changes have been saved'
        this.btnSaveClass = ''
        this.btnCancelClass = ''
        this.resetInputClass()
        setTimeout(() => { this.prompt = 'invisible' }, 700)
        this.stateSwitch('save')
      }, (errorResponse) => {
        this.prompt = 'alert-warning'
        this.feedback = 'Changes have been saved'
        setTimeout(() => { this.prompt = 'invisible' }, 700)
        this.btnSaveClass = ''
        this.btnCancelClass = ''
        if(errorResponse.error.code === 1){
          for(let key in errorResponse.error.message){
            if(key === 'name') {
              errorResponse.error.message[key].forEach(element => {
                this.companyNameError = element
                this.companyNameClass = this.inputClass.invalid
                this.cnValid = 0
              })
            }
            if(key === 'code') {
              errorResponse.error.message[key].forEach(element => {
                this.companyCodeError = element
                this.companyCodeClass = 'form-control is-invalid'
                this.ccValid = 0
              })
            }
            if(key === 'company_detail.nature'){
              errorResponse.error.message[key].forEach(element => {
                this.natureOfBusinessError = element
                this.natureOfBusinessClass = this.inputClass.invalid
                this.nobValid = 0
              })
            }
            if(key === 'company_detail.address'){
              errorResponse.error.message[key].forEach(element => {
                this.companyAddressError = element
                this.companyAddressClass = this.inputClass.invalid
                this.caValid = 0
              })
            }
            if(key === 'company_detail.contact_number'){
              errorResponse.error.message[key].forEach(element => {
                this.companyNumberError = element
                this.companyNumberClass = this.inputClass.invalid
                this.cnumValid = 0
              })
            }
          }
        }
      }
      )
    }

  }
}
</script>
<style scoped>
  input{
    background: white!important;
  }
</style>
