<template>
  <div>
    <h2 class="mb-3">Product Performance</h2>
    <br>
    <table-component ref="table" :config="tableConfig" @row-view-clicked="rowClicked" />
  </div>
</template>
<script>
import TableComponent from '@/vue-web-core/components/table/Table'
// import Modal from '@/vue-web-core/components/bootstrap/Modal'
import TransactionProductDB from '@/database/controller/transaction-product'
// import Receipt from '@/components/Receipt'
export default {
  components: {
    TableComponent,
    // Modal,
    // Receipt
  },
  mounted(){
    this.listTransactionProduct()
  },
  data(){
    return {
      transactionProductDB: new TransactionProductDB(),
      openedTransactionNumber: null,
      tableConfig: {
        product_description: {
          name: 'Product'
        },
        discount_amount: {
          type: 'decimal'
        },
        total_amount: {
          type: 'decimal'
        },
      }
    }
  },
  methods: {
    listTransactionProduct(){
      this.transactionProductDB.get({
        join: {
          with: 'products',
          on: 'transaction_products.product_id=products.id',
          type: 'inner',
          as: {
            'id': 'product_id',
            'db_id': 'product_db_id',
            'description': 'product_description',
            'created_at': 'product_created_at',
            'updated_at': 'product_updated_at',
            'deleted_at': 'product_deleted_at'
          }
        }
      }).then(response => {
        let productId = []
        let productSummaryList = {}
        for(let x = 0; x < response.length; x++){
          if(typeof productSummaryList[response[x]['product_id']] === 'undefined'){
            productSummaryList[response[x]['product_id']] = {
              product_description: response[x]['product_description'],
              product_id: response[x]['product_id'],
              discount_amount: 0,
              quantity: 0,
              total_amount: 0
            }
          }
          productSummaryList[response[x]['product_id']]['discount_amount'] = response[x]['discount_amount']
          productSummaryList[response[x]['product_id']]['quantity'] = response[x]['quantity']
          productSummaryList[response[x]['product_id']]['total_amount'] = response[x]['vat_amount'] + response[x]['vat_exempt_sales'] + response[x]['vat_sales'] + response[x]['vat_zero_rated_sales']
        }
        let productList = []
        for(let productIDKey in productSummaryList){
          productId.push()
          productList.push(productSummaryList[productIDKey])
        }
        // console.log(productList, productSummaryList)
        this.$refs.table._updateList(productList)
      })
    },
    rowClicked(index, id){
      this.$refs.receipt._view(id * 1)
      this.$refs.modal._open()
    }
  }
}
</script>
