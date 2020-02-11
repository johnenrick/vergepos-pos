let elem = document.documentElement
let toggle = () => {
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  }
  if (!window.screenTop && !window.screenY) {
    document.webkitExitFullscreen()
  }
}

export default {
  toggle: toggle
}
