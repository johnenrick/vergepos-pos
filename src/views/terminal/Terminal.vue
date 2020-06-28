<template>
  <div class="section p-3">
    <basic-module :config="config" />
  </div>
</template>
<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
export default {
  components: {
    BasicModule
  },
  data () {
    let tableSettingRetrieveParameter = {
    }
    let tableColumnSetting = {
      description: {},
      // location: {},
      serial_number: {},
      status: {}
    }
    let formFieldSetting = {
      fields: {
        description: {},
        store_id: {
          name: 'Store',
          type: 'select',
          config: {
            api_link: 'store/retrieve',
            api_option_text: 'name'
          }
        },
        serial_number: {
          help_text: 'Use the serial number of the device. If you are using computer, use the cpu or system unit\'s serial'
        },
        // permit_number: {},
        // machine_indentification_number: {},
        // description: {},
      }
    }
    let formRetrieveParameter = {
    }
    return {
      config: {
        module_name: 'Terminal Management',
        api: 'store-terminal',
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
  }
}
</script>
