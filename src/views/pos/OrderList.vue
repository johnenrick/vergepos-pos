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
        class="row border-bottom mb-1 pb-1 mx-0"
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
            @blur="orderList[index]['quantity'] == '' ? orderList[index]['quantitsy'] = orderList[index]['old_quantity'] * 1 : null; calculateTotal()"
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
          <span class="badge badge-danger">Discounted</span>
        </div>
        <div class="col-4 text-right font-weight-bold pr-3">
          <big>{{ totalAmount | numberToMoney }}</big>
        </div>
      </div>
      <div class="row no-gutters mx-0 px-1 align-items-center">
        <div class="col-12 mb-2">
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
      :total-discount="totalDiscount"
      :total-vat-exempt="totalVatExempt"
      :applied-discount-id="appliedDiscountID"
      :discounted-item-list="discountedItemList"
      :order-list="orderList"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import Product from '@/database/controller/product.js'

import DiscountManagent from './order_list_components/DiscountManagement.vue'
import OrderedItemDetail from './order_list_components/OrderedItemDetail.vue'
import Checkout from './order_list_components/Checkout.vue'

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
      totalAmount: 0,
      totalDiscount: 0,
      discountedItemList: null,
      totalVatExempt: 0,
      appliedDiscountID: null,
      orderList: [], // list of the orderd items
      orderListLookUp: {}, // find the index in orderList using item id
      containerHeight: '0px',
      changeQuantityClicked: false
    }
  },
  methods: {
    saveOrderedItem (index, orderedItem) {
      Vue.set(this.orderList, index, orderedItem)
    },
    deletedOrderedItem (index) {
      Vue.delete(this.orderList, index)
    },
    openOrder (index) {
      if (this.changeQuantityClicked) {
        this.changeQuantityClicked = false
        return false
      }
      this.$refs.orderedItemDetail._open(index, this.orderList[index])
    },
    changeQuantity () {
      this.changeQuantityClicked = true
    },
    _addProduct (productID) {
      if (typeof this.orderListLookUp[productID] !== 'undefined') {
        Vue.set(this.orderList[this.orderListLookUp[productID]], 'quantity', this.orderList[this.orderListLookUp[productID]]['quantity'] * 1 + 1)
        this.calculateTotal()
      } else {
        (new Product()).getByIndex('db_id', productID).then((result) => {
          if (result) {
            this.orderList.push({
              id: result.db_id,
              order_item_identifier: result.db_id + '-' + (new Date()).getTime(),
              description: result.description,
              category_id: result.category_id,
              quantity: 1,
              price: result.price,
              local_id: result.id
            })
            this.calculateTotal()
          }
        })
      }
    },
    calculateTotal () {
      let total = 0
      for (let x in this.orderList) {
        total += (this.orderList[x]['price'] * this.orderList[x]['quantity'])
      }
      this.totalAmount = total
    },
    discountUpdated (totalDiscount, totalVatExempt, appliedDiscountID, discountedItemList) {
      this.totalDiscount = totalDiscount
      this.totalVatExempt = totalVatExempt
      this.appliedDiscountID = appliedDiscountID
      this.discountedItemList = discountedItemList
    },
    checkout () {
      this.$refs.checkout._open()
    },
    draw () {
      let totalHeight = $(window).height()
      let offset = 35
      // totalheight - the space from the windows top until container top - the height of the footer
      this.containerHeight = (totalHeight - $(this.$refs.container).position().top - $(this.$refs.footer).height() * 2 - offset) + 'px'
    }
  },
  watch: {
    orderList (data) {
      for (let x = 0; x < this.orderList.length; x++) {
        Vue.set(this.orderListLookUp, this.orderList[x]['id'], x)
      }
      this.calculateTotal()
    }
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
