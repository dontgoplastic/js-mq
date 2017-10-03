function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var es6PromiseDebounce = createCommonjsModule(function (module) {
    (function () {

        "use strict";

        module.exports = function (func, wait, immediate) {

            var timeout;
            return function () {

                var context = this,
                    args = arguments;

                return new Promise(function (resolve) {
                    var later = function later() {
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _class = function () {

  // (on[, from], cbOn[, cbOff][, always])
  function _class(_ref) {
    var args = _ref.args,
        config = _ref.config;
    classCallCheck(this, _class);


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

    Object.assign(this, {
      isActive: null,
      matchesOn: parseMatchInputString(on, config.inversePrefix),
      matchesFrom: parseMatchInputString(from, config.inversePrefix),
      cbOn: cbOn, cbOff: cbOff, alwaysTrigger: alwaysTrigger
    });
  }

  createClass(_class, [{
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
      var _ref = _step.value;
      var name = _ref.name;
      var list = _ref.list;

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

function doRegister(_ref2) {
  var name = _ref2.name,
      query = _ref2.query;


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

export default mq;
