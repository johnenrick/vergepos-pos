<template>
  <div class="section p-3">
    <div v-if="isCategoryAvailable === true">
      <div v-if="isTerminal" class="text-center alert border-warning">
        <span class="  text-warning">
          <fa icon="exclamation-triangle"/> Changes on the data only applies to <strong>Terminal</strong> after refreshing it <a class="c-pointer" onclick="window.location.reload(true)"><fa icon="undo" /></a>
        </span>
      </div>
    </div>
      <basic-module v-if="isOffline === false && isOffline !== null && isCategoryAvailable === true" :config="config" />
      <div v-else-if="(isOffline === false || isOffline === true) && isOffline !== null && isCategoryAvailable === false">
        <h2 class="mb-4">Product List</h2>
        <div class="text-center alert border-warning m-4">
          <span>
            <fa icon="exclamation-triangle" class="text-warning"/> You need to create a Product Category first before you can create a <strong> Product</strong>. You can do this by clicking <fa icon="boxes" /><strong> Category</strong> in the side menu.
          </span>
        </div>
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
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule,
    ProductListOffline
  },
  mounted () {
    UserStore.getters.sessionConnection === 'online' ? this.isOffline = false : this.isOffline = true
    this.isTerminal = localStorage.getItem('is_terminal')
    this.checkForCategories()
  },
  data () {
    let tableSettingRetrieveParameter = {
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
          config: {
            api_link: 'category/retrieve',
            api_option_text: 'description'
          }
        },
        description: {},
        barcode: {},
        cost: {
          help_text: 'The cost of each product when purchased'
        },
        price: {
          placeholder: 'Selling Price'
        }
      }
    }
    let formRetrieveParameter = {
    }
    return {
      isTerminal: false,
      isOffline: null,
      isCategoryAvailable: Boolean,
      config: {
        // module_name: 'Variable Management',
        api: 'product',
        has_create_more: true,
        table_setting: {
          retrieve_parameter: tableSettingRetrieveParameter,
          table_column_setting: tableColumnSetting
        },
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
    }
  }
}

export default { ...ModuleDefault }
</script>
