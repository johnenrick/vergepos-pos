<template>
  <div class="section">
    <basic-module :config="config" @form-update="formUpdateListener" @form-delete="formDeleteListener" />
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import DiscountDB from '@/database/controller/discount'

let ModuleDefault = {
  name: 'discount',
  components: {
    BasicModule
  },
  mounted () {
  },
  data () {
    let tableSettingRetrieveParameter = {
      sort: [{
        column: 'description',
        order: 'asc',
      }]
    }
    let tableColumnSetting = {
      description: {},
      type: {
        value_function: (data) => {
          switch(data['type'] * 1){
            case 1: return 'Percentage on Receipt'
            case 2: return 'Percentage on Items'
          }
        }
      },
      value: {
        type: 'number',
        value_function: (data) => {
          return data['value']
        }
      },
      is_vat_exempt: {
        type: 'yesno',
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
    formUpdateListener(data){
      if(localStorage.getItem('is_terminal')){
        let discountDB = new DiscountDB()
        discountDB.get({ db_id: data['id'] }).then((discountData) => {
          data['db_id'] = data['id']
          data['is_vat_exempt'] = data['is_vat_exempt'] * 1
          data['require_identification_card'] = data['require_identification_card'] * 1
          data['type'] = data['type'] * 1
          data['value'] = data['value'] * 1
          console.log(data)
          delete data['id']
          if(discountData){
            discountDB.update(data)
          }else{
            discountDB.add(data)
          }
        })
      }
    },
    formDeleteListener(id){
      if(localStorage.getItem('is_terminal')){
        let discountDB = new DiscountDB()
        discountDB.delete({ where: { db_id: id } }).then((result) => {
          console.log(result)
        })
      }
    }
  }
}

export default { ...ModuleDefault }
</script>
