<template>
  <div>
    <div class="text-right">
      <small @click="$emit('change-mode', 'new-terminal')" class="c-pointer text-underlined text-success"><u><fa icon="plus" /> Create New Terminal</u></small>
    </div>
    <label>Choose a Terminal </label>
    <div v-if="selectedTerminalAlreadyUsed" class="text-warning mb-2">
      <small><fa icon="exclamation-triangle" /> The selected terminal has already been assigned. Make sure to unassigned the old device to avoid ruining the data</small>
    </div>
    {{selectedTerminalSerialNumber}}
    <select v-model="selectedExistingTerminal" type="text" class="form-control mb-2" >
      <option value="null">Select a Terminal</option>
      <template v-for="(storeTerminal, index) in storeTerminals">
        <option :value="index" :class="storeTerminal['serial_number'] !== '' ? 'bg-light' : ''">{{storeTerminal['description']}} <span class="text-uppercase">{{(storeTerminal['serial_number'] !== '') ? ' [SN: ' + storeTerminal['serial_number'] + ']': ''}}</span></option>
      </template>
    </select>
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
export default {
  props: {
    storeTerminals: Array,
    storeId: Number
  },
  data(){
    return {
      selectedExistingTerminal: 'null',
      isConfuringTerminal: false
    }
  },
  methods: {
    setAsTerminal(){
      this.isConfuringTerminal = true
      if(this.selectedExistingTerminal === 'null'){
        this.errorMessage = 'Please select a terminal'
        this.isConfuringTerminal = false
        return false
      }
      console.log('selectedExistingTerminal', this.storeTerminals[this.selectedExistingTerminal]['id'])
      let param = {
        id: this.storeTerminals[this.selectedExistingTerminal]['id'] * 1,
        store_id: this.storeId,
        serial_number: this.serialNumber
      }
      this.apiRequest('store-terminal/update', param, (response) => {
        if(response['data']){
          let terminalDetails = {
            description: this.storeTerminals[this.selectedExistingTerminal]['description'],
            serial_number: this.storeTerminals[this.selectedExistingTerminal]['serial_number'],
            store_id: this.storeId
          }
          this.$emit('set-terminal', {
            storeTerminalId: param['id'],
            terminalDetails: terminalDetails
          })
        }
        this.isConfuringTerminal = false
      })
    }
  },
  computed: {
    selectedTerminalAlreadyUsed(){
      return this.selectedExistingTerminal && this.selectedExistingTerminal !== 'null' && this.storeTerminals[this.selectedExistingTerminal]['serial_number'] !== ''
    },
    selectedTerminalSerialNumber(){
      return this.selectedExistingTerminal && this.selectedExistingTerminal !== 'null' ? this.storeTerminals[this.selectedExistingTerminal]['serial_number'] : ''
    }
  },
  watch: {
    selectedExistingTerminal(index, oldIndex){
      console.log(index, oldIndex, this.serialNumber)
      if(index !== 'null' && (this.serialNumber === '' || oldIndex !== 'null')){
        this.serialNumber = this.storeTerminals[index]['serial_number']
      }
    },
  }
}
</script>
