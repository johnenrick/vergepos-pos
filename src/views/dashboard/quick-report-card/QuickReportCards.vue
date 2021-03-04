<template>
  <div>
    <div class="p-1"><h6 class="font-weight-bold text-uppercase">Today's Status on {{currentDate | formatDate('M d, yyyy hh:mm')}}</h6></div>
    <div v-if="isTerminal" class="row no-gutters mb-1">
      <div class="col-12 col-md-4 px-1 mb-2">
        <card icon="money-bill" description="Current Sales" :value="currentSales | numberToMoney" custom-class="bg-success" />
      </div>
      <div class="col-12 col-md-4 px-1 mb-2">
        <card icon="receipt" description="Transactions" :value="totalTransactions" custom-class="bg-info" />
      </div>
      <div class="col-12 col-md-4 px-1 mb-2">
        <card icon="box" description="Items Sold" :value="totalSold" custom-class="bg-warning" />
      </div>
      <div class="col-12 col-md-4 px-1 mb-2 mb-md-0">
        <card icon="money-bill" description="Sales per Hour" :value="salesPerHour | numberToMoney" custom-class="text-success border-success" />
      </div>
      <div class="col-12 col-md-4 px-1 mb-2 mb-md-0">
        <card icon="dot-circle" description="First Txn Time" :value="timeOfFirstTransaction" custom-class="text-info border-info" />
      </div>
      <div class="col-12 col-md-4 px-1">
        <card icon="flag-checkered" description="Last Txn Time" :value="timeOfLastTransaction" custom-class="text-warning border-warning" />
      </div>
    </div>
    <div v-else class="p-2  rounded">
      <fa icon="info-circle" /> You can only see Today's Status on Terminal Devices
    </div>
  </div>
</template>
<script>
import TransactionNumber from '@/database/controller/transaction-number'
import Card from './Card'
export default {
  components: {
    Card
  },
  data(){
    return{
      totalSold: 0,
      totalTransactions: 0,
      currentSales: 0,
      currentDate: new Date(),
      salesPerHour: 0,
      timeOfLastTransaction: '',
      timeOfFirstTransaction: '',
      isTerminal: localStorage.getItem('is_terminal')
    }
  },
  mounted(){
  },
  methods: {
    _initialize(){
      this.generateReport()
    },
    generateReport(){
      this.reset()
      this.currentDate = new Date()
      let startDateFilter = new Date()
      startDateFilter.setHours(0)
      startDateFilter.setMinutes(0)
      startDateFilter.setSeconds(1)
      let endDateFilter = new Date()
      endDateFilter.setHours(23)
      endDateFilter.setMinutes(59)
      endDateFilter.setSeconds(59)
      let query = {
        where: {
          created_at: {
            '>': startDateFilter.getTime(),
            '<=': endDateFilter.getTime(),
          },
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
          by: 'created_at',
          type: 'asc'
        }
      };
      (new TransactionNumber()).get(query).then((transactionNumbers) => {
        let timeDifference = 0
        this.totalTransactions = transactionNumbers.length
        if(transactionNumbers.length){
          this.timeOfFirstTransaction = this.fullDatetoTime(new Date(transactionNumbers[0]['created_at']))
          this.timeOfLastTransaction = this.fullDatetoTime(new Date(transactionNumbers[transactionNumbers.length - 1]['created_at']))
          timeDifference = transactionNumbers[transactionNumbers.length - 1]['created_at'] - transactionNumbers[0]['created_at']
          timeDifference = (((timeDifference / 1000) / 60) / 60)
        }else{
          this.timeOfFirstTransaction = 0
          this.timeOfLastTransaction = 0
        }
        transactionNumbers.forEach((transactionNumber) => {
          if(transactionNumber['operation'] === 1){
            const transaction = transactionNumber['transaction']
            this.currentSales = this.currentSales + (transaction['total_amount'] * 1)
            for(let y in transaction['transaction_products']){
              this.totalSold = this.totalSold + (transaction['transaction_products'][y]['quantity'] * 1)
            }
          }else{
            const transaction = transactionNumber['transaction_void']['transaction']
            this.currentSales = this.currentSales + (transaction['total_amount'] * -1)
            for(let y in transaction['transaction_products']){
              this.totalSold = this.totalSold + (transaction['transaction_products'][y]['quantity'] * -1)
            }
          }
        })

        this.salesPerHour = this.currentSales / (timeDifference < 1 ? 1 : timeDifference)
      })
    },
    reset(){
      this.totalSold = 0
      this.totalTransactions = 0
      this.currentSales = 0
      this.currentDate = ''
      this.salesPerHour = 0
      this.timeOfLastTransaction = ''
      this.timeOfFirstTransaction = ''
    },
    fullDatetoTime(timestamp){
      let date = new Date(timestamp)
      let hours = date.getHours()
      let minutes = date.getMinutes()
      return this.time12HourFormat(hours, minutes)
    }
  },

}
</script>
