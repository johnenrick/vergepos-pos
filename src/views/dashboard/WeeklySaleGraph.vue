<template>
  <div>
    <div class="card border-primary mb-3" >
      <h6 class="card-header bg-primary text-white"><fa icon="chart-line" /> Weekly Sales</h6>
      <div class="card-body" >
        <div v-show="isTerminal">
          <p class="card-text">The graph below shows the sales performance in the last 7 days. From {{pastSevenDayDate | formatDate}} to {{new Date() | formatDate}}. <router-link to="/transaction-history" >View Transactions</router-link></p>
          <line-chart v-if="!noData" :chart-data="datacollection" :options="chartConfig"></line-chart>
          <div v-else class='text-center p-1 pt-2 border bg-light text-primary p-2 rounded'>
            <span class="">No Transactions found :(</span>
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
import LineChart from '@/vue-web-core/components/chart/LineChart.js'
import TransactionNumber from '@/database/controller/transaction-number'
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
      },
      isTerminal: false
    }
  },
  mounted () {
  },
  methods: {
    _initialize(){
      this.isTerminal = localStorage.getItem('is_terminal')
      if(this.isTerminal){
        this.retrieveData()
      }
    },
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
        },
        with: {
          transaction: {},
          transaction_void: {
            with: {
              transaction: {
                is_parent: true
              }
            }
          }
        }
      }
      let transactionNumberDB = new TransactionNumber()
      transactionNumberDB.get(query).then(transactionNumbers => {
        let transactionGroup = {}
        transactionNumbers.forEach(transactionNumber => {
          const transactionDate = new Date(transactionNumber['created_at'])
          const date = this.padNumber(transactionDate.getDate()) + '-' + this.padNumber(transactionDate.getMonth() + 1) + '-' + this.padNumber(transactionDate.getFullYear())
          if(typeof transactionGroup[date] === 'undefined'){
            transactionGroup[date] = {
              amount: 0,
              discount_amount: 0
            }
          }
          const transaction = transactionNumber['operation'] === 2 ? transactionNumber['transaction_void']['transaction'] : transactionNumber['transaction']
          const negativeMultiplier = transactionNumber['operation'] === 2 ? -1 : 1
          transactionGroup[date]['amount'] += (transaction['total_amount'] * 1).toFixed(2) * negativeMultiplier
          transactionGroup[date]['discount_amount'] += (transaction['total_discount_amount'] * 1).toFixed(2) * negativeMultiplier
        })
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
