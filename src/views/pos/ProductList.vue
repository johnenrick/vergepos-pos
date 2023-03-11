<template>
  <div class="">
    <div class="border no_selection">
      <div class="row mb-2 border-bottom py-1 mx-0 no-gutters">
        <div class="col-4 pl-2">
          <button
            v-if="categoryFilterID"
            @click="categoryFilterID = null"
            class="btn btn-primary w-100 font-weight-bold"
          >
            {{ categoryFilterDescription }}
            <fa class="float-right mt-1" :icon="'times'"/>
          </button>
          <input
            v-else
            type="text"
            readonly
            class="form-control-plaintext text-center font-weight-bold"
            value="Search"
          >
          <!-- <select v-else v-model="defaultItemToShow" class="form-control">
        <option default value="all">All</option>
        <option value="category">Category</option>
        <option value="recent">Recent</option>
          </select>-->
        </div>
        <div class="col-8 px-2">
          <div class="input-group">
            <input ref="searchInput" v-model="searchFilterValue" placeholder="Search Product" class="form-control">
            <div v-if="searchFilterValue" class="input-group-append">
              <button
                @click="searchFilterValue = ''"
                class="btn btn-sm btn-outline-danger float-right"
              >
                <fa :icon="'times'"/> clear
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="row mb-2 mx-0" v-show="productList.length">
        <div class="col-12">
          <a
            href="#"
            @click="listItems(); $event.preventDefault()"
            class="col-form-label border-bottom font-weight-bold"
          >ALL &nbsp;</a> >
        </div>
      </div>
      <div v-show="!productList.length && !isLoading" class="border border-warning p-2 text-center m-4">
        <span v-if="isOnline">
          <fa icon="exclamation-triangle" class="text-warning"/> There are currently no Products created. Go to <fa icon="list" /> <strong> Manage</strong> > <fa icon="box"/> <strong> Product</strong> to create products.
        </span>
        <span v-else>
          <fa icon="exclamation-triangle" class="text-warning"/> There are currently no Products saved. Try connecting to the internet, and re-login without using <em>Offline Mode</em>.
        </span>
      </div>
      <div ref="container" class="productList slim-scrollbar">
        <div v-if="isLoading" class="text-center pt-5">
          <Loading :loadingSMS="loadingSMS" type="card" />
        </div>
        <div v-else>
          <div class="row align-items-center mx-0 px-1">
            <template v-for="(category) in categoryList">
              <ItemContainer
                v-show="typeof category['show'] === 'undefined' || category['show']"
                @select="setCategoryFilter(category['db_id'], category['description'])"
                :description="category['description']"
                :is-category="true"
              />
            </template>
          </div>
          <div class="row align-items-center mx-0 px-1">
            <template v-for="(product, index) in productList">
              <ItemContainer
                v-show="typeof product['show'] === 'undefined' || product['show']"
                @select="addProduct(product['db_id'], index)"
                :description="product['description']"
                :price="product['price']"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- <button @click="listItems">TEst</button> -->
  </div>
