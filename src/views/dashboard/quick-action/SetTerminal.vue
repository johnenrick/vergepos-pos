<template>
  <div>
    <div class="border bg-white rounded p-2 px-3">
      <div v-if="!isConfuringTerminal" class="">
        <div v-if="!isTerminal">
          <p class="mb-1">Set this device as a Terminal to use the POS and enable Offline Mode. </p>
          <div class="text-center">
            <button @click="openTerminalSelection" class="btn btn-primary"><fa icon="cash-register" /> Set As Terminal</button><br>
          </div>
          <terminal-selection ref="terminalSelection" />
        </div>
      </div>
      <div v-else class=" text-center">
        Configuring Terminal. Please wait...
      </div>
    </div>
    <modal ref="selectionModal" :closeable="true" title="Terminal Selection">
      <template slot="body">
        <div class="">
          <label>Device Serial Number</label>
          <input type="text" class="form-control" placeholder="XXXXXXXXXXXXXXX">
          <small class="form-text text-muted">
            <div v-if="!showSerialNumberHelp" class="font-weight-bold text-info c-pointer" @click="showSerialNumberHelp = true"> How to find serial number <fa icon="question-circle" /> </div>
            <div v-else>
              <span @click="showSerialNumberHelp = false" class="text-info text-underline c-pointer">Hide</span> <br>
              If you are using Android devices, you can the serial number in <strong>Settings > About Phone > Status > Serial Number</strong>. If you are using a computer, just open a <i>Command Prompt</i> and copy&paste the following code: <i>wmic bios get serialnumber</i>. If you can't find your serial number, don't hesitate to <router-link to="contact-us" class=text-primary>Contact Us</router-link>.
            </div>
          </small>
        </div>
        <div v-if="newTerminalMode" class="mb-2">
          <label>Terminal Description</label>
          <input class="form-control" placeholder="e.g. Cashier 1, Entrance Terminal, etc." />
          <div class="text-right">
            <small @click="newTerminalMode = false" class="c-pointer text-underlined text-primary"><u> Choose from Existing Terminal</u></small>
          </div>
        </div>
        <div class="mb-2" v-else-if="stores.length && !newTerminalMode">
          <label>Choose a Terminal</label>
          <select type="text" class="form-control" >
            <option>Select a Terminal</option>
            <template v-for="storeTerminal in stores[0]['store_terminals']">
              <option :value="storeTerminal['id']" :disabled="storeTerminal['serial_number'] !== ''" :class="storeTerminal['serial_number'] !== '' ? 'bg-secondary' : ''">{{storeTerminal['description']}}</option>
            </template>
          </select>
          <div class="text-right">
            <small  @click="newTerminalMode = true" class="c-pointer text-underlined text-success"><u><fa icon="plus" /> Create New Terminal</u></small>
          </div>
        </div>
        <div class="text-center">
          <button class="btn btn-primary"><fa icon="desktop"/> Set As Terminal</button>
        </div>
        <hr>
        <div>

          <router-link to="/terminal" class="btn btn-outline-secondary btn-sm float-right"><fa icon="desktop" /> Go to Terminal Management</router-link>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import TerminalSelection from './TerminalSelection'
import UserStore from '@/vue-web-core/system/store'
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
      showSerialNumberHelp: false,
      stores: [],
      companyData: {},
      newTerminalMode: true
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
        if(typeof response['data']['stores'] !== 'object'){
          console.error('No store has been retrieved', response)
          this.isConfuringTerminal = false
        }else if(response['data'] && response['data']['stores'][0]['store_terminals'].length === 1){
          console.log('here')
          this.setTerminal(response['data']['stores'][0]['store_terminals'][0]['id'])
        }else{
          this.stores = response['data']['stores']
          this.$refs.selectionModal._open()
          this.isConfuringTerminal = false
        }
      })
    },
    setTerminal(storeTerminalID){
      localStorage.setItem('is_terminal', storeTerminalID)
      let companyInformation = UserStore.getters.companyInformation
      console.log('companyInformation', companyInformation)
      localStorage.setItem('company_detail', JSON.stringify(companyInformation))
      window.location = '/'
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
