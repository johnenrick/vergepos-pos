<template>
  <div>
    <div class="table-responsive">
      <table  class="table mb-0">
        <thead>
          <tr class="text-center">
            <th>Type</th>
            <th>Total Amount</th>
            <th>Date&Time</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(cashReading, index) in cashReadings">
            <tr v-if="showCashReading === null || showCashReading === index" >
              <td class="text-center">{{cashReading['type'] | typeDescription}}</td>
              <td class="text-right">{{cashReading | calculateCashReadingTotal | numberToMoney}}</td>
              <td class="text-center">{{cashReading['created_at'] | formatDate('mm/dd/yy hh:mm')}}</td>
              <td class="text-center">
                <button v-if="showCashReading === null" @click="showCashReading = index" class="btn btn-sm btn-outline-info">View</button>
                <button v-else @click="showCashReading = null" class="btn btn-outline-dark btn-sm mb-2"> Hide</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-show="showCashReading !== null" class="px-4 mx-auto border pt-2" style="max-width: 400px">
      <h5 class="text-center">Cash Reading</h5>
      <CommonForm ref="cashReadingForm" :config="formConfig" mode="view" />
    </div>

  </div>
</template>
<script>
import WorkShiftHelper from '@/views/pos/pos-components/work-shift-components/work-shift-helper'
import CommonForm from '@/vue-web-core/components/form/Form'
import BillFormConfig from '@/views/pos/pos-components/work-shift-components/bill-form-config'
export default {
  components: {
    CommonForm
  },
  props: {
    cashReadings: Array
  },
  data(){
    return {
      formConfig: BillFormConfig.generateFormConfig(true),
      showCashReading: null
    }
  },
  watch: {
    cashReadings(){
      this.showCashReading = null
    },
    showCashReading(){
      if(this.showCashReading !== null){
        this.$refs.cashReadingForm._fillFormData(this.cashReadings[this.showCashReading])
      }else{
        this.$refs.cashReadingForm._resetForm()
      }
    }
  },
  filters: {
    typeDescription(type){
      switch(type * 1){
        case 1: return 'Beginning Balance'
        case 2: return 'Cash In'
        case 3: return 'Cash Out'
        case 4: return 'Closing Balance'
      }
    },
    calculateCashReadingTotal(cashReading){
      return WorkShiftHelper.calculateTotalBillAmount(cashReading)
    }
  }
}
</script>
