import Vuex from 'vuex'
import Vue from 'vue'
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
    cacheCart(state)
  }
}
const cacheCart = (state) => {
  localStorage.setItem('cart-cache', JSON.stringify(state))
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
    discountRemarks: ''
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
    },
    discountRemarks: (state) => {
      return state.discountRemarks
    }
  },
  mutations: {
    restoreCached(state){
      let cachedCartString = localStorage.getItem('cart-cache')
      if(cachedCartString){
        let cachedCart = JSON.parse(cachedCartString)
        for(let item in state){
          if(typeof state[item] === 'object' && state[item] !== null){
            for(let ccitem in cachedCart[item]){
              Vue.set(state[item], ccitem, cachedCart[item][ccitem])
            }
          }else{
            Vue.set(state, item, cachedCart[item])
          }
        }
      }
    },
    calculateTotal(state){
      calculateCartTotal(state)
    },
    applyDiscount(state, [index, discountId, discountQuantity, discountAmount, vatExemptQuantity, vatExemptSales]){
      Vue.set(state.items[index], 'discount_id', discountId)
      Vue.set(state.items[index], 'discount_amount', discountAmount)
      Vue.set(state.items[index], 'discount_quantity', discountQuantity)
      Vue.set(state.items[index], 'vat_exempt_quatity', vatExemptQuantity)
      Vue.set(state.items[index], 'vat_exempt_sales', vatExemptSales)
      cacheCart(state)
    },
    changeQuantity(state, [itemIndex, quantity]){
      if(!isNaN(quantity * 1)){
        Vue.set(state.items[itemIndex], 'quantity', quantity)
        calculateCartTotal(state)
      }else{
        console.error('Cart Commit Change Quantity: wrong quantity variable type', quantity)
      }
      cacheCart(state)
    },
    deleteItem(state, itemIndex){
      Vue.delete(state.itemLookUp, state.items[itemIndex]['id'])
      Vue.delete(state.items, itemIndex)
      for(let x = 0; x < state.items.length; x++){
        Vue.set(state.itemLookUp, state.items[x]['id'], x)
      }
      cacheCart(state)
      calculateCartTotal(state)
    },
    setLatestTransactionNUmber(state, transactionNumber){
      Vue.set(state, 'latestTransactionNumber', transactionNumber)
      cacheCart(state)
    },
    setDiscountId(state, discountId){
      Vue.set(state, 'discountId', discountId)
      cacheCart(state)
    },
    setDiscountRemarks(state, discountRemarks){
      Vue.set(state, 'discountRemarks', discountRemarks)
      cacheCart(state)
    },
    addItem(state, productID){
      let callback = null
      let productDetail = null
      if(typeof productID === 'object'){
        if(typeof productID['callback'] !== 'undefined'){
          callback = productID['callback']
        }
        if(typeof productID['product_detail'] !== 'undefined'){
          productDetail = productID['product_detail']
        }
        productID = productID['product_id']
      }
      if (typeof state.itemLookUp[productID] !== 'undefined') {
        Vue.set(state.items[state.itemLookUp[productID]], 'quantity', state.items[state.itemLookUp[productID]]['quantity'] * 1 + 1)
        calculateCartTotal(state)
        if(typeof callback === 'function') callback()
      } else { // add new product
        state.items.push({
          id: productDetail.db_id,
          product_id: productDetail.db_id,
          local_id: productDetail.id, // indexedDB ID
          order_item_identifier: productDetail.db_id + '-' + (new Date()).getTime(),
          description: productDetail.description,
          category_id: productDetail.category_id,
          quantity: 1,
          price: productDetail.price,
          cost: productDetail.cost,
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
        if(typeof callback === 'function') callback()
        calculateCartTotal(state)
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
      state.discountRemarks = ''
      state.discountId = null
      cacheCart(state)
    }
  },
  acttions: {
    reset({ commit }){
      commit('reset')
    }
  }
})
export default store
