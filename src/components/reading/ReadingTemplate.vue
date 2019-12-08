<template>
  <div class="" style="">
    <div>
      <table class="table">
        <tbody>
          <tr>
            <td>Date</td>
            <td>{{date}}</td>
          </tr>
          <tr>
            <td>Transaction Numbers</td>
            <td class="text-right">{{initialTransactionNumber + ' - ' + finalTransactionNumber}}</td>
          </tr>
          <tr>
            <td>Vat Sales</td>
            <td class="text-right">{{vatSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>Vat Exempt Sales</td>
            <td class="text-right">{{vatExemptSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>Vat Zero Rate Sales</td>
            <td class="text-right">{{vatZeroRatedSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>Total Sales</td>
            <td class="text-right">{{totalSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>Vat Amount</td>
            <td class="text-right">{{vatAmount | numberFormat}}</td>
          </tr>
          <tr>
            <td>Discount</td>
            <td class="text-right"></td>
          </tr>
          <template v-for="discount in discountAmounts">
            <tr>
              <td class="text-center">{{discount['description']}}</td>
              <td class="text-right">{{discount['amount'] | numberFormat}}</td>
            </tr>
          </template>
          <tr>
            <td>Total Discount</td>
            <td class="text-right">{{totalDiscount | numberFormat}}</td>
          </tr>
          <tr>
            <td>Gross Amount</td>
            <td class="text-right">{{vatSales + vatExemptSales + vatZeroRatedSales + vatAmount - totalDiscount | numberFormat}}</td>
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
export default {
  props: {
    date: String,
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
