<template>
  <div>
    <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig" :styles="{responsive: true, position: 'relative'}"></line-chart>
  </div>
</template>
<script>
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
export default {
  components: {
    LineChart
  },
  props: {
    transactions: Array
  },
  mounted(){
    // this._generate()
  },
  data(){
    return {
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
    _generate(){
      let transactionGroupByHour = {}
      for(let x = 0; x < this.transactions.length; x++){
        if(this.transactions[x]['status'] !== 1){
          continue
        }
        let hour = (new Date(this.transactions[x]['created_at'])).getHours()
        if(typeof transactionGroupByHour[hour] === 'undefined'){
          transactionGroupByHour[hour] = {
            amount: 0,
            discount_amount: 0
          }
        }
        transactionGroupByHour[hour]['amount'] += (this.transactions[x]['total_amount'] * 1).toFixed(2) * 1
        transactionGroupByHour[hour]['discount_amount'] += (this.transactions[x]['total_discount_amount'] * 1).toFixed(2) * 1
      }
      console.log(transactionGroupByHour)
      this.plotData(transactionGroupByHour)
    },
    plotData(transactionGroupByHour){
      let hourLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
      for(let hour in transactionGroupByHour){
        hourLabel.push(hour <= 12 ? hour + 'am' : (hour - 12) + 'pm')
        transactionAmountTrend.push({
          x: hour,
          y: (transactionGroupByHour[hour]['amount']).toFixed(2)
        })
        transactionDiscountAmountTrend.push({
          x: hour,
          y: (transactionGroupByHour[hour]['discount_amount']).toFixed(2)
        })
      }
      console.log('transactionAmountTrend', transactionAmountTrend)
      this.datacollection = {
        labels: hourLabel,
        bezierCurve: false,
        datasets: [
          {
            label: 'Sales',
            fill: false,
            borderColor: '#28a745',
            backgroundColor: '#ffffff',
            data: transactionAmountTrend
          }, {
            label: 'Discount',
            fill: false,
            borderColor: '#63cce9',
            backgroundColor: '#ffffff',
            data: transactionDiscountAmountTrend
          }
        ]
      }
    }
  }
}
</script>
