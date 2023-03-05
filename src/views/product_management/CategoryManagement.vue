<template>
  <div class="">
    <basic-module :config="config" @form-update="formUpdateListener" @form-delete="formDeleteListener" >
      <template slot="customSection1"><FAQ /></template>
    </basic-module>
  </div>
</template>
<script>
import BasicModule from '@/vue-web-core/components/basic-module/BasicModule'
import CategoryDB from '@/database/controller/category'
import FAQ from './category-management-components/FAQ'
let ModuleDefault = {
  name: 'dashboard',
  components: {
    BasicModule,
    FAQ
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
      'category.description': {
        name: 'Parent Category'
      },

    }
    let formFieldSetting = {
      fields: {
        description: {
          help_text: 'Category Name or Group Name of products. Example: Shirts, Appliances, Beverages, etc.'
        },
        category_id: {
          name: 'Parent Category',
          type: 'select',
          help_text: 'Optional. Just select "No Parent" if this category is not under any category',
          is_retained_on_create: true,
          default_value: '0',
          config: {
            api_link: 'category/retrieve',
            api_option_text: 'description',
            default_option: {
              text: 'No Parent',
              value: '0'
            },
            api_parameter: {
              sort: [{
                column: 'description',
                order: 'asc'
              }]
            }
          }
        }
      }
    }
    let formRetrieveParameter = {
    }
    return {
      config: {
        // module_name: 'Variable Management',
        api: 'category',
        description: 'A Product Category or simply a Category refers to the groupings of products. You can also create Categories such as "All Products" if you do not want to categorize your products or "Others" for products that do not have specific category.',
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
    async formUpdateListener(data){
      if(localStorage.getItem('is_terminal')){
        let categoryDB = new CategoryDB()
        const categoryData = await categoryDB.get({ db_id: data['id'] })
        data['db_id'] = data['id']
        if(data['category_id'] * 1){
          const parentCategoryData = await categoryDB.get({ db_id: data['category_id'] })
          if(parentCategoryData){
            data['category_id'] = parentCategoryData['id'] * 1
          }else{
            console.log('category_id', data['category_id'])
          }
        }
        data['category_id'] = data['category_id'] * 1
        if(categoryData){
          data['id'] = categoryData['id']
          categoryDB.update(data)
        }else{
          delete data['id']
          categoryDB.add(data)
        }
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
