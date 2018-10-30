# vuetamin
### Central animation loop and state management
#### » Run methods from multiple components in a single requestAnimationFrame loop
#### » Central state management
#### » For every rAF loop all methods will receive the exact same state
#### » Prevent unnecessary redraws


## Important

Although I am using this in one of my Vue projects, this Vue plugin is nothing
more than an experiment, it's not tested thoroughly and might change any time. I
do plan however to get this in a state where it's safe to use and well tested.

## Concepts
### Basic
Instead of making assumptions about your state, Vuetamin does not do anything by
itself. It offers mutations, which similiar to vuex provide a structure to
change data. It does not observe changes. It's your task to queue up what needs
to be run.

### Manual
To do something with the Vuetamin data in your components, you need to specify a
method and a thread in your component. A thread is kind of like an event. It
could be named "position_change". When mutating the data in the store, you have
to trigger a thread. Vuetamin then queues this thread and all its methods for
the next loop.

### Performance
A method can subscribe to multiple threads. Vuetamin will make sure that for
every loop a method is only called once.

## Why not...?
There are several ways to share data across multiple components. And for most
cases they are more than enough and perform very well. Using vuex would work, or
just plain Vue and passing data to components via props.

Sharing data via events also seems like a good idea. Components would listen for
certain events and then redraw or rerender.

The problem with all these options is that you would still need an animation
loop in every component and then "buffer" the incoming data via the components
own reactive data.

* Multiple animation loops can be out of sync
* It can be tricky and complex to prevent unnecessary redraws
* The structure can get quite messy since it's not clear where data is coming
  from
* To mitigate performance issues you might consider debouncing events, which
  introduces a lag

# Usage

## npm
Install Vuetamin from npm.

`npm install --save vuetamin`

Install the plugin in your Vue app.

```javascript
import Vue from 'vue'
import App from './App.vue'
import Vuetamin from 'vuetamin'
import { store } from './store'

Vue.use(Vuetamin, { store })

new Vue({
  render: h => h(App)
}).$mount('#app')
```

## CDN

```html
<head>
  <script src="https://unpkg.com/vue/dist/vue.min.js"></script>
  <script src="https://unpkg.com/vuetamin/dist/vuetamin.min.js"></script>
</head>
<body>
  <div id="app"></div>

  <script>
    new Vue({  el: '#app' })
  </script>
</body>
```

## The store object
The store.js file should look something like this.

```javascript
/**
 * Optional. Put mutation and action names as an object to share them
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
   * additional code beforehand. This will only be called when Vuetamin
   * is instanciating its store.
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
   * value is passed to all methods in the queue.
   * The state function receives the store data as an argument. Though it's
   * possible to mutate values in data, it's a bad idea.
   *
   * You can do additional calculations here based on the data. Keep in mind
   * that this function will be called for every loop, so it's a good idea to
   * do expensive calculations in a mutation and store the result in data.
   *
   * The function can return anything from a single value, to an object or
   * an array. Technically even a function..?
   */
  state: function (data) {
    return {
      color: data.color,
      position: data.position,
      isLeft: data.position.x < (data.viewport.width / 2)
    }
  },

  /**
   * Mutations change a single value. In the first parameter you have access
   * to the context, consisting of { data, trigger, mutate, action }.
   *
   * It's possible to call another mutation or action from here, but for
   * that it's probably a better idea to write an action that calls one
   * or multiple mutations and insted call this action from somewhere.
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
   * Actions don't differ from mutations much. They also get the same context
   * and it's possible to pass a value/payload to an action.
   *
   * They are meant to be used when multiple mutations need to be called or
   * when the function otherwise behaves a bit differently, like doing things
   * outside of the store.
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

Now you're ready to use Vuetamin in any component you like. Here is an example
of a component which displays the current {x,y} position on a canvas. It also
stores a variable from the Vuetamin store in the local data of the component,
which is then used in a computed property.

```html
<template>
  <canvas ref="canvas" :style="backgroundColor"></canvas>
</template>
```

```javascript
import { threads } from '@/store'

export default {
  /**
   * Using the vuetamin property you can attach methods that will
   * be called for when the specified thread is triggered.
   *
   * It has to be an object, with its properties being the name of
   * the method and the value an array of thread names. You can also pass a
   * string if you only need a single thread.
   */
  vuetamin: {
    drawCursor: [threads.POSITION],
    drawBackground: threads.COLOR
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
  /**
   * You can locally store values from Vuetamin in your component, to use them
   * in templates, computed properties, etc.
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
  }
}
```

# API
To interact with Vuetamin in your app, you can use the global `this.$vuetamin`.

## mutation
```javascript
this.$vuetamin.store.mutate('updateColor', color)
```

## Get data and state
You also have access to the store data and state:

```javascript
this.$vuetamin.store.getData()
this.$vuetamin.store.getState()
```

## Trigger a thread
Just like in a mutation, you can also trigger a thread from within your app:
```javascript
this.$vuetamin.trigger('color_changed')
```

## Add or remove component
It's possible to manually add or remove a component. Just call the following
functions and pass the component:

```javascript
this.$vuetamin.addComponent(this)
this.$vuetamin.removeComponent(this)
```


