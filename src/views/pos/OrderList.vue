<template>
  <div class="border shadow1 bg-white" >
    <div
      ref="header"
      class="row font-weight-bold text-center mx-0 pb-1"
    >
      <div class="col-5 col-md-6 bg-primary text-white py-2">
        Description
      </div>
      <div class="col-3 col-md-2 bg-primary text-white py-2">
        Qty
      </div>
      <div class="col-4 bg-primary text-white py-2">
        Price
      </div>
    </div>
    <div
      ref="container"
      class="orderListContainer slim-scrollbar"
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
      class="py-1 border-top"
    >
      <div class="row mx-0  align-items-center">
        <div class="col-6 col-md-8 pr-0">
          <!-- <span class="badge badge-secondary mr-1">Has Parked Txn</span> -->
        </div>
        <div class="col-6 col-md-4 text-right font-weight-bold pr-3">
          <big>{{ totalAmount | numberToMoney }}</big>
        </div>
      </div>
      <div class="row no-gutters mx-0 px-1 align-items-center">
        <div class="col-7 mb-2">
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
              <!-- <a @click="openCustomerDetail" class="dropdown-item" href="javascript:void(0)"><fa icon="user" /> Customer</a> -->
              <a @click="openApplyDiscount" class="dropdown-item" href="javascript:void(0)" ><fa icon="percent" /> Apply Discounts</a>
              <!-- <a
                @click="parkTransaction"
                class="dropdown-item"
                href="javascript:void(0)"
              ><fa icon="parking" />  Park Transaction</a> -->
            </div>
          </div>
        </div>
        <div v-show="totalDiscount" class="col-5 mb-2 text-right pr-3" style="line-height: 15px;">
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
              <td class="px-2"><small class="text-danger">Disc.</small></td>
              <td><small class="text-danger">({{totalDiscount | numberToMoney}})</small></td>
            </tr>
          </table>

        </div>
        <!-- <div class="col-1" /> -->
        <div class="col-12">
          <button
            @click="viewProductList"
            class="btn btn-outline-success float-right w-100 mb-2 d-md-none"
          >
            <fa icon="cart-plus" /> Product List
          </button>
          <button
            @click="checkout"
            class="btn btn-success float-right w-100 d-md-none"
          >
            CHECKOUT
          </button>
          <button
            @click="checkout"
            class="btn btn-success btn-lg float-right w-100 py-2 d-none d-md-block"
          >
            CHECKOUT
          </button>
        </div>
      </div>
    </div>
    <customer-detail ref="customerDetail"></customer-detail>
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
import CustomerDetail from './order_list_components/CustomerDetail.vue'
import ParkTransaction from './order_list_components/ParkTransaction'
import Cart from './cart-store'
export default {
  components: {
    DiscountManagent,
    OrderedItemDetail,
    Checkout,
    ParkTransaction,
    CustomerDetail
  },
  mounted () {
    this.$nextTick(() => {
      this._draw()
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
      this._draw()
      this.$refs.discountManagement._initialize()
    },
    viewProductList(){
      this.$emit('view-product-list')
    },
    saveOrderedItem (index) {
    },
    deletedOrderedItem (index) {
    },
    openCustomerDetail(){
      this.$refs.customerDetail._open()
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
    _draw () {
      // let totalHeight = $(window).height()
      // let offset = 5
      // totalheight - the space from the windows top until container top - the height of the footer
      // this.containerHeight = (totalHeight - $(this.$refs.container).position().top - $(this.$refs.footer).height() * 2 - offset) + 'px'
    },
    transactionCreated(){
      this.$refs.discountManagement._reset()
    },
    parkTransaction(){
      this.$refs.parkTransaction._open()
    },
    addItemContainerEffect(index = null){
      if(index !== null){
        if(typeof this.$refs.itemContainer !== 'undefined' && typeof this.$refs.itemContainer[index] !== 'undefined'){
          this.$refs.itemContainer[index].classList.remove('itemContainerEffect')
          setTimeout(() => {
            if(typeof this.$refs.itemContainer !== 'undefined' && typeof this.$refs.itemContainer[index] !== 'undefined'){
              this.$refs.itemContainer[index].classList.add('itemContainerEffect')
            }
          }, 100)
        }else{
          setTimeout(() => {
            this.addItemContainerEffect(index)
          }, 150)
        }
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
          if(this.orderList.length){
            this.addItemContainerEffect(this.orderList.length - 1)
          }
        }, 100)
      }else if(newData['description'] === 'added_existing_item'){
        setTimeout(() => {
          let index = newData['details']['item_index']
          if(typeof this.$refs.itemContainer !== 'undefined' && typeof this.$refs.itemContainer[index] !== 'undefined'){
            (this.$refs.itemContainer[index]).scrollIntoView()
          }
          this.addItemContainerEffect(index)
        }, 200)
      }else if(newData['description'] === 'cache_restored'){
        (this.$refs.itemContainer).classList.add('itemContainerEffect')
      }
    }
  },
  destroyed() {
    window.removeEventListener('resize', this._draw)
  }
}
</script>
<style lang="scss" scoped>

@import "@/assets/style/custom-theme";

.orderListContainer{
  min-height: 185px; overflow-y: scroll
}
.itemContainer {
  background: $primary;
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
.orderListContainer {
  overflow-y:scroll;
  height: calc(100vh - 66px - 16px - 41px - 131px); // header + 1, page-content-wrapper y padding, table header, options
}
@media(max-width:768px) {
  .orderListContainer {
    height: calc(100vh - 66px - 16px - 41px - 170px);
  }
}
</style>
