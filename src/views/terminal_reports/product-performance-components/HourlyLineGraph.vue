<template>
  <div class="w-100">
    <button @click="switchDisplay()" class="btn btn-outline-primary mt-4 ml-3">{{viewDisplay}}</button>
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
      view: false,
      viewDisplay: 'Switch to Profit',
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
      if(this.view){
        this.viewDisplay = 'Switch to Profit'
      } else{
        this.viewDisplay = 'Switch to  Quantity'
      }
    },
    plotData(data){
      this.passedData = data
      let dateLabel = [ '0:00', '0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '21:00', '22:00', '23:00', ]
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
    }
  }
}
</script>
