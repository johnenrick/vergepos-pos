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
      let transactionGroup = {}
      for(let x = 0; x < transactions.length; x++){
        if(transactions[x]['status'] !== 1){
          continue
        }
        let transactionDate = new Date(transactions[x]['created_at'])
        let date = this.padNumber(transactionDate.getDate()) + '-' + this.padNumber(transactionDate.getMonth() + 1) + '-' + this.padNumber(transactionDate.getFullYear())
        if(typeof transactionGroup[date] === 'undefined'){
          transactionGroup[date] = {
            amount: 0,
            discount_amount: 0
          }
        }
        transactionGroup[date]['amount'] += (transactions[x]['total_amount'] * 1).toFixed(2) * 1
        transactionGroup[date]['discount_amount'] += (transactions[x]['total_discount_amount'] * 1).toFixed(2) * 1
      }
      this.plotData(transactionGroup)
    },
    plotData(transactionGroup){
      let dateLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
      for(let date in transactionGroup){
        dateLabel.push(date)
        transactionAmountTrend.push({
          x: date,
          y: (transactionGroup[date]['amount']).toFixed(2)
        })
        transactionDiscountAmountTrend.push({
          x: date,
          y: (transactionGroup[date]['discount_amount']).toFixed(2)
        })
      }
      this.datacollection = {
        labels: dateLabel,
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
