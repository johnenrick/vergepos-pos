<template>
  <div class="p-3">
    <h2>Product Performance</h2>
    <p>Product Performance Report will show you what products are the best base on the quantity sold, total sales, and profit made.</p>
    <div class="row mb-4 no-gutters">
      <div class="col-12 pb-2 px-1">
        <vue-select v-model="selectFilterValue" :options="selectFilterOption" label="description" :multiple="true" placeholder="Category and Product Filter" />
        <small><fa icon="info-circle" /> Type the products or product categories you want to generate report</small>
      </div>
      <div class="col-sm-12 col-md-3 mb-2 px-1">
        <select class="form-control" v-model="selectedReport">
          <option value="transaction">Product Summary</option>
          <option value="hourly">Hourly Product Trend</option>
          <option value="daily">Daily Product Summary</option>
          <option value="monthly">Monthly Product Summary</option>
          <option value="yearly">Yearly Product Summary</option>
        </select>
      </div>
      <div class="col-sm-12 col-md-3 mb-2 px-1">
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
      <div class="col-sm-12 col-md-3 mb-2 px-1">
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
      <div class="col-sm-12 col-md-3 mb-2 px-1">
        <button @click="generate" :disabled="isLoading" class="btn btn-primary w-sm-100">{{isLoading ? 'Generating' : 'Generate'}}</button>
        <button v-if="graphType === 'null' && transactions.length" @click="graphType = 'sales_per_day'" class="btn btn-success ml-2 float-right w-sm-100"><fa icon="chart-line" /> Show Graph</button>
        <button v-else-if="transactions.length" @click="graphType = 'null'" class="btn btn-success ml-2 float-right w-sm-100"><fa icon="chart-line" /> Hide Graph</button>
      </div>
      <div v-show="toDisplay" class="w-100 card m-3">
        <div class="card-body">
          <TransactionGraph v-show="toDisplay === 'transaction'" ref='graph' />
          <DailyLineGraph v-show="toDisplay === 'daily'" ref="lineGraph" />
          <MonthlyLineGraph v-show="toDisplay === 'monthly'" ref="monthlyLineGraph" />
          <YearlyLineGraph v-show="toDisplay === 'yearly'" ref="yearlyLineGraph" />
          <HourlyLineGraph v-show="toDisplay === 'hourly'" ref="hourlyLineGraph" />
          </div>
        </div>
    </div>
    <div class="row">
      <div class="col-12 table-responsive">
        <vuetable ref="vuetable"
          :track-by="'id'"
          :data="transactionProducts"
          :api-mode="false"
          :data-total="2"
          :fields="tableSetting.columns"
        >
          <!-- <template slot="actions" scope="props">
            <button @click="openTransaction(props.rowData['id'])" class="btn btn-sm btn-info"><fa icon="search" /></button>
          </template> -->
        </vuetable>
      </div>
    </div>
    <div>
    </div>
  </div>
</template>
<script>

import Vue from 'vue'
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import 'vue-datetime/dist/vue-datetime.css'
import TransactionNumber from '@/database/controller/transaction-number.js'
import TransactionGraph from '@/views/terminal_reports/product-performance-components/TransactionGraph'
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Product from '@/database/controller/product.js'
import DailyLineGraph from '@/views/terminal_reports/product-performance-components/DailyLineGraph'
import MonthlyLineGraph from '@/views/terminal_reports/product-performance-components/MonthlyLineGraph'
import YearlyLineGraph from '@/views/terminal_reports/product-performance-components/YearlyLineGraph'
import HourlyLineGraph from '@/views/terminal_reports/product-performance-components/HourlyLineGraph'

