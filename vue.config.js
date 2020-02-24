const manifestJSON = require('./public/manifest.json')

module.exports = {
  publicPath: '',

  // pwa: {
  //   name: 'VergePOS by Verge Technologies',
  //   short_name: 'VergePOS',
  //   themeColor: '#000000',
  //   workboxPluginMode: 'InjectManifest',
  //   workboxOptions: {
  //     swSrc: 'src/service-worker.js' // CHECK CORRECT PATH!
  //   }
  // },
  pwa: {
    themeColor: manifestJSON.theme_color,
    workboxOptions: {
      runtimeCaching: [{
        urlPattern: new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
        handler: 'cacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 30
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }]
    }
  },
  devServer: {
    // host: 'localhost',
    // port: 8081,
    // watch: true,
    // watchOptions: {
    //   aggregateTimeout: 300,
    //   poll: 1000
    // },
  },

  productionSourceMap: false
}
