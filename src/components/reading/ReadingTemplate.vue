<template>
  <div class="" style="">
    <div id="printMe">
      <table class="table">
        <tbody>
          <tr>
            <td>Date</td>
            <td class="text-right">{{date | formatDate}}</td>
          </tr>
          <tr>
            <td>Transaction Numbers</td>
            <td class="text-right">{{initialTransactionNumber + ' - ' + finalTransactionNumber}}</td>
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
          <tr class="font-weight-bold">
            <td>Gross Amount</td>
            <td class="text-right"><big>{{vatSales + vatExemptSales + vatZeroRatedSales + vatAmount - totalDiscount | numberToMoney}}</big></td>
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
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import VueHtmlToPaper from 'vue-html-to-paper'

const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
  ],
  styles: [
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    'https://unpkg.com/kidlat-css/css/kidlat.css'
  ]
}
Vue.use(VueHtmlToPaper, options)
export default {
  props: {
    date: Date,
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
    initialTransactionNumber: Number,
    finalTransactionNumber: Number,
    hasGrandTotal: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
    }
  },
  methods: {
    init(){
    },
    printXReading(){
      this.$htmlToPaper('printMe')
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
