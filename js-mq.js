(function (exports,_) {
'use strict';

_ = 'default' in _ ? _['default'] : _;

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

// @TODO es6 this up
// @TODO lodash not working?

var queries = [];
var callbacks = [];
var readyCallbacks = [];
var prevState = null;
var currState = null;

var onMediaQueryDebounced = _.debounce(onMediaQuery, 0);
var updateCurrStateDebounced = _.debounce(updateCurrState, 0);

// @TODO allow inverse registration:
// mq.on('not-xs', () => { ... })
var inversePrefix = 'not-';

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

  var mediaQueryList = window.matchMedia(o.query);
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
    var notCurr = _.map(_.difference(allNames, currState), function (name) {
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

  callbacks.push({ matchesOn: args[0], matchesFrom: args[1], callback: args[2] });
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

  _.each(queries, function (query) {
    var queryName = query.name;
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

  _.each(queries, function (query) {
    var queryName = query.name;
    var mediaQueryList = query.mediaQueryList;

    if (mediaQueryList.matches) {
      _.each(callbacks, function (callbackInfo) {

        var matchesOn = callbackInfo.matchesOn;
        var matchesFrom = callbackInfo.matchesFrom;

        if ((matchesOn === '*' || _.chain(matchesOn.split(' ')).contains(queryName).value() // @TODO precompute the split
        ) && (matchesFrom === '*' || _.intersection(matchesFrom.split(' '), prevState).length // @TODO precompute the split
        )) {
          var newEventObj = _.extend({}, {
            mediaQueryList: mediaQueryList,
            matchesOn: matchesOn,
            matchesFrom: matchesFrom,
            queryName: queryName,
            prevState: prevState,
            currState: currState
          });
          callbackInfo.callback.call(window, newEventObj);
        }
      });
    }
  });
}

exports.inversePrefix = inversePrefix;
exports.on = on;
exports.is = is;
exports.register = register;
exports.getState = getState;
exports.trigger = trigger;
exports.ready = ready;

}((this.mq = this.mq || {}),_));
//# sourceMappingURL=js-mq.js.map
