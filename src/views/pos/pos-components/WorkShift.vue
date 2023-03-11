<template>
  <div class="mx-auto mt-4" style="max-width: 500px">
    <div class="border rounded p-4 bg-white shadow-sm">
      <div v-if="sessionStatus === CHECKINGSESSIONSTATUS" class="text-center">
        Please wait <fa icon="circle-notch" spin />
      </div>
      <div v-else-if="sessionStatus === NOOPENSESSIONYETSESSIONSTATUS">
        <h5 class="text-primary font-weight-bold text-cemter text-center"> <fa icon="user-clock" /> Start Shift</h5>
        <div>
          <p>It is important for you to keep track how much cash a cashier has before and after their shifts. This would prevent theft, prevent overage or shortage for change, avoid having too much money in the cash drawer, and enforce discipline of always checking cash</p>
          <p><small><fa icon="info-circle" /> If you don't want to keep track your cash, just leave form blank</small></p>
          <hr/>
        </div>
        <div v-if="useCashManagement !== ENABLEUSECASHMANAGEMENT" class="text-center">
          <button @click="setUseCashManagement(ENABLEUSECASHMANAGEMENT)" class="btn btn-primary mx-1 my-1"><fa icon="check" /> Enable Cash Management</button>
          <button @click="setUseCashManagement(SKIPUSECASHMANAGEMENT)" class="btn btn-outline-secondary mx-1 my-1">Skip For Now</button>
          <hr />
          <button v-if="showDontUseCashManagement" @click="setUseCashManagement(DISABLEUSECASHMANAGEMENT)" class="btn btn-outline-danger mx-1">I don't need Cash Management</button>
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
      <OngoingSession v-else-if="sessionStatus === RUNNINGTOOLONGSESSIONSTATUS || sessionStatus === USEDBYANOTHERCASHIERSESSIONSTATUS" :session-status="sessionStatus" />
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
import { SESSIONDURATIONSTORAGEKEY, USECASHMANAGEMENTSTORAGEKEY, USECASHMANAGEMENTSKIPFORNOWCOUNTERSTORAGEKEY } from '@/constants/localstorage'
import {
  CHECKINGSESSIONSTATUS, NOOPENSESSIONYETSESSIONSTATUS, SESSIONRUNNINGSESSIONSTATUS, RUNNINGTOOLONGSESSIONSTATUS, USEDBYANOTHERCASHIERSESSIONSTATUS,
  UNDECIDEDUSECASHMANAGEMENT, ENABLEUSECASHMANAGEMENT, SKIPUSECASHMANAGEMENT, DISABLEUSECASHMANAGEMENT
} from '@/constants/workshift'
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
      useCashManagement: UNDECIDEDUSECASHMANAGEMENT, // 0 undecided, 1 use, 2 skip for now, 3 dont use
      showDontUseCashManagement: false,
      sessionStatus: CHECKINGSESSIONSTATUS, // 0 - checking, 1 - no open session yet, 2- session running, 3 - session is open for a long time, 4 - another cashier is using
      CHECKINGSESSIONSTATUS: CHECKINGSESSIONSTATUS,
      NOOPENSESSIONYETSESSIONSTATUS: NOOPENSESSIONYETSESSIONSTATUS,
      SESSIONRUNNINGSESSIONSTATUS: SESSIONRUNNINGSESSIONSTATUS,
      RUNNINGTOOLONGSESSIONSTATUS: RUNNINGTOOLONGSESSIONSTATUS,
      USEDBYANOTHERCASHIERSESSIONSTATUS: USEDBYANOTHERCASHIERSESSIONSTATUS,
      UNDECIDEDUSECASHMANAGEMENT: UNDECIDEDUSECASHMANAGEMENT,
      ENABLEUSECASHMANAGEMENT: ENABLEUSECASHMANAGEMENT,
      SKIPUSECASHMANAGEMENT: SKIPUSECASHMANAGEMENT,
      DISABLEUSECASHMANAGEMENT: DISABLEUSECASHMANAGEMENT,
    }
  },
  methods: {
    _checkSession(){
      if(this.useCashManagement === DISABLEUSECASHMANAGEMENT){
        CartStore.commit('setWorkShiftDetail', {}) // delete the work shift session
        return false
      }
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
            const maximumDuration = localStorage.getItem(SESSIONDURATIONSTORAGEKEY) || 8 // 12 hours
            // const maximumDuration = 1; // 12 hours
            if(sessionDuration > maximumDuration * 3600000){ // if greater than maximumDuration. maximumDuration * ( 1 hour in milliseconds)
              this.sessionStatus = RUNNINGTOOLONGSESSIONSTATUS
            }else{ // ok
              this.sessionStatus = SESSIONRUNNINGSESSIONSTATUS
            }
          }else{ // different user is logged in while a cashier has an open session
            this.sessionStatus = USEDBYANOTHERCASHIERSESSIONSTATUS
          }
        }else{
          CartStore.commit('setWorkShiftDetail', {})
          this.checkUseCashManagement()
        }
      })
    },
    checkUseCashManagement(){
      this.useCashManagement = localStorage.getItem(USECASHMANAGEMENTSTORAGEKEY) * 1 // 0 undecided, 1 use, 2 skip for now, 3 dont use
      if(this.useCashManagement === SKIPUSECASHMANAGEMENT){
        let useCashManagementSkipForNowCounter = localStorage.getItem(USECASHMANAGEMENTSKIPFORNOWCOUNTERSTORAGEKEY) * 1
        if(useCashManagementSkipForNowCounter > 4){
          this.showDontUseCashManagement = true
        }
        this.sessionStatus = NOOPENSESSIONYETSESSIONSTATUS
      }else if(this.useCashManagement === DISABLEUSECASHMANAGEMENT){
        this.sessionStatus = SESSIONRUNNINGSESSIONSTATUS
      }else{
        this.sessionStatus = NOOPENSESSIONYETSESSIONSTATUS
      }
    },
    setUseCashManagement(value){ // 0 undecided, 1 use, 2 skip for now, 3 dont use
      this.useCashManagement = value
      if(value !== 1){ // only set to "use" upon starting the shift
        localStorage.setItem(USECASHMANAGEMENTSTORAGEKEY, value)
      }
      if(value === 2){
        let useCashManagementSkipForNowCounter = localStorage.getItem(USECASHMANAGEMENTSKIPFORNOWCOUNTERSTORAGEKEY)
        localStorage.setItem(USECASHMANAGEMENTSKIPFORNOWCOUNTERSTORAGEKEY, ++useCashManagementSkipForNowCounter)
        this.sessionStatus = SESSIONRUNNINGSESSIONSTATUS
      }
      if(value === 3){
        this.sessionStatus = SESSIONRUNNINGSESSIONSTATUS
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
        this.sessionStatus = SESSIONRUNNINGSESSIONSTATUS
        localStorage.setItem(USECASHMANAGEMENTSTORAGEKEY, 1)
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
