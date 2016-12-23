/* global Vue Vuex firebase FireVuex */

const app = firebase.initializeApp({ databaseURL: 'https://firevuex.firebaseio.com' })
const store = new Vuex.Store({})

// Binding
FireVuex.bindDatabase(store, app, {
  'message': 'message',
  'todos': { source: 'todos', type: 'array' }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  data: { newMessage: '', newTodo: '' },
  computed: Vuex.mapGetters({
    message: 'message/get',
    todos: 'todos/get'
  }),
  methods: {
    setMessage () {
      this.$store.dispatch('message/set', this.newMessage)
    },
    addTodo () {
      this.$store.dispatch('todos/add', {
        label: this.newTodo,
        done: false
      })
      this.newTodo = ''
    },
    removeTodo (todo) {
      this.$store.dispatch('todos/remove', todo)
    },
    toggleTodo (todo) {
      let newTodo = Object.assign({}, todo)
      newTodo.done = !newTodo.done
      this.$store.dispatch('todos/update', newTodo)
    }
  }
})
