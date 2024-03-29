<template>
  <div>
    <div class="border bg-white rounded p-2 px-3">
      <div v-if="!isConfuringTerminal">
        <p class="mb-1">This device has been <strong>SET AS TERMINAL</strong>. Offline capabilities and Offline Mode has been enabled.</p>
        <div class="text-center">
          <a @click.stop="_openTerminalDetail" href="#" class="btn btn-outline-info btn-sm mb-1 mr-2" title="View terminal details or unset  this device as terminal"><fa icon="info-circle" /> Terminal Details</a>
        </div>
      </div>
      <div v-else class=" text-center">
        Configuring Terminal. Please wait <fa icon="circle-notch" spin />
      </div>
    </div>
    <modal ref="removeTerminalModal" title="Terminal" icon="desktop" :closeable="false">
      <template v-slot:body>
        <template>
          <div class="row">
            <label class="col-sm-4 col-form-label">Description: </label>
            <div class="col-sm-8">
              <input
                v-if="terminalDescription !== ''"
                v-model="terminalDetails['description']"
                class="form-control-plaintext"
                placeholder="Description"
                type="text"
              >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-4 col-form-label">Serial Number</label>
            <div class="col-sm-8">
              <input
                v-if="terminalSerialNumber !== ''"
                v-model="terminalDetails['serial_number']"
                class="form-control-plaintext"
                placeholder="Serial Number"
                type="text"
              >
            </div>
          </div>
          <hr>
        </template>
        <p v-if="mode === 'offline'">You are currently using Offline Mode. Make sure you have internet connection and relogin without using Offline Mode to remove this device as Terminal</p>
        <p v-else-if="unsynchedTransaction">There are {{unsynchedTransaction}} transaction that has not been sync yet. Removing this device as terminal will lose those data.</p>
        <p v-else>Removing this device as terminal will clear all the data on this device. Be sure to back up your data before doing so</p>
        <div v-if="!isUpSynching" class="text-right">
          <button v-if="mode !== 'offline'" @click="removeTerminal" class="btn btn-outline-danger mr-2 mb-2 float-left"><fa icon='desktop' /> Remove As Terminal</button>
          <button v-if="unsynchedTransaction && mode === 'online'" @click="uploadData" class="btn btn-outline-success mr-2 mb-2"><fa icon="arrow-up" /> Upload Data </button>
          <button @click="closeRemoveTerminal" class="btn btn-outline-secondary mb-2">Close</button>
        </div>
        <div v-else class="text-center">
          Uploading data... It may take a while. Please wait <fa icon="circle-notch" spin />
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import UserStore from '@/vue-web-core/system/store'
import InventoryAdjustment from '@/database/controller/inventory-adjustment'
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
      isUpSynching: false,
      terminalDetails: {
        description: '',
        serial_number: ''
      }
    }
  },
  methods: {
    uploadData(){
      this.isUpSynching = true
      console.log('up!')
      UpSync.sync().catch(error => {
        console.log('error', error)
      }).finally(result => {
        console.log('post up sync', result)
        setTimeout(() => {
          this.isUpSynching = false
          this.countUnsynchedTransaction().finally(() => {
            this.isConfuringTerminal = false
          })
        }, 1000)
      })
    },
    countUnsynchedTransaction(){
      const inventoryAdjustmentDB = new InventoryAdjustment()
      const query = {
        where: {
          db_id: 0
        }
      }
      return new Promise((resolve, reject) => {
        inventoryAdjustmentDB.get(query).then(result => {
          console.log('result', result)
          console.log('countUnsynchedTransaction', result.length)
          this.unsynchedTransaction = result.length
        }).finally(() => {
          resolve(this.unsynchedTransaction)
        })
      })
    },
    _openTerminalDetail(){
      this.isConfuringTerminal = true
      this.countUnsynchedTransaction().finally(() => {
        this.isConfuringTerminal = false
      })
      this.terminalDetails = JSON.parse(localStorage.getItem('terminal_details'))
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
    },
    terminalDescription(){
      return typeof this.terminalDetails['description'] !== 'undefined' ? this.terminalDetails['description'] : ''
    },
    terminalSerialNumber(){
      return typeof this.terminalDetails['serial_number'] !== 'undefined' ? this.terminalDetails['serial_number'] : ''
    }
  }
}
</script>
