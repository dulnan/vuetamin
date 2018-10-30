import Vuetamin from './classes/Vuetamin'
import { hasVuetaminOptions } from './utils'

/**
 * Install the Vuetamin plugin in the global scope and add
 * the hooks in the components to add or remove themselves.
 */
const plugin = {
  // eslint-disable-next-line no-unused-vars
  install (Vue, { store = {}, options = {}} = {}) {
    Vue.prototype.$vuetamin = new Vuetamin(store)

    Vue.mixin({
      mounted: function () {
        if (hasVuetaminOptions(this.$options)) {
          this.$vuetamin.addComponent(this)
        }
      },

      beforeDestroy: function () {
        if (hasVuetaminOptions(this.$options)) {
          this.$vuetamin.removeComponent(this)
        }
      }
    })
  }
}

export default plugin
