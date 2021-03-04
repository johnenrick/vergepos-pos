<template>
  <div class="p-3">
    <button @click="upSyncWorkShift" class="btn btn-outline-dark">Upsync Work Shift</button>
  </div>
</template>
<script>
import WorkShiftUpSync from '@/database/up-sync/work-shift-up-sync'
export default {
  methods: {
    upSyncWorkShift(){
      WorkShiftUpSync.upload()
    }
  }
}
</script>
