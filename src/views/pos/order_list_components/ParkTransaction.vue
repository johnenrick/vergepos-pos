<template>
  <div>
    <modal ref="modal">
      <template v-slot:body>
        <h-field label='Number' label-col="col-4 col-lg-3">
          <template v-slot:input>
            <input type="number" class="form-control" placeholder="Table or Queueing Number">
          </template>
        </h-field>
        <h-field label='Customer' label-col="col-4 col-lg-3">
          <template v-slot:input>
            <select-2 :config="select2Config" :index="'customer_id'" :formData="null" />
          </template>
        </h-field>
        <h-field label='Remarks' label-col="col-4 col-lg-3">
          <template v-slot:input>
            <textarea placeholder="Write a note here" class="form-control"></textarea>
          </template>
        </h-field>
        <div class="w-100 text-right">
          <button @click="park" class="btn btn-outline-dark"><fa icon="parking" /> Park</button>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import HField from '@/vue-web-core/components/bootstrap/HorizontalField'
import CartStore from '../cart-store'
import Select2 from '@/vue-web-core/components/form/InputType/Select2Input'
import CustomerDB from '@/database/controller/customer'
export default {
  components: {
    Modal,
    HField,
    Select2
  },
  data(){
    return {
      customerDB: new CustomerDB(),
      number: null, // table number or queueing number
      customer_id: null,
      customer_name: null,
      remarks: null,
      select2FormData: {
        customer_id: null
      },
      select2Config: {
        fetch_options: (search, id, callBack) => {
          this.customerDB.get({
            where: {
              name: '%' + search + '%'
            }
          }).then((result) => {
            let options = []
            if(result.length){

            }else{
              options.push({
                value: 'new',
                text: search
              })
            }
            callBack(options)
          })
        }
      }
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    },
    park(){
      console.log(CartStore.state)
    }
  }
}
</script>
