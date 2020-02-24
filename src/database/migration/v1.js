export default {
  version: 1, // useless. Change the version on each table instead
  dbName: 'Vue 1',
  tables: [{
    name: 'categories',
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      parent_category: { notNull: false, dataType: 'number' }
    }
  }, {
    name: 'users',
    version: 2,
    columns: {
      db_id: { unique: true, notNull: true, dataType: 'number' },
      first_name: { notNull: false, dataType: 'string' },
      email: { unique: true, notNull: false, dataType: 'string' },
      last_name: { notNull: false, dataType: 'string' },
      pin: { notNull: false, dataType: 'string' },
      user_roles: { notNull: true, dataType: 'array' },
      is_cashier: { notNull: true, dataType: 'number' },
      is_manager: { notNull: true, dataType: 'number' },
      is_admin: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'products',
    columns: {
      db_id: { unique: true, notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      barcode: { notNull: false, dataType: 'string' },
      category_id: { notNull: true, dataType: 'number' },
      price: { notNull: true, dataType: 'number' },
      cost: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'discounts',
    columns: {
      db_id: { unique: true, notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      type: { notNull: true, dataType: 'number' }, // 1 - percentage on receipt, 2 - percentage on items,  3 - exact value on receipt, 4 - exact value on  items1 - percentage on receipt, 2 - exact value on receipt, 3 percentage on items, 4 - exact value on  items
      value: { notNull: true, dataType: 'number' },
      is_vat_exempt: { notNull: true, dataType: 'number' },
      require_identification_card: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'customers',
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      name: { notNull: true, dataType: 'string' },
      birthdate: { notNull: true, dataType: 'number' }
    }
  }, {
    name: 'transaction_numbers',
    version: 2,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      user_id: { notNull: true, dataType: 'number' },
      number: { notNull: true, dataType: 'number' },
      store_terminal_id: { notNull: false, dataType: 'number' },
      operation: { notNull: true, dataType: 'number' } // 1 - transaction, 2 void, 3 - reprint
    }
  }, {
    name: 'transactions',
    version: 1,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_number_id: { notNull: false, dataType: 'number' },
      customer: { notNull: true, dataType: 'string' },
      cash_tendered: { notNull: false, dataType: 'number' },
      cash_amount_paid: { notNull: false, dataType: 'number' },
      total_amount: { notNull: true, dataType: 'number' },
      total_vat_sales: { notNull: true, dataType: 'number' },
      total_vat_exempt_sales: { notNull: true, dataType: 'number' },
      total_vat_zero_rated_sales: { notNull: true, dataType: 'number' },
      total_vat_amount: { notNull: true, dataType: 'number' },
      total_discount_amount: { notNull: true, dataType: 'number' },
      sub_total_amount: { notNull: true, dataType: 'number' }, // no discount added yet
      status: { notNull: true, dataType: 'number', default: 1 }, // voided(2) or not(1)
      discount_id: { notNull: false, dataType: 'number' },
      discount_remarks: { notNull: false, dataType: 'string' }
    }
  }, {
    name: 'transaction_products',
    version: 1,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_id: { notNull: true, dataType: 'number' },
      product_id: { notNull: true, dataType: 'number' },
      quantity: { notNull: true, dataType: 'number' },
      vat_sales: { notNull: true, dataType: 'number' },
      vat_exempt_sales: { notNull: true, dataType: 'number' },
      vat_zero_rated_sales: { notNull: true, dataType: 'number' },
      vat_amount: { notNull: true, dataType: 'number' },
      discount_amount: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'day_end_reports',
    version: 1,
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      starting_transaction_number: { notNull: false, dataType: 'number' },
      ending_transaction_number: { notNull: false, dataType: 'number' },
      amount: { notNull: true, dataType: 'number' },
      vat_sales: { notNull: true, dataType: 'number' },
      vat_exempt_sales: { notNull: true, dataType: 'number' },
      vat_zero_rated_sales: { notNull: true, dataType: 'number' },
      vat_amount: { notNull: true, dataType: 'number' },
      total_discount_amount: { notNull: true, dataType: 'number' },
      discounts: { notNull: false, dataType: 'array' },
      cash_tendered: { notNull: false, dataType: 'number' },
      cash_amount_paid: { notNull: false, dataType: 'number' },
    }
  }, {
    name: 'parked_transactions',
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      customer_local_id: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'transaction_reprints',
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_id: { notNull: false, dataType: 'number' },
      transacton_number_id: { notNull: false, dataType: 'number' },
      remarks: { notNull: false, dataType: 'string' }
    }
  }, {
    name: 'transaction_voids',
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_id: { notNull: false, dataType: 'number' },
      transacton_number_id: { notNull: false, dataType: 'number' },
      remarks: { notNull: true, dataType: 'string' }
    }
  }, {
    name: 'others',
    columns: {
      key: { notNull: true, dataType: 'string' },
      value: { notNull: true, dataType: 'string' }
    }
  }]
}
