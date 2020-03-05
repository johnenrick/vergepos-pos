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
            name: 'created_at',
            title: 'Date And Time',
            callback: (value) => {
              return this.formatDate(value, 'mm/dd/yy hh:mm')
            }
          },
          {
            name: 'transaction_id',
            title: 'Transaction Number',
            callback: (value) => {
              return this.padNumber(value, 7)
            }
          },
          {
            name: 'description',
            title: 'Description'
          },
          {
            name: 'price',
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
      console.log(data)
    }
  }
}
</script>
