# vuetamin - Central state and animation loop for Vue

**THIS IS A PROOF OF CONCEPT**
Though I am using this in one of my Vue projects, this Vue plugin is nothing more
than an experiment, is not tested thoroughly and might change any time.

## Idea
There are several ways to share data among multiple components. Using only Vue,
a parent component can act as the "source" and pass down data via props. Or any
component can send data as events and others listen and then do something with
this data.
But the most obvious solution is a centralized store, like vuex. This works well
for most cases, but you'll run into performance issues as soon as you work with
animations, real-time data or otherwise constantly changing data.

### Example use case
Let's say we want to build an app that displays data coming from a WebRTC
connection. There are three components that visualize the data and two components
that do some calculations and display it as text.
New data might arrive every 10ms, so 100 times a second. Using vuex, you would
have to commit the data everytime, which in turn would trigger watchers,
computed properties and so on. To not block your app, you would probably
do canvas drawing using a requestAnimationFrame loop. But we'll end up with
an animation loop for every component.
The same problem appears when just passing down data from a common parent
component or using events.

### Problems
* Multiple animation loops means it will be out of sync
* 

# Usage
Install Vuetamin from npm.

`npm install --save vuetamin`

Install the plugin in your Vue app.

```javascript
import Vue from 'vue'
import App from './App.vue'
import Vuetamin from 'vue-tamin'
import { store } from './store'

Vue.use(Vuetamin, { store })

new Vue({
  render: h => h(App)
}).$mount('#app')
```

The store/index.js file should look like this:

```javascript
/**
 * Optional. Store mutation and action names as an object to share them
 * across multiple files.
 */
export const threads = {
  POSITION: 'position',
  COLOR: 'color'
}

/**
 * Export your store as an object.
 */
export const store = {
  /**
   * This is where all data is stored. It must be a function returning
   * a single object. You can set the initial values directly or run
   * additional code beforehand.
   */
  data: function () {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    return {
      position: {
        x: viewport.width / 2,
        y: viewport.height /2
      },
      color: '#ff4302',
      viewport: viewport,
      timeout: null
    }
  },

  /**
   * The state function is called before every animation loop. Its return
   * value is passed to all animation handlers.
   * The function receives the data as an argument. Though it's possible
   * to mutate values in data, this is probably a bad idea.
   * 
   * You can do additional calculations here based on the data.
   * The function can return anything from a single value, to an object or
   * an array.
   */
  state: function (data) {
    return {
      color: data.color,
      position: data.mousePosition,
      isLeft: data.mousePosition.x < (data.viewport.width / 2)
    }
  },

  /**
   * Mutations change a single value. In the first parameter you have access
   * to the context, consisting of { data, trigger, mutate, action }.
   * 
   * It's possible to call another mutations or action from here, but for
   * that it's probably a better idea to write an action that calls one
   * or multiple mutations.
   * 
   * The second argument is whatever has been passed to the mutation.
   * 
   * The trigger function takes the name of a thread as its argument
   * and puts all handlers from this thread to the current animation queue.
   */
  mutations: {
    updatePosition: function ({ data, trigger }, newPosition) {
      data.position = newPosition
      trigger(threads.POSITION)
    },

    updateColor: function ({ data, trigger }, newColor) {
      data.color = color
      trigger(threads.COLOR)
    },

    updateViewport: function ({ data, action }, newViewport) {
      data.viewport = newViewport
      action('redrawAll')
    }
  },

  /**
   * Actions don't differ from mutations much. They als get the same context
   * and it's possible to pass a value/payload to an action.
   * 
   * They are meant to be used when multiple mutations need to be called or
   * when the function otherwise behaves a bit differently.
   * 
   * In this example, the redrawAll action is being used to trigger all threads
   * once, after some time has passed. Here this is used to not immediately redraw
   * every canvas in the app when the viewport changes.
   */
  actions: {
    redrawAll: function ({ data, trigger }, { noTimeout } = {}) {
      const timeout = noTimeout ? 0 : 1000

      window.clearTimeout(data.timeout)
      data.timeout = window.setTimeout(() => {
        threads.forEach(thread => trigger(thread))
      }, timeout)
    }
  }
}
```

Now you're ready to use Vuetamin in any component you like.

```html
<template>
  <canvas ref="canvas" :style="backgroundColor"></canvas>
</template>
```

```javascript
import { threads } from '@/store'

export default {
  /**
   * You can locally store values from Vuetamin in your component,
   * but it will be a manual task.
   */
  data () {
    return {
      background: '#FFFFFF'
    }
  },

  computed: {
    canvasStyle () {
      return {
        backgroundColor: this.background
      }
    }
  },

  /**
   * Using the vuetamin property you can attach methods that will
   * be called for when the specified thread is triggered.
   * 
   * It has to be an object, with its properties being the name of
   * the method and the value an array of thread names.
   */
  vuetamin: {
    drawCursor: [threads.POSITION],
    drawBackground: [threads.COLOR]
  },

  /**
   * Define your methods as usual. They get passed the state as the only
   * parameter.
   */
  methods: {
    /**
     * This method will draw the position on the canvas.
     */
    drawCursor (state) {
      const ctx = this.$refs.canvas.getContext('2d')

      ctx.clearRect(0, 0, state.viewport.width, state.viewport.height)

      ctx.beginPath()
      ctx.fillStyle = state.color
      ctx.arc(state.position.x, state.position.y, 8, 0, Math.PI * 2, true)
      ctx.fill()
    },

    /**
     * This method will pass a value from the Vuetamin state to the local data
     * of the Vue component.
     */
    drawBackground (state) {
      this.background = state.color
    }
  }
}
```