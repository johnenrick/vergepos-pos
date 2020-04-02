<template>
  <div class="w-100">
    <button @click="switchDisplay()" class="btn btn-outline-primary mt-4 ml-3">View {{viewDisplay}}</button>
    <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig" :styles="{responsive: true, position: 'relative'}"></line-chart>
  </div>
</template>
<script>
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
export default {
  components: {
    LineChart
  },
  data(){
    return {
      view: true,
      viewDisplay: 'Quantity',
      passedData: {},
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
  methods: {
    switchDisplay(){
      this.view = !this.view
      if(!this.view){
        this.viewDisplay = 'Profit'
      } else{
        this.viewDisplay = 'Quantity'
      }
    },
    _prepData(data, start, end){
      this.passedData = data
      this.newStart = start.slice(0, 10)
      let temp = this.newStart.split('-')
      this.newStart = new Date(temp[0], (temp[1] * 1 - 1), temp[2], 0, 0, 0, 0)
      this.newEnd = end.slice(0, 10)
      temp = this.newEnd.split('-')
      this.newEnd = new Date(temp[0], (temp[1] * 1 - 1), temp[2], 23, 59, 59, 99)
      this.plotData()
    },
    plotData(){
      let dateLabel = this.createDateLabels()
      let products = []
      for(let element in this.passedData){
        if(!products.includes(this.passedData[element]['description'])){
          products.push(this.passedData[element]['description'])
        }
      }
      this.datacollection = {
        labels: dateLabel,
        bezierCurve: false,
        datasets: [
        ]
      }
      products.forEach(element => {
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        this.datacollection.datasets.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
      })
      for(let date in this.passedData){
        this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
          this.passedData[date]['data']
        if(this.view){
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'].forEach(elem => {
            elem['y'] = (elem['y'] * this.passedData[date]['price']) - (elem['y'] * this.passedData[date]['cost'])
          })
        }
      }
    },
    formatDate(date){
      let temp = {}
      temp['year'] = new Date(date).getFullYear()
      temp['month'] = new Date(date).getMonth()
      temp['day'] = new Date(date).getDate()
      return temp['year'] + '-' + temp['month'] + '-' + temp['day']
    },
    createDateLabels(){
      let labels = []
      for(let ctr = this.newStart.getFullYear(); ctr <= this.newEnd.getFullYear(); ctr++){
        labels.push(ctr)
      }
      return labels
    }
  }
}
</script>
