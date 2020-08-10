<template>
  <div class="w-100">
    <div class="text-center">
      <div class="row mt-2 justify-content-center">
        <div class="col-sm-12 col-md-8 btn-group btn-group-sm" :hidden="isEmpty ? true : false">
          <button @click="switchDisplay(1)" class="btn" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">Quantity</button>
          <button @click="switchDisplay(2)" class="btn" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">Amount</button>
          <button @click="switchDisplay(3)" class="btn" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">Discount Amount</button>
          <button @click="switchDisplay(4)" class="btn" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">Profit</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col ml-4 mt-2">
        <h5>Daily Product Summary</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p>Product Daily Summary shows the total amount, quantity, profit and discount of each amount sold everyday. It can help you see up and down trends of a product.</p>
      </div>
    </div>
    <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig" :styles="{responsive: true, position: 'relative'}"></line-chart>
    <small class="text-muted"><strong>*Note:</strong> Dates with no data are automatically removed</small>
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
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
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
      let dateLabel = this.createDateLabels()
      let quantity = []
      let amount = []
      let discountAmount = []
      let profit = []
      let products = []
      for(let element in this.passedData){
        if(!products.includes(this.passedData[element]['description'])){
          products.push(this.passedData[element]['description'])
        }
      }
      products.forEach(element => {
        let color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        quantity.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        amount.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        discountAmount.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
        profit.push({
          label: element,
          fill: false,
          borderColor: color,
          backgroundColor: color,
          data: []
        })
      })
      let validDates = {}
      for(let x in this.passedData){
        for(let date in this.passedData[x]['data']){
          validDates[date] = true
          let productIndex = products.indexOf(this.passedData[x]['description'])
          quantity[productIndex]['data'].push({
            x: date,
            y: this.passedData[x]['data'][date]['quantity']
          })
          amount[productIndex]['data'].push({
            x: date,
            y: this.passedData[x]['data'][date]['amount']
          })
          discountAmount[productIndex]['data'].push({
            x: date,
            y: this.passedData[x]['data'][date]['discount_amount']
          })
          profit[productIndex]['data'].push({
            x: date,
            y: this.passedData[x]['data'][date]['profit']
          })
        }
      }
      dateLabel = dateLabel.filter(element => {
        return typeof validDates[element] !== 'undefined'
      })
      for(let index in this.passedData){
        let productIndex = products.indexOf(this.passedData[index]['description'])
        dateLabel.forEach(date => {
          if(typeof this.passedData[index]['data'][date] === 'undefined'){
            quantity[productIndex]['data'].push({
              x: date,
              y: 0
            })
            amount[productIndex]['data'].push({
              x: date,
              y: 0
            })
            discountAmount[productIndex]['data'].push({
              x: date,
              y: 0
            })
            profit[productIndex]['data'].push({
              x: date,
              y: 0
            })
          }
        })
        quantity[productIndex]['data'].sort((a, b) => {
          return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
        })
        amount[productIndex]['data'].sort((a, b) => {
          return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
        })
        discountAmount[productIndex]['data'].sort((a, b) => {
          return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
        })
        profit[productIndex]['data'].sort((a, b) => {
          return (new Date(a.x)).getTime() < (new Date(b.x)).getTime() ? -1 : 0
        })
      }
      if(this.view * 1 === 1){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: quantity
        }
      } else if(this.view * 1 === 2){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: amount
        }
      } if(this.view * 1 === 3){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: discountAmount
        }
      } if(this.view * 1 === 4){
        this.datacollection = {
          labels: dateLabel,
          bezierCurve: false,
          datasets: profit
        }
      }
    },
    formatDate(date){
      let temp = {}
      temp['year'] = new Date(date).getFullYear()
      temp['month'] = new Date(date).getMonth()
      temp['day'] = new Date(date).getDate()
      return this.padNumber(temp['month'] + 1) + '-' + this.padNumber(temp['day']) + '-' + temp['year']
    },
    createDateLabels(){
      let labels = []
      let tempStartDate = new Date(this.newStart)
      for(let ctr = tempStartDate; tempStartDate <= this.newEnd;){
        labels.push(this.formatDate(ctr))
        ctr.setDate(ctr.getDate() + 1)
      }
      return labels
    }
  }
}
</script>
