let isFullscreen = false
let elem = document.documentElement
let toggle = (isFull = null) => {
  if(isFull === null){
    isFullscreen = !isFullscreen
  }else if(isFull === true){
    isFullscreen = true
  }else if(isFull === 'default'){
    isFullscreen = false
  }
  if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  }
  if (!window.screenTop && !window.screenY) {
    document.webkitExitFullscreen()
  }
  console.log(elem)
  console.log(document)
  return isFullscreen
}
export default {
  toggle: toggle
}
