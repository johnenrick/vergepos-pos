<template>
  <div >
    <reading-template
      ref="ReadingTemplate"
      :date="null"
      :firstTransactionDatetime="firstTransactionDatetime"
      :lastTransactionDatetime="lastTransactionDatetime"
      :vatSales="vatSales"
      :vatExemptSales="vatExemptSales"
      :vatZeroRatedSales="vatZeroRatedSales"
      :vatAmount="vatAmount"
      :discountAmounts="discountAmounts"
      :totalDiscount="totalDiscount"
      :paymentMethods="paymentMethods"
      :previousGrandTotal="previousGrandTotal"
      :voidedTransactionCount="voidedTransactionCount"
      :reprintTransactionCount="reprintTransactionCount"
      :salesTransactionCount="salesTransactionCount"
      :firstTransactionNumber="firstTransactionNumber"
      :lastTransactionNumber="lastTransactionNumber"
      :totalVoidedAmount="totalVoidedAmount"
      :hasGrandTotal="false"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import ReadingTemplate from './ReadingTemplate.vue'
import TransactionNumber from '@/database/controller/transaction-number.js'
import Discount from '@/database/controller/discount.js'
import PaymentMethod from '@/database/controller/payment-method.js'
export default {
  components: {
    ReadingTemplate
  },
  props: {
    offline: {
      type: Boolean,
      default: true
    }
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      totalVoidedAmount: 0,
      startDatetime: null,
      endDatetime: null,
      firstTransactionDatetime: null,
      lastTransactionDatetime: null,
      cashierId: null,
      storeTerminalId: null,
      vatSales: 0,
      vatExemptSales: 0,
      vatZeroRatedSales: 0,
      vatAmount: 0,
      discountAmounts: {},
      paymentMethods: {},
      totalDiscount: 0,
      previousGrandTotal: 0,
      voidedTransactionCount: 0,
      reprintTransactionCount: 0,
      salesTransactionCount: 0,
      firstTransactionNumber: 0,
      lastTransactionNumber: 0,
    }
  },
  methods: {
    _generate(startDatetime = null, endDatetime = null, cashierId = null, storeTerminalId = null){
      if(startDatetime === null){
        this.startDatetime = new Date()
        this.startDatetime.setHours(0, 0, 0)
      }
      this.storeTerminalId = storeTerminalId
      this.cashierId = cashierId
      this.startDatetime = startDatetime
      this.endDatetime = endDatetime
      if(this.offline){
        return this.offlineSource() // load data from iDB
      }else{
        return this.onlineSource() // load data from API
      }
    },
    offlineSource(){
      let createdAtCondition = {
        '>': this.startDatetime.getTime()
      }
      if(this.endDatetime){
        createdAtCondition['<='] = this.endDatetime.getTime()
      }
      let query = {
        where: {
          created_at: createdAtCondition
        },
        with: {
          transaction: {
            with: {
              transaction_products: {}
            }
          },
          transaction_void: {
            with: {
              transaction: {
                is_parent: true,
                with: {
                  transaction_products: {}
                }
              }
            }

          }
        },
        order: {
          by: 'number',
          type: 'asc'
        }
      }
      if(this.cashierId){
        query['where']['user_id'] = this.cashierId
      }
      this.reset()
      return new Promise((resolve, reject) => {
        let transactionNumberDB = new TransactionNumber()
        transactionNumberDB.get(query).then(transactionNumbers => {
          if(!transactionNumbers.length){
            resolve(null)
          }else{
            this.firstTransactionNumber = transactionNumbers[0]['number'] * 1
            this.lastTransactionNumber = transactionNumbers[transactionNumbers.length - 1]['number'] * 1
            this.firstTransactionDatetime = new Date(transactionNumbers[0]['created_at'])
            this.lastTransactionDatetime = new Date(transactionNumbers[transactionNumbers.length - 1]['created_at'])
            for(let x = 0; x < transactionNumbers.length; x++){
              if(transactionNumbers[x]['operation'] * 1 === 1 && typeof transactionNumbers[x]['transaction'] !== 'undefined' && transactionNumbers[x]['transaction']){ // transaction
                this.calculateTransactions(transactionNumbers[x]['transaction'])
              }else if(transactionNumbers[x]['operation'] * 1 === 2){ // voided transaction
                // TODO Do some calculations regarding voided transactions
                /* The voided transaction details can be found in transactionNumbers[x]['voided_transaction']['transaction'] */
                if(transactionNumbers[x]['transaction_void']['transaction']['total_amount']){
                  this.totalVoidedAmount = (this.totalVoidedAmount * 1) + (transactionNumbers[x]['transaction_void']['transaction']['total_amount'] * 1)
                }
                this.calculateTransactions(transactionNumbers[x]['transaction_void']['transaction'], true)
                ++this.voidedTransactionCount
              }
            }
            resolve(null)
          }
        }).finally(() => {
          resolve(null)
        })
      })
    },
    onlineSource(){
      let condition = [{
        column: 'created_at',
        clause: '>=',
        value: this.serverDatetimeFormat(this.startDatetime.getTime(), true)
      }]
      if(this.endDatetime){
        condition.push({
          column: 'created_at',
          clause: '<=',
          value: this.serverDatetimeFormat(this.endDatetime.getTime(), true)
        })
      }
      this.reset()
      let param = {
        select: {
          0: 'number',
          1: 'operation',
          2: 'user_id',
          3: 'store_terminal_id',
          4: 'created_at',
          5: 'updated_at',
          6: 'deleted_at',
          transaction: this.transactionSelectParameter(),
          transaction_void: {
            select: {
              0: 'transaction_number_id',
              1: 'transaction_id',
              2: 'remarks',
              3: 'created_at',
              4: 'voided_transaction_number',
              transaction: this.transactionSelectParameter()
            }
          }
        },
        condition: condition,
        sort: [{
          column: 'number',
          order: 'asc'
        }]
      }
      return new Promise((resolve, reject) => {
        this.apiRequest('transaction-number/retrieve', param, response => {
          let responseLength = response['data'].length
          if(!responseLength){
            resolve(null)
            return false
          }else{
            this.firstTransactionNumber = response['data'][0]['number'] * 1
            this.lastTransactionNumber = response['data'][responseLength - 1]['number'] * 1
            this.firstTransactionDatetime = new Date((new Date(response['data'][0]['created_at'])).getTime() + 28800)
            this.lastTransactionDatetime = new Date((new Date(response['data'][responseLength - 1]['created_at'])).getTime() + 28800)
            for(let x = 0; x < responseLength; x++){
              if(response['data'][x]['operation'] * 1 === 1 && typeof response['data'][x]['transaction'] !== 'undefined' && response['data'][x]['transaction']){ // transaction
                let transaction = {
                  total_vat_sales: response['data'][x]['transaction']['transaction_computation']['total_vat_sales'] * 1,
                  total_vat_exempt_sales: response['data'][x]['transaction']['transaction_computation']['total_vat_exempt_sales'] * 1,
                  total_vat_zero_rated_sales: response['data'][x]['transaction']['transaction_computation']['total_vat_zero_rated_sales'] * 1,
                  total_vat_amount: response['data'][x]['transaction']['transaction_computation']['total_vat_amount'] * 1,
                  total_discount_amount: response['data'][x]['transaction']['transaction_computation']['total_discount_amount'] * 1,
                  transaction_products: response['data'][x]['transaction']['transaction_products']
                }
                this.calculateTransactions(transaction)
              }else if(response['data'][x]['operation'] * 1 === 2){ // voided transaction
                // TODO Do some calculations regarding voided transactions
                /* The voided transaction details can be found in transactionNumbers[x]['voided_transaction']['transaction'] */
                if(transactionNumbers[x]['transaction_void']['transaction']['total_amount']){
                  this.totalVoidedAmount = (this.totalVoidedAmount * 1) + (transactionNumbers[x]['transaction_void']['transaction']['total_amount'] * 1)
                }
                ++this.voidedTransactionCount
              }else if(response['data'][x]['operation'] * 1 === 3){
                ++this.reprintTransactionCount
              }
            }
            resolve(null)
          }
        })
      })
    },
    _getPaymentMethodSummary(){
      return this.paymentMethods
    },
    printXReading(callback = null){
      this.$refs.ReadingTemplate.printXReading(callback)
    },
    getTransactionNumberId(transactionNumbers){
      let ids = []
      for(let x = 0; x < transactionNumbers.length; x++){
        ids.push(transactionNumbers[x]['id'])
      }
      return ids
    },
    calculateTransactions(transaction, isVoid = false){
      const negativeMultiplier = isVoid ? -1 : 1
      this.vatSales += transaction['total_vat_sales'] * negativeMultiplier
      this.vatExemptSales += transaction['total_vat_exempt_sales'] * negativeMultiplier
      this.vatZeroRatedSales += transaction['total_vat_zero_rated_sales'] * negativeMultiplier
      this.vatAmount += transaction['total_vat_amount'] * negativeMultiplier
      this.totalDiscount += transaction['total_discount_amount'] * negativeMultiplier
      let transactionProducts = typeof transaction['transaction_products'] === 'object' ? transaction['transaction_products'] : []
      for(let y = 0; y < transactionProducts.length; y++){
        let discountId = transactionProducts[y]['discount_id']
        if(discountId && typeof this.discountAmounts[discountId] !== 'undefined'){
          Vue.set(this.discountAmounts[discountId], 'amount', this.discountAmounts[discountId]['amount'] + (transactionProducts[y]['discount_amount'] * negativeMultiplier))
        }else{
          console.log('discountId', discountId, this.discountAmounts)
        }
      }
      const { transaction_payments: transactionPayments = [] } = transaction
      let totalOtherPay = 0
      transactionPayments.forEach(transactionPayment => {
        const paymentMethodId = transactionPayment['payment_method_id']
        totalOtherPay += (transactionPayment['amount'] * 1)
        const newPaymentMethodTotal = this.paymentMethods[paymentMethodId]['amount'] + transactionPayment['amount'] * 1
        Vue.set(this.paymentMethods[paymentMethodId], 'amount', newPaymentMethodTotal)
      })
      const newCashPaymentMethodTotal = this.paymentMethods[1]['amount'] + transaction['cash_amount_paid'] * negativeMultiplier - (isVoid ? totalOtherPay : 0) // 1 is the payment method id of cash payment
      Vue.set(this.paymentMethods[1], 'amount', newCashPaymentMethodTotal)
    },
    reset(){
      this.date = null
      this.firstTransactionDatetime = null
      this.lastTransactionDatetime = null
      this.vatSales = 0
      this.vatExemptSales = 0
      this.vatZeroRatedSales = 0
      this.vatAmount = 0
      this.totalDiscount = 0
      this.voidedTransactionCount = 0
      this.reprintTransactionCount = 0
      this.salesTransactionCount = 0
      this.firstTransactionNumber = 0
      this.lastTransactionNumber = 0
      this.totalVoidedAmount = 0
      for(let x in this.discountAmounts){
        Vue.set(this.discountAmounts, x, {
          description: this.discountAmounts[x]['description'],
          amount: 0
        })
      }
      for(let x in this.paymentMethods){
        Vue.set(this.paymentMethods, x, {
          description: this.paymentMethods[x]['description'],
          amount: 0
        })
      }
    },
    init(){
      let discountDB = new Discount()
      discountDB.get({}).then((response) => {
        for(let x = 0; x < response.length; x++){
          Vue.set(this.discountAmounts, response[x]['db_id'], {
            description: response[x]['description'],
            amount: 0
          })
        }
      })
      let paymentMethodDB = new PaymentMethod()
      paymentMethodDB.get().then((response) => {
        for(let x = 0; x < response.length; x++){
          Vue.set(this.paymentMethods, response[x]['id'], {
            description: response[x]['description'],
            amount: 0
          })
        }
      })
    },
    transactionSelectParameter(){
      return {
        select: {
          0: 'transaction_number_id',
          1: 'customer_id',
          2: 'status',
          3: 'cash_tendered',
          4: 'cash_amount_paid',
          5: 'discount_remarks',
          6: 'discount_id',
          7: 'created_at',
          transaction_products: {
            select: {
              0: 'transaction_id',
              1: 'product_id',
              2: 'quantity',
              3: 'vat_sales',
              4: 'vat_exempt_sales',
              5: 'vat_zero_rated_sales',
              6: 'vat_amount',
              7: 'discount_amount',
              8: 'created_at',
              11: 'cost'
            }
          },
          transaction_computation: {
            select: ['transaction_id', 'total_vat_sales', 'total_vat_exempt_sales', 'total_vat_zero_rated_sales', 'total_vat_amount', 'total_discount_amount']
          }
        }
      }
    }
  },
  computed: {
  },
  filters: {
    numberFormat: (value) => {
      return value.toFixed(2)
    }
  }
}
</script>
