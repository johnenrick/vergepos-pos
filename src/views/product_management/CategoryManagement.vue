<template>
  <div class="section">
    <basic-module :config="config" />
  </div>
</template>

<script>
import BasicModule from '@/components/basic-module/BasicModule'
import store from '@/store.js'
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
      description: {}
      // 'category.description': {
      //   name: 'Parent'
      // }
    }
    let formFieldSetting = {
      fields: {
        description: {
        }
        // category_id: {
        //   name: 'Parent',
        //   type: 'select'
        // }
      }
    }
    let formRetrieveParameter = {
    }
    return {
      config: {
        // module_name: 'Variable Management',
        api: 'category',
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
