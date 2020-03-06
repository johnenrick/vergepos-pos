<template>
    <div>
      <!-- <div class="bg-warning text-white p-2 mb-3 rounded">
          <fa icon="info-circle" /> It is strongly recommend that you export your data to have a backup incase anything happens .You can either click the <strong><a href="#" @click="exportDatabase"><u>EXPORT</u></a></strong> text or click the <button class="btn btn-sm btn-primary">EXPORT</button> button
      </div> -->
      <div class="pt-2">
        <button @click="exportDatabase" class="btn btn-warning"><fa icon="file-zip-o" /> Backup Data</button><br>
        <small>It is strongly recommended that you <strong><a href="#" @click="exportDatabase"><u>BACK UP</u></a></strong> your data from time to time whenever you're in offline mode incase anything happens. </small>
        </div>
      <div>
        <modal ref="exportOfflineData" :closeable="false">
          <template v-slot:body>
            <div class="text-center" v-if="status">
              Please wait while we are backing up your datas ....
            </div>
            <div v-else>
              <div class="text-center">
                Successfully exported your data. You can copy it to a flash drive or other location for safe keeping.
              </div>
            </div>
          </template>
        </modal>
      </div>
    </div>
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
import Modal from '@/vue-web-core/components/bootstrap/Modal'

export default {
  components: {
    Modal
  },
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
      prepareData: {},
      status: true
    }
  },
  methods: {
    exportDatabase() {
      this.status = true
      this.$refs.exportOfflineData._open()
      setTimeout(() => {
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

                          const data = JSON.stringify(this.prepareData)

                          let blob = new Blob([data], { type: 'text/plain' })
                          let e = document.createEvent('MouseEvents')
                          let a = document.createElement('a')
                          let filename = 'database-backup-' + localStorage.getItem('is_terminal') + '-' + new Date().toUTCString().split(' ').slice(0, 4).join(' ') + '.json'
                          a.download = filename
                          a.href = window.URL.createObjectURL(blob)
                          a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
                          e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
                          a.dispatchEvent(e)
                          this.closeModal()
                          this.status = false
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      }, 5000)
    },
    closeModal(){
      setTimeout(() => {
        this.$refs.exportOfflineData._close()
      }, 1000)
    }
  }
}
</script>
