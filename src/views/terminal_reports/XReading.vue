<template>
  <div class="section p-3">
    <h2>X Reading</h2>
    <div class="row mb-2 justify-content-center">
      <div class="col-12 col-md-7 col-lg-5 mb-2 bg-white p-3 shadow-sm border">
        <div class="form-group row">
          <div class="col-12">
            <p class="alert alert-warning">This page is still experimental. Please contact us if you find problems in the calculations</p>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-4">Start Date</label>
          <div class="col-8">
            <datetime v-model="startDatetime" class="theme-orange"
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
        <div class="form-group row">
          <label class="col-form-label col-4">End Date</label>
          <div class="col-8">
            <datetime v-model="endDatetime" class="theme-orange"
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
        <div class="form-group row">
          <label class="col-form-label col-4">Cashier</label>
          <div class="col-8">
            <select v-model="cashierId" class="form-control">
              <option value="0" selected>Any</option>
              <template  v-for="(cashier, index) in cashierList">
                <option :value="cashier['db_id']" :key="index">{{cashier['first_name'] + ' ' + cashier['last_name']}}</option>
              </template>
            </select>
          </div>
        </div>
        <div class="w-100 text-right">
          <button v-if="!isGenerating" @click="generateReading" class="btn btn-primary">Generate</button>
          <span v-else>Generating...</span>
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4 border rounded py-2 bg-white shadow-sm">
        <x-reading ref="xReading"  />
        <div class="w-100 text-right pb-2">
          <button :disabled="isPrinting" class="btn btn-success" @click="printXReading"><fa icon="print"/> Print Reading</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import XReading from '@/components/reading/XReading'
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import 'vue-datetime/dist/vue-datetime.css'
import User from '@/database/controller/user.js'
export default {
  components: {
    XReading,
    Datetime
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      isGenerating: false,
      startDatetime: null,
      endDatetime: null,
      cashierId: 0,
      cashierList: [],
      vatSales: 0,
      vatExemptSales: 0,
      vatZeroRatedSales: 0,
      vatAmount: 0,
      discountAmounts: [{
        discount: 'Senior Citizen',
        amount: 0
      }],
      totalDiscount: 0,
      previousGrandTotal: 0,
      voidedTransactionCount: 0,
      reprintTransactionCount: 0,
      salesTransactionCount: 0,
      initialTransactionNumber: 0,
      finalTransactionNumber: 0,
      isPrinting: false
    }
  },
  methods: {
    printXReading(){
      this.isPrinting = true
      this.$refs.xReading.printXReading(() => {
        this.isPrinting = false
      })
    },
    init(){
      let currentDate = new Date()
      let defaultTime = currentDate.getFullYear() + '-' + this.padNumber(currentDate.getMonth() + 1) + '-' + this.padNumber(currentDate.getDate()) + 'T' + this.padNumber(0) + ':' + this.padNumber(0) + ':' + this.padNumber(0) + '.000Z'
      this.startDatetime = defaultTime
      this.generateCashierList()
    },
    _getPaymentMethodSummary(){
      return this.$refs.xReading._getPaymentMethodSummary()
    },
    generateReading(){
      this.isGenerating = true
      let startDatetime = new Date((this.startDatetime.replace('T', ' ').split('.'))[0])
      let endDatetime = new Date((this.endDatetime.replace('T', ' ').split('.'))[0])
      this.$refs.xReading._generate(startDatetime, endDatetime, this.cashierId * 1).finally(() => {
        this.isGenerating = false
      })
    },
    generateCashierList(){
      let userDB = new User()
      userDB.get({
        where: {
          is_cashier: 1
        }
      }).then((response) => {
        this.cashierList = response
      })
    }
  },
  watch: {
    startDatetime(newDatetime){
      let startdatetimeSegnment = newDatetime.split('T')
      this.endDatetime = startdatetimeSegnment[0] + 'T23:59:59.999Z'
    }
  },
  computed: {
    totalSales(){
      return this.vatSales + this.vatExemptSales + this.vatZeroRatedSales
    },
    grossAmount(){
      return this.totalSales - this.totalDiscount
    },
    currentGrandTotal(){
      return this.previousGrandTotal + this.grossAmount
    }
  },
  filters: {
    numberFormat: (value) => {
      return value.toFixed(2)
    }
  }
}
</script>
<style scoped type="scss">

.theme-orange .vdatetime-popup__header,
.theme-orange .vdatetime-calendar__month__day--selected > span > span,
.theme-orange .vdatetime-calendar__month__day--selected:hover > span > span {
  background: #FF9800;
}

.theme-orange .vdatetime-year-picker__item--selected,
.theme-orange .vdatetime-time-picker__item--selected,
.theme-orange .vdatetime-popup__actions__button {
  color: #ff9800;
}
</style>
