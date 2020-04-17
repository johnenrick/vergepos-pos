<template>
  <div v-if="isTerminal" class="border rounded p-2 px-3">
    <p class="mb-1">Please <strong>BACK UP</strong> your data from time to time whenever you're in offline mode incase anything happens. </p>
    <div class="text-center">
      <button @click="exportDatabase" class="btn btn-outline-warning"><fa icon="file-archive" /> Back Up Data</button><br>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      isTerminal: localStorage.getItem('is_terminal')
    }
  },
  methods: {
    exportDatabase(){
      this.$parent.exportDatabase()
    }
  }
}
</script>
