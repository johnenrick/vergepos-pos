<template>
  <div>
    <div v-if="movement === null">
      <button @click="movement = 1" class="btn btn-success text-uppercase mr-2 px-4"><fa icon="arrow-left" /> Cash In</button>
      <button @click="movement = 2" class="btn btn-warning text-uppercase px-4">Cash Out <fa icon="arrow-right" /></button>
    </div>
    <div v-show="movement !== null">
      <h5 class="font-weight-bold">{{movement === 1 ? 'Cash In' : 'Cash Out'}}</h5>
      <p>Enter the bills you are {{movement === 1 ? 'putting into' : 'getting from'}} your cash drawer</p>
      <CommonForm ref="cashReading" :config="formConfig" :mode="isLoading ? 'view' : 'edit'" @data-changed="updateTotalCashBalance" @data-removed="updateTotalCashBalance"/>
      <div class="form-group row font-weight-bold mb-2">
        <label class="col-sm-4 col-form-label text-center">TOTAL</label>
        <div class="col-sm-8 ">
          <input type="text" readonly class="form-control-plaintext form-control-lg text-right font-weight-bold" :value="numberToMoney(totalCashBalance)">
        </div>
      </div>
      <div v-if="isLoading" class="text-center">
        Please wait <fa icon="circle-notch" spin />
      </div>
      <div v-else-if="savingSucceed" class='text-center text-success font-weight-bold'>
        Saved Successfully!
      </div>
      <div v-else>
        <button @click="saveCashMovement" :class="movement === 1 ? 'btn-success' : 'btn-warning'" class="btn mr-2">Save Cash {{movement === 1 ? 'In' : 'Out'}}</button>
        <button @click="movement = null" class="btn btn-outline-dark">Cancel</button>
      </div>
    </div>
  </div>
</template>
<script>
import WorkShiftCashReading from '@/database/controller/work-shift-cash-reading'
import BillFormConfig from '@/views/pos/pos-components/work-shift-components/bill-form-config'
import WorkShiftHelper from '@/views/pos/pos-components/work-shift-components/work-shift-helper'
import CommonForm from '@/vue-web-core/components/form/Form'
import CartStore from '@/views/pos/cart-store'
export default {
  components: {
    CommonForm
  },
  data(){
    return {
      formConfig: BillFormConfig.formConfig,
      totalCashBalance: 0,
      movement: null,
      isLoading: false,
      savingSucceed: false
    }
  },
  methods: {
    saveCashMovement(){
      if(this.workShiftId){
        const param = {
          work_shift_id: this.workShiftId,
          type: this.movement === 1 ? 2 : 3,
          approved_by_user_id: 0,
          ...this.$refs.cashReading._getFormData()
        }
        this.isLoading = true
        const WorkShiftCashReadingDB = new WorkShiftCashReading()
        WorkShiftCashReadingDB.add(param).then(result => {
          this.savingSucceed = true
          this.isLoading = false
          setTimeout(() => {
            this.$refs.cashReading._resetForm()
            this.savingSucceed = false
            this.movement = null
          }, 2500)
        })
      }else{
        console.error('Workshift Id is unknow', CartStore.getters.workShiftDetail)
      }
    },
    updateTotalCashBalance(){
      this.totalCashBalance = WorkShiftHelper.calculateTotalBillAmount(this.$refs.cashReading._getFormData())
    }
  },
  watch: {
    movement(movement){
      this.$emit('toggle-move-cash', movement !== null)
    }
  },
  computed: {
    workShiftId(){
      return typeof CartStore.getters.workShiftDetail['id'] !== 'undefined' ? CartStore.getters.workShiftDetail['id'] : 0
    }
  }
}
</script>
