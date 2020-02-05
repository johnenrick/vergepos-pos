<template>
  <div>
    <modal ref="modal" :closeable="false">
      <template v-slot:body>
        <div class="mb-1 pb-2 border-bottom border-secondary rounded">
          <h5>Test Configuration</h5>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Open Time</label>
            <div class="col-sm-8">
              <input :value="openTime / 3600" type="text" readonly class="form-control-plaintext text-right" >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Close Time</label>
            <div class="col-sm-8">
              <input :value="closeTime / 3600" type="text" readonly class="form-control-plaintext text-right" >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Total Days</label>
            <div class="col-sm-8">
              <input v-model="totalDays" type="text" class="form-control text-right" >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Min Txn Per Day</label>
            <div class="col-sm-8">
              <input v-model="minTransactionPerDay" type="text" class="form-control text-right" >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-4 col-form-label">Max Txn Per Day</label>
            <div class="col-sm-8">
              <input v-model="maxTransactionPerDay" type="text" class="form-control text-right" >
            </div>
          </div>
        </div>
        {{isTesting}}
        <div v-show="!isTesting" class="text-center">
          <button @click="benchmark" class="btn btn-primary mr-1">Start Benchmark</button>
          <button @click="close" class="btn btn-outline-secondary ">Close</button>

        </div>
        <div class="text-center p-2">
          Total Transactions to Create: <strong>{{totalTransactionToCreate}}</strong><br>
          Total Transactions Created: <strong>{{totalTransactionCreated}}</strong>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import Cart from '../cart-store.js'
import Transaction from '../transact.js'
import Product from '@/database/controller/product'
export default {
  components: {
    Modal
  },
  mounted(){
    this.initialize()
  },
  data(){
    return {
      openTime: 27000000, // 7:30am open time
      closeTime: 79200000, // 10:00pm close time
      maxTransactionPerDay: 3,
      minTransactionPerDay: 1,
      totalDays: 2, // number of days to create
      productList: [],
      transaction: new Transaction(),
      totalTransactionToCreate: 0,
      totalTransactionCreated: 0,
      checkerTimeout: null,
      isTesting: false,
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    },
    close(){
      this.$refs.modal._close()
    },
    initialize(){
      (new Product()).get().then(result => {
        this.productList = result
      })
    },
    benchmark(){
      this.isTesting = true
      setTimeout(this.populateTransaction, 2000)
    },
    populateTransaction(){
      this.isTesting = true
      let maxTransactionPerDay = this.maxTransactionPerDay
      let minTransactionPerDay = this.minTransactionPerDay
      let totalDays = this.totalDays + 1
      let currentDate = new Date()
      this.totalTransactionToCreate = 0
      this.totalTransactionCreated = 0
      let transactions = []
      let totalTransaction = 0
      while(totalDays--){
        let startDate = new Date()
        startDate.setDate(currentDate.getDate() - totalDays)
        startDate.setHours(0)
        startDate.setMinutes(0)
        startDate.setSeconds(0)
        let numberOfTransaction = this.generateRandomNumber(minTransactionPerDay, maxTransactionPerDay)
        totalTransaction += numberOfTransaction
        this.thread(() => {
          this.totalTransactionToCreate = totalTransaction
        })
        let dates = this.generateDates(startDate, numberOfTransaction)
        for(let x = 0; x < numberOfTransaction; x++){
          let transactionData = this.generateTransactionData(dates[x].getTime())
          transactions.push(transactionData)
        }
      }
      for(let x = 0; x < transactions.length; x++){
        this.createTransaction(transactions[x])
        setTimeout(() => {
          this.totalTransactionCreated++
          this.checkIfComplete()
        }, 100)
      }
    },
    generateTransactionData(date){
      let transaction = {
        created_at: date,
        order_list: []
      }
      let maxProduct = this.generateRandomNumber(1, 50)
      while(maxProduct--){
        let productIndex = this.generateRandomNumber(0, this.productList.length - 1)
        let order = {
          product_id: this.productList[productIndex]['db_id'],
          product_detail: this.productList[productIndex],
        }
        transaction['order_list'].push(order)
      }
      return transaction
    },
    async createTransaction(transaction){
      Cart.commit('reset')
      for(let x = 0; x < transaction['order_list'].length; x++){
        Cart.commit('addItem', transaction['order_list'][x])
      }
      let result = await this.transaction.transact({
        customer: 'Guest',
        total_amount: Cart.state.totalAmount,
        total_vat_sales: Cart.state.totalVatSales,
        total_vat_exempt_sales: Cart.state.totalVatExemptSales,
        total_vat_zero_rated_sales: Cart.state.totalVatZeroRatedSales,
        total_vat_amount: Cart.state.totalVatAmount,
        total_discount_amount: Cart.state.totalDiscountAmount,
        sub_total_amount: Cart.state.subTotalAmount,
        cash_tendered: Cart.state.totalAmount,
        cash_amount_paid: Cart.state.totalAmount,
        discount_id: Cart.state.discountId,
        discount_remarks: Cart.state.discountRemarks,
        created_at: transaction['created_at'],
      }, Cart.state.items)
      Cart.commit('setLatestTransactionNUmber', result['number'])
      Cart.commit('reset')
    },
    checkIfComplete(){
      clearTimeout(this.checkerTimeout)
      this.checkerTimeout = setTimeout(() => {
        if(this.totalTransactionToCreate === this.totalTransactionCreated){
          this.isTesting = false
        }
      }, 2000)
    },
    generateDates(date, numberOfTransaction){
      let dates = []
      while(numberOfTransaction--){
        let newDate = new Date(date.getTime() + this.generateRandomNumber(this.openTime, this.closeTime))
        dates.push(newDate)
      }
      return dates
    }
  }
}
</script>
