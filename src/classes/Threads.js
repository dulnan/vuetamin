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

  addHandler (threadName, uid, method, methodName, context) {
    if (!this.threads[threadName]) {
      this.threads[threadName] = new Thread(threadName)
    }

    this.threads[threadName].add(method, methodName, uid, context)
    this.trigger(threadName)
  }

  removeHandler (threadName, uid, method, methodName) {
    this.threads[threadName].remove(uid, methodName)
  }

  trigger (thread) {
    this.queue[thread] = true
  }

  step (state, cb) {
    let history = {}
    Object.keys(this.threads).forEach(thread => {
      if (this.queue[thread] === true) {
        this.queue[thread] = false
        history = this.threads[thread].run(state, history)
      }
    })

    cb()
  }
}
