<template>
  <div >
    <h4 class="text-center">X Reading</h4>
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
import Transaction from '@/database/controller/transaction.js'
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
        groupBy: 'id',
        with: {
          transaction_products: {
          }
        },
        join: {
          with: 'transaction_numbers',
          on: 'transactions.transaction_number_id=transaction_numbers.id',
          type: 'inner',
          as: {
            'id': 'transaction_number_id',
            'db_id': 'transaction_number_db_id',
            'created_at': 'transaction_number_created_at',
            'updated_at': 'transaction_number_updated_at',
            'deleted_at': 'transaction_number_deleted_at',
          }
        }
      }
      let transactionNumberWhereQuery = JSON.parse(JSON.stringify(query.where))
      if(cashierId){
        transactionNumberWhereQuery['user_id'] = cashierId
        // query.where['transaction_numbers.user_id'] = {'=': transactionNumberWhereQuery['user_id']}
      }
      this.reset()
      return new Promise((resolve, reject) => {
        this.getTransactionNumber(transactionNumberWhereQuery).then(transactionNumbers => {
          if(!transactionNumbers.length){
            resolve(null)
            return false
          }else{
          }
          let transactionNumberIds = this.getTransactionNumberId(transactionNumbers)
          console.log('transactionNumberIds', transactionNumberIds)
          query.where['transaction_numbers_id'] = {
            in: transactionNumberIds
          }
          let transactionQuery = {
            where: {
              transaction_number_id: {
                in: transactionNumberIds
              }
            }
          }
          this.getTransactions(transactionQuery).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
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
    getTransactions(query){
      let transactionDB = new Transaction()
      return new Promise((resolve, reject) => {
        query['with'] = {
          transaction_products: {}
        }
        transactionDB.get(query).then((response) => {
          this.salesTransactionCount = response.length
          for(let x = 0; x < response.length; x++){
            this.vatSales += response[x]['total_vat_sales'] * 1
            this.vatExemptSales += response[x]['total_vat_exempt_sales'] * 1
            this.vatZeroRatedSales += response[x]['total_vat_zero_rated_sales'] * 1
            this.vatAmount += response[x]['total_vat_amount'] * 1
            this.totalDiscount += response[x]['total_discount_amount'] * 1
            this.reprintTransactionCount += response[x]['total_vat_sales'] * 1
            if(response[x]['status'] === 2){
              ++this.voidedTransactionCount
            }
            let transactionProducts = response[x]['transaction_products']
            for(let y = 0; y < transactionProducts.length; y++){
              let discountId = transactionProducts[y]['discount_id']
              if(discountId){
                Vue.set(this.discountAmounts[discountId], 'amount', this.discountAmounts[discountId]['amount'] + transactionProducts[y]['discount_amount'])
              }
            }
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getTransactionNumber(whereCondition){
      let query = {
        where: whereCondition,
        order: {
          by: 'created_at',
          type: 'asc'
        }
      }
      let transactionNumberDB = new TransactionNumber()
      return new Promise((resolve, reject) => {
        transactionNumberDB.get(query).then(response => {
          if(response.length){
            this.initialTransactionNumber = response[0]['id']
            this.finalTransactionNumber = response[response.length - 1]['id']
          }
          resolve(response)
        })
      })
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
