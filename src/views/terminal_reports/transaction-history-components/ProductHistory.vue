<template>
  <div>
    <vuetable
      :api-mode="false"
      :data-total="2"
      :data="transactions"
      :fields="tableSetting.columns"
    />
  </div>
</template>
<script>
import Vuetable from 'vuetable-2/src/components/Vuetable'
export default {
  components: {
    Vuetable
  },
  data(){
    return{
      transactions: [],
      start: Date,
      end: Date,
      tableSetting: {
        columns: [
          {
            name: 'number',
            title: 'Transaction Number',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return this.padNumber(value, 7)
            }
          }, {
            name: 'dateAndTime',
            title: 'Date And Time',
            titleClass: 'text-center',
            dataClass: 'text-center',
            callback: (value) => {
              return this.formatDate(value, 'mm/dd/yy hh:mm')
            }
          }, {
            name: 'transactionProd.description',
            title: 'Description',
            titleClass: 'text-center',
            dataClass: 'text-justify',
          }, {
            name: 'price',
            title: 'Price',
            titleClass: 'text-center',
            dataClass: 'text-right',
            callback: (value) => {
              return this.numberToMoney(value)
            }
          }, {
            name: 'cost',
            title: 'Cost',
            titleClass: 'text-center',
            dataClass: 'text-right',
            callback: (value) => {
              return this.numberToMoney(value)
            }
          }, {
            name: 'amount',
            title: 'Amount',
            titleClass: 'text-center',
            dataClass: 'text-right',
            callback: (value) => {
              return this.numberToMoney(value)
            }
          }, {
            name: 'discount_amount',
            title: 'Discount',
            titleClass: 'text-center',
            dataClass: 'text-right',
            callback: (value) => {
              return this.numberToMoney(value)
            }
          }, {
            name: 'profit',
            title: 'Profit',
            titleClass: 'text-center',
            dataClass: 'text-right',
            callback: (value) => {
              if(value * 1 > 0){
                return (this.numberToMoney(value))
              }else{
                return '(' + (this.numberToMoney(value * -1)) + ')'
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    _getData(data){ // Use proper naming, and add underscore prefix if the method is exposed
      data.forEach(elem => {
        elem['transaction_products'].forEach(element => {
          const negativeMultiplier = elem['operation'] === 2 ? -1 : 1
          const amount = (element['vat_sales'] * 1) + (element['vat_exempt_sales'] * 1) + (element['vat_zero_rated_sales'] * 1) + (element['vat_amount'] * 1) - element['discount_amount'] * 1
          this.transactions.push({
            transactionProd: element,
            number: elem['number'],
            price: element['price'] * negativeMultiplier,
            cost: element['cost'],
            amount: amount * negativeMultiplier,
            quantity: element['quantity'] * negativeMultiplier,
            discount_amount: element['discount_amount'] * negativeMultiplier,
            dateAndTime: elem['created_at'],
            profit: (amount - (element['cost'] * element['quantity'])) * negativeMultiplier
          })
        })
      })
    },
    _reset(){
      this.transactions = []
    }
  }
}
</script>
