<template>
  <div class="dashboard p-3">
    <div class="mb-3 bg-white p-3 shadow-sm">
      <h3 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h3>
      <div class="row">
        <div class="col-12 col-md-7 col-lg-8">
          <div v-if="isTerminal"  class="mb-4">
            <fa icon="desktop" />
            Terminal:
            <big
              @click="openTerminalDetails"
              class="c-pointer text-primary text-uppercase font-weight-bold"
            >
              {{terminalDetails['description']}} <small>{{terminalDetails['serial_number']}}</small>
            </big>
          </div>
          <p>
            <span v-if="isTerminal">Your dashboard will give you quick reports about your business from number of transactions to daily sales report!</span>
            <span v-else> You have just taken a hundred steps ahead of the competition by embracing technology. Don't be afraid to explore all the features of VergePOS and use it to your advantage</span>
            <span v-if="hasSetUpWizard"> Be sure you complete the steps in setting up your POS.</span>
          </p>
        </div>
        <div class="col-12 col-md-5 col-lg-4 pl-md-0">
          <div class="bg-whitesmoke p-3">
            <p class="mb-1 font-weight-bold text-primary"><fa icon="info-circle" class="text-info" /> Help or Suggestions? </p>
            Don't hesitate to message us on our Facebook Page: <a href="https://fb.com/vergepos" target="_blank" class="font-weight-bold">fb.com/verge</a>
          </div>
        </div>
      </div>
    </div>
    <SetUpWizard v-if="hasSetUpWizard && !isOffline" @done="hideSetUpWizard" class="bg-white p-3 shadow-sm mb-3" />
    <quick-action ref="quicAction" class="bg-white p-3 shadow-sm mb-3" />
    <template v-if="isTerminal">
      <quick-report-card ref="quickReportCard" class="bg-white p-3 shadow-sm mb-3" />
      <activity-hour ref="activityHour" class="bg-white p-3 shadow-sm mb-3" />
      <weekly-sale-graph ref="weeklySalesGraph" class="bg-white p-3 shadow-sm mb-3" />
    </template>
    <div v-else >

    </div>
  </div>
</template>
<script>
import QuickReportCard from './quick-report-card/QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import ActivityHour from './ActivityHour'
import QuickAction from './quick-action/QuickAction'
import DownSync from '@/database/sync/sync-all'
import SetUpWizard from './SetUpWizard'
import UserStore from '@/vue-web-core/system/store'
// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    ActivityHour,
    QuickAction,
    SetUpWizard
  },
  mounted(){
    this.$nextTick(() => {
      if(DownSync.hasSynched){
        this.init()
      }else{
        DownSync.addListener('dashboard', () => {
          this.init()
        })
      }
    })
    if(typeof UserStore.getters.userRoles['100'] === 'undefined'){
      this.hasSetUpWizard = false
    }
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal') * 1,
      terminalDetails: JSON.parse(localStorage.getItem('terminal_details')),
      hasSetUpWizard: true,
      isOffline: UserStore.getters.mode === 'offline'
    }
  },
  methods: {
    hideSetUpWizard(){
      this.hasSetUpWizard = false
    },
    openTerminalDetails(){
      this.$refs.quicAction._openQuickActionCard('unset_terminal')
    },
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
<style scope>
  @media screen and (min-width: 940px) {

  }

</style>
