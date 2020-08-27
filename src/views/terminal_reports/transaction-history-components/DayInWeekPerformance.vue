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
    _generate(transactions){
      let transactionGroupByDay = {}
      for(let x = 0; x < transactions.length; x++){
        if(transactions[x]['status'] !== 1){
          continue
        }
        let day = (new Date(transactions[x]['created_at'])).getDay()
        if(typeof transactionGroupByDay[day] === 'undefined'){
          transactionGroupByDay[day] = {
            amount: 0,
            discount_amount: 0
          }
        }
        transactionGroupByDay[day]['amount'] += (transactions[x]['total_amount'] * 1).toFixed(2) * 1
        transactionGroupByDay[day]['discount_amount'] += (transactions[x]['total_discount_amount'] * 1).toFixed(2) * 1
      }
      this.plotData(transactionGroupByDay)
    },
    plotData(transactionGroupByDay){
      let dayLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
      let dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      for(let day in transactionGroupByDay){
        dayLabel.push(dayName[day])
        transactionAmountTrend.push({
          x: day,
          y: (transactionGroupByDay[day]['amount']).toFixed(2)
        })
        transactionDiscountAmountTrend.push({
          x: day,
          y: (transactionGroupByDay[day]['discount_amount']).toFixed(2)
        })
      }
      this.datacollection = {
        labels: dayLabel,
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
