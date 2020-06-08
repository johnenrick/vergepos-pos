<template>
  <div class="border rounded bg-white p-2 px-3">
    <p class="mb-1">Please BACK UP your data from time to time whenever you're in offline mode incase anything happens. </p>
    <div class="text-center">
      <button @click="exportDatabase" class="btn btn-sm btn-outline-warning mb-1"><fa icon="file-archive" /> Back Up Data</button><br>
    </div>
    <back-up-database ref="backUpDatabase" />
  </div>
</template>
<script>
import BackUpDatabase from '@/components/BackUpDatabase'
export default {
  components: {
    BackUpDatabase
  },
  data() {
    return {}
  },
  methods: {
    exportDatabase(){
      this.$refs.backUpDatabase.exportDatabase()
    }
  }
}
</script>
