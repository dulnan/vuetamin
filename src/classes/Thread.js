const buildKey = (uid, name) => {
  return `vue_${uid}_${name}`
}

/**
 * A single thread. It stores all handlers for the given thread and provides
 * a way to add, remove and run them.
 */
export default class Thread {
  constructor (name) {
    this.name = name
    this.handlers = []
  }

  /**
   * Add a handler.
   *
   * @param {Function} method The method to be added.
   * @param {String} uid The uid of the Vue component.
   * @param {Object} context The context of the Vue component.
   */
  add (method, methodName, uid, context) {
    const key = buildKey(uid, methodName)

    this.handlers.push({
      key: key,
      method: method,
      context: context
    })
  }

  /**
   * Remove a handler.
   *
   * @param {Handler} handler The handler to be removed.
   * @param {String} uid The uid of the Vue component.
   */
  remove (uid, methodName) {
    const key = buildKey(uid, methodName)

    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i] !== null && this.handlers[i].key === key) {
        this.handlers[i] = null
      }
    }
  }

  /**
   * Run all handlers in this thread.
   *
   * @param {Object} state The state object to be provided for all handlers.
   * @param {Object} history It's properties are the keys of all handlers already run.
   * 
   * @returns {Object} The altered history object.
   */
  run (state, history) {
    // Store the already called handlers.
    let currentRun = history

    // Loop over all handlers and run them. Also make sure they are
    // not called multiple times.
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i] !== null) {
        const handler = this.handlers[i]
        if (!currentRun[handler.key]) {
          this.handlers[i].method.call(handler.context, state)
          currentRun[handler.key] = true
        }
      }
    }

    return currentRun
  }
}
