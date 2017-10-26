(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mq = factory());
}(this, (function () { 'use strict';

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

var debounce = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {

  // (on[, from], cbOn[, cbOff][, always])
  function _class(_ref) {
    var args = _ref.args,
        config = _ref.config;

    _classCallCheck(this, _class);

    var on = null;
    var from = '*';
    var cbOn = null;
    var cbOff = null;
    var alwaysTrigger = false;

    args.forEach(function (arg) {
      switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
        case 'string':
          if (on === null) {
            on = arg;
          } else {
            from = arg;
          }
          break;
        case 'function':
          if (cbOn === null) {
            cbOn = arg;
          } else {
            cbOff = arg;
          }
          break;
        case 'boolean':
          alwaysTrigger = arg;
      }
    });

    this.isActive = null;
    this.matchesOn = parseMatchInputString(on, config.inversePrefix);
    this.matchesFrom = parseMatchInputString(from, config.inversePrefix);
    this.cbOn = cbOn;
    this.cbOff = cbOff;
    this.alwaysTrigger = alwaysTrigger;
  }

  _createClass(_class, [{
    key: 'exec',
    value: function exec(currState, prevState) {
      var matchesCurr = testState(this.matchesOn, currState);
      var matchesPrev = testState(this.matchesFrom, prevState);

      var shouldBeEnabled = matchesCurr && matchesPrev;

      if (shouldBeEnabled && (!this.isActive || this.alwaysTrigger)) {
        this.isActive = true;
        this.cbOn();
      } else if (shouldBeEnabled === false && (this.isActive === null || this.isActive)) {
        this.isActive = false;
        if (this.cbOff) {
          this.cbOff();
        }
      }
    }
  }]);

  return _class;
}();

function testState(matches, state) {
  if (matches === true) return true;

  return matches.some(function (match) {
    var includes = state.indexOf(match.testAgainst) !== -1;
    return match.isInverse ? !includes : includes;
  });
}

function parseMatchInputString(inputString, inversePrefix) {
  if (inputString === '*' || inputString.indexOf('*') !== -1) {
    return true;
  } else {
    return inputString.split(' ').map(function (match) {
      var isInverse = match.substr(0, inversePrefix.length) === inversePrefix;
      var testAgainst = isInverse ? match.substring(inversePrefix.length) : match;
      return { match: match, isInverse: isInverse, testAgainst: testAgainst };
    });
  }
}

var config = {
  inversePrefix: 'not-',
  disallowedNames: /[^a-z-]/g
};

var queries = [];
var queryRules = [];

var readyCallbacks = [];
var prevState = null;
var currState = [];

function updateState() {

  prevState = currState;
  currState = [];

  queries.forEach(function (query) {
    var name = query.name,
        list = query.list;


    if (list.matches) {
      currState.push(name);
    } else {
      currState.push(config.inversePrefix + name);
    }
  });

  if (readyCallbacks) {
    readyCallbacks.forEach(function (cb) {
      return cb();
    });
    readyCallbacks = null;
  }
}

var updateStateAndExecRules = debounce(function updateStateAndExecRules() {
  updateState();
  execQueryRules();
}, 0);

function register(val) {
  if (Array.isArray(val)) {
    val.forEach(function (o) {
      return doRegister(o);
    });
  } else {
    doRegister(val);
  }

  // ideally register all queries prior to adding rules
  if (queryRules.length) {
    updateStateAndExecRules();
  }
}

function doRegister(_ref) {
  var name = _ref.name,
      query = _ref.query;


  if (config.disallowedNames.test(name) === true) {
    throw new Error('Registered media query name \'' + name + '\' not allowed');
  }
  if (queries.some(function (el) {
    return el.name == name && el.query !== query;
  })) {
    throw new Error('Registered media queries must be unique. Attempted to register conflicting query rules for \'' + name + '\'');
  }

  var list = window.matchMedia(query);
  queries.push({ name: name, query: query, list: list });

  list.addListener(updateStateAndExecRules);
}

function on() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  queryRules.push(new _class({ args: args, config: config }));
  updateStateAndExecRules();
}

function is(name) {
  return getState().includes(name);
}

function ready(cb) {
  readyCallbacks ? readyCallbacks.push(cb) : cb();
}

function execQueryRules() {
  queryRules.forEach(function (cb) {
    return cb.exec(getState(), prevState);
  });
}

function getState() {
  if (!prevState) updateState();
  return currState;
}

var mq = {
  config: config, on: on, is: is, register: register, getState: getState, ready: ready,
  trigger: execQueryRules
};

return mq;

})));
