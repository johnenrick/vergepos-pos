<template>
  <div class="p-3">
    <div class="mb-3">
      <h2 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h2>
      <p>You dashboard will give you quick reports about your business. From number of transactions to daily sales report!. You can also find other resources here such as <a href="">VergePOS Tutorials</a>, Business Tips, and many more...</p>
    </div>
    <div class="border rounded px-2 pt-2 border-secondary1 bg-whitesmoke mb-3">
      <h6 class="font-weight-bold text-uppercase">Quick Actions</h6>
      <div class="row  mx-0">
        <div v-if="isTerminal" class="col-sm-12 col-md-6 px-1 mb-2">
          <backup-database/>
        </div>
        <div class="col-sm-12 col-md-6 px-1 mb-2">
          <terminal-toggler />
        </div>
        <div v-if="isTerminal" class="col-sm-12 col-md-6 px-1 mb-2">
          <install/>
        </div>
      </div>
    </div>
    <quick-report-card />
    <activity-hour />
    <weekly-sale-graph />
  </div>
</template>
<script>
import QuickReportCard from './QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import TerminalToggler from './TerminalToggler'
import Install from './Install'
import ActivityHour from './ActivityHour'
import BackupDatabase from '@/components/BackupDatabase.vue'

// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    TerminalToggler,
    ActivityHour,
    BackupDatabase,
    Install
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
