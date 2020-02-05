<template>
  <div>
    <h2>Transaction History</h2>
    <div class="row mb-4">
      <div class="col-3">
        <datetime v-model="startDatetimeFilter" class="theme-orange"
          format="yyyy-MM-dd HH:mm:ss"
          input-class="form-control"
          :minute-step="10"
          :use12-hour="true"
          auto
          type="datetime"
          value-zone="local"
          zone="utc"
        />
      </div>
      <div class="col-3">
        <datetime v-model="endDatetimeFilter" class="theme-orange"
          format="yyyy-MM-dd HH:mm:ss"
          input-class="form-control"
          :minute-step="10"
          :use12-hour="true"
          auto
          type="datetime"
          value-zone="local"
          zone="utc"
        />
      </div>
      <div class="col-6">
        <button @click="generate" class="btn btn-primary">Generate</button>
        <button v-if="graphType === 'null' && transactions.length" @click="graphType = 'sales_per_day'" class="btn btn-success ml-2 float-right"><fa icon="chart-line" /> Show Graph</button>
        <button v-else-if="transactions.length" @click="graphType = 'null'" class="btn btn-success ml-2 float-right"><fa icon="chart-line" /> Hide Graph</button>
      </div>
    </div>
    <div class="mb-2" v-show="graphType !== 'null'">
      <div class="card">
        <div class="card-body">
          <div class="form-row mb-2">
             <div class="col-2 font-weight-bold">
               <label class="col-form-label">Graph Type </label>
             </div>
             <div class="col-3">
               <select class="custom-select" v-model="graphType">
                <option selected value="sales_per_day">Sales Per Day</option>
                <option value="time_in_day">Time in Day Performance</option>
                <option value="day_in_week">Day In Week Performance</option>
              </select>
             </div>
          </div>
          <div v-show="graphType === 'time_in_day'">
            <p class="mb-0">Time In Day Performance summarize the transaction data by hour. In this way, you can see which time of the day you have the most and least sales.</p>
            <time-in-day ref="timeInDay" :transactions="transactions" />
          </div>
          <div v-show="graphType === 'sales_per_day'">
            <p class="mb-0">Sales per day shows the total sale each day. This is useful in determining which days have least and most sales in a month or in a given timeframe.</p>
            <sales-per-day ref="salesPerDay" :transactions="transactions" />
          </div>
          <div v-show="graphType === 'day_in_week'">
            <p class="mb-0">Day In Week Performance Graph shows which day in a week has the most and least sales in the given time frame.</p>
            <day-in-week ref="dayInWeek" :transactions="transactions" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <vuetable ref="vuetable"
          :track-by="'id'"
          :data="transactions"
          :api-mode="false"
          :data-total="2"
          :fields="tableSetting.columns"
        >
          <template slot="actions" slot-scope="props">
            <button @click="openTransaction(props.rowData['id'])" class="btn btn-sm btn-info"><fa icon="search" /></button>
          </template>
        </vuetable>
      </div>
    </div>
    <transaction-viewer ref="TransactionViewer" />
  </div>
