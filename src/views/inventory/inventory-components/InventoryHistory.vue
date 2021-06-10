<template>
  <div>
    <modal ref="modal" title="Inventory History" size="lg">
      <template v-slot:body>
        <div class="row mb-4">
          <div class="col-12 col-md-6">
            <div class="form-group row mb-0">
              <label class="col-4 col-form-label pr-0">Product:</label>
              <div class="col-8">
                <input v-model="productDescription" class="form-control-plaintext" >
              </div>
            </div>
            <div class="form-group row mb-0">
              <label class="col-4 col-form-label pr-0">Date:</label>
              <div class="col-8">
                <input v-model="date" class="form-control-plaintext" >
              </div>
            </div>
          </div>
          <div class="col- 12 col-md-6">
            <div class="form-group row mb-0">
              <label class="col-4 col-form-label pr-0 text-nowrap">Total In:</label>
              <div class="col-8">
                <input v-model="totalIn" class="form-control-plaintext" >
              </div>
            </div>
            <div class="form-group row mb-0">
              <label class="col-4 col-form-label pr-0 text-nowrap">Total Out:</label>
              <div class="col-8">
                <input v-model="totalOut" class="form-control-plaintext" >
              </div>
            </div>
            <div class="form-group row mb-0">
              <label class="col-4 col-form-label pr-0 text-nowrap">Total Sold:</label>
              <div class="col-8">
                <input v-model="totalSold" class="form-control-plaintext" >
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Qty</th>
                <th>Remarks</th>
                <th class="text-nowrap">Created by</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="inventoryAdjustment in inventoryAdjsutments">
                <tr>
                  <td class="text-center">
                    <span v-if="inventoryAdjustment['type'] === 1" class="badge badge-success"> IN</span>
                    <span v-if="inventoryAdjustment['type'] === 2" class="badge badge-danger"> OUT</span>
                    <span v-if="inventoryAdjustment['type'] === 3" class="badge badge-info"> SOLD</span>
                  </td>
                  <td class="text-nowrap">{{inventoryAdjustment['created_at'] | formatDate('mm/dd/yy hh:mm')}} {{inventoryAdjustment['created_at']}}</td>
                  <td class="text-right">{{inventoryAdjustment['quantity']}}</td>
                  <td>{{parseRemarks(inventoryAdjustment['type'], inventoryAdjustment['remarks'])}}</td>
                  <td>
                    <span v-if="typeof inventoryAdjustment['user'] !== 'undefined'">{{inventoryAdjustment['user']['first_name']}} {{inventoryAdjustment['user']['last_name']}}</span>
                    <span v-else >Error:1404</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
export default {
  components: {
    Modal
  },
  data(){
    return {
      productDescription: '',
      totalIn: 0,
      totalOut: 0,
      totalSold: 0,
      inventoryAdjsutments: [],
      date: ''
    }
  },
  methods: {
    _open(productInventory, date){
      this.productDescription = productInventory['product_description']
      this.inventoryAdjsutments = productInventory['inventory_adjustments']
      this.totalIn = productInventory['total_in']
      this.totalOut = productInventory['total_out']
      this.totalSold = productInventory['total_sold']
      this.date = date
      this.$refs.modal._open()
    },
    parseRemarks(type, remarks){
      if(type * 1 === 3){
        try {
          const parsedRemarks = JSON.parse(remarks)
          return `Terminal: ${parsedRemarks['store_terminal_id']}, Transaction Number: ${parsedRemarks['transaction_number']}`
        }catch (e){
          return remarks
        }
      }else{
        return remarks
      }
    }
  }
}
</script>
