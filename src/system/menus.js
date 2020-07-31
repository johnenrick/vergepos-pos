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
    icon: 'tachometer-alt',
    name: 'Dashboard',
    link: '/',
    has_offline: true,
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  }, {
    icon: 'box',
    name: 'Product',
    has_offline: true,
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  }, {
    icon: 'boxes',
    name: 'Category',
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  }, {
    icon: 'percent',
    name: 'Discount',
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  // }, {
  //   icon: 'user-friends',
  //   has_offline: true,
  //   name: 'Customer',
  //   role_access_list: {
  //     100: true, // Company Admin
  //     102: true, // Manager
  //   }
  }, {
    icon: 'file-contract',
    name: 'Terminal Reports',
    not_terminal_link: 'terminal-report-not-terminal',
    sub_item: [{
      name: 'Transaction History',
      route: '/transaction-history',
      has_offline: true,
      role_access_list: {
        100: true, // Company Admin
        102: true, // Manager
      }
    }, {
      name: 'Product Performance',
      route: '/product-performance',
      has_offline: true,
      role_access_list: {
        100: true, // Company Admin
        102: true, // Manager
      }
    }, {
      name: 'X Reading',
      has_offline: true,
      role_access_list: {
        100: true, // Company Admin
        101: true, // Cashier
        102: true, // Manager
      }
    }]
  }, {
    icon: 'file-contract',
    name: 'Reports',
    sub_item: [{
      name: 'Transaction History',
      route: '/report/transaction-history',
      // role_access_list: {
      //   100: true, // Company Admin
      //   102: true, // Manager
      // }
    // }, {
    //   name: 'Product Performance'
    // }, {
    //   name: 'Overall Z Reading'
    }],
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  }, {
    icon: 'tools',
    name: 'Business',
    sub_item: [{
      icon: 'users',
      name: 'Users',
      route: '/user-management',

    }, {
      icon: 'store',
      name: 'Business Detail',
      has_offline: true,
    }, {
      icon: 'desktop',
      name: 'Terminal',
      route: '/terminal',

    }],
    role_access_list: {
      100: true, // Company Admin
      102: true, // Manager
    }
  }, {
    icon: 'headset',
    name: 'Contact Us',
    route: '/contact-us'
  }],
}
