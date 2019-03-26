const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const PurifyCSSPlugin = require('purifycss-webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const paths = require('./paths')
const antdTheme = require('./antd.theme')

exports.devServer = ({ host, port } = {}) => ({
  devServer: {
    stats: 'errors-only', // Display only errors to reduce the amount of output.
    host,
    port,
    open:  true, // Open the page in browser

    // WDS overlay does not capture runtime errors of the application.
    overlay: true, // display error in browser

    // watchOptions: {
    // Delay the rebuild after the first change
    // aggregateTimeout: 300,
    //
    // // Poll 轮询 using interval (in ms, accepts boolean too)
    // poll: 1000,
    // },

    hot: true // HMR 这个和poll二选一
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin() // 配合hot:true打开HMR
  ]
})

exports.loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,

        // evaluated from right to left.
        // This means that loaders: ["style-loader", "css-loader"]
        // can be read as styleLoader(cssLoader(input)).
        use: ['style-loader', 'css-loader']
      }
    ]
  }
})

exports.loadSCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.scss$/,
        include,
        exclude,
        use:  ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
})

exports.loadLESS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.less$/,
        include,
        exclude,
        use:  [
          'style-loader',
          'css-loader',
          {
            loader:  'less-loader',
            options: {
              modifyVars:        antdTheme,
              javascriptEnabled: true
            }
          }
        ]
      }
    ]
  }
})

exports.extractCSS = ({ include, exclude, use = [] } = {}) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: 'styles/[name].[contenthash:8].css'
  })

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: [MiniCssExtractPlugin.loader].concat(use)
        },
        {
          test: /\.less$/,
          include,
          exclude,

          use: [MiniCssExtractPlugin.loader].concat([
            ...use,
            {
              loader:  'less-loader',
              options: {
                modifyVars:        antdTheme,
                javascriptEnabled: true
              }
            }
          ])
        }
      ]
    },
    plugins: [plugin]
  }
}

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })]
})

exports.autoprefix = () => ({
  loader:  'postcss-loader',
  options: {
    plugins: () => [require('autoprefixer')()]
  }
})

exports.loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        include,
        exclude,
        use:  {
          loader: 'url-loader',
          options
        }
      }
    ]
  }
})

exports.loadJavaScript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include,
        exclude,
        use:  {
          loader: 'babel-loader?cacheDirectory'
        }
      }
    ]
  }
})

exports.loadTypeScript = () => ({
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      {
        test:   /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test:    /\.js$/,
        loader:  'source-map-loader'
      }
    ]
  }
})

exports.loadSvg = () => ({
  module: {
    rules: [
      {
        test: /\.svg$/,
        use:  'file-loader'
      }
    ]
  }
})

exports.setFreeVariables = (variables = {}) => {
  const env = {}
  for (let key in variables) {
    if (variables.hasOwnProperty(key)) {
      env[key] = JSON.stringify(variables[key])
    }
  }

  return {
    plugins: [new webpack.DefinePlugin(env)]
  }
}

exports.analyze = () => ({
  plugins: [new BundleAnalyzerPlugin()]
})

exports.injectScriptToHtml = ({ isProduction } = {}) => ({
  plugins: [
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject:   true,
          template: paths.appHtml
        },
        isProduction
          ? {
              minify: {
                removeComments:                true,
                collapseWhitespace:            true,
                removeRedundantAttributes:     true,
                useShortDoctype:               true,
                removeEmptyAttributes:         true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash:              true,
                minifyJS:                      true,
                minifyCSS:                     true,
                minifyURLs:                    true
              }
            }
          : undefined
      )
    )
  ]
})

exports.optimization = () => ({
  optimization: {
    // Automatically split vendor and commons
    // https://twitter.com/wSokra/status/969633336732905474
    // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      name:   false
    }
    // Keep the runtime chunk separated to enable long term caching
    // https://twitter.com/wSokra/status/969679223278505985
    // runtimeChunk: true
  }
})

exports.sourceMap = ({ isProduction, shouldUseSourceMap } = {}) => ({
  devtool: isProduction ? (shouldUseSourceMap ? 'source-map' : false) : 'cheap-module-source-map'
})

exports.gzip = () => ({
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip'
    })
  ]
})

exports.defineAlias = () => ({
  resolve: {
    alias: {
      Constants: paths.constantsPath
    }
  }
})
