<template>
  <div class="section p-3">
    <basic-module :config="config" @form-update="formUpdateListener" @form-delete="formDeleteListener" />
  </div>
</template>

<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import CategoryDB from '@/database/controller/category'
let ModuleDefault = {
  name: 'dashboard',
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
      description: {}
      // 'category.description': {
      //   name: 'Parent'
      // }
    }
    let formFieldSetting = {
      fields: {
        description: {
          help_text: 'Category Name or Group Name of products. Example: Shirts, Appliances, Beverages, etc.'
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
        description: 'A Product Category or simply a Category refers to the groupings of products. You need to create a Category first before you can create a Product. You can also create Categories such as "All Product" if you do not want to categorize your products or "Others" for products that do not have specific category.',
        table_setting: {
          retrieve_parameter: tableSettingRetrieveParameter,
          table_column_setting: tableColumnSetting
        },
        has_create_more: true,
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
        let categoryDB = new CategoryDB()
        categoryDB.get({ db_id: data['id'] }).then((categoryData) => {
          data['db_id'] = data['id']
          console.log(data)
          delete data['id']
          if(categoryData){
            categoryDB.update(data)
          }else{
            categoryDB.add(data)
          }
        })
      }
    },
    formDeleteListener(id){
      if(localStorage.getItem('is_terminal')){
        let categoryDB = new CategoryDB()
        categoryDB.delete({ where: { db_id: id } }).then((result) => {
          console.log(result)
        })
      }
    }
  }
}

export default { ...ModuleDefault }
</script>
