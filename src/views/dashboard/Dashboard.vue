<template>
  <div class="p-3">
    <div class="mb-3">
      <h2 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h2>
      <p>You dashboard will give you quick reports about your business. From number of transactions to daily sales report!. If you need help don't hesitate to <router-link to="contact-us" class="">contact us</router-link>.</p>
    </div>
    <quick-action />
    <quick-report-card />
    <activity-hour />
    <weekly-sale-graph />
  </div>
</template>
<script>
import QuickReportCard from './quick-report-card/QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import ActivityHour from './ActivityHour'
import QuickAction from './quick-action/QuickAction'

// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    ActivityHour,
    QuickAction
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal')
    }
  },
  methods: {
    init(){
      // TODO refresh the charts
    }
  }
}
</script>
