import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isSyncing: false
  },
  mutations: {
    isSynching(state){
      Vue.set(state, 'isSyncing', true)
    },
    isNotSynching(state){
      Vue.set(state, 'isSyncing', false)
    }
  },
  getters: {
    isSyncing: (state) => {
      return state.isSyncing
    },
  },
  actions: {

  }
})
