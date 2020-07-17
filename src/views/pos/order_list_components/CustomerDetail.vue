<template>
  <div>
    <modal ref="modal" title="Customer Details" icon="user-friends">
      <template slot="body">
        <select2 placeholder="Type Customer Name" :options="selectOptions" @search="userTyping" @input="valueChanged"></select2>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import 'vue-select/dist/vue-select.css'
import select2 from 'vue-select'

export default {
  components: {
    Modal,
    select2
  },
  data(){
    return {
      selectOptions: []
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    },
    userTyping(){
      // TODO Update the option to have the following values: The typed value(for creating new), and the matching existing customer name
    },
    valueChanged(val){
      // TODO if the val is null, then create new customer, else use the selected customer

    }
  }
}
</script>
<style>

</style>
