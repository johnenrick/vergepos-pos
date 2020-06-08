<template>
  <div>
    <div class="border bg-white rounded p-2 px-3">
      <div v-if="!isConfuringTerminal">
        <p class="mb-1"><fa icon="cash-register" /> This device has been <strong>SET AS TERMINAL</strong>. Offline capabilities and Offline Mode has been enabled.</p>
        <div class="text-center">
          <a @click.stop="openRemoveTerminal" href="#" class="btn btn-outline-danger btn-sm mb-1">Remove As Terminal</a>
        </div>
      </div>
      <div v-else class=" text-center">
        Configuring Terminal. Please wait...
      </div>
    </div>
    <modal ref="removeTerminalModal" title="Warning" icon="exclamation-triangle" icon-color="#f2a11d " :closeable="false">
      <template v-slot:body>
        <p v-if="mode === 'offline'">You are currently using Offline Mode. Make sure you have internet connection and relogin without using Offline Mode to remove this device as Terminal</p>
        <p v-else-if="unsynchedTransaction">There are {{unsynchedTransaction}} transaction that has not been sync yet. Removing this device as terminal will lose those data.</p>
        <p v-else>Removing as terminal will clear all the data on this device. You can always download a backup data before doing so if you are not confident on removing this.</p>
        <div v-if="!isUpSynching" class="text-center">
          <button v-if="mode !== 'offline'" @click="removeTerminal" class="btn btn-danger mr-2"><fa icon='desktop' /> Remove Terminal</button>
          <button v-if="unsynchedTransaction && mode === 'online'" @click="uploadData" class="btn btn-outline-success mr-2"><fa icon="arrow-up" /> Upload Data </button>
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
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import UserStore from '@/vue-web-core/system/store'
import TransactionNumber from '@/database/controller/transaction-number'
import UpSync from '@/database/up-sync/up-sync'
export default {
  components: {
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
      UpSync.sync().finally(() => {
        console.log('got here')
        this.isUpSynching = false
        this.countUnsynchedTransaction().finally(() => {
          this.isConfuringTerminal = false
        })
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
