<template>
  <div class="pt-2">
    <modal ref="modal" title="Frequently Asked Questions (FAQs)">
      <div slot="body">
        <HowTo category="pos" :no-title="true" />
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
  methods: {
    _open(){
      this.$refs.modal._open()
    }
  }
}
</script>
