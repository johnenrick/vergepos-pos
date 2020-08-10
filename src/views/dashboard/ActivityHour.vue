<template>
  <div>
    <div class="card border-info mb-3" >
      <h6 class="card-header bg-info text-white"><fa icon="clock" /> Activity Hour</h6>
      <div class="card-body" >
        <div v-show="isTerminal">
          <p class="card-text">Shows you which hours of the day you have most transactions. This is very helpful in anticipating busy hours so you can prepare or do other productive tasks on non busy hours</p>
          <div class="row">
            <div class="col-12">
              <p v-if="isLoading === false" class="mb-0">Showing data on <strong>{{curDate | formatDate('M d, yyyy (Day)')}}</strong></p>
              <p v-else class="mb-0"><fa icon="hourglass-half" /> Loading...</p>
            </div>
          </div>
          <div>
            <line-chart v-if="datacollection" :chart-data="datacollection" :options="chartConfig"></line-chart>
          </div>
          <div class="row">
            <div class="col-6">
            <button class="btn" :disabled="isPreviousDisabled" :class="isPreviousLast" @click="getTimeStartAndEnd('previous')">Previous Day</button>
            </div>
            <div class="col-6">
              <button class="btn" :disabled="isNextDisabled" :class="isNextLast" @click="getTimeStartAndEnd('next')">Next Day</button>
            </div>
          </div>
        </div>
        <div v-show="!isTerminal">
          <fa icon="info-circle" /> You need to set this device as a terminal to be able to see the weekly graph on this terminal. You can do this by clicking the <strong class="text-primaryx p-1">Set As Terminal</strong> at Quick Actions (top of this page).
        </div>
      </div>
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
      isLoading: false,
      curDate: '',
      graphColor: '#63cce9',
      isLastTransaction: false,
      firstTransaction: '',
      isPreviousDisabled: false,
      isNextDisabled: true,
      isNextLast: 'btn-outline-secondary btn-block',
      isPreviousLast: 'btn-outline-info btn-block',
      startDateFilter: new Date(),
      endDateFilter: new Date(),
      datacollection: {},
      isTerminal: false,
      chartConfig: {
        scales: {
          yAxes: [{
            ticks: {
              stepSize: 1
            }
          }]
        },
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
  },
  methods: {
    _initialize(){
      this.isTerminal = localStorage.getItem('is_terminal')
      if(this.isTerminal){
        this.getFirstTransaction()
        this.groupTransactions()
      }
    },
    groupTransactions(){
      this.curDate = this.startDateFilter
      this.isLoading = true
      this.isPreviousDisabled = true
      if(this.isNextDisabled === false){
        this.isNextDisabled = true
      }
      let activityHour = [{}]
      let testResult = {}
      let next = 0
      this.startDateFilter.setHours(0, 0, 0, 1)
      this.endDateFilter.setHours(23, 59, 59, 999)
      let query = {
        where: {
          created_at: {
            '>': this.startDateFilter.getTime(),
            '<': this.endDateFilter.getTime(),
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
        if(testResult.length > 0){
          this.checkIfLastTransaction(testResult[0]['created_at'])
          this.graphColor = '#63cce9'
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
        } else{
          this.checkIfLastTransaction(new Date())
          this.graphColor = '#6c757d'
          activityHour[index]['time_start'] = this.fullDatetoTime(this.startDateFilter)
          activityHour[index]['time_end'] = this.fullDatetoTime(this.endDateFilter)
          activityHour[index]['transactions'] = 0
        }
        this.transactionGroupToGraph(activityHour)
      })
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
      start = this.fullDatetoTime(this.roundMinutes(this.timeToFullDate(start)), 24)
      end = this.fullDatetoTime(this.roundMinutes(this.timeToFullDate(end)), 24)
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
            fill: 'origin',
            borderColor: this.graphColor,
            pointBackgroundColor: '#ffffff',
            backgroundColor: this.graphColor,
            data: graphObject
          }
        ]
      }
      if(this.isLastTransaction === false){
        this.isPreviousDisabled = false
        this.isPreviousLast = 'btn-outline-info btn-block'
      } else{
        this.isPreviousLast = 'btn-outline-secondary btn-block'
      }
      if(new Date().getDate() !== this.startDateFilter.getDate()){
        this.isNextDisabled = false
      }
      this.isLoading = false
    },
    roundMinutes(time){
      let temp = time.getMinutes()
      let hh = time.getHours()
      if(temp > 30){
        if(temp > 45){
          hh++
          time.setHours(hh)
          time.setMinutes(0, 0, 0)
        } else{
          time.setMinutes(30, 0, 0)
        }
      } else{
        if(temp > 15){
          time.setMinutes(30, 0, 0)
        } else{
          time.setMinutes(0, 0, 0)
        }
      }
      return time
    },
    checkIfLastTransaction(curTime){
      curTime = new Date(curTime)
      curTime.setHours(0, 0, 0, 0)
      if(curTime.getDate() === this.firstTransaction.getDate() && curTime.getMonth() === this.firstTransaction.getMonth() && curTime.getFullYear() === this.firstTransaction.getFullYear()){
        this.isLastTransaction = true
      } else{
        this.isLastTransaction = false
      }
    },
    getFirstTransaction(){
      let query = {
        order: {
          by: 'created_at',
          type: 'ASC'
        }
      };
      (new Transaction()).get(query).then((response) => {
        if(response.length > 0){
          this.firstTransaction = response[0]['created_at']
          this.firstTransaction = new Date(this.firstTransaction)
          this.firstTransaction.setHours(0, 0, 0, 0)
        } else{
          this.firstTransaction = new Date()
          this.firstTransaction.setHours(0, 0, 0, 0)
        }
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
      x.setHours(hh, mm, 0, 0)
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
      if(graphObject[graphObject.length - 1 >= 1]){
        while(this.timeToFullDate(graphObject[graphObject.length - 1]['x']) > end){
          graphObject.pop()
        }
      }
    },
    getTimeStartAndEnd(direction){
      let curDate = this.startDateFilter
      if(direction === 'previous'){
        curDate = this.startDateFilter.getDate() - 1
        this.isNextLast = 'btn-outline-info btn-block'
        this.isNextDisabled = false
      } else{
        if(curDate < new Date()){
          curDate = this.startDateFilter.getDate() + 1
          if(curDate === new Date().getDate()){
            this.isNextLast = 'btn-outline-secondary btn-block'
            this.isNextDisabled = true
          }
        }
      }
      this.startDateFilter.setDate(curDate)
      this.endDateFilter.setDate(curDate)
      this.groupTransactions()
    },
    timeToFullDate(time){
      let temp = ''
      temp = time.split(':')
      let hh = temp[0]
      let mm = temp[1]
      time = new Date()
      time.setHours(hh, mm, 0, 0)
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
