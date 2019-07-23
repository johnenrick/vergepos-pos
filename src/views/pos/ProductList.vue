<template>
  <div class="border">
    <div class="row mb-2 border-bottom py-2 mx-0 no-gutters">
      <div class="col-4 pl-2">
        <button
          v-if="categoryFilterID"
          @click="categoryFilterID = null"
          class="btn btn-primary w-100"
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
    >
      <div class="row align-items-center mx-0 px-2">
        <div
          v-for="category in categoryList"
          class="col-4 px-1 py-1"
          v-show="typeof category['show'] === 'undefined' || category['show']"
        >
          <div
            @click="setCategoryFilter(category['db_id'], category['description'])"
            class="btn-outline-primary border rounded border-primary py-2 text-center px-1"
            style="max-height:66px; overflow-y:hidden"
          >
            {{ category['description'] }}
          </div>
        </div>
        <div
          v-for="product in productList"
          class="col-4 px-1 py-1 itemContainer"
          v-show="typeof product['show'] === 'undefined' || product['show']"
        >
          <div
            @click="$emit('add-product', product['db_id'])"
            class="btn-outline-dark border rounded border-dark  py-2 text-center px-1 item"
            style="max-height:66px; overflow-y:hidden"
          >
            {{ product['description'] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import Product from '@/database/controller/product.js'
import Category from '@/database/controller/category.js'
export default {
  components: {
  },
  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
    this.listItems()
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
        1: {
          description: 'Pizza'
        },
        2: {
          description: 'Body Care'
        },
        3: {
          description: 'Clothes  oh yeah'
        }
      },
      productList: {
        1: {
          description: 'Del Monte Four Season',
          is_available: true
        },
        2: {
          description: 'Nivea Dry Impact',
          is_available: true
        },
        3: {
          description: 'Grips Hair Clay Gray',
          is_available: true
        },
        4: {
          description: 'HBW 2000R',
          is_available: true
        }
      }
    }
  },
  methods: {
    draw () {
      let totalHeight = $(window).height()
      let offset = 35 + 60
      // totalheight - the space from the windows top until container top - the height of the footer
      this.containerHeight = (totalHeight - $(this.$refs.container).position().top - offset) + 'px'
    },
    setCategoryFilter (id, description) {
      console.log(id)
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
          let haystack = (this.productList[x]['description']).toLowerCase()
          if (haystack.indexOf((this.searchFilterValue).toLowerCase()) >= 0) {
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
.itemContainer{
  display: table
}
.itemContainer .item{
  display: table-cell;
  height: 64px;
  vertical-align: middle
}
</style>
