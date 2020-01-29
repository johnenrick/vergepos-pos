<template>
  <div class="row no-gutters mb-4">
    <div class="col-12 p-1 text"><h6 class="font-weight-bold text-uppercase">Today's Status on August 8, 2019 12:00 am</h6></div>
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
  </div>
</template>
<script>
import Transaction from '@/database/controller/transaction'
export default {
  data(){
    return{
      totalSold: 0,
      totalTransactions: 0,
      currentSales: 0
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
        }
      };
      (new Transaction()).get(query).then((response) => {
        transaction = response || []
        for(let x in transaction){
          this.totalTransactions++
          this.currentSales = this.currentSales + (transaction[x]['total_amount'] * 1)
          for(let y in transaction[x]['transaction_products']){
            this.totalSold = this.totalSold + (transaction[x]['transaction_products'][y]['quantity'] * 1)
          }
        }
      })
    }
  },

}
</script>
