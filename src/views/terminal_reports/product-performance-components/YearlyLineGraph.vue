<template>
  <div class="w-100">
    <div class="text-center">
      <div class="row mt-2 justify-content-center">
        <div class="col-8 col-md-8 btn-group btn-group-sm" :hidden="isEmpty ? true : false">
          <button @click="switchDisplay(1)" class="btn" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">Quantity</button>
          <button @click="switchDisplay(2)" class="btn" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">Amount</button>
          <button @click="switchDisplay(3)" class="btn" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">Discount Amount</button>
          <button @click="switchDisplay(4)" class="btn" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">Profit</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col ml-4 mt-2">
        <h5>Yearly</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p>This graph shows all the transactions made for every hour within the selected timeframe.
          It identifies which products are sold the most in every year.
          </p>
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
      isEmpty: Boolean,
      view: 1,
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
    switchDisplay(num){
      this.view = num * 1
      this.datacollection = null
      this.plotData()
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
      if(Object.keys(this.passedData).length < 1){
        this.isEmpty = true
      } else{
        this.isEmpty = false
      }
      let dateLabel = this.createDateLabels()
      let qty = []
      let amt = []
      let discAmt = []
      let prft = []
      let products = []
      for(let element in this.passedData){
        if(!products.includes(this.passedData[element]['description'])){
          products.push(this.passedData[element]['description'])
        }
      }
      products.forEach(element => {
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        qty.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        amt.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        discAmt.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        prft.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
      })
      for(let x in this.passedData){
        for(let y in this.passedData[x]['data']){
          qty[products.indexOf(this.passedData[x]['description'])]['data'].push({
            x: this.passedData[x]['data'][y]['x'],
            y: this.passedData[x]['data'][y]['y']
          })
          amt[products.indexOf(this.passedData[x]['description'])]['data'].push({
            x: this.passedData[x]['data'][y]['x'],
            y: this.passedData[x]['data'][y]['y'] * this.passedData[x]['price']
          })
          discAmt[products.indexOf(this.passedData[x]['description'])]['data'].push({
            x: this.passedData[x]['data'][y]['x'],
            y: (this.passedData[x]['data'][y]['y'] * this.passedData[x]['price']) - (this.passedData[x]['data'][y]['y'] * this.passedData[x]['discount_amt'])
          })
          prft[products.indexOf(this.passedData[x]['description'])]['data'].push({
            x: this.passedData[x]['data'][y]['x'],
            y: (this.passedData[x]['data'][y]['y'] * this.passedData[x]['price']) - (this.passedData[x]['data'][y]['y'] * this.passedData[x]['cost'])
          })
        }
      }
      if(this.view * 1 === 1){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: qty
        }
      } else if(this.view * 1 === 2){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: amt
        }
      } if(this.view * 1 === 3){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: discAmt
        }
      } if(this.view * 1 === 4){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: prft
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
