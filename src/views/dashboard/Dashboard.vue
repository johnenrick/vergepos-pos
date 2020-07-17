<template>
  <div class="p-3">
    <div class="mb-3">
      <h2 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h2>
      <p>You dashboard will give you quick reports about your business. From number of transactions to daily sales report!. If you need help don't hesitate to <router-link to="contact-us" class="">contact us</router-link>.</p>
    </div>
    <quick-action />
    <quick-report-card ref="quickReportCard" />
    <activity-hour ref="activityHour" />
    <weekly-sale-graph ref="weeklySalesGraph" />
  </div>
</template>
<script>
import QuickReportCard from './quick-report-card/QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import ActivityHour from './ActivityHour'
import QuickAction from './quick-action/QuickAction'
import DownSync from '@/database/sync/sync-all'
// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    ActivityHour,
    QuickAction
  },
  mounted(){
    this.$nextTick(() => {
      this.init()
      DownSync.addListener(() => {
        this.init()
      })
    })
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal')
    }
  },
  methods: {
    init(){
      // TODO refresh the charts
      if(typeof this.$refs.quickReportCard !== 'undefined' && typeof this.$refs.activityHour !== 'undefined' && typeof this.$refs.weeklySalesGraph !== 'undefined'){
        this.$refs.quickReportCard._initialize()
        this.$refs.activityHour._initialize()
        this.$refs.weeklySalesGraph._initialize()
      }else{
        setTimeout(() => {
          this.init()
        }, 100)
      }
    }
  }
}
</script>
