<template>
  <div class="w-100">
    <div class="row">
      <div class="col ml-4 mt-4">
        <h5>Hourly</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p>This graph shows all the transactions made for every hour within the selected timeframe.
          It identifies which products are sold the most in specific time of the day.
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
      this._plotData(this.passedData)
    },
    _plotData(data){
      if(data !== this.passedData){
        this.passedData = data
      }
      let dateLabel = [ '0:00', '0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '21:00', '22:00', '23:00', ]
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
    }
  }
}
</script>
