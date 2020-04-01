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
          zone="local"
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
          zone="local"
        />
      </div>
      <div class="col-6">
        <button v-if="isGenerating" disabled class="btn btn-primary">Generating...</button>
        <button v-else @click="generate" class="btn btn-primary">Generate</button>
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
        <button class="btn btn-outline-primary mb-4" @click="toggleButtonState = !toggleButtonState">{{toggleButtonState === true ? 'View Product History' : 'View Transaction History' }}</button>
        <vuetable
          v-show="toggleButtonState === false"
          ref="vuetable"
          :track-by="'id'"
          :data="transactions"
          :api-mode="false"
          :data-total="2"
          :fields="tableSetting.columns"
        >
          <template slot="actions" slot-scope="props">
            <button v-if="props.rowData['id']" @click="openTransaction(props.rowData['number'])" class="btn btn-sm btn-info"><fa icon="search" /></button>
          </template>
        </vuetable>
        <product-history
          ref="productHistory"
          v-show="toggleButtonState === true"
        />
      </div>
    </div>
    <transaction-viewer ref="TransactionViewer" />
  </div>
</template>
<script>
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import 'vue-datetime/dist/vue-datetime.css'
import TransactionNumber from '@/database/controller/transaction-number.js'
import TransactionViewer from '@/views/pos/control_box_components/TransactionViewer'
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import TimeInDay from './transaction-history-components/TimeInDayPerformance'
import DayInWeek from './transaction-history-components/DayInWeekPerformance'
import SalesPerDay from './transaction-history-components/SalesPerDay'
import ProductHistory from './transaction-history-components/ProductHistory'
export default {
  components: {
    Vuetable,
    Datetime,
    TransactionViewer,
    TimeInDay,
    DayInWeek,
    SalesPerDay,
    ProductHistory
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      toggleButtonState: false,
      graphType: 'null',
      startDatetimeFilter: null,
      endDatetimeFilter: null,
      cashierId: null,
      transactions: [],
      totalDiscount: 0,
      totalAmount: 0,
      isGenerating: false,
      tableSetting: {
        columns: [{
          name: 'number',
          title: 'Transaction Number',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return isNaN(value * 1) ? value : this.padNumber(value, 7)
          }
        }, {
          name: 'created_at',
          title: 'Date & Time',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return value ? this.formatDate(value, 'mm/dd/yy hh:mm') : ''
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
          callback: (value, row) => {
            return this.statusBadge(value)
          }
        }, {
          name: '__slot:actions',
          title: 'Action',
          titleClass: 'text-center',
          dataClass: 'text-center'
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
      this.isGenerating = true
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('Z', ''))
      if(startDatetimeFilter === null){
        startDatetimeFilter = new Date()
        startDatetimeFilter.setHours(0, 0, 0)
      }
      let createdAtCondition = {
        '>': startDatetimeFilter.getTime()
      }
      if(this.endDatetimeFilter){
        createdAtCondition['<'] = (new Date(this.endDatetimeFilter.replace('Z', ''))).getTime()
      }else{
        let endTime = new Date()
        endTime.setHours(23, 59, 59)
        createdAtCondition['<'] = endTime.getTime()
      }
      let query = {
        where: {
          created_at: createdAtCondition
        },
        groupBy: 'id',
        with: {
          transaction: {
            with: {
              transaction_products: {
                join: {
                  with: 'products',
                  on: 'products.db_id=transaction_products.product_id',
                  type: 'inner',
                  as: {
                    'id': 'product_id',
                    'db_id': 'product_db_id',
                    'created_at': 'product_created_at',
                    'updated_at': 'product_updated_at',
                    'deleted_at': 'product_deleted_at',
                    'cost': 'cost'
                  }
                }
              }
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
      }
      let transactionNumberWhereQuery = JSON.parse(JSON.stringify(query.where))
      if(this.cashierId){
        transactionNumberWhereQuery['user_id'] = this.cashierId
      }
      this.reset()
      return new Promise((resolve, reject) => {
        let transactionNumberDB = new TransactionNumber()
        transactionNumberDB.get(query).then(result => {
          for(let x = 0; x < result.length; x++){
            if(result[x]['operation'] === 1 && typeof result[x]['transaction'] !== 'undefined'){
              result[x]['status'] = 1
              result[x]['total_amount'] = result[x]['transaction']['total_amount']
              result[x]['total_discount_amount'] = result[x]['transaction']['total_discount_amount']
              this.totalDiscount += (result[x]['transaction']['total_discount_amount'] * 1).toFixed(2) * 1
              this.totalAmount += (result[x]['transaction']['total_amount'] * 1).toFixed(2) * 1
              result[x]['transaction_products'] = result[x]['transaction']['transaction_products']
            }else if(result[x]['operation'] === 2 && typeof result[x]['transaction_void'] !== 'undefined' && typeof result[x]['transaction_void']['transaction'] !== 'undefined'){
              result[x]['status'] = 2
              result[x]['total_amount'] = '(' + result[x]['transaction_void']['transaction']['total_amount'] + ')'
              result[x]['total_discount_amount'] = '(' + result[x]['transaction_void']['transaction']['total_discount_amount'] + ')'
              this.totalDiscount += (result[x]['transaction_void']['transaction']['total_discount_amount'] * 1).toFixed(2) * -1
              this.totalAmount += (result[x]['transaction_void']['transaction']['total_amount'] * 1).toFixed(2) * -1
              result[x]['transaction_products'] = result[x]['transaction_void']['transaction']['transaction_products']
            }
          }
          this.transactions = result
          console.log(result)
          this.$refs.productHistory._getData(this.transactions)
          if(result.length){
            this.transactions.push({
              id: null,
              number: '<strong>TOTAL</strong>',
              created_at: null,
              total_amount: '<strong>' + this.totalAmount + '</strong>',
              total_discount_amount: '<strong>' + this.totalDiscount + '</strong>',
            })
          }
          this.isGenerating = false
          resolve(true)
        }).catch((error) => {
          console.log(error)
          this.isGenerating = false
          resolve(true)
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
          return '<span class="badge badge-danger">Void</span>'
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
