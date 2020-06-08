<template>
  <div>
    <modal ref="modal" title="Terminal Selection">
      <template v-slot:body>
        <div v-if="!isCreating">
          <p>Select the terminal of this machine. Only one machine per terminal</p>
          <div class="w-100 text-right mb-2">

            <button @click="isCreating = true" class="btn btn-success"><fa icon="plus" /> Add Terminal</button>
          </div>
          <ul class="list-group">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <fa icon="star" /> HP Terminal 1
              <small>102392992</small>
              <button class="btn btn-secondary">Select</button>
            </li>
          </ul>
        </div>
        <div v-else class="w-100 pt-2">
          <div>
            <div class="form-group row">
              <label  class="col-5 col-form-label">Description</label>
              <div class="col-7">
                <input v-model="newTerminalForm.description" type="text" class="form-control" placeholder="Description">
              </div>
            </div>
            <div class="form-group row">
              <label  class="col-5 col-form-label">Serial Number</label>
              <div class="col-7">
                <input v-model="newTerminalForm.serial_number" type="text" class="form-control" placeholder="Device Serial Number or SSN">
              </div>
            </div>
            <div class="form-group row">
              <label  class="col-5 col-form-label">BIR Permit Number</label>
              <div class="col-7">
                <input v-model="newTerminalForm.permit_number" type="text" class="form-control" placeholder="BIR Permit Number. Optional">
              </div>
            </div>
          </div>
          <div class="w-100 text-right">
            <button @click="createTerminal" class="btn btn-outline-success mr-2">Create</button>
            <button @click="isCreating = false" class="btn btn-outline-secondary">Cancel</button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
export default {
  components: {
    Modal
  },
  data(){
    return {
      terminalList: [],
      isCreating: true,
      newTerminalForm: {
        description: null,
        serial_number: null,
        permit_number: null,
      }
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    },
    createTerminal(){
      this.apiRequest('terminal/create', this.newTerminalForm, (response) => {
        console.log(response)
      })
    }
  }
}
</script>
