<template>
  <div class="w-100">
    <div class="text-center">
      <div class="row mt-2 justify-content-center">
        <div class="col-8 btn-group btn-group-sm" :hidden="isEmpty ? true : false">
          <button @click="switchDisplay(1)" class="btn" :class="view === 1 ? ' btn-primary' : ' btn-outline-primary'">Quantity</button>
          <button @click="switchDisplay(2)" class="btn" :class="view === 2 ? ' btn-primary' : ' btn-outline-primary'">Amount</button>
          <button @click="switchDisplay(3)" class="btn" :class="view === 3 ? ' btn-primary' : ' btn-outline-primary'">Discount Amount</button>
          <button @click="switchDisplay(4)" class="btn" :class="view === 4 ? ' btn-primary' : ' btn-outline-primary'">Profit</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col ml-4 mt-2">
        <h5>Hourly Product Trend</h5>
      </div>
    </div>
    <div class="row">
      <div class="col mt-2 ml-4">
        <p class="mb-0">The graph shows the total item sold on each time of the day. This would help you determine which item is sold best or least on specific time</p>
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
      this._plotData(this.passedData)
    },
    _plotData(data){
      this.passedData = data
      if(Object.keys(this.passedData).length < 1){
        this.isEmpty = true
      } else{
        this.isEmpty = false
      }
      const xLabels = [ '12:00 am', '1:00 am', '2:00 am', '3:00 am', '4:00 am', '5:00 am', '6:00 am', '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 nn', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm', '11:00 pm' ]
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
      xLabels.forEach((xLabel) => {
        for(let productId in this.passedData){
          const xValue = xLabel
          let yValue = 0
          if(typeof this.passedData[productId]['data'][xLabel] !== 'undefined'){
            switch(this.view * 1){
              case 1: yValue = this.passedData[productId]['data'][xLabel]['quantity']; break
              case 2: yValue = this.passedData[productId]['data'][xLabel]['amount']; break
              case 3: yValue = this.passedData[productId]['data'][xLabel]['discount_amount']; break
              case 4: yValue = this.passedData[productId]['data'][xLabel]['profit']; break
            }
          }
          dataSets[products.indexOf(this.passedData[productId]['description'])]['data'].push({
            x: xValue,
            y: yValue
          })
        }
      })
      this.datacollection = {
        labels: xLabels,
        bezierCurve: false,
        datasets: dataSets
      }
    }
  }
}
</script>
