<template>
  <div>
    <div class="border bg-white rounded p-2 px-3">
      <div v-if="!isConfuringTerminal" class="">
        <div v-if="!isTerminal">
          <p class="mb-1">Set this device as a Terminal to use the POS, enable Offline Mode and other features. </p>
          <div class="text-center">
            <button @click="openTerminalSelection" class="btn btn-primary"><fa icon="cash-register" /> Set As Terminal</button><br>
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        Configuring Terminal. Please wait <fa icon="circle-notch" spin />
      </div>
    </div>
    <modal ref="selectionModal" :closeable="false" :has-close="newTerminalMode === null" title="Terminal Selection">
      <template slot="body">
        <div v-if="errorMessage" class="alert alert-danger">
          {{errorMessage}}
        </div>
        <div v-if="isIncognito" class="alert alert-danger">You are current in Incognito! POS transactions need to be stored offline first before sending it to the server</div>
        <div v-if="newTerminalMode === 'new-terminal'" >
          <SetNewTerminal
            @change-mode="newTerminalMode = $event"
            @set-terminal="setTerminal"
            @close="_close"
            :store-id="stores.length ? stores[0]['id'] : 0"
            :has-store-terminals="stores.length && stores[0]['store_terminals'].length ? true : false"
          />
        </div>
        <div v-else-if="newTerminalMode === 'existing-terminal'" >
          <ExistingTerminalSelector
            @change-mode="newTerminalMode = $event"
            @set-terminal="setTerminal"
            @close="_close"
            :store-id="stores.length ? stores[0]['id'] : 0"
            :store-terminals="stores.length ? stores[0]['store_terminals'] : []"
          />
        </div>
        <div v-else class="text-center p-2">
          <button @click="newTerminalMode = 'new-terminal'" class="btn btn-primary">Set This Device as a New Terminal</button>
          <div class="my-2">OR</div>
          <button @click="newTerminalMode = 'existing-terminal'" class="btn btn-outline-primary">Select From Existing Terminal</button>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import ExistingTerminalSelector from './set-terminal-components/ExistingTerminalSelector'
import SetNewTerminal from './set-terminal-components/SetNewTerminal'
export default {
  components: {
    Modal,
    ExistingTerminalSelector,
    SetNewTerminal
  },
  mounted(){
    var fs = window.RequestFileSystem || window.webkitRequestFileSystem
    if (!fs) {
      console.log('check failed?')
    } else {
      fs(window.TEMPORARY, 100,
        () => {
          console.log('!incog')
          this.isIncognito = false
        },
        () => {
          console.log('incog')
          this.isIncognito = true
        }
      )
    }
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      isConfuringTerminal: false,
      stores: [],
      companyData: {},
      newTerminalMode: null,
      selectedExistingTerminal: 'null',
      previousSelectedExistingTerminal: 'null',
      serialNumber: '',
      terminalDescription: '',
      errorMessage: null,
      isIncognito: false
    }
  },
  methods: {
    _close(){
      this.$refs.selectionModal._close()
    },
    openTerminalSelection(){
      this.stores = []
      this.companyData = {}
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
                select: ['id', 'description', 'serial_number']
              }
            }
          }
        }
      }
      this.apiRequest('company/retrieve', param, (response) => {
        if(response['data'] && (typeof response['data']['stores'] !== 'object' || !response['data']['stores'].length)){
          console.error('No store has been retrieved', response)
          this.isConfuringTerminal = false
          this.newTerminalMode = 'new-terminal'
          this.stores = []
        }else if(response['data']){
          this.stores = response['data']['stores']
          this.newTerminalMode = response['data']['stores'][0]['store_terminals'].length ? null : 'new-terminal'
          this.$refs.selectionModal._open()
          this.isConfuringTerminal = false
        }
      })
    },
    setTerminal(event){
      const { storeTerminalId, terminalDetails } = event
      console.log('setTerminal', event, storeTerminalId)
      localStorage.setItem('is_terminal', storeTerminalId)
      localStorage.setItem('terminal_details', JSON.stringify(terminalDetails))
      let companyInformation = UserStore.getters.companyInformation
      localStorage.setItem('company_detail', JSON.stringify(companyInformation))
      window.location = '/'
    }
  },
  computed: {
    mode(){
      return UserStore.getters.mode
    }
  },
}
</script>
<style>
</style>
