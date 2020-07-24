<template>
  <div class="" style="">
    {{isPrinting + ''}}
    <div :id="randomId">
      <div class="text-center">
        <p :style="isPrinting ? printingStyle : ''">
          <strong style="text-transform: uppercase">{{companyInformation.name}}</strong>
          <span v-if="companyInformation.address !== null || companyInformation.address === ''"><br>{{companyInformation.address}}</span>
          <span v-if="companyInformation.contact_number !== null"><br>{{companyInformation.contact_number}}</span>
        </p>
      </div>
      <h4 class="text-center" :style="isPrinting ? printingStyle : ''">X Reading</h4>
      <table class="table table-sm" :style="isPrinting ? printingStyle : ''">
        <tbody>
          <tr v-if="date">
            <td>Date</td>
            <td class="text-right">{{date | formatDate}}</td>
          </tr>
          <tr v-if="firstTransactionDatetime">
            <td>First Txn Date</td>
            <td class="text-right">{{firstTransactionDatetime | formatDate('mm/dd/yy hh:mm')}}</td>
          </tr>
          <tr v-if="lastTransactionDatetime">
            <td>Last Txn Date</td>
            <td class="text-right">{{lastTransactionDatetime | formatDate('mm/dd/yy hh:mm')}}</td>
          </tr>
          <tr>
            <td>Transaction Numbers</td>
            <td class="text-right">{{firstTransactionNumber + ' - ' + lastTransactionNumber}}</td>
          </tr>
          <tr>
            <td>Voided Transaction Count</td>
            <td class="text-right">{{voidedTransactionCount}}</td>
          </tr>
          <tr>
            <td>Vat Sales</td>
            <td class="text-right">{{vatSales | numberToMoney}}</td>
          </tr>
          <tr>
            <td>Vat Exempt Sales</td>
            <td class="text-right">{{vatExemptSales | numberToMoney}}</td>
          </tr>
          <tr>
            <td>Vat Zero Rate Sales</td>
            <td class="text-right">{{vatZeroRatedSales | numberToMoney}}</td>
          </tr>
          <tr>
            <td>Total Sales</td>
            <td class="text-right">{{totalSales | numberToMoney}}</td>
          </tr>
          <tr>
            <td>Vat Amount</td>
            <td class="text-right">{{vatAmount | numberToMoney}}</td>
          </tr>
          <tr >
            <td>Discount Amount</td>
            <td class="text-right">({{totalDiscount | numberToMoney}})</td>
          </tr>
          <tr class="bg-light text-center">
            <td class="py-1" colspan="2"><small>Discount breakdown</small></td>
          </tr>
          <template v-for="discount in discountAmounts">
            <tr class="bg-light">
              <td class="text-center py-1"><small>{{discount['description']}}</small></td>
              <td class="text-right py-1"><small>{{discount['amount'] | numberToMoney}}</small></td>
            </tr>
          </template>
          <!-- <tr>
            <td>Total Discount</td>
            <td class="text-right"></td>
          </tr> -->
          <tr >
            <td>Voided Amount</td>
            <td class="text-right">({{totalVoidedAmount | numberToMoney}})</td>
          </tr>
          <tr class="font-weight-bold">
            <td>Gross Amount</td>
            <td class="text-right"><big>{{vatSales + vatExemptSales + vatZeroRatedSales + vatAmount - totalDiscount - totalVoidedAmount| numberToMoney}}</big></td>
          </tr>
          <tr v-if="hasGrandTotal" class="font-weight-bold text-uppercase">
            <td>Previous Grand Total</td>
            <td class="text-right">{{previousGrandTotal | numberFormat}}</td>
          </tr>
          <tr v-if="hasGrandTotal" class="font-weight-bold text-uppercase">
            <td>Current Grand Total</td>
            <td class="text-right">{{currentGrandTotal | numberFormat}}</td>
          </tr>
        </tbody>
      </table>
      <div class="text-center" :style="isPrinting ? printingStyle : ''">
        <p :style="isPrinting ? printingStyle : ''">
          VergePOS<br>
          vergepos.com<br>
          Cebu City, Cebu
        </p>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import store from '@/vue-web-core/system/store'
import VueHtmlToPaper from 'vue-html-to-paper'

const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
  ],
  // styles: [
  //   'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
  //   'https://unpkg.com/kidlat-css/css/kidlat.css'
  // ]
}
Vue.use(VueHtmlToPaper, options)
export default {
  props: {
    totalVoidedAmount: Number,
    date: Date,
    firstTransactionDatetime: Date,
    lastTransactionDatetime: Date,
    vatSales: Number,
    vatExemptSales: Number,
    vatZeroRatedSales: Number,
    vatAmount: Number,
    discountAmounts: Object,
    totalDiscount: Number,
    previousGrandTotal: Number,
    voidedTransactionCount: Number,
    reprintTransactionCount: Number,
    salesTransactionCount: Number,
    firstTransactionNumber: Number,
    lastTransactionNumber: Number,
    hasGrandTotal: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
      randomId: '',
      printingStyle: {
        'width': '250px!important',
        'font-size': '8px!important',
        'font-family': 'monospace!important'
      },
      isPrinting: false
    }
  },
  mounted(){
    this.randomId = 'printMe' + this.generateRandomNumber(1, 10000)
  },
  methods: {
    init(){
    },
    printXReading(callback){
      this.isPrinting = true
      setTimeout(() => {
        this.$htmlToPaper(this.randomId)
        setTimeout(() => {
          this.isPrinting = false
          if(typeof callback === 'function'){
            callback()
          }
        }, 1000)
      }, 1000)
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
    },
    companyInformation(){
      return store.state.companyInformation ? store.state.companyInformation : null
    }
  },
  filters: {
    numberFormat: (value) => {
      return value.toFixed(2)
    }
  }
}
</script>
