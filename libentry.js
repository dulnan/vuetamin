import plugin from './src/index.js'
export default plugin

// Auto-install
let _Vue = null
if (typeof window !== 'undefined') {
  _Vue = window.Vue
} else if (typeof global !== 'undefined') {
  _Vue = global.Vue
}
if (_Vue) {
  _Vue.use(plugin)
}
