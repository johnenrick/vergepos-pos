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
      <div v-else class=" text-center">
        Configuring Terminal. Please wait...
      </div>
    </div>
    <modal ref="selectionModal" :closeable="true" title="Terminal Selection">
      <template slot="body">
        <div v-if="errorMessage" class="alert alert-danger">
          {{errorMessage}}
        </div>
        <div class="">
          <div class="mb-2">
            <FAQ />
          </div>
          <div v-if="isIncognito" class="alert alert-danger">You are current in Incognito! POS transactions need to be stored offline first before sending it to the server</div>
          <label>Device Serial Number</label>
          <input v-model="serialNumber" type="text" class="form-control" placeholder="XXXXXXXXXXXXXXX">
        </div>
        <div v-if="newTerminalMode" class="mb-2">
          <label>Terminal Description</label>
          <input v-model="terminalDescription" class="form-control" placeholder="e.g. Cashier 1, Entrance Terminal, etc." />
          <div class="text-right">
            <small @click="newTerminalMode = false" class="c-pointer text-underlined text-primary"><u> Choose from Existing Terminal</u></small>
          </div>
        </div>
        <div class="mb-2" v-else-if="stores.length && !newTerminalMode">
          <label>Choose a Terminal </label>
          <div v-if="selectedExistingTerminal !== 'null' && stores[0]['store_terminals'][selectedExistingTerminal]['serial_number'] !== ''" class="text-warning mb-2"> <small><fa icon="exclamation-triangle" /> The selected terminal has already been assigned. Make sure to unassigned the old device to avoid ruining the data</small></div>
          <select v-model="selectedExistingTerminal" type="text" class="form-control" >
            <option value="null">Select a Terminal</option>
            <template v-for="(storeTerminal, index) in stores[0]['store_terminals']">
              <option :value="index" :class="storeTerminal['serial_number'] !== '' ? 'bg-light' : ''">{{storeTerminal['description']}} <span class="text-uppercase">{{(storeTerminal['serial_number'] !== '') ? ' [SN: ' + storeTerminal['serial_number'] + ']': ''}}</span></option>
            </template>
          </select>
          <div class="text-right">
            <small  @click="newTerminalMode = true" class="c-pointer text-underlined text-success"><u><fa icon="plus" /> Create New Terminal</u></small>
          </div>
        </div>
        <div class="text-center">
          <button v-if="!isConfuringTerminal" class="btn btn-primary" @click="setAsTerminal"><fa icon="desktop"/> Set As Terminal</button>
          <span v-else>Configuring Terminal...</span>
        </div>
        <div>

          <!-- <router-link to="/terminal" class="btn btn-outline-secondary btn-sm float-right"><fa icon="desktop" /> Go to Terminal Management</router-link> -->
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import FAQ from './set-terminal-components/FAQ'
export default {
  components: {
    Modal,
    FAQ
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
      newTerminalMode: true,
      selectedExistingTerminal: 'null',
      previousSelectedExistingTerminal: 'null',
      serialNumber: '',
      terminalDescription: '',
      errorMessage: null,
      isIncognito: false
    }
  },
  methods: {
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
        if(response['data'] && typeof response['data']['stores'] !== 'object'){
          console.error('No store has been retrieved', response)
          this.isConfuringTerminal = false
        }else if(response['data']){
          this.stores = response['data']['stores']
          this.$refs.selectionModal._open()
          this.isConfuringTerminal = false
        }
      })
    },
    setAsTerminal(){
      this.errorMessage = null
      if(this.serialNumber === ''){
        this.isConfuringTerminal = false
        this.errorMessage = 'Please enter the serial number of this device.'
        return false
      }
      if(this.newTerminalMode){
        if(this.terminalDescription === ''){
          this.errorMessage = 'Please enter terminal description'
        }
        let param = {
          store_id: this.stores[0]['id'],
          serial_number: this.serialNumber,
          description: this.terminalDescription
        }
        this.isConfuringTerminal = true
        this.apiRequest('store-terminal/create', param, (response) => {
          if(response['data']){
            let terminalDetails = {
              serial_number: this.serialNumber,
              description: this.terminalDescription
            }
            this.setTerminal(response['data']['id'], terminalDetails)
          }else{
            this.isConfuringTerminal = false
          }
        }, () => {
          this.isConfuringTerminal = false
        })
      }else{
        this.isConfuringTerminal = true
        if(this.selectedExistingTerminal === 'null'){
          this.errorMessage = 'Please select a terminal'
          this.isConfuringTerminal = false
          return false
        }
        let param = {
          id: this.stores[0]['store_terminals'][this.selectedExistingTerminal]['id'],
          store_id: this.stores[0]['id'],
          serial_number: this.serialNumber
        }
        this.apiRequest('store-terminal/update', param, (response) => {
          if(response['data']){
            let terminalDetails = {
              description: this.stores[0]['store_terminals'][this.selectedExistingTerminal]['description'],
              serial_number: this.stores[0]['store_terminals'][this.selectedExistingTerminal]['this.serialNumber']
            }
            this.setTerminal(this.stores[0]['store_terminals'][this.selectedExistingTerminal]['id'], terminalDetails)
          }
          this.isConfuringTerminal = false
        })
      }
    },
    setTerminal(storeTerminalID, terminalDetails){
      localStorage.setItem('is_terminal', storeTerminalID)
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
  watch: {
    selectedExistingTerminal(index, oldIndex){
      console.log(index, oldIndex, this.serialNumber)
      if(index !== 'null' && (this.serialNumber === '' || oldIndex !== 'null')){
        this.serialNumber = this.stores[0]['store_terminals'][index]['serial_number']
      }
    },
    newTerminalMode(){
      this.selectedExistingTerminal = 'null'
    }
  }
}
</script>
<style>
</style>
