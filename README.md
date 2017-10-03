# js-mq

[![npm](https://img.shields.io/npm/v/js-mq.svg?maxAge=2592000?style=flat-square)](https://www.npmjs.com/package/js-mq)

Register media queries by name and fire callbacks when crossing breakpoints

#### Register Media Queries:
```js
mq.register([
  {name: 'xs', query: '(max-width: 767px)'},
  {name: 'sm', query: '(min-width: 768px) and (max-width: 991px)'}
]);
```
```js
mq.register({name: 'md', query: '(min-width: 992px) and (max-width: 1199px)'});
mq.register({name: 'lg', query: '(min-width: 1200px)'});
```

#### Then register callbacks:
```js
mq.on('xs', function(e) {
  console.log('xs!');
});
```
```js
mq.on('xs', 'sm', function(e) {
  console.log('from sm to xs!');
});
```
```js
mq.on('*', 'lg', function(e) {
  console.log('from lg to any other registered query!');
});
```

## Demo
### [Check it out!](https://dontgoplastic.github.io/js-mq/demo)

## API

### mq.register(queryRule)
#### queryRule
Type: `Object` or `Array`

Register a query rule object (or an array of). Query rules must have unique names.  

##### queryRule.name
Type: `String`

Name used to reference the media query.

##### queryRule.query
Type: `String`

The [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#Syntax) to test.

```js
mq.register({name: 'xs', query: '(max-width: 767px)'});
```
```js
mq.register([
  {name: 'landscape', query: '(orientation: landscape)' },
  {name: 'portrait', query: '(orientation: portrait)' }
]);
```


### mq.on(queryNameOn[, queryNameFrom], activateCallback[, deactivateCallback][, alwaysFire])

Register callbacks to be fired when you've entered (and optionally exited) specified media queries.

#### queryNameOn
Type: `String`

Space separated list of registered query names. When any of the named queries apply, the `activateCallback` will fire.

Special value `*` is considered a match on any media query update.

Values beginning with the `mq.config.inversePrefix` are considered a match when the prefixed name does not match. _These prefixed names are automatically created for you_. To use `not-xs` simply register `xs`.

value | matches
--- | ---
`xs` | on `xs` only
`xs sm lg` | on either `xs`, `sm`, or `lg`
`not-xs` | on any matching query except for `xs`
`*` | on any matching query

#### queryNameFrom
Type: `String` Default `*`

You may specify an additional query name set to further restrict when the rule is considered active and `activateCallback` fires. If this is specified (i.e. not `*`), in addition to the `queryNameOn` needing to match, the user must have also come from a state where `queryNameFrom` matched.

value | matches
--- | ---
`mq.on('xs', 'sm'` | on `xs` directly from `sm`  
`mq.on('not-xs', 'sm'` | on anything other than `xs` directly from `sm`
`mq.on('*', 'sm'` | on any registered query directly from `sm`
`mq.on('*', 'xs sm'` | on any registered query directly from either `xs` or `sm`


#### activateCallback
Type: `Function` _TODO: Finalize and document callback params - recommendations welcome!_

Function that gets called when the registered rule activates.

#### deactivateCallback
Type: `Function` default `null`

Optional callback that gets fired when you go from an active to inactive state.

#### alwaysFire
Type: `Boolean` default `false`

By default, an `activateCallback` will not fire when moving from one applied media query to another. For example, `xs sm` will initially fire when either `xs` or `sm` applies, but from there if you move from one to the other, it will not fire again. Setting this to `true` changes this behavior.

```js
mq.on('*', function() {
  // fires once but never again 
});

mq.on('*', function() {
  // fires every time a registered media query applies
}, true);
```