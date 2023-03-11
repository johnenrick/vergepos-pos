<template>
  <div>
    <div class="form-group row mb-2">
      <label class="col-sm-4 col-form-label">Session Duration</label>
      <div class="col-sm-8">
        <select v-model="currentDuration" class="form-control">
            <option value="8" default>Every 8 hours(recommended)</option>
            <option value="12">Every 12 hours</option>
            <option value="24">Every 24 hours</option>
            <option value="0">Disable this feature</option>
        </select>
      </div>
    </div>
    <div class="form-group row mb-0">
      <div class="col-sm-12 text-right">
        <button
          v-if="currentDuration !== originalCurrentDurationValue"
          @click="save" class="btn btn-outline-success"
        >
          <fa icon="save" /> Update and Proceed to POS
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { SESSIONDURATIONSTORAGEKEY } from '@/constants/localstorage'
export default {
  data(){
    let currentDuration = localStorage.getItem(SESSIONDURATIONSTORAGEKEY) || '8' // 8 is default
    return {
      originalCurrentDurationValue: currentDuration,
      currentDuration: currentDuration
    }
  },
  methods: {
    save(){
      if(this.currentDuration * 1){
        localStorage.setItem(SESSIONDURATIONSTORAGEKEY, this.currentDuration)
      }else{ // disable cash management feature
        localStorage.setItem('useCashManagement', 3)
        localStorage.setItem(SESSIONDURATIONSTORAGEKEY, 8)
      }
      location.reload()
    }
  }
}
</script>
