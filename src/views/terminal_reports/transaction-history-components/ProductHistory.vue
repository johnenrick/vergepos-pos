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
            name: 'dateAndTime',
            title: 'Date And Time',
            callback: (value) => {
              return this.formatDate(value, 'mm/dd/yy hh:mm')
            }
          },
          {
            name: 'number',
            title: 'Transaction Number',
            callback: (value) => {
              return this.padNumber(value, 7)
            }
          },
          {
            name: 'transactionProd.description',
            title: 'Description'
          },
          {
            name: 'transactionProd.price',
            title: 'Price'
          },
          {
            name: 'profit',
            title: 'Profit',
          }
        ]
      }
    }
  },
  methods: {
    getData(data){
      data.forEach(elem => {
        elem['transaction_products'].forEach(element => {
          this.transactions.push({
            transactionProd: element,
            number: elem['number'],
            dateAndTime: elem['transaction_number_created_at'],
            profit: (element['price'] * 1) - (element['cost'] * 1)
          })
        })
      })
    }
  }
}
</script>
