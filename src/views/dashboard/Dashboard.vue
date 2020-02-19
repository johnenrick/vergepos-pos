<template>
  <div class="p-3">
    <div class="mb-3">
      <h2 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h2>
      <p>You dashboard will give you quick reports about your business. From number of transactions to daily sales report!. You can also find other resources here such as <a href="">VergePOS Tutorials</a>, Business Tips, and many more...</p>
    </div>
    <terminal-toggler/>
    <quick-report-card />
    <activity-hour />
    <weekly-sale-graph />
  </div>
</template>
<script>
import QuickReportCard from './QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import TerminalToggler from './TerminalToggler'
import ActivityHour from './ActivityHour'

// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    TerminalToggler,
    ActivityHour
  },
  mounted(){
    this.init()
  },
  data(){
    return {
    }
  },
  methods: {
    init(){
      // TODO refresh the charts
    }
  }
}
</script>
