exports.addAuthModule = function (store, app, moduleName = 'auth') {
  // Make module
  store.registerModule(moduleName, {
    namespaced: true,
    state: { user: null, auth: app.auth },
    mutations: {
      signin (state, user) { state.user = user },
      signout (state) { state.user = null }
    },
    getters: {
      getUser: state => state.user,
      isLogged: state => state.user != null
    },
    actions: {
      signInWithPopup ({ state }, provider) { state.auth().signInWithPopup(provider) },
      signInWithEmailAndPassword ({ state }, { email, password }) { state.auth().signInWithEmailAndPassword(email, password) },
      signout ({ state }) { state.auth().signOut() }
    }
  })
  // Binding
  app.auth().onAuthStateChanged(
    user => user
      ? store.commit(moduleName + '/signin', user)
      : store.commit(moduleName + '/signout')
  )
}
