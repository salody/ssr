require('dotenv').config()

const merge = require('webpack-merge')

const parts = require('./webpack.parts')
const commonConfig = require('./webpack.common')

let publicPath
switch (process.env.NODE_ENV) {
  case 'production':
    publicPath = process.env.prodPublicPath
    break
  case 'test':
    publicPath = process.env.testPublicPath
    break
  case 'development':
    publicPath = process.env.devPublicPath
    break
  default:
    publicPath = process.env.prodPublicPath
}

console.log(publicPath)

const productionConfig = merge([
  {
    output: {
      chunkFilename: 'js/[name].[chunkhash:8].js',
      filename:      'js/[name].[chunkhash:8].js',
      publicPath:    publicPath
    }
  },
  parts.sourceMap({
    isProduction:       true,
    shouldUseSourceMap: true
  }),
  parts.injectScriptToHtml({ isProduction: true }),
  parts.extractCSS({
    use: ['css-loader', parts.autoprefix()]
  }),

  parts.loadImages({
    options: {
      limit: 10000,
      name:  'assets/images/[name].[hash:8].[ext]'
    }
  }),
  parts.optimization()

  // parts.analyze()
])

module.exports = merge(commonConfig, productionConfig)
