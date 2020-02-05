<template>
  <div>
    <div class="card border-info mb-3" >
      <div class="card-header bg-info text-white">Activity</div>
      <div class="card-body text-primary" >
        <p class="card-text"><fa icon="info-circle" /> Shows you what hours you are more busy in terms of number of transactions</p>
      </div>
      <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig"></line-chart>
    </div>
  </div>
</template>
<script>
import Transaction from '@/database/controller/transaction'
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
export default {
  components: {
    LineChart
  },
  data() {
    return{
      datacollection: {},
      chartConfig: {
        maintainAspectRatio: false,
        elements: {
          line: {
            tension: 0
          }
        },
        title: {
          display: true,
        }
      }
    }
  },
  mounted(){
    this._initialize()
  },
  methods: {
    _initialize(){
      this.groupTransactions()
    },
    transactionGroupToGraph(groupOfTransactions){
      let graphObject = [{}]
      let startCtr = 0
      let endCtr = 0
      let start = groupOfTransactions[0]['time_start']
      let end = groupOfTransactions[groupOfTransactions.length - 1]['time_end']
      this.dateSetter(start, end, graphObject)
      for(let index in groupOfTransactions){
        startCtr = this.roundMinutes(this.timeToFullDate(groupOfTransactions[index]['time_start'])).getHours() * 2
        if(this.roundMinutes(this.timeToFullDate(groupOfTransactions[index]['time_start'])).getMinutes() === 30){
          startCtr++
        }
        endCtr = this.roundMinutes(this.timeToFullDate(groupOfTransactions[index]['time_end'])).getHours() * 2
        if(this.roundMinutes(this.timeToFullDate(groupOfTransactions[index]['time_end'])).getMinutes() === 30){
          endCtr++
        }
        for(;startCtr <= endCtr; startCtr++){
          graphObject[startCtr]['y'] = groupOfTransactions[index]['transactions']
        }
      }
      this.removeExcess(graphObject, start, end)
      let xLabel = []
      for(let x in graphObject){
        xLabel.push(graphObject[x]['x'])
      }
      this.datacollection = {
        labels: xLabel,
        bezierCurve: false,
        datasets: [
          {
            label: 'Transactions',
            fill: false,
            borderColor: '#28a745',
            backgroundColor: '#ffffff',
            data: graphObject
          }
        ]
      }
    },
    roundMinutes(time){
      let temp = time.getMinutes()
      let hh = time.getHours()
      if(temp > 30){
        if(temp > 45){
          hh++
          time.setHours(hh)
          time.setMinutes(0)
        } else{
          time.setMinutes(30)
        }
      } else{
        if(temp > 15){
          time.setMinutes(30)
        } else{
          time.setMinutes(0)
        }
      }
      time.setSeconds(0)
      time.setMilliseconds(0)
      return time
    },
    groupTransactions(){
      let activityHour = [{}]
      let testResult = {}
      let next = 0
      let startDateFilter = new Date()
      startDateFilter.setHours(0)
      startDateFilter.setMinutes(0)
      startDateFilter.setSeconds(1)
      let endDateFilter = new Date()
      endDateFilter.setMinutes(59)
      endDateFilter.setSeconds(59)
      let query = {
        where: {
          created_at: {
            '>': startDateFilter.getTime(),
            '<': endDateFilter.getTime(),
          },
          status: 1
        },
        order: {
          by: 'created_at',
          type: 'asc'
        }
      }
      let t1 = ''
      let t2 = ''
      let index = 0;
      (new Transaction()).get(query).then((response) => {
        testResult = response || []
        for(let x in testResult){
          if(x < ((testResult.length) - 1)){
            next = (x * 1) + 1
          }
          t1 = this.timeToMinutes(testResult[x]['created_at'])
          t2 = this.timeToMinutes(testResult[next]['created_at'])
          if(isNaN(activityHour[index]['transactions'])){
            activityHour[index]['transactions'] = 0
          }
          if((t2 - t1) <= 15){
            if(activityHour[index]['time_start'] === undefined){
              activityHour[index]['time_start'] = (this.fullDatetoTime(new Date(testResult[x]['created_at']), 24))
              activityHour[index]['transactions']++
            } else{
              activityHour[index]['transactions']++
            }
            if((x * 1) === ((testResult.length) - 1)){
              activityHour[index]['time_end'] = (this.fullDatetoTime(new Date(testResult[x]['created_at']), 24))
            }
          } else{
            activityHour.push({})
            if(activityHour[index]['time_start'] === undefined){
              activityHour[index]['time_start'] = (this.fullDatetoTime(new Date(testResult[x]['created_at']), 24))
            }
            activityHour[index]['time_end'] = (this.fullDatetoTime(new Date(testResult[x]['created_at']), 24))
            activityHour[index]['transactions']++
            index++
          }
        }
        console.log('ActivityHour', activityHour)
        this.transactionGroupToGraph(activityHour)
      })
    },
    dateSetter(start, end, graphObject){
      let temp = ''
      temp = start.split(':')
      if(temp[1] > 15){
        start = temp[0] + ':' + 30
      } else{
        start = temp[0] + ':' + 0
      }
      temp = end.split(':')
      if(temp[1] > 15){
        end = temp[0] + ':' + 30
      } else{
        end = temp[0] + ':' + 0
      }
      start = this.timeToFullDate(start)
      end = this.timeToFullDate(end)
      let x = new Date()
      let hh = 0
      let mm = 0
      let ctr = 0
      x.setHours(hh)
      x.setMinutes(mm)
      x.setSeconds(0)
      x.setMilliseconds(0)
      do{
        graphObject[ctr]['x'] = this.fullDatetoTime(x, 24)
        graphObject[ctr]['y'] = 0
        ctr++
        mm = mm + 30
        if(mm === 60){
          hh++
          mm = 0
        }
        x.setHours(hh)
        x.setMinutes(mm)
        if(ctr <= 47){
          graphObject.push({})
        }
      }while(ctr <= 47 && (mm === 0 || mm === 30))
    },
    removeExcess(graphObject, start, end){
      start = this.timeToFullDate(start)
      end = this.timeToFullDate(end)
      while(this.timeToFullDate(graphObject[0]['x']) < start){
        graphObject.shift()
      }
      while(this.timeToFullDate(graphObject[graphObject.length - 1]['x']) > end){
        graphObject.pop()
      }
    },
    timeToFullDate(time){
      let temp = ''
      temp = time.split(':')
      let hh = temp[0]
      let mm = temp[1]
      time = new Date()
      time.setHours(hh)
      time.setMinutes(mm)
      time.setSeconds(0)
      time.setMilliseconds(0)
      return time
    },
    timeToMinutes(time){
      time = new Date(time)
      let hh = time.getHours()
      let mm = time.getMinutes()
      time = (hh * 60) + mm
      return time
    },
    fullDatetoTime(timestamp, format){
      let format24 = ''
      let date = new Date(timestamp)
      let hours = date.getHours()
      let minutes = date.getMinutes()
      if(!format){
        return this.time12HourFormat(hours, minutes)
      } else{
        format24 = (hours + ':' + this.padNumber(minutes))
        return (format24)
      }
    }
  }
}
</script>
<style>

</style>
