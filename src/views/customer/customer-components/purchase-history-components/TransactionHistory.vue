<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead>
        <tr class="text-center">
          <th>TXN #</th>
          <th>Status</th>
          <th>Total Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="transaction in transactions">
          <tr>
            <td class="text-center">{{transaction['transaction_number']}}</td>
            <td class="text-center">
              <span v-if="transaction['status'] === 1" class="badge badge-success">Ok</span>
              <span v-if="transaction['status'] === 2" class="badge badge-danger">Voided</span>
            <td class="text-right">{{transaction['total_amount'] | numberToMoney}}</td>
            <td class="text-center">{{transaction['created_at'] | formatDate('M d, yyyy hh:mm')}}</td>
          </tr>
        </template>
        <tr v-if="transactions.length === 0">
          <td colspan="4" class="text-center">No Transactions</td>
        </tr>
      </tbody>
      <tfoot v-if="transactions.length">
        <tr class="font-weight-bold">
          <td class="text-center" colspan="2">Total</td>
          <td class="text-right">{{transactionSummary['total_amount'] | numberToMoney}}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    transactions: Array,
    transactionSummary: Object,
  }
}
</script>
