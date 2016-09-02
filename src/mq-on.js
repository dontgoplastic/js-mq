import _ from 'underscore';
import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener.js';

// @TODO es6 this up
// @TODO lodash not working?

const queries        = [];
const callbacks      = [];
let readyCallbacks = [];
let prevState      = null;
let currState      = null;

const onMediaQueryDebounced    = _.debounce(onMediaQuery, 0);
const updateCurrStateDebounced = _.debounce(updateCurrState, 0);

// @TODO allow inverse registration:
// mq.on('not-xs', () => { ... })
const inversePrefix = 'not-';

function register(val) {
  if (Array.isArray(val)) {
    _.each(val, doRegister);
  } else {
    doRegister(val);
  }
};

function doRegister(o) {

  // @TODO restrict + validate query names

  if (_.chain(queries).pluck('name').contains(o.name).value()) {
    // @TODO Test for existing name & value and just ignore if they both match
    throw new Error('Media Query \'name\' values must be unique. Attempted to register: ' + o.name);
  }

  var mediaQueryList  = window.matchMedia(o.query);
  mediaQueryList.addListener(onMediaQueryDebounced);

  queries.push({
    name: o.name,
    mediaQueryList: mediaQueryList
  });

  updateCurrStateDebounced();
};


function getState(withInverse) {
  if (withInverse) {
    // @TODO cache this
    var prefix = inversePrefix;
    var allNames = _.pluck(queries, 'name');
    var notCurr = _.map(_.difference(allNames, currState), function(name) {
      return prefix + name;
    });
    return currState.concat(notCurr);
  } else {
    return currState;
  }
};


function on() {
  // matchesOn, matchesFrom (optional), callback
  var args = _.toArray(arguments);

  if (args.length === 2) {
    args.splice(1, 0, '*');
  }

  callbacks.push({matchesOn: args[0], matchesFrom: args[1], callback: args[2]});
};


function is(name) {
  if (!currState) {
    onMediaQuery();
  }
  return _.indexOf(currState, name) !== -1;
};


function ready(callback) {
  if (readyCallbacks === null) {
    callback();
  } else {
    readyCallbacks.push(callback);
  }
};

function trigger() {
  onMediaQuery(false);
};



function updateCurrState() {

  prevState = currState;
  currState = [];

  _.each(queries, function(query) {
    var queryName      = query.name;
    var mediaQueryList = query.mediaQueryList;

    if (mediaQueryList.matches) {
      currState.push(queryName);
    }
  });

  if (!prevState) {
    prevState = currState;
  }

  if (readyCallbacks !== null) {
    _.invoke(readyCallbacks, 'call');
    readyCallbacks = null;
  }
}

function onMediaQuery(evaluateState) {

  if (evaluateState !== false) {
    updateCurrState();
  }

  _.each(queries, function(query) {
    var queryName      = query.name;
    var mediaQueryList = query.mediaQueryList;

    if (mediaQueryList.matches) {
      _.each(callbacks, function(callbackInfo) {

        var matchesOn   = callbackInfo.matchesOn;
        var matchesFrom = callbackInfo.matchesFrom;

        if (
          (
            matchesOn === '*' ||
            _.chain(matchesOn.split(' ')).contains(queryName).value() // @TODO precompute the split
          ) && (
            matchesFrom === '*' ||
            _.intersection(matchesFrom.split(' '), prevState).length // @TODO precompute the split
          )
        ) {
          var newEventObj = _.extend({}, {
            mediaQueryList,
            matchesOn,
            matchesFrom,
            queryName,
            prevState,
            currState
          });
          callbackInfo.callback.call(window, newEventObj);
        }
      });
    }
  });
}

export {inversePrefix, on, is, register, getState, trigger, ready }