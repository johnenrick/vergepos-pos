<template>
  <div>
    <modal ref="modal" @close="isBarcodeActive = false" title="Batch Input" icon="clipboard" size="lg">
      <template v-slot:body>
        <div ref="isVisible" class="text-info mb-2">
          <small class="bg-info text-white p-1 rounded">
            <fa icon="info-circle" /> You need a Barcode Scanner for this feature
          </small>
        </div>
        <p>This feature allows you to enter product quantity by scanning a barcode. You can also use <strong>Storage Mode</strong> Feature in your Barcode Scanner. </p>
        <div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Product</th>
                  <th>Quantity(IN)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(product, index) in productList">
                  <tr>
                    <td>{{product['barcode']}}</td>
                    <template v-if="product['barcode_error']">
                      <td class="text-danger">
                        <fa icon="exclamation-circle" /> {{product['barcode_error']}}
                      </td>
                      <td></td>
                    </template>
                    <template v-else>
                      <td>{{product['description']}}</td>
                      <td class="text-right">
                          <span v-if="!editMode">{{productList[index]['quantity_to_add']}}</span>
                          <input v-else v-model="productList[index]['quantity_to_add']" class="form-control " type="number" maxlength="8" />
                      </td>
                    </template>
                    <td>
                      <button class="btn btn-sm btn-outline-danger"><fa icon="trash" /></button>
                    </td>
                  </tr>
                </template>
                <tr v-if="!productList.length">
                  <td colspan="3" class="text-center py-1">
                    <h3 class="mb-1"><fa icon="barcode" /> <fa icon="barcode" /> <fa icon="barcode" /></h3>
                    Scan a Barcode or use Storage Mode (Data Upload)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {{scannedBarcodePendingList.length}}
          <div v-if="productList.length && !scannedBarcodePendingList.length">
            <label>Remarks</label>
            <textarea placeholder="Remarks" class="form-control"></textarea>
          </div>
          <span v-if="isProcessingPendingBarcode">Uploading Barcode. Please wait <fa icon="circle-notch" spin /></span>
          <span v-else-if="isMatchingBarcode">Scanning <fa icon="circle-notch" spin /></span>
          <div v-else-if="productList.length" class="text-right">
            <button  @click="saveAll" class="btn btn-success">Save Adjustments</button>
          </div>
          <div v-else>

          </div>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import Vue from 'vue'
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import Product from '@/database/controller/product'
import InventoryAdjustment from '@/database/controller/inventory-adjustment'
export default {
  components: {
    Modal,
    // CommonForm
  },
  mounted(){
    console.log('mounted')
    window.addEventListener('keypress', this.readBarcodeScanner)
  },
  destroyed(){
    console.log('destroy')
    window.removeEventListener('keypress', this.readBarcodeScanner)
  },
  data(){
    return {
      barcodeScannerValue: '',
      scannerTimer: new Date(),
      productBarcodeLookUp: {},
      productList: [],
      productDB: new Product(),
      inventoryAdjustmentDB: new InventoryAdjustment(),
      isBarcodeActive: false,
      batchUploadTimeout: null,
      scannedBarcodePendingList: [],
      isMatchingBarcode: false,
      isProcessingPendingBarcode: false,
      editMode: false,
      isSaving: false
    }
  },
  methods: {
    _open(){
      this.$refs.modal._open()
      this.isLoading = false
      this.isBarcodeActive = true
    },
    addIncrementProductQuantity(productBarcode){
      if(typeof this.productBarcodeLookUp[productBarcode] !== 'undefined'){
        const productIndex = this.productBarcodeLookUp[productBarcode]
        Vue.set(this.productList[productIndex], 'quantity_to_add', this.productList[productIndex]['quantity_to_add'] + 1)
      }else{
        this.isMatchingBarcode = true
        const param = {
          where: {
            barcode: productBarcode
          }
        }
        this.productDB.get(param).then(result => {
          if(result.length === 0){ // no barcode matched
            this.productList.push({
              barcode: productBarcode,
              barcode_error: 'Product not found!',
              quantity_to_add: 0
            })
          }else if(result.length === 1){
            result[0]['quantity_to_add'] = 1
            result[0]['barcode_error'] = null
            this.productList.push(result[0])
          }else{ // barcode matched with more than two products
            let productNames = ''
            result.forEach((product, index) => {
              productNames += (product['description'])
              if(index < result.length - 1){
                productNames += ', '
              }
            })
            this.productList.push({
              barcode: productBarcode,
              barcode_error: 'Multiple products matched: (' + productNames + ')',
              quantity_to_add: 0
            })
          }
          this.productBarcodeLookUp[productBarcode] = this.productList.length - 1
          this.isMatchingBarcode = false
        })
      }
    },
    saveAll(productListIndex = 0){
      this.isSaving = true
      let product = this.productList[productListIndex]
      const newAdjustment = {
        product_id: product['id'],
        type: type * 1,
        quantity: quantity * 1,
        remarks: this.remarks
      }
      this.save(newAdjustment).finally(() => {
        if(productListIndex !== this.productList.length - 1){
          this.saveAll(++productListIndex)
        }else{
          this.isSaving = false
        }
      })
      // this.productList
    },
    proccessBarcodePendingList(){
      this.isProcessingPendingBarcode = true
      while(this.scannedBarcodePendingList.length){
        const barcode = this.scannedBarcodePendingList.shift()
        this.addIncrementProductQuantity(barcode)
      }
      this.isProcessingPendingBarcode = false
    },
    save(newAdjustment){
      this.isLoading = true
      return this.inventoryAdjustmentDB.add(newAdjustment)
    },
    readBarcodeScanner(e){
      if(!this.isBarcodeActive){
        return false
      }
      if(e.code.indexOf('Digit') > -1){ // character pressed from scanner is Digit, if pressed from keyboard it is Key
        const currentTime = new Date()
        if((currentTime - this.scannerTimer) > 100){ // making sure that it belongs to one barcode
          this.barcodeScannerValue = ''
        }
        this.scannerTimer = currentTime
        this.barcodeScannerValue += e.key
      }else if(e.key === 'Enter'){
        if(!this.isMatchingBarcode){
          console.log('incrementing')
          this.addIncrementProductQuantity(this.barcodeScannerValue)
        }else{
          console.log('waiting')
          clearTimeout(this.batchUploadTimeout)
          this.scannedBarcodePendingList.push(this.barcodeScannerValue)
          this.batchUploadTimeout = setTimeout(() => {
            console.log('processing')
            this.proccessBarcodePendingList()
          }, 1000)
        }
      }
    }
  }
}
</script>
