<template>
  <modal title="Work Shift Details" ref="modal" size="lg">
    <template v-slot:body>
      <div class="clearfix">
        <button v-if="showXReading" @click="showXReading = false" class="btn btn-dark btn-sm float-left"><fa icon="arrow-left" /> Go Back</button>
        <button v-if="!showXReading" @click="showXReading = true" class="btn btn-outline-dark btn-sm float-right"><fa icon="receipt" /> View X Reading</button>
      </div>
      <x-reading v-show="showXReading" ref="xReading"  />
      <div v-show="!showXReading" class="mt-3">
        <CashReadingList :cash-readings="cashReadings"/>
      </div>
    </template>
  </modal>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import XReading from '@/components/reading/XReading'
import CashReadingList from './CashReadingList'
export default {
  components: {
    Modal,
    XReading,
    CashReadingList
  },
  data(){
    return {
      showXReading: false,
      workShiftDetail: {},
      cashReadings: []
    }
  },
  methods: {
    _open(workShiftId, workShiftDetails){
      this.showXReading = false
      this.workShiftDetail = workShiftDetails
      this.cashReadings = typeof workShiftDetails['work_shift_cash_readings'] !== 'undefined' ? workShiftDetails['work_shift_cash_readings'] : []
      console.log('workShiftDetails', workShiftDetails)
      this.$refs.modal._open()
    },
    generateXReading(){
      this.$refs.xReading._generate(new Date(workShiftDetail['created_at']), null, workShiftDetail['user_id']).finally(() => {
        const paymentMethodSummary = this.$refs.xReading._getPaymentMethodSummary()
        if(typeof paymentMethodSummary['1'] !== 'undefined'){
          this.cashSales = paymentMethodSummary[1]['amount']
        }
      })
    },
  }
}
</script>
