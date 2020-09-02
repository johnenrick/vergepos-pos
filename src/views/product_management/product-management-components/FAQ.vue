<template>
  <div class="pt-2">
    <HowTo :category="'product_management'" />
  </div>
</template>
<script>
import HowTo from '@/components/how-to/HowTo'
export default {
  name: 'ProductManagementFAQ',
  components: {
    HowTo
  }
}
</script>
