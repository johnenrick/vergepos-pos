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
            <fa :icon="'tag'" /> Discounts
          </h5>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-12">
              <select
                v-model="selectedDiscountIndex"
                class="form-control text-center font-weight-bold"
              >
                <option value="null">
                  Select a Discount
                </option>
                <option
                  v-for="(discount, index) in discountList"
                  :value="index"
                >
                  {{ discount['description'] }}
                </option>
              </select>
            </div>
          </div>
          <template v-if="selectedDiscountIndex !== 'null' && selectedDiscountIndex !== null">
            <div class="row py-3">
              <div class="col-sm-12 text-center">
                <label class="col-form-label">{{ selectedDiscountWriteUp }}</label>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-12 text-center">
                <label
                  v-show="discountList[selectedDiscountIndex]['type'] === 2 || discountList[selectedDiscountIndex]['type'] === 4"
                  class="float-right"
                ><input
                  v-model="applyDiscountToAll"
                  type="checkbox"
                  class=""
                > Select All</label>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in orderedItemList">
                      <td>{{ item['description'] }}</td>
                      <td class="text-right">
                        <input
                          v-if="!applyDiscountToAll"
                          @click="selectedItems[index]['quantity'] = ''"
                          :placeholder="'max: ' + item['quantity']"
                          @blur="selectedItems[index]['quantity'] = validateSelectedItemQuantity(selectedItems[index]['quantity'], item['quantity'])"
                          v-model="selectedItems[index]['quantity']"
                          maxlength="5"
                          type="number"
                          class="form-control text-right"
                        >
                        <label
                          v-else
                          class="col-form-label"
                        >{{ selectedItems[index]['quantity'] }}</label>
                      </td>
                      <td class="text-right">
                        <label class="col-form-label">{{ (selectedItems[index]['discount_amount'] = getDiscountItemAmount(selectedItems[index]['quantity'] * 1, item['price'], index)) | numberToMoney }}</label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
          <hr class="my-4">
          <div class="row">
            <div class="col-8 text-right">
              <label class="form-control-plaintext">Total Vat Exempt:</label>
            </div>
            <div class="col-4 text-right font-weight-bold">
              <label class="form-control-plaintext">{{ totalVatExempt | numberToMoney }}</label>
            </div>
          </div>
          <div class="row ">
            <div class="col-8 text-right">
              <label class="form-control-plaintext">Total Discount: </label>
            </div>
            <div class="col-4 text-right font-weight-bold">
              <label class="form-control-plaintext">{{ totalDiscount | numberToMoney }}</label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
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
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import Discount from '@/database/controller/discount.js'
export default {
  mounted () {
    this.listDiscount()
  },
  props: {
    orderList: Array
  },
  data () {
    return {
      discountList: [],
      selectedDiscountIndex: null,
      selectedDiscountWriteUp: '',
      selectedItems: {},
      applyDiscountToAll: false,
      totalDiscount: 0,
      totalVatExempt: 0,
      savedDiscountedItem: null,
      loadingOrderedItemList: false
    }
  },
  methods: {
    save () {
      this.savedDiscountedItem = {}
      for (let x in this.selectedItems) {
        this.savedDiscountedItem[this.orderedItemList[x]['order_item_identifier']] = {
          quantity: this.selectedItems[x]['quantity'],
          discount_amount: this.selectedItems[x]['discount_amount']
        }
      }
      $(this.$refs.modal).modal('hide')
      this.$emit('discount_updated', this.totalDiscount, this.totalVatExempt, this.discountList[this.selectedDiscountIndex]['id'], this.savedDiscountedItem)
    },
    discountChanged (event) {
      // if(event.target.value !== null){
      //   if(this.discountList[event.target.value][''])
      // }
    },
    listDiscount () {
      (new Discount()).getAll().then((response) => {
        this.discountList = response || []
      })
    },
    getTotalDiscount () {
      let totalDiscount = 0
      let totalVatExempt = 0
      for (let x in this.selectedItems) {
        totalDiscount += this.selectedItems[x]['discount_amount']
        totalVatExempt += this.selectedItems[x]['vat_exempt_amount']
      }
      this.totalDiscount = totalDiscount
      this.totalVatExempt = totalVatExempt
    },
    resetDiscountedItems () {
      for (let x in this.selectedItems) {
        Vue.set(this.selectedItems[x], 'quantity', 0)
        Vue.set(this.selectedItems[x], 'vat_exempt_amount', 0)
        Vue.set(this.selectedItems[x], 'discount_amount', 0)
      }
      this.getTotalDiscount()
    },
    validateSelectedItemQuantity (selectedItemQuantity, itemQuantity) {
      if (selectedItemQuantity > itemQuantity) {
        return itemQuantity
      }
      if (selectedItemQuantity <= 0) {
        return 0
      }
      return selectedItemQuantity
    },
    discountAllItems () {
      console.log('got here', this.selectedItems)
      for (let x in this.selectedItems) {
        Vue.set(this.selectedItems[x], 'quantity', this.orderedItemList[x]['quantity'])
      }
      this.getTotalDiscount()
    },
    getDiscountItemAmount (discountedQuantity, itemAmount, index) {
      setTimeout(() => {
        this.getTotalDiscount()
      }, 200)
      if (this.discountList[this.selectedDiscountIndex]['is_vat_exempt']) {
        Vue.set(this.selectedItems[index], 'vat_exempt_amount', itemAmount * 0.12 * discountedQuantity)
      } else {
        Vue.set(this.selectedItems[index], 'vat_exempt_amount', 0)
      }
      if (this.discountList[this.selectedDiscountIndex]['type'] === 1 || this.discountList[this.selectedDiscountIndex]['type'] === 2) {
        return discountedQuantity * ((itemAmount / 1.12) * (this.discountList[this.selectedDiscountIndex]['value'] / 100)) // calculate the discount from the base price(no tax)
      } else {
        return discountedQuantity * this.discountList[this.selectedDiscountIndex]['value']
      }
      // switch(this.discountList[this.selectedDiscountIndex]['type']){
      //   case 2:
      //
      //   case 4:
      //
      // }
    },
    orderedItemListChanged (orderedItemList) {
      this.selectedItems = {}
      if (orderedItemList.length) {
        for (let x = 0; x < orderedItemList.length; x++) {
          if (this.savedDiscountedItem && typeof this.savedDiscountedItem[orderedItemList[x]['order_item_identifier']] !== 'undefined') {
            Vue.set(this.selectedItems, x, {
              quantity: this.savedDiscountedItem[orderedItemList[x]['order_item_identifier']]['quantity'],
              discount_amount: 0,
              vat_exempt_amout: 0
            })
          } else {
            Vue.set(this.selectedItems, x, {
              quantity: 0,
              discount_amount: 0,
              vat_exempt_amout: 0
            })
          }
        }
      }
    },
    reset () {
      this.applyDiscountToAll = false
      this.savedDiscountedItem = null
      // this.totalDiscount = 0
      // this.totalVatExempt = 0
      this.resetDiscountedItems()
    },
    _open () { // open the modal
      let orderedItemList = this.cloneObject(this.orderList)
      $(this.$refs.modal).modal('show')
      this.orderedItemListChanged(orderedItemList)
      this.orderedItemList = orderedItemList

      if (this.savedDiscountedItem) {
        if (this.applyDiscountToAll) {
          this.discountAllItems()
        }
      } else {
        this.reset()
      }
    },
    _getItemDiscount () {

    }
  },
  watch: {
    applyDiscountToAll (data) {
      data ? this.discountAllItems() : this.resetDiscountedItems()
    },

    selectedDiscountIndex (data) {
      console.log(data)
      if (data === 'null' || data === null) {
        this.reset()
        return false
      }
      switch (this.discountList[data]['type'] * 1) {
        case 1:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + '% will be deducted on all items.'
          this.applyDiscountToAll = true
          break
        case 2:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + '% will be deducted on the selected items.'
          break
        case 3:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + 'pesos will be deducted on the all items.'
          break
        case 4:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + 'pesos will be deducted on the selected items.'
          break
        default:
          this.selectedDiscountWriteUp = ''
      }
    }
  }
}
</script>
