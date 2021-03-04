<template>
  <div>
    <h6 class="text-center font-weight-bold">
      <span v-if="sessionStatus === 2"><fa icon="user-clock" /> End Shift</span>
      <span v-if="sessionStatus === 4"><fa icon="exclamation-triangle" /> Terminal Used By Other User</span>
    </h6>
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
      <button v-if="sessionStatus === 2" @click="cancel" class="btn btn-outline-dark">Close</button>
    </div>
  </div>
</template>
<script>
import UserSession from '@/vue-web-core/system/store'
import CloseShiftForm from './CloseShiftForm'
import CartStore from '../../cart-store'
export default {
  components: {
    CloseShiftForm
  },
  props: {
    sessionStatus: {
      required: true,
      type: Number
    }
  },
  data(){
    return {
      showCloseShiftForm: false
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
