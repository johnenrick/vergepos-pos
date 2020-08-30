<template>
  <div class="pt-2">
    <HowTo :howToList="howToList" />
  </div>
</template>
<script>
import HowTo from '@/components/HowTo'
export default {
  name: 'ProductManagementFAQ',
  components: {
    HowTo
  },
  data(){
    const plusIcon = '<svg data-prefix="fas" data-icon="plus" role="img" viewBox="0 0 448 512" class="svg-inline--fa fa-plus fa-w-14"><path fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>'
    const nonSpecificCategoryExample =
      `<div class="pt-1">
        <span class="font-weight-bold">Example of None Specific Categories: </span>
        <ul>
          <li>Food</li>
          <li>Beverages</li>
          <li>Clothes</li>
        </ul>
      </div>`
    const specificCategoryExample =
      `<div class="pt-1">
        <span class="font-weight-bold">Example of Specific Categories:</span> 
        <ul>
          <li>Snacks</li>
          <li>Canned Goods</li>
          <li class="pb-2">Ready To Eat Meal</li>
          <li>Softdrink</li>
          <li>Energy Drinks</li>
          <li class="pb-2">Alcohol</li>
          <li>T-Shirt</li>
          <li>Short</li>
          <li>Pants</li>
        </ul>
      </div>`

    return {
      howToList: [
        {
          description: 'Examples of Product Category',
          preInstructionText: 'Product Category helps you organize your products. When making a category, the more specific the better. If you can\'t think of something specific, its okay.' + nonSpecificCategoryExample + specificCategoryExample
        },
        {
          description: 'How to Create Lots of Categories Faster',
          steps: [
            'Click the <span class="badge badge-primary" > ' + plusIcon + ' Add </span> button on top right of the table',
            'Fill Out the Form',
            'Instead of clicking the Save button, click the <span class="border border-success px-1 text-success text-nowrap"> ' + plusIcon + ' Save and Add More</span> button. This would save the product and open a new form'
          ]
        }
      ]
    }
  }
}
</script>
