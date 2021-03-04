<template>
  <div>
    <modal ref="modal" title="Inventory Adjustment">
      <template v-slot:body>
        <CommonForm ref="adjustmentForm" :config="formConfig" />
        <button v-if="!isLoading" class="btn btn-success float-right" @click="save">Save Adjustment</button>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import CommonForm from '@/vue-web-core/components/form/Form'
import InventoryAdjustment from '@/database/controller/inventory-adjustment'
export default {
  components: {
    Modal,
    CommonForm
  },
  data(){
    return {
      isLoading: false,
      productId: null,
      formConfig: {
        fields: {
          product: {
            read_only: true
          },
          type: {
            is_required: true,
            type: 'select',
            config: {
              options: [{
                value: 1,
                text: 'IN'
              }, {
                value: 2,
                text: 'OUT'
              }]
            }
          },
          quantity: {
            is_required: true,
            type: 'number',

          },
          remarks: {
            type: 'textarea',
            help_text: 'Write the source, or the destination of the item. Example: Delivered by puregold, cooked, converted from other item, missing, defective, returned'
          }
        }
      }
    }
  },
  methods: {
    _open(productId, productDescription){
      this.$refs.modal._open()
      this.$refs.adjustmentForm._resetForm()
      this.$refs.adjustmentForm._fillFormData({ product: productDescription })
      this.productId = productId
      this.isLoading = false
    },
    save(){
      this.isLoading = true
      if(this.$refs.adjustmentForm._validate()){
        const { type, quantity, remarks = '' } = this.$refs.adjustmentForm._getFormData()
        const inventoryAdjustment = new InventoryAdjustment()
        const newAdjustment = {
          product_id: this.productId,
          type: type * 1,
          quantity: quantity * 1,
          remarks: remarks
        }
        inventoryAdjustment.add(newAdjustment).then(result => {
          this.$refs.modal._close()
          this.$emit('save', newAdjustment)
        }).finally(() => {
          this.isLoading = false
        })
      }else{
        this.isLoading = false
      }
    }
  }
}
</script>
