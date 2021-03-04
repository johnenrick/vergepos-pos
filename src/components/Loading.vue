<template>
  <div>
    <div class="text-center center">
      <template v-if="type === 'card'">
        <fa icon="circle-notch" spin class="display-3 mb-3" />
        <br>
        <p>{{loadingSMS}}</p>
      </template>
      <div v-if="type === 'inline'">{{loadingSMS}} <fa icon="circle-notch" spin /></div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Loading',
  props: {
    loadingSMS: {
      type: String,
      default: 'Please wait... '
    },
    type: {
      type: String,
      default: 'inline' // card
    }
  }
}
</script>