</template>
<script>
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import 'vue-datetime/dist/vue-datetime.css'
import Transaction from '@/database/controller/transaction.js'
import TransactionNumber from '@/database/controller/transaction-number.js'
import TransactionViewer from '@/views/pos/control_box_components/TransactionViewer'
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import TimeInDay from './transaction-history-components/TimeInDayPerformance'
import DayInWeek from './transaction-history-components/DayInWeekPerformance'
import SalesPerDay from './transaction-history-components/SalesPerDay'
export default {
  components: {
    Vuetable,
    Datetime,
    TransactionViewer,
    TimeInDay,
    DayInWeek,
    SalesPerDay
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      graphType: 'null',
      startDatetimeFilter: null,
      endDatetimeFilter: null,
      cashierId: null,
      transactions: [],
      totalDiscount: 0,
      totalAmount: 0,
      tableSetting: {
        columns: [{
          name: 'transaction_number_id',
          title: 'Transaction Number',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return this.padNumber(value, 7)
          }
        }, {
          name: 'created_at',
          title: 'Date & Time',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return this.formatDate(value, 'mm/dd/yy hh:mm')
          }
        }, {
          name: 'total_amount',
          title: 'Amount',
          titleClass: 'text-center',
          dataClass: 'text-right'
        }, {
          name: 'total_discount_amount',
          title: 'Discount',
          titleClass: 'text-center',
          dataClass: 'text-right'
        }, {
          name: 'status',
          title: 'Status',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return this.statusBadge(value)
          }
        }, {
          name: '__slot:actions',
          title: 'Action',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (test, fmt, yawa) => {
            console.log('test', test, fmt, yawa)
          }
        }]
      }
    }
  },
  methods: {
    init(){
      let currentDate = new Date()
      let defaultTime = currentDate.getFullYear() + '-' + this.padNumber(currentDate.getMonth() + 1) + '-' + this.padNumber(currentDate.getDate()) + 'T' + this.padNumber(0) + ':' + this.padNumber(0) + ':' + this.padNumber(0) + '.000Z'
      this.startDatetimeFilter = defaultTime
      this.generate()
    },
    viewGraph(){
    },
    openTransaction(transactionId){
      this.$refs.TransactionViewer._open(transactionId)
    },
    generate(){
      let startDatetimeFilter = new Date(this.startDatetimeFilter)
      if(startDatetimeFilter === null){
        startDatetimeFilter = new Date()
        startDatetimeFilter.setHours(0, 0, 0)
      }
      let createdAtCondition = {
        '>': startDatetimeFilter.getTime()
      }
      if(this.endDatetimeFilter){
        createdAtCondition['<'] = (new Date(this.endDatetimeFilter)).getTime()
      }else{
        createdAtCondition['<'] = (new Date()).getTime()
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
      if(this.cashierId){
        transactionNumberWhereQuery['user_id'] = this.cashierId
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
            this.generateReport()
          }).catch(error => {
            reject(error)
          })
        }).finally(() => {
          resolve(null)
        })
      })
    },
    getTransactionNumberId(transactionNumbers){
      let ids = []
      for(let x = 0; x < transactionNumbers.length; x++){
        ids.push(transactionNumbers[x]['id'])
      }
      return ids
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
          }
          resolve(response)
        })
      })
    },
    getTransactions(query){
      let transactionDB = new Transaction()
      return new Promise((resolve, reject) => {
        transactionDB.get(query).then((response) => {
          this.transactions = response
          // this.salesTransactionCount = response.length
          for(let x = 0; x < response.length; x++){
            // this.vatSales += response[x]['total_vat_sales'] * 1
            // this.vatExemptSales += response[x]['total_vat_exempt_sales'] * 1
            // this.vatZeroRatedSales += response[x]['total_vat_zero_rated_sales'] * 1
            // this.vatAmount += response[x]['total_vat_amount'] * 1
            this.totalDiscount += (response[x]['total_discount_amount'] * 1).toFixed(2) * 1
            this.totalAmount += (response[x]['total_amount'] * 1).toFixed(2) * 1
            // this.reprintTransactionCount += response[x]['total_vat_sales'] * 1
            // if(response[x]['status'] === 2){
            //   ++this.voidedTransactionCount
            // }
            // let transactionProducts = response[x]['transaction_products']
            // for(let y = 0; y < transactionProducts.length; y++){
            //   let discountId = transactionProducts[y]['discount_id']
            //   if(discountId){
            //     Vue.set(this.discountAmounts[discountId], 'amount', this.discountAmounts[discountId]['amount'] + transactionProducts[y]['discount_amount'])
            //   }
            // }
          }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },
    reset(){
      this.transactions = []
      this.totalDiscount = 0
      this.totalAmount = 0
      this.generateReport()
    },
    generateReport(){
      console.log('generating', this.graphType, this.transactions.length)
      let reportType = this.graphType
      if(reportType === 'time_in_day'){
        this.$refs.timeInDay._generate()
      }else if(reportType === 'sales_per_day'){
        this.$refs.salesPerDay._generate()
      }else if(reportType === 'day_in_week'){
        this.$refs.dayInWeek._generate()
      }
    },
    statusBadge(status){
      switch(status * 1){
        case 1:
          return '<span class="badge badge-success">Ok</span>'
        case 2:
          return '<span class="badge badge-danger">Voided</span>'
      }
    }
  },
  watch: {
    startDatetimeFilter(newDatetime){
      let startdatetimeSegnment = newDatetime.split('T')
      this.endDatetimeFilter = startdatetimeSegnment[0] + 'T23:59:59.999Z'
    },
    graphType(newData){
      this.generateReport()
    }
  },
  filters: {

  }
}
</script>
