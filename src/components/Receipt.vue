<template>
  <div>
    <div v-if="errorMessage" class="text-danger text-center font-weight-bold border border-danger rounded py-2">{{errorMessage}}</div>
    <div id="printMe" class="shadow p-2 mb-2" >
      <div :style="isPrinting ? printingStyle : ''">
        <table class="table table-sm" style="width:100%">
          <tr class="">
            <td class="text-uppercase" colspan="2">{{transactionDetail.datetime | toReadableDateTime}}</td>
            <td class="text-right">Transaction <p class="text-danger" v-if="transactionDetail.status === 2">(Voided)</p></td>
          </tr>
        </table>
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
                <td class="text-right">{{product['quantity']}}</td>
                <td class="text-right">{{product['price'] | numberFormat}}</td>
              </tr>
            </template>
          </tbody>
        </table>
        <table class="table table-sm topDivider mb-0" style="width:100%">
          <tr class="font-weight-bold">
            <td>Subt Total</td>
            <td class="text-right">{{transactionDetail.subTotalAmount | numberFormat}}</td>
          </tr>
          <tr>
            <td>VAT Sales</td>
            <td class="text-right">{{transactionDetail.vatSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>VAT Exempt Sales</td>
            <td class="text-right">{{transactionDetail.vatExemptSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>VAT Zero Rated Sales</td>
            <td class="text-right">{{transactionDetail.vatZeroRatedSales | numberFormat}}</td>
          </tr>
          <tr>
            <td>VAT Amount</td>
            <td class="text-right">{{transactionDetail.vatAmount | numberFormat}}</td>
          </tr>
          <tr>
            <td>Discount</td>
            <td class="text-right">{{transactionDetail.total_discount_amount | numberFormat}}</td>
          </tr>
          <tr class="font-weight-bold text-uppercase">
            <td>Total Amount</td>
            <td class="text-right">{{transactionDetail.totalAmount | numberFormat}}</td>
          </tr>
          <tr>
            <td>Cash</td>
            <td class="text-right">{{transactionDetail.cashTendered | numberFormat}}</td>
          </tr>
          <tr>
            <td>Change</td>
            <td class="text-right">{{(transactionDetail.cashTendered - transactionDetail.totalAmount) | numberFormat}}</td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="transactionDetail.id && !toVoid" class="p-2 pt-3">
      <button v-if="transactionDetail.voidable && transactionDetail.status !== 2" @click="triggerVoid"  class="btn btn-danger"><fa :icon="'ban'" /> VOID</button>
      <span v-if="transactionDetail.status === 2" class="btn btn-danger">Voided</span>
      <button @click="print" class="btn btn-outline-primary float-right"><fa :icon="'print'" /> Reprint</button>
    </div>
    <div v-if="toVoid">
      <div class="input-group mt-2 pt-2">
        <select class="form-control" v-model="selected">
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
      <span v-if="voidErrorMessage">{{voidErrorMessage}}</span>
    </div>
  </div>
</template>
<script>
import Transaction from '@/database/controller/transaction'
import User from '@/database/controller/user'
import TransactionProduct from '@/database/controller/transaction-product'
import Vue from 'vue'
import VueHtmlToPaper from 'vue-html-to-paper'

const options = {
  name: '_blank',
  specs: [
    'fullscreen=yes',
    'titlebar=yes',
    'scrollbars=yes'
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
  data(){
    return {
      isLoading: false,
      errorMessage: null,
      transactionDB: new Transaction(),
      transactionProductDB: new TransactionProduct(),
      userDB: new User(),
      transactionNumber: null,
      transactionProduct: [],
      toVoid: false,
      users: [],
      selected : '',
      pin: '',
      voidErrorMessage: null,
      printingStyle: {
        width: '15em',
        'font-size': '6pt'
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
        voidable: false
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
        this.transactionDB.get({
          join: {
            with: 'transaction_numbers',
            on: 'transactions.transaction_number_id=transaction_numbers.id',
            type: 'inner',
            as: {
              id: 'transaction_number_id',
              db_id: 'transaction_number_db_id',
              created_at: 'transaction_number_created_at',
              updated_at: 'transaction_number_updated_at',
              deleted_at: 'transaction_number_deleted_at',
            },
            where: {
              number: this.transactionNumber
            }
          }
        }).then((result) => {
          if(result.length){
            result = result[0]
            this.transactionDetail.id = result['id']
            this.transactionDetail.vatSales = result['total_vat_sales']
            this.transactionDetail.vatExemptSales = result['total_vat_exempt_sales']
            this.transactionDetail.vatZeroRatedSales = result['total_vat_zero_rated_sales']
            this.transactionDetail.vatAmount = result['total_vat_amount']
            this.transactionDetail.discountAmount = result['total_discount_amount']
            this.transactionDetail.totalAmount = result['total_amount']
            this.transactionDetail.subTotalAmount = result['sub_total_amount']
            this.transactionDetail.cashTendered = result['cash_tendered']
            this.transactionDetail.datetime = result['created_at']
            this.transactionDetail.status = result['status']
            let dateCreated = new Date(this.transactionDetail.datetime)
            let currentDate = new Date()
            this.transactionDetail.voidable = dateCreated.getDate() === currentDate.getDate()
            let getQuery = {
              where: {
                transaction_id: result['id']
              },
              join: {
                with: 'products',
                on: 'transaction_products.product_id=products.db_id',
                type: 'inner',
                as: {
                  'id': 'product_id',
                  'db_id': 'product_db_id',
                  'created_at': 'product_created_at',
                  'updated_at': 'product_updated_at',
                  'deleted_at': 'product_deleted_at'
                }
              }
            }
            this.transactionProductDB.get(getQuery).then(transactionProductResult => {
              if(transactionProductResult.length){
                this.transactionProduct = transactionProductResult
                this.isLoading = false
                // console.log(this.transactionProduct)
              }else{
                this.isLoading = false
                console.warn('No Product Retrieved')
              }
              setTimeout(() => {
                resolve()
              }, 100)
            }).catch(errorResult => {
              reject()
            })
          }else{
            this.isLoading = false
            this.errorMessage = 'No Transaction Found.'
          }
        }).catch(errorResult => {
          console.log('error', errorResult)
        })
      })
    },
    print(){
      this.isPrinting = true
      setTimeout(() => {
        this.$htmlToPaper('printMe')
        // this.isPrinting = false
      }, 1000)
    },
    triggerVoid(){
      console.log("TEST");
      this.toVoid = true;
      this.userDB.get({
        where :{
          is_manager : 1
        }
      }).then((e)=>{
        this.users = e;
        console.log("test:" + this.users);
      })
    },
    voidTransaction(){
      if(this.pin == this.selected.pin){
        this.transactionDB.update({
          id: this.transactionDetail.id,
          status : 2
        }).then((result)=>{
          this.transactionDetail.status = 2
          this.voidErrorMessage = null
          this.toVoid = false
        })
      }
    },
    reset(){
      this.errorMessage = null
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
  }
}
</script>
<style scoped>
.topDivider{
  border-top: 2px dashed
}
</style>
