<template>
  <div class="border no_selection">
    <div class="row mb-2 border-bottom py-2 mx-0 no-gutters">
      <div class="col-4 pl-2">
        <button
          v-if="categoryFilterID"
          @click="categoryFilterID = null"
          class="btn btn-primary w-100 font-weight-bold"
        >
          {{ categoryFilterDescription }} <fa
            class="float-right mt-1"
            :icon="'times'"
          />
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
      </select> -->
      </div>
      <div class="col-8 px-2">
        <div class="input-group">
          <input
            v-model="searchFilterValue"
            placeholder="Search Product"
            class="form-control"
          >
          <div
            v-if="searchFilterValue"
            class="input-group-append"
          >
            <button
              @click="searchFilterValue = ''"
              class="btn btn-sm btn-outline-danger float-right"
            >
              <fa :icon="'times'" /> clear
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-2 mx-0">
      <div class="col-12">
        <a
          href="#"
          @click="listItems(); $event.preventDefault()"
          class="col-form-label border-bottom font-weight-bold"
        >ALL &nbsp;</a> >
      </div>
    </div>
    <div
      ref="container"
      id="container"
      :style="{'max-height': containerHeight}"
      style="min-height:300px; overflow-y:scroll"
      class="pb-2"
    >
      <div class="row align-items-center mx-0 px-2">
        <div
          v-for="category in categoryList"
          class="col-4 px-1 py-1 itemContainer"
          v-show="typeof category['show'] === 'undefined' || category['show']"
        >
          <div
            @click="setCategoryFilter(category['db_id'], category['description'])"
            class="font-weight-bold text-uppercase border text-primary border-primary py-2 text-center px-1 item"
            style="max-height:66px; overflow-y:hidden"
          >
            <span class="no_selection"> {{ category['description'] }}</span>
          </div>
        </div>
        <div
          v-for="product in productList"
          class="col-4 px-1 py-1 itemContainer"
          v-show="typeof product['show'] === 'undefined' || product['show']"productList
        >
          <div
            @click="$emit('add-product', product['db_id'])"
            class="border  border-primary text-primary py-2 text-center px-1 item"
            style="max-height:66px; overflow-y:hidden"
          >
            <span class="no_selection"> {{ product['description'] }}</span>
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
// import SyncStore from '@/database/sync/sync-store'
export default {
  components: {
  },
  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
  },
  data () {
    return {
      defaultItemToShow: 'all',
      containerHeight: '0px',
      searchFilterValue: '',
      categoryFilterID: null,
      categoryFilterDescription: null,
      searchTimeoutID: null,
      categoryList: {
      },
      productList: {
      }
    }
  },
  methods: {
    _initialize(){
      this.listItems()
    },
    draw () {
      let totalHeight = $(window).height()
      let offset = 35 + 60
      // totalheight - the space from the windows top until container top - the height of the footer
      this.containerHeight = (totalHeight - $(this.$refs.container).position().top - offset) + 'px'
    },
    setCategoryFilter (id, description) {
      this.categoryFilterID = id
      this.categoryFilterDescription = description
    },
    listItems () {
      this.categoryFilterID = null
      if (this.defaultItemToShow === 'all') {
        (new Category()).getAll().then((response) => {
          this.categoryList = response || []
        });
        (new Product()).getAll().then((response) => {
          this.productList = response || []
        })
      } else {
        (new Category()).getAll().then((response) => {
          this.categoryList = response || []
        })
      }
    },
    filterItemList () {
      for (let x in this.categoryList) {
        let haystack = (this.categoryList[x]['description']).toLowerCase()
        if (haystack.indexOf((this.searchFilterValue).toLowerCase()) >= 0) {
          Vue.set(this.categoryList[x], 'show', true)
        } else {
          Vue.set(this.categoryList[x], 'show', false)
        }
      }
      for (let x in this.productList) {
        if (this.categoryFilterID === null || this.categoryFilterID === this.productList[x]['category_id'] * 1) {
          let haystackDesc = (this.productList[x]['description']).toLowerCase()
          let code = (this.productList[x]['barcode']) || ''
          code = code.replace(/ /g, '')
          code = code.replace(/-/g, '')
          let haystackCode = code
          if (haystackCode.indexOf(this.searchFilterValue) >= 0 || haystackDesc.indexOf((this.searchFilterValue).toLowerCase()) >= 0) {
            Vue.set(this.productList[x], 'show', true)
          } else {
            Vue.set(this.productList[x], 'show', false)
          }
        } else {
          Vue.set(this.productList[x], 'show', false)
        }
      }
    }
  },
  watch: {
    searchFilterValue (newData) {
      clearTimeout(this.searchTimeoutID)
      this.searchTimeoutID = setTimeout(() => {
        this.filterItemList()
      }, 600)
    },
    categoryFilterID (newData) {
      console.log(newData)
      if (newData === null) {
        this.categoryFilterDescription = null
      }
      this.filterItemList()
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
.itemContainer:hover{
  cursor: pointer
}
.itemContainer{
  display: table
}
.itemContainer .item{
  display: table-cell;
  height: 64px;
  vertical-align: middle
}
.no_selection {
    -webkit-user-select: none; /* webkit (safari, chrome) browsers */
    -moz-user-select: none; /* mozilla browsers */
    -khtml-user-select: none; /* webkit (konqueror) browsers */
    -ms-user-select: none; /* IE10+ */
}

</style>
