<template>
  <div class="pt-2">
    <modal ref="modal">
      <div slot="body">
        <HowTo :howToList="howToList" />
      </div>
    </modal>
  </div>
</template>
<script>
import HowTo from '@/components/HowTo'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
export default {
  name: 'ProductManagementFAQ',
  components: {
    Modal,
    HowTo
  },
  data(){
    return {
      howToList: [
        {
          description: 'How to Void a Transaction',
          steps: []
        }, {
          description: 'How to View a Transaction',
          steps: []
        }, {
          description: 'How to add a Discount',
          steps: []
        }, {
          description: 'How to Remove an Item in the Cart',
          steps: []
        }, {
          description: 'How to edit the quantity of an item'
        }, {
          description: 'How to Edit a Transaction'
        }, {
          description: 'How Print Receipt upon check out'
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
