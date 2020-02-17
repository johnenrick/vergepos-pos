<template>
  <div class="section">
    <basic-module v-if="!isOffline && isOffline !== null" :config="config" />
    <template v-else>
      <h2>Product List<small>(Offline)</small></h2>
      <product-list-offline  />
    </template>
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import ProductListOffline from './ProductListOffline.vue'
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule,
    ProductListOffline
  },
  mounted () {
    console.log('nimal')
    this.checkConnectivity().then((ping) => {
      console.log('yow')
      this.isOffline = false
    }).catch(() => {
      console.log('hey')
      this.isOffline = true
    })
    console.log('yawa')
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
        description: {
        },
        barcode: {
        },
        cost: {
        },
        price: {
        },
        category_id: {
          name: 'Category',
          type: 'select',
          config: {
            api_link: 'category/retrieve',
            api_option_text: 'description'
          }
        }
      }
    }
    let formRetrieveParameter = {
    }
    return {
      isOffline: null,
      config: {
        // module_name: 'Variable Management',
        api: 'product',
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
    checkConnection(){
      this.checkConnectivity().then((ping) => {
        console.log('ping', ping)
        this.isOffline = false
      }).catch((status) => {
        this.isOffline = false
      }).finally(() => {
        if(typeof callback === 'function'){
          callback()
        }
      })
    }
  }
}

export default { ...ModuleDefault }
</script>
