module.exports = {
  publicPath: '',

  pwa: {
    name: 'VergePOS by Verge Technologies',
    short_name: "VergePOS",
    themeColor: "#000000",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js" // CHECK CORRECT PATH!
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
