<template>
  <div
    ref="modal"
    class="modal"
    tabindex="-1"
    role="dialog"
  >
    <div
      class="modal-dialog"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header py-2">
          <h5 class="modal-title">
            <fa :icon="'shopping-cart'" /> Check Out
          </h5>
          <a
            href="#"
            data-dismiss="modal"
            class="pt-1"
          >
            <fa :icon="'times'" />
          </a>
        </div>
        <div class="modal-body">
          <div v-show="!showMorePaymentMethods">
            <div v-if="customers.length" class="row">
              <label class="col-6 col-sm-6 col-form-label text-right font-weight-bold">Customer: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="customers[0]['name']"
                >
              </div>
            </div>
            <div class="row">
              <label class="col-6 col-sm-6 col-form-label text-right font-weight-bold">Sub Total: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="subTotal | numberToMoney"
                >
              </div>
            </div>

            <div class=" row">
              <label class="col-6 col-sm-6 col-form-label text-right ">VAT Sales: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="totalVatSales | numberToMoney"
                >
              </div>
            </div>
            <div class="row">
              <label class="col-6 col-sm-6 col-form-label text-right">VAT Exempt Sales: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="totalVatExempt | numberToMoney"
                >
              </div>
            </div>
            <div class="row">
              <label class="col-6 col-sm-6 col-form-label text-right ">VAT({{taxPercentage}}): </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="totalVatAmount | numberToMoney"
                >
              </div>
            </div>
            <div class="row">
              <label class="col-6 col-sm-6 col-form-label text-right">Total Discount: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  :value="totalDiscountAmount | numberToMoney"
                >
              </div>
            </div>
            <div class="row ">
              <label class="col-6 col-sm-6 col-form-label form-control-lg text-right font-weight-bold">Total Payable:</label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right font-weight-bold form-control-lg"
                  :value="totalAmount | numberToMoney"
                >
              </div>
            </div>
            <div class="row">
              <label class="col-6 col-sm-6 col-form-label text-right font-weight-bold">Cash Payment: </label>
              <div class="col-6 col-sm-4 text-right">
                <number-input :default-value="0" :current-value="cashPayment" :is-decimal="true" @change="cashPayment = $event"/>
                <small @click="showMorePaymentMethods = true" class="text-info c-pointer text-hover-underline">More Payment Methods</small>
              </div>
            </div>
            <template v-for="paymentMethod in paymentMethods">
              <div class=" row">
                <label class="col-6 col-sm-6 col-form-label text-right ">{{paymentMethod['description']}}: </label>
                <div class="col-6 col-sm-4">
                  <input
                    type="text"
                    readonly="readonly"
                    class="form-control-plaintext text-right"
                    :value="paymentMethod['amount'] | numberToMoney"
                  >
                </div>
              </div>
            </template>
            <div class="form-group row">
              <label class="col-6 col-sm-6 col-form-label text-right font-weight-bold">Change: </label>
              <div class="col-6 col-sm-4">
                <input
                  type="text"
                  readonly="readonly"
                  class="form-control-plaintext text-right"
                  v-bind:class="totalAmount > totalPaid ? 'text-danger' : ''"
                  :value="(totalPaid - totalAmount) * 1 | numberToMoney"
                >
              </div>
            </div>
            <div class="pt-3 pb-0 text-center border-top">
              <template v-if="!transacting">
                <button @click="changeTogglePrintState" :class="printOnCheckOut?'btn btn-primary':'btn btn-outline-primary'" style="float: left">
                  <span><fa icon="print"></fa></span>
                </button>
                <button
                  v-bind:disabled="totalAmount > totalPaid"
                  @click="checkout"
                  type="button"
                  class="btn btn-lg btn-success"
                >
                  Check Out <fa :icon="'arrow-right'" />
                </button>
              </template>
              <template v-else-if="transacting">
                <span v-if="transactionStatus === null" class="font-weight-bold">Please wait...</span>
                <span v-if="transactionStatus === true" class="font-weight-bold text-success">Transaction Succesful!</span>
              </template>
            </div>
          </div>
          <OtherPaymentMethod ref="otherPaymentMethod" v-show="showMorePaymentMethods" @change="otherPaymentMethodChange" />
        </div>
      </div>
    </div>
    <div hidden>
      <Receipt ref="receipt"></Receipt>
    </div>
  </div>
