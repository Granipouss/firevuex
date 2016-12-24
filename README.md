# FireVuex

> Vuex 2 binding for Firebase 3, strongly based on [vuefire](https://github.com/vuejs/vuefire).

## Installation

1. If included as global `<script>`: the `FireVuex` will be available globally.

2. In module environments, e.g CommonJS:
  ```bash
  npm i -S firevuex
  ```
  and then next
  ```js
  const FireVuex = require('firevuex')
  ```

## Usage

> You may want to see [the example](examples/database/app.js) to have a preview of usage.

``` js
const app = firebase.initializeApp({ ... })
const store = new Vuex.Store({ ... })

// Binding
FireVuex.bindDatabase(store, app, {
  'message': 'message',
  'todos': { source: 'todos', type: 'array' },
  ...
})
```

### Ways of binding
```js
FireVuex.bindDatabase(store, app, dataMap)
```

- **store** is a vuex store
- **app** is a firebase app
- **dataMap** is an object describing how refs and queries will be linked to the store modules as such:
``` js
{
  moduleNameOrPath: {
    source: QueryOrRefOrPath,
    type: 'array' | 'object',
    cancelCallback: ...
  }
}
```
But you can do it shorter `moduleNameOrPath: QueryOrRefOrPath`.

There are two types of bindings, the array binding for lists and object binding for the rest.

##### Object binding

A source bound as object with the name `foobar` will create a `foobar` module with a `foobar/get` getter returning the current value and a `foobar/set` action that can be used to change the value.

##### Array binding

A source bound as array with the name `foobar` will create a `foobar` module containing list of records that you can retrieve with the `foobar/get` getter.

Each record contain a `.key` property which specifies the key where the record is stored. So if you have data at `/items/-Jtjl482BaXBCI7brMT8/`, the record for that data will have a `.key` of `"-Jtjl482BaXBCI7brMT8"`.

If an individual record's value in the database is a primitive (boolean, string, or number), the value will be stored in the `.value` property. If the individual record's value is an object, each of the object's properties will be stored as properties of the bound record.

There are three actions available `foobar/add`, `foobar/remove` and `foobar/update`, that will allow you to handle the list.

## Contributing

Clone the repo, then:

```bash
$ npm install    # install dependencies
$ npm run dev    # watch and build dist/vuefire.js
$ npm run build  # build dist/vuefire.js and vuefire.min.js
```

## License

[MIT](http://opensource.org/licenses/MIT)
0
