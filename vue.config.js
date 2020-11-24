const path = require('path')

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    outputDir: 'dist',
    publicPath: '/',
    assetsDir:'static',
    lintOnSave: false,
    productionSourceMap: false,
    css: {
        loaderOptions: {
            sass: {
                data: `@import '@/assets/css/app.scss';`
            }
        }
    },
    configureWebpack: {
        resolve: {
            alias: {
                '@': resolve('src')
            }
        }
    },
    devServer: {
        proxy: {
            '^/api': {
                target: 'http://127.0.0.1:8888',
                changeOrigin: true
            },
            '^/uploads': {
                target: 'http://127.0.0.1:8888',
                changeOrigin: true
            }
        }
    }
}
