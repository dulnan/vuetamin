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

    this.loop()
  }

  /**
   * Main requestAnimationFrame loop. Calls the step function
   * of the threads and passes the current state.
   */
  loop () {
    const state = this.store.getState()

    this.threads.step(state, () => {
      window.requestAnimationFrame(() => this.loop())
    })
  }

  /**
   * Loop over the defined handlers from a Vue component and for every
   * thread either remove or add the handler.
   * 
   * @param {Vue} component A Vue component
   * @param {String} action The action to do (add or remove)
   */
  forComponent (component, action) {
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
    this.forComponent(component, 'add')
  }

  /**
   * Remove a vue component from all registered threads.
   *
   * @param {Vue} component A Vue component.
   */
  removeComponent (component) {
    this.forComponent(component, 'remove')
  }
}
