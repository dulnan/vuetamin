import Loop from './classes/Loop'

import { PROPERTY } from './settings'

export default {
  install (Vue, options) {
    Vue.prototype.$loop = new Loop(options.data(), options.state, options.mutations, options.actions)

    Vue.mixin({
      mounted: function () {
        let definitions = this.$options['loop']

        if (definitions && typeof definitions === 'object') {
          this.$loop.addComponent(this)
        }
      },

      beforeDestroy: function () {
        let definitions = this.$options[PROPERTY]

        if (definitions && typeof definitions === 'object') {
          this.$loop.removeComponent(this)
        }
      }
    })
  }
}