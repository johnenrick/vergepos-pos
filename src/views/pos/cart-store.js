import Vuex from 'vuex'
import Vue from 'vue'
import Product from '@/database/controller/product.js'
import Calculator from '@/vue-web-core/helper/calculator'
const calculateCartTotal = (state) => {
  state.totalVatSales = 0
  state.totalVatAmount = 0
  state.totalVatExemptSales = 0
  state.totalAmount = 0
  state.totalDiscountAmount = 0
  state.subTotalAmount = 0
  for(let x = 0; x < state.items.length; x++){
    let product = state.items[x]
    // VAT
    let noVatPrice = Calculator.numberFormat(product.price / (1 + state.taxPercentage))
    let vatableQuantity = state.items[x]['quantity'] - state.items[x]['vat_exempt_quatity']
    let totalVatSales = Calculator.numberFormat(noVatPrice * vatableQuantity)
    let totalVatAmount = Calculator.numberFormat(Calculator.numberFormat(product.price - noVatPrice) * vatableQuantity)
    // VAT EXEMPT
    let vatExemptQuantity = state.items[x]['vat_exempt_quatity']
    let totalVatExemptSales = Calculator.numberFormat(noVatPrice * vatExemptQuantity)

    Vue.set(state.items[x], 'vat_sales', totalVatSales)
    Vue.set(state.items[x], 'vat_exempt_sales', totalVatExemptSales)
    Vue.set(state.items[x], 'vat_amount', totalVatAmount)
    state.totalVatSales += totalVatSales
    state.totalVatExemptSales += totalVatExemptSales
    state.totalVatAmount += totalVatAmount
    state.totalDiscountAmount += state.items[x]['discount_amount']
    state.totalAmount += (totalVatAmount + totalVatSales + totalVatExemptSales - state.items[x]['discount_amount'])
    state.subTotalAmount += Calculator.numberFormat(product.price * state.items[x]['quantity'])
  }
}

let store = new Vuex.Store({
  state: {
    latestTransactionNumber: null,
    discountId: null,
    items: [],
    itemLookUp: {},
    modifiedItems: {},
    totalAmount: 0,
    subTotalAmount: 0,
    totalVatSales: 0,
    totalVatExemptSales: 0,
    totalVatZeroRatedSales: 0,
    totalVatAmount: 0,
    totalDiscountAmount: 0,
    taxPercentage: 0.12,
  },
  getters: {
    items: (state) => {
      return state.items
    },
    totalVatSales: (state) => {
      return state.totalVatSales
    },
    totalVatAmount: (state) => {
      return state.totalVatAmount
    },
    subTotalAmount: (state) => {
      return state.subTotalAmount
    },
    totalAmount: (state) => {
      return state.totalAmount
    },
    totalDiscountAmount: (state) => {
      return state.totalDiscountAmount
    }
  },
  mutations: {
    calculateTotal(state){
      calculateCartTotal(state)
    },
    applyDiscount(state, [index, discountQuantity, discountAmount, vatExemptQuantity, vatExemptSales]){
      Vue.set(state.items[index], 'discount_amount', discountAmount)
      Vue.set(state.items[index], 'discount_quantity', discountQuantity)
      Vue.set(state.items[index], 'vat_exempt_quatity', vatExemptQuantity)
      Vue.set(state.items[index], 'vat_exempt_sales', vatExemptSales)
      console.log(state.items[index])
    },
    changeQuantity(state, [itemIndex, quantity]){
      if(!isNaN(quantity * 1)){
        Vue.set(state.items[itemIndex], 'quantity', quantity)
        calculateCartTotal(state)
      }else{
        console.error('Cart Commit Change Quantity: wrong quantity variable type', quantity)
      }
    },
    deleteItem(state, itemIndex){
      Vue.delete(state.items, itemIndex)
      calculateCartTotal(state)
    },
    setLatestTransactionNUmber(state, transactionNumber){
      Vue.set(state, 'latestTransactionNumber', transactionNumber)
    },
    setDiscountId(state, discountId){
      Vue.set(state, 'discountId', discountId)
    },
    addItem(state, productID, callback){
      if (typeof state.itemLookUp[productID] !== 'undefined') {
        Vue.set(state.items[state.itemLookUp[productID]], 'quantity', state.items[state.itemLookUp[productID]]['quantity'] * 1 + 1)
        calculateCartTotal(state)
        if(typeof callback === 'function') callback()
      } else {
        (new Product()).get({ id: (productID + '').replace('c', '') * 1 }).then((result) => {
          if (result) {
            state.items.push({
              id: result.db_id,
              local_id: result.id, // indexedDB ID
              order_item_identifier: result.db_id + '-' + (new Date()).getTime(),
              description: result.description,
              category_id: result.category_id,
              quantity: 1,
              price: result.price,
              vat_sales: 0,
              vat_exempt_quatity: 0,
              vat_exempt_sales: 0,
              vat_zero_rated_quantity: 0, // quantity of items that are vat exempted
              vat_zero_rated_sales: 0,
              vat_amount: 0,
              discount_amount: 0,
              discount_id: 0,
              discount_quantity: 0 // the quantity of items to be discounted
            })
            Vue.set(state.itemLookUp, productID, state.items.length - 1)
          }else{
            console.log((productID + '').replace('c', ''))
          }
          calculateCartTotal(state)
          if(typeof callback === 'function') callback()
        })
      }
    },
    reset(state){
      state.items = []
      state.itemLookUp = {}
      state.modifiedItems = {}
      state.totalAmount = 0
      state.subTotalAmount = 0
      state.totalVatSales = 0
      state.totalVatExemptSales = 0
      state.totalVatZeroRatedSales = 0
      state.totalVatAmount = 0
      state.totalDiscountAmount = 0
      state.discountId = null
    }
  },
  acttions: {
    reset({ commit }){
      commit('reset')
    }
  }
})
export default store
