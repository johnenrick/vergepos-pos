<template>
  <div>
    <div class="mb-2">
      <FAQ />
    </div>
    <div v-if="hasStoreTerminals" class="text-right">
      <small @click="$emit('change-mode', 'existing-terminal')" class="c-pointer text-underlined text-primary"><u> Choose from Existing Terminal</u></small>
    </div>
    <div v-if="errorMessage" v-html="errorMessage" class="alert alert-danger"></div>
    <label>Device Serial Number Or Device Name</label>
    <input v-model="serialNumber" type="text" class="form-control mb-2" placeholder="XXXXXXXXXXX or Tablet-01">
    <label>Terminal Description</label>
    <input v-model="terminalDescription" class="form-control mb-2" placeholder="e.g. Cashier 1, Entrance Terminal, etc." />
    <div class="text-center pt-2">
      <template v-if="!isConfuringTerminal">
        <button class="btn btn-primary" @click="setAsTerminal"><fa icon="desktop"/> Set As Terminal</button>
        <button @click="$emit('close')" class="btn btn-outline=secondary float-right" > Close</button>
      </template>
      <span v-else>Configuring Terminal...</span>
    </div>
  </div>
</template>
<script>
import FAQ from './FAQ'
export default {
  components: {
    FAQ
  },
  props: {
    storeId: Number,
    hasStoreTerminals: Boolean
  },
  data(){
    return {
      serialNumber: '',
      terminalDescription: '',
      isConfuringTerminal: false,
      errorMessage: null
    }
  },
  methods: {
    setAsTerminal(){
      this.errorMessage = null
      if(this.serialNumber === ''){
        this.isConfuringTerminal = false
        this.errorMessage = 'Please enter the serial number of this device.'
        return false
      }
      if(this.terminalDescription === ''){
        this.errorMessage = 'Please enter terminal description'
      }
      if(!this.errorMessage){
        let param = {
          store_id: this.storeId,
          serial_number: this.serialNumber,
          description: this.terminalDescription
        }
        this.isConfuringTerminal = true
        this.apiRequest('store-terminal/create', param, (response) => {
          if(response['data']){
            let terminalDetails = {
              store_id: this.storeId,
              serial_number: this.serialNumber,
              description: this.terminalDescription
            }
            this.$emit('set-terminal', {
              storeTerminalId: response['data']['id'],
              terminalDetails: terminalDetails
            })
          }else{
            this.isConfuringTerminal = false
          }
        }, (response) => {
          if(response['error']['code'] * 1 === 101){
            this.errorMessage = response['error']['message']
          }
          this.isConfuringTerminal = false
        })
      }
    }
  }
}
</script>
