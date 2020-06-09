<template>
  <div>
    <div class="card border-primary mb-3" >
      <div class="card-header bg-primary text-white">Weekly Sales</div>
      <div class="card-body text-primary" >
        <p class="card-text"><fa icon="info-circle" /> The graph below shows the sales performance in the last 7 days. From {{pastSevenDayDate | formatDate}} to {{new Date() | formatDate}}.</p>
        <line-chart v-if="!noData" :chart-data="datacollection" :options="chartConfig"></line-chart>
        <div v-else class='text-center p-1 pt-2 border bg-light text-primary p-2 rounded'>
          <span class="">No Transactions found :(</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
import Transaction from '@/database/controller/transaction'
// import Transaction from '@/database/controller/transaction'
export default {
  components: {
    LineChart
  },
  data () {
    return {
      noData: true,
      isLoading: false,
      datacollection: null,
      pastSevenDayDate: '',
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
  mounted () {
    this.retrieveData()
  },
  methods: {
    retrieveData(){
      this.isLoading = true
      let pastSevenDayDate = new Date()
      pastSevenDayDate.setDate(pastSevenDayDate.getDate() - 6)
      pastSevenDayDate.setHours(0)
      pastSevenDayDate.setMinutes(0)
      pastSevenDayDate.setSeconds(0)
      this.pastSevenDayDate = pastSevenDayDate
      let query = {
        where: {
          created_at: {
            '>': pastSevenDayDate.getTime()
          }
        },
        order: {
          by: 'created_at',
          type: 'asc'
        }
      }
      let transactionDB = new Transaction()
      transactionDB.get(query).then(transactions => {
        let transactionGroup = {}
        for(let x = 0; x < transactions.length; x++){
          if(transactions[x]['status'] !== 1){
            continue
          }
          let transactionDate = new Date(transactions[x]['created_at'])
          let date = this.padNumber(transactionDate.getDate()) + '-' + this.padNumber(transactionDate.getMonth() + 1) + '-' + this.padNumber(transactionDate.getFullYear())
          if(typeof transactionGroup[date] === 'undefined'){
            transactionGroup[date] = {
              amount: 0,
              discount_amount: 0
            }
          }
          transactionGroup[date]['amount'] += (transactions[x]['total_amount'] * 1).toFixed(2) * 1
          transactionGroup[date]['discount_amount'] += (transactions[x]['total_discount_amount'] * 1).toFixed(2) * 1
        }
        this.plotData(transactionGroup)
      })
    },
    plotData(transactionGroup){
      let dateLabel = []
      let transactionAmountTrend = []
      let transactionDiscountAmountTrend = []
      for(let date in transactionGroup){
        dateLabel.push(date)
        transactionAmountTrend.push({
          x: date,
          y: (transactionGroup[date]['amount']).toFixed(2)
        })
        transactionDiscountAmountTrend.push({
          x: date,
          y: (transactionGroup[date]['discount_amount']).toFixed(2)
        })
      }
      this.noData = transactionAmountTrend.length === 0
      this.datacollection = {
        labels: dateLabel,
        bezierCurve: false,
        datasets: [
          {
            label: 'Sales',
            fill: false,
            borderColor: '#28a745',
            backgroundColor: '#ffffff',
            data: transactionAmountTrend
          }
        ]
      }
    }
  }
}
</script>
