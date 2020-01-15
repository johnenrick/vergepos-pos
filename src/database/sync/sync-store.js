import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isSynching: null
  },
  mutations: {
    isSynching(state){
      Vue.set(state, 'isSynching', true)
    },
    isNotSynching(state){
      Vue.set(state, 'isSynching', false)
    }
  },
  getters: {
    isSynching: (state) => {
      return state.isSynching
    },
  },
  actions: {

  }
})
