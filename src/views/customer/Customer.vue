<template>
  <div class="p-3">
    <div class="p-3 bg-white shadow-sm">
      <h2 class="font-weight-bold mb-3">Customer Management</h2>
      <vue-table
        :track-by="'id'"
        :api-mode="false"
        :data="customerList"
        :fields="columns"
      >
        <template slot="actions" slot-scope="props">
          <div class="text-nowrap">
            <button v-if="props.rowData['id']" @click="openCustomerDetail(props.rowData['id'], props.rowData['db_id'], props.rowIndex)" class="btn btn-sm btn-outline-info mr-1"><fa icon="edit" /> View</button>
            <button v-if="props.rowData['id']" @click="openPurchaseHistory(props.rowData['id'], props.rowData['id'])" class="btn btn-sm btn-outline-primary"><fa icon="receipt" /> Purchases</button>
          </div>
          </template>
      </vue-table>
    </div>
    <CustomDetail ref="customerDetail" @update="customerUpdated"/>
    <PurchaseHistory ref="purchaseHistory" />
  </div>
</template>
<script>
import Vue from 'vue'
import VueTable from 'vuetable-2/src/components/Vuetable'
import UserSession from '@/vue-web-core/system/store'
import Customer from '@/database/controller/customer'
import CustomDetail from './customer-components/CustomerDetail'
import PurchaseHistory from './customer-components/PurchaseHistory'
export default {
  components: {
    VueTable,
    CustomDetail,
    PurchaseHistory
  },
  mounted(){
    this.initialize()
  },
  data(){
    return {
      activeCustomerIndex: -1,
      customerDB: new Customer(),
      customerList: [],
      columns: [{
        name: 'name',
        title: 'Name',
      }, {
        name: 'gender',
        callback: (value) => {
          switch(value * 1){
            case 1: return 'Male'
            case 2: return 'Female'
            case 3: return 'Gay'
            case 4: return 'Lesbian'
            default: return 'Unknown'
          }
        }
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
      if(isTerminal){
        this.listCustomerFromOffline()
      }else if(this.mode === 'online'){
        this.listCustomerFromOnline()
      }
    },
    openCustomerDetail(customerLocalId, customerDBId, rowIndex){
      this.activeCustomerIndex = rowIndex
      this.$refs.customerDetail._open(customerLocalId, customerDBId)
    },
    openPurchaseHistory(customerLocalId, customerDBId){
      this.$refs.purchaseHistory._open(customerLocalId, customerDBId)
    },
    customerUpdated(updatedData){
      Vue.set(this.customerList, this.activeCustomerIndex, updatedData)
    },
    listCustomerFromOnline(){

    },
    listCustomerFromOffline(){
      this.customerList = []
      this.customerDB.get().then(response => {
        this.customerList = response
      })
    }
  },
  computed: {
    mode(){
      return UserSession.getters.mode
    }
  }
}
</script>
