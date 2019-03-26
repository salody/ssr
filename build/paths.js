const paths = require('path')
const fs = require('fs')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => paths.resolve(appDirectory, relativePath)

module.exports = {
  appPath:       resolveApp('.'),
  appPublic:     resolveApp('public'),
  appHtml:       resolveApp('public/index.html'),
  appSrc:        resolveApp('src'),
  distPath:      resolveApp('dist'),
  constantsPath: resolveApp('src/constants'),
}
