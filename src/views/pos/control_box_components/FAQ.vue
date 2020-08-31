<template>
  <div class="pt-2">
    <modal ref="modal" title="Frequently Asked Questions (FAQs)">
      <div slot="body">
        <HowTo :howToList="howToList" :no-title="true" />
        <p class="mt-2">
          If you need more help, contact us through our FB Page: <a href="https://fb.com/vergepos">fb.com/vergepos</a>
        </p>
      </div>
    </modal>
  </div>
</template>
<script>
import HowTo from '@/components/how-to/HowTo'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
export default {
  name: 'ProductManagementFAQ',
  components: {
    Modal,
    HowTo
  },
  data(){
    const receiptIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="receipt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="svg-inline--fa fa-receipt fa-w-12"><path fill="currentColor" d="M358.4 3.2L320 48 265.6 3.2a15.9 15.9 0 0 0-19.2 0L192 48 137.6 3.2a15.9 15.9 0 0 0-19.2 0L64 48 25.6 3.2C15-4.7 0 2.8 0 16v480c0 13.2 15 20.7 25.6 12.8L64 464l54.4 44.8a15.9 15.9 0 0 0 19.2 0L192 464l54.4 44.8a15.9 15.9 0 0 0 19.2 0L320 464l38.4 44.8c10.5 7.9 25.6.4 25.6-12.8V16c0-13.2-15-20.7-25.6-12.8zM320 360c0 4.4-3.6 8-8 8H72c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h240c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H72c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h240c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H72c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h240c4.4 0 8 3.6 8 8v16z" class=""></path></svg>'
    const searchIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-search fa-w-16"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" class=""></path></svg>'
    const rePrintIcon = '<svg data-v-0f13c838="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="print" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-print fa-w-16"><path data-v-0f13c838="" fill="currentColor" d="M448 192V77.25c0-8.49-3.37-16.62-9.37-22.63L393.37 9.37c-6-6-14.14-9.37-22.63-9.37H96C78.33 0 64 14.33 64 32v160c-35.35 0-64 28.65-64 64v112c0 8.84 7.16 16 16 16h48v96c0 17.67 14.33 32 32 32h320c17.67 0 32-14.33 32-32v-96h48c8.84 0 16-7.16 16-16V256c0-35.35-28.65-64-64-64zm-64 256H128v-96h256v96zm0-224H128V64h192v48c0 8.84 7.16 16 16 16h48v96zm48 72c-13.25 0-24-10.75-24-24 0-13.26 10.75-24 24-24s24 10.74 24 24c0 13.25-10.75 24-24 24z" class=""></path></svg>'
    const voidIcon = '<svg data-v-0f13c838="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ban" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-ban fa-w-16"><path data-v-0f13c838="" fill="currentColor" d="M256 8C119.034 8 8 119.033 8 256s111.034 248 248 248 248-111.034 248-248S392.967 8 256 8zm130.108 117.892c65.448 65.448 70 165.481 20.677 235.637L150.47 105.216c70.204-49.356 170.226-44.735 235.638 20.676zM125.892 386.108c-65.448-65.448-70-165.481-20.677-235.637L361.53 406.784c-70.203 49.356-170.226 44.736-235.638-20.676z" class=""></path></svg>'
    const cogIcon = '<svg data-v-62673ac7="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cog" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-cog fa-w-16"><path data-v-62673ac7="" fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" class=""></path></svg>'
    return {
      howToList: [
        {
          description: 'How to View a Transaction',
          steps: [
            `View the Receipt by clicking <big>${receiptIcon}</big> Icon`,
            `Type the transaction number in the searchbox`,
            `Click the ${searchIcon} Search Button`
          ]
        }, {
          description: 'How to Void a Transaction',
          preInstructionText: 'Take note that you can only void a transaction 24 hours when it was issued. You also need a user which has <em>Manager</em> Role because Only a Manager can void a transaction.',
          steps: [
            `View the Receipt by clicking <big>${receiptIcon}</big> Icon`,
            `Type the transaction number in the searchbox`,
            `Click the ${searchIcon} Search Button`,
            `
              Click the ${voidIcon} Void Button at the most bottom part besides the ${rePrintIcon} Reprint Button.
              <div>If you did not see the Void Button, it means that it is more than 24 hours since it was issued</div>
            `,
            `Write the reason for voiding. This is very important`,
            'Select Manager and write the PIN',
            'Then click the Void Button'
          ]
        }, {
          description: 'How Print Receipt upon check out',
          steps: [
            `View the Receipt by clicking <big>${receiptIcon}</big> Icon`,
            `Type the transaction number in the searchbox`,
            `Click the ${searchIcon} Search Button`,
            `Once the Receipt has been found, click ${rePrintIcon} Reprint Button at the bottom of the receipt`
          ]
        }, {
          description: 'How to add a Discount',
          steps: [
            `Click the ${cogIcon} More Action Button above the Checkout Button`,
            'Click Apply Discounts',
            'Select the Discount you want to apply',
            'Enter the quantities of each products you want to be discounted. div>If you want to apply the discount in all product, check the Select All</div>',
            'Type the remarks if required',
            'Then Save Changes'
          ]
        }, {
          description: 'How to Remove an Item or Edit an Item Quantity in the Cart',
          steps: [
            'Click the product row in the Cart or Order List',
            'To change the quantity, change the quantity in the Quantity Field then click save',
            'To remove the product, click the Remove button'
          ]
        }, {
          description: 'How to Edit a Transaction',
          preInstructionText: 'Editing a Transaction is not allowed in any POS software. This will make lots of problem in your accounting. Instead, void the transaction then create a new one'
        }
      ]
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    }
  }
}
</script>
