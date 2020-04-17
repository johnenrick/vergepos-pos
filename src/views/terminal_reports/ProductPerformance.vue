<template>
  <div>
    <h2>Product Performance</h2>
    <div class="row mb-4">
      <div class="col-12 pb-2">
        <vue-select v-model="selectFilterValue" :options="selectFilterOption" label="description" :multiple="true" placeholder="Category and Product Filter" />
        <small><fa icon="info-circle" /> Type the products or product categories you want to generate report</small>
      </div>
      <div class="col-3">
        <select class="form-control" v-model="selectedReport">
          <option value="transaction">Transaction</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div class="col-3">
        <datetime v-model="startDatetimeFilter" class="theme-orange"
          format="yyyy-MM-dd HH:mm:ss"
          input-class="form-control"
          :minute-step="10"
          :use12-hour="true"
          auto
          type="datetime"
          value-zone="utc"
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
          value-zone="utc"
          zone="utc"
        />
      </div>
      <div class="col-3">
        <button @click="generate" class="btn btn-primary">Generate</button>
        <button v-if="graphType === 'null' && transactions.length" @click="graphType = 'sales_per_day'" class="btn btn-success ml-2 float-right"><fa icon="chart-line" /> Show Graph</button>
        <button v-else-if="transactions.length" @click="graphType = 'null'" class="btn btn-success ml-2 float-right"><fa icon="chart-line" /> Hide Graph</button>
      </div>
      <div class="w-100 card m-3">
        <div class="card-body">
        <transaction-graph
          v-show="selectedReport === 'transaction'"
          ref='graph'
          />
          <line-graph
            v-show="selectedReport === 'daily'"
            ref="lineGraph"
          />
          <monthly-line-graph
            v-show="selectedReport === 'monthly'"
            ref="monthlyLineGraph"
          />
          <yearly-line-graph
            v-show="selectedReport === 'yearly'"
            ref="yearlyLineGraph"
          />
          <hourly-line-graph
            v-show="selectedReport === 'hourly'"
            ref="hourlyLineGraph"
          />
          </div>
        </div>
    </div>
    <div class="row">
      <div class="col-12">
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
import TransactionProduct from '@/database/controller/transaction-product.js'
import TransactionGraph from '@/views/terminal_reports/product-performance-components/TransactionGraph'
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Product from '@/database/controller/product.js'
import LineGraph from '@/views/terminal_reports/product-performance-components/LineGraph'
import MonthlyLineGraph from '@/views/terminal_reports/product-performance-components/MonthlyLineGraph'
import YearlyLineGraph from '@/views/terminal_reports/product-performance-components/YearlyLineGraph'
import HourlyLineGraph from '@/views/terminal_reports/product-performance-components/HourlyLineGraph'

