import Sync from '../core/sync.js'
import WorkShift from '@/database/controller/work-shift.js'
import DatetimeHelper from '@/vue-web-core/helper/mixin/datetime'
let us = require('underscore')
export default class WorkShiftSync extends Sync {
  async downSync(){
    let workShiftDB = new WorkShift()
    let query = {
      limit: 1,
      where: {
        db_id: {
          '>': 0
        }
      },
      order: {
        by: 'updated_at',
        type: 'desc'
      }
    }
    return new Promise((resolve, reject) => {
      workShiftDB.get(query).then(response => {
        let latestDate = null
        if(response.length){
          latestDate = DatetimeHelper.serverDatetimeFormat(response[0]['updated_at'], true)
        }
        this.download(latestDate).then(result => {
          resolve(result)
        })
      })
    })
  }
  async download(latestDate){
    let param = {
      select: {
        0: 'end_datetime',
        1: 'close_overidden',
        2: 'user_id',
        5: 'updated_at',
        6: 'deleted_at',
        7: 'created_at',
        8: 'closed_by_user_id',
        work_shift_cash_readings: {
          select: [
            'work_shift_id',
            'type',
            'approved_by_user_id',
            'bill_1_cent',
            'bill_5_cent',
            'bill_10_cent',
            'bill_25_cent',
            'bill_1_peso',
            'bill_5_peso',
            'bill_10_peso',
            'bill_20_peso',
            'bill_50_peso',
            'bill_100_peso',
            'bill_200_peso',
            'bill_500_peso',
            'bill_1000_peso',
            'discrepancy',
            'other_payments',
            'remarks',
          ]
        }
      },
      condition: [{
        column: 'store_terminal_id',
        value: localStorage.getItem('is_terminal')
      }],
      with_trash: true,
      sort: [{
        column: 'updated_at',
        order: 'asc'
      }]
    }
    if(latestDate){
      param['condition'].push({
        column: 'updated_at',
        clause: '>',
        value: latestDate // already a server time
      })
    }
    return new Promise((resolve, reject) => {
      this.retrieveAPIData('work-shift/retrieve', param).then(response => {
        if (response['data'].length) {
          this.updateWorkShifts(response['data']).finally(() => {
            resolve(1)
          })
        }else{
          resolve(1)
        }
      }).catch((error, status) => {
        console.log('failed to sync', error, status)
        resolve(1)
      })
    })
  }
  updateWorkShifts(updatedWorkShifts){
    return new Promise((resolve, reject) => {
      let workShiftDB = new WorkShift()
      let counter = 0
      const maxCount = updatedWorkShifts.length
      let dbIdList = us.pluck(updatedWorkShifts, 'id')
      dbIdList = dbIdList.map(value => value * 1)
      console.log('dbIdList', dbIdList)
      let idbParam = {
        where: {
          db_id: {
            in: dbIdList
          }
        }
      }
      workShiftDB.get(idbParam).then((result) => {
        let workShifts = us.groupBy(result, 'db_id') // group by db_id, expect the result of each object is a select element array
        console.log('updatedWorkShifts', updatedWorkShifts, result, idbParam)
        for (let x in updatedWorkShifts) {
          let workShiftData = {
            db_id: updatedWorkShifts[x]['id'] * 1,
            user_id: updatedWorkShifts[x]['user_id'] * 1,
            closed_by_user_id: updatedWorkShifts[x]['closed_by_user_id'] ? updatedWorkShifts[x]['closed_by_user_id'] * 1 : 0,
            end_datetime: (new Date(updatedWorkShifts[x]['end_datetime'])).getTime() + 28800000,
            close_overidden: updatedWorkShifts[x]['close_overidden'] * 1,
            created_at: (new Date(updatedWorkShifts[x]['created_at'])).getTime() + 28800000, // +8 hours
            deleted_at: updatedWorkShifts[x]['deleted_at'] ? (new Date(updatedWorkShifts[x]['deleted_at'])).getTime() + 28800000 : 0, // +8 hours
            updated_at: (new Date(updatedWorkShifts[x]['updated_at'])).getTime() + 28800000, // +8 hours
          }
          let iDBWorkShift = typeof workShifts[updatedWorkShifts[x]['id']] !== 'undefined' ? workShifts[updatedWorkShifts[x]['id']][0] : null
          if (iDBWorkShift && updatedWorkShifts[x]['deleted_at']) {
            workShiftDB.delete(iDBWorkShift['id']).finally(() => {
              counter++
            })
          } else if (iDBWorkShift) {
            workShiftData['id'] = iDBWorkShift['id']
            workShiftDB.update(workShiftData).finally(() => {
              counter++
            })
          } else if (!iDBWorkShift && !updatedWorkShifts[x]['deleted_at']) {
            if(typeof updatedWorkShifts[x]['work_shift_cash_readings'] !== 'undefined' && updatedWorkShifts[x]['work_shift_cash_readings']){
              workShiftData['work_shift_cash_readings'] = updatedWorkShifts[x]['work_shift_cash_readings']
            }
            console.log('updatedWorkShifts', updatedWorkShifts)
            workShiftDB.add(workShiftData).finally(() => {
              counter++
            })
          }else{
            counter++
          }
        }
      })
      let interval = setInterval(() => {
        if(counter === maxCount){
          resolve(1)
          clearInterval(interval)
        }
      }, 100)
    })
  }
}
