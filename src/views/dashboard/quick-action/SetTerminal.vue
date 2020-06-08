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
  </div>
</template>
<script>
import TerminalSelection from './TerminalSelection'
import UserStore from '@/vue-web-core/system/store'

export default {
  components: {
    TerminalSelection,
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      isConfuringTerminal: false,
    }
  },
  methods: {
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
