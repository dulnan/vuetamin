import Thread from './Thread'

/**
 * Manages threads, handles adding and removing them.
 * Keeps track of the queue and tracks them.
 */
export default class Threads {
  constructor () {
    this.threads = {}
    this.queue = {}
  }

  /**
   * Adds a thread method of a Vue component to the corresponding
   * thread. Triggers the thread for the initial render.
   *
   * @param {String} threadName Name of the thread.
   * @param {Number} uid The UID of the Vue component.
   * @param {Function} method The method to be called.
   * @param {String} methodName Name of the method in the component.
   * @param {Object} context The context ('this') of the component.
   */
  addHandler (threadName, uid, methodName, method, context) {
    if (!this.threads[threadName]) {
      this.threads[threadName] = new Thread(threadName)
    }

    this.threads[threadName].add(method, methodName, uid, context)
    this.trigger(threadName)
  }

  /**
   * Removes a method from a thread.
   *
   * @param {String} threadName Name of the thread.
   * @param {Number} uid The UID of the Vue component.
   * @param {String} methodName Name of the method in the component.
   */
  removeHandler (threadName, uid, methodName) {
    this.threads[threadName].remove(uid, methodName)
  }

  /**
   * Triggers a thread.
   *
   * @param {String} threadName Name of the thread.
   */
  trigger (threadName) {
    this.queue[threadName] = true
  }

  /**
   * Loop over all threads and run the methods of the threads
   * that are queued. Checks that a method is only run once.
   *
   * @param {Object} state The Vuetamin state.
   */
  step (state) {
    return new Promise((resolve) => {
      let history = {}

      Object.keys(this.threads).forEach(thread => {
        if (this.queue[thread]) {
          this.queue[thread] = false
          history = this.threads[thread].run(state, history)
        }
      })

      resolve()
    })
  }
}
