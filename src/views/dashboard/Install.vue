<template>
  <div v-if="canInstall" class="border bg-white rounded p-2 px-3">
    Add VergePOS to your Homescreen for easy access
    <div class="text-center pt-2">
      <button  @click="tryInstall" class="btn btn-success mr-2"><fa icon='desktop' /> Add to Home Screen</button>
    </div>
  </div>
</template>
<script>
import PWAInstall from '@/vue-web-core/helper/pwa-install-store'

export default {
  mounted(){
    window.addEventListener('appinstalled', (evt) => {
      console.log('INSTALL: Success')
      location.reload()
    })
  },
  data(){
    return {
    }
  },
  methods: {
    tryInstall(){
      PWAInstall.commit('install', (hasInstalled) => {
      })
    },
    test(){
      console.log('PWAInstall.state.deferredPrompt', PWAInstall.state.deferredPrompt)
    }
  },
  computed: {
    canInstall(){
      return PWAInstall.state.deferredPrompt
    }
  }
}
</script>
