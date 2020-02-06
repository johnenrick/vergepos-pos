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
  </div>
</template>
<script>
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import 'vue-datetime/dist/vue-datetime.css'
import TransactionProduct from '@/database/controller/transaction-product.js'
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Product from '@/database/controller/product.js'

export default {
  components: {
    Vuetable,
    Datetime,
    VueSelect
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      graphType: 'null',
      startDatetimeFilter: null,
      endDatetimeFilter: null,
      productDB : new Product(),
      selectFilterValue: [],
      selectFilterOption: [],
      transactions: [],
      transactionProducts: [],
      dailyTransactionProducts: [],
      weeklyTransactionProducts: [],
      totalDiscount: 0,
      totalAmount: 0,
      selectedReport : 'transaction',
      tableSetting: {
        columns: [
        {
        name: 'created_at',
        title: 'Date & Time',
        titleClass: 'text-center',
        dataClass: 'text-center',
        callback: (value) => {
            return value
          }
        },  
        {
          name: 'description',
          title: 'Description',
          titleClass: 'text-center',
          dataClass: 'text-center',
          callback: (value) => {
            return this.padNumber(value, 7)
          }
        }, 
        {
          name: 'quantity',
          title: 'Qty',
          titleClass: 'text-center',
          dataClass: 'text-right'
        }, {
          name: 'amount',
          title: 'Amount',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return ("P" + this.numberToMoney(value))
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
      this.productDB.get().then((e) =>{
        this.selectFilterOption = e
        // console.log(this.selectFilterOption);
        // console.log(this.selectFilterOption[0].description)
      });
      this.generate()
      
    },
    viewGraph(){
    },
    openTransaction(transactionId){
    },
    generate(){
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('T' , ' ').replace('Z' , ''));

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
        console.log(response);

        if(this.selectedReport == 'transaction'){
          if(response.length != 0){
            let productArr = {}
            if(this.selectFilterValue.length != 0){
              for(let x = 0; x < response.length; x++){
                for(let y = 0; y < this.selectFilterValue.length; y++){
                  if(response[x]['product_id'] == this.selectFilterValue[y]['db_id']){
                    if(typeof productArr[response[x]['product_id']] === 'undefined'){
                      productArr[response[x]['product_id']] = {
                        quantity: 0,
                        amount: 0
                      }
                    }
                    productArr[response[x]['product_id']]['created_at'] = 'N/A'
                    productArr[response[x]['product_id']]['description'] = response[x]['description']
                    productArr[response[x]['product_id']]['amount'] += response[x]['vat_sales'] + response[x]['vat_amount']  + response[x]['vat_exempt_sales']* 1
                    productArr[response[x]['product_id']]['quantity'] += response[x]['quantity'] * 1
                  }
                }
              }
            }else{
              for(let x= 0; x< response.length; x++){
                if(typeof productArr[response[x]['product_id']] === 'undefined'){
                  productArr[response[x]['product_id']] = {
                    quantity: 0,
                    amount: 0
                  }
                }
                productArr[response[x]['product_id']]['created_at'] = 'N/A'
                productArr[response[x]['product_id']]['description'] = response[x]['description']
                productArr[response[x]['product_id']]['amount'] += response[x]['vat_sales'] + response[x]['vat_amount']  + response[x]['vat_exempt_sales']* 1
                productArr[response[x]['product_id']]['quantity'] += response[x]['quantity'] * 1
              }
            }
            
            for(let x in productArr){
              this.transactionProducts.push(productArr[x])
            }

            // console.log(this.transactionProducts);
          }
        }else{//else if(this.selectedReport == 'hourly'){
          if(this.selectFilterValue.length != 0){
            for(let x= 0; x<response.length; x++){
              for(let y= 0; y<this.selectFilterValue.length; y++){
                if(response[x]['product_id'] == this.selectFilterValue[y]['db_id']){
                  response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] 
                  this.transactionProducts.push(response[x])
                }
              }
            }
          }else{
            for(let x= 0; x<response.length; x++){
              response[x]['amount'] = response[x]['vat_sales'] + response[x]['vat_amount'] + response[x]['vat_exempt_sales'] 
              this.transactionProducts.push(response[x])
            }
          }          
        }
        
        // resolve(response)
        // this.generateReport()
      }).catch(error => {
        reject(error)
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
