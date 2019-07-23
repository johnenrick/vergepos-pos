<template>
  <div class="section">
    <basic-module :config="config" />
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule
  },
  mounted () {
  },
  data () {
    let tableSettingRetrieveParameter = {
    }
    let tableColumnSetting = {
      description: {},
      'category.description': {
        name: 'Category'
      },
      cost: {},
      price: {}
    }
    let formFieldSetting = {
      fields: {
        description: {
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

  }
}

export default { ...ModuleDefault }
</script>
