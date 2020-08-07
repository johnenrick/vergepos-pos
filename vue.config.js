const manifestJSON = require('./public/manifest.json')

module.exports = {
  publicPath: '',
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      }
    }
  },
  pwa: {
    name: manifestJSON.name,
    short_name: manifestJSON.short_name,
    theme_color: manifestJSON.theme_color,
    background_color: manifestJSON.background_color,
    orientation: manifestJSON.orientation,
    msTileColor: manifestJSON.background_color,
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: manifestJSON.theme_color,
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
      // include: ['https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js']
      // navigateFallback: 'index.html',
      // swSrc: 'src/registerServiceWorker.js', // CHECK CORRECT PATH!
    }
  },

  // pwa: {
  //   themeColor: manifestJSON.theme_color,
  //   workboxOptions: {
  //     runtimeCaching: [{
  //       urlPattern: new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
  //       handler: 'cacheFirst',
  //       options: {
  //         cacheName: 'google-fonts',
  //         expiration: {
  //           maxEntries: 30
  //         },
  //         cacheableResponse: {
  //           statuses: [0, 200]
  //         }
  //       }
  //     }]
  //   }
  // },
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
