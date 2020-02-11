let isFullscreen = false
let toggle = (isFull = null) => {
  if(isFull === null){
    isFullscreen = !isFullscreen
  }else if(isFull === true){
    isFullscreen = true
  }else if(isFull === 'default'){
    isFullscreen = false
  }
  return isFullscreen
}
export default {
  toggle: toggle
}