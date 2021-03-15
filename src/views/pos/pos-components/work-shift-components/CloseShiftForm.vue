<template>
  <div>
    <div>
      <div class="form-group row mb-0">
        <label class="col-4 col-form-label">Total Cash Sales</label>
        <div class="col-8">
          <input type="text" readonly class="form-control-plaintext text-right" :value="(totalCashSales) | numberToMoney">
        </div>
      </div>
      <div>
        <button v-if="showXReading" @click="showXReading = false" class="btn btn-dark btn-sm"><fa icon="arrow-left" /> Go Back</button>
      </div>
      <div class="text-right">
        <button v-if="!showXReading" @click="showXReading = true" class="btn btn-outline-dark btn-sm"><fa icon="receipt" /> View X Reading</button>
      </div>
      <hr />
    </div>
    <div v-show="!showXReading">
      <h6 class="font-weight-bold text-center mb-3">Closing Cash Balance</h6>
      <CommonForm ref="cashReading" :config="formConfig" @data-changed="updateTotalCashBalance" @data-removed="updateTotalCashBalance"/>
      <hr />
      <div class="form-group row mb-0">
        <label class="col-4 col-form-label">Beg. Cash Balance</label>
        <div class="col-8">
          <input type="text" readonly class="form-control-plaintext text-right" :value="totalBeginningCashReading | numberToMoney">
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-4 col-form-label">Total Cash Sales</label>
        <div class="col-8">
          <input type="text" readonly class="form-control-plaintext text-right" :value="totalCashSales | numberToMoney">
        </div>
      </div>
      <div class="form-group row mb-0">
        <label class="col-5 col-form-label text-uppercase">End Cash Balance</label>
        <div class="col-7">
          <input type="text" readonly class="form-control-plaintext text-right font-weight-bold" :value="totalCashBalance | numberToMoney">
        </div>
      </div>
      <div class="font-weight-bold text-center mb-3">
        <div v-if="discrepancy > 0" >
          <h5 class="text-warning font-weight-bold">Overage of {{discrepancy | numberToMoney}}</h5>
          <small><fa icon="info-circle" /> You have more cash than what is expected. It may looks good but it is an indicator that you're not following a strict rules in managing your cash. It has a disadvantage in a long term </small>
        </div>
        <div v-if="discrepancy < 0" >
          <h5 class="text-danger font-weight-bold">Shortage of {{discrepancy * -1 | numberToMoney}}</h5>
          <small><fa icon="info-circle" /> You have less cash than expected. Although it may seem small, your loss will compound in the long run.</small>
        </div>
      </div>
      <div class='text-center'>
        <div v-if="closeSuccessful">
          <div class="text-success mb-1"><fa icon="check" /> Shift Ended Successfully!</div>
          <button @click="refresh" class="btn btn-success">Ok</button>
        </div>
        <div v-if="!isLoading && !closeSuccessful">
          <button @click="endShift" class="btn btn-danger mr-1">End Shift</button>
          <button @click="cancel" class="btn btn-outline-dark">Cancel</button>
        </div>
        <div v-else-if="!closeSuccessful">
          Please wait <fa icon="circle-notch" spin />
        </div>
      </div>
    </div>
    <div v-show="showXReading">
      <x-reading ref="xReading"  />
    </div>
  </div>
</template>
<script>
import WorkShift from '@/database/controller/work-shift'
import WorkShiftCashReading from '@/database/controller/work-shift-cash-reading'
import CommonForm from '@/vue-web-core/components/form/Form'
import UserSession from '@/vue-web-core/system/store'
import BillFormConfig from './bill-form-config'
import WorkShiftHelper from './work-shift-helper'
import CartStore from '../../cart-store'
import XReading from '@/components/reading/XReading'
export default {
  components: {
    CommonForm,
    XReading
  },
  data(){
    return {
      formConfig: BillFormConfig.formConfig,
      isLoading: false,
      closeSuccessful: false,
      showXReading: false,
      cashSales: 0,
      voidedSales: 0,
      totalCashBalance: 0,
      totalBeginningCashReading: 0
    }
  },
  methods: {
    refresh(){
      this.isLoading = true
      this.closeSuccessful = false
      window.location.reload()
    },
    _reset(){
      this.isLoading = false
      this.closeSuccessful = false
      this.cashSales = 0
      this.totalCashBalance = 0
      this.$refs.cashReading._resetForm()
      this.generateXReading()
      this.getCashBalances()
    },
    cancel(){
      this.$emit('cancel')
    },
    endShift(){
      if(this.workShiftId){
        this.isLoading = true
        const param = {
          id: this.workShiftId,
          closed_by_user_id: this.sessionUserId,
          end_datetime: (new Date()).getTime(),
          close_overidden: CartStore.getters.workShiftDetail['user_id'] !== this.sessionUserId ? 1 : 0,
          work_shift_cash_readings: { ...{ type: 4, approved_by_user_id: 0, discrepancy: this.discrepancy }, ...this.$refs.cashReading._getFormData() }
        }
        const workShiftDB = new WorkShift()
        workShiftDB.closeShift(param).then(result => {
          this.isLoading = false
          this.closeSuccessful = true
        })
      }else{
        console.error('Workshift Id is unknow', CartStore.getters.workShiftDetail)
      }
    },
    getCashBalances(){
      const workShiftCashReadingDB = new WorkShiftCashReading()
      const workShiftId = parseInt(CartStore.getters.workShiftDetail['id'])
      const param = {
        where: {
          work_shift_id: workShiftId
        }
      }
      workShiftCashReadingDB.get(param).then(result => {
        this.totalBeginningCashReading = result.reduce((total, currentValue) => {
          return total + WorkShiftHelper.calculateTotalBillAmount(currentValue)
        }, 0)
      })
    },
    generateXReading(){
      this.$refs.xReading._generate(new Date(CartStore.getters.workShiftDetail['created_at']), null, CartStore.getters.workShiftDetail['user_id']).finally(() => {
        const paymentMethodSummary = this.$refs.xReading._getPaymentMethodSummary()
        if(typeof paymentMethodSummary['1'] !== 'undefined'){
          this.cashSales = paymentMethodSummary[1]['amount']
        }
      })
    },
    updateTotalCashBalance(){
      this.totalCashBalance = WorkShiftHelper.calculateTotalBillAmount(this.$refs.cashReading._getFormData())
    }
  },
  computed: {
    discrepancy(){
      return ((this.totalCashBalance - this.totalBeginningCashReading) - this.totalCashSales).toFixed(2) * 1
    },
    totalCashSales(){
      return this.cashSales
    },
    workShiftId(){
      return typeof CartStore.getters.workShiftDetail['id'] !== 'undefined' ? CartStore.getters.workShiftDetail['id'] : 0
    },
    isManager(){
      return typeof UserSession.getters.userRoles['102'] !== 'undefined'
    },
    sessionUserId(){
      return UserSession.getters.userId
    }
  }
}
</script>
