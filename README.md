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

