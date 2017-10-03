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

var QueryRule = class {

  // (on[, from], cbOn[, cbOff][, always])
  constructor({args, config}) {

    let on = null;
    let from = '*';
    let cbOn = null;
    let cbOff = null;
    let alwaysTrigger = false;

    for (const arg of args) {
      switch (typeof arg) {
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

    Object.assign(this, {
      isActive: null,
      matchesOn: parseMatchInputString(on, config.inversePrefix),
      matchesFrom: parseMatchInputString(from, config.inversePrefix),
      cbOn, cbOff, alwaysTrigger
    });

  }

  exec(currState, prevState) {
    const matchesCurr = testState(this.matchesOn, currState);
    const matchesPrev = testState(this.matchesFrom, prevState);

    const shouldBeEnabled = matchesCurr && matchesPrev;

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
};

function testState(matches, state) {
  if (matches === true) return true;

  return matches.some(match => {
    const includes = state.includes(match.testAgainst);
    return match.isInverse ? !includes : includes;
  });
}

function parseMatchInputString(inputString, inversePrefix) {
  if (inputString === '*' || inputString.includes('*')) {
    return true;
  } else {
    return inputString.split(' ').map(match => {
      const isInverse = match.startsWith(inversePrefix);
      const testAgainst = isInverse ?
          match.substring(inversePrefix.length):
          match;
      return {match, isInverse, testAgainst};
    });
  }
}

const config = {
  inversePrefix: 'not-',
  disallowedNames: /[^a-z-]/g
};

const queries = [];
const queryRules = [];

let readyCallbacks = [];
let prevState = null;
let currState = [];


function updateState() {

  prevState = currState;
  currState = [];

  for (const {name, list} of queries) {
    if (list.matches) {
      currState.push(name);
    } else {
      currState.push(config.inversePrefix + name);
    }
  }

  if (readyCallbacks) {
    readyCallbacks.forEach(cb => cb());
    readyCallbacks = null;
  }

}

const updateStateAndExecRules = es6PromiseDebounce(function updateStateAndExecRules() {
  updateState();
  execQueryRules();
}, 0);


function register(val) {
  if (Array.isArray(val)) {
    val.forEach(o => doRegister(o));
  } else {
    doRegister(val);
  }

  // ideally register all queries prior to adding rules
  if (queryRules.length) {
    updateStateAndExecRules();
  }
}

function doRegister({name, query}) {

  if (config.disallowedNames.test(name) === true) {
    throw new Error(`Registered media query name '${name}' not allowed`);
  }
  if (queries.some(el => el.name == name && el.query !== query)) {
    throw new Error(`Registered media queries must be unique. Attempted to register conflicting query rules for '${name}'`);
  }

  const list  = window.matchMedia(query);
  queries.push({name, query, list});

  list.addListener(updateStateAndExecRules);

}


function on(...args) {
  queryRules.push( new QueryRule({args, config}) );
  updateStateAndExecRules();
}


function is(name) {
  return getState().includes(name);
}

function ready(cb) {
  readyCallbacks ? readyCallbacks.push(cb) : cb();
}

function execQueryRules() {
  queryRules.forEach(cb => cb.exec(getState(), prevState));
}

function getState() {
  if (!prevState) updateState();
  return currState;
}

const mq = {
  config, on, is, register, getState, ready,
  trigger: execQueryRules
};

export default mq;