</template>
<script>
// import Vue from 'vue'
import Cart from '../cart-store'
import NumberInput from '@/components/NumberInput'
import Transaction from '../transact.js'
import Receipt from '@/components/Receipt'
import OtherPaymentMethod from './checkout-components/OtherPaymentMethod'
export default {
  mounted() {
    this.getPrintOnCheckOutLocalState()
  },
  components: {
    NumberInput,
    Receipt,
    OtherPaymentMethod
  },
  props: {
    subTotal: Number,
    totalVatSales: Number,
    totalVatExempt: Number,
    totalVatAmount: Number,
    totalAmount: Number,
    totalDiscountAmount: Number,
    appliedDiscountID: [Number]
  },
  data () {
    return {
      showMorePaymentMethods: false,
      cashPayment: 0,
      taxPercentage: (Cart.state.taxPercentage * 100) + '%',
      transaction: new Transaction(),
      transacting: false,
      transactionStatus: null,
      printOnCheckOut: false,
      paymentMethods: []
    }
  },
  methods: {
    otherPaymentMethodChange(otherPayments){
      this.paymentMethods = otherPayments
      this.showMorePaymentMethods = false
    },
    getPrintOnCheckOutLocalState (){
      if(localStorage.getItem('printOnCheckOut') !== null){
        if(localStorage.getItem('printOnCheckOut') === 'false'){
          this.printOnCheckOut = false
        } else{
          this.printOnCheckOut = true
        }
      }
    },
    changeTogglePrintState (){
      this.printOnCheckOut = !this.printOnCheckOut
      localStorage.setItem('printOnCheckOut', this.printOnCheckOut)
    },
    checkout () {
      this.transacting = true
      this.transactionStatus = null
      let paymentMethods = []
      this.paymentMethods.forEach(paymentMethod => {
        paymentMethods.push({
          payment_method_id: paymentMethod['id'],
          amount: paymentMethod['amount'],
          remarks: paymentMethod['remarks']
        })
      })
      const change = (this.totalPaid - Cart.state.totalAmount)
      let cashAmountPaid = this.cashPayment ? this.cashPayment - change : 0
      if(this.totalPaid > Cart.state.totalAmount){ // if the total paid is greater than the total amount
        cashAmountPaid = this.cashPayment - change // if the
        cashAmountPaid = cashAmountPaid > 0 ? cashAmountPaid : 0
      }
      this.transaction.transact({
        customer: 'Guest',
        total_amount: Cart.state.totalAmount,
        total_vat_sales: Cart.state.totalVatSales,
        total_vat_exempt_sales: Cart.state.totalVatExemptSales,
        total_vat_zero_rated_sales: Cart.state.totalVatZeroRatedSales,
        total_vat_amount: Cart.state.totalVatAmount,
        total_discount_amount: Cart.state.totalDiscountAmount,
        sub_total_amount: Cart.state.subTotalAmount,
        cash_tendered: this.cashPayment,
        cash_amount_paid: cashAmountPaid,
        discount_id: Cart.state.discountId,
        discount_remarks: Cart.state.discountRemarks,
        customers: Cart.state.customers,
        transaction_payments: paymentMethods
      }, JSON.parse(JSON.stringify(Cart.getters.items))).then((response) => {
        Cart.commit('setLatestTransactionNUmber', response['number'])
        this.transactionStatus = true
        let funcCallback = () => {
          this.$refs.receipt.print()
        }
        if(this.printOnCheckOut === true){
          this.$refs.receipt._view(response['number']).then(funcCallback)
        }
        setTimeout(() => {
          this.$emit('transaction-created', response)
          $(this.$refs.modal).modal('hide')
          this._reset()
          Cart.commit('reset')
        }, 800)
      }).catch(error => {
        console.error('Checkout Transact Error', error)
        this.transacting = false
      })
    },
    _open () { // open the modal
      this.showMorePaymentMethods = false
      $(this.$refs.modal).modal('show')
    },
    _reset(){
      this.transacting = false
      this.transactionStatus = null
      this.cashPayment = 0
      this.showMorePaymentMethods = false
      this.paymentMethods = []
      this.$refs.otherPaymentMethod._reset()
    }
  },
  computed: {
    totalPaid(){
      let totalPaid = this.cashPayment
      this.paymentMethods.forEach(paymentMethod => {
        totalPaid += paymentMethod['amount']
      })
      return totalPaid
    },
    customers(){
      return Cart.getters.customers
    }
  }
}
</script>
