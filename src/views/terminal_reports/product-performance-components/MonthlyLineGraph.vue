<template>
  <div class="w-100">
    <div class="text-center">
      <div class="row mt-2">
        <div class="col-2"></div>
        <div class="col-8 btn-group btn-group-sm" :hidden="isEmpty ? true : false">
          <button @click="switchDisplay(1)" class="btn" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">Quantity</button>
          <button @click="switchDisplay(2)" class="btn" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">Amount</button>
          <button @click="switchDisplay(3)" class="btn" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">Discount Amount</button>
          <button @click="switchDisplay(4)" class="btn" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">Profit</button>
        </div>
        <div class="col-2"></div>
      </div>
    </div>
    <div class="row">
      <div class="col ml-4 mt-2">
        <h5>Monthly Product Summary</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p class="mb-0">This graph shows all the transactions made for every hour within the selected timeframe. It identifies which products are sold the most in every month.</p>
      </div>
    </div>
    <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig" :styles="{responsive: true, position: 'relative'}"></line-chart>
    <small class="text-muted"><strong>*Note:</strong> Months with no data are automatically removed</small>
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
      isEmpty: Boolean,
      view: 1,
      passedData: {},
      newStart: '',
      newEnd: '',
      monthNames: ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
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
      this.datacollection = null
      this.plotData()
    },
    _plotData(data, start, end){
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
      if(Object.keys(this.passedData).length < 1){
        this.isEmpty = true
      } else{
        this.isEmpty = false
      }

      let dataSets = []
      let products = []
      for(let element in this.passedData){
        if(!products.includes(this.passedData[element]['description'])){
          products.push(this.passedData[element]['description'])
        }
      }
      products.forEach(element => {
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        dataSets.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
      })
      let xLabels = []
      for(let x in this.passedData){
        for(let dataKey in this.passedData[x]['data']){
          let xValue = dataKey
          if(xLabels.indexOf(xValue) === -1){
            xLabels.push(xValue)
          }
          let yValue = 0
          switch(this.view * 1){
            case 1: yValue = this.passedData[x]['data'][dataKey]['quantity']; break
            case 2: yValue = this.passedData[x]['data'][dataKey]['amount']; break
            case 3: yValue = this.passedData[x]['data'][dataKey]['discount_amount']; break
            case 4: yValue = this.passedData[x]['data'][dataKey]['profit']; break
          }
          dataSets[products.indexOf(this.passedData[x]['description'])]['data'].push({
            x: xValue,
            y: yValue
          })
        }
      }
      xLabels.sort((a, b) => {
        return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
      })
      xLabels.forEach((xLabel) => {
        for(let x in this.passedData){
          if(typeof this.passedData[x]['data'][xLabel] === 'undefined'){
            dataSets[products.indexOf(this.passedData[x]['description'])]['data'].push({
              x: xLabel,
              y: 0
            })
          }
        }
      })
      for(let index in this.passedData){
        let productIndex = products.indexOf(this.passedData[index]['description'])
        dataSets[productIndex]['data'].sort((a, b) => {
          return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
        })
      }
      this.datacollection = {
        labels: xLabels,
        bezierCurve: false,
        datasets: dataSets
      }
    },
    formatDate(date){
      let temp = {}
      temp['year'] = new Date(date).getFullYear()
      temp['month'] = new Date(date).getMonth()
      temp['day'] = new Date(date).getDate()
      return temp['year'] + '-' + temp['month'] + '-' + temp['day']
    }
  }
}
</script>
