<template>
  <div>
    <div class="mb-3">
      <p>Type the amount to be paid on the appropriate fields. Customers can pay using more than one payment method. Fields with no amount will be ignored</p>
      <template v-for="(paymentMethod, index) in paymentMethods">
        <div class="row mb-3">
          <label class="col-4 col-form-label text-right font-weight-bold text-uppercase"><fa v-if="paymentMethod['amount']" icon="check" class="text-success "/> {{paymentMethod['description']}}: </label>
          <div class="col-8 text-right">
            <number-input :default-value="0.00" :current-value="paymentMethods[index]['amount']" :is-decimal="true" @change="setValue(index, $event)"/>
          </div>
          <label v-show="paymentMethods[index]['amount'] * 1 > 0" class="col-4 col-form-label text-right font-italic">Remarks: </label>
          <div v-show="paymentMethods[index]['amount'] * 1 > 0" class="col-8 text-right pt-1">
            <textarea v-model="paymentMethods[index]['remarks']" class="form-control" placeholder="Type a note like bank details, account number, reference number, etc"></textarea>
          </div>
          <hr />
        </div>
      </template>
    </div>
    <div class="text-center">
      <div><fa icon="exclamation-triangle" /> Make sure the payment were successfully transferred or paid before checking out.</div>
      <button @click="goBack" class="btn btn-outline-dark"><fa icon="chevron-left" /> Go back</button>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import NumberInput from '@/components/NumberInput'
import PaymentMethod from '@/database/controller/payment-method'
export default {
  components: {
    NumberInput
  },
  mounted(){
    this._initialize()
  },
  data(){
    return {
      cashPayment: 0,
      paymentMethods: []
    }
  },
  methods: {
    goBack(){
      let paymentMethods = []
      this.paymentMethods.forEach(paymentMethod => {
        if(paymentMethod['amount']){
          paymentMethods.push(paymentMethod)
        }
      })
      this.$emit('change', paymentMethods)
    },
    setValue(paymentMethodIndex, amount){
      Vue.set(this.paymentMethods[paymentMethodIndex], 'amount', amount)
    },
    _initialize(){
      const paymentMethodDB = new PaymentMethod()
      paymentMethodDB.get().then(result => {
        result.shift()
        result.forEach((paymentMethod, index) => {
          result[index]['remarks'] = ''
          result[index]['amount'] = 0
        })
        this.paymentMethods = result
      })
    },
    _reset(){
      this.paymentMethods.forEach((paymentMethod, index) => {
        Vue.set(this.paymentMethods[index], 'remarks', '')
        Vue.set(this.paymentMethods[index], 'amount', 0)
      })
    }
  }
}
</script>
