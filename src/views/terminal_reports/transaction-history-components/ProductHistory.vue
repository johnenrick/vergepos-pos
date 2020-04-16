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
            callback: (value) => {
              return this.padNumber(value, 7)
            }
          },
          {
            name: 'dateAndTime',
            title: 'Date And Time',
            callback: (value) => {
              return this.formatDate(value, 'mm/dd/yy hh:mm')
            }
          },
          {
            name: 'transactionProd.description',
            title: 'Description'
          },
          {
            name: 'transactionProd.price',
            title: 'Price',
            dataClass: 'text-right',
            callback: (value) => {
              return (this.numberToMoney(value))
            }
          },
          {
            name: 'profit',
            title: 'Profit',
            dataClass: 'text-right',
            callback: (value) => {
              return (this.numberToMoney(value))
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
          this.transactions.push({
            transactionProd: element,
            number: elem['number'],
            dateAndTime: elem['created_at'],
            profit: (element['vat_sales'] * 1) + (element['vat_exempt_sales'] * 1) + (element['vat_amount'] * 1) - (element['cost'] * 1) - (element['discount_amount'] * 1)
          })
        })
      })
    }
  }
}
</script>
