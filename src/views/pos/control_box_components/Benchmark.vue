<template>
  <div>
    <modal ref="modal" :closeable="false">
      <template v-slot:body>
        Benchmarking this device...<br>
        It may take a while.<br>
        Transaction Created: {{trasactionCounter}}
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import Transaction from '../transact.js'
export default {
  components: {
    Modal
  },
  data(){
    return {
      maximumTransaction: 100,
      trasactionCounter: 0
    }
  },
  methods: {
    _benchmark(){
      this.$refs.modal._open()
      this.populateTransaction()
    },
    populateTransaction(){
      let transactionData = JSON.parse(JSON.stringify(require('./benchmark-components/transaction_1.json')))
      let transactionDataProducts = JSON.parse(JSON.stringify(require('./benchmark-components/transaction_product_1.json')))
      let transaction = new Transaction()
      transaction.transact(transactionData, transactionDataProducts).then(transactionNumber => {
        this.trasactionCounter++
        if(this.trasactionCounter < this.maximumTransaction){
          this.populateTransaction()
        }
      })
    }
  }
}
</script>
