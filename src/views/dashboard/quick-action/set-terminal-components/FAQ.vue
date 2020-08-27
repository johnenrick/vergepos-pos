<template>
  <div>
    <HowTo :howToList="howToList" />
  </div>
</template>
<script>
import HowTo from '@/components/HowTo'
export default {
  components: {
    HowTo
  },
  data(){
    return {
      howToList: [{
        description: 'How to find Serial Number in Android (Tablet or Phone)',
        steps: [
          'Go to <strong>Settings</strong>',
          'Go to <strong>About Tablet</strong> or <strong>About Phone</strong> if you are using a phone. This is usually at the bottom',
          'Go to <strong>Status</strong>',
          'Then look for the <em>Serial Number</em>',
        ]
      }, {
        description: 'How to find Serial Number in Windows(Laptop or Desktop)',
        steps: [
          'Open <strong>Command Prompt</strong>. You can do this by clicking the windows key, then type <em>Command Prompt</em>',
          'Copy and paste the following code to the Command Prompt. <div class="text-center font-italic font-weight-bold">wmic bios get serialnumber</div>'
        ]
      }, {
        description: 'What if my device do not have a Serial Number?',
        text: 'All device have serial number but there are very rare instances that you will not be able to see it',
        steps: [
          'Try checking on the device\'s package. It is usually denoted as <strong>S/N</strong>',
          'If it is not in the package, you can use your own inventory number',
          'If you do not manage your business inventory, you can try naming it. When naming it, make sure it is very unique to other terminal devices. Two devices having the same name could cause problem in your data. <div>Example names: Tablet-01, Tablet-02, Laptop-01, Laptop-02</div>'
        ]
      }]
    }
  }
}
</script>
