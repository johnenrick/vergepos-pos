<template>
  <div class="w-100">
    <div class="row">
      <div class="col ml-4 mt-0">
        <h5>Transactions</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p>This graph shows all the transactions made for every hour within the selected timeframe.</p>
      </div>
    </div>
    <div class="text-center">
      <div class="row mt-2">
        <div class="col-2"></div>
        <div class="col-8 btn-group btn-group-sm">
          <button @click="switchDisplay(1)" class="btn" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">Quantity</button>
          <button @click="switchDisplay(2)" class="btn" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">Amount</button>
          <button @click="switchDisplay(3)" class="btn" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">Discount Amount</button>
          <button @click="switchDisplay(4)" class="btn" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">Profit</button>
        </div>
        <div class="col-2"></div>
      </div>
    </div>
    <bar-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig" :styles="{responsive: true, position: 'relative'}"></bar-chart>
  </div>
</template>
<script>
import BarChart from '@/components/Charts/BarChart.js'
export default {
  components: {
    BarChart
  },
  props: {
    dataProp: Array
  },
  data(){
    return {
      view: 1,
      passedData: [],
      datacollection: null,
      chartConfig: {
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0 // disables bezier curves
          }
        },
        title: {
          display: true,
        }
      }
    }
  },
  methods: {
    switchDisplay(num){
      this.view = num * 1
      this._plotData(this.passedData)
    },
    _plotData(data){
      this.passedData = data
      let dateLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
      let transactionProfit = []
      let transactionDiscount = []
      for(let date in this.passedData){
        dateLabel.push(this.passedData[date]['description'])
        transactionAmountTrend.push({
          x: date,
          y: (this.passedData[date]['amount'])
        })
        transactionDiscountAmountTrend.push({
          x: date,
          y: (this.passedData[date]['quantity'])
        })
        transactionProfit.push({
          x: date,
          y: (this.passedData[date]['profit'])
        })
        if(this.passedData[date]['discount_amt']){
          transactionDiscount.push({
            x: date,
            y: (this.passedData[date]['discount_amt'])
          })
        }
      }
      if(this.view * 1 === 2){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: [
            {
              label: 'Amount',
              fill: false,
              borderColor: '#007bff',
              backgroundColor: '#007bff',
              data: transactionAmountTrend
            }
          ]
        }
      } else if(this.view * 1 === 1){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: [
            {
              label: 'Quantity',
              fill: false,
              borderColor: '#17a2b8',
              backgroundColor: '#17a2b8',
              data: transactionDiscountAmountTrend
            }
          ]
        }
      }else if(this.view * 1 === 4){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: [
            {
              label: 'Profit',
              fill: false,
              borderColor: '#aac5b8',
              backgroundColor: '#aac5b8',
              data: transactionProfit
            }
          ]
        }
      } else if(this.view * 1 === 3){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: [
            {
              label: 'Discount',
              fill: false,
              borderColor: '#d2a2bd',
              backgroundColor: '#d2a2bd',
              data: transactionDiscount
            }
          ]
        }
      }
    }
  }
}
</script>
