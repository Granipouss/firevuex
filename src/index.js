const { isArray, isString, isObject, createRecord, getKey, indexForKey } = require('./helpers')

function formatDataMap (dataMap, database) {
  if (isArray(dataMap)) {
    let dm = {}
    for (let key of dataMap) dm[key] = key
    return formatDataMap(dm)
  }
  if (isString(dataMap)) {
    return formatDataMap({ [dataMap]: dataMap })
  }

  for (let key in dataMap) {
    if (!isObject(dataMap[key]) || dataMap[key].source == null) {
      dataMap[key] = { source: dataMap[key] }
    }
    if (isString(dataMap[key].source)) {
      dataMap[key].source = database.ref(dataMap[key].source)
    }
    dataMap[key].type = dataMap[key].type || 'object'
    dataMap[key].cancelCallback = dataMap[key].cancelCallback || null
  }
  return dataMap
}

function sync (store, app, dataMap) {
  dataMap = formatDataMap(dataMap, app.database())
  for (let key in dataMap) {
    if (dataMap[key].type === 'object') {
      bindAsObject(store, key, dataMap[key].source, dataMap[key].cancelCallback)
    }
    if (dataMap[key].type === 'array') {
      bindAsArray(store, key, dataMap[key].source, dataMap[key].cancelCallback)
    }
  }
}

function bindAsObject (store, name, source, cancelCallback) {
  store.registerModule(name, {
    namespaced: true,
    state: { source, value: null, key: null },
    mutations: {
      update (state, { key, value }) { Object.assign(state, { key, value }) }
    },
    getters: {
      get: state => state.value,
      getKey: state => state.key
    },
    actions: {
      set ({ state }, value) { state.source.set(value) }
    }
  })
  source.on('value', snapshot => store.commit(name + '/update', { value: snapshot.val(), key: getKey(snapshot) }), cancelCallback)
}

function bindAsArray (store, name, source, cancelCallback) {
  store.registerModule(name, {
    namespaced: true,
    state: { source, list: [] },
    mutations: {
      add (state, { snapshot, prevKey }) {
        let index = prevKey ? indexForKey(state.list, prevKey) + 1 : 0
        state.list.splice(index, 0, createRecord(snapshot))
      },
      move (state, { snapshot, prevKey }) {
        let index = indexForKey(state.list, getKey(snapshot))
        let record = state.list.splice(index, 1)[0]
        let newIndex = prevKey ? indexForKey(state.list, prevKey) + 1 : 0
        state.list.splice(newIndex, 0, record)
      },
      remove (state, { snapshot }) {
        let index = indexForKey(state.list, getKey(snapshot))
        state.list.splice(index, 1)
      },
      change (state, { snapshot }) {
        let index = indexForKey(state.list, getKey(snapshot))
        state.list.splice(index, 1, createRecord(snapshot))
      }
    },
    getters: {
      get: state => state.list,
      count: state => state.list.length
    },
    actions: {
      add ({ state }, item) { state.source.push(item) },
      remove ({ state }, item) { state.source.child(item['.key']).remove() },
      update ({ state }, item) {
        let key = item['.key']
        delete item['.key']
        state.source.child(key).set(item)
      }
    }
  })
  source.on('child_added', (snapshot, prevKey) => store.commit(name + '/add', { prevKey, snapshot }), cancelCallback)
  source.on('child_moved', (snapshot, prevKey) => store.commit(name + '/move', { prevKey, snapshot }), cancelCallback)
  source.on('child_removed', (snapshot) => store.commit(name + '/remove', { snapshot }), cancelCallback)
  source.on('child_changed', (snapshot) => store.commit(name + '/change', { snapshot }), cancelCallback)
}

module.exports = { sync }
