<template>
  <div class="card text-white  mb-3" :class="customClass">
        <div class="card-body text-center px-3 py-2 d-flex">
          <div style="width:50px"><h1 class="mb-0"><fa :icon="icon"/></h1></div>
          <div class="pl-2 text-center" style="width: calc(100% - 50px)">
            <h5 class="card-title text-nowrap font-weight-bold mb-0">{{value}}</h5>
            <p class="card-text p-0 text-nowrap"><small v-html="description"></small></p>
          </div>
        </div>
      </div>
</template>
<script>
export default {
  props: {
    icon: {
      required: true,
      type: String
    },
    description: {
      required: true,
      type: String
    },
    value: {
      required: true
    },
    customClass: {
      required: true,
      type: String
    },
  }
}
</script>
