<template>
  <div class="section">
    <div v-if="isTerminal" class="text-center mt-3 alert border-warning">
      <span class="  text-warning">
        <fa icon="exclamation-triangle"/> Changes on the data only applies to <strong>Terminal</strong> after refreshing it <a class="c-pointer" onclick="window.location.reload(true)"><fa icon="undo" /></a>
      </span>
    </div>
    <basic-module v-if="isOffline === false && isOffline !== null" :config="config" />
    <template v-else-if="isOffline === true && isOffline !== null">
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
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule,
    ProductListOffline
  },
  mounted () {
    this.isTerminal = localStorage.getItem('is_terminal')
    this.checkConnectivity().then((ping) => {
      this.isOffline = false
    }).catch(() => {
      this.isOffline = true
    })
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
      isTerminal: false,
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
