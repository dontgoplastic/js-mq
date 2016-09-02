# js-mq

#### Register Media Queries:
```
mq.register([
	{name: 'xs', query: '(max-width: 767px)'},
	{name: 'sm', query: '(min-width: 768px) and (max-width: 991px)'}
]);
```
```
mq.register({name: 'md', query: '(min-width: 992px) and (max-width: 1199px)'});
mq.register({name: 'lg', query: '(min-width: 1200px)'});
```

#### Then register callbacks:
```
mq.on('xs', function(e) {
	console.log('xs!');
});
```
```
mq.on('xs', 'sm', function(e) {
	console.log('from sm to xs!');
});
```
```
mq.on('*', 'lg', function(e) {
	console.log('from lg to anything!');
});
```
```
mq.on('*', function(e) {
	console.log('from anything to anything!');
});
```

Dependencies:
1. [matchMedia Polyfil](https://github.com/paulirish/matchMedia.js) (pre-bundled)
2. [Underscore](http://underscorejs.org/) (no lodash ATM)