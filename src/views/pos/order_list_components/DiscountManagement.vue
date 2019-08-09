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
                  Select a Discount {{selectedDiscountIndex}}
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
                        <number-input
                          v-if="!applyDiscountToAll"
                          :default-value="0"
                          :max-value="item['quantity']"
                          :placeholder="'max: ' + item['quantity']"
                          @change="orderedItemList[index]['discount_quantity'] = $event; discountQuantityChanged(index)"

                          />
                        <label
                          v-else
                          class="col-form-label"
                        >{{ orderedItemList[index]['discount_quantity'] }}</label>
                      </td>
                      <td class="text-right">
                        <label class="col-form-label">{{ orderedItemList[index]['discount_amount'] | numberToMoney }}</label>
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
              <label class="form-control-plaintext">Total Vat Exempt Sales:</label>
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
import Cart from '../cart-store'
import Calc from '@/vue-web-core/helper/calculator'
import NumberInput from '@/components/NumberInput'
export default {
  components: {
    NumberInput
  },
  mounted () {
    this.listDiscount()
  },
  props: {
  },
  data () {
    return {
      discountList: [],
      selectedDiscountIndex: null,
      selectedDiscountWriteUp: '',
      orderedItemList: [],
      applyDiscountToAll: false,
      totalDiscount: 0,
      totalVatExempt: 0,
      loadingOrderedItemList: false
    }
  },
  methods: {
    save () {
      // TODO saving happens here
      for(let x = 0; x < this.orderedItemList.length; x++){
        Cart.commit('applyDiscount', [
          x,
          this.orderedItemList[x]['discount_quantity'] * 1,
          this.orderedItemList[x]['discount_amount'] * 1,
          this.orderedItemList[x]['vat_exempt_quatity'] * 1,
          this.orderedItemList[x]['vat_exempt_sales'] * 1
        ])
      }
      Cart.commit('setDiscountId', this.selectedDiscountIndex === null ? null : this.discountList[this.selectedDiscountIndex]['id'])
      Cart.commit('calculateTotal')
      $(this.$refs.modal).modal('hide')
      this.$emit('discount_updated', this.totalDiscount, this.totalVatExempt)
    },
    discountChanged (event) {
      // if(event.target.value !== null){
      //   if(this.discountList[event.target.value][''])
      // }
    },
    listDiscount () {
      (new Discount()).getAll().then((response) => {
        this.discountList = response || []
        for(let x = 0; x < this.discountList.length; x++){
          this.discountList[x]['value_percentage'] = Calc.numberFormat(this.discountList[x]['value'] / 100)
        }
      })
    },
    getTotalDiscount () {
      if(this.selectedDiscountIndex === null){
        return false
      }

      let totalDiscount = 0
      let totalVatExempt = 0
      let discountSelected = this.discountList[this.selectedDiscountIndex]
      for (let x in this.orderedItemList) {
        let itemPrice = this.orderedItemList[x]['price']
        if(discountSelected['is_vat_exempt']){
          itemPrice = itemPrice / (1 + Cart.state.taxPercentage)
          this.orderedItemList[x]['vat_exempt_quatity'] = this.orderedItemList[x]['discount_quantity']
          this.orderedItemList[x]['vat_exempt_sales'] = Calc.numberFormat(itemPrice * this.orderedItemList[x]['discount_quantity'])
        }else{
          this.orderedItemList[x]['vat_exempt_quatity'] = 0
          this.orderedItemList[x]['vat_exempt_sales'] = 0
        }
        this.orderedItemList[x]['discount_amount'] = Calc.numberFormat(Calc.numberFormat(itemPrice * discountSelected['value_percentage']) * this.orderedItemList[x]['discount_quantity'])
        totalDiscount += this.orderedItemList[x]['discount_amount']
        totalVatExempt += this.orderedItemList[x]['vat_exempt_sales']
      }
      this.totalDiscount = totalDiscount
      this.totalVatExempt = totalVatExempt
    },
    resetDiscountedItems () {
      for (let x in this.orderedItemList) {
        Vue.set(this.orderedItemList[x], 'discount_quantity', 0)
        Vue.set(this.orderedItemList[x], 'vat_exempt_sales', 0)
        Vue.set(this.orderedItemList[x], 'vat_exempt_quantity', 0)
        Vue.set(this.orderedItemList[x], 'discount_amount', 0)
      }
      this.getTotalDiscount()
    },
    discountQuantityChanged (index) {
      let discountedQuantity = this.orderedItemList[index]['discount_quantity'] * 1
      if (discountedQuantity > this.orderedItemList[index]['quantity'] * 1) {
        discountedQuantity = this.orderedItemList[index]['quantity']
      }else if (isNaN(discountedQuantity * 1) || discountedQuantity <= 0) {
        discountedQuantity = 0
      }
      this.orderedItemList[index]['discount_quantity'] = discountedQuantity
      this.getTotalDiscount()
    },
    discountAllItems () {
      for (let x in this.orderedItemList) {
        Vue.set(this.orderedItemList[x], 'discount_quantity', this.orderedItemList[x]['quantity'])
      }
      this.getTotalDiscount()
    },
    _reset() {
      this.applyDiscountToAll = false
      this.selectedDiscountIndex = null
      this.resetDiscountedItems()
      this.totalDiscount = 0
      this.totalVatExempt = 0
    },
    _open () { // open the modal
      let orderedItemList = this.cloneObject(Cart.state.items)
      $(this.$refs.modal).modal('show')
      this.orderedItemList = orderedItemList
      if(this.applyDiscountToAll){
        this.discountAllItems()
      }
      this.getTotalDiscount()
    }
  },
  watch: {
    applyDiscountToAll (data) {
      data ? this.discountAllItems() : this.resetDiscountedItems()
    },
    selectedDiscountIndex (data) {
      if (data === 'null' || data === null) {
        this._reset()
        return false
      }
      let vatExemptText = this.discountList[data]['is_vat_exempt'] ? 'The discounted items will also be VAT Exempted.' : ''
      switch (this.discountList[data]['type'] * 1) {
        case 1:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + '% will be deducted on all items. ' + vatExemptText
          this.applyDiscountToAll = true
          break
        case 2:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + '% will be deducted on the selected items. ' + vatExemptText
          break
        case 3:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + 'pesos will be deducted on the all items. ' + vatExemptText
          break
        case 4:
          this.selectedDiscountWriteUp = this.discountList[data]['value'] + 'pesos will be deducted on the selected items. ' + vatExemptText
          break
        default:
          this.selectedDiscountWriteUp = ''
      }
      this.getTotalDiscount()
    }
  }
}
</script>
