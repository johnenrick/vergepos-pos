<template>
  <div class="row pb-3">
    <div class="col-6">
      <button class="btn btn-lg btn-outline-dark mx-1">
        <fa :icon="'calculator'" />
      </button>
      <button class="btn btn-lg btn-outline-dark mr-1">
        <fa :icon="'redo'" />
      </button>
      <button @click="viewTransaction" class="btn btn-lg btn-outline-dark" title="Open Transaction"><fa :icon="'receipt'" /></button>
    </div>
    <div class="col-2">
      12:30pm
    </div>
    <transaction-viewer ref="TransactionViewer" />
  </div>
</template>
<script>
import TransactionViewer from './control_box_components/TransactionViewer'
export default {
  components: {
    TransactionViewer
  },
  methods: {
    viewTransaction(){
      this.$refs.TransactionViewer._open()
    }
  }
}
</script>
<style>
</style>
