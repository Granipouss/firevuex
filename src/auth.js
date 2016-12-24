exports.addAuthModule = function (store, app, moduleName = 'auth') {
  // Make module
  store.registerModule(moduleName, {
    namespaced: true,
    state: { user: null },
    mutations: {
      signin (state, user) { state.user = user },
      signout (state) { state.user = null }
    },
    getters: {
      getUser: state => state.user,
      isLogged: state => state.user != null
    }
  })
  // Binding
  app.auth().onAuthStateChanged(
    user => user
      ? store.commit(moduleName + '/signin', user)
      : store.commit(moduleName + '/signout')
  )
}
