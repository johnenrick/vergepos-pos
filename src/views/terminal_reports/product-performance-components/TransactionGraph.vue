<template>
  <div class="w-100">
    <button @click="switchDisplay()" class="btn btn-outline-primary mt-4 ml-3">View {{viewDisplay}}</button>
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
      view: true,
      viewDisplay: 'Quantity',
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
    switchDisplay(){
      this.view = !this.view
      if(!this.view){
        this.viewDisplay = 'Amount'
      } else{
        this.viewDisplay = 'Quantity'
      }
      this._plotData(this.passedData)
    },
    _plotData(data){
      this.passedData = data
      let dateLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
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
      }
      if(this.view){
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
      } else{
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
      }
    }
  }
}
</script>
