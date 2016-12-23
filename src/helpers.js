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
