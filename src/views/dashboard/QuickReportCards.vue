<template>
  <div class="row no-gutters mb-4">
    <div class="col-12 p-1 text"><h6 class="font-weight-bold text-uppercase">Today's Status on {{currentDate | formatDate('M d, yyyy hh:mm')}}</h6></div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-white bg-success mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="money-bill"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{currentSales | numberToMoney}}</h5>
            <p class="card-text p-0"><small>Current Sales</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-white bg-info mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="receipt"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{totalTransactions}}</h5>
            <p class="card-text p-0"><small>Total Transactions</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-white bg-warning mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="box"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{totalSold}}</h5>
            <p class="card-text p-0"><small>Items Sold</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-success border-success mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="money-bill"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{salesPerHour | numberToMoney}}</h5>
            <p class="card-text p-0"><small>Sales per Hour</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-info border-info mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="dot-circle"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{timeOfFirstTransaction}}</h5>
            <p class="card-text p-0"><small>Time of First Transaction</small></p>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-4 px-1">
      <div class="card text-warning border-warning mb-3" >
        <div class="card-body text-center; p-3">
          <div style="width:50px';float:left"><h1><fa icon="flag-checkered"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px); float:left">
            <h5 class="card-title  font-weight-bold mb-0">{{timeOfLastTransaction}}</h5>
            <p class="card-text p-0"><small>Time of Last Transaction</small></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Transaction from '@/database/controller/transaction'
export default {
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
    fullDatetoTime(timestamp, format){
      let format24 = ''
      let date = new Date(timestamp)
      let hours = date.getHours()
      let minutes = date.getMinutes()
      if(!format){
        return this.time12HourFormat(hours, minutes)
      } else{
        format24 = (hours + ':' + minutes)
        return (format24)
      }
    }
  },

}
</script>
