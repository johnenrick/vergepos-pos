<template>
  <div class="">
    <modal ref="modal" title="Frequently Asked Questions (FAQs)">
      <div slot="body">
        <HowTo category="pos" :no-title="true" />
        <p class="mt-2">
          If you need more help, contact us through our FB Page:
        </p>
        <div class="text-center">
          <a href="https://fb.com/vergepos" target="_blank" class="text-info btn btn-outline-info">Visit <fa :icon="['fab', 'facebook-square']" class="" /> <strong> fb.com/vergepos</strong></a>
        </div>
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
  methods: {
    _open(){
      this.$refs.modal._open()
    }
  }
}
</script>
