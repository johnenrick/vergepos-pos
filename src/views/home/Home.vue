<template>
  <div class="home px-3">

    <div class="row">
      <div class="col-sm-12 col-md-5 col-lg-8 pt-3">
        <div v-if="isTerminal">
          <div   class="">
            <fa icon="desktop" />
            Terminal:
            <big
              class="c-pointer text-primary text-uppercase font-weight-bold"
            >
              {{terminalDetails['description']}} <small>{{terminalDetails['serial_number']}}</small>
            </big>
          </div>
          <small><fa icon="info-circle" /> This device is currently used as terminal</small>
        </div>
        <div class="d-none d-md-block pt-4">
          <div class="text-center mt-4">
            <HomePicture style="min-width: 200px; max-width: 300px; width:30%;" />
          </div>
          <div ref="qoute" class="pt-1 mx-auto" style="max-width: 500px">
            "Reach your new limit with VergePOS!""
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-7 col-lg-4 ml-auto py-3">
        <LogInForm />
      </div>
    </div>
    <!-- <button @click="checkIfOnline">Test</button> -->
  </div>
</template>
<script>
// import store from '@/system/store'
import LogInForm from './LogInForm'
import HomePicture from '@/assets/undraw/home.svg'
import WisdomQoutes from './wisdom-qoutes'
export default {
  components: {
    LogInForm,
    HomePicture
  },
  mounted(){
    setTimeout(() => {
      let min = 0; let max = WisdomQoutes.wisdomQoutes.length - 1
      min = Math.ceil(min)
      max = Math.floor(max)
      const activeWisdomeQouteIndex = Math.floor(Math.random() * (max - min + 1)) + min
      WisdomQoutes.writeQoutes(WisdomQoutes.wisdomQoutes[activeWisdomeQouteIndex], 0, $(this.$refs.qoute)[0])
    }, 700)
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      terminalDetails: JSON.parse(localStorage.getItem('terminal_details')),
    }
  }
}
</script>
