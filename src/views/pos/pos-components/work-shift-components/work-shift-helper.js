export default {
  calculateTotalBillAmount: (bills) => {
    let total = 0
    if(typeof bills['bill_1_cent'] !== 'undefined'){
      total += (bills['bill_1_cent'] * 0.01)
    }
    if(typeof bills['bill_5_cent'] !== 'undefined'){
      total += (bills['bill_5_cent'] * 0.05)
    }
    if(typeof bills['bill_10_cent'] !== 'undefined'){
      total += (bills['bill_10_cent'] * 0.10)
    }
    if(typeof bills['bill_25_cent'] !== 'undefined'){
      total += (bills['bill_25_cent'] * 0.25)
    }
    if(typeof bills['bill_1_peso'] !== 'undefined'){
      total += (bills['bill_1_peso'] * 1)
    }
    if(typeof bills['bill_5_peso'] !== 'undefined'){
      total += (bills['bill_5_peso'] * 5)
    }
    if(typeof bills['bill_10_peso'] !== 'undefined'){
      total += (bills['bill_10_peso'] * 10)
    }
    if(typeof bills['bill_20_peso'] !== 'undefined'){
      total += (bills['bill_20_peso'] * 20)
    }
    if(typeof bills['bill_50_peso'] !== 'undefined'){
      total += (bills['bill_50_peso'] * 50)
    }
    if(typeof bills['bill_100_peso'] !== 'undefined'){
      total += (bills['bill_100_peso'] * 100)
    }
    if(typeof bills['bill_200_peso'] !== 'undefined'){
      total += (bills['bill_200_peso'] * 200)
    }
    if(typeof bills['bill_500_peso'] !== 'undefined'){
      total += (bills['bill_500_peso'] * 500)
    }
    if(typeof bills['bill_1000_peso'] !== 'undefined'){
      total += (bills['bill_1000_peso'] * 1000)
    }
    return total
  }
}
