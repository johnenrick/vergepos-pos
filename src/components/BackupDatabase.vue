<template>
    <button @click="exportDatabase" class="btn btn-primary">Export</button>
</template>

<script>
import Category from '@/database/controller/category.js'
import Customer from '@/database/controller/customer.js'
import Discount from '@/database/controller/discount.js'
import Product from '@/database/controller/product.js'
import TransactionNumber from '@/database/controller/transaction-number.js'
import TransactionProduct from '@/database/controller/transaction-product.js'
import TransactionVoid from '@/database/controller/transaction-void.js'
import Transaction from '@/database/controller/transaction.js'
import User from '@/database/controller/user.js'

export default {
  data() {
    return {
      categoryDB: new Category(),
      customerDB: new Customer(),
      discountDB: new Discount(),
      productDB: new Product(),
      transactionNumberDB: new TransactionNumber(),
      transactionProductDB: new TransactionProduct(),
      transactionVoidDB: new TransactionVoid(),
      transactionDB: new Transaction(),
      userDB: new User(),
      prepareData: {}
    }
  },
  methods: {
    exportDatabase() {
      this.prepareData = {
        categories: [],
        customers: [],
        discounts: [],
        products: [],
        transactionNumbers: [],
        transactionProducts: [],
        transactionVoids: [],
        transactions: [],
        users: []
      }
      this.categoryDB.get().then((results) => {
        this.prepareData.categories.push(results)

        this.customerDB.get().then((results) => {
          this.prepareData.customers.push(results)

          this.discountDB.get().then((results) => {
            this.prepareData.discounts.push(results)

            this.productDB.get().then((results) => {
              this.prepareData.products.push(results)

              this.transactionNumberDB.get().then((results) => {
                this.prepareData.transactionNumbers.push(results)

                this.transactionProductDB.get().then((results) => {
                  this.prepareData.transactionProducts.push(results)

                  this.transactionVoidDB.get().then((results) => {
                    this.prepareData.transactionVoids.push(results)

                    this.transactionDB.get().then((results) => {
                      this.prepareData.transactions.push(results)

                      this.userDB.get().then((results) => {
                        this.prepareData.users.push(results)

                        console.log(this.prepareData)

                        const data = JSON.stringify(this.prepareData)
                        console.log('EXPORT', data)

                        let blob = new Blob([data], { type: 'text/plain' })
                        let e = document.createEvent('MouseEvents')

                        let a = document.createElement('a')
                        a.download = 'database-backup.json'
                        a.href = window.URL.createObjectURL(blob)
                        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
                        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                        a.dispatchEvent(e)
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    }
  }
}
</script>
