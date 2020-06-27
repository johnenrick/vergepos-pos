<template>
  <div class="row no-gutters mb-1">
    <div class="col-12 p-1 text"><h6 class="font-weight-bold text-uppercase">Today's Status on {{currentDate | formatDate('M d, yyyy hh:mm')}}</h6></div>
    <div class="col-12 col-md-4 px-1">
      <card icon="money-bill" description="Current Sales" :value="currentSales | numberToMoney" custom-class="bg-success" />
    </div>
    <div class="col-12 col-md-4 px-1">
      <card icon="receipt" description="Total Transactions" :value="totalTransactions" custom-class="bg-info" />
    </div>
    <div class="col-12 col-md-4 px-1">
      <card icon="box" description="Items Sold" :value="totalSold" custom-class="bg-warning" />
    </div>
    <div class="col-12 col-md-4 px-1">
      <card icon="money-bill" description="Sales per Hour" :value="salesPerHour | numberToMoney" custom-class="text-success border-success" />
    </div>
    <div class="col-12 col-md-4 px-1">
      <card icon="dot-circle" description="Time of First Transaction" :value="timeOfFirstTransaction" custom-class="text-info border-info" />
    </div>
    <div class="col-12 col-md-4 px-1">
      <card icon="flag-checkered" description="Time of Last Transaction" :value="timeOfLastTransaction" custom-class="text-warning border-warning" />
    </div>
  </div>
</template>
<script>
import Transaction from '@/database/controller/transaction'
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
      currentDate: '',
      salesPerHour: 0,
      timeOfLastTransaction: '',
      timeOfFirstTransaction: '',
      timeDifference: ''
    }
  },
  mounted(){
    this._initialize()
  },
  methods: {
    _initialize(){
      this.generateReport()
    },
    generateReport(){
      this.currentDate = new Date()
      let transaction = {}
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
            '<': endDateFilter.getTime(),
          },
          status: 1
        },
        with: {
          transaction_products: {}
        },
        order: {
          by: 'created_at',
          type: 'asc'
        }
      };
      (new Transaction()).get(query).then((response) => {
        transaction = response || []
        if(transaction.length){
          this.timeOfFirstTransaction = this.fullDatetoTime(new Date(transaction[0]['created_at']))
          this.timeOfLastTransaction = this.fullDatetoTime(new Date(transaction[transaction.length - 1]['created_at']))
          this.timeDifference = transaction[transaction.length - 1]['created_at'] - transaction[0]['created_at']
          this.timeDifference = (((this.timeDifference / 1000) / 60) / 60)
        } else{
          this.timeOfFirstTransaction = 0
          this.timeOfLastTransaction = 0
        }
        for(let x in transaction){
          this.totalTransactions++
          this.currentSales = this.currentSales + (transaction[x]['total_amount'] * 1)
          for(let y in transaction[x]['transaction_products']){
            this.totalSold = this.totalSold + (transaction[x]['transaction_products'][y]['quantity'] * 1)
          }
        }

        this.salesPerHour = this.currentSales / (this.timeDifference < 1 ? 1 : this.timeDifference)
      })
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
