export default {
  header_menus: [{
    name: 'Manage',
    link: '/dashboard',
    icon: 'list',
    offline_only: false
  }, {
    icon: 'cash-register',
    name: 'POS',
    no_sidebar: true,
    offline_only: false
  },
  // {
  //   icon: null,
  //   name: 'Register Now',
  //   link: 'company-registration',
  //   no_sidebar: true,
  //   offline_only: true,
  //   class: 'btn py-2 btn-success text-white'
  // }
  ],
  side_menus: [{
    icon: 'box',
    name: 'Product',
    has_offline: true
  }, {
    icon: 'boxes',
    name: 'Category'
  }, {
    icon: 'percent',
    name: 'Discount'
  }, {
    icon: 'file-contract',
    name: 'Terminal Reports',
    sub_item: [{
      name: 'Transaction History',
      route: '/transaction-history',
      has_offline: true
    }, {
      name: 'Product Performance',
      route: '/product-performance',
      has_offline: true
    }, {
      name: 'X Reading',
      has_offline: true
    }]
  }, {
  //   icon: 'file-contract',
  //   name: 'Reports',
  //   sub_item: [{
  //     name: 'Product Performance'
  //   }, {
  //     name: 'Overall Z Reading'
  //   }]
  // }, {
    icon: 'tools',
    name: 'Business',
    sub_item: [{
      icon: 'users',
      name: 'Users',
      route: '/user-management'
    }, {
      icon: 'store',
      name: 'Business Detail'
    }]
  }]
}