export default {
  components: {
    Vuetable,
    Datetime,
    VueSelect,
    TransactionGraph,
    DailyLineGraph,
    MonthlyLineGraph,
    YearlyLineGraph,
    HourlyLineGraph
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      toDisplay: null,
      graphType: 'null',
      startDatetimeFilter: null,
      endDatetimeFilter: null,
      productDB: new Product(),
      selectFilterValue: [],
      selectFilterOption: [],
      transactions: [],
      transactionProducts: [],
      hourlyTransactionProducts: {},
      dailyTransactionProducts: {},
      monthlyTransactionProduct: {},
      weeklyTransactionProducts: [],
      yearlyTransactionProducts: {},
      sumTransaction: [],
      totalDiscount: 0,
      totalAmount: 0,
      selectedReport: 'transaction',
      isLoading: false,
      tableSetting: {
        columns: [
          {
            name: 'created_at',
            title: 'Date & Time',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              // return (new Date(value * 1000)).toLocaleString("en-US");
              return value
            }
          },
          {
            name: 'description',
            title: 'Description',
            titleClass: 'text-center',
            dataClass: 'text-center'
          },
          {
            name: 'quantity',
            title: 'Qty',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return value < 0 ? `(${value})` : value
            }
          }, {
            name: 'amount',
            title: 'Amount',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return (this.numberToMoney(value))
            }
          },
          {
            name: 'profit',
            title: 'Profit',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return (this.numberToMoney(value))
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
      this.productDB.get().then((e) => {
        this.selectFilterOption = e
      })
      this.generate()
    },
    addProductSummary(productSummary, transactionProduct){
      if(typeof productSummary[transactionProduct['product_id']] === 'undefined'){
        productSummary[transactionProduct['product_id']] = {
          created_at: 'N/A',
          product_id: transactionProduct['product_id'],
          description: transactionProduct['description']
        }
      }
      this.addAmountQuantityProfitDiscount(productSummary[transactionProduct['product_id']], transactionProduct)
    },
    addDailyProductSummary(dailyProductSummary, transactionProduct){
      const productKey = transactionProduct['product_id']
      if(typeof dailyProductSummary[productKey] === 'undefined'){
        dailyProductSummary[productKey] = {
          product_id: transactionProduct['product_id'],
          description: transactionProduct['description'],
          data: {}
        }
      }
      const transactionProductDate = new Date(transactionProduct['created_at'])
      const dateKey = this.padNumber(transactionProductDate.getMonth() + 1, 2) + '-' + this.padNumber(transactionProductDate.getDate()) + '-' + transactionProductDate.getFullYear()
      if(typeof dailyProductSummary[productKey]['data'][dateKey] === 'undefined'){
        dailyProductSummary[productKey]['data'][dateKey] = {}
      }
      this.addAmountQuantityProfitDiscount(dailyProductSummary[productKey]['data'][dateKey], transactionProduct)
    },
    addMonthlyProductSummary(productSummary, transactionProduct){
      const productKey = transactionProduct['product_id']
      if(typeof productSummary[productKey] === 'undefined'){
        productSummary[productKey] = {
          product_id: transactionProduct['product_id'],
          description: transactionProduct['description'],
          data: {}
        }
      }
      const dataKey = this.formatDate(transactionProduct['created_at'], 'M yyyy')
      if(typeof productSummary[productKey]['data'][dataKey] === 'undefined'){
        productSummary[productKey]['data'][dataKey] = {}
      }
      this.addAmountQuantityProfitDiscount(productSummary[productKey]['data'][dataKey], transactionProduct)
    },
    calculateAmount({ vat_sales: vatSales = 0, vat_amount: vatAmount = 0, vat_exempt_sales: vatExemptSales = 0, vat_zero_rated_sales: vatZeroRatedSales = 0 }){
      return vatSales * 1 + vatAmount * 1 + vatExemptSales * 1 + vatZeroRatedSales * 1
    },
    addAmountQuantityProfitDiscount(summaryEntry, transaction){
      const { discount_amount: discountAmount = 0, cost = 0, quantity = 0 } = transaction
      let amount = this.calculateAmount(transaction)
      if(typeof summaryEntry['amount'] === 'undefined'){
        summaryEntry['amount'] = 0
        summaryEntry['quantity'] = 0
        summaryEntry['profit'] = 0
        summaryEntry['discount_amount'] = 0
      }
      summaryEntry['amount'] += amount
      summaryEntry['quantity'] += quantity * 1
      summaryEntry['profit'] += (amount - (cost * quantity))
      summaryEntry['discount_amount'] += discountAmount * 1
    },
    extractProductList(transactionNumbers){
      let trasactionProducts = []
      transactionNumbers.forEach(transactionNumber => {
        if(transactionNumber['operation'] === 1 && transactionNumber['transaction'] && transactionNumber['transaction']['transaction_products']){
          let transactionTransactionpProduct = transactionNumber['transaction']['transaction_products'].map(item => {
            item['created_at'] = transactionNumber['created_at']
            return item
          })
          trasactionProducts = trasactionProducts.concat(transactionTransactionpProduct)
        }else if(transactionNumber['operation'] === 2 && transactionNumber['transaction_void'] && transactionNumber['transaction_void']['transaction'] && transactionNumber['transaction_void']['transaction']['transaction_products']){
          transactionNumber['transaction_void']['transaction']['transaction_products'].forEach(voidedTransactionProduct => {
            voidedTransactionProduct['quantity'] = voidedTransactionProduct['quantity'] * -1
            voidedTransactionProduct['vat_sales'] = voidedTransactionProduct['vat_sales'] * -1
            voidedTransactionProduct['vat_amount'] = voidedTransactionProduct['vat_amount'] * -1
            voidedTransactionProduct['vat_exempt_sales'] = voidedTransactionProduct['vat_exempt_sales'] * -1
            voidedTransactionProduct['vat_zero_rated_sales'] = voidedTransactionProduct['vat_zero_rated_sales'] * -1
            // voidedTransactionProduct['cost'] = voidedTransactionProduct['cost'] * -1
            trasactionProducts.push(voidedTransactionProduct)
          })
        }
      })
      return trasactionProducts
    },
    generate(){
      this.isLoading = true
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T', ' ').replace('Z', ''))
      let endDatetimeFilter = new Date(this.endDatetimeFilter.replace('T', ' ').replace('Z', ''))
      let createdAtCondition = {
        '>': startDatetimeFilter.getTime(),
        '<=': endDatetimeFilter.getTime()
      }
      let query = {
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
              }
            }
          }
        },
        where: {
          created_at: createdAtCondition
        }
      }
      if(this.selectFilterValue.length){
        const productIds = this.selectFilterValue.map(item => {
          return item['db_id']
        })
        query['with']['transaction']['with']['transaction_products']['where'] = {
          product_id: {
            in: productIds
          }
        }
        query['with']['transaction_void']['with']['transaction']['with']['transaction_products']['where'] = {
          product_id: {
            in: productIds
          }
        }
      }
      this.reset()
      this.transactionProducts = []
      this.dailyTransactionProducts = []
      this.weeklyTransactionProducts = []
      let transactionNumber = new TransactionNumber()
      transactionNumber.get(query).then(result => {
        let transactionProducts = this.extractProductList(result)
        let response = transactionProducts
        transactionProducts.forEach(item => {
          // console.log(new Date(item['created_at']))
        })
        if(transactionProducts.length){
          let productSummary = {}
          let dailyProductSummary = {}
          let monthlyProductSummary = {}
          transactionProducts.forEach(transactionProduct => {
            this.addProductSummary(productSummary, transactionProduct) // Note that the function will modify the productSummary Object
            this.addDailyProductSummary(dailyProductSummary, transactionProduct) // Note that the function will modify the dailyProductSummary Object
            this.addMonthlyProductSummary(monthlyProductSummary, transactionProduct) // Note that the function will modify the productSummary Object
          })
          if(this.selectedReport === 'transaction'){
            for(let x in productSummary){
              this.transactionProducts.push(productSummary[x])
            }
            this.$refs.graph._plotData(this.transactionProducts)
          }else if(this.selectedReport === 'daily'){
            for(let productId in dailyProductSummary){
              for(let dataKey in dailyProductSummary[productId]['data']){
                this.transactionProducts.push({
                  created_at: dataKey,
                  description: dailyProductSummary[productId]['description'],
                  quantity: dailyProductSummary[productId]['data'][dataKey]['quantity'],
                  amount: dailyProductSummary[productId]['data'][dataKey]['amount'],
                  profit: dailyProductSummary[productId]['data'][dataKey]['profit']
                })
              }
            }
            this.$refs.lineGraph._plotData(dailyProductSummary, this.startDatetimeFilter, this.endDatetimeFilter)
          }else if(this.selectedReport === 'monthly'){
            for(let productId in monthlyProductSummary){
              for(let dataKey in monthlyProductSummary[productId]['data']){
                this.transactionProducts.push({
                  created_at: dataKey,
                  description: monthlyProductSummary[productId]['description'],
                  quantity: monthlyProductSummary[productId]['data'][dataKey]['quantity'],
                  amount: monthlyProductSummary[productId]['data'][dataKey]['amount'],
                  profit: monthlyProductSummary[productId]['data'][dataKey]['profit']
                })
              }
            }
            this.$refs.monthlyLineGraph._plotData(monthlyProductSummary, this.startDatetimeFilter, this.endDatetimeFilter)
          }
          this.toDisplay = this.selectedReport
        }
        if(this.selectedReport === 'yearly') {
          this.yearlyTransactionProducts = {}
          let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let endDatetimeFilter = new Date(this.endDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let prepareData = []
          let filteredData = response

          if(this.selectFilterValue.length !== 0){
            filteredData = []
            for(let x = 0; x < response.length; x++){
              for(let y = 0; y < this.selectFilterValue.length; y++){
                if(response[x]['product_id'] === this.selectFilterValue[y]['db_id']){
                  filteredData.push(response[x])
                }
              }
            }
          }

          for(let x = 0; x < filteredData.length; x++){
            prepareData = []
            if(typeof this.yearlyTransactionProducts[filteredData[x]['product_id']] === 'undefined'){
              for(let ctr = new Date(startDatetimeFilter).getFullYear(), i = 0; ctr <= new Date(endDatetimeFilter).getFullYear(); ctr++, i++){
                let data = {
                  x: '',
                  y: 0,
                  amt: 0
                }
                if(new Date(startDatetimeFilter).getFullYear() + i === new Date(filteredData[x]['created_at']).getFullYear()){
                  Vue.set(data, 'y', filteredData[x]['quantity'])
                  Vue.set(data, 'amt', filteredData[x]['vat_sales'] + filteredData[x]['vat_exempt_sales'] + filteredData[x]['vat_zero_rated_sales'] + filteredData[x]['vat_amount'])
                }
                Vue.set(data, 'x', new Date(startDatetimeFilter).getFullYear() + i)
                prepareData.push(data)
              }

              this.yearlyTransactionProducts[filteredData[x]['product_id']] = {
                description: filteredData[x]['description'],
                cost: filteredData[x]['cost'],
                price: filteredData[x]['price'],
                discount_amt: filteredData[x]['discount_amount'],
                data: prepareData
              }
            }else {
              for(let index in this.yearlyTransactionProducts){
                for(let i = 0; i < this.yearlyTransactionProducts[index]['data'].length; i++) {
                  if(index * 1 === filteredData[x]['product_id'] * 1 && this.yearlyTransactionProducts[index]['data'][i].x === new Date(filteredData[x]['created_at']).getFullYear()) {
                    this.yearlyTransactionProducts[index]['data'][i].y += filteredData[x]['quantity']
                    this.yearlyTransactionProducts[index]['data'][i].amt += (filteredData[x]['vat_sales'] + filteredData[x]['vat_amount'] + filteredData[x]['vat_exempt_sales'])
                  }
                }
              }
            }
          }
          let forTableData = []
          for(let i in this.yearlyTransactionProducts){
            for(let x in this.yearlyTransactionProducts[i]['data']){
              if(this.yearlyTransactionProducts[i]['data'][x].y !== 0){
                let data = {
                  description: this.yearlyTransactionProducts[i]['description'],
                  created_at: this.yearlyTransactionProducts[i]['data'][x].x,
                  quantity: this.yearlyTransactionProducts[i]['data'][x].y,
                  amount: this.yearlyTransactionProducts[i]['data'][x].amt,
                  profit: this.yearlyTransactionProducts[i]['data'][x].amt - ((this.yearlyTransactionProducts[i]['data'][x].y * this.yearlyTransactionProducts[i].cost) + (this.yearlyTransactionProducts[i]['data'][x].y * this.yearlyTransactionProducts[i].discount_amt))
                }
                forTableData.push(data)
              }
              delete this.yearlyTransactionProducts[i]['data'][x].amt
            }
          }
          this.transactionProducts = forTableData
          this.toDisplay = this.selectedReport
          this.$refs.yearlyLineGraph._prepData(this.yearlyTransactionProducts, this.startDatetimeFilter, this.endDatetimeFilter)
        } else if(this.selectedReport === 'hourly'){
          this.hourlyTransactionProducts = {}
          let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let endDatetimeFilter = new Date(this.endDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let prepareData = []
          let filteredData = response
          if(this.selectFilterValue.length !== 0){
            filteredData = []
            for(let x = 0; x < response.length; x++){
              for(let y = 0; y < this.selectFilterValue.length; y++){
                if(response[x]['product_id'] === this.selectFilterValue[y]['db_id']){
                  filteredData.push(response[x])
                }
              }
            }
          }
          for(let x = 0; x < filteredData.length; x++){
            prepareData = []
            if(typeof this.hourlyTransactionProducts[filteredData[x]['product_id']] === 'undefined'){
              for(let ctr = new Date(startDatetimeFilter).getHours(), i = 0; ctr <= new Date(endDatetimeFilter).getHours(); ctr++, i++){
                let data = {
                  x: '',
                  y: 0,
                  amt: 0
                }
                if(new Date(startDatetimeFilter).getHours() + i === new Date(filteredData[x]['created_at']).getHours()){
                  Vue.set(data, 'y', filteredData[x]['quantity'])
                  Vue.set(data, 'amt', filteredData[x]['vat_sales'] + filteredData[x]['vat_exempt_sales'] + filteredData[x]['vat_zero_rated_sales'] + filteredData[x]['vat_amount'])
                }
                Vue.set(data, 'x', new Date(startDatetimeFilter).getHours() + i + ':00')
                prepareData.push(data)
              }
              this.hourlyTransactionProducts[filteredData[x]['product_id']] = {
                description: filteredData[x]['description'],
                cost: filteredData[x]['cost'],
                price: filteredData[x]['price'],
                discount_amt: filteredData[x]['discount_amount'],
                data: prepareData
              }
            }else {
              for(let index in this.hourlyTransactionProducts){
                for(let i = 0; i < this.hourlyTransactionProducts[index]['data'].length; i++) {
                  if(index * 1 === filteredData[x]['product_id'] * 1 && this.hourlyTransactionProducts[index]['data'][i].x === new Date(filteredData[x]['created_at']).getHours() + ':00') {
                    this.hourlyTransactionProducts[index]['data'][i].y += filteredData[x]['quantity']
                    this.hourlyTransactionProducts[index]['data'][i].amt += (filteredData[x]['vat_sales'] + filteredData[x]['vat_amount'] + filteredData[x]['vat_exempt_sales'])
                  }
                }
              }
            }
          }
          let forTableData = []
          for(let i in this.hourlyTransactionProducts){
            for(let x in this.hourlyTransactionProducts[i]['data']){
              if(this.hourlyTransactionProducts[i]['data'][x].y !== 0){
                let data = {
                  description: this.hourlyTransactionProducts[i]['description'],
                  created_at: this.hourlyTransactionProducts[i]['data'][x].x,
                  quantity: this.hourlyTransactionProducts[i]['data'][x].y,
                  amount: this.hourlyTransactionProducts[i]['data'][x].amt,
                  profit: this.hourlyTransactionProducts[i]['data'][x].amt - ((this.hourlyTransactionProducts[i]['data'][x].y * this.hourlyTransactionProducts[i].cost) + (this.hourlyTransactionProducts[i]['data'][x].y * this.hourlyTransactionProducts[i].discount_amt))
                }
                forTableData.push(data)
              }
              delete this.hourlyTransactionProducts[i]['data'][x].amt
            }
          }
          this.transactionProducts = forTableData
          this.toDisplay = this.selectedReport
          this.$refs.hourlyLineGraph._plotData(this.hourlyTransactionProducts)
        }

        // resolve(response)
        // this.generateReport()
        this.isLoading = false
      }).catch(error => {
        this.isLoading = false
        console.log(error)
      })
    },
    addInitQuantity(){

    },
    reset(){
      this.transactions = []
      this.totalDiscount = 0
      this.totalAmount = 0
    },
    statusBadge(status){
      switch(status * 1){
        case 1:
          return '<span class="badge badge-success">Ok</span>'
        case 2:
          return '<span class="badge badge-danger">Voided</span>'
      }
    },
  },
  watch: {
    startDatetimeFilter(newDatetime){
      let startdatetimeSegnment = newDatetime.split('T')
      this.endDatetimeFilter = startdatetimeSegnment[0] + 'T23:59:59.999Z'
    }
  },
  filters: {

  }
}
</script>
