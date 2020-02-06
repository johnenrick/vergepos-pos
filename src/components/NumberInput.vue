<template>
  <div>
    <input ref="input" type="number" @keyup="doneTyping" v-model="inputValue" @touchend="touched" @click="inputValue = ''" @blur="validateInput" class="form-control text-right">
  </div>
</template>
<script>
export default {
  props: {
    defaultValue: {
      type: Number,
      default: 0
    },
    maxValue: Number,
    isDecimal: {
      type: Boolean,
      default: false
    },
    currentValue: Number
  },
  data(){
    return {
      inputValue: this.defaultValue,
      delayID: null // set timeout ID
    }
  },
  methods: {
    validateInput(){
      if(typeof this.maxValue !== 'undefined' && this.inputValue > this.maxValue){
        this.inputValue = this.maxValue
      }else if(this.inputValue === '' || isNaN(this.inputValue * 1)){
        this.inputValue = 0
      }
      if(this.isDecimal){
        this.inputValue = (this.inputValue * 1).toFixed(2)
      }
    },
    touched(){
    },
    doneTyping(e){
      if(e.code === 'Enter'){
        this.$refs.input.blur()
        this.$emit('')
      }
    }
  },
  watch: {
    currentValue(newData){ // used to reset the value
      if(newData * 1 !== this.inputValue * 1){
        this.inputValue = newData
      }
    },
    inputValue(newData){
      let formatedValue
      clearTimeout(this.delayID)
      if(!isNaN(formatedValue = newData * 1)){
        this.delayID = setTimeout(() => {
          if(typeof this.maxValue !== 'undefined' && this.inputValue > this.maxValue){
            this.inputValue = this.maxValue
          }
          this.$emit('change', formatedValue)
        }, 280)
      }
    }
  }
}
</script>
