(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FireVuex"] = factory();
	else
		root["FireVuex"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const { bindDatabase } = __webpack_require__(1)

	module.exports = { bindDatabase }


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const { isArray, isString, isObject, createRecord, getKey, indexForKey } = __webpack_require__(2)

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

	exports.bindDatabase = function (store, app, dataMap) {
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	// Type Checking
	exports.isArray = val => Array.isArray(val)
	exports.isString = val => typeof val === 'string'
	exports.isObject = val => Object.prototype.toString.call(val) === '[object Object]'

	exports.getKey = snapshot => {
	  return typeof snapshot.key === 'function'
	    ? snapshot.key()
	    : snapshot.key
	}

	exports.createRecord = snapshot => {
	  let value = snapshot.val()
	  let res = exports.isObject(value)
	    ? value
	    : { '.value': value }
	  res['.key'] = exports.getKey(snapshot)
	  return res
	}

	exports.indexForKey = (array, key) => {
	  for (var i = 0; i < array.length; i++) {
	    if (array[i]['.key'] === key) return i
	  }
	  return -1
	}


/***/ }
/******/ ])
});
;