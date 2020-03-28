<template>
  <div>
    <div v-if="!isConfuringTerminal" class="mb-4">
      <div v-if="!isTerminal">
        <button @click="openTerminalSelection" class="btn btn-secondary"><fa icon="cash-register" /> Set As Terminal</button><br>
        <small>Set this machine as a Terminal. By doing so, it will allow you to use the POS even if you dont have internet connection. </small>
        <terminal-selection ref="terminalSelection" />
      </div>
      <div v-else>
        <backup-database></backup-database>
        <div class="bg-info text-white p-2 rounded">
          <fa icon="info-circle" /> This device has been <strong>SET AS TERMINAL</strong>. Offline capabilities and offline log in has been enabled. <a @click.stop="openRemoveTerminal" href="#" class="text-white font-weight-bold">Undo</a>
        </div>
      </div>
    </div>
    <div v-else class="mb-4">
      Configuring Terminal. Please wait...
    </div>
    <modal ref="removeTerminalModal" title="Warning" icon="exclamation-triangle" icon-color="#f2a11d " :closeable="false">
      <template v-slot:body>
        <p v-if="mode === 'offline'">You are currently using Offline Mode. Make sure you have internet connection and relogin without using Offline Mode to remove this device as Terminal</p>
        <p v-else-if="unsynchedTransaction">There are {{unsynchedTransaction}} transaction that has not been sync yet. Removing this device as terminal will lose those data.</p>
        <p v-else>Removing as terminal will clear all the data on this device. You can always download a backup data before doing so if you are not confident on removing this.</p>
        <div v-if="!isUpSynching" class="text-center">
          <button v-if="mode !== 'offline'" @click="removeTerminal" class="btn btn-danger mr-2"><fa icon='desktop' /> Remove Terminal</button>
          <button v-if="unsynchedTransaction" @click="uploadData" class="btn btn-outline-success mr-2"><fa icon="arrow-up" /> Upload Data </button>
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
import UpSync from '@/database/up-sync/up-sync'
import BackupDatabase from '@/components/BackupDatabase'

export default {
  components: {
    TerminalSelection,
    Modal,
    BackupDatabase
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
      UpSync.sync().finally(() => {
        UpSync.sync().finally(() => {
          this.countUnsynchedTransaction()
          this.isUpSynching = false
        })
      })
    },
    openTerminalSelection(){
      this.isConfuringTerminal = true
      let param = {
        id: UserStore.getters.companyInformation.id,
        select: {
          0: 'id',
          1: 'name',
          2: 'code',
          company_detail: {
            select: ['address', 'contact_number']
          },
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
        if(response['data'] && typeof response['data']['stores'] !== 'undefined' && response['data']['stores'].length && response['data']['stores'][0]['store_terminals'].length){
          localStorage.setItem('is_terminal', response['data']['stores'][0]['store_terminals'][0]['id'])
          console.log(response['data'])
          let companyInformation = {
            id: response['data']['id'],
            name: response['data']['name'],
            code: response['data']['code'],
            address: response['data']['company_detail']['address'],
            contact_number: response['data']['company_detail']['contact_number']
          }
          localStorage.setItem('company_detail', JSON.stringify(companyInformation))
          window.location = '/'
        }else{
          console.error('Cannot set Terminal', response['data'])
          this.$refs.terminalSelection._open()
          this.isConfuringTerminal = false
        }
      })
    },
    countUnsynchedTransaction(){
      let transactionNumber = new TransactionNumber()
      let query = {
        where: {
          db_id: 0
        }
      }
      return new Promise((resolve, reject) => {
        transactionNumber.get(query).then(result => {
          this.unsynchedTransaction = result.length
        }).finally(() => {
          resolve(this.unsynchedTransaction)
        })
      })
    },
    openRemoveTerminal(){
      this.isConfuringTerminal = true
      this.countUnsynchedTransaction().finally(() => {
        this.isConfuringTerminal = false
      })
      this.$refs.removeTerminalModal._open()
    },
    async removeTerminal(){
      this.isConfuringTerminal = true
      localStorage.clear()
      const dbs = await window.indexedDB.databases()
      dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name) })
      window.location = '/'
    },
    closeRemoveTerminal(){
      this.$refs.removeTerminalModal._close()
    }
  },
  computed: {
    mode(){
      return UserStore.getters.mode
    }
  }
}
</script>
<style>
</style>
