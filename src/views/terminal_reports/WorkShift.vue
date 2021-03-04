<template>
  <div class="p-3">
    <div class="p-3 bg-white shadow-sm">
      <h2 class="mb-3 font-weight-bold">Work Shift History</h2>
      <div >
        <select v-model="cashierFilter" @change="getWorkShift" :disabled="isLoading" class="form-control mb-3">
          <option value="null">Any Cashier</option>
          <template v-for="cashier in cashierList">
            <option :value="cashier['db_id']">{{cashier['first_name']}} {{cashier['last_name']}}</option>
          </template>
        </select>
      </div>
      <div class="table-responsive">
        <vuetable
          ref="vuetable"
          :track-by="'id'"
          :data="workShifts"
          :api-mode="false"
          :data-total="2"
          :fields="tableSetting.columns"
          class="w-100"
        >
          <template slot="actions" slot-scope="props">
            <button v-if="props.rowData['id'] && props.rowData['end_datetime'] " @click="viewDetails(props.rowData['id'], props.rowData)" class="btn btn-sm btn-info"><fa icon="search" /></button>
          </template>
        </vuetable>
        <div><Loading v-if="isLoading" /></div>
      </div>
      <div v-if="workShifts.length">
        Note:
        <ul>
          <li>
            In <strong>Duration</strong>, the <i>H</i> means hours and <i>M</i> means minutes
          </li>
          <li>
            <strong>Beginning Balance</strong> includes the cash in and cash out during the shift
          </li>
          <li>Numbers enclosed with parenthesis <strong>"("</strong> and <strong>")"</strong> are negative numbers. Example: <strong>-</strong>9 is written as <strong>(</strong>9<strong>)</strong></li>
        </ul>
      </div>
    </div>

    <WorkShiftDetail ref="workShiftDetail" />
  </div>
</template>
<script>
import Vuetable from 'vuetable-2/src/components/Vuetable' // https://ratiw.github.io/vuetable-2/#/Special-Fields?id=-__slotltnamegt
import WorkShift from '@/database/controller/work-shift'
import User from '@/database/controller/user'
import WorkShiftHelper from '@/views/pos/pos-components/work-shift-components/work-shift-helper'
import WorkShiftDetail from './work-shift-components/WorkShiftDetail'
export default {
  components: {
    Vuetable,
    WorkShiftDetail
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      cashierFilter: 'null',
      cashierList: [],
      workShifts: [],
      isLoading: false,
      tableSetting: {
        columns: [{
          name: 'cashier',
          titleClass: 'text-center',
          dataClass: 'text-center'
        }, {
          name: 'created_at',
          title: 'Time Open',
          titleClass: 'text-center',
          dataClass: 'text-center text-nowrap',
          callback: (value) => {
            return value ? this.formatDate(value, 'mm/dd/yy hh:mm') : ''
          }
        }, {
          name: 'end_datetime',
          title: 'Time Closed',
          titleClass: 'text-center',
          dataClass: 'text-center text-nowrap',
          callback: (value) => {
            return value ? this.formatDate(value, 'mm/dd/yy hh:mm') : '<span class="font-weight-bold text-success text-uppercase">Still Open</span>'
          }
        }, {
          name: 'duration',
          titleClass: 'text-center',
          dataClass: 'text-center text-nowrap'
        }, {
          name: 'total_beginning_balance',
          title: 'Beg. Balance',
          titleClass: 'text-nowrap',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'total_closing_balance',
          title: 'Closing Balance',
          titleClass: 'text-center text-nowrap',
          dataClass: 'text-right',
          callback: (value) => {
            return this.numberToMoney(value)
          }
        }, {
          name: 'discrepancy',
          titleClass: 'text-center',
          dataClass: 'text-right',
          callback: (value) => {
            let badge = 'success'
            if(value < 0){
              badge = 'danger'
            }else if(value > 0){
              badge = 'warning'
            }
            return '<span class="font-weight-bold text-' + badge + '">' + this.numberToMoney(value) + '</span>'
          }
        }, {
          name: '__slot:actions',
          title: 'Action',
          titleClass: 'text-center',
          dataClass: 'text-center'
        }]
      }
    }
  },
  methods: {
    init(){
      this.getCashierList()
      this.getWorkShift()
    },
    viewDetails(workShiftId, workShiftDetails){
      this.$refs.workShiftDetail._open(workShiftId, workShiftDetails)
    },
    getWorkShift(){
      this.isLoading = true
      const workShiftDB = new WorkShift()
      console.log('cashierFilter', this.cashierFilter)
      let param = {
        with: {
          users: {
            is_parent: true,
            use_db_id: true
          },
          work_shift_cash_readings: {}
        },
        order: {
          by: 'created_at',
          type: 'desc'
        },
        limit: 100
      }
      if(this.cashierFilter !== 'null'){
        param['where'] = {
          user_id: this.cashierFilter
        }
      }
      workShiftDB.get(param).then(result => {
        this.workShifts = result.map(workShift => {
          workShift['discrepancy'] = 0
          workShift['total_beginning_balance'] = 0
          workShift['total_closing_balance'] = 0
          workShift['work_shift_cash_readings'].forEach(workShiftCashReading => {
            switch(parseInt(workShiftCashReading['type'])){
              case 1: // beginning
                workShift['total_beginning_balance'] += WorkShiftHelper.calculateTotalBillAmount(workShiftCashReading)
                break
              case 2: // cash in
                workShift['total_beginning_balance'] += WorkShiftHelper.calculateTotalBillAmount(workShiftCashReading)
                break
              case 3: // cash out
                workShift['total_beginning_balance'] -= WorkShiftHelper.calculateTotalBillAmount(workShiftCashReading)
                break
              case 4: // closing
                workShift['total_closing_balance'] += WorkShiftHelper.calculateTotalBillAmount(workShiftCashReading)
                workShift['discrepancy'] += workShiftCashReading['discrepancy']
                break
            }
          })
          const hours = 3600000 // 1 hour
          const timeDifference = (workShift['end_datetime'] ? new Date(workShift['end_datetime']) : new Date()) - new Date(workShift['created_at'])
          const durationHour = timeDifference / hours
          workShift['duration'] = parseInt(this.padNumber(durationHour)) + 'H ' + parseInt((timeDifference % hours) / 60000) + 'M'
          workShift['cashier'] = typeof workShift['users'] !== 'undefined' ? workShift['users']['last_name'] + ', ' + (workShift['users']['first_name'])[0] + '.' : 'Unknown Cashier #' + workShift['user_id']
          // workShift['total_beginning_balance'] = WorkShiftHelper.calculateTotalBillAmount(this.$refs.cashReading._getFormData())
          return workShift
        })
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    },
    getCashierList(){
      const userDB = new User()
      const param = {
        where: {
          is_cashier: 1
        },
        order: {
          by: 'first_name',
          type: 'desc'
        },
      }
      userDB.get(param).then(result => {
        console.log(result)
        this.cashierList = result
      })
    }
  }
}
</script>
