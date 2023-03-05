<template>
  <div class="mx-auto mt-4" style="max-width: 500px">
    <div class="border rounded p-4 bg-white shadow-sm">

      <div v-if="sessionStatus === 0" class="text-center">
        Please wait <fa icon="circle-notch" spin />
      </div>
      <div v-else-if="sessionStatus === 1">
        <h5 class="text-primary font-weight-bold text-cemter text-center"> <fa icon="user-clock" /> Start Shift</h5>
        <div>
          <p>It is important for you to keep track how much cash a cashier has before and after their shifts. This would prevent theft, prevent overage or shortage for change, avoid having too much money in the cash drawer, and enforce discipline of always checking cash</p>
          <p><small><fa icon="info-circle" /> If you don't want to keep track your cash, just leave form blank</small></p>
          <hr/>
        </div>
        <div v-if="useCashManagement !== 1" class="text-center">
          <button @click="setUseCashManagement(1)" class="btn btn-primary mx-1 my-1"><fa icon="check" /> Enable Cash Management</button>
          <button @click="setUseCashManagement(2)" class="btn btn-outline-secondary mx-1 my-1">Skip For Now</button>
          <hr />
          <button v-if="showDontUseCashManagement" @click="setUseCashManagement(3)" class="btn btn-outline-danger mx-1">I don't need Cash Management</button>
        </div>
        <div v-else>
          <h6 class="font-weight-bold text-center mb-3">Beginning Cash Balance</h6>
          <CommonForm ref="cashReading" :config="formConfig" @data-changed="updateTotalCashBalance" @data-removed="updateTotalCashBalance"/>
          <div class="form-group row mb-0 ">
            <label class="col-4 col-form-label">Total Cash</label>
            <div class="col-8">
              <input type="text" readonly class="form-control-plaintext text-right font-weight-bold" :value="totaCashBalance | numberToMoney">
            </div>
          </div>
          <div class='text-center'>
            <button @click="startShift" class="btn btn-primary mb-3">Start Your Shift</button> <br />
            <small><fa icon="info-circle" class="text-info" /> Do not forget to end your shift after your duty. Just click the <span class="bg-primary text-white p-1"><fa icon="user-clock" /> Shift</span> button at the top of search box</small>
          </div>
        </div>
      </div>
      <OngoingSession v-else-if="sessionStatus === 3 || sessionStatus === 4" :session-status="sessionStatus" />
    </div>
  </div>
</template>
<script>
import WorkShift from '@/database/controller/work-shift'
import CommonForm from '@/vue-web-core/components/form/Form'
import UserSession from '@/vue-web-core/system/store'
import BillFormConfig from './work-shift-components/bill-form-config'
import OngoingSession from './work-shift-components/OngoingSession'
import WorkShiftHelper from './work-shift-components/work-shift-helper'
import CartStore from '../cart-store'
export default {
  components: {
    CommonForm,
    OngoingSession
  },
  mounted(){
    this.checkUseCashManagement()
  },
  data(){
    return {
      formConfig: BillFormConfig.formConfig,
      existingWorkShiftId: 0,
      existingSessionStartDatetime: null,
      existingUserId: 0,
      totaCashBalance: 0,
      useCashManagement: 0, // 0 undecided, 1 use, 2 skip for now, 3 dont use
      showDontUseCashManagement: false,
      sessionStatus: 0 // 0 - checking, 1 - no open session yet, 2- session running, 3 - session is open for a long time, 4 - another cashier is using
    }
  },
  methods: {
    _checkSession(){
      this.existingSessionStartDatetime = null
      this.existingUserId = 0
      this.existingWorkShiftId = 0
      this.totaCashBalance = 0
      const workShiftDB = new WorkShift()
      const param = {
        where: {
          end_datetime: 0
        },
        with: {
          users: {
            use_db_id: true,
            is_parent: true
          }
        }
      }
      workShiftDB.get(param).then(result => {
        if(result.length){ // has existing open session
          result = result[0]
          this.existingWorkShiftId = result['id']
          CartStore.commit('setWorkShiftDetail', result)
          this.existingSessionStartDatetime = new Date(result['created_at'])
          const sessionDuration = new Date() - this.existingSessionStartDatetime
          if(result['user_id'] === this.userId){
            const maximumDuration = 43200000 // 12 hours

            if(sessionDuration > maximumDuration){ // if greater than maximumDuration
              this.sessionStatus = 3
            }else{ // ok
              this.sessionStatus = 2
            }
          }else{ // different user is logged in while a cashier has an open session
            this.sessionStatus = 4
          }
        }else{
          CartStore.commit('setWorkShiftDetail', {})
          this.checkUseCashManagement()
        }
      })
    },
    checkUseCashManagement(){
      this.useCashManagement = localStorage.getItem('useCashManagement') * 1 // 0 undecided, 1 use, 2 skip for now, 3 dont use
      if(this.useCashManagement === 2){
        let useCashManagementSkipForNowCounter = localStorage.getItem('useCashManagementSkipForNowCounter') * 1
        if(useCashManagementSkipForNowCounter > 4){
          this.showDontUseCashManagement = true
        }
        this.sessionStatus = 1
      }else if(this.useCashManagement === 3){
        this.sessionStatus = 2
      }else{
        this.sessionStatus = 1
      }
      setTimeout(() => {
      }, 2000)
    },
    setUseCashManagement(value){ // 0 undecided, 1 use, 2 skip for now, 3 dont use
      this.useCashManagement = value
      if(value !== 1){ // only set to "use" upon starting the shift
        localStorage.setItem('useCashManagement', value)
      }
      if(value === 2){
        let useCashManagementSkipForNowCounter = localStorage.getItem('useCashManagementSkipForNowCounter')
        localStorage.setItem('useCashManagementSkipForNowCounter', ++useCashManagementSkipForNowCounter)
        this.sessionStatus = 2
      }
      if(value === 3){
        this.sessionStatus = 2
      }
    },
    updateTotalCashBalance(){
      this.totaCashBalance = WorkShiftHelper.calculateTotalBillAmount(this.$refs.cashReading._getFormData())
    },
    startShift(){
      const workShiftDB = new WorkShift()
      let param = {
        db_id: 0,
        user_id: this.userId,
        closed_by_user_id: 0,
        end_datetime: 0,
        close_overidden: 0,
        work_shift_cash_readings: this.$refs.cashReading._getFormData()
      }
      param['work_shift_cash_readings']['type'] = 1
      workShiftDB.add(param).then(result => {
        result['users'] = {
          first_name: this.user['firstName'],
          last_name: this.user['lastName']
        }
        CartStore.commit('setWorkShiftDetail', result)
        this.sessionStatus = 2
        localStorage.setItem('useCashManagement', 1)
      })
    }
  },
  watch: {
    sessionStatus(newData){
      this.$emit('status-change', newData)
    }
  },
  computed: {
    userId(){
      return UserSession.getters.userId
    },
    user(){
      return UserSession.getters.user
    }
  }
}
</script>
