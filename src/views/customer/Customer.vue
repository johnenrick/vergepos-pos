<template>
  <div class="p-3">
    <h2>Customer Management</h2>
    <vue-table
      :track-by="'id'"
      :api-mode="false"
      :data="customerList"
      :fields="columns"
    >
      <template slot="actions" slot-scope="props">
          <button v-if="props.rowData['id']" @click="openTransaction(props.rowData['number'])" class="btn btn-sm btn-info"><fa icon="search" /></button>
        </template>
    </vue-table>
  </div>
</template>
<script>
import VueTable from 'vuetable-2/src/components/Vuetable'
import UserSession from '@/vue-web-core/system/store'
import Customer from '@/database/controller/customer'
export default {
  components: {
    VueTable
  },
  mounted(){
    this.initialize()
  },
  data(){
    return {
      customerDB: new Customer(),
      customerList: [],
      columns: [{
        name: 'name',
        title: 'Name',
      }, {
        name: 'gender',
      }, {
        name: 'address',
      }, {
        name: '__slot:actions',
        title: 'Action',
        titleClass: 'text-center',
        dataClass: 'text-center'
      }]
    }
  },
  methods: {
    initialize(){
      let isTerminal = localStorage.getItem('is_terminal')
      console.log(UserSession.getters.mode, isTerminal)
      if(UserSession.getters.mode === 'online'){
        this.listCustomerFromOnline()
      }else if(UserSession.getters.mode === 'offline' && !isTerminal){

      }else{
        this.listCustomerFromOffline()
      }
      console.log()
    },
    listCustomerFromOnline(){

    },
    listCustomerFromOffline(){
      this.customerDB.get().then(response => {
        console.log(response)
      })
    }
  }
}
</script>
