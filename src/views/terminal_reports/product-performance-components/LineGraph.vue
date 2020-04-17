<template>
  <div class="w-100">
    <div class="row">
      <div class="col ml-4 mt-4">
        <h5>Daily</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p>This graph shows all the transactions made for every hour within the selected timeframe.
          It identifies which products are sold the most in every day.
          </p>
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
      view: 1,
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
  methods: {
    switchDisplay(num){
      this.view = num * 1
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
        if(this.view * 1 === 1){
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
          this.passedData[date]['data']
        } else if(this.view * 1 === 2){
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
            this.passedData[date]['data']
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'].forEach(elem => {
            elem['y'] = (elem['y'] * this.passedData[date]['price'])
          })
        }else if(this.view * 1 === 3){
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
            this.passedData[date]['data']
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'].forEach(elem => {
            elem['y'] = (elem['y'] * this.passedData[date]['price']) - (elem['y'] * this.passedData[date]['discount_amt'])
          })
        } else if(this.view * 1 === 4){
          this.datacollection['datasets'][products.indexOf(this.passedData[date]['description'])]['data'] =
            this.passedData[date]['data']
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
      return (temp['month'] + 1) + '-' + temp['day'] + '-' + temp['year']
    },
    createDateLabels(){
      let labels = []
      for(let ctr = this.newStart; this.newStart <= this.newEnd;){
        labels.push(this.formatDate(ctr))
        ctr.setDate(ctr.getDate() + 1)
      }
      return labels
    }
  }
}
</script>
