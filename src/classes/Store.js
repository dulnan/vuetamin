/**
 * The Vuetamin store manages the state and provides ways
 * to mutate the state.
 */
export default class Store {
  /**
   * @param {Object} options
   * @param {Function} triggerFn The function to trigger a thread.
   */
  constructor ({ data, state, mutations, actions } = {}, triggerFn) {
    this.data = data()
    this.mutations = this.buildFromProperties(mutations)
    this.actions = this.buildFromProperties(actions)

    this._getState = state
    this._context = {
      data: this.data,
      trigger: triggerFn,
      mutate: this.mutate.bind(this),
      action: this.action.bind(this)
    }
  }

  /**
   * Loop over the properties of an object, validate them and
   * build a new object.
   *
   * @param {Object} properties 
   */
  buildFromProperties (properties) {
    const entries = {}

    Object.keys(properties).forEach(name => {
      entries[name] = properties[name]
    })

    return entries
  }

  mutate (name, value) {
    this.mutations[name].call(this, this._context, value)
  }

  action (name, value) {
    this.actions[name].call(this, this._context, value)
  }

  getState () {
    return this._getState(this.data)
  }
}
