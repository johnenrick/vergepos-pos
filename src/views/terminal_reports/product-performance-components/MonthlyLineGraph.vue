<template>
  <div class="w-100">
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
    dataProp: Array,
    newStartProp: String,
    newEndProp: String
  },
  data(){
    return {
      passedData: [],
      newStart: '',
      newEnd: '',
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
  watch: {
    dataProp(newData){
      this.passedData = newData
      this.prepData()
    }
  },
  methods: {
    prepData(){
      this.newStart = this.newStartProp.slice(0, 10)
      let temp = this.newStart.split('-')
      this.newStart = new Date(temp[0], (temp[1] * 1 - 1), temp[2], 0, 0, 0, 0)
      this.newEnd = this.newEndProp.slice(0, 10)
      temp = this.newEnd.split('-')
      this.newEnd = new Date(temp[0], (temp[1] * 1 - 1), temp[2], 23, 59, 59, 99)
      this.plotData()
    },
    plotData(){
      let dateLabel = this.createDateLabels()
      let products = []
      this.passedData.forEach(element => {
        if(!products.includes(element['description'])){
          products.push(element['description'])
        }
      })
      this.datacollection = {
        labels: dateLabel,
        bezierCurve: false,
        datasets: [
        ]
      }
      products.forEach(element => {
        this.datacollection.datasets.push({
          label: element,
          fill: false,
          borderColor: '#007bff',
          backgroundColor: '#007bff',
          data: []
        })
      })
      console.log('walala', this.datacollection)
      for(let date in this.passedData){
        this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
          this.passedData[date]['data']
      }
      console.log('hello', this.datacollection)
    },
    formatDate(date){
      let temp = {}
      temp['year'] = new Date(date).getFullYear()
      temp['month'] = new Date(date).getMonth()
      temp['day'] = new Date(date).getDate()
      return temp['year'] + '-' + temp['month'] + '-' + temp['day']
    },
    createDateLabels(){
      let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      let labels = []
      for(let ctr = this.newStart.getMonth(); ctr <= this.newEnd.getMonth(); ctr++){
        labels.push(months[ctr])
      }
      return labels
    }
  }
}
</script>
