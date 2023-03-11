<template>
  <div>
    <template v-if="sessionStatus === USEDBYANOTHERCASHIERSESSIONSTATUS">
      <h5 class="text-danger font-weight-bold text-cemter text-center"> <fa icon="exclamation-triangle" /> Terminal Used By Other User</h5>
      <div>
        <p>This terminal is being used by different cashier or user. You need to close their session first before you can use it</p>
      </div>
    </template>
    <template v-else-if="sessionStatus === RUNNINGTOOLONGSESSIONSTATUS">
      <h5 class="text-warning font-weight-bold text-cemter text-center"> <fa icon="exclamation-triangle" /> Terminal Is Open for too long</h5>
      <div>
        <p>It is recommended to close the session every time the cashier changes. Or if you are using only 1 user account, close each shift atmost every 12 hours.</p>
        <p>This would ensure accountability and shorten the time window if ever there is a discrepancy</p>
      </div>
      <EditTerminalSessionDuration />
    </template>
    <template v-else-if="sessionStatus === SESSIONRUNNINGSESSIONSTATUS">
      <h5 class="text-primary font-weight-bold text-cemter text-center"> <fa icon="user-clock" /> Session On Going</h5>
    </template>
    <hr />
    <div class="form-group row mb-0">
      <label class="col-sm-3 col-form-label">Used By</label>
      <div class="col-sm-9">
        <input type="text" readonly class="form-control-plaintext" :value="workShiftUserName">
      </div>
    </div>
    <div class="form-group row mb-0">
      <label class="col-sm-3 col-form-label">Time Started</label>
      <div class="col-sm-9">
        <input type="text" readonly class="form-control-plaintext" :value="workShiftStartDatetime | formatDate('M d, yyyy hh:mm')">
      </div>
    </div>
    <div class="form-group row mb-0">
      <label class="col-sm-3 col-form-label">Time Opened</label>
      <div class="col-sm-9">
        <input type="text" readonly class="form-control-plaintext" :value="workShiftStartDatetime | datetimeLapse">
      </div>
    </div>
    <hr />
    <CloseShiftForm v-show="showCloseShiftForm" ref="closeShiftForm" @cancel="showCloseShiftForm = false" />
    <div v-show="!showCloseShiftForm" class="text-center">
      <button v-if="(isManager || sessionUserId === workShiftUserId)" @click="closeSession" class="btn btn-danger mr-1">Close Session</button>
      <button v-if="sessionStatus === SESSIONRUNNINGSESSIONSTATUS" @click="cancel" class="btn btn-outline-dark">Close</button>
    </div>
  </div>
</template>
<script>
import UserSession from '@/vue-web-core/system/store'
import CloseShiftForm from './CloseShiftForm'
import EditTerminalSessionDuration from './EditTerminalSessionDuration'
import CartStore from '../../cart-store'
import {
  CHECKINGSESSIONSTATUS, NOOPENSESSIONYETSESSIONSTATUS, SESSIONRUNNINGSESSIONSTATUS, RUNNINGTOOLONGSESSIONSTATUS, USEDBYANOTHERCASHIERSESSIONSTATUS,
} from '@/constants/workshift'

export default {
  components: {
    CloseShiftForm,
    EditTerminalSessionDuration
  },
  props: {
    sessionStatus: {
      required: true,
      type: Number
    }
  },
  data(){
    return {
      showCloseShiftForm: false,
      CHECKINGSESSIONSTATUS: CHECKINGSESSIONSTATUS,
      NOOPENSESSIONYETSESSIONSTATUS: NOOPENSESSIONYETSESSIONSTATUS,
      SESSIONRUNNINGSESSIONSTATUS: SESSIONRUNNINGSESSIONSTATUS,
      RUNNINGTOOLONGSESSIONSTATUS: RUNNINGTOOLONGSESSIONSTATUS,
      USEDBYANOTHERCASHIERSESSIONSTATUS: USEDBYANOTHERCASHIERSESSIONSTATUS,
    }
  },
  methods: {
    closeSession(){
      this.showCloseShiftForm = true
      this.$refs.closeShiftForm._reset()
    },
    cancel(){
      this.$emit('cancel')
    }
  },
  computed: {
    isManager(){
      return typeof UserSession.getters.userRoles['102'] !== 'undefined'
    },
    sessionUserId(){
      return UserSession.getters.userId
    },
    workShiftId(){
      return typeof CartStore.getters.workShiftDetail['id'] !== 'undefined' ? CartStore.getters.workShiftDetail['id'] : 0
    },
    workShiftStartDatetime(){
      return typeof CartStore.getters.workShiftDetail['created_at'] !== 'undefined' ? new Date(CartStore.getters.workShiftDetail['created_at']) : 0
    },
    sessionDuration(){
      return new Date() - this.workShiftStartDatetime
    },
    workShiftUserId(){
      return typeof CartStore.getters.workShiftDetail['user_id'] !== 'undefined' ? CartStore.getters.workShiftDetail['user_id'] : 0
    },
    workShiftDetail(){
      return CartStore.getters.workShiftDetail
    },
    workShiftUserName(){
      return typeof CartStore.getters.workShiftDetail['users'] !== 'undefined' && typeof CartStore.getters.workShiftDetail['users']['first_name'] ? CartStore.getters.workShiftDetail['users']['first_name'] + ' ' + CartStore.getters.workShiftDetail['users']['last_name'] : 'Unknown User #' + this.workShiftUserId
    }
  }
}
</script>
