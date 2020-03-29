<template>
    <div v-if="isTerminal" class="pt-2">
        <button @click="exportDatabase" class="btn btn-warning"><fa icon="file-archive" /> Backup Data</button><br>
        <small>It is strongly recommended that you <strong><a href="#" @click="exportDatabase"><u>BACK UP</u></a></strong> your data from time to time whenever you're in offline mode incase anything happens. </small>
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
