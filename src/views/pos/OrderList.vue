<template>
  <div class="border shadow bg-white">
    <div
      ref="header"
      class="row font-weight-bold text-center pb-2 mx-0"
    >
      <div class="col-6 bg-primary text-white py-3">
        Description
      </div>
      <div class="col-2 bg-primary text-white py-3">
        Qty
      </div>
      <div class="col-4 bg-primary text-white py-3">
        Price
      </div>
    </div>
    <div
      ref="container"
      class="orderListContainer"

      :style="{'max-height': containerHeight , 'min-height': containerHeight }"
      style=" overflow-y:scroll"
    >
      <div
        ref="itemContainer"
        v-for="(order, index) in orderList"
        @click="openOrder(index)"
        class="row border-bottom mb-0 py-2 mx-0 itemContainer"
      >
        <div class="col-6 px-2">
          {{ order['description'] }}
        </div>
        <div
          class="col-2 text-right p-0"
          @click1="changeQuantity"
        >
          {{orderList[index]['quantity']}}
          <!-- <input
            :placeholder="orderList[index]['old_quantity'] * 1"
            @click="orderList[index]['old_quantity'] = orderList[index]['quantity']; orderList[index]['quantity'] = ''"
            @blur="orderList[index]['quantity'] === '' ? orderList[index]['quantitsy'] = orderList[index]['old_quantity'] * 1 : null; calculateTotal()"
            v-model="orderList[index]['quantity']"
            type="number"
            class="form-control text-right"
          > -->
        <!-- <span class="form-control text-right">{{orderList[index]['quantity']}}</span> -->
        </div>
        <div class="col-4 text-right px-2">
          {{ (order['quantity'] * order['price']) | numberToMoney }}
        </div>
      </div>
    </div>
    <div
      ref="footer"
      class="py-2 border-top"
    >
      <div class="row mx-0 py-2 align-items-center">
        <div class="col-8  pr-0">
          <!-- <span class="badge badge-secondary mr-1">Has Parked Txn</span> -->
        </div>
        <div class="col-4 text-right font-weight-bold pr-3">
          <big>{{ totalAmount | numberToMoney }}</big>
        </div>
      </div>
      <div class="row no-gutters mx-0 px-1 align-items-center">
        <div class="col-5 mb-2">
          <div class="btn-group dropup">
            <button
              class="btn btn-outline-dark dropdown-toggle"
              type="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <fa :icon="'cog'" /> More Action
            </button>
            <div class="dropdown-menu">
              <a
                @click="openApplyDiscount"
                class="dropdown-item"
                href="javascript:void(0)"
              ><fa icon="percent" /> Apply Discounts</a>
              <!-- <a
                @click="parkTransaction"
                class="dropdown-item"
                href="javascript:void(0)"
              ><fa icon="parking" />  Park Transaction</a> -->
            </div>
          </div>
        </div>
        <div v-show="totalDiscount" class="col-7 mb-2 text-right pr-3" style="line-height: 15px;">
          <table class="float-right">
            <!-- {{totalAmount}} {{totalDiscount}} {{totalAmount + totalDiscount}} {{subTotalAmount}} -->
            <tr>
              <td class="px-2"><small>Sub Total</small></td>
              <td><small>{{subTotalAmount | numberToMoney}}</small></td>
            </tr>
            <tr v-if="totalAmount + totalDiscount !== subTotalAmount">
              <td class="px-2"><small>After Vat Exempt</small></td>
              <td><small>{{totalAmount + totalDiscount | numberToMoney}}</small></td>
            </tr>
            <tr>
              <td class="px-2"><small class="text-danger">Discount</small></td>
              <td><small class="text-danger">({{totalDiscount | numberToMoney}})</small></td>
            </tr>
          </table>

        </div>
        <!-- <div class="col-1" /> -->
        <div class="col-12">
          <button
            @click="checkout"
            class="btn btn-success btn-lg float-right w-100 py-2"
          >
            CHECKOUT
          </button>
        </div>
      </div>
    </div>
    <discount-managent
      @discount_updated="discountUpdated"
      ref="discountManagement"
      :order-list="orderList"
    />
    <park-transaction
      ref="parkTransaction"
    />
    <ordered-item-detail
      @save="saveOrderedItem"
      @delete="deletedOrderedItem"
      ref="orderedItemDetail"
    />
    <checkout
      ref="checkout"
      :total-amount="totalAmount"
      :sub-total="subTotalAmount"
      :total-discount-amount="totalDiscount"
      :total-vat-exempt="totalVatExemptSales"
      :total-vat-sales="totalVatSales"
      :total-vat-amount="totalVatAmount"
      :applied-discount-id="appliedDiscountID"
      @transaction-created="transactionCreated"
    />
  </div>
