<template>
  <div>
    Hello this is test page
    <button @click="upSync">Test Sync</button>
  </div>
</template>
<script>
import UpSync from '@/database/up-sync/up-sync'
export default {
  mounted(){
    this.upSync()
  },
  methods: {
    upSync(){
      UpSync.sync()
    }
  }
}
</script>
