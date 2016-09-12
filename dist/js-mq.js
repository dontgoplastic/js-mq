(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mq = factory());
}(this, (function () { 'use strict';

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

window.matchMedia || (window.matchMedia = function() {
    "use strict";

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = (window.styleMedia || window.media);

    // For those that don't support matchMedium
    if (!styleMedia) {
        var style       = document.createElement('style'),
            script      = document.getElementsByTagName('script')[0],
            info        = null;

        style.type  = 'text/css';
        style.id    = 'matchmediajs-test';

        script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
            matchMedium: function(media) {
                var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                if (style.styleSheet) {
                    style.styleSheet.cssText = text;
                } else {
                    style.textContent = text;
                }

                // Test if media query is true or false
                return info.width === '1px';
            }
        };
    }

    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || 'all'),
            media: media || 'all'
        };
    };
}());

/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function(){
    // Bail out for browsers that have addListener support
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var localMatchMedia = window.matchMedia,
        hasMediaQueries = localMatchMedia('only all').matches,
        isListening     = false,
        timeoutID       = 0,    // setTimeout for debouncing 'handleChange'
        queries         = [],   // Contains each 'mql' and associated 'listeners' if 'addListener' is used
        handleChange    = function(evt) {
            // Debounce
            clearTimeout(timeoutID);

            timeoutID = setTimeout(function() {
                for (var i = 0, il = queries.length; i < il; i++) {
                    var mql         = queries[i].mql,
                        listeners   = queries[i].listeners || [],
                        matches     = localMatchMedia(mql.media).matches;

                    // Update mql.matches value and call listeners
                    // Fire listeners only if transitioning to or from matched state
                    if (matches !== mql.matches) {
                        mql.matches = matches;

                        for (var j = 0, jl = listeners.length; j < jl; j++) {
                            listeners[j].call(window, mql);
                        }
                    }
                }
            }, 30);
        };

    window.matchMedia = function(media) {
        var mql         = localMatchMedia(media),
            listeners   = [],
            index       = 0;

        mql.addListener = function(listener) {
            // Changes would not occur to css media type so return now (Affects IE <= 8)
            if (!hasMediaQueries) {
                return;
            }

            // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
            // There should only ever be 1 resize listener running for performance
            if (!isListening) {
                isListening = true;
                window.addEventListener('resize', handleChange, true);
            }

            // Push object only if it has not been pushed already
            if (index === 0) {
                index = queries.push({
                    mql         : mql,
                    listeners   : listeners
                });
            }

            listeners.push(listener);
        };

        mql.removeListener = function(listener) {
            for (var i = 0, il = listeners.length; i < il; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                }
            }
        };

        return mql;
    };
}());

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var es6PromiseDebounce = createCommonjsModule(function (module) {
(function() {

    "use strict";

    module.exports = function(func, wait, immediate) {

        var timeout;
        return function() {

            var context = this, args = arguments;

            return new Promise(function(resolve) {
                var later = function() {
                    timeout = null;
                    if (!immediate) resolve(func.apply(context, args));
                };

                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);

                if (callNow) resolve(func.apply(context, args));
            });
        };
    };

})();
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {

  // (on[, from], cbOn[, cbOff][, always])
  function _class(_ref) {
    var args = _ref.args;
    var config = _ref.config;

    _classCallCheck(this, _class);

    var on = null;
    var from = '*';
    var cbOn = null;
    var cbOff = null;
    var alwaysTrigger = false;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var arg = _step.value;

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
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    _extends(this, {
      isActive: null,
      matchesOn: parseMatchInputString(on, config.inversePrefix),
      matchesFrom: parseMatchInputString(from, config.inversePrefix),
      cbOn: cbOn, cbOff: cbOff, alwaysTrigger: alwaysTrigger
    });
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
    var includes = state.includes(match.testAgainst);
    return match.isInverse ? !includes : includes;
  });
}

function parseMatchInputString(inputString, inversePrefix) {
  if (inputString === '*' || inputString.includes('*')) {
    return true;
  } else {
    return inputString.split(' ').map(function (match) {
      var isInverse = match.startsWith(inversePrefix);
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

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = queries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _step.value;
      var name = _step$value.name;
      var list = _step$value.list;

      if (list.matches) {
        currState.push(name);
      } else {
        currState.push(config.inversePrefix + name);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (readyCallbacks) {
    readyCallbacks.forEach(function (cb) {
      return cb();
    });
    readyCallbacks = null;
  }
}

var updateStateAndExecRules = es6PromiseDebounce(function updateStateAndExecRules() {
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
  var name = _ref.name;
  var query = _ref.query;


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
//# sourceMappingURL=js-mq.js.map
