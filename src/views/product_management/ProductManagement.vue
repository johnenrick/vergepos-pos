<template>
  <div class="section p-3">
    <div v-if="isCategoryAvailable === true">
    </div>
    <basic-module v-if="isOffline === false && isOffline !== null && isCategoryAvailable === true" :config="config" @form-update="formUpdateListener" @form-delete="formDeleteListener">
      <template slot="customSection1"><FAQ /></template>
    </basic-module>
    <div v-else-if="(isOffline === false || isOffline === true) && isOffline !== null && isCategoryAvailable === false">
      <h2 class="mb-4">Product List</h2>
      <div class="text-center alert border-warning m-4">
        <span>
          <fa icon="exclamation-triangle" class="text-warning"/> You need to create a Product Category first before you can create a <strong> Product</strong>. You can do this by clicking <fa icon="boxes" /><strong> Category</strong> in the side menu.
        </span>
      </div>
      <FAQ />
    </div>
    <template v-else-if="isOffline === true && isOffline !== null && isCategoryAvailable === true">
      <h2>Product List<small>(Offline)</small></h2>
      <product-list-offline  />
    </template>
    <template v-else>
      <h2>Product Management</h2>
      <p><fa icon="hourglass-half" /> Checking connectivity. Please wait...</p>
    </template>
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
              api_option_text: 'description'
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
            api_option_text: 'description'
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
          help_text: 'How much you spent to buy each item. Also known as Cost of Goods.'
        },
        price: {
          placeholder: 'Selling Price',
          help_text: 'How much will you sell it to your customer. Do not forget to include the tax!'
        }
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
          data['price'] = data['price'] * 1
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
