<template>
  <div>
    <div class="card border-primary mb-3" >
      <div class="card-header bg-primary text-white">Weekly Sales</div>
      <div class="card-body text-primary" >
        <p class="card-text"><fa icon="info-circle" /> The graph below shows the your business performance in the last 7 days. From Aug 7, 2019 to Aug 14, 2019</p>
        <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig"></line-chart>
      </div>
    </div>

  </div>
</template>
<script>
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
// import Transaction from '@/database/controller/transaction'
export default {
  components: {
    LineChart
  },
  data () {
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
  mounted () {
    this.fillData()
  },
  methods: {
    fillData () {
      let sampleData = []
      let sampleData2 = []
      let sampleData3 = []
      let xLabel = []
      for(let x = 100000000; x < 100000020; x++){
        xLabel.push(x)
        sampleData.push({
          x: x,
          y: this.getRandomInt()
        })
        sampleData2.push({
          x: x,
          y: this.getRandomInt() * ('0.0' + this.getRandomInt())
        })
        sampleData3.push({
          x: x,
          y: this.getRandomInt() * ('0.' + this.getRandomInt())
        })
      }
      this.datacollection = {
        labels: xLabel,
        bezierCurve: false,
        datasets: [
          {
            label: 'Total Sales',
            fill: false,
            borderColor: '#28a745',
            backgroundColor: '#ffffff',
            data: sampleData
          }, {
            label: 'Number of Transactions',
            fill: false,
            borderColor: '#63cce9',
            backgroundColor: '#ffffff',
            data: sampleData2
          }, {
            label: 'Items Sold',
            fill: false,
            borderColor: '#f2a11d',
            backgroundColor: '#ffffff',
            data: sampleData3
          }
        ]
      }
    },
    getRandomInt () {
      return Math.floor(Math.random() * (50 - 5 + 1)) + 5
    }
  }
}
</script>
