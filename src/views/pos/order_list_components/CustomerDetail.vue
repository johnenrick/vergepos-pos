<template>
  <div>
    <modal ref="modal" title="Customer Details" icon="user-friends">
      <template slot="body">
        <div class="mb-2" style="min-height: 100px">
          <div class="mb-3">
            <select2 placeholder="Type Customer Name" :value="selectText" :options="selectOptions" @search="userTyping" @input="valueChanged" ></select2>
          </div>
          <h4 v-if="!selectValue">New Customer</h4>
          <CommonForm ref="customerForm" :config="formConfig" :mode="selectValue !== 0 || selectValue === -1 ? 'view' : ''" />
          <button v-if="selectValue !== -1" @click="save" class="btn btn-primary float-right">{{selectValue === 0 ? 'Save and ' : ''}}Set Customer</button>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import 'vue-select/dist/vue-select.css'
import select2 from 'vue-select'
import Customer from '@/database/controller/customer'
import CommonForm from '@/vue-web-core/components/form/Form'
import CartStore from '../cart-store'
export default {
  components: {
    Modal,
    select2,
    CommonForm
  },
  data(){
    return {
      selectOptions: [],
      selectValue: -1, // -1 empty, 0 - create new
      selectText: '',
      existingCustomerData: {},
      isTypingTimer: 0,
      formConfig: {
        fields: {
          name: {},
          address: {},
          gender: {
            type: 'select',
            config: {
              options: [{
                value: 1,
                text: 'Male'
              }, {
                value: 2,
                text: 'Female'
              }, {
                value: 3,
                text: 'Gay'
              }, {
                value: 4,
                text: 'Lesbian'
              }]
            }
          },
          birthdate: {
            name: 'Birthday',
            type: 'date',
            help_text: 'Who doesn\'t want to be greeted on their birthday?'
          },
          notes: {
          }
        }
      }
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
      this.selectText = ''
      if(CartStore.getters.customers.length){
        this.userTyping(CartStore.getters.customers[0]['name']).then(customers => {
          this.selectValue = CartStore.getters.customers[0]['id']
          this.$refs.customerForm._fillFormData({
            name: this.existingCustomerData[this.selectValue]['name'], // text from the select2 input
            address: this.existingCustomerData[this.selectValue]['address'],
            birthdate: this.existingCustomerData[this.selectValue]['birthdate'],
            gender: this.existingCustomerData[this.selectValue]['gender'],
            notes: this.existingCustomerData[this.selectValue]['notes']
          })
        })
      }
    },
    _reset(){
      this.selectExisting = true
      this.selectValue = -1
      this.$refs.customerForm._resetForm()
    },
    userTyping(typedText){
      this.selectText = typedText
      // TODO Update the option to have the following values: The typed value(for creating new), and the matching existing customer name
      clearTimeout(this.isTypingTimer)
      if(typedText.length < 3){
        this.selectOptions = []
        return false
      }
      return new Promise((resolve, reject) => {
        this.isTypingTimer = setTimeout(() => {
          this.selectOptions = []
          let customerDB = new Customer()
          customerDB.get({
            where: {
              name: {
                like: '%' + typedText + '%'
              }
            },
            limit: 5
          }).then(result => {
            if(result.length){
              result.forEach(customer => {
                this.existingCustomerData[customer['id']] = customer
                this.selectOptions.push({
                  label: customer['name'],
                  value: customer['id'],
                })
              })
              if(typedText.length){
                this.selectOptions.push({
                  label: 'Add "' + typedText + '" as New Customer',
                  value: 0,
                })
              }
            }else{
              if(typedText.length){
                this.selectOptions.push({
                  label: 'Add "' + typedText + '" as New Customer',
                  value: 0,
                })
              }
            }
            resolve(result.length)
          })
        }, 400)
      })
    },
    valueChanged(val){
      if(val === null){ // x or clear is pressed
        this.selectText = ''
        this.selectValue = -1
        this.$refs.customerForm._fillFormData({
          name: '', // text from the select2 input
          address: '',
          birthdate: null
        })
        this.setCustomer(null)
      }else if(val['value'] === 0){ // selected add new customer
        this.selectValue = val['value']
        this.selectExisting = false
        this.$refs.customerForm._fillFormData({
          name: this.selectText, // text from the select2 input
          address: '',
          birthdate: null,
          gender: null,
          notes: '',
        })
      }else{ // selecting from existing customer
        this.selectValue = val['value']
        this.$refs.customerForm._fillFormData({
          name: this.existingCustomerData[val['value']]['name'], // text from the select2 input
          address: this.existingCustomerData[val['value']]['address'],
          birthdate: this.existingCustomerData[val['value']]['birthdate'],
          gender: this.existingCustomerData[val['value']]['gender'],
          notes: this.existingCustomerData[val['value']]['notes'],
        })
      }
      // TODO if the val is null, then create new customer, else use the selected customer
    },
    save(){
      if(this.selectValue){
        this.setCustomer(this.selectValue, this.existingCustomerData[this.selectValue]['name'], this.existingCustomerData[this.selectValue]['db_id'])
      }else{
        let customer = this.$refs.customerForm._getFormData()
        if(customer['birthdate']){
          customer['birthdate'] = (new Date(customer['birthdate'])).getTime()
        }
        customer['gender'] = customer['gender'] * 1
        customer['db_id'] = 0;
        (new Customer()).add(customer).then(result => {
          if(result){
            this.setCustomer(result['id'], customer['name'], customer['db_id'])
          }
        })
      }
    },
    setCustomer(customerId, name, dbID = 0){
      if(customerId){
        CartStore.commit('setCustomers', { id: customerId, name: name, db_id: dbID })
        this.$refs.modal._close()
      }else{
        CartStore.commit('clearCustomers')
      }
    }
  }
}
</script>
<style>

</style>
