<template>
  <div>
    <div class="text-center centered">
      <img src="/img/loading.gif" width="50px">
      <br>
      <p>{{loadingSMS}}</p>
    </div>
  </div>
</template>
<style scoped>
.centered {
  justify-content: center !important;
  flex-direction: column !important;
  align-items: center !important;
  display: flex !important;
  height: 30vh;
}
</style>

<script>
export default {
  name: 'Loading',
  props: {
    loadingSMS: String
  }
}
</script>
