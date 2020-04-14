<template>
  <div class="w-100">
    <div class="row">
        <div class="col">
        <button @click="switchDisplay(1)" class="btn mt-4 ml-3" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">View Quantity</button>
        </div>
        <div class="col">
        <button @click="switchDisplay(2)" class="btn mt-4 ml-3" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">View Amount</button>
        </div>
        <div class="col">
        <button @click="switchDisplay(3)" class="btn mt-4 ml-3" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">View Discount Amount</button>
        </div>
        <div class="col">
        <button @click="switchDisplay(4)" class="btn mt-4 ml-3" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">View Profit</button>
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
        if(this.passedData[date]['discount']){
          transactionDiscount.push({
            x: date,
            y: (this.passedData[date]['discount'])
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
              label: 'Quantity',
              fill: false,
              borderColor: '#17a2b8',
              backgroundColor: '#17a2b8',
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
              borderColor: '#17a2b8',
              backgroundColor: '#17a2b8',
              data: transactionDiscount
            }
          ]
        }
      }
    }
  }
}
</script>
