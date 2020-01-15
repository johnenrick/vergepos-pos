<template>
  <div class="section">
    <h2>Business Details</h2>
    <div class="row justify-content-center">
      <div class='col'>
        <div class="card p-3">
          <div class="row justify-content-center">
            <div class="col-12">
                <div class="form-group">
                  <div v-bind:class="newClass" role="alert">
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
                    <input v-bind:disabled="isActive" :class="company_name_class" v-model="company_name">
                    <div class="invalid-feedback">
                      {{company_name_error}}
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
                    <input v-bind:disabled="isActive" :class="company_code_class" v-model="company_code">
                    <div class="invalid-feedback">
                      {{company_code_error}}
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
                    <input v-bind:disabled="isActive" :class="nature_of_business_class" v-model="nature_of_business">
                    <div class="invalid-feedback">
                      {{nature_of_business_error}}
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
                    <input v-bind:disabled="isActive" :class="company_address_class" v-model="company_address">
                    <div class="invalid-feedback">
                      {{company_address_error}}
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
                    <input v-bind:disabled="isActive" :class="company_number_class" v-model="company_number">
                    <div class="invalid-feedback">
                      {{company_number_error}}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-8 text-right">
              <div class="form-group">
                <div v-if="isActive==true">
                  <div class="row">
                    <div class="col-12">
                      <button @click="stateSwitch()" align="center" type="button" v-bind:class="btn_edit_class"><fa icon="edit" /> Edit Details</button>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div class="row">
                    <div class="col-12">
                      <button @click="save()" align="center" type="button" v-bind:class="btn_save_class" :disabled="isAllValid == 5 ? false : true"><fa icon="check"/> Save</button>
                      <button @click="discard()" align="center" type="button" v-bind:class="btn_cancel_class"><fa icon="times"/> Cancel</button>
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
      company_detail_id: '',
      company_code: '',
      company_name: '',
      nature_of_business: '',
      company_address: '',
      company_number: '',
      company_name_error: '',
      company_code_error: '',
      nature_of_business_error: '',
      company_address_error: '',
      company_number_error: '',
      isActive: true,
      company_name_class: 'form-control',
      company_code_class: 'form-control',
      nature_of_business_class: 'form-control',
      company_address_class: 'form-control',
      company_number_class: 'form-control',
      feedback: 'Loading. Please wait',
      newClass: 'alert alert-light',
      btn_save_class: 'btn btn-outline-success',
      btn_cancel_class: 'btn btn-outline-secondary ml-2',
      btn_edit_class: 'btn btn-outline-primary  invisible',
      cnValid: 0,
      nobValid: 0,
      caValid: 0,
      cnumValid: 0,
      ccValid: 0,
      isAllValid: 0,
      temp:{
        cname: '',
        nob: '',
        address: '',
        number: '',
        code: ''
      }
    }
  },
  watch:{
    company_name: function (val){
      if((this.company_name.length) >= 4){
        this.company_name_class = 'form-control is-valid'
        this.cnValid = 1
      }
      else{
        this.company_name_class = 'form-control is-invalid'
        this.cnValid = 0
        this.company_name_error = 'must have at least 4 characters'
      }
      if(!this.company_name.length){
        this.company_name_class = 'form-control is-invalid'
        this.cnValid = 0
        this.company_name_error = 'this is required'
      }
    },
    nature_of_business: function (val){
      if((this.nature_of_business.length) >= 4){
        this.nature_of_business_class = 'form-control is-valid'
        this.nobValid = 1
      }else{
        this.nature_of_business_class = 'form-control is-invalid'
        this.nobValid = 0
        this.nature_of_business_error = 'must have at least 4 characters'
      }
      if(!this.nature_of_business.length){
        this.nature_of_business_class = 'form-control is-invalid'
        this.nobValid = 0
        this.nature_of_business_error = 'this is required'
      }
    },
    company_address: function (val){
      if((this.company_address.length) >= 4){
        this.company_address_class = 'form-control is-valid'
        this.caValid = 1
      }else{
        this.company_address_class = 'form-control is-invalid'
        this.caValid = 0
        this.company_address_error = 'must have at least 4 characters'
      }
      if(!this.company_address.length){
        this.company_address_class = 'form-control is-invalid'
        this.caValid = 0
        this.company_address_error = 'this is required'
      }
    },
    company_code: function (val){
      if((this.company_code.length) >= 4){
        this.company_code_class = 'form-control is-valid'
        this.ccValid = 1
      }else{
        this.company_code_class = 'form-control is-invalid'
        this.ccValid = 0
        this.company_code_error = 'must have at least 4 characters'
      }
      if(!this.company_code.length){
        this.company_code_class = 'form-control is-invalid'
        this.ccValid = 0
        this.company_code_error = 'this is required'
      }
      if((this.company_code.length) > 20){
        this.company_code_class = 'form-control is-invalid'
        this.ccValid = 1
        this.company_code_error = 'maximum character exceeded'
      }
    },
    company_number: function (val){
      if((this.company_number.length) >= 4){
        this.company_number_class = 'form-control is-valid'
        this.cnumValid = 1
      }else{
        this.company_number_class = 'form-control is-invalid'
        this.cnumValid = 0
        this.company_number_error = 'must have at least 4 characters'
      }
      if(!this.company_number.length){
        this.company_number_class = 'form-control is-invalid'
        this.cnumValid = 0
        this.company_number_error = 'this is required'
      }
    },
    cnValid: function (){
      if(this.cnumValid == 1 && this.caValid == 1 && this.nobValid == 1 && this.cnValid == 1 && this.ccValid == 1){
        this.isAllValid = 5
      }else{
        this.isAllValid = 0
      }
    }
  },
  methods:{
    stateSwitch(action){
      if(!action){
      this.prepEdit()   
      }
      this.isActive = !this.isActive
    },
    save(){   
      this.updateDetail()
      this.newClass = 'alert alert-light'
      this.feedback = 'Loading. Please wait'
      this.btn_save_class = 'btn btn-outline-success invisible'
      this.btn_cancel_class = 'btn btn-outline-secondary ml-2 invisible'            
    },
    resetInputClass(){
      this.company_number_class = 'form-control'
      this.company_address_class = 'form-control'        
      this.nature_of_business_class = 'form-control'
      this.company_name_class = 'form-control '
      this.company_code_class = 'form-control'
    },

    discard(){
      this.valRevert()
      this.tempClear()
      this.resetInputClass()
      this.newClass = 'alert alert-secondary'
      this.feedback = 'Changes have been discarded'
      setTimeout(()=>this.newClass = 'alert invisible',700)
      this.stateSwitch("cancel")
    },
    prepEdit(){
      this.temp.cname = this.company_name
      this.temp.nob = this.nature_of_business
      this.temp.address = this.company_address
      this.temp.number = this.company_number
      this.temp.code = this.company_code
    },
    tempClear(){
      this.temp.cname = ''
      this.temp.nob = ''
      this.temp.address = ''
      this.temp.number = ''
      this.temp.code = ''
    },
    valRevert(){
      this.company_name = this.temp.cname 
      this.nature_of_business = this.temp.nob 
      this.company_address = this.temp.address 
      this.company_number = this.temp.number 
      this.company_code = this.temp.code
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
          this.newClass = 'alert alert-light invisible'
          this.btn_edit_class = "btn btn-outline-primary"
          this.company_name = response.data.name
          this.company_code = response.data.code
          this.nature_of_business = response.data.company_detail.nature
          this.company_address = response.data.company_detail.address
          this.company_number = response.data.company_detail.contact_number
          this.company_detail_id = response.data.company_detail.id
        }

        setTimeout(() => {
          this.resetInputClass()
        }, 200)
      })
    },
    updateDetail(){
      let param = {
        id: UserStore.getters.companyInformation.id,
        name: this.company_name,
        code: this.company_code,
        company_detail:{
          id: this.company_detail_id,
          nature: this.nature_of_business,
          address: this.company_address,
          contact_number: this.company_number
        }
      }
      this.apiRequest('company/update',param, (response) => {
        console.log(response)
        this.tempClear()
        this.newClass = 'alert alert-success'
        this.feedback = 'Changes have been saved'
        this.btn_save_class = 'btn btn-outline-success'
        this.btn_cancel_class = 'btn btn-outline-secondary ml-2'
        this.resetInputClass()
        setTimeout(()=>this.newClass = 'alert invisible',700)
        this.stateSwitch("save")
      },(errorResponse) => {
        this.newClass = 'alert alert-warning'
        this.feedback = 'Update failed'
        setTimeout(()=>this.newClass = 'alert invisible',700)
        this.btn_save_class = 'btn btn-outline-success'
        this.btn_cancel_class = 'btn btn-outline-secondary ml-2'    
        if(errorResponse.error.code == 1){
          for(let key in errorResponse.error.message){
            if(key == "name"){
              errorResponse.error.message[key].forEach(element => {
                this.company_name_error = element
                this.company_name_class = 'form-control is-invalid'
                this.cnValid = 0
              })
            }
            if(key == "code"){
              errorResponse.error.message[key].forEach(element => {
                this.company_code_error = element
                this.company_code_class = 'form-control is-invalid'
                this.ccValid = 0
              })
            }
            if(key == "company_detail.nature"){
              errorResponse.error.message[key].forEach(element => {
                this.nature_of_business_error = element
                this.nature_of_business_class = 'form-control is-invalid'
                this.nobValid = 0
              })
            }
            if(key == "company_detail.address"){
              errorResponse.error.message[key].forEach(element => {
                this.company_address_error = element
                this.company_address_class = 'form-control is-invalid'
                this.caValid = 0
              })
            }
            if(key == "company_detail.contact_number"){
              errorResponse.error.message[key].forEach(element => {
                this.company_number_error = element
                this.company_number_class = 'form-control is-invalid'
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
