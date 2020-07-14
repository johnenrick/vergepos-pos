<template>
  <div>
    <div class="border no_selection">
      <div class="row mb-2 border-bottom py-2 mx-0 no-gutters">
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
            <input v-model="searchFilterValue" placeholder="Search Product" class="form-control">
            <div v-if="searchFilterValue" class="input-group-append">
              <button
                @click="searchFilterValue = ''"
                class="btn btn-sm btn-outline-danger float-right"
              >
                <fa :icon="'times'"/>clear
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
      <div v-show="!productList.length" class="alert text-center border-warning m-4">
        <span v-if="isOnline === 'online'">
          <fa icon="exclamation-triangle" class="text-warning"/>There are currently no Products created. Go to
          <fa icon="list"/>
          <strong>Manage</strong> >
          <fa icon="box"/>
          <strong>Product</strong> to create products.
        </span>
        <span v-else-if="isOnline === 'offline'">
          <fa icon="exclamation-triangle" class="text-warning"/>There are currently no Products saved. Try connecting to the internet, and re-login without using Offline Mode.
        </span>
      </div>
      <div ref="container" class="productList">
        <div v-if="isLoading" class="text-center pt-5">
          <Loading :loadingSMS="loadingSMS"/>
        </div>
        <div v-else>
          <div class="row align-items-center mx-0 px-2">
            <template v-if="!categoryFilterID">
              <template v-for="(category) in categoryList">
                <div
                  class="col-6 col-sm-6 col-md-4 px-1 py-1 itemContainer"
                  v-show="typeof category['show'] === 'undefined' || category['show']"
                >
                  <div
                    @click="setCategoryFilter(category['db_id'], category['description'])"
                    class="font-weight-bold text-uppercase border text-primary border-primary py-2 text-center px-1 item"
                    style="max-height:66px; overflow-y:hidden"
                  >
                    <span class="no_selection">{{ category['description'] }}</span>
                  </div>
                </div>
              </template>
            </template>
            <template v-for="(product, index) in productList">
              <div
                class="col-6 col-sm-6 col-md-4 px-1 py-1 itemContainer"
                v-show="typeof product['show'] === 'undefined' || product['show']"
              >
                <div
                  @click="addProduct(product['db_id'], index)"
                  class="border border-primary text-primary py-2 text-center px-1 item"
                  style="max-height:66px; overflow-y:hidden"
                >
                  <span class="no_selection">{{ product['description'] }}</span>
                </div>
              </div>
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
import Loading from '@/components/Loading.vue'
// import UserStore from '@/vue-web-core/system/store'
// import SyncStore from '@/database/sync/sync-store'
export default {
  components: { Loading },
  mounted() {},
  data() {
    return {
      loadingSMS: 'Loading products...',
      isOnline: '',
      defaultItemToShow: 'all',
      containerHeight: '0px',
      searchFilterValue: '',
      categoryFilterID: null,
      categoryFilterDescription: null,
      searchTimeoutID: null,
      categoryList: {},
      productList: {},
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
    setCategoryFilter(id, description) {
      this.categoryFilterID = id
      this.categoryFilterDescription = description
    },
    listItems() {
      this.isLoading = true
      this.categoryFilterID = null
      if (this.defaultItemToShow === 'all') {
        new Category().getAll().then(response => {
          this.categoryList = response || []
          this.isLoading = false
        })
        new Product().getAll().then(response => {
          this.productList = response || []
          this.isLoading = false
        })
      } else {
        new Category().getAll().then(response => {
          this.categoryList = response || []
        })
      }
    },
    filterItemList() {
      this.isLoading = true
      for (let x in this.categoryList) {
        let haystack = this.categoryList[x]['description'].toLowerCase()
        if (haystack.indexOf(this.searchFilterValue.toLowerCase()) >= 0) {
          Vue.set(this.categoryList[x], 'show', true)
        } else {
          Vue.set(this.categoryList[x], 'show', false)
        }
      }
      for (let x in this.productList) {
        if (
          this.categoryFilterID === null ||
          this.categoryFilterID === this.productList[x]['category_id'] * 1
        ) {
          let haystackDesc = this.productList[x]['description'].toLowerCase()
          let code = this.productList[x]['barcode'] || ''
          code = code.replace(/ /g, '')
          code = code.replace(/-/g, '')
          let haystackCode = code
          if (
            haystackCode.indexOf(this.searchFilterValue) >= 0 ||
            haystackDesc.indexOf(this.searchFilterValue.toLowerCase()) >= 0
          ) {
            Vue.set(this.productList[x], 'show', true)
          } else {
            Vue.set(this.productList[x], 'show', false)
          }
        } else {
          Vue.set(this.productList[x], 'show', false)
        }
      }
      this.isLoading = false
    },
    addProduct(productID, productListIndex) {
      if (this.isAdding) {
        if (productID) {
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
/* width */
.productList::-webkit-scrollbar {
  width: 5px;
  background: #550055;
}

/* Track */
.productList::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
.productList::-webkit-scrollbar-thumb {
  background: gray;
}

/* Handle on hover */
.productList::-webkit-scrollbar-thumb:hover {
  background: #550055;
}
.itemContainer .border-primary:hover {
  cursor: pointer;
}
.itemContainer {
  display: table;
}
.itemContainer .item {
  display: table-cell;
  height: 64px;
  vertical-align: middle;
}
.no_selection {
  -webkit-user-select: none; /* webkit (safari, chrome) browsers */
  -moz-user-select: none; /* mozilla browsers */
  -khtml-user-select: none; /* webkit (konqueror) browsers */
  -ms-user-select: none; /* IE10+ */
}
.itemContainer .border-primary:active:hover {
  background-color: $primary;
  color: white !important;
}

.overlay {
  z-index: -1;
}
.productList {
  height: calc(
    100vh - 67px - 16px - 54px - 63px - 29px
  ); /**header, page-content-wrapper, tools, search, breadcrumb*/
}
@media (max-width: 768px) {
  .productList {
    height: calc(100vh - 67px - 16px - 46px - 46px - 64px - 34px) !important;
  }
}
</style>
