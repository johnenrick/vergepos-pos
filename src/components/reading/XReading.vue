<template>
  <div >
    <reading-template
      ref="ReadingTemplate"
      :date="startDatetime"
      :vatSales="vatSales"
      :vatExemptSales="vatExemptSales"
      :vatZeroRatedSales="vatZeroRatedSales"
      :vatAmount="vatAmount"
      :discountAmounts="discountAmounts"
      :totalDiscount="totalDiscount"
      :previousGrandTotal="previousGrandTotal"
      :voidedTransactionCount="voidedTransactionCount"
      :reprintTransactionCount="reprintTransactionCount"
      :salesTransactionCount="salesTransactionCount"
      :initialTransactionNumber="initialTransactionNumber"
      :finalTransactionNumber="finalTransactionNumber"
      :hasGrandTotal="false"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import ReadingTemplate from './ReadingTemplate.vue'
import TransactionNumber from '@/database/controller/transaction-number.js'
import Discount from '@/database/controller/discount.js'
export default {
  components: {
    ReadingTemplate
  },
  props: {

  },
  mounted(){
    this.init()
  },
  data(){
    return {
      startDatetime: null,
      endDatetime: null,
      cashierId: null,
      vatSales: 0,
      vatExemptSales: 0,
      vatZeroRatedSales: 0,
      vatAmount: 0,
      discountAmounts: {

      },
      totalDiscount: 0,
      previousGrandTotal: 0,
      voidedTransactionCount: 0,
      reprintTransactionCount: 0,
      salesTransactionCount: 0,
      initialTransactionNumber: 0,
      finalTransactionNumber: 0
    }
  },
  methods: {
    _generate(startDatetime = null, endDatetime = null, cashierId = null){
      if(startDatetime === null){
        this.startDatetime = new Date()
        this.startDatetime.setHours(0, 0, 0)
      }
      this.startDatetime = startDatetime
      this.endDatetime = endDatetime

      let createdAtCondition = {
        '>': this.startDatetime.getTime()
      }
      if(endDatetime){
        createdAtCondition['<'] = this.endDatetime.getTime()
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
                is_parent: true
              }
            }

          }
        },
        order: {
          by: 'number',
          type: 'asc'
        }
      }
      this.reset()
      return new Promise((resolve, reject) => {
        let transactionNumberDB = new TransactionNumber()
        transactionNumberDB.get(query).then(transactionNumbers => {
          console.log(transactionNumbers)
          if(!transactionNumbers.length){
            resolve(null)
            return false
          }else{
            for(let x = 0; x < transactionNumbers.length; x++){
              if(transactionNumbers[x]['operation'] * 1 === 1 && typeof transactionNumbers[x]['transaction'] !== 'undefined' && transactionNumbers[x]['transaction']){ // transaction
                this.calculateTransactions(transactionNumbers[x]['transaction'])
              }else if(transactionNumbers[x]['operation'] * 1 === 2){ // voided transaction
                // TODO Do some calculations regarding voided transactions
                /* The voided transaction details can be found in transactionNumbers[x]['voided_transaction']['transaction'] */
                ++this.voidedTransactionCount
              }
            }
          }
        }).finally(() => {
          resolve(null)
        })
      })
    },
    printXReading(){
      this.$refs.ReadingTemplate.printXReading()
    },
    getTransactionNumberId(transactionNumbers){
      let ids = []
      for(let x = 0; x < transactionNumbers.length; x++){
        ids.push(transactionNumbers[x]['id'])
      }
      return ids
    },
    calculateTransactions(transaction){
      this.vatSales += transaction['total_vat_sales'] * 1
      this.vatExemptSales += transaction['total_vat_exempt_sales'] * 1
      this.vatZeroRatedSales += transaction['total_vat_zero_rated_sales'] * 1
      this.vatAmount += transaction['total_vat_amount'] * 1
      this.totalDiscount += transaction['total_discount_amount'] * 1
      this.reprintTransactionCount += transaction['total_vat_sales'] * 1
      let transactionProducts = transaction['transaction_products']
      for(let y = 0; y < transactionProducts.length; y++){
        let discountId = transactionProducts[y]['discount_id']
        if(discountId){
          Vue.set(this.discountAmounts[discountId], 'amount', this.discountAmounts[discountId]['amount'] + transactionProducts[y]['discount_amount'])
        }
      }
    },
    reset(){
      this.vatSales = 0
      this.vatExemptSales = 0
      this.vatZeroRatedSales = 0
      this.vatAmount = 0
      this.totalDiscount = 0
      this.voidedTransactionCount = 0
      this.reprintTransactionCount = 0
      this.salesTransactionCount = 0
      this.initialTransactionNumber = 0
      this.finalTransactionNumber = 0
      for(let x in this.discountAmounts){
        Vue.set(this.discountAmounts, x, {
          description: this.discountAmounts[x]['description'],
          amount: 0
        })
      }
    },
    init(){
      let discountDB = new Discount()
      discountDB.get({}).then((response) => {
        for(let x = 0; x < response.length; x++){
          Vue.set(this.discountAmounts, response[x]['id'], {
            description: response[x]['description'],
            amount: 0
          })
        }
      })
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
