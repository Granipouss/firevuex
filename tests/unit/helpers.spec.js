/* global describe it expect */
const { isArray, isString, isObject, getKey, createRecord, indexForKey } = require('../../src/helpers')

function random (n) {
  return 0 | (Math.random() * n) + 1
}

function makeSnap (key, val) {
  return {
    key () { return key },
    val () { return val }
  }
}

describe('Type helpers', () => {
  it('isArray', () => {
    const A = []
    const B = [0, 1, 2]
    const C = '0 1 2'
    expect(isArray(A)).toBe(true)
    expect(isArray(B)).toBe(true)
    expect(isArray(C)).toBe(false)
  })

  it('isString', () => {
    const A = ''
    const B = '0 1 2'
    const C = [0, 1, 2]
    expect(isString(A)).toBe(true)
    expect(isString(B)).toBe(true)
    expect(isString(C)).toBe(false)
  })

  it('isObject', () => {
    const A = {}
    const B = { foo: 'bar' }
    const C = 'foobar'
    expect(isObject(A)).toBe(true)
    expect(isObject(B)).toBe(true)
    expect(isObject(C)).toBe(false)
  })
})

describe('Helpers', () => {
  it('getKey', () => {
    const key = random(100)
    const A = { key }
    const B = { key () { return key } }
    expect(getKey(A)).toBe(key)
    expect(getKey(B)).toBe(key)
  })

  it('createRecord simple', () => {
    const key = '-' + random(100)
    const val = random(100)
    const snapshot = makeSnap(key, val)
    const record = createRecord(snapshot)
    expect(record).toEqual({
      '.key': key,
      '.value': val
    })
  })

  it('createRecord object', () => {
    const key = '-' + random(100)
    const val = random(100)
    const snapshot = makeSnap(key, { val, foo: 'bar' })
    const record = createRecord(snapshot)
    expect(record).toEqual({
      val,
      foo: 'bar',
      '.key': key
    })
  })

  it('indexForKey', () => {
    const list = []
    const len = random(20)
    for (let i = 0; i < len; i++) {
      list.push(createRecord(makeSnap(random(100), random(10))))
    }
    const index = random(len) - 1
    const record = list[index]
    const key = record['.key']
    expect(indexForKey(list, key)).toBe(index)
    expect(indexForKey(list, 'toto')).toBe(-1)
  })
})
