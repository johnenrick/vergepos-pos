<template>
  <div>
    <h2>Z Reading</h2>
    <div class="row">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="form-group row">
          <label class="col-form-label col-4">Date</label>
          <div class="col-8">
            <input v-model="dateSelected" type="date" class="form-control">
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6 col-lg-4">
        <table class="table">
          <tbody>
            <tr>
              <td>Date</td>
              <td>{{dateSelected}}</td>
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
              <td>Discount Breakdown</td>
              <td class="text-right"></td>
            </tr>
            <template v-for="discount in discountAmounts">
              <tr>
                <td class="text-center">{{discount['discount']}}</td>
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
            <tr class="font-weight-bold text-uppercase">
              <td>Previous Grand Total</td>
              <td class="text-right">{{previousGrandTotal | numberFormat}}</td>
            </tr>
            <tr class="font-weight-bold text-uppercase">
              <td>Current Grand Total</td>
              <td class="text-right">{{currentGrandTotal | numberFormat}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data(){
    return {
      dateSelected: null,
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
      finalTransactionNumber: 0
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
