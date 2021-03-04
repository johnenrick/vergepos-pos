<template>
  <div class="table-responsive">
    <table class="table table-sm">
      <thead>
        <tr class="text-center">
          <th>Product</th>
          <th>Total Quantity</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="product in productSummary">
          <tr>
            <td class="text-center">{{product['product_description']}}</td>
            <td class="text-right">{{product['total_quantity']}}</td>
            <td class="text-right">{{product['total_amount'] | numberToMoney}}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    productSummary: Object
  }
}
</script>
