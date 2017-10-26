import debounce from 'debounce'
import QueryRule from './js-mq-rule';

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

  queries.forEach((query) => {
    const {name, list} = query;

    if (list.matches) {
      currState.push(name);
    } else {
      currState.push(config.inversePrefix + name);
    }
  });

  if (readyCallbacks) {
    readyCallbacks.forEach(cb => cb());
    readyCallbacks = null;
  }

}

const updateStateAndExecRules = debounce(function updateStateAndExecRules() {
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