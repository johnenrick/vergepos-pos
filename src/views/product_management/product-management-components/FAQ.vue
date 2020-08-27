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
    const checkIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-check fa-w-16"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" class=""></path></svg>'
    return {
      howToList: [
        {
          description: 'How to Create A Product',
          videoLink: 'https://www.youtube.com/watch?v=xypbB179WvY',
          steps: [
            'Click the <span class="badge badge-primary" > ' + plusIcon + ' Add </span> button on top right of the table',
            'Fill out the Form',
            'You can usually find the barcode at the back of the product or you can leave it blank',
            'Cost refers to the amount you spent to buy the product. If you buy the product in a pack, the cost would be: <div class="text-center"> <strong>Cost</strong> = <em>Price Per Pack</em> / <em>Pieces per Pack</em> </div>',
            'Price refers to the amount you will sell the product. Its basically <div class="text-center"><strong>Price</strong> = <span class="font-weight-bold font-italic">Cost</span> + <em>Profit</em></div>',
            'Make sure that the <em>Price</em> is higher than the <em>Cost</em>',
            'After filling up the form, just click <span class="badge badge-success text-nowrap">' + checkIcon + ' Save</span> button at the bottom right',
            'When saved succesfully, you can then edit the information or just close it'
          ]
        },
        {
          description: 'How to Create Lots of Products Faster',
          steps: [
            'Click the <span class="badge badge-primary" > ' + plusIcon + ' Add </span> button on top right of the table',
            'Fill out the Form',
            'Instead of clicking the Save button, click the <span class="border border-success px-1 text-success text-nowrap"> ' + plusIcon + ' Save and Add More</span> button. This would save the product and open a new form'
          ]
        }
      ]
    }
  }
}
</script>
