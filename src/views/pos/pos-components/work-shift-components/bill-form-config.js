const formConfig = {
  fields: {
    bill_1_cent: {
      name: '1 Cent',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_5_cent: {
      name: '5 Cent',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_10_cent: {
      name: '10 Cent',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_25_cent: {
      name: '25 Cent',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_1_peso: {
      name: '1 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_5_peso: {
      name: '5 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_10_peso: {
      name: '10 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_20_peso: {
      name: '20 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_50_peso: {
      name: '50 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_100_peso: {
      name: '100 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_200_peso: {
      name: '200 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_500_peso: {
      name: '500 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    bill_1000_peso: {
      name: '1000 Peso',
      type: 'number',
      config: {
        decimal_place: 0
      }
    },
    remarks: {
      type: 'textarea',
      placeholder: 'Type your notes here'
    }
  }
}
export default {
  formConfig: formConfig,
  generateFormConfig: (readOnly = false) => {
    if(readOnly){
      let newFormConfig = JSON.parse(JSON.stringify(formConfig))
      for(let fieldKey in newFormConfig['fields']){
        newFormConfig['fields'][fieldKey]['type'] = 'static'
      }
      return newFormConfig
    }else{
      return formConfig
    }
  }
}
