<template>
  <div>
    <h2 class="mb-3">Transaction History</h2>
    <br>
    <table-component ref="table" :config="tableConfig" @row-view-clicked="rowClicked" />
    <modal ref="modal" title="Transaction" icon="receipt">
      <template v-slot:body>
        {{openedTransactionNumber}}
        <receipt ref="receipt"  @loading="transactionLoading=$event"/>
      </template>
    </modal>
  </div>
</template>
<script>
import TableComponent from '@/vue-web-core/components/table/Table'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import TransactionDB from '@/database/controller/transaction'
import Receipt from '@/components/Receipt'
export default {
  components: {
    TableComponent,
    Modal,
    Receipt
  },
  mounted(){
    this.listTransaction()
  },
  data(){
    return {
      transactionDB: new TransactionDB(),
      openedTransactionNumber: null,
      tableConfig: {
        transaction_number_id: {
          name: 'Transaction Number'
        },
        total_amount: {
          type: 'decimal'
        },
        total_discount_amount: {
          type: 'decimal'
        },
        status: {
          type: 'html',
          value_function: (rowData) => {
            switch(rowData['status'] * 1){
              case 1:
                return '<span class="badge badge-success">Ok</span>'
            }
          }
        }
      }
    }
  },
  methods: {
    listTransaction(){
      this.transactionDB.getAll().then(response => {
        this.$refs.table._updateList(response)
      })
    },
    rowClicked(index, id){
      this.$refs.receipt._view(id * 1)
      this.$refs.modal._open()
    }
  }
}
</script>
