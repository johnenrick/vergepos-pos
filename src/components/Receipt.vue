<template>
  <div>
    <div v-if="errorMessage" class="text-danger text-center font-weight-bold border border-danger rounded py-2">{{errorMessage}}</div>
    <div :id="randomId" class="shadow p-2 mb-2" >
      <div :style="isPrinting ? printingStyle : ''">
        <div class="text-center">
        <p class="mb-0">
          <strong style="text-transform: uppercase">{{companyInformation.name}}</strong>
          <span v-if="companyInformation.address !== null || companyInformation.address === ''"><br>{{companyInformation.address}}</span>
          <span v-if="companyInformation.contact_number !== null"><br>{{companyInformation.contact_number}}</span>
        </p>
        </div>
        <br>
        <table class="table table-sm" style="width:100%">
          <tbody>
            <tr v-if="transactionDetail.status === 2">
              <td class="text-uppercase  text-center text-danger" colspan="2" >
                <span class="font-weight-bold" >Voided Transaction</span> <br>
                Ref. Txn# {{transactionDetail.voidTransactionNumber}}
              </td>
            </tr>
            <tr class="">
              <td class="text-uppercase" >{{transactionDetail.datetime | toReadableDateTime}}</td>
              <td class="text-right" style="text-align: right">{{transactionNumber}} </td>
            </tr>
          </tbody>
        </table>
        <div v-if="transactionOperation === 2" class="text-center">
          <p>This Void Transaction has voided transaction</p>
          <p class="font-weight-bold">{{transactionDetail.voidedTransactionNumber}}</p>
          <p>due to the reason of</p>
          <p><em>{{transactionDetail.voidTransactionReason}}</em></p>
          <hr>
        </div>
        <div v-else>
          <table class="table table-sm mb-1" style="width:100%">
            <thead>
              <tr class="text-center">
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(product, index) in transactionProduct">
                <tr :key="index">
                  <td class="">{{product['description']}}</td>
                  <td class="text-right" style="text-align: right">{{product['quantity']}}</td>
                  <td class="text-right" style="text-align: right">{{product['price'] | numberFormat}}</td>
                </tr>
              </template>
            </tbody>
          </table>
          <table class="table table-sm topDivider mb-0 w-100" style="width:100%">
            <tbody>
              <tr class="font-weight-bold" >
                <td>Sub Total</td>
                <td style="text-align: right">{{transactionDetail.subTotalAmount | numberFormat}}</td>
              </tr>
              <tr>
                <td>VAT Sales</td>
                <td style="text-align: right">{{transactionDetail.vatSales | numberFormat}}</td>
              </tr>
              <tr>
                <td>VAT Exempt Sales</td>
                <td style="text-align: right">{{transactionDetail.vatExemptSales | numberFormat}}</td>
              </tr>
              <tr>
                <td>ZR Sales</td>
                <td style="text-align: right">{{transactionDetail.vatZeroRatedSales | numberFormat}}</td>
              </tr>
              <tr>
                <td>VAT Amount</td>
                <td style="text-align: right">{{transactionDetail.vatAmount | numberFormat}}</td>
              </tr>
              <tr>
                <td>Discount</td>
                <td style="text-align: right">{{transactionDetail.discountAmount | numberFormat}}</td>
              </tr>
              <tr class="font-weight-bold text-uppercase">
                <td>Total</td>
                <td style="text-align: right">{{transactionDetail.totalAmount | numberFormat}}</td>
              </tr>
              <tr>
                <td>Cash</td>
                <td style="text-align: right">{{transactionDetail.cashTendered | numberFormat}}</td>
              </tr>
              <tr>
                <td>Change</td>
                <td style="text-align: right">{{(transactionDetail.cashTendered - transactionDetail.totalAmount) | numberFormat}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <br>
        <div class="text-center">
          <p>
            VergePOS<br>
            vergepos.com<br>
            Cebu City, Cebu
          </p>
        </div>
      </div>
    </div>
    <div v-if="transactionDetail.id && !toVoid" class="p-2 pt-3">
      <button v-if="transactionDetail.voidable && transactionDetail.status !== 2" @click="triggerVoid"  class="btn btn-danger"><fa :icon="'ban'" /> VOID</button>
      <span v-if="transactionDetail.status === 2" class="btn-danger btn disabled">Voided</span>
      <button @click="print" type="button" class="btn btn-outline-primary float-right"><fa :icon="'print'" /> Reprint</button>
    </div>
    <div v-if="toVoid">
      <div v-if="users.length">
        <div class="pt-2 mt-2">
          <input v-model="remarks" type="text" placeholder="Remarks" class="form-control" required>
        </div>
        <div class="input-group mt-2 pt-2">
          <select class="form-control" v-model="selected">
            <option :value="null" disabled selected>Select Manager</option>
            <option v-for="user in users" :value="user" :key="user.id">
              {{ user.email }}
            </option>
          </select>
          <input v-model="pin" @keypress.enter="voidTransaction" type="password" class="form-control" placeholder="PIN" aria-describedby="basic-addon2">
          <div class="input-group-append">
            <button @click="voidTransaction"  class="btn btn-outline-danger" type="button">Void</button>
            <button @click="toVoid = false" class="btn btn-outline-primary"><fa :icon="'times'" /> </button>
          </div>
        </div>
        <span class="text-danger" v-if="voidErrorMessage">&nbsp;<fa icon="exclamation-triangle"/>{{voidErrorMessage}}</span>
      </div>
      <div v-else>
        <fa icon="times-circle" class="text-danger"/>
        There are no Manager User Account. Go to <router-link to="user-management" class="font-weight-bold">Bussiness > User Management</router-link> to modify your account or create a Manager Account
      </div>
    </div>
  </div>
</template>
<script>
import store from '@/vue-web-core/system/store'
import User from '@/database/controller/user'
import TransactionVoids from '@/database/controller/transaction-void'
import TransactionNumber from '@/database/controller/transaction-number'

import Vue from 'vue'
import VueHtmlToPaper from 'vue-html-to-paper'

const options = {
  // name: '_blank',
  specs: [
    'fullscreen=no',
    'titlebar=no',
    'scrollbars=no'
  ],
  styles: [
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    'https://unpkg.com/kidlat-css/css/kidlat.css'
  ]
}
Vue.use(VueHtmlToPaper, options)

export default {
  props: {
  },
  mounted(){
    this.randomId = 'printMe' + this.generateRandomNumber(1, 10000)
  },
  data(){
    return {
      randomId: null,
      isLoading: false,
      errorMessage: null,
      transactionVoidDB: new TransactionVoids(),
      transactionNumberDB: new TransactionNumber(),
      userDB: new User(),
      transactionNumber: null,
      transactionOperation: 1,
      transactionProduct: [],
      toVoid: false,
      users: [],
      selected: null,
      pin: '',
      remarks: '',
      voidErrorMessage: null,
      printingStyle: {
        'width': '250px',
        'font-size': '5pt',
        'font-family': 'monospace'
      },
      transactionDetail: {
        id: null,
        subTotal: 0,
        vatSales: 0,
        vatExemptSales: 0,
        vatZeroRatedSales: 0,
        vatAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        subTotalAmount: 0,
        cashTendered: 0,
        datetime: '0/0/0',
        status: 1,
        voidable: false,
        voidTransactionNumber: null, // the transaction number used to void
        voidedTransactionNumber: null // the transaction number being voided

      },
      isPrinting: false
    }
  },
  methods: {
    async _view(transactionNumber){
      this.reset()
      this.transactionNumber = transactionNumber
      this.isLoading = true
      if(!this.transactionNumber){
        this.isLoading = false
        return false
      }
      return new Promise((resolve, reject) => {
        const transactionNumber = {
          where: {
            number: this.transactionNumber * 1,
          },
          with: {
            transaction: {
              with: {
                transaction_products: {
                  groupBy: 'id',
                  join: {
                    with: 'products',
                    on: 'transaction_products.product_id=products.db_id',
                    type: 'inner',
                    as: {
                      'id': 'product_id',
                      'db_id': 'product_db_id',
                      'cost': 'product_cost',
                      'created_at': 'product_created_at',
                      'updated_at': 'product_updated_at',
                      'deleted_at': 'product_deleted_at'
                    }
                  }
                }
              }
            },
            transaction_void: {
              with: {
                transaction: {
                  is_parent: true,
                  with: {
                    transaction_products: {
                      groupBy: 'id',
                      join: {
                        with: 'products',
                        on: 'products.db_id=transaction_products.product_id',
                        type: 'inner',
                        as: {
                          'id': 'product_id',
                          'db_id': 'product_db_id',
                          'created_at': 'product_created_at',
                          'updated_at': 'product_updated_at',
                          'deleted_at': 'product_deleted_at',
                          'cost': 'cost'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          groupBy: 'id',
          join: [{
            with: 'transaction_voids',
            on: 'transaction_numbers.number=transaction_voids.voided_transaction_number',
            type: 'left',
            as: {
              'id': 'transaction_void_id',
              'db_id': 'transaction_void_db_id',
              'transaction_id': 'transaction_void_transaction_id',
              'transaction_number_id': 'transaction_void_transaction_number_id',
              'created_at': 'transaction_void_created_at',
              'updated_at': 'transaction_void_updated_at',
              'deleted_at': 'transaction_void_updated_at',
            },

          }, {
            with: 'transaction_numbers',
            on: 'transaction_voids.transaction_number_id=transaction_numbers.id',
            type: 'left',
            as: {
              'id': 'transaction_void_transaction_number_id',
              db_id: 'transaction_void_transaction_number_db_id',
              number: 'transaction_void_transaction_number_number',
              operation: 'transaction_void_transaction_number_operation',
              'created_at': 'transaction_void_transaction_number_created_at',
              'updated_at': 'transaction_void_transaction_number_updated_at',
              'deleted_at': 'transaction_void_transaction_number_updated_at',
            }
          }],
        }
        this.transactionNumberDB.get(transactionNumber).then((result) => {
          console.log(result, transactionNumber)
          if(result.length){
            result = result[0]
            if(result['operation'] === 2){
              this.transactionOperation = 2
              this.transactionDetail.datetime = result['created_at']
              this.transactionDetail.transactionNumber = result['number']
              if(result['transaction_void']){
                this.transactionDetail.voidedTransactionNumber = result['transaction_void']['voided_transaction_number']
                this.transactionDetail.voidTransactionReason = result['transaction_void']['remarks']
              }
            }else{
              console.log(result)
              this.transactionOperation = 1
              this.transactionDetail.id = result['transaction']['id']
              this.transactionDetail.transactionNumber = result['number']
              this.transactionDetail.vatSales = result['transaction']['total_vat_sales']
              this.transactionDetail.vatExemptSales = result['transaction']['total_vat_exempt_sales']
              this.transactionDetail.vatZeroRatedSales = result['transaction']['total_vat_zero_rated_sales']
              this.transactionDetail.vatAmount = result['transaction']['total_vat_amount']
              this.transactionDetail.discountAmount = result['transaction']['total_discount_amount']
              this.transactionDetail.totalAmount = result['transaction']['total_amount']
              this.transactionDetail.subTotalAmount = result['transaction']['sub_total_amount']
              this.transactionDetail.cashTendered = result['transaction']['cash_tendered']
              this.transactionDetail.datetime = result['created_at']
              this.transactionDetail.status = result['transaction_void_id'] ? 2 : 1
              let dateCreated = new Date(this.transactionDetail.datetime)
              let currentDate = new Date()
              this.transactionDetail.voidable = dateCreated.getDate() === currentDate.getDate()
              if(result['transaction_void_id']){
                this.transactionDetail.voidTransactionNumber = result['transaction_void_transaction_number_number']
              }
              this.transactionProduct = result['transaction']['transaction_products']
            }
            setTimeout(() => {
              this.isLoading = false
              resolve()
            }, 100)
          }else{
            this.isLoading = false
            this.errorMessage = 'No Transaction Found.'
          }
        }).catch(errorResult => {
          this.isLoading = false
          console.log('error', errorResult)
        })
      })
    },
    print(){
      this.isPrinting = true
      setTimeout(() => {
        this.$htmlToPaper(this.randomId)
        this.isPrinting = false
      }, 1000)
    },
    triggerVoid(){
      this.toVoid = true
      this.remarks = ''
      this.selected = null
      this.pin = ''
      this.voidErrorMessage = ''
      this.userDB.get({
        where: {
          is_manager: 1
        }
      }).then((e) => {
        this.users = e
      })
    },
    voidTransaction(){
      this.voidErrorMessage = ''
      if(this.remarks === ''){
        this.voidErrorMessage = ' Remarks field is required'
      }else{
        if(this.selected === null){
          this.voidErrorMessage = ' Please Select a Manager'
        }else{
          if(this.pin === this.selected.pin){
            this.transactionDB.update({
              id: this.transactionDetail.id,
              status: 2
            }).then((result) => {
              let transactionNumberEntry = {
                db_id: 0,
                operation: 2,
                store_terminal_id: localStorage.getItem('is_terminal') * 1,
                user_id: localStorage.getItem('user_id') * 1
              }
              this.transactionNumberDB.add(transactionNumberEntry).then((transactionNumberResult) => {
                let transactionvoidEntry = {
                  transaction_id: this.transactionDetail.id, // the transaction id of the voided transaction
                  transaction_number_id: transactionNumberResult['id'] * 1, // the transaction number id
                  voided_transaction_number: this.transactionDetail.transactionNumber, // the transaction number of the voided transaction. This is relevant for transactions that has not been uploaded yet, therefore no transaction id yet
                  db_id: 0,
                  remarks: this.remarks
                }
                this.transactionVoidDB.add(transactionvoidEntry).then((response) => {
                  this.transactionDetail.voidTransactionNumber = transactionNumberResult['number']
                  this.transactionDetail.status = 2
                  this.voidErrorMessage = null
                  this.toVoid = false
                })
              })
            })
          }else{
            this.voidErrorMessage = ' PIN Is Incorrect'
          }
        }
      }
    },
    reset(){
      this.errorMessage = null
      this.toVoid = false
      this.transactionProduct = []
      for(let x in this.transactionDetail){
        this.transactionDetail[x] = 0
      }
    }
  },
  watch: {
    isLoading(newData){
      this.$emit('loading', newData)
    }
  },
  filters: {
    numberFormat: (value) => {
      value = typeof value !== 'undefined' ? value : 0
      return value.toFixed(2)
    }
  },
  computed: {
    companyInformation(){
      return store.state.companyInformation ? store.state.companyInformation : null
    }
  }
}
</script>
<style scoped>
.topDivider{
  border-top: 2px dashed
}
</style>
