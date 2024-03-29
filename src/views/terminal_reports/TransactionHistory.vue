<template>
  <div class="p-3">
    <div class="p-3 bg-white shadow-sm mb-2 border">
      <h2>Transaction History</h2>
      <p>Transaction History will show all the transactions that has been made. Just specify the <em>start</em> and <em>end</em> date & time. You can also <em>Show Graph</em> after generating the report to gave you an idea on how your business is doing against time</p>
    </div>
    <div class="mb-2 px-2 py-3 bg-white shadow-sm border">
      <div class="row no-gutters mb-lg-2">
        <template v-if="terminal === 'all'" >
          <div :class="filterInputClass">
            <select v-model='storeTerminalFilter' class="form-control">
              <option value="0">Select Terminal</option>
              <template v-for="storeTerminal in storeTerminals">
                <option :value="storeTerminal['store_terminal_id']">{{storeTerminal['description']}}</option>
              </template>
            </select>
          </div>
        </template>
        <div :class="filterInputClass" >
          <select v-model='cashierIdFilter' class="form-control">
            <option value="0">Any Cashier</option>
            <template v-for="users in users">
              <option :value="users['id']">{{users['first_name']}} {{users['last_name']}}</option>
            </template>
          </select>
        </div>
        <div :class="filterInputClass">
          <datetime v-model="startDatetimeFilter" class="theme-orange"
            format="yyyy-MM-dd HH:mm:ss"
            input-class="form-control"
            :minute-step="1"
            :use12-hour="true"
            auto
            type="datetime"
            value-zone="utc"
            zone="utc"
          />
        </div>
        <div :class="filterInputClass" >
          <datetime v-model="endDatetimeFilter" class="theme-orange"
            format="yyyy-MM-dd HH:mm:ss"
            input-class="form-control"
            :minute-step="1"
            :use12-hour="true"
            auto
            type="datetime"
            value-zone="utc"
            zone="utc"
          />
        </div>
      </div>
      <div class="text-right">
          <button v-if="isGenerating" disabled class="btn btn-primary w-sm-100 mb-2 mx-md-1 mb-lg-0">Generating...</button>
          <button v-else :disabled="(terminal === 'local' || storeTerminalFilter * 1) ? false : true" @click="generate" class="btn btn-primary w-sm-100 mb-2 mx-md-1 mb-lg-0">Generate Report</button>
          <button v-if="graphType === 'null' && transactions.length" @click="graphType = 'sales_per_day'" class="btn btn-success mx-md-1 w-sm-100"><fa icon="chart-line" /> Show Graph</button>
          <button v-else-if="transactions.length" @click="graphType = 'null'" class="btn btn-success mx-md-1 w-sm-100"><fa icon="chart-line" /> Hide Graph</button>
      </div>
    </div>
    <div class="mb-2" v-show="graphType !== 'null'">
      <div class="card">
        <div class="card-body">
          <div class="form-row mb-2">
             <div class="col-sm-3 col-md-2 font-weight-bold">
               <label class="col-form-label">Graph Type </label>
             </div>
             <div class="col-sm-1 col-md-6 col-lg-4">
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
            <sales-per-day ref="salesPerDay" />
          </div>
          <div v-show="graphType === 'day_in_week'">
            <p >Day In Week Performance Graph shows which day in a week has the most and least sales in the given time frame.</p>
            <small class="text-info"><fa icon="info-circle"/> You can click the colors in the legend to hide or show the data</small>
            <day-in-week ref="dayInWeek" :transactions="transactions" />
          </div>
        </div>
      </div>
    </div>
    <div class="row p-3 bg-white shadow-sm no-gutters border mb-2">
      <div class="col-12">
        <button class="btn btn-outline-primary mb-4" @click="toggleButtonState = !toggleButtonState">{{toggleButtonState ? 'View Transaction History' : 'View Product History'}}</button>
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
          class="w-100"
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
    <div v-if="transactions.length">
      Note:
      <ul>
        <li>
        <strong>Amount</strong> = Vat Amount + Vat Sales + Vat Exempt Sales + Zero Rated Sales - Discount Amount
        </li>
        <li>Numbers enclosed with parenthesis <strong>"("</strong> and <strong>")"</strong> are negative numbers. Example: <strong>-</strong>9 is written as <strong>(</strong>9<strong>)</strong></li>
      </ul>
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
import User from '@/database/controller/user'
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
      cashierIdFilter: 0,
      transactions: [],
      totalDiscount: 0,
      totalAmount: 0,
      totalProfit: 0,
      isGenerating: false,
      storeTerminals: [],
      users: [],
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
            return value ? this.formatDate(value, 'mm/dd/yy hh:mm', this.terminal !== 'local') : ''
          }
        }, {
          name: 'total_amount',
          title: 'Amount',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_discount_amount',
          title: 'Discount',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_profit',
          title: 'Profit',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
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
      this.listUsers()
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
    listUsers(){
      if(this.terminal === 'local'){
        const userDB = new User()
        userDB.get().then(result => {
          result.forEach(user => {
            if(user['is_cashier']){
              user['id'] = user['db_id']
              this.users.push(user)
            }
          })
        })
      }else{
        const param = {
          select: {
            user_basic_information: {
              select: ['first_name', 'last_name']
            },
            ...['id']
          }
        }
        this.apiRequest('user/retrieve', param, (response) => {
          if(response['data']){
            response['data'].forEach(user => {
              this.users.push({
                id: user['id'],
                first_name: user['user_basic_information']['first_name'],
                last_name: user['user_basic_information']['last_name'],
              })
            })
            console.log('this.users', this.users)
          }
        })
      }
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
        endDatetimeFilter = (new Date(this.endDatetimeFilter.replace('Z', '')))
      }else{
        let endTime = new Date()
        endTime.setHours(23, 59, 59)
        endDatetimeFilter = endTime
      }
      if(this.terminal === 'local'){
        return this.generateOffline(startDatetimeFilter.getTime(), endDatetimeFilter.getTime())
      }else{
        return this.generateOnline(startDatetimeFilter, endDatetimeFilter)
      }
    },
    addTransactionToTable(transactionNumber, source){
      let negativeMultiplier = 1
      let transaction
      if(transactionNumber['operation'] * 1 === 1){ // void transaction
        if(typeof transactionNumber['transaction'] !== 'undefined'){
          transaction = transactionNumber['transaction']
          transactionNumber['status'] = 1
        }else{
          transactionNumber['status'] = 11
          return false
        }
      }else if(transactionNumber['operation'] * 1 === 2){
        negativeMultiplier = -1
        if(typeof transactionNumber['transaction_void'] !== 'undefined' && typeof transactionNumber['transaction_void']['transaction'] !== 'undefined'){
          transaction = transactionNumber['transaction_void']['transaction']
          transactionNumber['status'] = 2
        }else{
          transactionNumber['status'] = 21
          return false
        }
      }else{
        transactionNumber['status'] = 'error'
        return false
      }
      if(typeof transaction !== 'undefined' && transaction){
        if(source === 'offline'){
          transactionNumber['total_amount'] = transaction['total_amount'] * negativeMultiplier
          transactionNumber['total_discount_amount'] = transaction['total_discount_amount'] * negativeMultiplier
        }else{
          transactionNumber['total_amount'] = this.computeTransactionTotalAmountOnline(transaction) * negativeMultiplier
          transactionNumber['total_discount_amount'] = transaction['transaction_computation'] ? transaction['transaction_computation']['total_discount_amount'] * negativeMultiplier : 0
        }
        this.totalDiscount += (transactionNumber['total_discount_amount']).toFixed(2) * 1
        this.totalAmount += transactionNumber['total_amount']
        const totalCost = (typeof transaction['transaction_products'] !== 'undefined') ? this.calculateTotalCostFromTransactionProducts(transaction['transaction_products']) * negativeMultiplier : 0
        const totalProfit = transactionNumber['total_amount'] - totalCost
        transactionNumber['total_profit'] = totalProfit
        this.totalProfit += totalProfit
        transactionNumber['transaction_products'] = transaction['transaction_products']
        return true
      }else{
        console.error('Transaction is not defined', transactionNumber)
        return false
      }
    },
    generateOffline(startDatetime, endDatetime){
      let createdAtCondition = {
        '>=': startDatetime
      }
      createdAtCondition['<'] = endDatetime
      let query = {
        where: {
          created_at: createdAtCondition
        },
        order: {
          by: 'number',
          type: 'desc'
        },
        with: {
          transaction: {
            with: {
              transaction_products: {
                groupBy: 'id',
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
                  transaction_products: {
                    groupBy: 'id',
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
              }
            }
          }
        },
      }
      if(this.cashierIdFilter){
        query['where']['user_id'] = this.cashierIdFilter
      }
      this.reset()
      return new Promise((resolve, reject) => {
        let transactionNumberDB = new TransactionNumber()
        transactionNumberDB.get(query).then(result => {
          for(let x = 0; x < result.length; x++){
            this.addTransactionToTable(result[x], 'offline') // modify the result[x] array
          }
          this.transactions = result
          this.$refs.productHistory._setData(this.transactions)
          if(result.length){
            this.transactions.push({
              id: null,
              number: '<strong>TOTAL</strong>',
              created_at: null,
              total_amount: this.totalAmount,
              total_profit: this.totalProfit,
              total_discount_amount: this.totalDiscount
            })
          }
          if(this.graphType){
            this.generateReport()
          }
          this.isGenerating = false
          resolve(true)
        }).catch(errorResult => {
          console.error('errorResult', errorResult)
          this.isGenerating = false
          if(this.graphType){
            this.generateReport()
          }
          resolve(true)
        })
      })
    },
    calculateTotalCostFromTransactionProducts(transactionProducts){
      let totalCost = 0
      transactionProducts.forEach(transactionProduct => {
        totalCost += (transactionProduct['quantity'] * transactionProduct['cost'])
      })
      return totalCost
    },
    generateOnline(startDatetime, endDatetime){
      let param = {
        select: {
          0: 'operation',
          1: 'number',
          2: 'created_at',
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
        }],
        sort: [{
          column: 'number',
          order: 'desc'
        }]
      }
      if(this.storeTerminalFilter * 1){
        param['condition'].push({
          column: 'store_terminal_id',
          value: this.storeTerminalFilter
        })
      }
      if(this.cashierIdFilter * 1){
        param['condition'].push({
          column: 'user_id',
          value: this.cashierIdFilter
        })
      }
      this.reset()
      return new Promise((resolve, reject) => {
        this.apiRequest('transaction-number/retrieve', param, (response) => {
          if(response['data']){
            let result = response['data']
            for(let x = 0; x < result.length; x++){
              this.addTransactionToTable(result[x], 'online')
              const transactionProducts = typeof result[x]['transaction_products'] === 'object' ? result[x]['transaction_products'] : []
              for(let y = 0; y < transactionProducts.length; y++){
                if(transactionProducts[y]['product']){
                  transactionProducts[y]['description'] = transactionProducts[y]['product']['description']
                  transactionProducts[y]['price'] = ((transactionProducts[y]['vat_amount'] * 1) + (transactionProducts[y]['vat_sales'] * 1) + (transactionProducts[y]['vat_exempt_sales'] * 1) + (transactionProducts[y]['vat_zero_rated_sales'] * 1)) * (result[x]['status'] === 2 ? -1 : 1)
                }
              }
              result[x]['transaction_products'] = transactionProducts
            }
            this.transactions = result
            this.$refs.productHistory._setData(this.transactions)
            if(result.length){
              this.transactions.push({
                id: null,
                number: '<strong>TOTAL</strong>',
                created_at: null,
                total_amount: this.totalAmount,
                total_discount_amount: this.totalDiscount,
                total_profit: this.totalProfit
              })
            }
          }
          if(this.graphType){
            this.generateReport()
          }
          this.isGenerating = false
          resolve(true)
        }, errorResult => {
          console.error(errorResult)
        })
      })
    },
    computeTransactionTotalAmountOnline(transaction){
      if(transaction['transaction_computation']){
        return (transaction['transaction_computation']['total_vat_amount'] * 1) + (transaction['transaction_computation']['total_vat_sales'] * 1) + (transaction['transaction_computation']['total_vat_exempt_sales'] * 1) + (transaction['transaction_computation']['total_vat_zero_rated_sales'] * 1)
      }else{
        return 0
      }
    },
    reset(){
      this.transactions = []
      this.totalDiscount = 0
      this.totalAmount = 0
      this.totalProfit = 0
      this.$refs.productHistory._reset()
      this.generateReport(true)
    },
    generateReport(reset = false){
      let reportType = this.graphType
      if(reportType === 'time_in_day'){
        this.$refs.timeInDay._generate(this.transactions)
      }else if(reportType === 'sales_per_day'){
        this.$refs.salesPerDay._generate(this.transactions)
      }else if(reportType === 'day_in_week'){
        this.$refs.dayInWeek._generate(this.transactions)
      }
    },
    statusBadge(status){
      const exclamationMark = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="exclamation" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" class="svg-inline--fa fa-exclamation fa-w-6"><path fill="currentColor" d="M176 432c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80zM25.26 25.199l13.6 272C39.499 309.972 50.041 320 62.83 320h66.34c12.789 0 23.331-10.028 23.97-22.801l13.6-272C167.425 11.49 156.496 0 142.77 0H49.23C35.504 0 24.575 11.49 25.26 25.199z" class=""></path></svg>'
      switch(status * 1){
        case 1:
          return '<span class="badge badge-success">Ok</span>'
        case 11:
          return `<span class="badge badge-success">Ok</span> <span class="text-danger">${exclamationMark}</span>`
        case 2:
          return '<span class="badge badge-danger">Void</span>'
        case 21:
          return `<span class="badge badge-danger">Void</span> <span class="text-danger">${exclamationMark}</span>`
        case 'error':
          return 'unknown'
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
  computed: {
    filterInputClass(){
      return this.terminal === 'all' ? 'col-sm-12 col-md-6 col-lg-3 px-1 mb-2 mb-lg-0' : 'col-sm-12 col-md-6 col-lg-4 px-1 mb-2 mb-lg-0'
    }
  },
  filters: {

  }
}
</script>
