<template>
  <div
    class="col-6 col-sm-6 col-md-4 px-1 py-1 itemContainer"
  >
    <div
      @click="$emit('select')"
      :class="isCategory ? 'font-weight-bold text-uppercase' : ''"
      class=" border text-primary border-primary py-2 text-center px-1 c-pointer item"
      style="max-height:66px; overflow-y:hidden"
    >
      <span class="no_selection">{{ description }}</span>
      <div class="priceContainer">
        <small v-if="!isCategory" class="no_selection text-disabled font-italic">PHP {{ price | numberToMoney}}</small>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    description: String,
    price: {
      type: Boolean,
      default: null
    },
    isCategory: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style scoped lang="scss">
@import "@/assets/style/custom-theme.scss";
.itemContainer .border-primary:hover {
  cursor: pointer;
}
.itemContainer {
  display: table;
}
.itemContainer .item {
  display: table-cell;
  height: 64px;
  vertical-align: middle;
}
.itemContainer .priceContainer {
  margin-top:-7px;
}
.no_selection {
  -webkit-user-select: none; /* webkit (safari, chrome) browsers */
  -moz-user-select: none; /* mozilla browsers */
  -khtml-user-select: none; /* webkit (konqueror) browsers */
  -ms-user-select: none; /* IE10+ */
}
.itemContainer .border-primary:active:hover {
  background-color: $primary;
  color: white !important;
}
</style>