</template>
<script>
// import Vue from 'vue'

import DiscountManagent from './order_list_components/DiscountManagement.vue'
import OrderedItemDetail from './order_list_components/OrderedItemDetail.vue'
import Checkout from './order_list_components/Checkout.vue'
import ParkTransaction from './order_list_components/ParkTransaction'
import Cart from './cart-store'
export default {
  components: {
    DiscountManagent,
    OrderedItemDetail,
    Checkout,
    ParkTransaction
  },
  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.draw)

      this.draw()
      Cart.commit('restoreCached')
      this.$nextTick(() => {
        setTimeout(() => {
          this.addItemContainerEffect()
        }, 100)
      })
    })
  },
  data () {
    return {
      // totalAmount: 0,
      discountedItemList: null,
      totalVatExempt: 0,
      appliedDiscountID: null,
      containerHeight: '0px',
      changeQuantityClicked: false
    }
  },
  methods: {
    _initialize(){
      this.$refs.discountManagement._initialize()
    },
    saveOrderedItem (index) {
    },
    deletedOrderedItem (index) {
    },
    openOrder (index) {
      if (this.changeQuantityClicked) {
        this.changeQuantityClicked = false
        return false
      }
      // TODO no need to pass the details
      this.$refs.orderedItemDetail._open(index)
    },
    changeQuantity () {
      this.changeQuantityClicked = true
    },
    discountUpdated () {
    },
    checkout () {
      this.$refs.checkout._open()
    },
    openApplyDiscount(){
      this.$refs.discountManagement._open()
    },
    draw () {
      let totalHeight = $(window).height()
      let offset = 5
      // totalheight - the space from the windows top until container top - the height of the footer
      this.containerHeight = (totalHeight - $(this.$refs.container).position().top - $(this.$refs.footer).height() * 2 - offset) + 'px'
    },
    transactionCreated(){
      this.$refs.discountManagement._reset()
    },
    parkTransaction(){
      this.$refs.parkTransaction._open()
    },
    addItemContainerEffect(index = null){
      if(index !== null){
        (this.$refs.itemContainer[index]).classList.remove('itemContainerEffect')
        setTimeout(() => {
          (this.$refs.itemContainer[index]).classList.add('itemContainerEffect')
        }, 100)
      }else{
        if(this.orderList.length){
          for(let x = 0; x < this.orderList.length; x++){
            this.addItemContainerEffect(x)
          }
        }
      }
    }
  },
  computed: {
    totalAmount: () => {
      return Cart.state.totalAmount
    },
    totalVatExemptSales: () => {
      return Cart.state.totalVatExemptSales
    },
    totalVatSales: () => {
      return Cart.state.totalVatSales
    },
    totalVatAmount: () => {
      return Cart.state.totalVatAmount
    },
    totalDiscount: () => {
      return Cart.state.totalDiscountAmount
    },
    subTotalAmount: () => {
      return Cart.state.subTotalAmount
    },
    orderList: () => {
      return Cart.state.items
    },
    cartEvent: () => {
      return Cart.state.event
    }
  },
  watch: {
    cartEvent(newData){
      if(newData['description'] === 'item_added'){
        setTimeout(() => {
          this.$refs.container.scrollTop = this.$refs.container.scrollHeight
          this.addItemContainerEffect(this.orderList.length - 1)
        }, 100)
      }else if(newData['description'] === 'added_existing_item'){
        setTimeout(() => {
          let index = newData['details']['item_index'];
          (this.$refs.itemContainer[index]).scrollIntoView()
          this.addItemContainerEffect(index)
        }, 100)
      }else if(newData['description'] === 'cache_restored'){
        (this.$refs.itemContainer).classList.add('itemContainerEffect')
      }
    }
  },
  destroyed() {
    window.removeEventListener('resize', this.draw)
  }
}
</script>
<style lang="scss" scoped>

@import "@/assets/style/custom-theme";

.orderListContainer{
  min-height: 185px; overflow-y: scroll
}
/* width */
.orderListContainer::-webkit-scrollbar {
  width: 5px;
  background: #550055;
}

/* Track */
.orderListContainer::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
.orderListContainer::-webkit-scrollbar-thumb {
  background: gray;
}

/* Handle on hover */
.orderListContainer::-webkit-scrollbar-thumb:hover {
  background: #550055;
}
.itemContainer {
  background: #550055;
  color: white
}
.itemContainerEffect {
  background: transparent;
  color: $text-color;
  /* -webkit-transition-property: background;
  -webkit-transition-duration: 0s, 1s;
  -webkit-transition-timing-function: linear, ease-in; */
  transition-property: background, color;
  transition-duration: 0.3s;
  transition-timing-function: linear;
}
</style>
