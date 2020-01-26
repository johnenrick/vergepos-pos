<template>
  <div>
    <div v-if="!isConfuringTerminal" class="mb-4">
      <div v-if="!isTerminal">
        <button @click="openTerminalSelection" class="btn btn-secondary"><fa icon="cash-register" /> Set As Terminal</button><br>
        <small>Set this machine as a Terminal. By doing so, it will allow you to use the POS even if you dont have internet connection. </small>
        <terminal-selection ref="terminalSelection" />
      </div>
      <div v-else class="bg-info text-white p-2 rounded">
        <fa icon="info-circle" /> This device has been <strong>SET AS TERMINAL</strong>. Offline capabilities and offline log in has been enabled. <a @click.stop="openRemoveTerminal" href="#" class="text-white font-weight-bold">Undo</a>
      </div>
    </div>
    <div v-else class="mb-4">
      Configuring Terminal. Please wait...
    </div>
    <modal ref="removeTerminalModal" title="Warning" icon="exclamation-triangle" icon-color="#f2a11d " :closeable="false">
      <template v-slot:body>
        <p v-if="unsynchedTransaction">There are {{unsynchedTransaction}} transaction that has not been sync yet. Removing this device as terminal will lose those data.</p>
        <p v-else>Removing as terminal will clear the data on this device</p>
        <div v-if="!isUpSynching" class="text-center">
          <button @click="removeTerminal" class="btn btn-danger mr-2"><fa icon='desktop' /> Remove Terminal</button>
          <button v-if="unsynchedTransaction" @click="uploadData" class="btn btn-outline-success mr-2"><fa icon="arrow-up" /> Upload Data</button>
          <button @click="closeRemoveTerminal" class="btn btn-outline-secondary">Close</button>
        </div>
        <div v-else class="text-center">
          Uploading data to the server. It may take a while. Please wait...
        </div>
      </template>
    </modal>
  </div> 
</template>
<script>
import TerminalSelection from './TerminalSelection'
import UserStore from '@/vue-web-core/system/store'
import TransactionNumber from '@/database/controller/transaction-number'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
export default {
  components: {
    TerminalSelection,
    Modal
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      isConfuringTerminal: false,
      unsynchedTransaction: 0,
      isUpSynching: false
    }
  },
  methods: {
    uploadData(){
      this.isUpSynching = true
    },
    openTerminalSelection(){
      this.isConfuringTerminal = true
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
        console.log(response)
        if(response['data'] && typeof response['data']['stores'] !== 'undefined' && response['data']['stores'].length && response['data']['stores'][0]['store_terminals'].length){
          localStorage.setItem('is_terminal', response['data']['stores'][0]['store_terminals'][0]['id'])
          console.log('yawa')
          window.location = '/'
        }else{
          console.error('Cannot set Terminal', response['data'])
        }
        this.isConfuringTerminal = false
      })
      // this.$refs.terminalSelection._open()
    },
    openRemoveTerminal(){
      let transactionNumber = new TransactionNumber()
      let query = {
        where: {
          db_id: 0
        }
      }
      transactionNumber.get(query).then(result => {
        this.unsynchedTransaction = result.length
      })
      this.$refs.removeTerminalModal._open()
    },
    async removeTerminal(){
      this.isConfuringTerminal = true
      localStorage.clear();
      const dbs = await window.indexedDB.databases()
      dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name) })
      window.location = '/'
    },
    closeRemoveTerminal(){
      this.$refs.removeTerminalModal._close()
    }
  }
}
</script>
<style>
</style>