</template>
<script>
import Vue from 'vue'
import Product from '@/database/controller/product.js'
import Category from '@/database/controller/category.js'
import Cart from './cart-store'
import UserStore from '@/vue-web-core/system/store'
import ItemContainer from './product-list-components/ItemContainer'
// import UserStore from '@/vue-web-core/system/store'
// import SyncStore from '@/database/sync/sync-store'
export default {
  components: {
    ItemContainer
  },
  data() {
    return {
      loadingSMS: 'Loading products...',
      defaultItemToShow: 'all',
      containerHeight: '0px',
      searchFilterValue: '',
      categoryFilterID: null,
      categoryFilterDescription: null,
      searchTimeoutID: null,
      categoryList: [],
      productList: [],
      productIdLookUp: {}, // db_id
      productBarcodeLookUp: {},
      productInventory: {},
      isAdding: false,
      pendingAddProduct: [],
      isLoading: false
    }
  },
  methods: {
    _initialize() {
      this._draw()
      this.listItems()
    },
    _draw() {
      // let totalHeight = $(window).height()
      // let offset = 35 + 150
      // // totalheight - the space from the windows top until container top - the height of the footer
      // this.containerHeight = (totalHeight - $(this.$refs.container).position().top - offset) + 'px'
    },
    _barcodeScanned(barcode){
      if(typeof this.productBarcodeLookUp[barcode] !== 'undefined' && document.activeElement !== this.$refs.searchInput){
        const productListIndex = this.productBarcodeLookUp[barcode]
        this.addProduct(this.productList[productListIndex]['db_id'])
      }
      this.$refs.searchInput.blur()
    },
    setCategoryFilter(id, description) {
      this.categoryFilterID = id
      this.categoryFilterDescription = description
    },
    listItems() {
      this.isLoading = true
      this.categoryFilterID = null
      if (this.defaultItemToShow === 'all') {
        new Category().get({ order: { by: 'description', type: 'asc' } }).then(response => {
          this.categoryList = response || []
          this.isLoading = false
        })
        this.retrieveProductList().finally(() => {
          this.isLoading = false
        })
      } else {
        new Category().get({ order: { by: 'description', type: 'asc' } }).then(response => {
          this.categoryList = response || []
          this.isLoading = false
        })
      }
    },
    retrieveProductList(){
      return new Promise((resolve, reject) => {
        const productParam = {
          where: { is_sellable: 1 },
          order: { by: 'description', type: 'asc' }
        }
        new Product().get(productParam).then(response => {
          response.forEach((product, index) => {
            this.productIdLookUp[product['db_id']] = index
            if(product['barcode'] && product['barcode'] !== ''){
              this.productBarcodeLookUp[product['barcode']] = index
            }
          })
          this.productList = response || []
          resolve(true)
        })
      })
    },
    filterItemList() {
      this.isLoading = true
      const lowerCasedSearchFilterValue = this.searchFilterValue.toLowerCase()
      for(let x in this.categoryList){
        let haystack = this.categoryList[x]['description'].toLowerCase()
        const hasPassedCategoryFilter = this.categoryFilterID === null || this.categoryFilterID === this.categoryList[x]['category_id'] * 1
        const hasPassedSearchValueFilter = this.searchFilterValue === '' || haystack.indexOf(lowerCasedSearchFilterValue) >= 0
        Vue.set(this.categoryList[x], 'show', hasPassedCategoryFilter && hasPassedSearchValueFilter)
      }
      for(let x in this.productList){
        let haystackDesc = this.productList[x]['description'].toLowerCase()
        let haystackCode = this.productList[x]['barcode'] || ''
        haystackCode = (haystackCode.replace(/ /g, '')).replace(/-/g, '') + haystackDesc
        const hasPassedCategoryFilter = this.categoryFilterID === null || this.categoryFilterID === this.productList[x]['category_id'] * 1
        const hasPassedSearchValueFilter = this.searchFilterValue === '' || haystackCode.indexOf(lowerCasedSearchFilterValue) >= 0
        Vue.set(this.productList[x], 'show', hasPassedCategoryFilter && hasPassedSearchValueFilter)
      }
      this.isLoading = false
    },
    addProduct(productID) {
      const productListIndex = this.productIdLookUp[productID]
      if(this.isAdding){
        if(productID){
          this.pendingAddProduct.push(productID)
        }
        return false
      }
      this.isAdding = true
      if (productID === null) {
        productID = this.pendingAddProduct.pop()
      }
      let param = {
        product_id: productID,
        product_detail: this.productList[productListIndex],
        callback: () => {
          if (this.pendingAddProduct.length) {
            this.isAdding = false
            this.addProduct(null)
          } else {
            this.isAdding = false
          }
        }
      }
      Cart.commit('addItem', param)
    }
  },
  computed: {
    isOnline(){
      return UserStore.getters.mode === 'online'
    }
  },
  watch: {
    searchFilterValue(newData) {
      clearTimeout(this.searchTimeoutID)
      this.searchTimeoutID = setTimeout(() => {
        this.filterItemList()
      }, 600)
    },
    categoryFilterID(newData) {
      if (newData === null) {
        this.categoryFilterDescription = null
      }
      this.filterItemList()
    }
  },
  destroyed() {
    window.removeEventListener('resize', this._draw)
  }
}
</script>
<style scoped lang="scss">
@import "@/assets/style/custom-theme.scss";

.productList {
  overflow-y: scroll;
}
.overlay {
  z-index: -1;
}
.productList {
  height: calc(
    100vh - 80px - 16px - 54px - 50px - 35px
  ); /**header, page-content-wrapper, tools, search, breadcrumb*/
}
@media (max-width: 768px) {
  .productList {
    height: calc(100vh - 95px - 16px - 46px - 46px - 50px - 34px) !important;
  }
}
</style>
