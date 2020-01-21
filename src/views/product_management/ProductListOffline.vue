<template>
  <div>
    View Product in Offline Mode
    <Vuetable :fields="tableSetting.columns"
    :api-mode="false"
    :data="productList"
    >
      <template slot="actions" slot-scope="props">
        <button @click="openProduct(props.rowIndex)" class="btn btn-sm btn-info"><fa icon="search" /></button>
      </template>
    </Vuetable>
    <modal ref="modal" size="sm" title="Product Details">
      <template v-slot:body>
        <div v-if="activeProductIndex !== null">
          <div class="form-group">
            <div class="form-group row">
              <div class="col-5 col-form-label">
                Description:
              </div>
              <div class="col-7">
                <span class="form-control-plaintext">
                  {{productList[activeProductIndex]['description']}} <small v-if="productList[activeProductIndex]['short_description'] !== '0' && productList[activeProductIndex]['short_description'] !== null">({{productList[activeProductIndex]['short_description']}})</small>
                </span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-5 col-form-label">
                Category:
              </div>
              <div class="col-7">
                <span class="form-control-plaintext">
                  {{productList[activeProductIndex]['category_name']}}
                </span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-5 col-form-label">
              <label>Cost:</label>
              </div>
              <div class="col-7" align="right">
                <span class="form-control-plaintext">
                  {{productList[activeProductIndex]['cost'] | numberToMoney}}
                </span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-5 col-form-label">
                <label>Price:</label>
              </div>
              <div class="col-7" align="right">
                <span class="form-control-plaintext">
                  {{productList[activeProductIndex]['price'] | numberToMoney}}
                </span>
              </div>
            </div>
            <div class="form-group row">
              <div class="col-5 col-form-label">
              <label>Barcode:</label>
              </div>
              <div class="col-7">
                <span class="form-control-plaintext">
                  {{productList[activeProductIndex]['barcode']}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
import Product from '@/database/controller/product.js'
import Category from '@/database/controller/category.js'
import Vuetable from 'vuetable-2/src/components/Vuetable'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import QuickHelper from '@/vue-web-core/helper/mixin/quick.js'
export default {
  components: {
    Vuetable,
    Modal
  },
  mounted(){
    this._initialize()
  },
  data(){
    return {
      activeProductIndex: null,
      productList: {
      },
      categoryList: {
      },
      tableSetting: {
        columns: [{
          name: 'description',
          title: 'Description'
        }, {
          name: 'category_name',
          title: 'Category'
        }, {
          name: 'price',
          title: 'Price',
          callback: (value) => {
            return QuickHelper.numberToMoney(value)
          }
        }, {
          name: '__slot:actions',
          title: 'Buttons'
        }]
      }
    }
  },
  methods: {
    _initialize () {
      this.listItems()
    },
    listItems () {
      let listDirectory = {};
      (new Category()).getAll().then((response) => {
        this.categoryList = response || []
        for(let x in this.categoryList){
          listDirectory[this.categoryList[x]['db_id']] = (x, this.categoryList[x]['description'])
        };
        (new Product()).getAll().then((response) => {
          this.productList = response || []
          for(let productListIndex in this.productList){
            let catId = this.productList[productListIndex].category_id
            if(typeof listDirectory[catId] !== 'undefined'){
              this.productList[productListIndex]['category_name'] = listDirectory[catId]
            }
          }
        })
      })
    },
    openProduct(index){
      this.activeProductIndex = index
      this.$refs.modal._open()
    }
  }
}
</script>

<style>

</style>
