let activeWisdomeQouteIndex = 0
let wisdomQoutes = [
  'Just because you are earning doesn\'t you are winning',
  'There will always be a cycle in business. Make sure when you are in good times, prepare for the bad times',
  'Great Success is a formula not a luck or coincedence',
  'Success does not happened overnight. It is an accumalation of what we do everyday',
  'You should look profit in percentage not in exact number',
  'VergePOS can help you determine which product sell',
  'You can pay little to no tax by registering as Barangay Micro Business Enterprise at Negosyo Center',
  'No return no exchange policy is illegal as it violates Consumer Right\'s Act',
  'A satisfied customer will recommend you to 2-3 people. An unsatisfied customer will tell thousands of people about their bad experience',
  'It doesn\'t matter if you like number. You have to learn how to read number if you want to succeed in business',
  'A business can be broken in three parts: Product/Service, Administration, Marketing',
  'How you treat your employees is how your employees will treat you customer.',
  'Being able to start a business is a privilege and an accomplishment. Not everyone have the time, opportunity, money, or skills as you do.',
  'Ego is the enemy of leadership',
]
function writeQoutes(qoute, index){
  let text = document.getElementById('wisdomeQoutes').innerHTML
  text = (text.replace(/&nbsp;/gi, '')).replace('"', '') // remove the &nbsp; and the opening qoute
  if(index === 0){
    text = ''
  }
  setTimeout(() => {
    textArray = text.split('')
    textArray[index] = qoute[index]
    text = textArray.join('')
    for(let x = index; x < qoute.length - 1; x++){
      text += '&nbsp;'
    }
    if(index === qoute.length - 1){
      text += '"'
    }else{
      text += '&nbsp;'
    }
    document.getElementById('wisdomeQoutes').innerHTML = '"' + text
    if(index < qoute.length - 1){
      writeQoutes(qoute, ++index)
    }else{
      var style = window.getComputedStyle(document.getElementById('loadingVueAppIndicator'))
      if(style.display !== 'none'){
        setTimeout(() => {
          let min = 0; let max = wisdomQoutes.length - 1
          min = Math.ceil(min)
          max = Math.floor(max)
          let newQouteIndex = Math.floor(Math.random() * (max - min + 1)) + min
          writeQoutes(wisdomQoutes[newQouteIndex], 0)
        }, 5000)
      }
    }
  }, 20)
}
setTimeout(() => {
  writeQoutes(wisdomQoutes[activeWisdomeQouteIndex], 0)
}, 2000)
