<template>
  <modal ref="modal" :closeable="false">
    <template v-slot:body >
      <div class="text-center mt-2">
        <MoveCash @toggle-move-cash="openMoveCash = $event" />
      </div>
      <OngoingSession v-if="!openMoveCash" :session-status="SESSIONRUNNINGSESSIONSTATUS" @cancel="cancel" class="mt-4"/>
    </template>
  </modal>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import MoveCash from './close-shift-components/MoveCash'
import OngoingSession from '../pos-components/work-shift-components/OngoingSession'
import {
  SESSIONRUNNINGSESSIONSTATUS
} from '@/constants/workshift'

export default {
  components: {
    Modal,
    OngoingSession,
    MoveCash
  },
  data(){
    return {
      openMoveCash: false,
      SESSIONRUNNINGSESSIONSTATUS: SESSIONRUNNINGSESSIONSTATUS
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
    },
    cancel(){
      this.$refs.modal._close()
    }
  }
}
</script>