export default {
  components: {
    Vuetable,
    Datetime,
    VueSelect,
    TransactionGraph,
    LineGraph,
    MonthlyLineGraph,
    YearlyLineGraph,
    HourlyLineGraph
  },
  mounted(){
    this.init()
  },
  data(){
    return {
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
            dataClass: 'text-center',
            callback: (value) => {
              // return this.padNumber(value, 7)
              return value
            }
          },
          {
            name: 'quantity',
            title: 'Qty',
            titleClass: 'text-center',
            dataClass: 'text-center'
          }, {
            name: 'amount',
            title: 'Amount',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return ('P' + this.numberToMoney(value))
            }
          },
          {
            name: 'profit',
            title: 'Profit',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return ('P' + this.numberToMoney(value))
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
        // console.log(this.selectFilterOption);
        // console.log(this.selectFilterOption[0].description)
      })
      this.generate()
    },
    viewGraph(){
    },
    openTransaction(transactionId){
    },
    generate(){
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T', ' ').replace('Z', ''))
      // console.log("startTime " + startDatetimeFilter, this.startDatetimeFilter)

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
        join: {
          with: 'products',
          on: 'transaction_products.product_id=products.db_id',
          type: 'inner',
          as: {
            'id': 'transaction_number_id',
            'db_id': 'transaction_number_db_id',
            'created_at': 'transaction_number_created_at',
            'updated_at': 'transaction_number_updated_at',
            'deleted_at': 'transaction_number_deleted_at',
            'cost': 'cost'
          }
        },
        where: {
          // product_id : (this.selectFilterValue == null) ?  1 : this.selectFilterValue[0].db_id,
          created_at: createdAtCondition
        }
      }
      this.reset()
      let transactionProduct = new TransactionProduct()
      this.transactionProducts = []
      this.dailyTransactionProducts = []
      this.weeklyTransactionProducts = []

      transactionProduct.get(query).then(response => {
        if(this.selectedReport === 'transaction'){
          if(response.length !== 0){
            let productArr = {}
            if(this.selectFilterValue.length !== 0){
              for(let x = 0; x < response.length; x++){
                for(let y = 0; y < this.selectFilterValue.length; y++){
                  if(response[x]['product_id'] === this.selectFilterValue[y]['db_id']){
                    if(typeof productArr[response[x]['product_id']] === 'undefined'){
                      productArr[response[x]['product_id']] = {
                        quantity: 0,
                        amount: 0,
                        profit: 0
                      }
                    }
                    productArr[response[x]['product_id']]['product_id'] = response[x]['product_id']
                    productArr[response[x]['product_id']]['created_at'] = 'N/A'
                    productArr[response[x]['product_id']]['description'] = response[x]['description']
                    productArr[response[x]['product_id']]['amount'] += response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] * 1
                    productArr[response[x]['product_id']]['quantity'] += response[x]['quantity'] * 1
                    productArr[response[x]['product_id']]['profit'] += (response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] * 1) - ((response[x]['quantity'] * 1) * (response[x]['cost'] * 1))
                  }
                }
              }
            }else{
              for(let x = 0; x < response.length; x++){
                if(typeof productArr[response[x]['product_id']] === 'undefined'){
                  productArr[response[x]['product_id']] = {
                    quantity: 0,
                    amount: 0,
                    profit: 0
                  }
                }
                productArr[response[x]['product_id']]['created_at'] = 'N/A'
                productArr[response[x]['product_id']]['description'] = response[x]['description']
                productArr[response[x]['product_id']]['amount'] += response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] * 1
                productArr[response[x]['product_id']]['quantity'] += response[x]['quantity'] * 1
                productArr[response[x]['product_id']]['profit'] += (response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] * 1) - ((response[x]['quantity'] * 1) * (response[x]['cost'] * 1))
              }
            }
            for(let x in productArr){
              this.transactionProducts.push(productArr[x])
            }
            console.log('ALLTIME', this.transactionProducts)
            this.$refs.graph._plotData(this.transactionProducts)
          }
        }else if(this.selectedReport === 'daily'){
          // if(response.length !== 0){
          if(this.selectFilterValue.length !== 0){
            for(let x = 0; x < response.length; x++){
              for(let y = 0; y < this.selectFilterValue.length; y++){
                if(response[x]['product_id'] === this.selectFilterValue[y]['db_id']){
                  response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_exempt_sales'] + response[x]['vat_zero_rated_sales'] + response[x]['vat_amount']
                  this.transactionProducts.push(response[x])

                  let prepareData = []
                  if(typeof this.dailyTransactionProducts[response[x]['product_id']] === 'undefined'){
                    for(let ctr = new Date(this.startDatetimeFilter).getDate(), i = 0; ctr <= new Date(this.endDatetimeFilter).getDate(); ctr++, i++){
                      let data = {
                        x: '',
                        y: 0,
                        amt: 0
                      }
                      if(new Date(this.startDatetimeFilter).getDate() + i === new Date(response[x]['created_at']).getDate()){
                        Vue.set(data, 'y', response[x]['quantity'])
                        Vue.set(data, 'amt', response[x]['vat_sales'] + response[x]['vat_exempt_sales'] + response[x]['vat_zero_rated_sales'] + response[x]['vat_amount'])
                      }

                      let modifiedDate = new Date()

                      modifiedDate.setDate(new Date(this.startDatetimeFilter).getDate() + i)
                      Vue.set(data, 'x', modifiedDate.toString())

                      prepareData.push(data)
                    }

                    this.dailyTransactionProducts[response[x]['product_id']] = {
                      description: response[x]['description'],
                      cost: response[x]['cost'],
                      price: response[x]['price'],
                      discount_amt: response[x]['discount_amount'],
                      data: prepareData
                    }
                  }else{
                    for(let index in this.dailyTransactionProducts){
                      for(let i = 0; i < this.dailyTransactionProducts[index]['data'].length; i++){
                        // console.log("LOOP FOR DAILY" , new Date(this.dailyTransactionProducts[index]['data'][i].created_at).getDate() , new Date(response[x]['created_at']).getDate());
                        if(index * 1 === response[x]['product_id'] * 1 && new Date(this.dailyTransactionProducts[index]['data'][i].x).getDate() === new Date(response[x]['created_at']).getDate()){
                          // this.dailyTransactionProducts[index]['data'][i].total_amount += response[x]['amount']
                          this.dailyTransactionProducts[index]['data'][i].y += response[x]['quantity']
                          this.dailyTransactionProducts[index]['data'][i].amt += (response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'])
                        }
                      }
                    }
                  }
                }
              }
            }
          }else{
            for(let x = 0; x < response.length; x++){
              response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_exempt_sales'] + response[x]['vat_zero_rated_sales'] + response[x]['vat_amount']
              response[x]['created_at'] = new Date(response[x]['created_at']).toUTCString().split(' ').slice(0, 5).join(' ')
              response[x]['profit'] = (response[x]['amount'] * 1) - ((response[x]['quantity'] * response[x]['cost']) + (response[x]['quantity'] * response[x]['discount_amount']))
              this.transactionProducts.push(response[x])

              let prepareData = []

              if(typeof this.dailyTransactionProducts[response[x]['product_id']] === 'undefined'){
                for(let ctr = new Date(this.startDatetimeFilter).getDate(), i = 0; ctr <= new Date(this.endDatetimeFilter).getDate(); ctr++, i++){
                  let data = {
                    x: '',
                    y: 0,
                    amt: 0
                  }
                  if(new Date(this.startDatetimeFilter).getDate() + i === new Date(response[x]['created_at']).getDate()){
                    Vue.set(data, 'y', response[x]['quantity'])
                    Vue.set(data, 'amt', response[x]['vat_sales'] + response[x]['vat_exempt_sales'] + response[x]['vat_zero_rated_sales'] + response[x]['vat_amount'])
                  }
                  let modifiedDate = new Date()

                  modifiedDate.setDate(new Date(this.startDatetimeFilter).getDate() + i)
                  Vue.set(data, 'x', modifiedDate.toString())

                  prepareData.push(data)
                }
                this.dailyTransactionProducts[response[x]['product_id']] = {
                  description: response[x]['description'],
                  cost: response[x]['cost'],
                  price: response[x]['price'],
                  discount_amt: response[x]['discount_amount'],
                  data: prepareData
                }
              }else{
                for(let index in this.dailyTransactionProducts){
                  for(let i = 0; i < this.dailyTransactionProducts[index]['data'].length; i++) {
                    // console.log("LOOP FOR DAILY" , new Date(this.dailyTransactionProducts[index]['data'][i].created_at).getDate() , new Date(response[x]['created_at']).getDate());
                    if(index * 1 === response[x]['product_id'] * 1 && new Date(this.dailyTransactionProducts[index]['data'][i].x).getDate() === new Date(response[x]['created_at']).getDate()) {
                    // this.dailyTransactionProducts[index]['data'][i].total_amount += response[x]['amount']
                      this.dailyTransactionProducts[index]['data'][i].y += response[x]['quantity']
                      this.dailyTransactionProducts[index]['data'][i].amt += (response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] + response[x]['vat_zero_rated_sales'])
                    }
                  }
                }
              }
            }
          }
          let forTableData = []
          for(let i in this.dailyTransactionProducts){
            for(let x in this.dailyTransactionProducts[i]['data']){
              if(this.dailyTransactionProducts[i]['data'][x].y !== 0){
                let data = {
                  description: this.dailyTransactionProducts[i]['description'],
                  created_at: this.dailyTransactionProducts[i]['data'][x].x.toString().split(' ').slice(0, 5).join(' '),
                  quantity: this.dailyTransactionProducts[i]['data'][x].y,
                  amount: this.dailyTransactionProducts[i]['data'][x].amt,
                  profit: this.dailyTransactionProducts[i]['data'][x].amt - ((this.dailyTransactionProducts[i]['data'][x].y * this.dailyTransactionProducts[i].cost) + (this.dailyTransactionProducts[i]['data'][x].y * this.dailyTransactionProducts[i].discount_amt))
                }
                forTableData.push(data)
              }
              delete this.dailyTransactionProducts[i]['data'][x].amt
            }
          }
          this.transactionProducts = forTableData
          console.log('DAILY', this.dailyTransactionProducts)
          this.$refs.lineGraph._prepData(this.dailyTransactionProducts, this.startDatetimeFilter, this.endDatetimeFilter)
          // }
        }else if(this.selectedReport === 'monthly') {
          this.monthlyTransactionProduct = {}
          let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let endDatetimeFilter = new Date(this.endDatetimeFilter.replace('T', ' ').replace('Z', '')).toString().split(' ').slice(0, 5).join(' ')
          let month = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
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

          // for(let ctr = new Date(startDatetimeFilter).getMonth(); ctr <= new Date(endDatetimeFilter).getMonth(); ctr++){
          //   let sampleData = []
          //   this.monthlyTransactionProduct = {}
          //   for(let responseCtr = 0; responseCtr < filteredData.length; responseCtr++){
          //     let tempDate = new Date(filteredData[responseCtr]['created_at']).toString().split(' ').slice(0, 5).join(' ')
          //     if(new Date(tempDate).getMonth() === ctr){
          //       sampleData.push(filteredData[responseCtr])
          //     }
          //   }
          //   for(let x = 0; x < sampleData.length; x++){
          //     if(typeof this.monthlyTransactionProduct[sampleData[x]['product_id']] === 'undefined'){
          //       let tempDate = new Date(sampleData[x]['created_at']).toString().split(' ').slice(0, 5).join(' ')
          //       this.monthlyTransactionProduct[sampleData[x]['product_id']] = {
          //         product_id: sampleData[x]['product_id'],
          //         description: sampleData[x]['description'],
          //         data: {
          //           x: month[new Date(tempDate).getMonth()],
          //           y: sampleData[x]['quantity']
          //         }
          //       }
          //     }else{
          //       for(let index in this.monthlyTransactionProduct){
          //         if(index * 1 === sampleData[x]['product_id'] * 1) {
          //           this.monthlyTransactionProduct[index]['data'].y += sampleData[x]['quantity']
          //         }
          //       }
          //     }
          //   }
          //   prepareData.push(this.monthlyTransactionProduct)
          // }
          console.log(filteredData)
          for(let x = 0; x < filteredData.length; x++){
            prepareData = []
            if(typeof this.monthlyTransactionProduct[filteredData[x]['product_id']] === 'undefined'){
              for(let ctr = new Date(startDatetimeFilter).getMonth(), i = 0; ctr <= new Date(endDatetimeFilter).getMonth(); ctr++, i++){
                let data = {
                  x: '',
                  y: 0,
                  amt: 0
                }
                if(new Date(startDatetimeFilter).getMonth() + i === new Date(filteredData[x]['created_at']).getMonth()){
                  Vue.set(data, 'y', filteredData[x]['quantity'])
                  Vue.set(data, 'amt', filteredData[x]['vat_sales'] + filteredData[x]['vat_exempt_sales'] + filteredData[x]['vat_zero_rated_sales'] + filteredData[x]['vat_amount'])
                }
                Vue.set(data, 'x', month[new Date(startDatetimeFilter).getMonth() + i])
                prepareData.push(data)
              }

              this.monthlyTransactionProduct[filteredData[x]['product_id']] = {
                description: filteredData[x]['description'],
                cost: filteredData[x]['cost'],
                price: filteredData[x]['price'],
                discount_amt: filteredData[x]['discount_amount'],
                data: prepareData
              }
            }else {
              for(let index in this.monthlyTransactionProduct){
                for(let i = 0; i < this.monthlyTransactionProduct[index]['data'].length; i++) {
                  if(index * 1 === filteredData[x]['product_id'] * 1 && this.monthlyTransactionProduct[index]['data'][i].x === month[new Date(filteredData[x]['created_at']).getMonth()]) {
                    this.monthlyTransactionProduct[index]['data'][i].y += filteredData[x]['quantity']
                    this.monthlyTransactionProduct[index]['data'][i].amt += (filteredData[x]['vat_sales'] + filteredData[x]['vat_amount'] + filteredData[x]['vat_exempt_sales'])
                  }
                }
              }
            }
          }
          let forTableData = []
          for(let i in this.monthlyTransactionProduct){
            for(let x in this.monthlyTransactionProduct[i]['data']){
              if(this.monthlyTransactionProduct[i]['data'][x].y !== 0){
                let data = {
                  description: this.monthlyTransactionProduct[i]['description'],
                  created_at: this.monthlyTransactionProduct[i]['data'][x].x,
                  quantity: this.monthlyTransactionProduct[i]['data'][x].y,
                  amount: this.monthlyTransactionProduct[i]['data'][x].amt,
                  profit: this.monthlyTransactionProduct[i]['data'][x].amt - ((this.monthlyTransactionProduct[i]['data'][x].y * this.monthlyTransactionProduct[i].cost) + (this.monthlyTransactionProduct[i]['data'][x].y * this.monthlyTransactionProduct[i].discount_amt))
                }
                forTableData.push(data)
              }
              delete this.monthlyTransactionProduct[i]['data'][x].amt
            }
          }
          this.transactionProducts = forTableData
          console.log('MONTH DATA', this.monthlyTransactionProduct)
          this.$refs.monthlyLineGraph._prepData(this.monthlyTransactionProduct, this.startDatetimeFilter, this.endDatetimeFilter)
        }else if(this.selectedReport === 'yearly') {
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
          console.log('YEAR DATA', this.yearlyTransactionProducts)
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
          console.log('HOURLY DATA', this.hourlyTransactionProducts)
          this.$refs.hourlyLineGraph._plotData(this.hourlyTransactionProducts)
        }

        /* else { // else if(this.selectedReport == 'hourly'){
          if(this.selectFilterValue.length !== 0){
            for(let x = 0; x < response.length; x++){
              for(let y = 0; y < this.selectFilterValue.length; y++){
                if(response[x]['product_id'] === this.selectFilterValue[y]['db_id']){
                  response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales']
                  this.transactionProducts.push(response[x])
                }
              }
            }
            console.log("TIMELY" , this.transactionProducts);
          }
          else{
            for(let x = 0; x < response.length; x++){
              response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales']
              this.transactionProducts.push(response[x]);
              if(typeof this.dailyTransactionProducts[response[x]['product_id']] === 'undefined'){
                this.dailyTransactionProducts[response[x]['product_id']] = {
                  description:'',
                  data : {
                    created_at : [],
                    total_amount: 0,
                    total_qty: 0
                  }
                }
              }
              this.dailyTransactionProducts[response[x]['product_id']]['description'] = response[x]['description']
              this.dailyTransactionProducts[response[x]['product_id']]['data'].created_at.push(response[x]['created_at'])
              this.dailyTransactionProducts[response[x]['product_id']]['data'].total_amount += response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] * 1
              this.dailyTransactionProducts[response[x]['product_id']]['data'].total_qty += response[x]['quantity'] * 1
            }
          }
        } */
        // resolve(response)
        // this.generateReport()
      }).catch(error => {
        console.log(error)
      })
    },
    addInitQuantity(){

    },
    reset(){
      this.transactions = []
      this.totalDiscount = 0
      this.totalAmount = 0
      this.generateReport()
    },
    generateReport(){
      console.log('generating', this.graphType, this.transactions.length)
      this.$refs.graph._plotData()
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
    },
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
