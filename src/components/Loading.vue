<template>
  <div>
    <div class="text-center centered">
      <img src="/img/loading.gif" width="100px">
      <br>
      <h5>{{loadingSMS}}</h5>
    </div>
  </div>
</template>
<style scoped>
.centered {
  justify-content: center !important;
  flex-direction: column !important;
  align-items: center !important;
  display: flex !important;
  height: 50vh;
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
