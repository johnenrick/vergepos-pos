<template>
  <div class="section p-3">
    <basic-module :config="config" />
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
let ModuleDefault = {
  name: 'discount',
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
      type: {},
      value: {
        value_function: (data) => {
          return data['vaue']
        }
      },
      is_vat_exempt: {
        name: 'Vat Exempted'
      }
    }
    let formFieldSetting = {
      fields: {
        description: {
        },
        type: {
          type: 'select',
          default_value: 2,
          config: {
            options: [
              // {
              //   value: 1,
              //   text: 'Percentage on Receipt'
              // },
              {
                value: 2,
                text: 'Percentage on Items'
              },
              // {
              //   value: 3,
              //   text: 'Exact Value on Receipt'
              // },
              // {
              //   value: 4,
              //   text: 'Exact Value on Items'
              // }
            ]

          }
        },
        value: {
          value_function: (data) => {
            return data['vaue']
          }
        },
        is_vat_exempt: {
          name: 'Vat Exempted',
          type: 'select',
          config: {
            options: [{
              value: 1,
              text: 'Yes'
            },
            {
              value: 0,
              text: 'No'
            }]

          }
        },
        require_identification_card: {
          name: 'Require ID Card',
          type: 'select',
          config: {
            options: [{
              value: 1,
              text: 'Yes'
            },
            {
              value: 0,
              text: 'No'
            }]

          }
        }
      }
    }
    let formRetrieveParameter = {
    }
    return {
      config: {
        // module_name: 'Variable Management',
        api: 'discount',
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

  }
}

export default { ...ModuleDefault }
</script>
