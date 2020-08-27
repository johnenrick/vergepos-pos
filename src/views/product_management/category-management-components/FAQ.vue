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
    return {
      howToList: [
        {
          description: 'Examples of Product Category',
          text: ''
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
