<template>
  <modal ref="modal" title="Purchase History" icon="receipt" size="lg">
    <template slot="body">
      <div class="text-info mb-2"><fa icon="info-circle" /> You are only seeing data from this terminal. Data from other terminals are not included</div>
      <div class="text-center mb-3">
        <div class="btn-group mr-2" role="group" aria-label="First group">
          <button @click="currentView = 'purchase_history'" :class="currentView === 'purchase_history' ? 'btn-primary' : 'btn-outline-primary'" type="button" class="btn btn-sm">Purchase History</button>
          <button @click="currentView = 'product_summary'" :class="currentView === 'product_summary' ? 'btn-primary' : 'btn-outline-primary'" type="button" class="btn btn-sm">Product Summary</button>
        </div>
      </div>
      <div v-if="isLoading" class="text-center">Please wait...</div>
      <ProductSummary v-if="currentView === 'product_summary' && !isLoading" :product-summary="productSummary" />
      <TransactionHistory v-if="currentView === 'purchase_history' && !isLoading" :transactions="transactionHistory" :transaction-summary="transactionSummary" />
    </template>
  </modal>
</template>
<script>
import Vue from 'vue'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import UserStore from '@/vue-web-core/system/store'
import TransactionCustomer from '@/database/controller/transaction-customer'
import ProductSummary from './purchase-history-components/ProductSummary'
import TransactionHistory from './purchase-history-components/TransactionHistory'
export default {
  components: {
    Modal,
    ProductSummary,
    TransactionHistory
  },
  data(){
    return {
      isLoading: false,
      currentView: 'purchase_history',
      productSummary: {},
      transactionHistory: [],
      transactionSummary: {}
    }
  },
  methods: {
    _open(customerLocalId, customerDBId = null){
      this.$refs.modal._open()
      this.isLoading = true
      this.reset()
      this.retrieveCustomerTransactions(customerLocalId)
    },
    reset(){
      this.productSummary = {}
      this.transactionHistory = []
      this.transactionSummary = {}
    },
    retrieveCustomerTransactions(customerId){ // local customer id
      const transactionCustomerDB = new TransactionCustomer()
      const param = {
        where: {
          customer_id: customerId
        },
        order: {
          by: 'created_at',
          type: 'desc'
        },
        with: {
          transaction: {
            is_parent: true,
            with: {
              transaction_numbers: {
                is_parent: true
              },
              transaction_products: {
                join: {
                  with: 'products',
                  on: 'products.db_id=transaction_products.product_id',
                  as: {
                    id: 'product_local_id',
                    db_id: 'product_db_id',
                    description: 'product_description',
                    cost: 'product_cost',
                    created_at: 'product_created_at',
                    updated_at: 'product_updated_at',
                    deleted_at: 'product_deleted_at',
                  }
                }
              },
              transaction_voids: {}
            }
          }
        }
      }
      transactionCustomerDB.get(param).then(result => {
        console.log('result', result)
        let productSummary = {}
        let transactionHistory = []
        let totalAmount = 0
        result.forEach(transactionCustomer => {
          if(typeof transactionCustomer['transaction']['transaction_voids'] === 'undefined' && typeof transactionCustomer['transaction']['transaction_products'] !== 'undefined'){
            transactionCustomer['transaction']['transaction_products'].forEach(transactionProduct => {
              const productId = transactionProduct['product_id']
              if(typeof productSummary[productId] === 'undefined'){
                productSummary[productId] = {
                  product_description: transactionProduct['product_description'],
                  total_quantity: 0,
                  total_amount: 0,
                }
              }
              productSummary[productId]['total_amount'] += transactionProduct['vat_amount'] + transactionProduct['vat_sales'] + transactionProduct['vat_exempt_sales'] + transactionProduct['vat_zero_rated_sales']
              productSummary[productId]['total_quantity'] += transactionProduct['quantity']
            })
          }
          let transaction = {
            transaction_number: transactionCustomer['transaction']['transaction_numbers']['number'],
            status: typeof transactionCustomer['transaction']['transaction_voids'] !== 'undefined' ? 2 : 1,
            total_amount: transactionCustomer['transaction']['total_amount'],
            created_at: transactionCustomer['transaction']['created_at']
          }
          totalAmount += parseFloat(transactionCustomer['transaction']['total_amount'])
          transactionHistory.push(transaction)
        })
        Vue.set(this.transactionSummary, 'total_amount', totalAmount)
        this.transactionHistory = transactionHistory
        this.productSummary = productSummary
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
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
