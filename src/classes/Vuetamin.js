import Threads from './Threads'
import Store from './Store'

import { PROPERTY } from '../settings/index'

/**
 * The Vuetamin class handles the store
 */
export default class Vuetamin {
  constructor (store) {
    this.threads = new Threads()
    this.store = new Store(store, this.trigger.bind(this))

    this._loop()
  }

  /**
   * Main requestAnimationFrame loop. Calls the step function
   * of the threads and passes the current state.
   */
  async _loop () {
    const state = this.store.getState()

    await this.threads.step(state)
    
    window.requestAnimationFrame(this._loop.bind(this))
  }

  /**
   * Loop over the defined handlers from a Vue component and for every
   * thread either remove or add the handler.
   * 
   * @param {Vue} component A Vue component
   * @param {String} action The action to do (add or remove)
   */
  _forComponent (component, action) {
    const definitions = component.$options[PROPERTY]

    Object.keys(definitions).forEach(methodName => {
      const threads = definitions[methodName]

      threads.forEach(thread => {
        const method = component[methodName]
        const uid = component._uid

        const functionName = action === 'add' ? 'addHandler' : 'removeHandler'
        this.threads[functionName](thread, uid, method, methodName, component)
      })
    })
  }

  /**
   * Trigger the specified thread.
   *
   * @param {String} threadName Name of the thread.
   */
  trigger (threadName) {
    this.threads.trigger(threadName)
  }

  /**
   * Add a Vue component to the desired threads.
   *
   * @param {Vue} component A Vue component.
   */
  addComponent (component) {
    this._forComponent(component, 'add')
  }

  /**
   * Remove a vue component from all registered threads.
   *
   * @param {Vue} component A Vue component.
   */
  removeComponent (component) {
    this._forComponent(component, 'remove')
  }
}
