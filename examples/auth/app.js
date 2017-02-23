/* global Vue Vuex firebase FireVuex */

const app = firebase.initializeApp({
  apiKey: 'AIzaSyAxxdjOyAcZSOy-eA1p9A4gg0QsNLU74uQ',
  databaseURL: 'https://firevuex.firebaseio.com'
})
const store = new Vuex.Store({})

// Binding
FireVuex.addAuthModule(store, app)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  data: { email: '', password: '' },
  computed: Vuex.mapGetters({
    user: 'auth/getUser',
    isLogged: 'auth/isLogged'
  }),
  methods: {
    signInWithGoogle () {
      let GoogleAuthProvider = new firebase.auth.GoogleAuthProvider()
      this.$store.dispatch('auth/signInWithPopup', GoogleAuthProvider)
    },
    signIn () {
      this.$store.dispatch('auth/signInWithEmailAndPassword', {
        email: this.email,
        password: this.password
      })
    },
    signOut () {
      this.$store.dispatch('auth/signout')
    }
  }
})
