<template>
  <div>
    Frequently Asked Questions (FAQs):
    <ul class="mb-0">
      <template v-for="(howTo, index) in howToList">
        <li>{{howTo['description']}} <a @click="learn(index)" class="text-info c-pointer">[learn]</a></li>
      </template>
    </ul>
    <modal ref='modal' size="lg" :closeable="true">
      <div slot="body" v-if="activeHowToIndex !== null && howToList.length">
        <h5>{{howToList[activeHowToIndex]['description']}}</h5>
        <div v-if="typeof howToList[activeHowToIndex]['videoLink'] !== 'undefined'" class="mb-2">
          <youtube  :video-id="getVideoId(howToList[activeHowToIndex]['videoLink'])" player-width="100%"/>
        </div>
        <ol v-if="howToList[activeHowToIndex]['steps'] && howToList[activeHowToIndex]['steps'].length">
          <template v-for="step in howToList[activeHowToIndex]['steps']">
            <li v-html="step"></li>
          </template>
        </ol>
      </div>
    </modal>
  </div>
</template>
<script>
import Vue from 'vue'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import VueYouTubeEmbed, { getIdFromURL } from 'vue-youtube-embed'
Vue.use(VueYouTubeEmbed)
export default {
  components: {
    Modal,
  },
  props: {
    howToList: Array,
  },
  data(){
    return {
      activeHowToIndex: null
    }
  },
  methods: {
    learn(howToIndex){
      this.activeHowToIndex = howToIndex
      this.$refs.modal._open()
    },
    getVideoId(url){
      return getIdFromURL(url)
    }
  }
}
</script>
