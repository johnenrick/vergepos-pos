<template>
  <div
    ref="modal"
    class="modal"
    tabindex="-1"
    role="dialog"
  >
    <div
      class="modal-dialog"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Order Item Details
          </h5>
        </div>
        <div class="modal-body">
          <div class="form-group row">
            <label class="col-5 col-form-label text-right font-weight-bold">Description: </label>
            <div class="col-7">
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                :value="itemDetail['description']"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-5 col-form-label text-right font-weight-bold">Category: </label>
            <div class="col-7">
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                :value="itemDetail['category_description']"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-5 col-form-label text-right font-weight-bold">Price: </label>
            <div class="col-7">
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                :value="itemDetail['price']"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-5 col-form-label text-right font-weight-bold">Quantity: </label>
            <div class="col-7">
              <input
                ref="quantityInput"
                :placeholder="itemDetail['old_quantity']"
                @click="itemDetail['old_quantity'] = itemDetail['quantity']; itemDetail['quantity'] = ''"
                @blur="itemDetail['quantity'] === '' ? itemDetail['quantity'] = itemDetail['old_quantity'] * 1 : null"
                @keyup="blurOnEnter"
                v-model="itemDetail['quantity']"
                type="number"
                class="form-control text-right"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="remove"
            type="button"
            class="btn btn-outline-danger mr-auto ml-0"
            data-dismiss="modal"
          >
            Remove
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            data-dismiss="modal"
          >
            Close
          </button>
          <button
            @click="save"
            type="button"
            class="btn btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import Category from '@/database/controller/category.js'
import Cart from '../cart-store'
export default {
  data () {
    return {
      itemDetail: {},
      index: null
    }
  },
  methods: {
    save () {
      Cart.commit('changeQuantity', [this.index, this.itemDetail['quantity'] * 1])
      this.$emit('save', this.index)
      $(this.$refs.modal).modal('hide')
    },
    remove(){
      Cart.commit('deleteItem', this.index)
      this.$emit('delete', this.index)
    },
    _open (index) { // open the modal
      this.itemDetail = this.cloneObject(Cart.state.items[index])
      this.index = index
      if (typeof this.itemDetail['category_description'] === 'undefined') {
        (new Category()).get({ db_id: this.itemDetail['category_id'] }).then((result) => {
          if (result) {
            Vue.set(this.itemDetail, 'category_description', result['description'])
          }
        })
      }
      $(this.$refs.modal).modal('show')
    }
  }
}
</script>
