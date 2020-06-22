<template>
  <div>
    <h2>Transaction History</h2>
    <div class="row mb-4">
      <div v-if="terminal === 'all'" class="col-2">
        <select v-model='storeTerminalFilter' class="form-control">
          <option value="0">Select Terminal</option>
          <template v-for="storeTerminal in storeTerminals">
            <option :value="storeTerminal['store_terminal_id']">{{storeTerminal['description']}}</option>
          </template>
        </select>
      </div>
      <div class="col-sm-12 col-md-2 mb-2">
        <datetime v-model="startDatetimeFilter" class="theme-orange"
          format="yyyy-MM-dd HH:mm:ss"
          input-class="form-control"
          :minute-step="1"
          :use12-hour="true"
          auto
          type="datetime"
          value-zone="local"
          zone="local"
        />
      </div>
      <div class="col-sm-12 col-md-2 mb-2">
        <datetime v-model="endDatetimeFilter" class="theme-orange"
          format="yyyy-MM-dd HH:mm:ss"
          input-class="form-control"
          :minute-step="1"
          :use12-hour="true"
          auto
          type="datetime"
          value-zone="local"
          zone="local"
        />
      </div>
      <div class="col-md-4">
        <button v-if="isGenerating" disabled class="btn btn-primary w-sm-100 mb-2">Generating...{{isGenerating}}</button>
        <button v-else :disabled="(terminal === 'local' || storeTerminalFilter * 1) ? false : true" @click="generate" class="btn btn-primary w-sm-100 mb-2">Generate</button>

        <button v-if="graphType === 'null' && transactions.length" @click="graphType = 'sales_per_day'" class="btn btn-success ml-2 float-right w-sm-100"><fa icon="chart-line" /> Show Graph</button>
        <button v-else-if="transactions.length" @click="graphType = 'null'" class="btn btn-success ml-2 float-right w-sm-100"><fa icon="chart-line" /> Hide Graph</button>
      </div>
    </div>
    <div class="mb-2" v-show="graphType !== 'null'">
      <div class="card">
        <div class="card-body">
          <div class="form-row mb-2">
             <div class="col-sm-3 col-md-2 font-weight-bold">
               <label class="col-form-label">Graph Type </label>
             </div>
             <div class="col-sm-1 col-md-3">
               <select class="custom-select" v-model="graphType">
                <option selected value="sales_per_day">Sales Per Day</option>
                <option value="time_in_day">Time in Day Performance</option>
                <option value="day_in_week">Day In Week Performance</option>
              </select>
             </div>
          </div>
          <div v-show="graphType === 'time_in_day'">
            <p >Time In Day Performance summarize the transaction data by hour. In this way, you can see which time of the day you have the most and least sales.</p>
            <small class="text-info"><fa icon="info-circle"/> You can click the colors in the legend to hide or show the data</small>
            <time-in-day ref="timeInDay" :transactions="transactions" />
          </div>
          <div v-show="graphType === 'sales_per_day'">
            <p class="">Sales per day shows the total sale each day. This is useful in determining which days have least and most sales in a month or in a given timeframe.</p>
            <small class="text-info"><fa icon="info-circle"/> You can click the colors in the legend to hide or show the data</small>
            <sales-per-day ref="salesPerDay" :transactions="transactions" />
          </div>
          <div v-show="graphType === 'day_in_week'">
            <p >Day In Week Performance Graph shows which day in a week has the most and least sales in the given time frame.</p>
            <small class="text-info"><fa icon="info-circle"/> You can click the colors in the legend to hide or show the data</small>
            <day-in-week ref="dayInWeek" :transactions="transactions" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 table-responsive">
        <button class="btn btn-outline-primary mb-4" @click="toggleButtonState = !toggleButtonState">{{toggleButtonState === true ? 'View Product History' : 'View Transaction History' }}</button>
      </div>
      <div class="col-12 table-responsive">
        <vuetable
          v-show="toggleButtonState === false"
          ref="vuetable"
          :track-by="'id'"
          :data="transactions"
          :api-mode="false"
          :data-total="2"
          :fields="tableSetting.columns"
          class=" w-100"
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
import UserSession from '@/vue-web-core/system/store'
export default {
  props: {
    terminal: {
      type: String,
      default: 'local'
    }
  },
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
      storeTerminalFilter: 0,
      cashierId: null,
      transactions: [],
      totalDiscount: 0,
      totalAmount: 0,
      isGenerating: false,
      storeTerminals: [],
      tableSetting: {
        columns: [{
          name: 'number',
          title: 'Txn No.',
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
          dataClass: 'text-right',
          callback: (value) => {
            return isNaN(value * 1) ? value : this.numberToMoney(value)
          }
        }, {
          name: 'total_discount_amount',
          title: 'Discount',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return isNaN(value * 1) ? value : this.numberToMoney(value)
          }
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
      if(this.terminal === 'all'){
        this.listTerminals()
      }else{
        this.generate()
      }
    },
    viewGraph(){
    },
    listTerminals(){
      let param = {
        id: UserSession.getters.companyInformation.id,
        select: {
          stores: {
            select: {
              0: 'name',
              store_terminals: {
                select: {
                  0: 'description'
                }
              }
            }
          }
        }
      }
      this.storeTerminals = []
      this.apiRequest('company/retrieve', param, (response) => {
        if(response['data']){
          let storeTerminals = []
          for(let x = 0; x < response['data']['stores'].length; x++){
            for(let y = 0; y < response['data']['stores'][x]['store_terminals'].length; y++){
              storeTerminals.push({
                store_terminal_id: response['data']['stores'][x]['store_terminals'][y]['id'],
                description: response['data']['stores'][x]['name'] + ' - ' + response['data']['stores'][x]['store_terminals'][y]['description']
              })
            }
          }
          this.storeTerminals = storeTerminals
        }
      })
    },
    openTransaction(transactionId){
      this.$refs.TransactionViewer._open(transactionId)
    },
    generate(){
      this.isGenerating = true
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('Z', ''))
      let endDatetimeFilter = null
      if(startDatetimeFilter === null){
        startDatetimeFilter = new Date()
        startDatetimeFilter.setHours(0, 0, 0)
      }
      if(this.endDatetimeFilter){
        endDatetimeFilter = (new Date(this.endDatetimeFilter.replace('Z', ''))).getTime()
      }else{
        let endTime = new Date()
        endTime.setHours(23, 59, 59)
        endDatetimeFilter = endTime.getTime()
      }
      if(this.terminal === 'local'){
        return this.generateOffline(startDatetimeFilter, endDatetimeFilter)
      }else{
        return this.generateOnline(startDatetimeFilter, endDatetimeFilter)
      }
    },
    generateOffline(startDatetime, endDatetime){
      let createdAtCondition = {
        '>': startDatetime.getTime()
      }
      createdAtCondition['<'] = endDatetime
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
          this.$refs.productHistory._getData(this.transactions)
          if(result.length){
            this.transactions.push({
              id: null,
              number: '<strong>TOTAL</strong>',
              created_at: null,
              total_amount: '<strong>' + this.numberToMoney(this.totalAmount) + '</strong>',
              total_discount_amount: '<strong>' + this.numberToMoney(this.totalDiscount) + '</strong>',
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
    generateOnline(startDatetime, endDatetime){
      let param = {
        select: {
          0: 'operation',
          1: 'number',
          transaction: {
            select: {
              0: 'status',
              1: 'cash_tendered',
              2: 'cash_amount_paid',
              3: 'discount_id',
              4: 'discount_remarks',
              transaction_computation: {
                select: ['total_vat_sales', 'total_vat_exempt_sales', 'total_vat_zero_rated_sales', 'total_vat_amount', 'total_discount_amount']
              },
              transaction_products: {
                select: {
                  0: 'product_id',
                  1: 'quantity',
                  2: 'cost',
                  3: 'vat_sales',
                  4: 'vat_exempt_sales',
                  5: 'vat_zero_rated_sales',
                  6: 'vat_amount',
                  7: 'discount_id',
                  8: 'discount_amount',
                  product: {
                    select: ['description', 'barcode']
                  }
                }
              }
            }
          },
          transaction_void: {
            select: {
              0: 'voided_transaction_number',
              1: 'transaction_number_id',
              2: 'transaction_id',
              transaction: {
                select: {
                  0: 'status',
                  1: 'cash_tendered',
                  2: 'cash_amount_paid',
                  3: 'discount_id',
                  4: 'discount_remarks',
                  transaction_computation: {
                    select: ['total_vat_sales', 'total_vat_exempt_sales', 'total_vat_zero_rated_sales', 'total_vat_amount', 'total_discount_amount']
                  },
                  transaction_products: {
                    select: {
                      0: 'product_id',
                      1: 'quantity',
                      2: 'cost',
                      3: 'vat_sales',
                      4: 'vat_exempt_sales',
                      5: 'vat_zero_rated_sales',
                      6: 'vat_amount',
                      7: 'discount_id',
                      8: 'discount_amount',
                      product: {
                        select: ['description', 'barcode']
                      }
                    }
                  }
                }
              }
            }
          }
        },
        condition: [{
          column: 'created_at',
          clause: '>',
          value: this.serverDatetimeFormat(startDatetime, true)
        }, {
          column: 'created_at',
          clause: '<=',
          value: this.serverDatetimeFormat(endDatetime, true)
        }]
      }
      this.reset()
      return new Promise((resolve, reject) => {
        this.apiRequest('transaction-number/retrieve', param, (response) => {
          if(response['data']){
            let result = response['data']
            for(let x = 0; x < result.length; x++){
              let transactionProducts = null
              if(result[x]['operation'] * 1 === 1 && result[x]['transaction']){
                result[x]['status'] = 1
                result[x]['total_amount'] = (this.computeTransactionTotalAmountOnline(result[x]['transaction'])).toFixed(2)
                result[x]['total_discount_amount'] = result[x]['transaction']['transaction_computation']['total_discount_amount']
                this.totalDiscount += (result[x]['transaction']['transaction_computation']['total_discount_amount'] * 1).toFixed(2) * 1
                this.totalAmount += result[x]['total_amount'] * 1
                transactionProducts = result[x]['transaction']['transaction_products']
              }else if(result[x]['operation'] * 1 === 2 && result[x]['transaction_void'] && result[x]['transaction_void']['transaction']){
                result[x]['status'] = 2 // void transaction
                result[x]['total_amount'] = (this.computeTransactionTotalAmountOnline(result[x]['transaction_void']['transaction'])).toFixed(2)
                result[x]['total_discount_amount'] = '(' + result[x]['transaction_void']['transaction']['transaction_computation']['total_discount_amount'] + ')'
                this.totalDiscount += (result[x]['transaction_void']['transaction']['transaction_computation']['total_discount_amount'] * 1).toFixed(2) * -1
                this.totalAmount += result[x]['total_amount'] * -1
                result[x]['total_amount'] = '(' + result[x]['total_amount'] + ')'
                transactionProducts = result[x]['transaction_void']['transaction']['transaction_products']
              }
              for(let y = 0; y < transactionProducts.length; y++){
                if(transactionProducts[y]['product']){
                  transactionProducts[y]['description'] = transactionProducts[y]['product']['description']
                  transactionProducts[y]['price'] = ((transactionProducts[y]['vat_amount'] * 1) + (transactionProducts[y]['vat_sales'] * 1) + (transactionProducts[y]['vat_exempt_sales'] * 1) + (transactionProducts[y]['vat_zero_rated_sales'] * 1)) * (result[x]['status'] === 2 ? -1 : 1)
                }
              }
              result[x]['transaction_products'] = transactionProducts
            }
            this.transactions = result
            this.$refs.productHistory._getData(this.transactions)
            if(result.length){
              this.transactions.push({
                id: null,
                number: '<strong>TOTAL</strong>',
                created_at: null,
                total_amount: '<strong>' + this.numberToMoney(this.totalAmount) + '</strong>',
                total_discount_amount: '<strong>' + this.numberToMoney(this.totalDiscount) + '</strong>',
              })
            }
          }
          this.isGenerating = false
          resolve(true)
        })
      })
    },
    computeTransactionTotalAmountOnline(transaction){
      return (transaction['transaction_computation']['total_vat_amount'] * 1) + (transaction['transaction_computation']['total_vat_sales'] * 1) + (transaction['transaction_computation']['total_vat_exempt_sales'] * 1) + (transaction['transaction_computation']['total_vat_zero_rated_sales'] * 1)
    },
    reset(){
      this.transactions = []
      this.totalDiscount = 0
      this.totalAmount = 0
      this.$refs.productHistory._reset()
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
