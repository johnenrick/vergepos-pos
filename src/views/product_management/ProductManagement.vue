<template>
  <div class="">
    <div v-if="isCategoryAvailable === true">
    </div>
    <basic-module v-if="isOffline === false && isOffline !== null && isCategoryAvailable === true" :config="config" @form-update="formUpdateListener" @form-delete="formDeleteListener">
      <template slot="customSection1"><FAQ /></template>
    </basic-module>
    <div v-else-if="(isOffline === false || isOffline === true) && isOffline !== null && isCategoryAvailable === false" class="p-3">
      <h2 class="mb-4">Product List</h2>
      <div class="text-center alert alert-warning border-warning m-4">
        <span>
          <fa icon="exclamation-triangle" /> You need to create a Product Category first before you can create a <strong> Product</strong>. Go to <fa icon="boxes" /><strong> Category</strong> in the side menu.
        </span>
      </div>
    </div>
    <div v-else-if="isOffline === true && isOffline !== null && isCategoryAvailable === true" class="p-3">
      <div class="bg-white p-3 border shadow-sm">
        <h2 class="font-weight-bold">Product List<small>(Offline)</small></h2>
        <product-list-offline  />

      </div>
    </div>
    <div v-else class="p-3">
      <h2 class="font-weight-bold">Product Management</h2>
      <p>Checking connectivity. Please wait <fa icon="circle-notch" spin /></p>
    </div>
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import ProductListOffline from './ProductListOffline.vue'
import UserStore from '@/vue-web-core/system/store'
import Category from '@/database/controller/category.js'
import ProductDB from '@/database/controller/product'
import FAQ from './product-management-components/FAQ'
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule,
    ProductListOffline,
    FAQ
  },
  mounted () {
    this.isTerminal = localStorage.getItem('is_terminal')
    this.checkForCategories()
  },
  data () {
    let tableSettingRetrieveParameter = {
      sort: [{
        column: 'description',
        order: 'asc',
      }]
    }
    const tableFilterSetting = {
      form_field_setting: {
        fields: {
          description: {
            clause: 'like',
            label_col_span: 0,
            col: 6,
          },
          category_id: {
            label_col_span: 0,
            col: 6,
            name: 'Category',
            type: 'select',
            is_retained_on_create: true,
            config: {
              api_link: 'category/retrieve',
              api_option_text: 'description',

            }
          },
        }
      }
    }
    let tableColumnSetting = {
      description: {},
      barcode: {},
      'category.description': {
        name: 'Category'
      },
      cost: {
        type: 'number'
      },
      price: {
        type: 'number'
      }
    }
    let formFieldSetting = {
      fields: {
        category_id: {
          name: 'Category',
          type: 'select',
          is_retained_on_create: true,
          config: {
            api_link: 'category/retrieve',
            api_option_text: 'description',
            api_parameter: {
              sort: [{
                column: 'description',
                order: 'asc'
              }]
            }
          }
        },
        description: {
          help_text: 'Name of the product. Example: Palmolive 5ml, Large Onion, Egg',
          placeholder: 'Product Description or Product Name'
        },
        barcode: {
          help_text: 'This is optional'
        },
        cost: {
          type: 'number',
          help_text: 'How much you spent to buy each item. Also known as Cost of Goods.'
        },
        price: {
          type: 'number',
          placeholder: 'Selling Price',
          config: {
            min: 0
          },
          help_text: 'How much will you sell it to your customer. Do not forget to include the tax! You can also just leave it blank if the product is not sellable'
        },
        is_sellable: {
          type: 'select',
          help_text: 'Selecting Yes would make this product appear in the POS. Select No if this item is a raw materials only or is not for sale',
          default_value: '1',
          config: {
            options: [{
              value: '1',
              text: 'Yes',
            }, {
              value: '0',
              text: 'No',
            }]
          }
        },
        has_inventory: {
          name: 'Is Inventoriable',
          type: 'select',
          default_value: 1,
          help_text: 'Selecting Yes would allow you to manage the inventory of this product, and makes it appear in the Invetory Page',
          config: {
            options: [{
              value: '1',
              text: 'Yes',
            }, {
              value: '0',
              text: 'No',
            }]
          }
        },
      }
    }
    let formRetrieveParameter = {
    }
    return {
      isTerminal: false,
      isCategoryAvailable: Boolean,
      config: {
        // module_name: 'Variable Management',
        api: 'product',
        has_create_more: true,
        table_setting: {
          filter_setting: tableFilterSetting,
          retrieve_parameter: tableSettingRetrieveParameter,
          table_column_setting: tableColumnSetting
        },
        description: 'Product refers to the items you are selling. You have to encode your products here first before you can start selling in the POS page.',
        form_setting: {
          retrieve_parameter: formRetrieveParameter,
          form_field_setting: formFieldSetting
        }

      }
    }
  },
  methods: {
    checkForCategories(){
      if(!this.isOffline){
        let param = {
          company_id: UserStore.getters.companyInformation.id,
          select: {
            0: 'description'
          }
        }
        this.apiRequest('category/retrieve', param, (response) => {
          if(response.data.length > 0){
            this.isCategoryAvailable = true
          } else{
            this.isCategoryAvailable = false
          }
        })
      } else if(this.isOffline){
        (new Category()).getAll().then((response) => {
          if(response.length > 0){
            this.isCategoryAvailable = true
          } else {
            this.isCategoryAvailable = false
          }
        })
      }
    },
    formUpdateListener(data){
      if(localStorage.getItem('is_terminal')){
        let productDB = new ProductDB()
        productDB.get({ db_id: data['id'] }).then((productData) => {
          data['db_id'] = data['id']
          data['company_id'] = data['company_id'] * 1
          data['category_id'] = data['category_id'] * 1
          data['cost'] = data['cost'] * 1
          console.log('data', data)
          data['price'] = isNaN(data['price'] * 1) ? 0 : data['price'] * 1
          data['is_sellable'] = data['is_sellable'] * 1
          data['has_inventory'] = data['has_inventory'] * 1
          console.log(data)
          delete data['id']
          if(productData){
            productDB.update(data)
          }else{
            productDB.add(data)
          }
        })
      }
    },
    formDeleteListener(id){
      if(localStorage.getItem('is_terminal')){
        let productDB = new ProductDB()
        productDB.delete({ where: { db_id: id } }).then((result) => {
          console.log(result)
        })
      }
    }
  },
  computed: {
    isOffline(){
      return UserStore.getters.mode === 'offline'
    }
  }
}

export default { ...ModuleDefault }
</script>
