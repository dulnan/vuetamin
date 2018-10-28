/**
 * Vuetamin manages the state and provides ways to mutate the state.
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

    // Store the context which will be passed to mutation and action methods.
    this._context = {
      data: this.data,
      trigger: triggerFn,
      mutate: this.mutate.bind(this),
      action: this.action.bind(this)
    }
  }

  /**
   * Returns the state from data by calling the user-defined
   * state function.
   * 
   * @returns {Any}
   */
  getState () {
    return this._getState(this.data)
  }

  /**
   * Returns the store data.
   * 
   * @returns {Object}
   */
  getData () {
    return this.data
  }

  /**
   * Loop over the properties of an object, validate them and
   * build a new object. Used for adding actions and mutations.
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

  /**
   * Calls the mutation with the given payload and passes
   * the context to it.
   *
   * @param {String} name Name of the mutation
   * @param {Any} value Payload
   */
  mutate (name, value) {
    this.mutations[name].call(this, this._context, value)
  }

  /**
   * Calls the action with the given payload and passes
   * the context to it.
   *
   * @param {String} name Name of the action
   * @param {Any} value Payload
   */
  action (name, value) {
    this.actions[name].call(this, this._context, value)
  }
}
