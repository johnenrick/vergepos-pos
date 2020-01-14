<template>
  <div class="p-3">
    <div class="mb-3">
      <h2 class="font-weight-bold mb-4">Welcome to your VergePOS Dashboard!</h2>
      <p>You dashboard will give you quick reports about your business. From number of transactions to daily sales report!. You can also find other resources here such as <a href="">VergePOS Tutorials</a>, Business Tips, and many more...</p>
    </div>
    <div  class="mb-4">
      <div v-if="!isTerminal">
        <button @click="openTerminalSelection" class="btn btn-secondary"><fa icon="cash-register" /> Set As Terminal</button><br>
        <small>Set this machine as a Terminal. By doing so, it will allow you to use the POS even if you dont have internet connection. </small>
        <terminal-selection ref="terminalSelection" />
      </div>
      <div v-else class="bg-info text-white p-2 rounded">
        <fa icon="info-circle" /> This device has been <strong>SET AS TERMINAL</strong>. Offline capabilities and offline log in has been enabled. <a @click.stop="removeTerminal" href="#" class="text-white font-weight-bold">Undo</a>
      </div>
    </div>
    <quick-report-card />
    <weekly-sale-graph />
  </div>
</template>
<script>
import QuickReportCard from './QuickReportCards.vue'
import WeeklySaleGraph from './WeeklySaleGraph.vue'
import TerminalSelection from './TerminalSelection'
import UserStore from '@/vue-web-core/system/store'
// import User from '@/database/controller/user'
export default {
  components: {
    QuickReportCard,
    WeeklySaleGraph,
    TerminalSelection
  },
  mounted(){
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal')
    }
  },
  methods: {
    openTerminalSelection(){
      // localStorage.setItem('is_terminal', 1)
      console.log(UserStore.getters.companyInformation)
      let param = {
        id: UserStore.getters.companyInformation.id,
        select: {
          0: 'id',
          stores: {
            select: {
              0: 'id',
              store_terminals: {
                select: {
                  0: 'id'
                }
              }
            }
          }
        }
      }
      this.apiRequest('company/retrieve', param, (response) => {
        if(response['data'] && typeof response['data']['stores'] !== 'undefined' && response['data']['stores'].length){
          localStorage.setItem('is_terminal', response['data']['stores'][0]['store_terminals'][0]['id'])
        }else{
          console.log('No Terminal')
        }
      })
      // window.location = '/'
      // this.$refs.terminalSelection._open()
    },
    removeTerminal(){
      localStorage.removeItem('is_terminal', 1)
    }
  }
}
</script>
