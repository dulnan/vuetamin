import Threads from './Threads'
import Store from './Store'

import { PROPERTY } from '../settings/index'

/**
 * The Vuetamin class handles both the threads and the store.
 * It runs the main requestAnimationFrame loop and manages
 * adding and removing Vue component's handlers.
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
  _loop () {
    const state = this.store.getState()

    this.threads.step(state)
    
    window.requestAnimationFrame(this._loop.bind(this))
  }

  /**
   * Loop over the defined handlers from a Vue component and for every
   * thread either remove or add the handler.
   *
   * The function expects the following structure on a component:
   *  
   * vuetamin: {
   *   methodName1: ['thread1', 'thread2'],
   *   methodName2: ['thread1', 'thread4']
   * }
   * 
   * @param {VueComponent} component A Vue component
   * @param {String} action The action to do (add or remove)
   */
  _forComponent (component, action) {
    const definitions = component.$options[PROPERTY]

    Object.keys(definitions).forEach(methodName => {
      // Get the threads of the handler.
      const threads = (() => {
        const val = definitions[methodName]

        // If it's an array, return that.
        // Strings are allowed, so return the string as an array.
        if (Array.isArray(val)) {
          return val
        } else if (typeof val === 'string') {
          return [val]
        } else {
          throw new Error('Invalid thread definition in ' + component.$vnode.tag)
        }
      })()

      threads.forEach(thread => {
        const method = component[methodName]
        const uid = component._uid

        const functionName = action === 'add' ? 'addHandler' : 'removeHandler'
        this.threads[functionName](thread, uid, methodName, method, component)
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
   * @param {VueComponent} component A Vue component.
   */
  addComponent (component) {
    this._forComponent(component, 'add')
  }

  /**
   * Remove a vue component from all registered threads.
   *
   * @param {VueComponent} component A Vue component.
   */
  removeComponent (component) {
    this._forComponent(component, 'remove')
  }
}
