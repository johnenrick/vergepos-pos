<template>
  <div class="p-3">
    <div class="bg-white shadow-sm p-3">
      <h2 class="mb-3 font-weight-bold">Inventory</h2>
      <div v-if="terminal === 'not_terminal'" class="my-4">
        <span class="alert alert-warning"><fa icon="exclamation-triangle" /> This device is not a terminal. You cannot generate an inventory report</span>
      </div>
      <div class="row no-gutters mb-2">
        <div class="col-sm-12 col-md-6 col-lg-3 px-1 mb-2">
          <datetime v-model="startDatetimeFilter" class="theme-orange"
            format="yyyy-MM-dd"
            input-class="form-control"
            :minute-step="1"
            :use12-hour="true"
            auto
            type="date"
          />
        </div>
        <div class="col-sm-12 col-md-6 col-lg-3 px-1 mb-2">
          <datetime v-model="endDatetimeFilter" class="theme-orange"
            format="yyyy-MM-dd"
            input-class="form-control"
            :minute-step="1"
            :use12-hour="true"
            auto
            type="date"
          />
        </div>
        <div class="col-12 col-md-6 col-lg-3 px-1">
          <button v-if="isGenerating" disabled class="btn btn-primary w-sm-100 mb-2 w-100 ">Generating...</button>
          <button v-else :disabled="(terminal === 'local') ? false : true" @click="generate" class=" w-100 btn btn-primary w-sm-100 mb-2">Generate</button>
        </div>
      </div>
      <!-- <div class="text-right mb-2">
        <button @click="showBatchInput" class="btn btn-success"><fa icon="clipboard" /> Batch Input</button>
      </div> -->
      <div class="table-responsive">
        <vuetable
            ref="vuetable"
            :track-by="'id'"
            :data="productInventory"
            :api-mode="false"
            :data-total="2"
            :fields="tableSetting.columns"
            class="w-100"
          >
            <template slot="actions" slot-scope="props">
              <div class="text-nowrap">
                <button @click="viewHistory(props.rowData['product_id'])" class="btn btn-sm btn-outline-info no-wrap text-nowrap mr-1"><fa icon="history" /> History</button>
                <button @click="makeAdjustment(props.rowData['product_id'], props.rowData['product_description'])" class="btn btn-sm btn-outline-primary no-wrap text-nowrap"><fa icon="exchange-alt" /> Adjust</button>
              </div>
            </template>
          </vuetable>
      </div>
      <AdjustmentForm ref="adjustmentForm" @save="updateProductInventory" />
      <InventoryHistory ref="inventoryHistory" />
      <BatchInput ref="batchInput" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Datetime } from 'vue-datetime' // https://github.com/mariomka/vue-datetime?ref=madewithvuejs.com
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import Product from '@/database/controller/product'
import BatchInput from './inventory-components/BatchInput'
import AdjustmentForm from './inventory-components/AdjustmentForm'
import InventoryHistory from './inventory-components/InventoryHistory'
import InventoryAdjustmentUpSync from '@/database/up-sync/inventory-adjustment-up-sync'
import InventoryAdjustmentSync from '@/database/sync/inventory-adjustment-sync'
import SyncStore from '@/database/sync/sync-store'
import UserSession from '@/vue-web-core/system/store'
export default {
  components: {
    Vuetable,
    Datetime,
    AdjustmentForm,
    BatchInput,
    InventoryHistory
  },
  props: {
  },
  mounted(){
    this.terminal = localStorage.getItem('is_terminal') ? 'local' : 'not_terminal'
    this.$nextTick(() => {
      if(this.isSynching !== null){
        this.init()
      }
    })
  },
  data(){
    return {
      terminal: 'local',
      startDatetimeFilter: null,
      endDatetimeFilter: null,
      isGenerating: false,
      totalIn: 0,
      totalOut: 0,
      previousQuantity: 0,
      currentQuantity: 0,
      productInventory: [],
      dateFilteredString: '',
      idLookUp: {}, // determine the productInventory index base on the product
      tableSetting: {
        columns: [{
          name: 'product_description',
          title: 'Product',
          titleClass: 'text-center',
          dataClass: 'text-center'
        }, {
          name: 'previous_quantity',
          title: 'Prev. Quantity',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_in',
          title: 'IN',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_out',
          title: 'OUT',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_sold',
          title: 'Sold',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'current_quantity',
          title: 'Current Quantity',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            let spanClass = ''
            if(value < 0){
              spanClass = 'text-danger'
            }else if(value === 0){
              spanClass = 'text-warning'
            }
            return '<span class="' + spanClass + '">' + this.numberToMoney(value) + '</span>'
          }
        }, {
          name: '__slot:actions',
          title: 'Action',
          titleClass: 'text-center',
          dataClass: 'text-center'
        }]
      }
    }
  },
  methods: {
    showBatchInput(){
      this.$refs.batchInput._open()
    },
    viewHistory(productId){
      const productInventoryIndex = this.idLookUp[productId]
      this.$refs.inventoryHistory._open(this.productInventory[productInventoryIndex], this.dateFilteredString)
    },
    makeAdjustment(productId, productDescription){
      this.$refs.adjustmentForm._open(productId, productDescription)
    },
    updateProductInventory(newAdjustment){
      const productInventoryIndex = this.idLookUp[newAdjustment['product_id']]
      let productInventory = this.productInventory[productInventoryIndex]
      if(newAdjustment['type'] === 1){ // IN
        Vue.set(this.productInventory[productInventoryIndex], 'total_in', productInventory['total_in'] + newAdjustment['quantity'])
        Vue.set(this.productInventory[productInventoryIndex], 'current_quantity', productInventory['current_quantity'] + newAdjustment['quantity'])
      }else{ // OUT
        Vue.set(this.productInventory[productInventoryIndex], 'total_out', productInventory['total_out'] + newAdjustment['quantity'])
        Vue.set(this.productInventory[productInventoryIndex], 'current_quantity', productInventory['current_quantity'] - newAdjustment['quantity'])
      }
    },
    init(){
      let currentDate = new Date()
      let defaultTime = currentDate.getFullYear() + '-' + this.padNumber(currentDate.getMonth() + 1) + '-' + this.padNumber(currentDate.getDate()) + 'T00:00:00.000Z' // + 'T' + this.padNumber(16) + ':' + this.padNumber(0) + ':' + this.padNumber(0) + '.000Z'
      this.startDatetimeFilter = defaultTime
      setTimeout(() => {
        this.generate()
      }, 400)
    },
    async generate(){
      let startDatetimeFilter = new Date(this.startDatetimeFilter.replace('Z', ''))
      let endDatetimeFilter = null
      if(startDatetimeFilter === null){
        startDatetimeFilter = new Date()
        startDatetimeFilter.setHours(0, 0, 0)
      }
      if(this.endDatetimeFilter){
        endDatetimeFilter = new Date(this.endDatetimeFilter.replace('Z', ''))
        endDatetimeFilter.setHours(23, 59, 59)
      }else{
        let endTime = new Date()
        endTime.setHours(23, 59, 59)
      }
      if(this.terminal === 'local'){
        this.isGenerating = true
        const startDateString = this.formatDate(startDatetimeFilter)
        const endDateString = this.formatDate(endDatetimeFilter)
        this.dateFilteredString = startDateString + (startDateString !== endDateString ? ' to ' + this.formatDate(endDatetimeFilter) : '')
        if(UserSession.getters.mode === 'online'){
          await this.upSync()
          await this.downSync()
        }
        return this.generateOffline(startDatetimeFilter.getTime(), endDatetimeFilter.getTime())
      }
    },
    upSync(){
      return new Promise(resolve => {
        if(localStorage.getItem('is_terminal')){
          InventoryAdjustmentUpSync.upload().finally(() => {
            resolve(true)
          })
        }else{
          resolve(false)
        }
      })
    },
    downSync(){
      return new Promise(resolve => {
        if(localStorage.getItem('is_terminal')){
          const inventoryAdjustmentSync = new InventoryAdjustmentSync()
          inventoryAdjustmentSync.downSync().finally(() => {
            resolve(true)
          })
        }else{
          resolve(false)
        }
      })
    },
    generateOffline(startDatetime, endDatetime){
      let createdAtCondition = {
        '>': startDatetime
      }
      createdAtCondition['<='] = endDatetime
      // console.log('start', new Date(startDatetime))
      // console.log('end', new Date(endDatetime))
      // console.log(createdAtCondition)
      let query = {
        where: {
          has_inventory: 1
        },
        with: {
          inventory_adjustments: {
            use_db_id: true,
            with: {
              user: {
                is_parent: true,
                use_db_id: true
              }
            },
            where: {
              'created_at': createdAtCondition
            },
            order: {
              by: 'created_at',
              type: 'asc'
            },
          }
        },
        order: {
          by: 'description',
          type: 'asc'
        }
      }
      this.reset()
      return new Promise((resolve, reject) => {
        let productDB = new Product()
        productDB.get(query).then(products => {
          let noProductInventoryAdjustment = []
          products.forEach(product => {
            let productInventory = {
              product_id: product['db_id'],
              product_description: product['description'],
              previous_quantity: 0,
              total_in: 0,
              total_out: 0,
              total_sold: 0,
              current_quantity: 0
            }
            if(typeof product['inventory_adjustments'] !== 'undefined' && product['inventory_adjustments'].length){
              productInventory['inventory_adjustments'] = product['inventory_adjustments']
              productInventory['previous_quantity'] = product['inventory_adjustments'][0]['previous_quantity']
              product['inventory_adjustments'].forEach(inventoryAdjustment => {
                switch(inventoryAdjustment['type'] * 1){
                  case 1: // IN
                    productInventory['total_in'] += inventoryAdjustment['quantity'] * 1
                    break
                  case 2: // OUT
                    productInventory['total_out'] += inventoryAdjustment['quantity'] * 1
                    break
                  case 3: // Sold
                    productInventory['total_sold'] += inventoryAdjustment['quantity'] * 1
                    break
                }
              })
              const lastInventoryAdjustmentIndex = product['inventory_adjustments'].length - 1
              const negativeMultiplier = product['inventory_adjustments'][lastInventoryAdjustmentIndex]['type'] * 1 === 1 ? 1 : -1
              productInventory['current_quantity'] = product['inventory_adjustments'][lastInventoryAdjustmentIndex]['previous_quantity'] + (product['inventory_adjustments'][lastInventoryAdjustmentIndex]['quantity'] * negativeMultiplier)
            }else{
              productInventory['inventory_adjustments'] = []
              noProductInventoryAdjustment.push(productInventory['product_id'])
            }
            this.idLookUp[productInventory['product_id']] = this.productInventory.length
            this.productInventory.push(productInventory)
          })
          if(noProductInventoryAdjustment.length){
            this.retrieveLastInventoryAdjustments(noProductInventoryAdjustment, startDatetime).finally(() => {
              this.isGenerating = false
            })
          }else{
            this.isGenerating = false
          }
        }).catch(() => {
          this.isGenerating = false
        })
      })
    },
    retrieveLastInventoryAdjustments(productIds, startDatetime){
      let query = {
        where: {
          db_id: {
            in: productIds
          }
        },
        with: {
          inventory_adjustments: {
            use_db_id: true,
            // groupBy: 'product_id',
            where: {
              created_at: {
                '<': startDatetime
              },
            },
            order: {
              by: 'created_at',
              type: 'desc'
            },
          }
        }
      }
      console.log('last inventory param', query)
      return new Promise((resolve, reject) => {
        let productDB = new Product()
        productDB.get(query).then(products => {
          console.log('last inventory result', products)
          products.forEach(product => {
            if(typeof product['inventory_adjustments'] !== 'undefined' && product['inventory_adjustments'].length){
              const productInventoryIndex = this.idLookUp[product['db_id']]
              const negativeMultiplier = product['inventory_adjustments'][0]['type'] === 1 ? 1 : -1
              const previousQuantity = product['inventory_adjustments'][0]['previous_quantity'] + (product['inventory_adjustments'][0]['quantity'] * negativeMultiplier)
              Vue.set(this.productInventory[productInventoryIndex], 'previous_quantity', previousQuantity)
              Vue.set(this.productInventory[productInventoryIndex], 'current_quantity', previousQuantity)
            }
          })
          resolve(true)
        }).catch(() => {
          resolve(true)
        })
      })
    },
    reset(){
      this.totalIn = 0
      this.totalOut = 0
      this.previousQuantity = 0
      this.currentQuantity = 0
      this.productInventory = []
    }
  },
  watch: {
    startDatetimeFilter(newDatetime){
      let startdatetimeSegnment = newDatetime.split('T')
      this.endDatetimeFilter = startdatetimeSegnment[0] + 'T00:00:00.000Z'
    },
    isSynching(newData) {
      if(newData === false){
        this.init()
      }
    }
  },
  computed: {
    isSynching() {
      return SyncStore.getters.isSynching
    }
  }
}
</script>
