// declare store
import Vuex from 'vuex'
let screenStateStore = new Vuex.Store({
  state: {
    isFullscreen: false
  },
  getters: {
    isFullscreen: (state) => {
      return state.isFullscreen
    }
  },
  mutations: {
    toggleFullscreen(state){
      state.isFullscreen = !state.isFullscreen
    },
    setFullscreenToTrue(state){
      state.isFullscreen = true
    },
    setFullscreenToFalse(state){
      state.isFullscreen = false
    }
  }
})
window.addEventListener('resize', function(){
  if(window.innerHeight < screen.height){
    screenStateStore.commit('setFullscreenToFalse')
  } else{
    screenStateStore.commit('setFullscreenToTrue')
  }
})
let elem = document.documentElement
let toggle = (isFull = null) => {
  if(isFull === null){
    screenStateStore.commit('toggleFullscreen')
  }else if(isFull === true){
    screenStateStore.commit('setFullscreenToTrue')
  }else if(isFull === 'default'){
    screenStateStore.commit('setFullscreentoFalse')
  }
  if (screenStateStore.getters.isFullscreen === true) {
    elem.webkitRequestFullscreen()
  } else if(screenStateStore.getters.isFullscreen === false){
    document.webkitExitFullscreen()
  }
  return screenStateStore.getters.isFullscreen
}

export default {
  toggle: toggle,
  store: screenStateStore
}
