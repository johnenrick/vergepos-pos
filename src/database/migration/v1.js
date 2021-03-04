export default {
  version: 1, // useless. Change the version on each table instead
  dbName: 'VergePOS',
  tables: [{
    name: 'categories',
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      parent_category: { notNull: false, dataType: 'number' }
    }
  }, {
    name: 'users',
    version: 1,
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
    version: 6, // 24-09-2020
    columns: {
      db_id: { unique: true, notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      barcode: { notNull: false, dataType: 'string' },
      category_id: { notNull: true, dataType: 'number' },
      price: { notNull: true, dataType: 'number' },
      cost: { notNull: true, dataType: 'number' },
      is_sellable: { notNull: false, dataType: 'number' },
      has_inventory: { notNull: false, dataType: 'number' },
    }
  }, {
    name: 'discounts',
    columns: {
      db_id: { unique: true, notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' },
      type: { notNull: true, dataType: 'number' }, // 0 - unspecified, 1 - percentage on receipt, 2 - percentage on items,  3 - exact value on receipt, 4 - exact value on  items1 - percentage on receipt, 2 - exact value on receipt, 3 percentage on items, 4 - exact value on  items
      value: { notNull: true, dataType: 'number' },
      is_vat_exempt: { notNull: true, dataType: 'number' },
      require_identification_card: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'customers',
    version: 1,
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      name: { notNull: true, dataType: 'string' },
      gender: { notNull: false, dataType: 'number' }, // 1 - male, 2 - female, 3 - others
      address: { notNull: false, dataType: 'string' },
      birthdate: { notNull: false, dataType: 'number' }
    }
  }, {
    name: 'payment_methods',
    version: 3,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      description: { notNull: true, dataType: 'string' }
    }
  }, {
    name: 'transaction_numbers',
    version: 1,
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
    name: 'transaction_customers',
    version: 4,
    columns: {
      customer_id: { notNull: true, dataType: 'number' },
      customer_db_id: { notNull: true, dataType: 'number' },
      transaction_id: { notNull: true, dataType: 'number' },
    }
  }, {
    name: 'transaction_products',
    version: 1,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_id: { notNull: true, dataType: 'number' },
      product_id: { notNull: true, dataType: 'number' },
      quantity: { notNull: true, dataType: 'number' },
      cost: { notNull: true, dataType: 'number' },
      vat_sales: { notNull: true, dataType: 'number' },
      vat_exempt_sales: { notNull: true, dataType: 'number' },
      vat_zero_rated_sales: { notNull: true, dataType: 'number' },
      vat_amount: { notNull: true, dataType: 'number' },
      discount_id: { notNull: false, dataType: 'number' },
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
      transacton_number_id: { notNull: false, dataType: 'number' },
      transaction_id: { notNull: false, dataType: 'number' },
      voided_transaction_number: { notNull: true, dataType: 'number' },
      remarks: { notNull: false, dataType: 'string' }
    }
  }, {
    name: 'transaction_voids',
    version: 1,
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      transaction_number_id: { notNull: true, dataType: 'number', enableSearch: true }, // the parent transaction number id, not the voided transaction number id
      transaction_id: { notNull: true, dataType: 'number' }, // transaction id of the voided transaction
      voided_transaction_number: { notNull: true, dataType: 'number' }, // the voided transaction number
      remarks: { notNull: true, dataType: 'string' }
    }
  }, {
    name: 'inventory_adjustments',
    version: 5,
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      product_id: { notNull: false, dataType: 'number' },
      user_id: { notNull: false, dataType: 'number' },
      type: { notNull: true, dataType: 'number' }, // 1 - in, 2 - out, 3 - sold
      quantity: { notNull: true, dataType: 'number' },
      previous_quantity: { notNull: true, dataType: 'number' },
      remarks: { notNull: false, dataType: 'string' },
    }
  }, {
    name: 'others',
    columns: {
      key: { notNull: true, dataType: 'string' },
      value: { notNull: true, dataType: 'string' }
    }
  }, {
    name: 'work_shifts',
    version: 8, // 1-10-2020
    columns: {
      db_id: { notNull: true, dataType: 'number' },
      user_id: { notNull: true, dataType: 'number' }, // user opened it
      closed_by_user_id: { notNull: true, dataType: 'number' },
      end_datetime: { notNull: true, dataType: 'number' },
      close_overidden: { notNull: false, dataType: 'number' }, // if it was not closed at the proper time or closed by a manager
    }
  }, {
    name: 'work_shift_cash_readings',
    version: 7, // 1-10-2020
    columns: {
      db_id: { notNull: false, dataType: 'number' },
      work_shift_id: { notNull: false, dataType: 'number' },
      type: { notNull: true, dataType: 'number' }, // 1 - beginning, 2 - cash in adjustment, 3 - cash out adjustment, 4 - closing
      approved_by_user_id: { notNull: false, dataType: 'number' }, // the manager who approved it
      bill_1_cent: { notNull: false, dataType: 'number' },
      bill_5_cent: { notNull: false, dataType: 'number' },
      bill_10_cent: { notNull: false, dataType: 'number' },
      bill_25_cent: { notNull: false, dataType: 'number' },
      bill_1_peso: { notNull: false, dataType: 'number' },
      bill_5_peso: { notNull: false, dataType: 'number' },
      bill_10_peso: { notNull: false, dataType: 'number' },
      bill_20_peso: { notNull: false, dataType: 'number' },
      bill_50_peso: { notNull: false, dataType: 'number' },
      bill_100_peso: { notNull: false, dataType: 'number' },
      bill_200_peso: { notNull: false, dataType: 'number' },
      bill_500_peso: { notNull: false, dataType: 'number' },
      bill_1000_peso: { notNull: false, dataType: 'number' },
      discrepancy: { notNull: false, dataType: 'number' },
      other_payments: { notNull: false, dataType: 'number' },
      remarks: { notNull: false, dataType: 'string' },
    }
  }]
}
