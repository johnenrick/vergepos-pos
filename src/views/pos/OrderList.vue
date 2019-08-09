<template>
  <div class="border shadow">
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
      id="container"
      :style="{'max-height': containerHeight}"
    >
      <div
        v-for="(order, index) in orderList"
        @click="openOrder(index)"
        class="row border-bottom mb-0 py-2 mx-0"
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
          <span class="badge badge-secondary mr-1">Has Parked Txn</span>
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
                @click="$refs.discountManagement._open()"
                class="dropdown-item"
              >Discounts</a>
              <a
                class="dropdown-item"
                href="#"
              >Parked Transactions</a>
              <a
                class="dropdown-item"
                href="#"
              >Park Current Transaction</a>
            </div>
          </div>
        </div>
        <div v-show="totalDiscount" class="col-7 mb-2 text-right pr-3" style="line-height: 15px;">
          <table class="float-right">
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
              <td><small class="text-danger">- {{totalDiscount | numberToMoney}}</small></td>
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

import Cart from './cart-store'
export default {
  components: {
    DiscountManagent,
    OrderedItemDetail,
    Checkout
  },
  mounted () {
    this.$nextTick(() => {
      this.draw()
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
    _addProduct (productID) {
      Cart.commit('addItem', productID)
    },
    discountUpdated () {
    },
    checkout () {
      this.$refs.checkout._open()
    },
    draw () {
      let totalHeight = $(window).height()
      let offset = 35
      // totalheight - the space from the windows top until container top - the height of the footer
      this.containerHeight = (totalHeight - $(this.$refs.container).position().top - $(this.$refs.footer).height() * 2 - offset) + 'px'
    },
    transactionCreated(){
      this.$refs.discountManagement._reset()
    }
  },
  computed: {
    itemList: () => {
      return Cart.state.items
    },
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
    }
  },
  watch: {
  }
}
</script>
<style scoped>
#container{
  min-height: 300px; overflow-y: scroll
}
/* width */
#container::-webkit-scrollbar {
  width: 5px;
  background: #550055;
}

/* Track */
#container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
#container::-webkit-scrollbar-thumb {
  background: gray;
}

/* Handle on hover */
#container::-webkit-scrollbar-thumb:hover {
  background: #550055;
}
</style>
