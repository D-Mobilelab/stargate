(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Stargate = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator-runtime/runtime");

require("core-js/fn/regexp/escape");

/* eslint max-len: 0 */

if (global._babelPolyfill) {
  throw new Error("only one instance of babel-polyfill is allowed");
}
global._babelPolyfill = true;

// Should be removed in the next major release:

var DEFINE_PROPERTY = "defineProperty";
function define(O, key, value) {
  O[key] || Object[DEFINE_PROPERTY](O, key, {
    writable: true,
    configurable: true,
    value: value
  });
}

define(String.prototype, "padLeft", "".padStart);
define(String.prototype, "padRight", "".padEnd);

"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
  [][key] && define(Array, key, Function.call.bind([][key]));
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/fn/regexp/escape":3,"core-js/shim":296,"regenerator-runtime/runtime":303}],2:[function(require,module,exports){
/*
 * Cookies.js - 1.2.2
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }
            
            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];

            return value === undefined ? undefined : decodeURIComponent(value);
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            var key = cookieString.substr(0, separatorIndex);
            var decodedKey;
            try {
                decodedKey = decodeURIComponent(key);
            } catch (e) {
                if (console && typeof console.error === 'function') {
                    console.error('Could not decode cookie with key "' + key + '"', e);
                }
            }
            
            return {
                key: decodedKey,
                value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };

    var cookiesExport = typeof global.document === 'object' ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);
},{}],3:[function(require,module,exports){
require('../../modules/core.regexp.escape');
module.exports = require('../../modules/_core').RegExp.escape;
},{"../../modules/_core":24,"../../modules/core.regexp.escape":120}],4:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],5:[function(require,module,exports){
var cof = require('./_cof');
module.exports = function(it, msg){
  if(typeof it != 'number' && cof(it) != 'Number')throw TypeError(msg);
  return +it;
};
},{"./_cof":19}],6:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"./_hide":41,"./_wks":118}],7:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],8:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":50}],9:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = require('./_to-object')
  , toIndex  = require('./_to-index')
  , toLength = require('./_to-length');

module.exports = [].copyWithin || function copyWithin(target/*= 0*/, start/*= 0, end = @length*/){
  var O     = toObject(this)
    , len   = toLength(O.length)
    , to    = toIndex(target, len)
    , from  = toIndex(start, len)
    , end   = arguments.length > 2 ? arguments[2] : undefined
    , count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to)
    , inc   = 1;
  if(from < to && to < from + count){
    inc  = -1;
    from += count - 1;
    to   += count - 1;
  }
  while(count-- > 0){
    if(from in O)O[to] = O[from];
    else delete O[to];
    to   += inc;
    from += inc;
  } return O;
};
},{"./_to-index":106,"./_to-length":109,"./_to-object":110}],10:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = require('./_to-object')
  , toIndex  = require('./_to-index')
  , toLength = require('./_to-length');
module.exports = function fill(value /*, start = 0, end = @length */){
  var O      = toObject(this)
    , length = toLength(O.length)
    , aLen   = arguments.length
    , index  = toIndex(aLen > 1 ? arguments[1] : undefined, length)
    , end    = aLen > 2 ? arguments[2] : undefined
    , endPos = end === undefined ? length : toIndex(end, length);
  while(endPos > index)O[index++] = value;
  return O;
};
},{"./_to-index":106,"./_to-length":109,"./_to-object":110}],11:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":38}],12:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":106,"./_to-iobject":108,"./_to-length":109}],13:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":16,"./_ctx":26,"./_iobject":46,"./_to-length":109,"./_to-object":110}],14:[function(require,module,exports){
var aFunction = require('./_a-function')
  , toObject  = require('./_to-object')
  , IObject   = require('./_iobject')
  , toLength  = require('./_to-length');

module.exports = function(that, callbackfn, aLen, memo, isRight){
  aFunction(callbackfn);
  var O      = toObject(that)
    , self   = IObject(O)
    , length = toLength(O.length)
    , index  = isRight ? length - 1 : 0
    , i      = isRight ? -1 : 1;
  if(aLen < 2)for(;;){
    if(index in self){
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if(isRight ? index < 0 : length <= index){
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for(;isRight ? index >= 0 : length > index; index += i)if(index in self){
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};
},{"./_a-function":4,"./_iobject":46,"./_to-length":109,"./_to-object":110}],15:[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":48,"./_is-object":50,"./_wks":118}],16:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":15}],17:[function(require,module,exports){
'use strict';
var aFunction  = require('./_a-function')
  , isObject   = require('./_is-object')
  , invoke     = require('./_invoke')
  , arraySlice = [].slice
  , factories  = {};

var construct = function(F, len, args){
  if(!(len in factories)){
    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /*, args... */){
  var fn       = aFunction(this)
    , partArgs = arraySlice.call(arguments, 1);
  var bound = function(/* args... */){
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if(isObject(fn.prototype))bound.prototype = fn.prototype;
  return bound;
};
},{"./_a-function":4,"./_invoke":45,"./_is-object":50}],18:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":19,"./_wks":118}],19:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],20:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":7,"./_ctx":26,"./_defined":28,"./_descriptors":29,"./_for-of":38,"./_iter-define":54,"./_iter-step":56,"./_meta":63,"./_object-create":67,"./_object-dp":68,"./_redefine-all":87,"./_set-species":92}],21:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":11,"./_classof":18}],22:[function(require,module,exports){
'use strict';
var redefineAll       = require('./_redefine-all')
  , getWeak           = require('./_meta').getWeak
  , anObject          = require('./_an-object')
  , isObject          = require('./_is-object')
  , anInstance        = require('./_an-instance')
  , forOf             = require('./_for-of')
  , createArrayMethod = require('./_array-methods')
  , $has              = require('./_has')
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"./_an-instance":7,"./_an-object":8,"./_array-methods":13,"./_for-of":38,"./_has":40,"./_is-object":50,"./_meta":63,"./_redefine-all":87}],23:[function(require,module,exports){
'use strict';
var global            = require('./_global')
  , $export           = require('./_export')
  , redefine          = require('./_redefine')
  , redefineAll       = require('./_redefine-all')
  , meta              = require('./_meta')
  , forOf             = require('./_for-of')
  , anInstance        = require('./_an-instance')
  , isObject          = require('./_is-object')
  , fails             = require('./_fails')
  , $iterDetect       = require('./_iter-detect')
  , setToStringTag    = require('./_set-to-string-tag')
  , inheritIfRequired = require('./_inherit-if-required');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":7,"./_export":33,"./_fails":35,"./_for-of":38,"./_global":39,"./_inherit-if-required":44,"./_is-object":50,"./_iter-detect":55,"./_meta":63,"./_redefine":88,"./_redefine-all":87,"./_set-to-string-tag":93}],24:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],25:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":68,"./_property-desc":86}],26:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":4}],27:[function(require,module,exports){
'use strict';
var anObject    = require('./_an-object')
  , toPrimitive = require('./_to-primitive')
  , NUMBER      = 'number';

module.exports = function(hint){
  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};
},{"./_an-object":8,"./_to-primitive":111}],28:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],29:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":35}],30:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":39,"./_is-object":50}],31:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],32:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":74,"./_object-keys":77,"./_object-pie":78}],33:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , hide      = require('./_hide')
  , redefine  = require('./_redefine')
  , ctx       = require('./_ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":24,"./_ctx":26,"./_global":39,"./_hide":41,"./_redefine":88}],34:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function(KEY){
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch(e){
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch(f){ /* empty */ }
  } return true;
};
},{"./_wks":118}],35:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],36:[function(require,module,exports){
'use strict';
var hide     = require('./_hide')
  , redefine = require('./_redefine')
  , fails    = require('./_fails')
  , defined  = require('./_defined')
  , wks      = require('./_wks');

module.exports = function(KEY, length, exec){
  var SYMBOL   = wks(KEY)
    , fns      = exec(defined, SYMBOL, ''[KEY])
    , strfn    = fns[0]
    , rxfn     = fns[1];
  if(fails(function(){
    var O = {};
    O[SYMBOL] = function(){ return 7; };
    return ''[KEY](O) != 7;
  })){
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function(string, arg){ return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function(string){ return rxfn.call(string, this); }
    );
  }
};
},{"./_defined":28,"./_fails":35,"./_hide":41,"./_redefine":88,"./_wks":118}],37:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function(){
  var that   = anObject(this)
    , result = '';
  if(that.global)     result += 'g';
  if(that.ignoreCase) result += 'i';
  if(that.multiline)  result += 'm';
  if(that.unicode)    result += 'u';
  if(that.sticky)     result += 'y';
  return result;
};
},{"./_an-object":8}],38:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":8,"./_ctx":26,"./_is-array-iter":47,"./_iter-call":52,"./_to-length":109,"./core.get-iterator-method":119}],39:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],40:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],41:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":29,"./_object-dp":68,"./_property-desc":86}],42:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":39}],43:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":29,"./_dom-create":30,"./_fails":35}],44:[function(require,module,exports){
var isObject       = require('./_is-object')
  , setPrototypeOf = require('./_set-proto').set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"./_is-object":50,"./_set-proto":91}],45:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],46:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":19}],47:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":57,"./_wks":118}],48:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":19}],49:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object')
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"./_is-object":50}],50:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],51:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object')
  , cof      = require('./_cof')
  , MATCH    = require('./_wks')('match');
module.exports = function(it){
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};
},{"./_cof":19,"./_is-object":50,"./_wks":118}],52:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":8}],53:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":41,"./_object-create":67,"./_property-desc":86,"./_set-to-string-tag":93,"./_wks":118}],54:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":33,"./_has":40,"./_hide":41,"./_iter-create":53,"./_iterators":57,"./_library":59,"./_object-gpo":75,"./_redefine":88,"./_set-to-string-tag":93,"./_wks":118}],55:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":118}],56:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],57:[function(require,module,exports){
module.exports = {};
},{}],58:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":77,"./_to-iobject":108}],59:[function(require,module,exports){
module.exports = false;
},{}],60:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;
},{}],61:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x){
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};
},{}],62:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};
},{}],63:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":35,"./_has":40,"./_is-object":50,"./_object-dp":68,"./_uid":115}],64:[function(require,module,exports){
var Map     = require('./es6.map')
  , $export = require('./_export')
  , shared  = require('./_shared')('metadata')
  , store   = shared.store || (shared.store = new (require('./es6.weak-map')));

var getOrCreateMetadataMap = function(target, targetKey, create){
  var targetMetadata = store.get(target);
  if(!targetMetadata){
    if(!create)return undefined;
    store.set(target, targetMetadata = new Map);
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if(!keyMetadata){
    if(!create)return undefined;
    targetMetadata.set(targetKey, keyMetadata = new Map);
  } return keyMetadata;
};
var ordinaryHasOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};
var ordinaryGetOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};
var ordinaryDefineOwnMetadata = function(MetadataKey, MetadataValue, O, P){
  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
};
var ordinaryOwnMetadataKeys = function(target, targetKey){
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false)
    , keys        = [];
  if(metadataMap)metadataMap.forEach(function(_, key){ keys.push(key); });
  return keys;
};
var toMetaKey = function(it){
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};
var exp = function(O){
  $export($export.S, 'Reflect', O);
};

module.exports = {
  store: store,
  map: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  key: toMetaKey,
  exp: exp
};
},{"./_export":33,"./_shared":95,"./es6.map":150,"./es6.weak-map":256}],65:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"./_cof":19,"./_global":39,"./_task":105}],66:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":35,"./_iobject":46,"./_object-gops":74,"./_object-keys":77,"./_object-pie":78,"./_to-object":110}],67:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":8,"./_dom-create":30,"./_enum-bug-keys":31,"./_html":42,"./_object-dps":69,"./_shared-key":94}],68:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":8,"./_descriptors":29,"./_ie8-dom-define":43,"./_to-primitive":111}],69:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":8,"./_descriptors":29,"./_object-dp":68,"./_object-keys":77}],70:[function(require,module,exports){
// Forced replacement prototype accessors methods
module.exports = require('./_library')|| !require('./_fails')(function(){
  var K = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, K, function(){ /* empty */});
  delete require('./_global')[K];
});
},{"./_fails":35,"./_global":39,"./_library":59}],71:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":29,"./_has":40,"./_ie8-dom-define":43,"./_object-pie":78,"./_property-desc":86,"./_to-iobject":108,"./_to-primitive":111}],72:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":73,"./_to-iobject":108}],73:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":31,"./_object-keys-internal":76}],74:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],75:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":40,"./_shared-key":94,"./_to-object":110}],76:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":12,"./_has":40,"./_shared-key":94,"./_to-iobject":108}],77:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":31,"./_object-keys-internal":76}],78:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],79:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":24,"./_export":33,"./_fails":35}],80:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject')
  , isEnum    = require('./_object-pie').f;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"./_object-keys":77,"./_object-pie":78,"./_to-iobject":108}],81:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN     = require('./_object-gopn')
  , gOPS     = require('./_object-gops')
  , anObject = require('./_an-object')
  , Reflect  = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
  var keys       = gOPN.f(anObject(it))
    , getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./_an-object":8,"./_global":39,"./_object-gopn":73,"./_object-gops":74}],82:[function(require,module,exports){
var $parseFloat = require('./_global').parseFloat
  , $trim       = require('./_string-trim').trim;

module.exports = 1 / $parseFloat(require('./_string-ws') + '-0') !== -Infinity ? function parseFloat(str){
  var string = $trim(String(str), 3)
    , result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;
},{"./_global":39,"./_string-trim":103,"./_string-ws":104}],83:[function(require,module,exports){
var $parseInt = require('./_global').parseInt
  , $trim     = require('./_string-trim').trim
  , ws        = require('./_string-ws')
  , hex       = /^[\-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix){
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
},{"./_global":39,"./_string-trim":103,"./_string-ws":104}],84:[function(require,module,exports){
'use strict';
var path      = require('./_path')
  , invoke    = require('./_invoke')
  , aFunction = require('./_a-function');
module.exports = function(/* ...pargs */){
  var fn     = aFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that = this
      , aLen = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !aLen)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(aLen > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./_a-function":4,"./_invoke":45,"./_path":85}],85:[function(require,module,exports){
module.exports = require('./_global');
},{"./_global":39}],86:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],87:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"./_redefine":88}],88:[function(require,module,exports){
var global    = require('./_global')
  , hide      = require('./_hide')
  , has       = require('./_has')
  , SRC       = require('./_uid')('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"./_core":24,"./_global":39,"./_has":40,"./_hide":41,"./_uid":115}],89:[function(require,module,exports){
module.exports = function(regExp, replace){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(it).replace(regExp, replacer);
  };
};
},{}],90:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],91:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":8,"./_ctx":26,"./_is-object":50,"./_object-gopd":71}],92:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_descriptors":29,"./_global":39,"./_object-dp":68,"./_wks":118}],93:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":40,"./_object-dp":68,"./_wks":118}],94:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":95,"./_uid":115}],95:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":39}],96:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":4,"./_an-object":8,"./_wks":118}],97:[function(require,module,exports){
var fails = require('./_fails');

module.exports = function(method, arg){
  return !!method && fails(function(){
    arg ? method.call(null, function(){}, 1) : method.call(null);
  });
};
},{"./_fails":35}],98:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":28,"./_to-integer":107}],99:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp')
  , defined  = require('./_defined');

module.exports = function(that, searchString, NAME){
  if(isRegExp(searchString))throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};
},{"./_defined":28,"./_is-regexp":51}],100:[function(require,module,exports){
var $export = require('./_export')
  , fails   = require('./_fails')
  , defined = require('./_defined')
  , quot    = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function(string, tag, attribute, value) {
  var S  = String(defined(string))
    , p1 = '<' + tag;
  if(attribute !== '')p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function(NAME, exec){
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function(){
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};
},{"./_defined":28,"./_export":33,"./_fails":35}],101:[function(require,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = require('./_to-length')
  , repeat   = require('./_string-repeat')
  , defined  = require('./_defined');

module.exports = function(that, maxLength, fillString, left){
  var S            = String(defined(that))
    , stringLength = S.length
    , fillStr      = fillString === undefined ? ' ' : String(fillString)
    , intMaxLength = toLength(maxLength);
  if(intMaxLength <= stringLength || fillStr == '')return S;
  var fillLen = intMaxLength - stringLength
    , stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if(stringFiller.length > fillLen)stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"./_defined":28,"./_string-repeat":102,"./_to-length":109}],102:[function(require,module,exports){
'use strict';
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');

module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./_defined":28,"./_to-integer":107}],103:[function(require,module,exports){
var $export = require('./_export')
  , defined = require('./_defined')
  , fails   = require('./_fails')
  , spaces  = require('./_string-ws')
  , space   = '[' + spaces + ']'
  , non     = '\u200b\u0085'
  , ltrim   = RegExp('^' + space + space + '*')
  , rtrim   = RegExp(space + space + '*$');

var exporter = function(KEY, exec, ALIAS){
  var exp   = {};
  var FORCE = fails(function(){
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if(ALIAS)exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function(string, TYPE){
  string = String(defined(string));
  if(TYPE & 1)string = string.replace(ltrim, '');
  if(TYPE & 2)string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;
},{"./_defined":28,"./_export":33,"./_fails":35,"./_string-ws":104}],104:[function(require,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
},{}],105:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":19,"./_ctx":26,"./_dom-create":30,"./_global":39,"./_html":42,"./_invoke":45}],106:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":107}],107:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],108:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":28,"./_iobject":46}],109:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":107}],110:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":28}],111:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":50}],112:[function(require,module,exports){
'use strict';
if(require('./_descriptors')){
  var LIBRARY             = require('./_library')
    , global              = require('./_global')
    , fails               = require('./_fails')
    , $export             = require('./_export')
    , $typed              = require('./_typed')
    , $buffer             = require('./_typed-buffer')
    , ctx                 = require('./_ctx')
    , anInstance          = require('./_an-instance')
    , propertyDesc        = require('./_property-desc')
    , hide                = require('./_hide')
    , redefineAll         = require('./_redefine-all')
    , toInteger           = require('./_to-integer')
    , toLength            = require('./_to-length')
    , toIndex             = require('./_to-index')
    , toPrimitive         = require('./_to-primitive')
    , has                 = require('./_has')
    , same                = require('./_same-value')
    , classof             = require('./_classof')
    , isObject            = require('./_is-object')
    , toObject            = require('./_to-object')
    , isArrayIter         = require('./_is-array-iter')
    , create              = require('./_object-create')
    , getPrototypeOf      = require('./_object-gpo')
    , gOPN                = require('./_object-gopn').f
    , getIterFn           = require('./core.get-iterator-method')
    , uid                 = require('./_uid')
    , wks                 = require('./_wks')
    , createArrayMethod   = require('./_array-methods')
    , createArrayIncludes = require('./_array-includes')
    , speciesConstructor  = require('./_species-constructor')
    , ArrayIterators      = require('./es6.array.iterator')
    , Iterators           = require('./_iterators')
    , $iterDetect         = require('./_iter-detect')
    , setSpecies          = require('./_set-species')
    , arrayFill           = require('./_array-fill')
    , arrayCopyWithin     = require('./_array-copy-within')
    , $DP                 = require('./_object-dp')
    , $GOPD               = require('./_object-gopd')
    , dP                  = $DP.f
    , gOPD                = $GOPD.f
    , RangeError          = global.RangeError
    , TypeError           = global.TypeError
    , Uint8Array          = global.Uint8Array
    , ARRAY_BUFFER        = 'ArrayBuffer'
    , SHARED_BUFFER       = 'Shared' + ARRAY_BUFFER
    , BYTES_PER_ELEMENT   = 'BYTES_PER_ELEMENT'
    , PROTOTYPE           = 'prototype'
    , ArrayProto          = Array[PROTOTYPE]
    , $ArrayBuffer        = $buffer.ArrayBuffer
    , $DataView           = $buffer.DataView
    , arrayForEach        = createArrayMethod(0)
    , arrayFilter         = createArrayMethod(2)
    , arraySome           = createArrayMethod(3)
    , arrayEvery          = createArrayMethod(4)
    , arrayFind           = createArrayMethod(5)
    , arrayFindIndex      = createArrayMethod(6)
    , arrayIncludes       = createArrayIncludes(true)
    , arrayIndexOf        = createArrayIncludes(false)
    , arrayValues         = ArrayIterators.values
    , arrayKeys           = ArrayIterators.keys
    , arrayEntries        = ArrayIterators.entries
    , arrayLastIndexOf    = ArrayProto.lastIndexOf
    , arrayReduce         = ArrayProto.reduce
    , arrayReduceRight    = ArrayProto.reduceRight
    , arrayJoin           = ArrayProto.join
    , arraySort           = ArrayProto.sort
    , arraySlice          = ArrayProto.slice
    , arrayToString       = ArrayProto.toString
    , arrayToLocaleString = ArrayProto.toLocaleString
    , ITERATOR            = wks('iterator')
    , TAG                 = wks('toStringTag')
    , TYPED_CONSTRUCTOR   = uid('typed_constructor')
    , DEF_CONSTRUCTOR     = uid('def_constructor')
    , ALL_CONSTRUCTORS    = $typed.CONSTR
    , TYPED_ARRAY         = $typed.TYPED
    , VIEW                = $typed.VIEW
    , WRONG_LENGTH        = 'Wrong length!';

  var $map = createArrayMethod(1, function(O, length){
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function(){
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function(){
    new Uint8Array(1).set({});
  });

  var strictToLength = function(it, SAME){
    if(it === undefined)throw TypeError(WRONG_LENGTH);
    var number = +it
      , length = toLength(it);
    if(SAME && !same(number, length))throw RangeError(WRONG_LENGTH);
    return length;
  };

  var toOffset = function(it, BYTES){
    var offset = toInteger(it);
    if(offset < 0 || offset % BYTES)throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function(it){
    if(isObject(it) && TYPED_ARRAY in it)return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function(C, length){
    if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function(O, list){
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function(C, list){
    var index  = 0
      , length = list.length
      , result = allocate(C, length);
    while(length > index)result[index] = list[index++];
    return result;
  };

  var addGetter = function(it, key, internal){
    dP(it, key, {get: function(){ return this._d[internal]; }});
  };

  var $from = function from(source /*, mapfn, thisArg */){
    var O       = toObject(source)
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , iterFn  = getIterFn(O)
      , i, length, values, result, step, iterator;
    if(iterFn != undefined && !isArrayIter(iterFn)){
      for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
        values.push(step.value);
      } O = values;
    }
    if(mapping && aLen > 2)mapfn = ctx(mapfn, arguments[2], 2);
    for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/*...items*/){
    var index  = 0
      , length = arguments.length
      , result = allocate(this, length);
    while(length > index)result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function(){ arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString(){
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /*, end */){
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /*, thisArg */){
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /*, thisArg */){
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /*, thisArg */){
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /*, thisArg */){
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /*, thisArg */){
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /*, fromIndex */){
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /*, fromIndex */){
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator){ // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /*, thisArg */){
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse(){
      var that   = this
        , length = validate(that).length
        , middle = Math.floor(length / 2)
        , index  = 0
        , value;
      while(index < middle){
        value         = that[index];
        that[index++] = that[--length];
        that[length]  = value;
      } return that;
    },
    some: function some(callbackfn /*, thisArg */){
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn){
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end){
      var O      = validate(this)
        , length = O.length
        , $begin = toIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end){
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /*, offset */){
    validate(this);
    var offset = toOffset(arguments[1], 1)
      , length = this.length
      , src    = toObject(arrayLike)
      , len    = toLength(src.length)
      , index  = 0;
    if(len + offset > length)throw RangeError(WRONG_LENGTH);
    while(index < len)this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries(){
      return arrayEntries.call(validate(this));
    },
    keys: function keys(){
      return arrayKeys.call(validate(this));
    },
    values: function values(){
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function(target, key){
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key){
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc){
    if(isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ){
      target[key] = desc.value;
      return target;
    } else return dP(target, key, desc);
  };

  if(!ALL_CONSTRUCTORS){
    $GOPD.f = $getDesc;
    $DP.f   = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty:           $setDesc
  });

  if(fails(function(){ arrayToString.call({}); })){
    arrayToString = arrayToLocaleString = function toString(){
      return arrayJoin.call(this);
    }
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice:          $slice,
    set:            $set,
    constructor:    function(){ /* noop */ },
    toString:       arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function(){ return this[TYPED_ARRAY]; }
  });

  module.exports = function(KEY, BYTES, wrapper, CLAMPED){
    CLAMPED = !!CLAMPED;
    var NAME       = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
      , ISNT_UINT8 = NAME != 'Uint8Array'
      , GETTER     = 'get' + KEY
      , SETTER     = 'set' + KEY
      , TypedArray = global[NAME]
      , Base       = TypedArray || {}
      , TAC        = TypedArray && getPrototypeOf(TypedArray)
      , FORCED     = !TypedArray || !$typed.ABV
      , O          = {}
      , TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function(that, index){
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function(that, index, value){
      var data = that._d;
      if(CLAMPED)value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function(that, index){
      dP(that, index, {
        get: function(){
          return getter(this, index);
        },
        set: function(value){
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if(FORCED){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME, '_d');
        var index  = 0
          , offset = 0
          , buffer, byteLength, length, klass;
        if(!isObject(data)){
          length     = strictToLength(data, true)
          byteLength = length * BYTES;
          buffer     = new $ArrayBuffer(byteLength);
        } else if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if($length === undefined){
            if($len % BYTES)throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if(byteLength < 0)throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if(byteLength + offset > $len)throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if(TYPED_ARRAY in data){
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while(index < length)addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if(!$iterDetect(function(iter){
      // V8 works with iterators, but fails in many other cases
      // https://code.google.com/p/v8/issues/detail?id=4552
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if(!isObject(data))return new Base(strictToLength(data, ISNT_UINT8));
        if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if(TYPED_ARRAY in data)return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function(key){
        if(!(key in TypedArray))hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if(!LIBRARY)TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator   = TypedArrayPrototype[ITERATOR]
      , CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined)
      , $iterator         = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if(CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)){
      dP(TypedArrayPrototype, TAG, {
        get: function(){ return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES,
      from: $from,
      of: $of
    });

    if(!(BYTES_PER_ELEMENT in TypedArrayPrototype))hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, {set: $set});

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    $export($export.P + $export.F * (TypedArrayPrototype.toString != arrayToString), NAME, {toString: arrayToString});

    $export($export.P + $export.F * fails(function(){
      new TypedArray(1).slice();
    }), NAME, {slice: $slice});

    $export($export.P + $export.F * (fails(function(){
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString()
    }) || !fails(function(){
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, {toLocaleString: $toLocaleString});

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if(!LIBRARY && !CORRECT_ITER_NAME)hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function(){ /* empty */ };
},{"./_an-instance":7,"./_array-copy-within":9,"./_array-fill":10,"./_array-includes":12,"./_array-methods":13,"./_classof":18,"./_ctx":26,"./_descriptors":29,"./_export":33,"./_fails":35,"./_global":39,"./_has":40,"./_hide":41,"./_is-array-iter":47,"./_is-object":50,"./_iter-detect":55,"./_iterators":57,"./_library":59,"./_object-create":67,"./_object-dp":68,"./_object-gopd":71,"./_object-gopn":73,"./_object-gpo":75,"./_property-desc":86,"./_redefine-all":87,"./_same-value":90,"./_set-species":92,"./_species-constructor":96,"./_to-index":106,"./_to-integer":107,"./_to-length":109,"./_to-object":110,"./_to-primitive":111,"./_typed":114,"./_typed-buffer":113,"./_uid":115,"./_wks":118,"./core.get-iterator-method":119,"./es6.array.iterator":131}],113:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , DESCRIPTORS    = require('./_descriptors')
  , LIBRARY        = require('./_library')
  , $typed         = require('./_typed')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , fails          = require('./_fails')
  , anInstance     = require('./_an-instance')
  , toInteger      = require('./_to-integer')
  , toLength       = require('./_to-length')
  , gOPN           = require('./_object-gopn').f
  , dP             = require('./_object-dp').f
  , arrayFill      = require('./_array-fill')
  , setToStringTag = require('./_set-to-string-tag')
  , ARRAY_BUFFER   = 'ArrayBuffer'
  , DATA_VIEW      = 'DataView'
  , PROTOTYPE      = 'prototype'
  , WRONG_LENGTH   = 'Wrong length!'
  , WRONG_INDEX    = 'Wrong index!'
  , $ArrayBuffer   = global[ARRAY_BUFFER]
  , $DataView      = global[DATA_VIEW]
  , Math           = global.Math
  , RangeError     = global.RangeError
  , Infinity       = global.Infinity
  , BaseBuffer     = $ArrayBuffer
  , abs            = Math.abs
  , pow            = Math.pow
  , floor          = Math.floor
  , log            = Math.log
  , LN2            = Math.LN2
  , BUFFER         = 'buffer'
  , BYTE_LENGTH    = 'byteLength'
  , BYTE_OFFSET    = 'byteOffset'
  , $BUFFER        = DESCRIPTORS ? '_b' : BUFFER
  , $LENGTH        = DESCRIPTORS ? '_l' : BYTE_LENGTH
  , $OFFSET        = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
var packIEEE754 = function(value, mLen, nBytes){
  var buffer = Array(nBytes)
    , eLen   = nBytes * 8 - mLen - 1
    , eMax   = (1 << eLen) - 1
    , eBias  = eMax >> 1
    , rt     = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0
    , i      = 0
    , s      = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0
    , e, m, c;
  value = abs(value)
  if(value != value || value === Infinity){
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if(value * (c = pow(2, -e)) < 1){
      e--;
      c *= 2;
    }
    if(e + eBias >= 1){
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if(value * c >= 2){
      e++;
      c /= 2;
    }
    if(e + eBias >= eMax){
      m = 0;
      e = eMax;
    } else if(e + eBias >= 1){
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for(; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for(; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
};
var unpackIEEE754 = function(buffer, mLen, nBytes){
  var eLen  = nBytes * 8 - mLen - 1
    , eMax  = (1 << eLen) - 1
    , eBias = eMax >> 1
    , nBits = eLen - 7
    , i     = nBytes - 1
    , s     = buffer[i--]
    , e     = s & 127
    , m;
  s >>= 7;
  for(; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for(; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if(e === 0){
    e = 1 - eBias;
  } else if(e === eMax){
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
};

var unpackI32 = function(bytes){
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
};
var packI8 = function(it){
  return [it & 0xff];
};
var packI16 = function(it){
  return [it & 0xff, it >> 8 & 0xff];
};
var packI32 = function(it){
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
};
var packF64 = function(it){
  return packIEEE754(it, 52, 8);
};
var packF32 = function(it){
  return packIEEE754(it, 23, 4);
};

var addGetter = function(C, key, internal){
  dP(C[PROTOTYPE], key, {get: function(){ return this[internal]; }});
};

var get = function(view, bytes, index, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
};
var set = function(view, bytes, index, conversion, value, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = conversion(+value);
  for(var i = 0; i < bytes; i++)store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
};

var validateArrayBufferArguments = function(that, length){
  anInstance(that, $ArrayBuffer, ARRAY_BUFFER);
  var numberLength = +length
    , byteLength   = toLength(numberLength);
  if(numberLength != byteLength)throw RangeError(WRONG_LENGTH);
  return byteLength;
};

if(!$typed.ABV){
  $ArrayBuffer = function ArrayBuffer(length){
    var byteLength = validateArrayBufferArguments(this, length);
    this._b       = arrayFill.call(Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength){
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH]
      , offset       = toInteger(byteOffset);
    if(offset < 0 || offset > bufferLength)throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if(offset + byteLength > bufferLength)throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if(DESCRIPTORS){
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset){
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset){
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /*, littleEndian */){
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if(!fails(function(){
    new $ArrayBuffer;     // eslint-disable-line no-new
  }) || !fails(function(){
    new $ArrayBuffer(.5); // eslint-disable-line no-new
  })){
    $ArrayBuffer = function ArrayBuffer(length){
      return new BaseBuffer(validateArrayBufferArguments(this, length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for(var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j; ){
      if(!((key = keys[j++]) in $ArrayBuffer))hide($ArrayBuffer, key, BaseBuffer[key]);
    };
    if(!LIBRARY)ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2))
    , $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if(view.getInt8(0) || !view.getInt8(1))redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
},{"./_an-instance":7,"./_array-fill":10,"./_descriptors":29,"./_fails":35,"./_global":39,"./_hide":41,"./_library":59,"./_object-dp":68,"./_object-gopn":73,"./_redefine-all":87,"./_set-to-string-tag":93,"./_to-integer":107,"./_to-length":109,"./_typed":114}],114:[function(require,module,exports){
var global = require('./_global')
  , hide   = require('./_hide')
  , uid    = require('./_uid')
  , TYPED  = uid('typed_array')
  , VIEW   = uid('view')
  , ABV    = !!(global.ArrayBuffer && global.DataView)
  , CONSTR = ABV
  , i = 0, l = 9, Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while(i < l){
  if(Typed = global[TypedArrayConstructors[i++]]){
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV:    ABV,
  CONSTR: CONSTR,
  TYPED:  TYPED,
  VIEW:   VIEW
};
},{"./_global":39,"./_hide":41,"./_uid":115}],115:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],116:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":24,"./_global":39,"./_library":59,"./_object-dp":68,"./_wks-ext":117}],117:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":118}],118:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":39,"./_shared":95,"./_uid":115}],119:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":18,"./_core":24,"./_iterators":57,"./_wks":118}],120:[function(require,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $export = require('./_export')
  , $re     = require('./_replacer')(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', {escape: function escape(it){ return $re(it); }});

},{"./_export":33,"./_replacer":89}],121:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', {copyWithin: require('./_array-copy-within')});

require('./_add-to-unscopables')('copyWithin');
},{"./_add-to-unscopables":6,"./_array-copy-within":9,"./_export":33}],122:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $every  = require('./_array-methods')(4);

$export($export.P + $export.F * !require('./_strict-method')([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */){
    return $every(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":13,"./_export":33,"./_strict-method":97}],123:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', {fill: require('./_array-fill')});

require('./_add-to-unscopables')('fill');
},{"./_add-to-unscopables":6,"./_array-fill":10,"./_export":33}],124:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $filter = require('./_array-methods')(2);

$export($export.P + $export.F * !require('./_strict-method')([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */){
    return $filter(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":13,"./_export":33,"./_strict-method":97}],125:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export')
  , $find   = require('./_array-methods')(6)
  , KEY     = 'findIndex'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);
},{"./_add-to-unscopables":6,"./_array-methods":13,"./_export":33}],126:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export')
  , $find   = require('./_array-methods')(5)
  , KEY     = 'find'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);
},{"./_add-to-unscopables":6,"./_array-methods":13,"./_export":33}],127:[function(require,module,exports){
'use strict';
var $export  = require('./_export')
  , $forEach = require('./_array-methods')(0)
  , STRICT   = require('./_strict-method')([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */){
    return $forEach(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":13,"./_export":33,"./_strict-method":97}],128:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":25,"./_ctx":26,"./_export":33,"./_is-array-iter":47,"./_iter-call":52,"./_iter-detect":55,"./_to-length":109,"./_to-object":110,"./core.get-iterator-method":119}],129:[function(require,module,exports){
'use strict';
var $export       = require('./_export')
  , $indexOf      = require('./_array-includes')(false)
  , $native       = [].indexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /*, fromIndex = 0 */){
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});
},{"./_array-includes":12,"./_export":33,"./_strict-method":97}],130:[function(require,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = require('./_export');

$export($export.S, 'Array', {isArray: require('./_is-array')});
},{"./_export":33,"./_is-array":48}],131:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":6,"./_iter-define":54,"./_iter-step":56,"./_iterators":57,"./_to-iobject":108}],132:[function(require,module,exports){
'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var $export   = require('./_export')
  , toIObject = require('./_to-iobject')
  , arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (require('./_iobject') != Object || !require('./_strict-method')(arrayJoin)), 'Array', {
  join: function join(separator){
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});
},{"./_export":33,"./_iobject":46,"./_strict-method":97,"./_to-iobject":108}],133:[function(require,module,exports){
'use strict';
var $export       = require('./_export')
  , toIObject     = require('./_to-iobject')
  , toInteger     = require('./_to-integer')
  , toLength      = require('./_to-length')
  , $native       = [].lastIndexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !require('./_strict-method')($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex = @[*-1] */){
    // convert -0 to +0
    if(NEGATIVE_ZERO)return $native.apply(this, arguments) || 0;
    var O      = toIObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, toInteger(arguments[1]));
    if(index < 0)index = length + index;
    for(;index >= 0; index--)if(index in O)if(O[index] === searchElement)return index || 0;
    return -1;
  }
});
},{"./_export":33,"./_strict-method":97,"./_to-integer":107,"./_to-iobject":108,"./_to-length":109}],134:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $map    = require('./_array-methods')(1);

$export($export.P + $export.F * !require('./_strict-method')([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */){
    return $map(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":13,"./_export":33,"./_strict-method":97}],135:[function(require,module,exports){
'use strict';
var $export        = require('./_export')
  , createProperty = require('./_create-property');

// WebKit Array.of isn't generic
$export($export.S + $export.F * require('./_fails')(function(){
  function F(){}
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , aLen   = arguments.length
      , result = new (typeof this == 'function' ? this : Array)(aLen);
    while(aLen > index)createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});
},{"./_create-property":25,"./_export":33,"./_fails":35}],136:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
},{"./_array-reduce":14,"./_export":33,"./_strict-method":97}],137:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $reduce = require('./_array-reduce');

$export($export.P + $export.F * !require('./_strict-method')([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
},{"./_array-reduce":14,"./_export":33,"./_strict-method":97}],138:[function(require,module,exports){
'use strict';
var $export    = require('./_export')
  , html       = require('./_html')
  , cof        = require('./_cof')
  , toIndex    = require('./_to-index')
  , toLength   = require('./_to-length')
  , arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * require('./_fails')(function(){
  if(html)arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return arraySlice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
},{"./_cof":19,"./_export":33,"./_fails":35,"./_html":42,"./_to-index":106,"./_to-length":109}],139:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $some   = require('./_array-methods')(3);

$export($export.P + $export.F * !require('./_strict-method')([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */){
    return $some(this, callbackfn, arguments[1]);
  }
});
},{"./_array-methods":13,"./_export":33,"./_strict-method":97}],140:[function(require,module,exports){
'use strict';
var $export   = require('./_export')
  , aFunction = require('./_a-function')
  , toObject  = require('./_to-object')
  , fails     = require('./_fails')
  , $sort     = [].sort
  , test      = [1, 2, 3];

$export($export.P + $export.F * (fails(function(){
  // IE8-
  test.sort(undefined);
}) || !fails(function(){
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !require('./_strict-method')($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn){
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});
},{"./_a-function":4,"./_export":33,"./_fails":35,"./_strict-method":97,"./_to-object":110}],141:[function(require,module,exports){
require('./_set-species')('Array');
},{"./_set-species":92}],142:[function(require,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = require('./_export');

$export($export.S, 'Date', {now: function(){ return new Date().getTime(); }});
},{"./_export":33}],143:[function(require,module,exports){
'use strict';
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = require('./_export')
  , fails   = require('./_fails')
  , getTime = Date.prototype.getTime;

var lz = function(num){
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (fails(function(){
  return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
}) || !fails(function(){
  new Date(NaN).toISOString();
})), 'Date', {
  toISOString: function toISOString(){
    if(!isFinite(getTime.call(this)))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }
});
},{"./_export":33,"./_fails":35}],144:[function(require,module,exports){
'use strict';
var $export     = require('./_export')
  , toObject    = require('./_to-object')
  , toPrimitive = require('./_to-primitive');

$export($export.P + $export.F * require('./_fails')(function(){
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({toISOString: function(){ return 1; }}) !== 1;
}), 'Date', {
  toJSON: function toJSON(key){
    var O  = toObject(this)
      , pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});
},{"./_export":33,"./_fails":35,"./_to-object":110,"./_to-primitive":111}],145:[function(require,module,exports){
var TO_PRIMITIVE = require('./_wks')('toPrimitive')
  , proto        = Date.prototype;

if(!(TO_PRIMITIVE in proto))require('./_hide')(proto, TO_PRIMITIVE, require('./_date-to-primitive'));
},{"./_date-to-primitive":27,"./_hide":41,"./_wks":118}],146:[function(require,module,exports){
var DateProto    = Date.prototype
  , INVALID_DATE = 'Invalid Date'
  , TO_STRING    = 'toString'
  , $toString    = DateProto[TO_STRING]
  , getTime      = DateProto.getTime;
if(new Date(NaN) + '' != INVALID_DATE){
  require('./_redefine')(DateProto, TO_STRING, function toString(){
    var value = getTime.call(this);
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}
},{"./_redefine":88}],147:[function(require,module,exports){
// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
var $export = require('./_export');

$export($export.P, 'Function', {bind: require('./_bind')});
},{"./_bind":17,"./_export":33}],148:[function(require,module,exports){
'use strict';
var isObject       = require('./_is-object')
  , getPrototypeOf = require('./_object-gpo')
  , HAS_INSTANCE   = require('./_wks')('hasInstance')
  , FunctionProto  = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))require('./_object-dp').f(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(typeof this != 'function' || !isObject(O))return false;
  if(!isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = getPrototypeOf(O))if(this.prototype === O)return true;
  return false;
}});
},{"./_is-object":50,"./_object-dp":68,"./_object-gpo":75,"./_wks":118}],149:[function(require,module,exports){
var dP         = require('./_object-dp').f
  , createDesc = require('./_property-desc')
  , has        = require('./_has')
  , FProto     = Function.prototype
  , nameRE     = /^\s*function ([^ (]*)/
  , NAME       = 'name';

var isExtensible = Object.isExtensible || function(){
  return true;
};

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function(){
    try {
      var that = this
        , name = ('' + that).match(nameRE)[1];
      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
      return name;
    } catch(e){
      return '';
    }
  }
});
},{"./_descriptors":29,"./_has":40,"./_object-dp":68,"./_property-desc":86}],150:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.1 Map Objects
module.exports = require('./_collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./_collection":23,"./_collection-strong":20}],151:[function(require,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = require('./_export')
  , log1p   = require('./_math-log1p')
  , sqrt    = Math.sqrt
  , $acosh  = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN 
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
},{"./_export":33,"./_math-log1p":61}],152:[function(require,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = require('./_export')
  , $asinh  = Math.asinh;

function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0 
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {asinh: asinh});
},{"./_export":33}],153:[function(require,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = require('./_export')
  , $atanh  = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0 
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
},{"./_export":33}],154:[function(require,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = require('./_export')
  , sign    = require('./_math-sign');

$export($export.S, 'Math', {
  cbrt: function cbrt(x){
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
},{"./_export":33,"./_math-sign":62}],155:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
},{"./_export":33}],156:[function(require,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = require('./_export')
  , exp     = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
},{"./_export":33}],157:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = require('./_export')
  , $expm1  = require('./_math-expm1');

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});
},{"./_export":33,"./_math-expm1":60}],158:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $export   = require('./_export')
  , sign      = require('./_math-sign')
  , pow       = Math.pow
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);

var roundTiesToEven = function(n){
  return n + 1 / EPSILON - 1 / EPSILON;
};


$export($export.S, 'Math', {
  fround: function fround(x){
    var $abs  = Math.abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  }
});
},{"./_export":33,"./_math-sign":62}],159:[function(require,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $export = require('./_export')
  , abs     = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , aLen = arguments.length
      , larg = 0
      , arg, div;
    while(i < aLen){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});
},{"./_export":33}],160:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = require('./_export')
  , $imul   = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * require('./_fails')(function(){
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y){
    var UINT16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UINT16 & xn
      , yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
},{"./_export":33,"./_fails":35}],161:[function(require,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log10: function log10(x){
    return Math.log(x) / Math.LN10;
  }
});
},{"./_export":33}],162:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = require('./_export');

$export($export.S, 'Math', {log1p: require('./_math-log1p')});
},{"./_export":33,"./_math-log1p":61}],163:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x){
    return Math.log(x) / Math.LN2;
  }
});
},{"./_export":33}],164:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = require('./_export');

$export($export.S, 'Math', {sign: require('./_math-sign')});
},{"./_export":33,"./_math-sign":62}],165:[function(require,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = require('./_export')
  , expm1   = require('./_math-expm1')
  , exp     = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * require('./_fails')(function(){
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x){
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
},{"./_export":33,"./_fails":35,"./_math-expm1":60}],166:[function(require,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = require('./_export')
  , expm1   = require('./_math-expm1')
  , exp     = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
},{"./_export":33,"./_math-expm1":60}],167:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it){
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
},{"./_export":33}],168:[function(require,module,exports){
'use strict';
var global            = require('./_global')
  , has               = require('./_has')
  , cof               = require('./_cof')
  , inheritIfRequired = require('./_inherit-if-required')
  , toPrimitive       = require('./_to-primitive')
  , fails             = require('./_fails')
  , gOPN              = require('./_object-gopn').f
  , gOPD              = require('./_object-gopd').f
  , dP                = require('./_object-dp').f
  , $trim             = require('./_string-trim').trim
  , NUMBER            = 'Number'
  , $Number           = global[NUMBER]
  , Base              = $Number
  , proto             = $Number.prototype
  // Opera ~12 has broken Object#toString
  , BROKEN_COF        = cof(require('./_object-create')(proto)) == NUMBER
  , TRIM              = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function(argument){
  var it = toPrimitive(argument, false);
  if(typeof it == 'string' && it.length > 2){
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0)
      , third, radix, maxCode;
    if(first === 43 || first === 45){
      third = it.charCodeAt(2);
      if(third === 88 || third === 120)return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if(first === 48){
      switch(it.charCodeAt(1)){
        case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default : return +it;
      }
      for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if(code < 48 || code > maxCode)return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if(!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')){
  $Number = function Number(value){
    var it = arguments.length < 1 ? 0 : value
      , that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for(var keys = require('./_descriptors') ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++){
    if(has(Base, key = keys[j]) && !has($Number, key)){
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./_redefine')(global, NUMBER, $Number);
}
},{"./_cof":19,"./_descriptors":29,"./_fails":35,"./_global":39,"./_has":40,"./_inherit-if-required":44,"./_object-create":67,"./_object-dp":68,"./_object-gopd":71,"./_object-gopn":73,"./_redefine":88,"./_string-trim":103,"./_to-primitive":111}],169:[function(require,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = require('./_export');

$export($export.S, 'Number', {EPSILON: Math.pow(2, -52)});
},{"./_export":33}],170:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = require('./_export')
  , _isFinite = require('./_global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"./_export":33,"./_global":39}],171:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = require('./_export');

$export($export.S, 'Number', {isInteger: require('./_is-integer')});
},{"./_export":33,"./_is-integer":49}],172:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./_export":33}],173:[function(require,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export   = require('./_export')
  , isInteger = require('./_is-integer')
  , abs       = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
},{"./_export":33,"./_is-integer":49}],174:[function(require,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});
},{"./_export":33}],175:[function(require,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});
},{"./_export":33}],176:[function(require,module,exports){
var $export     = require('./_export')
  , $parseFloat = require('./_parse-float');
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', {parseFloat: $parseFloat});
},{"./_export":33,"./_parse-float":82}],177:[function(require,module,exports){
var $export   = require('./_export')
  , $parseInt = require('./_parse-int');
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', {parseInt: $parseInt});
},{"./_export":33,"./_parse-int":83}],178:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , toInteger    = require('./_to-integer')
  , aNumberValue = require('./_a-number-value')
  , repeat       = require('./_string-repeat')
  , $toFixed     = 1..toFixed
  , floor        = Math.floor
  , data         = [0, 0, 0, 0, 0, 0]
  , ERROR        = 'Number.toFixed: incorrect invocation!'
  , ZERO         = '0';

var multiply = function(n, c){
  var i  = -1
    , c2 = c;
  while(++i < 6){
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function(n){
  var i = 6
    , c = 0;
  while(--i >= 0){
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function(){
  var i = 6
    , s = '';
  while(--i >= 0){
    if(s !== '' || i === 0 || data[i] !== 0){
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function(x, n, acc){
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function(x){
  var n  = 0
    , x2 = x;
  while(x2 >= 4096){
    n += 12;
    x2 /= 4096;
  }
  while(x2 >= 2){
    n  += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128..toFixed(0) !== '1000000000000000128'
) || !require('./_fails')(function(){
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits){
    var x = aNumberValue(this, ERROR)
      , f = toInteger(fractionDigits)
      , s = ''
      , m = ZERO
      , e, z, j, k;
    if(f < 0 || f > 20)throw RangeError(ERROR);
    if(x != x)return 'NaN';
    if(x <= -1e21 || x >= 1e21)return String(x);
    if(x < 0){
      s = '-';
      x = -x;
    }
    if(x > 1e-21){
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if(e > 0){
        multiply(0, z);
        j = f;
        while(j >= 7){
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while(j >= 23){
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if(f > 0){
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});
},{"./_a-number-value":5,"./_export":33,"./_fails":35,"./_string-repeat":102,"./_to-integer":107}],179:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , $fails       = require('./_fails')
  , aNumberValue = require('./_a-number-value')
  , $toPrecision = 1..toPrecision;

$export($export.P + $export.F * ($fails(function(){
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !$fails(function(){
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision){
    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision); 
  }
});
},{"./_a-number-value":5,"./_export":33,"./_fails":35}],180:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":33,"./_object-assign":66}],181:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":33,"./_object-create":67}],182:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperties: require('./_object-dps')});
},{"./_descriptors":29,"./_export":33,"./_object-dps":69}],183:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":29,"./_export":33,"./_object-dp":68}],184:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"./_is-object":50,"./_meta":63,"./_object-sap":79}],185:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":71,"./_object-sap":79,"./_to-iobject":108}],186:[function(require,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
require('./_object-sap')('getOwnPropertyNames', function(){
  return require('./_object-gopn-ext').f;
});
},{"./_object-gopn-ext":72,"./_object-sap":79}],187:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":75,"./_object-sap":79,"./_to-object":110}],188:[function(require,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = require('./_is-object');

require('./_object-sap')('isExtensible', function($isExtensible){
  return function isExtensible(it){
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});
},{"./_is-object":50,"./_object-sap":79}],189:[function(require,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = require('./_is-object');

require('./_object-sap')('isFrozen', function($isFrozen){
  return function isFrozen(it){
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});
},{"./_is-object":50,"./_object-sap":79}],190:[function(require,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = require('./_is-object');

require('./_object-sap')('isSealed', function($isSealed){
  return function isSealed(it){
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});
},{"./_is-object":50,"./_object-sap":79}],191:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = require('./_export');
$export($export.S, 'Object', {is: require('./_same-value')});
},{"./_export":33,"./_same-value":90}],192:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object')
  , $keys    = require('./_object-keys');

require('./_object-sap')('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"./_object-keys":77,"./_object-sap":79,"./_to-object":110}],193:[function(require,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('preventExtensions', function($preventExtensions){
  return function preventExtensions(it){
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});
},{"./_is-object":50,"./_meta":63,"./_object-sap":79}],194:[function(require,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object')
  , meta     = require('./_meta').onFreeze;

require('./_object-sap')('seal', function($seal){
  return function seal(it){
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});
},{"./_is-object":50,"./_meta":63,"./_object-sap":79}],195:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":33,"./_set-proto":91}],196:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof')
  , test    = {};
test[require('./_wks')('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  require('./_redefine')(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"./_classof":18,"./_redefine":88,"./_wks":118}],197:[function(require,module,exports){
var $export     = require('./_export')
  , $parseFloat = require('./_parse-float');
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), {parseFloat: $parseFloat});
},{"./_export":33,"./_parse-float":82}],198:[function(require,module,exports){
var $export   = require('./_export')
  , $parseInt = require('./_parse-int');
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), {parseInt: $parseInt});
},{"./_export":33,"./_parse-int":83}],199:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":4,"./_an-instance":7,"./_classof":18,"./_core":24,"./_ctx":26,"./_export":33,"./_for-of":38,"./_global":39,"./_is-object":50,"./_iter-detect":55,"./_library":59,"./_microtask":65,"./_redefine-all":87,"./_set-species":92,"./_set-to-string-tag":93,"./_species-constructor":96,"./_task":105,"./_wks":118}],200:[function(require,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export   = require('./_export')
  , aFunction = require('./_a-function')
  , anObject  = require('./_an-object')
  , rApply    = (require('./_global').Reflect || {}).apply
  , fApply    = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !require('./_fails')(function(){
  rApply(function(){});
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList){
    var T = aFunction(target)
      , L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});
},{"./_a-function":4,"./_an-object":8,"./_export":33,"./_fails":35,"./_global":39}],201:[function(require,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export    = require('./_export')
  , create     = require('./_object-create')
  , aFunction  = require('./_a-function')
  , anObject   = require('./_an-object')
  , isObject   = require('./_is-object')
  , fails      = require('./_fails')
  , bind       = require('./_bind')
  , rConstruct = (require('./_global').Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function(){
  function F(){}
  return !(rConstruct(function(){}, [], F) instanceof F);
});
var ARGS_BUG = !fails(function(){
  rConstruct(function(){});
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /*, newTarget*/){
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if(ARGS_BUG && !NEW_TARGET_BUG)return rConstruct(Target, args, newTarget);
    if(Target == newTarget){
      // w/o altered newTarget, optimization for 0-4 arguments
      switch(args.length){
        case 0: return new Target;
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args));
    }
    // with altered newTarget, not support built-in constructors
    var proto    = newTarget.prototype
      , instance = create(isObject(proto) ? proto : Object.prototype)
      , result   = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});
},{"./_a-function":4,"./_an-object":8,"./_bind":17,"./_export":33,"./_fails":35,"./_global":39,"./_is-object":50,"./_object-create":67}],202:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP          = require('./_object-dp')
  , $export     = require('./_export')
  , anObject    = require('./_an-object')
  , toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * require('./_fails')(function(){
  Reflect.defineProperty(dP.f({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_an-object":8,"./_export":33,"./_fails":35,"./_object-dp":68,"./_to-primitive":111}],203:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export  = require('./_export')
  , gOPD     = require('./_object-gopd').f
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
},{"./_an-object":8,"./_export":33,"./_object-gopd":71}],204:[function(require,module,exports){
'use strict';
// 26.1.5 Reflect.enumerate(target)
var $export  = require('./_export')
  , anObject = require('./_an-object');
var Enumerate = function(iterated){
  this._t = anObject(iterated); // target
  this._i = 0;                  // next index
  var keys = this._k = []       // keys
    , key;
  for(key in iterated)keys.push(key);
};
require('./_iter-create')(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$export($export.S, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});
},{"./_an-object":8,"./_export":33,"./_iter-create":53}],205:[function(require,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD     = require('./_object-gopd')
  , $export  = require('./_export')
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return gOPD.f(anObject(target), propertyKey);
  }
});
},{"./_an-object":8,"./_export":33,"./_object-gopd":71}],206:[function(require,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export  = require('./_export')
  , getProto = require('./_object-gpo')
  , anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(anObject(target));
  }
});
},{"./_an-object":8,"./_export":33,"./_object-gpo":75}],207:[function(require,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD           = require('./_object-gopd')
  , getPrototypeOf = require('./_object-gpo')
  , has            = require('./_has')
  , $export        = require('./_export')
  , isObject       = require('./_is-object')
  , anObject       = require('./_an-object');

function get(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc, proto;
  if(anObject(target) === receiver)return target[propertyKey];
  if(desc = gOPD.f(target, propertyKey))return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if(isObject(proto = getPrototypeOf(target)))return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', {get: get});
},{"./_an-object":8,"./_export":33,"./_has":40,"./_is-object":50,"./_object-gopd":71,"./_object-gpo":75}],208:[function(require,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = require('./_export');

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey){
    return propertyKey in target;
  }
});
},{"./_export":33}],209:[function(require,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export       = require('./_export')
  , anObject      = require('./_an-object')
  , $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});
},{"./_an-object":8,"./_export":33}],210:[function(require,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = require('./_export');

$export($export.S, 'Reflect', {ownKeys: require('./_own-keys')});
},{"./_export":33,"./_own-keys":81}],211:[function(require,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export            = require('./_export')
  , anObject           = require('./_an-object')
  , $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    anObject(target);
    try {
      if($preventExtensions)$preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_an-object":8,"./_export":33}],212:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export  = require('./_export')
  , setProto = require('./_set-proto');

if(setProto)$export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto){
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"./_export":33,"./_set-proto":91}],213:[function(require,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP             = require('./_object-dp')
  , gOPD           = require('./_object-gopd')
  , getPrototypeOf = require('./_object-gpo')
  , has            = require('./_has')
  , $export        = require('./_export')
  , createDesc     = require('./_property-desc')
  , anObject       = require('./_an-object')
  , isObject       = require('./_is-object');

function set(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = gOPD.f(anObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getPrototypeOf(target))){
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if(has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    dP.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', {set: set});
},{"./_an-object":8,"./_export":33,"./_has":40,"./_is-object":50,"./_object-dp":68,"./_object-gopd":71,"./_object-gpo":75,"./_property-desc":86}],214:[function(require,module,exports){
var global            = require('./_global')
  , inheritIfRequired = require('./_inherit-if-required')
  , dP                = require('./_object-dp').f
  , gOPN              = require('./_object-gopn').f
  , isRegExp          = require('./_is-regexp')
  , $flags            = require('./_flags')
  , $RegExp           = global.RegExp
  , Base              = $RegExp
  , proto             = $RegExp.prototype
  , re1               = /a/g
  , re2               = /a/g
  // "new" creates a new object, old webkit buggy here
  , CORRECT_NEW       = new $RegExp(re1) !== re1;

if(require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function(){
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))){
  $RegExp = function RegExp(p, f){
    var tiRE = this instanceof $RegExp
      , piRE = isRegExp(p)
      , fiU  = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function(key){
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function(){ return Base[key]; },
      set: function(it){ Base[key] = it; }
    });
  };
  for(var keys = gOPN(Base), i = 0; keys.length > i; )proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');
},{"./_descriptors":29,"./_fails":35,"./_flags":37,"./_global":39,"./_inherit-if-required":44,"./_is-regexp":51,"./_object-dp":68,"./_object-gopn":73,"./_redefine":88,"./_set-species":92,"./_wks":118}],215:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if(require('./_descriptors') && /./g.flags != 'g')require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});
},{"./_descriptors":29,"./_flags":37,"./_object-dp":68}],216:[function(require,module,exports){
// @@match logic
require('./_fix-re-wks')('match', 1, function(defined, MATCH, $match){
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});
},{"./_fix-re-wks":36}],217:[function(require,module,exports){
// @@replace logic
require('./_fix-re-wks')('replace', 2, function(defined, REPLACE, $replace){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue){
    'use strict';
    var O  = defined(this)
      , fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});
},{"./_fix-re-wks":36}],218:[function(require,module,exports){
// @@search logic
require('./_fix-re-wks')('search', 1, function(defined, SEARCH, $search){
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});
},{"./_fix-re-wks":36}],219:[function(require,module,exports){
// @@split logic
require('./_fix-re-wks')('split', 2, function(defined, SPLIT, $split){
  'use strict';
  var isRegExp   = require('./_is-regexp')
    , _split     = $split
    , $push      = [].push
    , $SPLIT     = 'split'
    , LENGTH     = 'length'
    , LAST_INDEX = 'lastIndex';
  if(
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ){
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function(separator, limit){
      var string = String(this);
      if(separator === undefined && limit === 0)return [];
      // If `separator` is not a regex, use native split
      if(!isRegExp(separator))return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if(!NPCG)separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while(match = separatorCopy.exec(string)){
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if(lastIndex > lastLastIndex){
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          if(!NPCG && match[LENGTH] > 1)match[0].replace(separator2, function(){
            for(i = 1; i < arguments[LENGTH] - 2; i++)if(arguments[i] === undefined)match[i] = undefined;
          });
          if(match[LENGTH] > 1 && match.index < string[LENGTH])$push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if(output[LENGTH] >= splitLimit)break;
        }
        if(separatorCopy[LAST_INDEX] === match.index)separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if(lastLastIndex === string[LENGTH]){
        if(lastLength || !separatorCopy.test(''))output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if('0'[$SPLIT](undefined, 0)[LENGTH]){
    $split = function(separator, limit){
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit){
    var O  = defined(this)
      , fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});
},{"./_fix-re-wks":36,"./_is-regexp":51}],220:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject    = require('./_an-object')
  , $flags      = require('./_flags')
  , DESCRIPTORS = require('./_descriptors')
  , TO_STRING   = 'toString'
  , $toString   = /./[TO_STRING];

var define = function(fn){
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if(require('./_fails')(function(){ return $toString.call({source: 'a', flags: 'b'}) != '/a/b'; })){
  define(function toString(){
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if($toString.name != TO_STRING){
  define(function toString(){
    return $toString.call(this);
  });
}
},{"./_an-object":8,"./_descriptors":29,"./_fails":35,"./_flags":37,"./_redefine":88,"./es6.regexp.flags":215}],221:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":23,"./_collection-strong":20}],222:[function(require,module,exports){
'use strict';
// B.2.3.2 String.prototype.anchor(name)
require('./_string-html')('anchor', function(createHTML){
  return function anchor(name){
    return createHTML(this, 'a', 'name', name);
  }
});
},{"./_string-html":100}],223:[function(require,module,exports){
'use strict';
// B.2.3.3 String.prototype.big()
require('./_string-html')('big', function(createHTML){
  return function big(){
    return createHTML(this, 'big', '', '');
  }
});
},{"./_string-html":100}],224:[function(require,module,exports){
'use strict';
// B.2.3.4 String.prototype.blink()
require('./_string-html')('blink', function(createHTML){
  return function blink(){
    return createHTML(this, 'blink', '', '');
  }
});
},{"./_string-html":100}],225:[function(require,module,exports){
'use strict';
// B.2.3.5 String.prototype.bold()
require('./_string-html')('bold', function(createHTML){
  return function bold(){
    return createHTML(this, 'b', '', '');
  }
});
},{"./_string-html":100}],226:[function(require,module,exports){
'use strict';
var $export = require('./_export')
  , $at     = require('./_string-at')(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./_export":33,"./_string-at":98}],227:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export   = require('./_export')
  , toLength  = require('./_to-length')
  , context   = require('./_string-context')
  , ENDS_WITH = 'endsWith'
  , $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    var that = context(this, searchString, ENDS_WITH)
      , endPosition = arguments.length > 1 ? arguments[1] : undefined
      , len    = toLength(that.length)
      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
      , search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
},{"./_export":33,"./_fails-is-regexp":34,"./_string-context":99,"./_to-length":109}],228:[function(require,module,exports){
'use strict';
// B.2.3.6 String.prototype.fixed()
require('./_string-html')('fixed', function(createHTML){
  return function fixed(){
    return createHTML(this, 'tt', '', '');
  }
});
},{"./_string-html":100}],229:[function(require,module,exports){
'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
require('./_string-html')('fontcolor', function(createHTML){
  return function fontcolor(color){
    return createHTML(this, 'font', 'color', color);
  }
});
},{"./_string-html":100}],230:[function(require,module,exports){
'use strict';
// B.2.3.8 String.prototype.fontsize(size)
require('./_string-html')('fontsize', function(createHTML){
  return function fontsize(size){
    return createHTML(this, 'font', 'size', size);
  }
});
},{"./_string-html":100}],231:[function(require,module,exports){
var $export        = require('./_export')
  , toIndex        = require('./_to-index')
  , fromCharCode   = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res  = []
      , aLen = arguments.length
      , i    = 0
      , code;
    while(aLen > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./_export":33,"./_to-index":106}],232:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export  = require('./_export')
  , context  = require('./_string-context')
  , INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /*, position = 0 */){
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
},{"./_export":33,"./_fails-is-regexp":34,"./_string-context":99}],233:[function(require,module,exports){
'use strict';
// B.2.3.9 String.prototype.italics()
require('./_string-html')('italics', function(createHTML){
  return function italics(){
    return createHTML(this, 'i', '', '');
  }
});
},{"./_string-html":100}],234:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":54,"./_string-at":98}],235:[function(require,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
require('./_string-html')('link', function(createHTML){
  return function link(url){
    return createHTML(this, 'a', 'href', url);
  }
});
},{"./_string-html":100}],236:[function(require,module,exports){
var $export   = require('./_export')
  , toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length');

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl  = toIObject(callSite.raw)
      , len  = toLength(tpl.length)
      , aLen = arguments.length
      , res  = []
      , i    = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < aLen)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./_export":33,"./_to-iobject":108,"./_to-length":109}],237:[function(require,module,exports){
var $export = require('./_export');

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./_string-repeat')
});
},{"./_export":33,"./_string-repeat":102}],238:[function(require,module,exports){
'use strict';
// B.2.3.11 String.prototype.small()
require('./_string-html')('small', function(createHTML){
  return function small(){
    return createHTML(this, 'small', '', '');
  }
});
},{"./_string-html":100}],239:[function(require,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export     = require('./_export')
  , toLength    = require('./_to-length')
  , context     = require('./_string-context')
  , STARTS_WITH = 'startsWith'
  , $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /*, position = 0 */){
    var that   = context(this, searchString, STARTS_WITH)
      , index  = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length))
      , search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
},{"./_export":33,"./_fails-is-regexp":34,"./_string-context":99,"./_to-length":109}],240:[function(require,module,exports){
'use strict';
// B.2.3.12 String.prototype.strike()
require('./_string-html')('strike', function(createHTML){
  return function strike(){
    return createHTML(this, 'strike', '', '');
  }
});
},{"./_string-html":100}],241:[function(require,module,exports){
'use strict';
// B.2.3.13 String.prototype.sub()
require('./_string-html')('sub', function(createHTML){
  return function sub(){
    return createHTML(this, 'sub', '', '');
  }
});
},{"./_string-html":100}],242:[function(require,module,exports){
'use strict';
// B.2.3.14 String.prototype.sup()
require('./_string-html')('sup', function(createHTML){
  return function sup(){
    return createHTML(this, 'sup', '', '');
  }
});
},{"./_string-html":100}],243:[function(require,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
require('./_string-trim')('trim', function($trim){
  return function trim(){
    return $trim(this, 3);
  };
});
},{"./_string-trim":103}],244:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":8,"./_descriptors":29,"./_enum-keys":32,"./_export":33,"./_fails":35,"./_global":39,"./_has":40,"./_hide":41,"./_is-array":48,"./_keyof":58,"./_library":59,"./_meta":63,"./_object-create":67,"./_object-dp":68,"./_object-gopd":71,"./_object-gopn":73,"./_object-gopn-ext":72,"./_object-gops":74,"./_object-keys":77,"./_object-pie":78,"./_property-desc":86,"./_redefine":88,"./_set-to-string-tag":93,"./_shared":95,"./_to-iobject":108,"./_to-primitive":111,"./_uid":115,"./_wks":118,"./_wks-define":116,"./_wks-ext":117}],245:[function(require,module,exports){
'use strict';
var $export      = require('./_export')
  , $typed       = require('./_typed')
  , buffer       = require('./_typed-buffer')
  , anObject     = require('./_an-object')
  , toIndex      = require('./_to-index')
  , toLength     = require('./_to-length')
  , isObject     = require('./_is-object')
  , ArrayBuffer  = require('./_global').ArrayBuffer
  , speciesConstructor = require('./_species-constructor')
  , $ArrayBuffer = buffer.ArrayBuffer
  , $DataView    = buffer.DataView
  , $isView      = $typed.ABV && ArrayBuffer.isView
  , $slice       = $ArrayBuffer.prototype.slice
  , VIEW         = $typed.VIEW
  , ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), {ArrayBuffer: $ArrayBuffer});

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it){
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * require('./_fails')(function(){
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end){
    if($slice !== undefined && end === undefined)return $slice.call(anObject(this), start); // FF fix
    var len    = anObject(this).byteLength
      , first  = toIndex(start, len)
      , final  = toIndex(end === undefined ? len : end, len)
      , result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first))
      , viewS  = new $DataView(this)
      , viewT  = new $DataView(result)
      , index  = 0;
    while(first < final){
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('./_set-species')(ARRAY_BUFFER);
},{"./_an-object":8,"./_export":33,"./_fails":35,"./_global":39,"./_is-object":50,"./_set-species":92,"./_species-constructor":96,"./_to-index":106,"./_to-length":109,"./_typed":114,"./_typed-buffer":113}],246:[function(require,module,exports){
var $export = require('./_export');
$export($export.G + $export.W + $export.F * !require('./_typed').ABV, {
  DataView: require('./_typed-buffer').DataView
});
},{"./_export":33,"./_typed":114,"./_typed-buffer":113}],247:[function(require,module,exports){
require('./_typed-array')('Float32', 4, function(init){
  return function Float32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],248:[function(require,module,exports){
require('./_typed-array')('Float64', 8, function(init){
  return function Float64Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],249:[function(require,module,exports){
require('./_typed-array')('Int16', 2, function(init){
  return function Int16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],250:[function(require,module,exports){
require('./_typed-array')('Int32', 4, function(init){
  return function Int32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],251:[function(require,module,exports){
require('./_typed-array')('Int8', 1, function(init){
  return function Int8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],252:[function(require,module,exports){
require('./_typed-array')('Uint16', 2, function(init){
  return function Uint16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],253:[function(require,module,exports){
require('./_typed-array')('Uint32', 4, function(init){
  return function Uint32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],254:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function(init){
  return function Uint8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"./_typed-array":112}],255:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function(init){
  return function Uint8ClampedArray(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
}, true);
},{"./_typed-array":112}],256:[function(require,module,exports){
'use strict';
var each         = require('./_array-methods')(0)
  , redefine     = require('./_redefine')
  , meta         = require('./_meta')
  , assign       = require('./_object-assign')
  , weak         = require('./_collection-weak')
  , isObject     = require('./_is-object')
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./_array-methods":13,"./_collection":23,"./_collection-weak":22,"./_is-object":50,"./_meta":63,"./_object-assign":66,"./_redefine":88}],257:[function(require,module,exports){
'use strict';
var weak = require('./_collection-weak');

// 23.4 WeakSet Objects
require('./_collection')('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./_collection":23,"./_collection-weak":22}],258:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export   = require('./_export')
  , $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');
},{"./_add-to-unscopables":6,"./_array-includes":12,"./_export":33}],259:[function(require,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var $export   = require('./_export')
  , microtask = require('./_microtask')()
  , process   = require('./_global').process
  , isNode    = require('./_cof')(process) == 'process';

$export($export.G, {
  asap: function asap(fn){
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});
},{"./_cof":19,"./_export":33,"./_global":39,"./_microtask":65}],260:[function(require,module,exports){
// https://github.com/ljharb/proposal-is-error
var $export = require('./_export')
  , cof     = require('./_cof');

$export($export.S, 'Error', {
  isError: function isError(it){
    return cof(it) === 'Error';
  }
});
},{"./_cof":19,"./_export":33}],261:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Map', {toJSON: require('./_collection-to-json')('Map')});
},{"./_collection-to-json":21,"./_export":33}],262:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  iaddh: function iaddh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});
},{"./_export":33}],263:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  imulh: function imulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >> 16
      , v1 = $v >> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
  }
});
},{"./_export":33}],264:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  isubh: function isubh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});
},{"./_export":33}],265:[function(require,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = require('./_export');

$export($export.S, 'Math', {
  umulh: function umulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >>> 16
      , v1 = $v >>> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
  }
});
},{"./_export":33}],266:[function(require,module,exports){
'use strict';
var $export         = require('./_export')
  , toObject        = require('./_to-object')
  , aFunction       = require('./_a-function')
  , $defineProperty = require('./_object-dp');

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineGetter__: function __defineGetter__(P, getter){
    $defineProperty.f(toObject(this), P, {get: aFunction(getter), enumerable: true, configurable: true});
  }
});
},{"./_a-function":4,"./_descriptors":29,"./_export":33,"./_object-dp":68,"./_object-forced-pam":70,"./_to-object":110}],267:[function(require,module,exports){
'use strict';
var $export         = require('./_export')
  , toObject        = require('./_to-object')
  , aFunction       = require('./_a-function')
  , $defineProperty = require('./_object-dp');

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __defineSetter__: function __defineSetter__(P, setter){
    $defineProperty.f(toObject(this), P, {set: aFunction(setter), enumerable: true, configurable: true});
  }
});
},{"./_a-function":4,"./_descriptors":29,"./_export":33,"./_object-dp":68,"./_object-forced-pam":70,"./_to-object":110}],268:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export  = require('./_export')
  , $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it){
    return $entries(it);
  }
});
},{"./_export":33,"./_object-to-array":80}],269:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export        = require('./_export')
  , ownKeys        = require('./_own-keys')
  , toIObject      = require('./_to-iobject')
  , gOPD           = require('./_object-gopd')
  , createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toIObject(object)
      , getDesc = gOPD.f
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key;
    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
    return result;
  }
});
},{"./_create-property":25,"./_export":33,"./_object-gopd":71,"./_own-keys":81,"./_to-iobject":108}],270:[function(require,module,exports){
'use strict';
var $export                  = require('./_export')
  , toObject                 = require('./_to-object')
  , toPrimitive              = require('./_to-primitive')
  , getPrototypeOf           = require('./_object-gpo')
  , getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.4 Object.prototype.__lookupGetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupGetter__: function __lookupGetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.get;
    } while(O = getPrototypeOf(O));
  }
});
},{"./_descriptors":29,"./_export":33,"./_object-forced-pam":70,"./_object-gopd":71,"./_object-gpo":75,"./_to-object":110,"./_to-primitive":111}],271:[function(require,module,exports){
'use strict';
var $export                  = require('./_export')
  , toObject                 = require('./_to-object')
  , toPrimitive              = require('./_to-primitive')
  , getPrototypeOf           = require('./_object-gpo')
  , getOwnPropertyDescriptor = require('./_object-gopd').f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
require('./_descriptors') && $export($export.P + require('./_object-forced-pam'), 'Object', {
  __lookupSetter__: function __lookupSetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.set;
    } while(O = getPrototypeOf(O));
  }
});
},{"./_descriptors":29,"./_export":33,"./_object-forced-pam":70,"./_object-gopd":71,"./_object-gpo":75,"./_to-object":110,"./_to-primitive":111}],272:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export')
  , $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"./_export":33,"./_object-to-array":80}],273:[function(require,module,exports){
'use strict';
// https://github.com/zenparsing/es-observable
var $export     = require('./_export')
  , global      = require('./_global')
  , core        = require('./_core')
  , microtask   = require('./_microtask')()
  , OBSERVABLE  = require('./_wks')('observable')
  , aFunction   = require('./_a-function')
  , anObject    = require('./_an-object')
  , anInstance  = require('./_an-instance')
  , redefineAll = require('./_redefine-all')
  , hide        = require('./_hide')
  , forOf       = require('./_for-of')
  , RETURN      = forOf.RETURN;

var getMethod = function(fn){
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function(subscription){
  var cleanup = subscription._c;
  if(cleanup){
    subscription._c = undefined;
    cleanup();
  }
};

var subscriptionClosed = function(subscription){
  return subscription._o === undefined;
};

var closeSubscription = function(subscription){
  if(!subscriptionClosed(subscription)){
    subscription._o = undefined;
    cleanupSubscription(subscription);
  }
};

var Subscription = function(observer, subscriber){
  anObject(observer);
  this._c = undefined;
  this._o = observer;
  observer = new SubscriptionObserver(this);
  try {
    var cleanup      = subscriber(observer)
      , subscription = cleanup;
    if(cleanup != null){
      if(typeof cleanup.unsubscribe === 'function')cleanup = function(){ subscription.unsubscribe(); };
      else aFunction(cleanup);
      this._c = cleanup;
    }
  } catch(e){
    observer.error(e);
    return;
  } if(subscriptionClosed(this))cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe(){ closeSubscription(this); }
});

var SubscriptionObserver = function(subscription){
  this._s = subscription;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      try {
        var m = getMethod(observer.next);
        if(m)return m.call(observer, value);
      } catch(e){
        try {
          closeSubscription(subscription);
        } finally {
          throw e;
        }
      }
    }
  },
  error: function error(value){
    var subscription = this._s;
    if(subscriptionClosed(subscription))throw value;
    var observer = subscription._o;
    subscription._o = undefined;
    try {
      var m = getMethod(observer.error);
      if(!m)throw value;
      value = m.call(observer, value);
    } catch(e){
      try {
        cleanupSubscription(subscription);
      } finally {
        throw e;
      }
    } cleanupSubscription(subscription);
    return value;
  },
  complete: function complete(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      subscription._o = undefined;
      try {
        var m = getMethod(observer.complete);
        value = m ? m.call(observer, value) : undefined;
      } catch(e){
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      } cleanupSubscription(subscription);
      return value;
    }
  }
});

var $Observable = function Observable(subscriber){
  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer){
    return new Subscription(observer, this._f);
  },
  forEach: function forEach(fn){
    var that = this;
    return new (core.Promise || global.Promise)(function(resolve, reject){
      aFunction(fn);
      var subscription = that.subscribe({
        next : function(value){
          try {
            return fn(value);
          } catch(e){
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
    });
  }
});

redefineAll($Observable, {
  from: function from(x){
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if(method){
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function(observer){
        return observable.subscribe(observer);
      });
    }
    return new C(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          try {
            if(forOf(x, false, function(it){
              observer.next(it);
              if(done)return RETURN;
            }) === RETURN)return;
          } catch(e){
            if(done)throw e;
            observer.error(e);
            return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  },
  of: function of(){
    for(var i = 0, l = arguments.length, items = Array(l); i < l;)items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          for(var i = 0; i < items.length; ++i){
            observer.next(items[i]);
            if(done)return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function(){ return this; });

$export($export.G, {Observable: $Observable});

require('./_set-species')('Observable');
},{"./_a-function":4,"./_an-instance":7,"./_an-object":8,"./_core":24,"./_export":33,"./_for-of":38,"./_global":39,"./_hide":41,"./_microtask":65,"./_redefine-all":87,"./_set-species":92,"./_wks":118}],274:[function(require,module,exports){
var metadata                  = require('./_metadata')
  , anObject                  = require('./_an-object')
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey){
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
}});
},{"./_an-object":8,"./_metadata":64}],275:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , toMetaKey              = metadata.key
  , getOrCreateMetadataMap = metadata.map
  , store                  = metadata.store;

metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target /*, targetKey */){
  var targetKey   = arguments.length < 3 ? undefined : toMetaKey(arguments[2])
    , metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
  if(metadataMap.size)return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
}});
},{"./_an-object":8,"./_metadata":64}],276:[function(require,module,exports){
var Set                     = require('./es6.set')
  , from                    = require('./_array-from-iterable')
  , metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , getPrototypeOf          = require('./_object-gpo')
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

var ordinaryMetadataKeys = function(O, P){
  var oKeys  = ordinaryOwnMetadataKeys(O, P)
    , parent = getPrototypeOf(O);
  if(parent === null)return oKeys;
  var pKeys  = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({getMetadataKeys: function getMetadataKeys(target /*, targetKey */){
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"./_an-object":8,"./_array-from-iterable":11,"./_metadata":64,"./_object-gpo":75,"./es6.set":221}],277:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , getPrototypeOf         = require('./_object-gpo')
  , ordinaryHasOwnMetadata = metadata.has
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

var ordinaryGetMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return ordinaryGetOwnMetadata(MetadataKey, O, P);
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

metadata.exp({getMetadata: function getMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":8,"./_metadata":64,"./_object-gpo":75}],278:[function(require,module,exports){
var metadata                = require('./_metadata')
  , anObject                = require('./_an-object')
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target /*, targetKey */){
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"./_an-object":8,"./_metadata":64}],279:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

metadata.exp({getOwnMetadata: function getOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":8,"./_metadata":64}],280:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , getPrototypeOf         = require('./_object-gpo')
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

var ordinaryHasMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

metadata.exp({hasMetadata: function hasMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":8,"./_metadata":64,"./_object-gpo":75}],281:[function(require,module,exports){
var metadata               = require('./_metadata')
  , anObject               = require('./_an-object')
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

metadata.exp({hasOwnMetadata: function hasOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"./_an-object":8,"./_metadata":64}],282:[function(require,module,exports){
var metadata                  = require('./_metadata')
  , anObject                  = require('./_an-object')
  , aFunction                 = require('./_a-function')
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({metadata: function metadata(metadataKey, metadataValue){
  return function decorator(target, targetKey){
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
}});
},{"./_a-function":4,"./_an-object":8,"./_metadata":64}],283:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":21,"./_export":33}],284:[function(require,module,exports){
'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = require('./_export')
  , $at     = require('./_string-at')(true);

$export($export.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./_export":33,"./_string-at":98}],285:[function(require,module,exports){
'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var $export     = require('./_export')
  , defined     = require('./_defined')
  , toLength    = require('./_to-length')
  , isRegExp    = require('./_is-regexp')
  , getFlags    = require('./_flags')
  , RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function(regexp, string){
  this._r = regexp;
  this._s = string;
};

require('./_iter-create')($RegExpStringIterator, 'RegExp String', function next(){
  var match = this._r.exec(this._s);
  return {value: match, done: match === null};
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp){
    defined(this);
    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
    var S     = String(this)
      , flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp)
      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});
},{"./_defined":28,"./_export":33,"./_flags":37,"./_is-regexp":51,"./_iter-create":53,"./_to-length":109}],286:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export')
  , $pad    = require('./_string-pad');

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
},{"./_export":33,"./_string-pad":101}],287:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export')
  , $pad    = require('./_string-pad');

$export($export.P, 'String', {
  padStart: function padStart(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
},{"./_export":33,"./_string-pad":101}],288:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimLeft', function($trim){
  return function trimLeft(){
    return $trim(this, 1);
  };
}, 'trimStart');
},{"./_string-trim":103}],289:[function(require,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
require('./_string-trim')('trimRight', function($trim){
  return function trimRight(){
    return $trim(this, 2);
  };
}, 'trimEnd');
},{"./_string-trim":103}],290:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":116}],291:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":116}],292:[function(require,module,exports){
// https://github.com/ljharb/proposal-global
var $export = require('./_export');

$export($export.S, 'System', {global: require('./_global')});
},{"./_export":33,"./_global":39}],293:[function(require,module,exports){
var $iterators    = require('./es6.array.iterator')
  , redefine      = require('./_redefine')
  , global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , wks           = require('./_wks')
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"./_global":39,"./_hide":41,"./_iterators":57,"./_redefine":88,"./_wks":118,"./es6.array.iterator":131}],294:[function(require,module,exports){
var $export = require('./_export')
  , $task   = require('./_task');
$export($export.G + $export.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./_export":33,"./_task":105}],295:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global     = require('./_global')
  , $export    = require('./_export')
  , invoke     = require('./_invoke')
  , partial    = require('./_partial')
  , navigator  = global.navigator
  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
var wrap = function(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      typeof fn == 'function' ? fn : Function(fn)
    ), time);
  } : set;
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout:  wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
},{"./_export":33,"./_global":39,"./_invoke":45,"./_partial":84}],296:[function(require,module,exports){
require('./modules/es6.symbol');
require('./modules/es6.object.create');
require('./modules/es6.object.define-property');
require('./modules/es6.object.define-properties');
require('./modules/es6.object.get-own-property-descriptor');
require('./modules/es6.object.get-prototype-of');
require('./modules/es6.object.keys');
require('./modules/es6.object.get-own-property-names');
require('./modules/es6.object.freeze');
require('./modules/es6.object.seal');
require('./modules/es6.object.prevent-extensions');
require('./modules/es6.object.is-frozen');
require('./modules/es6.object.is-sealed');
require('./modules/es6.object.is-extensible');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.function.bind');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.parse-int');
require('./modules/es6.parse-float');
require('./modules/es6.number.constructor');
require('./modules/es6.number.to-fixed');
require('./modules/es6.number.to-precision');
require('./modules/es6.number.epsilon');
require('./modules/es6.number.is-finite');
require('./modules/es6.number.is-integer');
require('./modules/es6.number.is-nan');
require('./modules/es6.number.is-safe-integer');
require('./modules/es6.number.max-safe-integer');
require('./modules/es6.number.min-safe-integer');
require('./modules/es6.number.parse-float');
require('./modules/es6.number.parse-int');
require('./modules/es6.math.acosh');
require('./modules/es6.math.asinh');
require('./modules/es6.math.atanh');
require('./modules/es6.math.cbrt');
require('./modules/es6.math.clz32');
require('./modules/es6.math.cosh');
require('./modules/es6.math.expm1');
require('./modules/es6.math.fround');
require('./modules/es6.math.hypot');
require('./modules/es6.math.imul');
require('./modules/es6.math.log10');
require('./modules/es6.math.log1p');
require('./modules/es6.math.log2');
require('./modules/es6.math.sign');
require('./modules/es6.math.sinh');
require('./modules/es6.math.tanh');
require('./modules/es6.math.trunc');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.trim');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.string.anchor');
require('./modules/es6.string.big');
require('./modules/es6.string.blink');
require('./modules/es6.string.bold');
require('./modules/es6.string.fixed');
require('./modules/es6.string.fontcolor');
require('./modules/es6.string.fontsize');
require('./modules/es6.string.italics');
require('./modules/es6.string.link');
require('./modules/es6.string.small');
require('./modules/es6.string.strike');
require('./modules/es6.string.sub');
require('./modules/es6.string.sup');
require('./modules/es6.date.now');
require('./modules/es6.date.to-json');
require('./modules/es6.date.to-iso-string');
require('./modules/es6.date.to-string');
require('./modules/es6.date.to-primitive');
require('./modules/es6.array.is-array');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.join');
require('./modules/es6.array.slice');
require('./modules/es6.array.sort');
require('./modules/es6.array.for-each');
require('./modules/es6.array.map');
require('./modules/es6.array.filter');
require('./modules/es6.array.some');
require('./modules/es6.array.every');
require('./modules/es6.array.reduce');
require('./modules/es6.array.reduce-right');
require('./modules/es6.array.index-of');
require('./modules/es6.array.last-index-of');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.array.species');
require('./modules/es6.array.iterator');
require('./modules/es6.regexp.constructor');
require('./modules/es6.regexp.to-string');
require('./modules/es6.regexp.flags');
require('./modules/es6.regexp.match');
require('./modules/es6.regexp.replace');
require('./modules/es6.regexp.search');
require('./modules/es6.regexp.split');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.typed.array-buffer');
require('./modules/es6.typed.data-view');
require('./modules/es6.typed.int8-array');
require('./modules/es6.typed.uint8-array');
require('./modules/es6.typed.uint8-clamped-array');
require('./modules/es6.typed.int16-array');
require('./modules/es6.typed.uint16-array');
require('./modules/es6.typed.int32-array');
require('./modules/es6.typed.uint32-array');
require('./modules/es6.typed.float32-array');
require('./modules/es6.typed.float64-array');
require('./modules/es6.reflect.apply');
require('./modules/es6.reflect.construct');
require('./modules/es6.reflect.define-property');
require('./modules/es6.reflect.delete-property');
require('./modules/es6.reflect.enumerate');
require('./modules/es6.reflect.get');
require('./modules/es6.reflect.get-own-property-descriptor');
require('./modules/es6.reflect.get-prototype-of');
require('./modules/es6.reflect.has');
require('./modules/es6.reflect.is-extensible');
require('./modules/es6.reflect.own-keys');
require('./modules/es6.reflect.prevent-extensions');
require('./modules/es6.reflect.set');
require('./modules/es6.reflect.set-prototype-of');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.pad-start');
require('./modules/es7.string.pad-end');
require('./modules/es7.string.trim-left');
require('./modules/es7.string.trim-right');
require('./modules/es7.string.match-all');
require('./modules/es7.symbol.async-iterator');
require('./modules/es7.symbol.observable');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.values');
require('./modules/es7.object.entries');
require('./modules/es7.object.define-getter');
require('./modules/es7.object.define-setter');
require('./modules/es7.object.lookup-getter');
require('./modules/es7.object.lookup-setter');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/es7.system.global');
require('./modules/es7.error.is-error');
require('./modules/es7.math.iaddh');
require('./modules/es7.math.isubh');
require('./modules/es7.math.imulh');
require('./modules/es7.math.umulh');
require('./modules/es7.reflect.define-metadata');
require('./modules/es7.reflect.delete-metadata');
require('./modules/es7.reflect.get-metadata');
require('./modules/es7.reflect.get-metadata-keys');
require('./modules/es7.reflect.get-own-metadata');
require('./modules/es7.reflect.get-own-metadata-keys');
require('./modules/es7.reflect.has-metadata');
require('./modules/es7.reflect.has-own-metadata');
require('./modules/es7.reflect.metadata');
require('./modules/es7.asap');
require('./modules/es7.observable');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/_core');
},{"./modules/_core":24,"./modules/es6.array.copy-within":121,"./modules/es6.array.every":122,"./modules/es6.array.fill":123,"./modules/es6.array.filter":124,"./modules/es6.array.find":126,"./modules/es6.array.find-index":125,"./modules/es6.array.for-each":127,"./modules/es6.array.from":128,"./modules/es6.array.index-of":129,"./modules/es6.array.is-array":130,"./modules/es6.array.iterator":131,"./modules/es6.array.join":132,"./modules/es6.array.last-index-of":133,"./modules/es6.array.map":134,"./modules/es6.array.of":135,"./modules/es6.array.reduce":137,"./modules/es6.array.reduce-right":136,"./modules/es6.array.slice":138,"./modules/es6.array.some":139,"./modules/es6.array.sort":140,"./modules/es6.array.species":141,"./modules/es6.date.now":142,"./modules/es6.date.to-iso-string":143,"./modules/es6.date.to-json":144,"./modules/es6.date.to-primitive":145,"./modules/es6.date.to-string":146,"./modules/es6.function.bind":147,"./modules/es6.function.has-instance":148,"./modules/es6.function.name":149,"./modules/es6.map":150,"./modules/es6.math.acosh":151,"./modules/es6.math.asinh":152,"./modules/es6.math.atanh":153,"./modules/es6.math.cbrt":154,"./modules/es6.math.clz32":155,"./modules/es6.math.cosh":156,"./modules/es6.math.expm1":157,"./modules/es6.math.fround":158,"./modules/es6.math.hypot":159,"./modules/es6.math.imul":160,"./modules/es6.math.log10":161,"./modules/es6.math.log1p":162,"./modules/es6.math.log2":163,"./modules/es6.math.sign":164,"./modules/es6.math.sinh":165,"./modules/es6.math.tanh":166,"./modules/es6.math.trunc":167,"./modules/es6.number.constructor":168,"./modules/es6.number.epsilon":169,"./modules/es6.number.is-finite":170,"./modules/es6.number.is-integer":171,"./modules/es6.number.is-nan":172,"./modules/es6.number.is-safe-integer":173,"./modules/es6.number.max-safe-integer":174,"./modules/es6.number.min-safe-integer":175,"./modules/es6.number.parse-float":176,"./modules/es6.number.parse-int":177,"./modules/es6.number.to-fixed":178,"./modules/es6.number.to-precision":179,"./modules/es6.object.assign":180,"./modules/es6.object.create":181,"./modules/es6.object.define-properties":182,"./modules/es6.object.define-property":183,"./modules/es6.object.freeze":184,"./modules/es6.object.get-own-property-descriptor":185,"./modules/es6.object.get-own-property-names":186,"./modules/es6.object.get-prototype-of":187,"./modules/es6.object.is":191,"./modules/es6.object.is-extensible":188,"./modules/es6.object.is-frozen":189,"./modules/es6.object.is-sealed":190,"./modules/es6.object.keys":192,"./modules/es6.object.prevent-extensions":193,"./modules/es6.object.seal":194,"./modules/es6.object.set-prototype-of":195,"./modules/es6.object.to-string":196,"./modules/es6.parse-float":197,"./modules/es6.parse-int":198,"./modules/es6.promise":199,"./modules/es6.reflect.apply":200,"./modules/es6.reflect.construct":201,"./modules/es6.reflect.define-property":202,"./modules/es6.reflect.delete-property":203,"./modules/es6.reflect.enumerate":204,"./modules/es6.reflect.get":207,"./modules/es6.reflect.get-own-property-descriptor":205,"./modules/es6.reflect.get-prototype-of":206,"./modules/es6.reflect.has":208,"./modules/es6.reflect.is-extensible":209,"./modules/es6.reflect.own-keys":210,"./modules/es6.reflect.prevent-extensions":211,"./modules/es6.reflect.set":213,"./modules/es6.reflect.set-prototype-of":212,"./modules/es6.regexp.constructor":214,"./modules/es6.regexp.flags":215,"./modules/es6.regexp.match":216,"./modules/es6.regexp.replace":217,"./modules/es6.regexp.search":218,"./modules/es6.regexp.split":219,"./modules/es6.regexp.to-string":220,"./modules/es6.set":221,"./modules/es6.string.anchor":222,"./modules/es6.string.big":223,"./modules/es6.string.blink":224,"./modules/es6.string.bold":225,"./modules/es6.string.code-point-at":226,"./modules/es6.string.ends-with":227,"./modules/es6.string.fixed":228,"./modules/es6.string.fontcolor":229,"./modules/es6.string.fontsize":230,"./modules/es6.string.from-code-point":231,"./modules/es6.string.includes":232,"./modules/es6.string.italics":233,"./modules/es6.string.iterator":234,"./modules/es6.string.link":235,"./modules/es6.string.raw":236,"./modules/es6.string.repeat":237,"./modules/es6.string.small":238,"./modules/es6.string.starts-with":239,"./modules/es6.string.strike":240,"./modules/es6.string.sub":241,"./modules/es6.string.sup":242,"./modules/es6.string.trim":243,"./modules/es6.symbol":244,"./modules/es6.typed.array-buffer":245,"./modules/es6.typed.data-view":246,"./modules/es6.typed.float32-array":247,"./modules/es6.typed.float64-array":248,"./modules/es6.typed.int16-array":249,"./modules/es6.typed.int32-array":250,"./modules/es6.typed.int8-array":251,"./modules/es6.typed.uint16-array":252,"./modules/es6.typed.uint32-array":253,"./modules/es6.typed.uint8-array":254,"./modules/es6.typed.uint8-clamped-array":255,"./modules/es6.weak-map":256,"./modules/es6.weak-set":257,"./modules/es7.array.includes":258,"./modules/es7.asap":259,"./modules/es7.error.is-error":260,"./modules/es7.map.to-json":261,"./modules/es7.math.iaddh":262,"./modules/es7.math.imulh":263,"./modules/es7.math.isubh":264,"./modules/es7.math.umulh":265,"./modules/es7.object.define-getter":266,"./modules/es7.object.define-setter":267,"./modules/es7.object.entries":268,"./modules/es7.object.get-own-property-descriptors":269,"./modules/es7.object.lookup-getter":270,"./modules/es7.object.lookup-setter":271,"./modules/es7.object.values":272,"./modules/es7.observable":273,"./modules/es7.reflect.define-metadata":274,"./modules/es7.reflect.delete-metadata":275,"./modules/es7.reflect.get-metadata":277,"./modules/es7.reflect.get-metadata-keys":276,"./modules/es7.reflect.get-own-metadata":279,"./modules/es7.reflect.get-own-metadata-keys":278,"./modules/es7.reflect.has-metadata":280,"./modules/es7.reflect.has-own-metadata":281,"./modules/es7.reflect.metadata":282,"./modules/es7.set.to-json":283,"./modules/es7.string.at":284,"./modules/es7.string.match-all":285,"./modules/es7.string.pad-end":286,"./modules/es7.string.pad-start":287,"./modules/es7.string.trim-left":288,"./modules/es7.string.trim-right":289,"./modules/es7.symbol.async-iterator":290,"./modules/es7.symbol.observable":291,"./modules/es7.system.global":292,"./modules/web.dom.iterable":293,"./modules/web.immediate":294,"./modules/web.timers":295}],297:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.JSONPRequest = exports.getJSON = exports.getImageRaw = exports.Http = undefined;

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

require('babel-polyfill');

var _loggerPro = require('logger-pro');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

_loggerPro.Logger.init({ enabled: true, level: 'log' });
var LOG = _loggerPro.Logger;

var defaultOptions = {
    method: 'GET',
    url: '',
    attempt: 1,
    responseType: 'json',
    dataType: 'json',
    callback: function callback() {},
    headers: {},
    data: null,
    withCredentials: false,
    async: true,
    mimeType: '',
    retryAfter: 0,
    onProgress: function onProgress() {}
};

var Http = function () {

    function Http(options) {
        var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

        _classCallCheck(this, Http);

        var self = this;
        this.options = (0, _utils.extend)(defaultOptions, options);
        this.calls = [];
        this.callback = callback;
        this.promise = new Promise(function (resolve, reject) {
            self.do(resolve, reject);
        });
    }

    _createClass(Http, [{
        key: 'do',
        value: function _do(resolve, reject) {
            var self = this;
            if (this.options.attempt === 0) {
                var lastCall = this.calls[this.calls.length - 1];
                reject({ status: lastCall.status, statusText: lastCall.statusText });
                self.callback(lastCall.status);
                clearTimeout(self.timeoutID);
                self.timeoutID = null;
                return;
            }

            if (this.options.method.toUpperCase() === 'JSONP') {
                var call = new JSONPRequest(this.options.url, this.options.timeout || 3000).prom.then(function (response) {
                    resolve(response);
                    self.callback(response);
                }).catch(function (reason) {
                    reject(reason);
                    self.callback(reason);
                });
                this.calls.push(call);
                return;
            }

            var xhr;
            if (Http.isXMLHttpRequestSupported()) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP');
            }

            this.calls.push(xhr);

            xhr.open(this.options.method.toUpperCase(), this.options.url, this.options.async);

            if (self.options.dataType === 'json') {
                self.options.data = JSON.stringify(self.options.data);
                xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
            }

            if (this.options.headers) {
                addCustomHeaders(this.options.headers, xhr);
            }

            if (this.options.withCredentials && Http.isCORSSupported()) {
                xhr.withCredentials = true;
            }

            var responseTypeAware = 'responseType' in xhr;

            if (responseTypeAware) {
                xhr.responseType = this.options.responseType;
            }

            LOG.log('responseType setted to ', xhr.responseType);

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        if (xhr.responseType === 'blob') {
                            LOG.log('BLOB CASE!');

                            var blob = new Blob([xhr.response], { type: self.options.mimeType });
                            var fileReader = new FileReader();

                            fileReader.onload = function (e) {
                                var raw = e.target.result;
                                resolve([raw, xhr.status, xhr]);
                            };

                            fileReader.readAsDataURL(blob);
                        } else {
                            var result = parseResponse.bind(self)(xhr);
                            resolve(result);
                            self.callback(result);
                        }

                        self.options.attempt = 0;
                    } else {
                        self.timeoutID = setTimeout(function () {
                            self.options.attempt -= 1;
                            LOG.log('FAIL. ' + xhr.status + ' still more ', self.options.attempt, ' attempts');
                            self.do(resolve, reject);
                        }, self.options.retryAfter);
                    }
                }
            };

            xhr.onprogress = wrapProgress(self.options.onProgress);
            xhr.send(self.options.data);
        }

    }], [{
        key: 'isXMLHttpRequestSupported',
        value: function isXMLHttpRequestSupported() {
            return !!window.XMLHttpRequest;
        }
    }, {
        key: 'isCORSSupported',
        value: function isCORSSupported() {
            return 'withCredentials' in new XMLHttpRequest();
        }
    }, {
        key: 'isXDomainSupported',
        value: function isXDomainSupported() {
            return !!window.XDomainRequest;
        }
    }]);

    return Http;
}();

function parseResponse(xhr) {
    var parsed;
    var self = this;
    if (window.karma || window.parent.karma) {
        LOG.info('TESTING MODE');
        xhr.responseType = self.options.responseType;
    }
    LOG.log('responseType in readyState ', xhr.responseType);
    if (xhr.responseType === 'json' || xhr.responseType === 'arraybuffer') {
        LOG.log('JSON CASE!', xhr.response);
        parsed = xhr.response;
    } else if (xhr.responseType === 'document') {
        LOG.log('DOCUMENT CASE!', xhr.responseXML);
        parsed = xhr.responseXML;
    } else if (xhr.responseType === 'text' || xhr.responseType === '') {
        LOG.log('TEXT CASE!');
        parsed = xhr.responseText;
    } else {
        LOG.log('DEFAULT CASE!', xhr.responseText);
        parsed = xhr.responseText;
    }

    return [parsed, xhr.status, xhr];
}

function wrapProgress(fn) {
    return function (progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentComplete = Math.round(progressEvent.loaded / progressEvent.total * 100);
            return fn(percentComplete);
        } else {
            return fn(NaN);
        }
    };
}

function addCustomHeaders(headersObj, xhr) {
    for (var k in headersObj) {
        if (headersObj.hasOwnProperty(k)) {
            xhr.setRequestHeader(k, headersObj[k]);
        }
    }
}

function getImageRaw(options) {
    var _onProgress = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', options.url, true);
        request.responseType = options.responseType || 'blob';
        function transferComplete() {
            var result;
            switch (options.responseType) {
                case 'blob':
                    result = new Blob([this.response], { type: options.mimeType || 'image/jpeg' });
                    break;
                case 'arraybuffer':
                    result = this.response;
                    break;
                default:
                    result = this.response;
                    resolve(result);
                    break;

            }
        }

        var transferCanceled = reject;
        var transferFailed = reject;

        request.addEventListener('progress', _onProgress, false);
        request.addEventListener('load', transferComplete, false);
        request.addEventListener('error', transferFailed, false);
        request.addEventListener('abort', transferCanceled, false);

        request.send(null);
    });
}

function JSONPRequest(url) {
    var timeout = arguments.length <= 1 || arguments[1] === undefined ? 3000 : arguments[1];

    var self = this;
    self.timeout = timeout;
    self.called = false;
    if (window.document) {
        var ts = Date.now();
        self.scriptTag = window.document.createElement('script');

        var _url = '';
        if (url && url !== '') {
            _url = (0, _utils.queryfy)(url, { callback: 'window.__jsonpHandler_' + ts });
        }

        self.scriptTag.src = _url;
        self.scriptTag.type = 'text/javascript';
        self.scriptTag.async = true;

        self.prom = new Promise(function (resolve, reject) {
            var functionName = '__jsonpHandler_' + ts;
            window[functionName] = function (data) {
                self.called = true;
                resolve(data);
                self.scriptTag.parentElement.removeChild(self.scriptTag);
                delete window[functionName];
            };

            setTimeout(function () {
                if (!self.called) {
                    reject('Timeout jsonp request ' + ts);
                    self.scriptTag.parentElement.removeChild(self.scriptTag);
                    delete window[functionName];
                }
            }, self.timeout);
        });

        window.document.getElementsByTagName('head')[0].appendChild(self.scriptTag);
    }
}

function getJSON(url) {
    url = encodeURI(url);
    var xhr = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

    var responseTypeAware = 'responseType' in xhr;

    xhr.open('GET', url, true);
    if (responseTypeAware) {
        xhr.responseType = 'json';
    }

    var daRequest = new Promise(function (resolve, reject) {
        xhr.onreadystatechange = function () {
            var result;
            if (xhr.readyState === 4) {
                try {
                    result = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            }
        };
    });

    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
    xhr.send();
    return daRequest;
}

exports.Http = Http;
exports.getImageRaw = getImageRaw;
exports.getJSON = getJSON;
exports.JSONPRequest = JSONPRequest;

},{"./utils":298,"babel-polyfill":1,"logger-pro":300}],298:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function Iterator(array) {
    var nextIndex = 0;

    return {
        next: function next(reset) {
            if (reset) {
                nextIndex = 0;
            }
            return nextIndex < array.length ? { value: array[nextIndex++], done: false } : { done: true };
        }
    };
}

function queryfy(_api, query) {
    var previousQuery = dequeryfy(_api);
    var qs = '',
        finalQuery,
        api = _api.slice(0);

    if (api.indexOf('?') > -1) {
        api = api.slice(0, api.indexOf('?'));
    }

    api += '?';
    finalQuery = extend(previousQuery, query);

    for (var key in finalQuery) {
        qs += encodeURIComponent(key);

        if (finalQuery[key]) {
            qs += '=' + encodeURIComponent(finalQuery[key]);
        }
        qs += '&';
    }

    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1);
    }
    return [api, qs].join('');
}

function dequeryfy(_url) {
    var param = decodeURIComponent(_url.slice(0));

    var query = param.split('?')[1];
    if (!query) {
        return {};
    }

    var keyvalue = query.split('&');

    return keyvalue.reduce(function (newObj, _keyvalue) {
        var splitted = _keyvalue.split('=');
        var key = splitted[0];
        var value = splitted[1];
        newObj[key] = value;
        return newObj;
    }, {});
}

function extend(o1, o2) {

    if (getType(o1) !== 'object' || getType(o2) !== 'object') {
        throw new Error('Cannot merge different type');
    }
    var newObject = {};
    for (var k in o1) {
        if (o1.hasOwnProperty(k)) {
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if (o2.hasOwnProperty(j)) {
            newObject[j] = o2[j];
        }
    }
    return newObject;
}

function getType(obj) {
    return {}.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}

exports.Iterator = Iterator;
exports.extend = extend;
exports.queryfy = queryfy;
exports.dequeryfy = dequeryfy;
exports.getType = getType;

},{}],299:[function(require,module,exports){
/**
* @ngdoc object
* @name logger-pro.Logger
*
* @description
* Provides you the basic functionality of a log system.
*
* To use **Logger** you have to include the Logger script file.
*
* In this example, I have included the Logger's javascript file:
* <pre>
*   <script src="./dist/dist.js"></script>
* </pre>

* # Enable/Disable Logger
* To **enable** or **disable** logger just call init with enabled:true/false.
*
* <pre>
*  Logger.init({enabled:true})  //Logger is now enabled
*
*  Logger.init({enabled:false}) //Logger is now disabled
* </pre>
*
* To use one of the provided method just use Logger.*
*
* <pre>
*   Logger.log('Hello world'); //prints hello world
* </pre>
*
*/

var Logger = new function(){

    var _Logger = this;

    // defines log levels and their order (priority)
    var levels = ['log', 'table', 'info', 'warn', 'error'];
    
    // config will hold the configuration used at runtime, e.g. 
    var config = {};

    /**
     * @ngdoc function
     * @name Logger#getConfig
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method is a "read-only" getter for config. 
     *
     * Get Logger's configuration.
     *
     * @example
     * # Logger getConfig 
     * Here is one example of the getConfig method.
     *
     * <pre>
     *     console.log( Logger.getConfig() );
     * </pre>
     *
     */

    // "read-only" getter for config
    this.getConfig = function getConfig(){
        return JSON.parse(JSON.stringify(config));
    };

    // default emit function: uses console for logging messages
    var emit = function emit(level, args){
        console[level](args);
    };

    /**
     * @ngdoc function
     * @name Logger#init
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method is used to initialize or to change the configuration of 
     * the Logger's module. Call init whenever you need to change the Logger's configuration. 
     *
     * @param {Object} options (see attributes below)
     * @param {boolean} [options.enabled=true] Enable/Disable the Logger
     * @param {string} [options.level='log'] Actives all levels following the given
     * @param {Object} [options.levels=undefined] Levels contains the manual configuration of the Logger.
     * @param {function} [options.emit=Uses window.console] Emit is an addictional parameter that allows you to use a custom function as an emitter.
     *
     * @example
     * # Logger Init 
     * Here are some examples of the init method.
     *
     * **Remember that before call init you have to iclude the Logger's javascript file: **
     * <pre>
     *   <script src="./dist/dist.js"></script>
     * </pre>
     *
     * **Default initialization**
     * <pre>
     *  Logger.init({
     *      level: 'log', //set all level to true
     *      enabled: true //enables logger
     *  }); 
     *
     * </pre>
     *
     * **Logger with manual configuration**
     *
     * I want that logger logs only logs, warnings and errors
     * <pre>
     *     Logger.init({
     *      levels: { 
     *         'log': true, 
     *         'info': false,
     *         'table': false  
     *         'warn': true,
     *         'error': true
     *       },
     *       enabled: true //enables logger
     *      }); 
     *
     * </pre>
     *
     * **Logger with level configuration and personalized emit**
     *
     * I want that logger logs only warning and error
     * <pre>
     *     Logger.init({
     *       level: 'warn',  //Logger now logs only warnings and errors
     *       emit: function(level, args){
     *               console[level](args); //log args
     *               
     *               // Do something, i.e: sends error, store something etc.
     *             },
     *        enabled: true //enables logger
     *      }); 
     *
     * </pre>
     * 
     */

    // init the module with optional parameters
    this.init = function init(options){
        // used for checking the type of each attribute in options
        var typeOfenabled = typeof options.enabled;
        var typeOfLevel = typeof options.level;
        var typeOfLevels = typeof options.levels;
        var typeOfEmit = typeof options.emit;

        // enabled setup
        if (typeOfenabled === 'boolean'){
            config.enabled = options.enabled;
        } else if (typeOfenabled !== 'undefined') {
            throw new Error('Logger :: illegal type for enabled - expected boolean, got ' + typeOfenabled);
        }

        /* one-level setup
        * only shows messages with level higher or equal to the required one, e.g.
        * options = {
        *     level: 'info'
        * }
        */
        if (typeOfLevel === 'string'){
            if (levels.indexOf(options.level) === -1){
                throw new Error('Logger :: unknown level ' + options.level);
            } else {
                for (var i = 0; i < levels.length; i++){
                    config[levels[i]] = levels.indexOf(options.level) <= i;
                }
            }
        } else if (typeOfLevel !== 'undefined') {
            throw new Error('Logger :: illegal type for level - expected string, got ' + typeOfLevel);
        }

        /* level-by-level setup
        * sets each level on a case-by-case basis, e.g.
        * options = {
        *     levels: { 
        *         'log': false, 
        *         'info': false, 
        *         'warn': true,
        *         'error': true,
        *         'table': false 
        *     }
        * }
        */
        if (typeOfLevels === 'object'){
            var level;
            // sanity checks first
            for (level in options.levels){
                // sanity check for each level's value type (must be a boolean)
                typeOfLevel = typeof options.levels[level]; 
                if (typeOfLevel !== 'boolean'){
                    throw new Error('Logger :: illegal value type for level "' + level + '"' +
                            ' - expected boolean, got "' + typeOfLevel + '"');
                }

                // ignore unknown levels
                if (levels.indexOf(level) === -1){
                    throw new Error('Logger :: unknown log level "' + level + '"');
                }
            }

            // now that we are sure all values are legal, we can put them into the new configuration
            for (level in options.levels){
                config[level] = !!options.levels[level];
            }
        } else if (typeOfLevels !== 'undefined'){
            throw new Error('Logger :: illegal type for levels - expected object, got ' + typeOfLevels);
        }

        /* custom emit function
        * allows you to use a custom function as an emitter
        */
        if (typeOfEmit === 'function'){
            emit = options.emit;
        } else if (typeOfEmit !== 'undefined'){
            throw new Error('Logger :: illegal type for emit - expected function, got ' + typeOfEmit);
        }
    };

    /**
     * @ngdoc function
     * @name Logger#log
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method for each log level.
     * Each method uses the general function emit to log messages
     *
     * ***Log level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to log
     *
     * @example
     * # Logger log 
     * Here is one example of the Log method.
     *
     * <pre>
     *     Logger.log('Hello World!') //Logs Hello World
     * </pre>
     *
     */

    /* define a method for each log level
    *  each method uses the general function emit to log messages
    */
    this.log = function log(){
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.log){
            emit('log', args);
        }
    };

    /**
     * @ngdoc function
     * @name Logger#table
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method for each table level.
     * Each method uses the general function emit to table messages
     *
     * ***table level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to show as table messages
     *
     * @example
     * # Logger Table 
     * Here is one example of the Table method.
     *
     * <pre>
     *     Logger.table('Hello World!') //show Hello World as table message
     * </pre>
     *
     */

    this.table = function table(){
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.table){
            emit('table', args);
        }    
    };

    /**
     * @ngdoc function
     * @name Logger#info
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method for each info level.
     * Each method uses the general function emit to info messages
     *
     * ***info level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to show as Info messages
     *
     * @example
     * # Logger Info 
     * Here is one example of the info method.
     *
     * <pre>
     *     Logger.info('Hello World!') //show Hello World as info message
     * </pre>
     *
     */

    this.info = function info(){
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.info){
            emit('info', args);
        }
    };


    /**
     * @ngdoc function
     * @name Logger#warn
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method for each warn level.
     * Each method uses the general function emit to warn messages
     *
     * ***warn level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to show as warn messages
     *
     * @example
     * # Logger Warn 
     * Here is one example of the warn method.
     *
     * <pre>
     *     Logger.warn('Hello World!') //show Hello World as warn message
     * </pre>
     *
     */
    
    this.warn = function warn(){
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.warn){
            emit('warn', args);
        }    
    };

    /**
     * @ngdoc function
     * @name Logger#error
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method for each error level.
     * Each method uses the general function emit to error messages
     *
     * ***error level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to show as error messages
     *
     * @example
     * # Logger Error 
     * Here is one example of the error method.
     *
     * <pre>
     *     Logger.error('Hello World!') //show Hello World as error message
     * </pre>
     *
     */
    
    this.error = function error(){
        var args = Array.prototype.slice.call(arguments);
        if (config.enabled && !!config.error){
            emit('error', args);
        }    
    };

    /**
      * @ngdoc function
     * @name Logger#isEnabled
     * @methodOf logger-pro.Logger
     *
     * @description 
     * This method defines a method to know if Logger is enabled or not;
     * 
     *
     * @example
     * # Logger isEnabled 
     * Here is one example of the isEnabled method.
     *
     * <pre>
     *     if(Logger.isEnabled()){
     *          //Do something
     *      } else {
     *          //Do something else
     *      }
     * </pre>
     *
     */

    this.isEnabled = function(){
        return !!config.enabled;
    };

    // default setup: show every message
    _Logger.init({
        level: 'log',
        enabled: true
    });

};

module.exports = Logger;
},{}],300:[function(require,module,exports){
/**
 * @ngdoc overview
 * @name logger-pro
 *
 * @description
 * # Logger Pro
 * Logger Pro is a module that provides you an advanced log system.
 *
 *
 * Remember that **Logger Pro** is organized in **levels**, sorted by relevance: 
 *
 * - **Log**;
 * - **Info**;
 * - **Table**;
 * - **Warning**;
 * - **Error**;
 *
 * ***Note that is very relevant of how Logger Pro's levels are ordered!***
 *
 * # Enable/Disable Logger
 * To **enable** or **disable** logger just call init with enabled:true/false.
 *
 * <pre>
 *  Logger.init({enabled:true})  //Logger is now enabled
 *
 *  Logger.init({enabled:false}) //Logger is now disabled
 * </pre>
 *
 * # Components
 * - {@link logger-pro.Logger Logger} 
 * - {@link logger.RotatingLogger RotatingLogger} 
 * 
 */
var Logger = require('./base-logger');
var RotatingLogger = require('./rotating-logger');
module.exports = {
    Logger: Logger, 
    RotatingLogger: RotatingLogger
};
},{"./base-logger":299,"./rotating-logger":301}],301:[function(require,module,exports){
/**
* @ngdoc object
* @name logger-pro.RotatingLogger
*
* @description
* Provides you an advanced functionality of a log system.
*
* To use **RotatingLogger** you have to include each javascript files: the dist.js file and the dist-rotating.js file (that you can find it in the dist folder).
*
* In this example, I have included each the javascript file:
* <pre>
*   <script src="./dist/dist.js"></script>
*   <script src="./dist/dist-rotating.js"></script>
* </pre>
*
* To use one of the provided method just use RotatingLogger.*
*
* <pre>
*   RotatingLogger.log('Hello world'); //prints hello world
* </pre>
*
*/

var Logger = require('./base-logger.js');

var RotatingLogger = new function(){

    // IMPORTANT: requires Logger
    var logger = Logger;

    // this Array will contain each message
    var messages = [];
    // this is the max size of messages (before it gets downloaded)
    var maxSize = 100;

    // true if logger is enabled (by config) to record messages
    var recordingEnabled = true;
    // true if logger is recording messages
    var isRecording = false;
    // if true, only the last maxSize messages are recorded
    var sliding = true;

    /**
     * @ngdoc function
     * @name RotatingLogger#getConfig
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method wraps original Logger's getConfig function
     * adding maxSize attribute, click {@link logger-pro.Logger#methods_getConfig here} to see getConfig() documentation.
     */

    /* wraps original Logger's getConfig function
    * adding maxSize attribute
    */
    this.getConfig = function(){
        var config = logger.getConfig();
        config.maxSize = maxSize;
        config.sliding = sliding;
        return config;
    };


    var handleMessages = function(level, args){
        if (messages.length >= maxSize){
            if (!sliding){
                endRotate();
            } else {
                messages.shift();
            }
        }

        logger[level](args);
        if (recordingEnabled && logger.getConfig().enabled){
            messages.push([level, args]);
        }
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#log
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method defines a method for each log level.
     * Each method uses the general function emit to log messages
     *
     * ***Log level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to log
     *
     * @example
     * # RotatingLogger log 
     * Here is one example of the Log method.
     *
     * <pre>
     *     RotatingLogger.log('Hello World!') //Logs Hello World
     * </pre>
     *
    */

    // expose Logger's main methods
    this.log = function(){
        var args = Array.prototype.slice.call(arguments);
        handleMessages('log', args);
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#info
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method defines a method for each info level.
     * Each method uses the general function emit to info messages
     *
     * ***info level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to info
     *
     * @example
     * # RotatingLogger Info 
     * Here is one example of the info method.
     *
     * <pre>
     *     RotatingLogger.info('Hello World!') //show Hello World as info message
     * </pre>
     *
     */

    this.info = function(){
        var args = Array.prototype.slice.call(arguments);
        handleMessages('info', args);
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#table
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method defines a method for each table level.
     * Each method uses the general function emit to table messages
     *
     * ***table level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to table
     *
     * @example
     * # RotatingLogger Table 
     * Here is one example of the table method.
     *
     * <pre>
     *     RotatingLogger.table('Hello World!') //show Hello World as table message
     * </pre>
     *
     */

    this.table = function(){
        var args = Array.prototype.slice.call(arguments);
        handleMessages('table', args);
    };


    /**
     * @ngdoc function
     * @name RotatingLogger#warn
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method defines a method for each warn level.
     * Each method uses the general function emit to warn messages
     *
     * ***warn level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to warn
     *
     * @example
     * # RotatingLogger Warn 
     * Here is one example of the warn method.
     *
     * <pre>
     *     RotatingLogger.warn('Hello World!') //show Hello World as warn message
     * </pre>
     *
     */

    this.warn = function(){
        var args = Array.prototype.slice.call(arguments);
        handleMessages('warn', args);
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#error
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method defines a method for each error level.
     * Each method uses the general function emit to error messages
     *
     * ***error level must be true and logger must be enabled***
     *
     * @param {*} arguments Arguments to error
     *
     * @example
     * # RotatingLogger error 
     * Here is one example of the error method.
     *
     * <pre>
     *     RotatingLogger.error('Hello World!') //show Hello World as error message
     * </pre>
     *
     */

    this.error = function(){
        var args = Array.prototype.slice.call(arguments);
        handleMessages('error', args);
    };

    // this will open a new tab showing a chunk of messages in JSON format
    var saveRecords = function(msgs){
        var exportData = 'data:text/json;charset=utf-8,';
        exportData += JSON.stringify(msgs, null, 4);
        var encodedUri = encodeURI(exportData);
        window.open(encodedUri, '_blank');
    };

    var endRotate = function(){
        saveRecords(messages);
        messages = [];
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#startRecording
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     *
     * This method starts the recording of all the messages logged by RotatingLogger.
     *
     * ***Remember that recordingEnabled must be set to true to record*** 
     *
     * @example
     * # RotatingLogger startRecording
     *
     * This is an example of how to use **startRecording** method
     * <pre>
     *  RotatingLogger.startRecording() // Start recording
     * </pre>
     *
     */

    // starts adding logs to messages var
    this.startRecording = function(resetMessages){
        if (!!resetMessages){
            messages = [];
        }
        isRecording = true;
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#endRecording
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     *
     * This method tells **RotatingLogger** to stop recording messages and 
     * calls internal function saveRecords (set within init method).
     *
     * If you're not recording it will show an error message.
     *
     * **Remember that first you have to start a recording with the startRecording method**
     * @example
     * # RotatingLogger endRecording
     *
     * This is an example of how to use **endRecording** method
     * <pre>
     *  //Stop recording and saves records
     *  RotatingLogger.endRecording()  
     *
     *
     * </pre>
    */

    // stops recording messages and downloads them as JSON
    this.endRecording = function(){

        if (!isRecording){
            console.warn('RotatingLogger :: endRecording called while RotatingLogger was not recording');
        }

        isRecording = false;
        endRotate();
    };

    /**
     * @ngdoc function
     * @name RotatingLogger#init
     * @methodOf logger-pro.RotatingLogger
     *
     * @description 
     * This method is used to initialize or to change the configuration of 
     * the Rotating Logger's module. Call init whenever you need to change the Rotating Logger's configuration. 
     *
     * **Remember that before call init you have to include the RotatingLogger' s javascript file: **
     *
     * See **Logger** {@link logger-pro.Logger#methods_init init()} documentation to configure also the **Logger** functionality.
     *
     * @param {Object} options (see attributes below)
     * @param {Integer} [options.maxSize=100] maxSize defines the max number of messages recorded.
     * @param {boolean} [options.sliding=true] Enables "sliding window" recording.
     *
     * If enabled, the logger will record the last records only (<= maxSize)
     *
     * If not enabled, the logger will automatically save a list of messages when length = maxSize 
     * @param {boolean} [options.recordingEnabled=true] Enables message recording
     *
     * If disabled, no messages are recorded (even between startRecording and endRecording)
     *
     * @param {function} [options.saveRecords=exports JSon file] Function used to export recorded messages.
     *
     *
     * @example
     * # Logger Init 
     * Here is one example of the init method.
     *
     * **RotatingLogger initialization**
     * <pre>
     * 
     *   RotatingLogger.init({
     *      maxSize: 100, //set maxSize to 100
     *      sliding: true, //enables sliding mode
     *      recordingEnabled: true, //enable recording
     *      enabled: true //enable logger
     *   }); 
     *
     * </pre>
     * 
     * **RotatingLogger initialization with custom saveRecords**
     *
     * Here is an example of initialization where saveRecords sends messages calling an API.
     * <pre>
     * 
     *   RotatingLogger.init({
     *      ...,
     *      saveRecords: function(messages){
     *          API_send(messages)
     *      }
     *   }); 
     *
     * </pre>
     */

    this.init = function(options){
        var typeOfMaxSize = typeof options.maxSize;
        var typeOfSliding = typeof options.sliding;
        var typeOfRecEnabled = typeof options.recordingEnabled;
        var typeOfSaveRecords = typeof options.saveRecords;

        /* define custom maxSize
        * maxSize defines the max number of messages recorded
        */
        if (typeOfMaxSize !== 'undefined'){
            if (typeOfMaxSize !== 'number'){
                throw new Error('RotatingLogger :: illegal type "' + typeOfMaxSize + '" for maxSize, "number" expected');
            } else {
                maxSize = options.maxSize;
                delete options.maxSize;
            }
        }

        /* enable "sliding window" recording
        * if enabled, the logger will record the last records only (<= maxSize)
        * if not enabled, the logger will automatically save a list of messages when length = maxSize 
        */
        if (typeOfSliding !== 'undefined'){
            if (typeOfSliding !== 'boolean'){
                throw new Error('RotatingLogger :: illegal type "' + typeOfSliding + '" for sliding, "boolean" expected');
            } else {
                sliding = options.sliding;
                delete options.sliding;
            }
        }

        /* enable message recording
        * if disabled, no messages are recorded (even between startRecording and endRecording)
        */
        if (typeOfRecEnabled !== 'undefined'){
            if (typeOfRecEnabled !== 'boolean'){
                throw new Error('RotatingLogger :: illegal type "' + typeOfRecEnabled + '" for recordingEnabled, "boolean" expected');
            } else {

                recordingEnabled = options.recordingEnabled;
                isRecording = options.recordingEnabled;
                delete options.recordingEnabled;
            }
        }

        /* custom saveRecords function
        * allows you to use a custom function as saveRecords
        */
        if (typeOfSaveRecords === 'function'){
            saveRecords = options.saveRecords;
        } else if (typeOfSaveRecords !== 'undefined'){
            throw new Error('RotatingLogger :: illegal type for saveRecords - expected function, got ' + valueType);
        }

        logger.init(options);
    };

};

module.exports = RotatingLogger;

},{"./base-logger.js":299}],302:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],303:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":302}],304:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _EventBus = require('./modules/EventBus');

var _EventBus2 = _interopRequireDefault(_EventBus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('babel-polyfill');
var Logger = require('./modules/Logger');
var Utils = require('./modules/Utils');
var extend = require('./modules/Utils').extend;
var dequeryfy = require('./modules/Utils').dequeryfy;
var queryfy = require('./modules/Utils').queryfy;
var getType = require('./modules/Utils').getType;
var JSONPRequest = require('http-francis').JSONPRequest;

var API_URL_NET_INFO = require('./modules/Constants').API_URL_NET_INFO;
var NET_INFO = {};
var VHOST = {};
var requireCondition = require('./modules/Decorators').requireCondition;
var FacebookClass = require('./modules/Facebook');
var Facebook = new FacebookClass();
var version = require('./info').version;
var build = require('./info').build;

var fileModule = require('./modules/File');
var Game = require('./modules/Game');

var NetworkInfo = require('./modules/Connection');
var netInfoIstance = new NetworkInfo();

var cookies = require('cookies-js');
var DEFAULT_CONFIGURATION = require('./stargate.conf.js');


var stargateModules = {
    file: fileModule,
    game: new Game()
};
var LOG = new Logger('all', '[Stargate]');

var initialized = false;
var isStargateOpen = false;
var CUSTOM_CONF = {};
var STARGATE_MANIFEST = {};
var MESSAGE_INITIALIZED = 'Call after Stargate.initialize() please';

var initPromise;
var modulesLoaded;

function initialize() {
    var configuration = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    if (initPromise) {
        LOG.warn('Initialized already called');
        return initPromise;
    }

    CUSTOM_CONF = extend(DEFAULT_CONFIGURATION, configuration);

    if (isHybrid()) {
        LOG.info('Hybrid init');
        initPromise = new Promise(function (resolve, reject) {
            document.addEventListener('deviceready', function onready(e) {
                resolve(e);
            });

            setTimeout(function () {
                reject(['deviceready timeout', CUSTOM_CONF.DEVICE_READY_TIMEOUT].join(' '));
            }, CUSTOM_CONF.DEVICE_READY_TIMEOUT);
        }).then(function (readyEvent) {
            LOG.info('ReadyEvent', readyEvent);

            modulesLoaded = CUSTOM_CONF.modules.map(moduleInitializer);

            modulesLoaded.unshift(getManifest());
            netInfoIstance.initialize();

            return Promise.all(modulesLoaded);
        }).then(function (results) {
            STARGATE_MANIFEST = results.shift();
            var hostname = getWebappOrigin().split('http://')[1];
            setProperty(window.location, '__hostname__', hostname);

            callback(results);
            return results;
        }).then(loadVHost);
    } else {
        LOG.info('No hybrid init');
        modulesLoaded = CUSTOM_CONF.modules.map(moduleInitializer);
        netInfoIstance.initialize();
        initPromise = Promise.all(modulesLoaded);
    }

    return initPromise.then(function (results) {
        initialized = true;
        isStargateOpen = true;
        return results;
    });
}

function setProperty(what, property, value) {
    Object.defineProperty(what, property, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: value
    });
}

function moduleInitializer(moduleAndConf) {
    var name = moduleAndConf[0];
    var conf = moduleAndConf[1];
    if (stargateModules[name]) {
        if (stargateModules[name].initialize) {
            return stargateModules[name].initialize(conf);
        } else {
            return Promise.resolve([name, true]);
        }
    } else {
        LOG.warn([name, 'unsupported'].join(' '));
        return Promise.reject([name, 'unsupported'].join(' '));
    }
}

function initModule(moduleAndConf) {
    if (!initPromise) {
        return Promise.reject('Stargate.initialize needs to be called first');
    }

    return initPromise.then(function () {
        return moduleInitializer(moduleAndConf);
    });
}

function getVersion() {
    return version;
}

function getVersionBuild() {
    return build;
}

function isInitialized() {
    return initialized;
}

function isHybrid() {
    var location = window.document.location;
    if ("production" === 'development' && window.fakewindow) {
        location = window.fakewindow.document.location;
    }
    var uri = location.href;
    var queryStringObject = dequeryfy(uri);
    var protocol = location.protocol;

    if (queryStringObject.hasOwnProperty('stargateVersion')) {
        window.localStorage.setItem('stargateVersion', queryStringObject.stargateVersion);
        cookies.set('stargateVersion', queryStringObject.stargateVersion, { expires: Infinity });
    }

    if (queryStringObject.hasOwnProperty('hybrid')) {
        window.localStorage.setItem('hybrid', 1);
        cookies.set('hybrid', '1', { expires: Infinity });
    }

    if (protocol === 'file:' || protocol === 'cdvfile:') {
        return true;
    }

    if (window.localStorage.getItem('hybrid')) {
        return true;
    }

    if (cookies.get('hybrid')) {
        return true;
    }
    return false;
}

function isOpen() {
    return isStargateOpen;
}

function addListener(type, fn) {
    if (type === 'connectionchange') {
        netInfoIstance.addListener(fn);
    }
}

function removeListener(type, fn) {
    if (type === 'connectionchange') {
        netInfoIstance.removeListener(fn);
    }
}

function getManifest() {

    var MANIFEST_PATH = '';
    if (window.cordova.file) {
        MANIFEST_PATH = [window.cordova.file.applicationDirectory, 'www/manifest.json'].join('');
        LOG.info('getManifest', MANIFEST_PATH);
        return fileModule.readFileAsJSON(MANIFEST_PATH);
    }

    if (window.hostedwebapp) {
        LOG.info('getManifest from hostedwebapp');
        return new Promise(function (resolve, reject) {
            window.hostedwebapp.getManifest(resolve, reject);
        });
    }
    return Promise.resolve({});
}

function getWebappStartUrl() {
    if (typeof STARGATE_MANIFEST.stargateConf.webapp_start_url !== 'undefined') {
        return queryfy(STARGATE_MANIFEST.stargateConf.webapp_start_url, { hybrid: 1,
            stargateVersion: STARGATE_MANIFEST.stargateConf.stargate_version_to_load });
    } else {
        return '';
    }
}

function getWebappOrigin() {
    var re = /http:\/\/[\w]{3,4}\..*\.[\w]{2,}/;
    if (typeof STARGATE_MANIFEST.stargateConf.webapp_start_url !== 'undefined') {
        return re.exec(STARGATE_MANIFEST.stargateConf.webapp_start_url)[0];
    } else {
        return '';
    }
}

function loadVHost() {
    var VHOST_PATH = [stargateModules.file.BASE_DIR, 'config.json'].join('');
    return fileModule.fileExists(VHOST_PATH).then(function (exists) {
        if (exists) {
            return fileModule.readFileAsJSON(VHOST_PATH).then(function (vhost) {
                VHOST = vhost;
            });
        } else {
            LOG.warn('config.json not exists (vhost) if you are on gameasy it\'s a problem');
            return Promise.resolve({});
        }
    });
}

function getCountryCode() {
    var countryCodeRegex = /(http:\/\/[\w]{3,4}\..*\.[\w]{2,})\/(.*)\//;
    if (VHOST.DEST_DOMAIN && typeof VHOST.DEST_DOMAIN === 'string') {
        return VHOST.DEST_DOMAIN.match(countryCodeRegex)[2];
    }
    LOG.warn('Can\'t get the country code. have you called');
    return '';
}

function loadUrl(url) {

    if (window.device.platform.toLowerCase() === 'android') {
        window.navigator.app.loadUrl(url);
    } else if (window.device.platform.toLowerCase() === 'ios' && url.indexOf('file:///') !== -1) {
        var _url = url.split('?')[0];
        window.resolveLocalFileSystemURL(_url, function (entry) {
            var internalUrl = entry.toInternalURL() + '?hybrid=1';
            LOG.info('Redirect to', internalUrl);
            window.location.href = internalUrl;
        }, LOG.error);
    } else {
        window.location.href = url;
    }
}

function goToLocalIndex() {
    if (getType(window.cordova.file.applicationDirectory) !== 'undefined') {
        var qs = { hybrid: 1 };
        var LOCAL_INDEX = window.cordova.file.applicationDirectory + 'www/' + STARGATE_MANIFEST.start_url;
        loadUrl(queryfy(LOCAL_INDEX, qs));
        return LOCAL_INDEX;
    } else {
        LOG.warn('Missing cordova-plugin-file. Install it with: cordova plugin add cordova-plugin-file');
    }
}

function goToWebIndex() {
    var webUrl = getWebappStartUrl();
    loadUrl(webUrl);
}

var Stargate = {
    initialize: initialize,
    getVersion: getVersion,
    getCountryCode: getCountryCode,
    getVersionBuild: getVersionBuild,
    facebookShare: Facebook.facebookShare,
    facebookLogin: Facebook.facebookLogin,
    addListener: requireCondition(isInitialized, addListener, null, MESSAGE_INITIALIZED, 'warn', LOG),
    removeListener: requireCondition(isInitialized, removeListener, null, MESSAGE_INITIALIZED, 'warn', LOG),
    checkConnection: requireCondition(isInitialized, netInfoIstance.checkConnection, netInfoIstance, MESSAGE_INITIALIZED, 'warn', LOG),
    file: stargateModules.file,
    game: stargateModules.game,
    initModule: initModule,
    isInitialized: isInitialized,
    isHybrid: isHybrid,
    isOpen: isOpen,
    getWebappStartUrl: requireCondition(isInitialized, getWebappStartUrl, null, MESSAGE_INITIALIZED, 'warn', LOG),
    getWebappOrigin: requireCondition(isInitialized, getWebappOrigin, null, MESSAGE_INITIALIZED, 'warn', LOG),
    goToLocalIndex: requireCondition(isInitialized, goToLocalIndex, null, MESSAGE_INITIALIZED, 'warn', LOG),
    goToWebIndex: requireCondition(isInitialized, goToWebIndex, null, MESSAGE_INITIALIZED, 'warn', LOG),
    Utils: Utils,
    EventBus: _EventBus2.default
};

if ("production" === 'development') {
    Stargate.__deinit__ = function () {
        initPromise = null;
        initialized = false;
        isStargateOpen = false;
        localStorage.removeItem('hybrid');
        localStorage.removeItem('stargateVersion');
        cookies.expire('hybrid');
        cookies.expire('stargateVersion');
    };

    var original = {};

    Stargate.setMock = function (moduleName, mock) {
        switch (moduleName) {
            case 'fileModule':
                original.fileModule = fileModule;
                fileModule = mock;
                break;
            case 'isHybrid':
                original.isHybrid = isHybrid;
                isHybrid = mock;
                break;
            case 'netInfoIstance':
                original.netInfoIstance = netInfoIstance;
                netInfoIstance = mock;
                break;
            case 'JSONPRequest':
                original.JSONPRequest = JSONPRequest;
                JSONPRequest = mock;
                break;
            case 'getWebappOrigin':
                original.getWebappOrigin = getWebappOrigin;
                getWebappOrigin = mock;
                break;
            case 'getManifest':
                original.getManifest = getManifest;
                getManifest = mock;
                break;
            case 'loadVHost':
                original.loadVHost = loadVHost;
                loadVHost = mock;
                break;
            default:
                console.log('No mock rule for ' + moduleName);
                break;
        }
    };

    Stargate.unsetMock = function (moduleName) {
        if (!original[moduleName]) return;
        switch (moduleName) {
            case 'fileModule':
                fileModule = original.fileModule;
                original.fileModule = null;
                break;
            case 'isHybrid':
                isHybrid = original.isHybrid;
                original.isHybrid = null;
                break;
            case 'netInfoIstance':
                netInfoIstance = original.netInfoIstance;
                original.netInfoIstance = null;
                break;
            case 'JSONPRequest':
                JSONPRequest = original.JSONPRequest;
                original.JSONPRequest = null;
                break;
            case 'getWebappOrigin':
                getWebappOrigin = original.getWebappOrigin;
                original.getWebappOrigin = null;
                break;
            case 'getManifest':
                getManifest = original.getManifest;
                original.getManifest = null;
                break;
            case 'loadVHost':
                loadVHost = original.loadVHost;
                original.loadVHost = null;
                break;
            default:
                break;
        }
    };
}

exports.default = Stargate;
module.exports = exports['default'];

},{"./info":305,"./modules/Connection":306,"./modules/Constants":307,"./modules/Decorators":308,"./modules/EventBus":309,"./modules/Facebook":310,"./modules/File":311,"./modules/Game":312,"./modules/Logger":313,"./modules/Utils":314,"./stargate.conf.js":315,"babel-polyfill":1,"cookies-js":2,"http-francis":297}],305:[function(require,module,exports){
"use strict";

var pkgInfo = { "version": "0.1.4", "build": "v0.1.4-0-gb7ec797" };module.exports = pkgInfo;

},{}],306:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventBus = require('./EventBus');

var _EventBus2 = _interopRequireDefault(_EventBus);

var _Utils = require('./Utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bus = new _EventBus2.default();

var NetworkInfo = function () {
    function NetworkInfo() {
        _classCallCheck(this, NetworkInfo);

        this.connectionStatus = {
            type: 'none',
            networkState: 'none' };

        this.UNSUPPORTED = true;
    }

    _createClass(NetworkInfo, [{
        key: 'initialize',
        value: function initialize() {
            try {
                this.connectionStatus.networkState = window.navigator.connection.type;
            } catch (e) {
                this.connectionStatus.networkState = 'none';
                this.UNSUPPORTED = true;
            } finally {
                this.connectionStatus.type = navigator.onLine ? 'online' : 'offline';
                this.__bindConnectionEvents__();
            }
        }
    }, {
        key: 'checkConnection',
        value: function checkConnection() {
            if (!this.UNSUPPORTED) {
                this.connectionStatus.networkState = window.navigator.connection.type;
            }
            this.connectionStatus.type = navigator.onLine ? 'online' : 'offline';
            return this.connectionStatus;
        }
    }, {
        key: 'addListener',
        value: function addListener(listener) {
            bus.on('connectionchange', listener);
        }
    }, {
        key: 'removeListener',
        value: function removeListener(listener) {
            bus.off('connectionchange', listener);
        }
    }, {
        key: 'hostReachable',
        value: function hostReachable(url) {
            var xhr = new (window.ActiveXObject || XMLHttpRequest)('Microsoft.XMLHTTP');
            var disableCache;
            if (!url) {
                disableCache = Math.floor((1 + Math.random()) * 0x10000);
                url = window.location.protocol + '//' + window.location.hostname;
            }

            var querystring = {
                rand: disableCache
            };

            xhr.open('HEAD', (0, _Utils.queryfy)(url, querystring), false);

            try {
                xhr.send();
                return xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304);
            } catch (error) {
                return false;
            }
        }
    }, {
        key: '__bindConnectionEvents__',
        value: function __bindConnectionEvents__() {
            if (this.UNSUPPORTED) {
                window.addEventListener('offline', this.__updateConnectionStatus__.bind(this), false);
                window.addEventListener('online', this.__updateConnectionStatus__.bind(this), false);
            } else {
                document.addEventListener('offline', this.__updateConnectionStatus__.bind(this), false);
                document.addEventListener('online', this.__updateConnectionStatus__.bind(this), false);
            }
        }
    }, {
        key: '__updateConnectionStatus__',
        value: function __updateConnectionStatus__(theEvent) {
            this.connectionStatus.type = theEvent.type;
            if (!this.UNSUPPORTED) {
                this.connectionStatus.networkState = navigator.connection.type;
            }
            bus.trigger('connectionchange', this.connectionStatus);
        }
    }]);

    return NetworkInfo;
}();

exports.default = NetworkInfo;
module.exports = exports['default'];

},{"./EventBus":309,"./Utils":314}],307:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Constants = {
    API_URL_NET_INFO: '/conf/info'
};

exports.default = Constants;
module.exports = exports['default'];

},{}],308:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

function requireCondition(param, afterFunction) {
	var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	var message = arguments[3];
	var type = arguments[4];
	var logger = arguments.length <= 5 || arguments[5] === undefined ? window.console : arguments[5];

	return function decorator() {
		var _param = void 0;

		if (typeof param === 'function') {
			_param = param.call(null);
		} else if (typeof param === 'boolean') {
			_param = param ? true : false;
		}

		if (_param) {
			return afterFunction.apply(context, arguments);
		} else {
			switch (type) {
				case "error":
					throw new Error(message);
					break;
				case "warn":
					logger.warn(message);
					break;
				case "info":
					logger.info(message);
					break;
				default:
					logger.log(message);
					break;
			}
		}
	};
}

exports.requireCondition = requireCondition;

},{}],309:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventBus = function () {
	function EventBus() {
		_classCallCheck(this, EventBus);

		this.events = {};
	}

	_createClass(EventBus, [{
		key: "on",
		value: function on(eventType, func) {
			var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

			if (!this.events[eventType]) {
				this.events[eventType] = [];
			}
			this.events[eventType].push({ func: func, context: context });
		}
	}, {
		key: "trigger",
		value: function trigger(eventType) {
			if (!this.events[eventType] || this.events[eventType].length === 0) {
				return;
			}
			var args = [].slice.call(arguments, 1);
			this.events[eventType].map(function (obj) {
				obj.func.apply(obj.context, args);
			});
		}
	}, {
		key: "off",
		value: function off(eventType, func) {
			if (!this.events[eventType]) {
				return;
			}

			var newState = this.events[eventType].reduceRight(function (prev, current, index, arr) {
				if (current.func !== func) {
					prev.push(current);
				}
				return prev;
			}, []);

			this.events[eventType] = newState;
		}
	}, {
		key: "clear",
		value: function clear(eventType) {
			if (!this.events[eventType]) {
				return;
			}
			this.events[eventType] = [];
		}
	}]);

	return EventBus;
}();

module.exports = EventBus;

},{}],310:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = require('./Logger');
var LOG = new Logger('ALL', '[Facebook]');
var ERROR_MESSAGE = 'Cordova plugin for facebook is undefined';

function facebookPluginIsDefined() {
    var pluginIsDefined = typeof window.facebookConnectPlugin !== 'undefined';
    if (!pluginIsDefined) {
        LOG.warn(ERROR_MESSAGE);
    }
    return pluginIsDefined;
}

var Facebook = function () {
    function Facebook() {
        var logger = arguments.length <= 0 || arguments[0] === undefined ? LOG : arguments[0];

        _classCallCheck(this, Facebook);

        this.LOG = logger;
    }

    _createClass(Facebook, [{
        key: 'facebookLogin',
        value: function facebookLogin(scope) {
            var callbackSuccess = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
            var callbackError = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

            if (!facebookPluginIsDefined()) {
                return;
            }

            return new Promise(function (resolve, reject) {
                window.facebookConnectPlugin.login(scope.split(','), function (userData) {
                    resolve(userData);
                }, function (error) {
                    callbackError(error);
                });
            });
        }
    }, {
        key: 'getAccessToken',
        value: function getAccessToken() {
            var callbackSuccess = arguments.length <= 0 || arguments[0] === undefined ? function () {} : arguments[0];
            var callbackError = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            if (!facebookPluginIsDefined()) {
                return;
            }
            return new Promise(function (resolve, reject) {
                window.facebookConnectPlugin.getAccessToken(function (token) {
                    var result = { accessToken: token };
                    callbackSuccess(result);
                    resolve(result);
                }, function (err) {
                    var result = { error: err };
                    callbackError(result);
                    reject(result);
                });
            });
        }
    }, {
        key: 'facebookShare',
        value: function facebookShare(url) {
            var callbackSuccess = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
            var callbackError = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

            if (!facebookPluginIsDefined()) {
                return;
            }
            var options = {
                method: 'share',
                href: url
            };
            return new Promise(function (resolve, reject) {
                window.facebookConnectPlugin.showDialog(options, function (message) {
                    var result = { message: message };
                    callbackSuccess(result);
                    resolve(result);
                }, function (error) {
                    var result = { error: error };
                    callbackError(result);
                    reject(result);
                });
            });
        }
    }]);

    return Facebook;
}();

exports.default = Facebook;
module.exports = exports['default'];

},{"./Logger":313}],311:[function(require,module,exports){
'use strict';

var Logger = require('./Logger');
var requireCondition = require('./Decorators').requireCondition;

var File = {};
var LOG = new Logger('ALL', '[File - module]');

File.LOG = LOG;
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

File.ERROR_MAP = {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
};

File.currentFileTransfer = null;

File.initialize = function () {
    var baseDir = '',
        cacheDir = '',
        tempDirectory = '',
        wwwDir = '',
        dataDir = '';

    try {
        baseDir = window.cordova.file.applicationStorageDirectory;
        cacheDir = window.cordova.file.cacheDirectory;
        tempDirectory = window.cordova.file.tempDirectory;
        wwwDir = window.cordova.file.applicationDirectory + 'www/';
        dataDir = window.cordova.file.dataDirectory;
    } catch (reason) {
        LOG.error(reason);
        return Promise.reject(reason);
    }

    if (window.device.platform.toLowerCase() === 'ios') {
        baseDir += 'Documents/';
    }
    if (window.device.platform.toLowerCase() === 'android') {
        tempDirectory = cacheDir;
    }

    File.BASE_DIR = baseDir;
    File.OFFLINE_INDEX = wwwDir + 'index.html';
    return Promise.resolve();
};

File.resolveFS = function (url) {
    return new Promise(function (resolve, reject) {
        window.resolveLocalFileSystemURL(url, resolve, reject);
    });
};

File.appendToFile = function (filePath, data, overwrite, mimeType) {
    overwrite = arguments[2] === undefined ? false : arguments[2];
    mimeType = arguments[3] === undefined ? 'text/plain' : arguments[3];

    return File.resolveFS(filePath).then(function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.createWriter(function (fileWriter) {
                if (!overwrite) {
                    fileWriter.seek(fileWriter.length);
                }

                var blob;
                if (!(data instanceof Blob)) {
                    blob = new Blob([data], { type: mimeType });
                } else {
                    blob = data;
                }

                fileWriter.write(blob);
                fileWriter.onerror = reject;
                fileWriter.onabort = reject;
                fileWriter.onwriteend = function () {
                    resolve(__transform([fileEntry]));
                };
            }, reject);
        });
    });
};

File.readFileAsHTML = function (indexPath) {

    return File.readFile(indexPath).then(function (documentAsString) {
        return new window.DOMParser().parseFromString(documentAsString, 'text/html');
    });
};

File.readFileAsJSON = function (indexPath) {
    return File.readFile(indexPath).then(function (documentAsString) {
        try {
            return Promise.resolve(window.JSON.parse(documentAsString));
        } catch (e) {
            return Promise.reject(e);
        }
    });
};

File.removeFile = function (filePath) {
    return File.resolveFS(filePath).then(function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.remove(function (result) {
                resolve(result === null || result === 'OK');
            }, reject);
        });
    });
};

File.removeDir = function (dirpath) {
    return File.resolveFS(dirpath).then(function (dirEntry) {
        return new Promise(function (resolve, reject) {
            dirEntry.removeRecursively(function (result) {
                resolve(result === null || result === 'OK');
            }, reject);
        });
    });
};

File._promiseZip = function (zipPath, outFolder, _onProgress) {

    LOG.log('PROMISEZIP:', arguments);
    return new Promise(function (resolve, reject) {
        window.zip.unzip(zipPath, outFolder, function (result) {
            if (result === 0) {
                resolve(true);
            } else {
                reject(result);
            }
        }, _onProgress);
    });
};

File.download = function (url, filepath, saveAsName, _onProgress) {
    var self = this;
    this.ft = new window.FileTransfer();
    this.ft.onprogress = _onProgress;
    File.currentFileTransfer = self.ft;

    self.promise = new Promise(function (resolve, reject) {
        self.ft.download(window.encodeURI(url), filepath + saveAsName, function (entry) {
            resolve(__transform([entry]));
            self.ft = null;
        }, function (reason) {
            reject(reason);
            self.ft = null;
        }, true);
    });
};

File.createDir = function (dirPath, subFolderName) {
    return File.resolveFS(dirPath).then(function (dirEntry) {
        return new Promise(function (resolve, reject) {
            dirEntry.getDirectory(subFolderName, { create: true }, function (entry) {
                resolve(__transform([entry]));
            }, reject);
        });
    });
};

File.fileExists = function (url) {
    return new Promise(function (resolve) {
        window.resolveLocalFileSystemURL(url, function (entry) {

            resolve(entry.isFile);
        }, function (fileError) {
            resolve(fileError.code !== 1);
        });
    });
};

File.dirExists = function (url) {
    return new Promise(function (resolve) {
        window.resolveLocalFileSystemURL(url, function (entry) {

            resolve(entry.isDirectory);
        }, function (fileError) {

            resolve(fileError.code != 1);
        });
    });
};

File.requestFileSystem = function (TYPE, size) {
    return new Promise(function (resolve, reject) {
        window.requestFileSystem(TYPE, size, resolve, reject);
    });
};

File.readDir = function (dirPath) {
    return File.resolveFS(dirPath).then(function (dirEntry) {
        return new Promise(function (resolve, reject) {
            var reader = dirEntry.createReader();
            reader.readEntries(function (entries) {
                LOG.log('readDir:', entries);
                resolve(__transform(entries));
            }, reject);
        });
    });
};

File.readFile = function (filePath) {

    return File.resolveFS(filePath).then(function (fileEntry) {
        return new Promise(function (resolve, reject) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onerror = reject;
                reader.onabort = reject;

                reader.onloadend = function () {
                    var textToParse = this.result;
                    resolve(textToParse);
                };
                reader.readAsText(file);
            });
        });
    });
};

File.createFile = function (directory, filename) {
    return File.resolveFS(directory).then(function (dirEntry) {
        return new Promise(function (resolve, reject) {
            dirEntry.getFile(filename, { create: true }, function (entry) {
                resolve(__transform([entry]));
            }, reject);
        });
    });
};

File.write = function (filepath, content) {
    return File.fileExists(filepath).then(function (exists) {
        if (!exists) {
            var splitted = filepath.split('/');

            var folder = splitted.slice(0, splitted.length - 1).join('/');
            var filename = splitted[splitted.length - 1];

            return File.createFile(folder, filename).then(function (entry) {
                return File.appendToFile(entry.path, content, true);
            });
        }
        return File.appendToFile(filepath, content, true);
    });
};

File.moveDir = function (source, destination) {
    var newFolderName = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFolderName, '');

    LOG.log('moveDir:', parent, newFolderName);
    return Promise.all([File.resolveFS(source), File.resolveFS(parent)]).then(function (entries) {
        LOG.log('moveDir: resolved entries', entries);
        return new Promise(function (resolve, reject) {
            entries[0].moveTo(entries[1], newFolderName, resolve, reject);
        });
    });
};

File.copyFile = function (source, destination) {
    var newFilename = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFilename, '');

    return Promise.all([File.resolveFS(source), File.resolveFS(parent)]).then(function (entries) {
        LOG.log('copyFileTo', entries);
        return new Promise(function (resolve, reject) {
            entries[0].copyTo(entries[1], newFilename, resolve, reject);
        });
    });
};

File.copyDir = function (source, destination) {
    var newFolderName = destination.substring(destination.lastIndexOf('/') + 1);
    var parent = destination.replace(newFolderName, '');

    return Promise.all([File.resolveFS(source), File.resolveFS(parent)]).then(function (entries) {
        LOG.log('copyDir', source, 'in', destination);
        return new Promise(function (resolve, reject) {
            entries[0].copyTo(entries[1], newFolderName, resolve, reject);
        });
    });
};

File.getMetadata = function (path) {
    return File.resolveFS(path).then(function (entry) {
        return new Promise(function (resolve, reject) {
            entry.getMetadata(resolve, reject);
        });
    });
};

function __transform(entries) {
    var arr = entries.map(function (entry) {
        return {
            fullPath: entry.fullPath,
            path: entry.toURL(),
            internalURL: entry.toInternalURL ? entry.toInternalURL() : '',
            isFile: entry.isFile,
            isDirectory: entry.isDirectory
        };
    });
    return arr.length === 1 ? arr[0] : arr;
}

function checkPlugins() {
    return window.resolveLocalFileSystemURL;
}

Object.keys(File).map(function (methodName) {
    File[methodName] = requireCondition(checkPlugins, File[methodName], null, 'cordova-plugin-file missing', 'warn');
});

module.exports = File;

},{"./Decorators":308,"./Logger":313}],312:[function(require,module,exports){
'use strict';

var fileModule = require('./File');
var Logger = require('./Logger');
var JSONPRequest = require('http-francis').JSONPRequest;
var extend = require('./Utils').extend;
var dequeryfy = require('./Utils').dequeryfy;
var queryfy = require('./Utils').queryfy;
var getJSON = require('./Utils').getJSON;
var getImageRaw = require('./Utils').getImageRaw;

var baseDir,
    cacheDir,
    tempDirectory,
    constants = {},
    wwwDir,
    dataDir,
    stargatejsDir,
    CONF = {
    sdk_url: '',
    api: '',
    gamifive_info_api: '',
    bundle_games: []
},
    downloading = false;

var emptyOfflineData = {
    GamifiveInfo: {},
    queues: {}
};

var ga_for_games_qs = {
    print_json_response: 1
};

var obj = {
    'content_id': '',
    'formats': 'html5applications',
    'sort': '-born_date',
    'category': 'b940b384ff0565b06dde433e05dc3c93',
    'publisher': '',
    'size': 6,
    'offset': 0,
    'label': '',
    'label_slug': '',
    'access_type': '',
    'real_customer_id': 'xx_gameasy',
    'lang': 'en',
    'use_cs_id': '',
    'white_label': 'xx_gameasy',
    'main_domain': 'http://www2.gameasy.com/ww',
    'fw': 'gameasy',
    'vh': 'ww.gameasy.com',
    'check_compatibility_header': 0
};

var LOG = new Logger('ALL', '[Game - module]', { background: 'black', color: '#5aa73a' });

function Game() {}

Game.prototype.initialize = function (customConf) {

    if (customConf) {
        CONF = extend(CONF, customConf);
    }
    LOG.log('Initialized called with:', CONF);

    try {
        baseDir = window.cordova.file.applicationStorageDirectory;
        cacheDir = window.cordova.file.cacheDirectory;
        tempDirectory = window.cordova.file.tempDirectory;
        wwwDir = window.cordova.file.applicationDirectory + 'www/';
        stargatejsDir = window.cordova.file.applicationDirectory + 'www/js/stargate.js';
        dataDir = window.cordova.file.dataDirectory;
    } catch (reason) {
        LOG.error(reason);
        return Promise.reject(reason);
    }

    if (window.device.platform.toLowerCase() == 'ios') {
        baseDir += 'Documents/';
    }
    if (window.device.platform.toLowerCase() == 'android') {
        tempDirectory = cacheDir;
    }

    constants.SDK_DIR = baseDir + 'scripts/';
    constants.SDK_RELATIVE_DIR = '../../scripts/';
    constants.GAMEOVER_RELATIVE_DIR = '../../gameover_template/';
    constants.GAMES_DIR = baseDir + 'games/';
    constants.BASE_DIR = baseDir;
    constants.CACHE_DIR = cacheDir;
    constants.TEMP_DIR = tempDirectory;
    constants.CORDOVAJS = wwwDir + 'cordova.js';
    constants.CORDOVA_PLUGINS_JS = wwwDir + 'cordova_plugins.js';
    constants.STARGATEJS = wwwDir + 'js/stargate.js';
    constants.DATA_DIR = dataDir;
    constants.GAMEOVER_DIR = constants.BASE_DIR + 'gameover_template/';
    constants.WWW_DIR = wwwDir;

    LOG.info('cordova JS dir to include', constants.CORDOVAJS);

    this.BASE_DIR = constants.BASE_DIR;
    this.OFFLINE_INDEX = constants.WWW_DIR + 'index.html';

    var gamesDirTask = fileModule.createDir(constants.BASE_DIR, 'games');
    var scriptsDirTask = fileModule.createDir(constants.BASE_DIR, 'scripts');
    var createOfflineDataTask = fileModule.fileExists(constants.BASE_DIR + 'offlineData.json').then(function (exists) {
        if (!exists) {
            LOG.info('creating offlineData.json');
            return fileModule.createFile(constants.BASE_DIR, 'offlineData.json').then(function (entry) {
                LOG.log('offlineData', entry);
                return fileModule.write(entry.path, JSON.stringify(emptyOfflineData));
            });
        } else {
            LOG.log('offlineData.json already exists');
            return exists;
        }
    });

    return Promise.all([gamesDirTask, scriptsDirTask, createOfflineDataTask]).then(function (results) {
        LOG.log('GamesDir, ScriptsDir, offlineData.json created', results);
        return copyAssets();
    }).then(getSDK);
};

function copyAssets() {
    return Promise.all([fileModule.dirExists(constants.BASE_DIR + 'gameover_template'), fileModule.dirExists(constants.SDK_DIR + 'plugins'), fileModule.fileExists(constants.SDK_DIR + 'cordova.js'), fileModule.fileExists(constants.SDK_DIR + 'cordova_plugins.js'), fileModule.fileExists(constants.SDK_DIR + 'gamesFixes.js')]).then(function (results) {
        var all = [];
        if (!results[0]) {
            all.push(fileModule.copyDir(constants.WWW_DIR + 'gameover_template', constants.BASE_DIR + 'gameover_template'));
        }

        if (!results[1]) {
            all.push(fileModule.copyDir(constants.WWW_DIR + 'plugins', constants.SDK_DIR + 'plugins'));
        }

        if (!results[2]) {
            all.push(fileModule.copyFile(constants.CORDOVAJS, constants.SDK_DIR + 'cordova.js'));
        }

        if (!results[3]) {
            all.push(fileModule.copyFile(constants.CORDOVA_PLUGINS_JS, constants.SDK_DIR + 'cordova_plugins.js'));
        }

        if (!results[4]) {
            all.push(fileModule.copyFile(constants.WWW_DIR + 'js/gamesFixes.js', constants.SDK_DIR + 'gamesFixes.js'));
        }
        return Promise.all(all);
    });
}

function getSDK() {
    var now = new Date();
    var sdkURLFresh = queryfy(CONF.sdk_url, { v: now.getTime() });

    return fileModule.fileExists(constants.SDK_DIR + 'gfsdk.min.js').then(function (result) {
        var isSdkDownloaded = result,
            tasks = [];

        if (CONF.sdk_url !== '' && !isSdkDownloaded) {
            LOG.log('isSdkDownloaded', isSdkDownloaded, 'get SDK', sdkURLFresh);
            tasks.push(new fileModule.download(sdkURLFresh, constants.SDK_DIR, 'gfsdk.min.js').promise);
        }

        return Promise.all(tasks);
    }).then(function getSdkMetaData() {
        return Promise.all([fileModule.getMetadata(constants.SDK_DIR + 'gfsdk.min.js')]);
    }).then(function checkSdkDate(result) {
        var sdkMetadata = result,
            tasks = [];

        var lastSdkModification = new Date(sdkMetadata.modificationTime);

        if (lastSdkModification.getDate() < now.getDate()) {
            LOG.log('updating sdk', sdkURLFresh, lastSdkModification);
            tasks.push(new fileModule.download(sdkURLFresh, constants.SDK_DIR, 'gfsdk.min.js').promise);
        }

        return Promise.all(tasks);
    });
}

Game.prototype.download = function (gameObject, callbacks) {
    var self = this;
    gameObject = JSON.parse(JSON.stringify(gameObject));
    var err;
    if (this.isDownloading()) {
        err = { type: 'error', description: 'AlreadyDownloading' };
        callbacks.onEnd(err);
        return Promise.reject(err);
    }

    if (!gameObject.hasOwnProperty('response_api_dld') || gameObject.response_api_dld.status !== 200) {
        err = { type: 'error', description: 'response_api_dld.status not equal 200 or undefined' };
        callbacks.onEnd(err);
        return Promise.reject(err);
    }

    var alreadyExists = this.isGameDownloaded(gameObject.id);

    callbacks = callbacks ? callbacks : {};
    var _onProgress = callbacks.onProgress ? callbacks.onProgress : function () {};
    var _onStart = callbacks.onStart ? callbacks.onStart : function () {};
    var _onEnd = callbacks.onEnd ? callbacks.onEnd : function () {};

    function wrapProgress(type) {
        return function (progressEvent) {
            var percentage = Math.round(progressEvent.loaded / progressEvent.total * 100);
            _onProgress({ percentage: percentage, type: type });
        };
    }

    var currentSize = gameObject.size.replace('KB', '').replace('MB', '').replace(',', '.').trim();
    var conversion = { KB: 1, MB: 2, GB: 3, TB: 5 };

    var isMB = gameObject.size.indexOf('MB') > -1 ? true : false;
    var bytes = currentSize * Math.pow(1024, isMB ? conversion.MB : conversion.KB);

    var saveAsName = gameObject.id;
    function start() {
        _onStart({ type: 'download' });
        var spaceEnough = fileModule.requestFileSystem(1, bytes);
        LOG.log('Get ga_for_game and gamifive info, fly my minipony!');
        return spaceEnough.then(function (result) {
            LOG.info('Space is ok, can download:', bytes, result);
            return storeOfflineData(saveAsName);
        }).then(function (results) {
            LOG.log('Ga for game and gamifive info stored!', results);
            LOG.log('Start Download:', gameObject.id, gameObject.response_api_dld.binary_url);
            return new fileModule.download(gameObject.response_api_dld.binary_url, constants.TEMP_DIR, saveAsName + '.zip', wrapProgress('download')).promise;
        }).then(function (entry) {
            _onStart({ type: 'unzip' });
            LOG.log('unzip:', gameObject.id, constants.TEMP_DIR + saveAsName);
            return fileModule._promiseZip(entry.path, constants.TEMP_DIR + saveAsName, wrapProgress('unzip'));
        }).then(function (result) {
            LOG.log('Unzip ended', result);
            _onEnd({ type: 'unzip' });

            var api_dld = gameObject.response_api_dld.url_download;
            var folders = api_dld.substring(api_dld.lastIndexOf('game'), api_dld.length).split('/');

            var slashed = api_dld.split('/');
            var splitted = slashed.slice(slashed.lastIndexOf('game'), slashed.length);

            folders = [];
            for (var i = 0; i < splitted.length; i++) {
                if (splitted[i] !== 'game' && !isIndexHtml(splitted[i])) {
                    folders.push(splitted[i]);
                }
            }

            LOG.log('Folders before index', folders);

            folders.unshift(saveAsName);

            var src = constants.TEMP_DIR + folders.join('/');
            LOG.log('Folders on disk', src);

            LOG.log('Copy game folder in games/', src, constants.GAMES_DIR + saveAsName);
            return fileModule.moveDir(src, constants.GAMES_DIR + saveAsName);
        }).then(function (result) {
            LOG.log('Remove zip from:', constants.TEMP_DIR + saveAsName + '.zip', 'last operation result', result);
            return fileModule.removeFile(constants.TEMP_DIR + saveAsName + '.zip');
        }).then(function () {
            LOG.log('Save meta.json for:', gameObject.id);


            var info = {
                gameId: gameObject.id,
                size: { width: '500', height: '500', ratio: '1' },
                url: gameObject.images.cover.ratio_1,
                type: 'cover',
                method: 'xhr' };

            return downloadImage(info);
        }).then(function (coverResult) {
            LOG.log('Save meta.json for:', gameObject.id);
            LOG.log('Download image result', coverResult);

            gameObject.images.cover.ratio_1 = coverResult.internalURL;
            return fileModule.createFile(constants.GAMES_DIR + saveAsName, 'meta.json').then(function (entry) {
                return fileModule.write(entry.path, JSON.stringify(gameObject));
            });
        }).then(function (result) {

            LOG.log('result last operation:save meta.json', result);
            LOG.log('InjectScripts in game:', gameObject.id, wwwDir);
            return injectScripts(gameObject.id, [constants.SDK_RELATIVE_DIR + 'gamesFixes.js', constants.GAMEOVER_RELATIVE_DIR + 'gameover.css', constants.SDK_RELATIVE_DIR + 'cordova.js', constants.SDK_RELATIVE_DIR + 'cordova_plugins.js', constants.SDK_RELATIVE_DIR + 'gfsdk.min.js']);
        }).then(function (results) {
            LOG.log('injectScripts result', results);
            _onEnd({ type: 'download' });
            downloading = false;
            return gameObject.id;
        }).catch(function (reason) {
            LOG.error(reason, 'Cleaning...game not downloaded', gameObject.id);
            downloading = false;
            self.remove(gameObject.id);
            _onEnd({ type: 'error', description: reason });
            throw reason;
        });
    }

    return alreadyExists.then(function (exists) {
        LOG.log('Exists', exists);
        if (exists) {
            downloading = false;
            return Promise.reject({ 12: 'AlreadyExists', gameID: gameObject.id });
        } else {
            downloading = true;
            return start();
        }
    });
};

Game.prototype.play = function (gameID) {
    LOG.log('Play', gameID);

    var gamedir = constants.GAMES_DIR + gameID;
    return fileModule.readDir(gamedir).then(function (entries) {
        return entries.filter(function (entry) {
            return isIndexHtml(entry.path);
        });
    }).then(function (entry) {
        LOG.log('Playing this', entry);
        var address = entry[0].internalURL + '?hybrid=1';
        if (window.device.platform.toLowerCase() === 'ios') {
            LOG.log('Play ios', address);
            window.location.href = address;
        } else {
            LOG.log('Play android', address);

            window.navigator.app.loadUrl(encodeURI(address));
        }
    });
};

function _getIndexHtmlById(gameID) {
    LOG.log('_getIndexHtmlById', constants.GAMES_DIR + gameID);
    return fileModule.readDir(constants.GAMES_DIR + gameID).then(function (entries) {
        LOG.log('_getIndexHtmlById readDir', entries);
        return entries.filter(function (entry) {
            return isIndexHtml(entry.path);
        });
    });
}

function _removeRemoteSDK(dom) {
    LOG.log('_removeRemoteSDK');
    var scripts = dom.querySelectorAll('script');
    var scriptTagSdk;
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.indexOf('gfsdk') !== -1) {
            scriptTagSdk = scripts[i];
            LOG.log('_removeRemoteSDK', scriptTagSdk);
            scriptTagSdk.parentNode.removeChild(scriptTagSdk);
            break;
        }
    }
    return dom;
}

function _injectScriptsInDom(dom, sources) {
    dom = _removeRemoteSDK(dom);
    var _sources = Array.isArray(sources) === false ? [sources] : sources;
    var temp, css;
    LOG.log('injectScripts', _sources);

    var metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = 'default-src * ' + 'data: ' + 'content: ' + 'cdvfile: ' + 'file: ' + 'http: ' + 'https: ' + 'gap: ' + 'https://ssl.gstatic.com ' + "'unsafe-inline' " + "'unsafe-eval';" + "style-src * cdvfile: http: https: 'unsafe-inline';";
    dom.head.insertBefore(metaTag, dom.getElementsByTagName('meta')[0]);

    var root = dom.createElement('script');
    root.id = '__root__';
    dom.head.insertBefore(root, dom.head.firstElementChild);

    var scriptFragment = dom.createDocumentFragment();

    for (var i = 0; i < _sources.length; i++) {
        if (_sources[i].endsWith('.css')) {
            LOG.log('css inject:', _sources[i]);
            css = dom.createElement('link');
            css.rel = 'stylesheet';
            css.href = _sources[i];
            dom.head.insertBefore(css, dom.getElementsByTagName('link')[0]);
        } else {
            temp = dom.createElement('script');
            temp.src = _sources[i];
            scriptFragment.appendChild(temp);
        }
    }

    dom.head.insertBefore(scriptFragment, dom.head.getElementsByTagName('script')[0]);
    LOG.log('Cleaned dom:', dom);
    return dom;
}

function removeOldGmenu(dom) {
    var toRemove = [];
    toRemove.push(dom.querySelector("link[href='/gmenu/frame.css']"));
    toRemove.push(dom.querySelector('iframe#menu'));
    toRemove.push(dom.querySelector("script[src='/gmenu/toggle.js']"));
    var scripts = dom.querySelectorAll('script');

    for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].innerHTML.indexOf('function open') !== -1) {
            toRemove.push(scripts[i]);

            break;
        }
    }

    for (var j = 0; j < toRemove.length; j++) {
        if (toRemove[j]) {
            toRemove[j].parentNode.removeChild(toRemove[j]);
        }
    }

    return dom;
}

function injectScripts(gameID, sources) {
    var indexPath;
    return _getIndexHtmlById(gameID).then(function (entry) {
        indexPath = entry[0].path;
        LOG.log('injectScripts', indexPath);
        return fileModule.readFileAsHTML(entry[0].path);
    }).then(function (dom) {
        function appendToHead(element) {
            dom.head.appendChild(element);
        }

        var metaTags = dom.body.querySelectorAll('meta');
        var linkTags = dom.body.querySelectorAll('link');
        var styleTags = dom.body.querySelectorAll('style');
        var titleTag = dom.body.querySelectorAll('title');

        metaTags = [].slice.call(metaTags);
        linkTags = [].slice.call(linkTags);
        styleTags = [].slice.call(styleTags);
        titleTag = [].slice.call(titleTag);

        var all = metaTags.concat(linkTags).concat(styleTags).concat(titleTag);

        all.map(appendToHead);
        dom.body.innerHTML = dom.body.innerHTML.trim();

        LOG.log('_injectScripts');
        LOG.log(dom);
        return _injectScriptsInDom(dom, sources);
    }).then(removeOldGmenu).then(function (dom) {
        var attrs = [].slice.call(dom.querySelector('html').attributes);
        var htmlAttributesAsString = attrs.map(function (item) {
            return item.name + '=' + '"' + item.value + '"';
        }).join(' ');

        var finalDocAsString = '<!DOCTYPE html><html ' + htmlAttributesAsString + '>' + dom.documentElement.innerHTML + '</html>';
        LOG.log('Serialized dom', finalDocAsString);
        return finalDocAsString;
    }).then(function (htmlAsString) {
        LOG.log('Write dom:', indexPath, htmlAsString);
        return fileModule.write(indexPath, htmlAsString);
    });
}

function isIndexHtml(theString) {
    var isIndex = new RegExp(/.*\.html?$/i);
    return isIndex.test(theString);
}

Game.prototype.remove = function (gameID) {
    LOG.log('Removing game', gameID);
    var isCached = fileModule.dirExists(constants.CACHE_DIR + gameID + '.zip');
    var isInGameDir = fileModule.dirExists(constants.GAMES_DIR + gameID);
    return Promise.all([isCached, isInGameDir]).then(function (results) {
        var finalResults = [];
        if (results[0]) {
            LOG.log('Removed in cache', results[0]);
            finalResults.push(fileModule.removeFile(constants.CACHE_DIR + gameID + '.zip'));
        }

        if (results[1]) {
            LOG.log('Removed', results[1]);
            finalResults.push(fileModule.removeDir(constants.GAMES_DIR + gameID));
        }

        if (finalResults.length === 0) {
            LOG.info('Nothing to remove', finalResults);
        }
        return finalResults;
    });
};

Game.prototype.isDownloading = function () {
    return downloading;
};

Game.prototype.abortDownload = function () {
    if (this.isDownloading()) {
        LOG.log('Abort last download');
        if (fileModule.currentFileTransfer) {
            fileModule.currentFileTransfer.abort();
            fileModule.currentFileTransfer = null;
            downloading = false;
        }
        return true;
    }
    LOG.warn("There's not a download operation to abort");
    return false;
};

Game.prototype.list = function () {
    LOG.log('Get games list');
    return fileModule.readDir(constants.GAMES_DIR).then(function (entries) {
        var _entries = Array.isArray(entries) ? entries : [entries];
        return _entries.filter(function (entry) {
            if (entry.isDirectory) {
                return entry;
            }
        });
    }).then(function (gameEntries) {
        var metajsons = gameEntries.map(function (gameEntry) {
            return fileModule.readFileAsJSON(gameEntry.path + 'meta.json');
        });

        return Promise.all(metajsons).then(function (results) {
            return results;
        });
    });
};

Game.prototype.buildGameOver = function (data) {
    var metaJsonPath = constants.GAMES_DIR + data.content_id + '/meta.json';

    if (!data.hasOwnProperty('content_id')) {
        return Promise.reject('Missing content_id key!');
    }

    LOG.log('Read meta.json:', metaJsonPath);
    LOG.log('GAMEOVER_TEMPLATE path', constants.GAMEOVER_DIR + 'gameover.html');

    return Promise.all([fileModule.readFileAsJSON(metaJsonPath), fileModule.readFile(constants.GAMEOVER_DIR + 'gameover.html')]).then(function (results) {
        var htmlString = results[1];
        var metaJson = results[0];
        LOG.info('Meta JSON:', metaJson);
        return htmlString.replace('{{score}}', data.score).replace('{{game_title}}', metaJson.title).replace('{{game_title}}', metaJson.title).replace('{{url_share}}', metaJson.url_share).replace('{{url_cover}}', metaJson.images.cover.ratio_1);
    });
};

Game.prototype.isGameDownloaded = function (gameID) {
    return fileModule.dirExists(constants.GAMES_DIR + gameID);
};

Game.prototype.removeAll = function () {
    return fileModule.removeDir(constants.GAMES_DIR).then(function (result) {
        LOG.log('All games deleted!', result);
        return fileModule.createDir(constants.BASE_DIR, 'games');
    });
};

function downloadImage(info) {
    var toDld = info.url.replace('[WSIZE]', info.size.width).replace('[HSIZE]', info.size.height).split('?')[0];

    var gameFolder = constants.GAMES_DIR + info.gameId;

    var imageName = info.type + '_' + info.size.width + 'x' + info.size.height + ('_' + info.size.ratio || '') + '.jpeg';
    LOG.log('request Image to', toDld, 'coverImageUrl', imageName, 'imagesFolder', gameFolder);
    if (info.method === 'xhr') {
        return Promise.all([fileModule.createFile(gameFolder, imageName), getImageRaw({ url: toDld })]).then(function (results) {
            var entry = results[0];
            var blob = results[1];

            return fileModule.appendToFile(entry.path, blob, true, 'image/jpeg');
        });
    } else {
        return new fileModule.download(toDld, gameFolder, imageName, function () {}).promise;
    }
}

Game.prototype.getBundleGameObjects = function () {
    var self = this;
    if (CONF.bundle_games.length > 0) {
        LOG.log('Games bundle in configuration', CONF.bundle_games);
        var whichGameAlreadyHere = CONF.bundle_games.map(function (gameId) {
            return self.isGameDownloaded(gameId);
        });

        var filteredToDownload = Promise.all(whichGameAlreadyHere).then(function (results) {
            LOG.log('alreadyDownloaded', results);
            for (var i = 0; i < results.length; i++) {
                if (results[i]) CONF.bundle_games.splice(i, 1);
            }
            return CONF.bundle_games;
        }).then(function (bundlesGamesIds) {
            return bundlesGamesIds.join(',');
        });

        var tmpBundleGameObjects;
        return filteredToDownload.then(function (bundleGamesIds) {

            obj.content_id = bundleGamesIds;
            var api_string = queryfy(CONF.api, obj);
            LOG.log('Request bundle games meta info:', api_string);

            return new JSONPRequest(api_string).prom;
        }).then(function (bundleGameObjects) {
            LOG.log('Games bundle response:', bundleGameObjects);
            tmpBundleGameObjects = bundleGameObjects;
            var jsonpRequests = bundleGameObjects.map(function (item) {
                return new JSONPRequest(item.url_api_dld).prom;
            });
            LOG.log('jsonpRequests', jsonpRequests);
            return Promise.all(jsonpRequests);
        }).then(function (results) {
            LOG.log('RESULTS', results);

            for (var i = 0; i < results.length; i++) {
                tmpBundleGameObjects[i].response_api_dld = results[i];
            }

            LOG.log('GameObjects', tmpBundleGameObjects);
            return tmpBundleGameObjects;
        }).catch(function (reason) {
            LOG.error('Games bundle meta fail:', reason);
        });
    } else {
        LOG.warn('Bundle_games array is empty!');
        return Promise.reject('bundle_games array is empty!');
    }
};

Game.prototype.needsUpdate = function (gameId) {
    var oldMd5 = '';
    return fileModule.readFileAsJSON(constants.GAMES_DIR + gameId + '/meta.json').then(function (gameObject) {
        oldMd5 = gameObject.response_api_dld.binary_md5;
        return getJSON(gameObject.url_api_dld);
    }).then(function (response) {
        if (response.status === 200) {
            return response.binary_md5 !== oldMd5;
        } else {
            throw new Error('ResponseStatus ' + response.status);
        }
    });
};

function readUserJson() {
    LOG.info('readUserJson', constants.BASE_DIR + 'user.json');
    return fileModule.readFileAsJSON(constants.BASE_DIR + 'user.json');
}

function storeOfflineData(content_id) {

    var tasks = Promise.all([readUserJson()]);

    return tasks.then(function (result) {
        var userJson = result;

        if (!userJson.ponyUrl) {
            LOG.warn('ponyUrl in user check undefined!', userJson.ponyUrl);
            throw new Error('Not premium user');
        }

        var _PONYVALUE = userJson.ponyUrl.split('&_PONY=')[1];
        LOG.log('PONYVALUE', _PONYVALUE);

        var gamifive_api = queryfy(CONF.gamifive_info_api, {
            content_id: content_id,
            format: 'jsonp'
        });
        gamifive_api += userJson.ponyUrl;

        LOG.log('gamifive_info_api', gamifive_api);
        return [new JSONPRequest(gamifive_api).prom];
    }).then(function (result) {
        return result.then(function (gamifive_info) {
            LOG.log('gamifiveInfo:', gamifive_info);
            return updateOfflineData({ content_id: content_id, gamifive_info: gamifive_info.game_info });
        });
    });
}

function updateOfflineData(object) {
    return fileModule.readFileAsJSON(constants.BASE_DIR + 'offlineData.json').then(function (offlineData) {
        offlineData.GamifiveInfo[object.content_id] = object.gamifive_info;
        return offlineData;
    }).then(function (offlineDataUpdated) {
        LOG.log('writing offlineData.json', offlineDataUpdated);
        return fileModule.write(constants.BASE_DIR + 'offlineData.json', JSON.stringify(offlineDataUpdated));
    });
}
module.exports = Game;

},{"./File":311,"./Logger":313,"./Utils":314,"http-francis":297}],313:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
    function Logger(label, tag) {
        var styles = arguments.length <= 2 || arguments[2] === undefined ? { background: 'white', color: 'black' } : arguments[2];

        _classCallCheck(this, Logger);

        this.levels = {
            ALL: 5,
            ERROR: 1,
            WARN: 2,
            INFO: 3,
            DEBUG: 4,
            OFF: 0
        };

        this.level = this.levels[label.toUpperCase()];
        this.styles = styles;
        this.tag = '%c' + tag;
        this.styleString = 'background:' + this.styles.background + ';color:' + this.styles.color + ';';

        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.setLevel = this.setLevel.bind(this);
        this.__processArguments = this.__processArguments.bind(this);
    }

    _createClass(Logger, [{
        key: 'info',
        value: function info() {
            if (this.level >= this.levels.INFO) {
                console.info.apply(console, this.__processArguments(arguments));
            }
        }
    }, {
        key: 'warn',
        value: function warn() {
            if (this.level >= this.levels.WARN) {
                console.warn.apply(console, this.__processArguments(arguments));
            }
        }
    }, {
        key: 'log',
        value: function log() {
            if (this.level >= this.levels.DEBUG) {
                console.log.apply(console, this.__processArguments(arguments));
            }
        }
    }, {
        key: 'error',
        value: function error() {
            if (this.level >= this.levels.ERROR) {
                console.error.apply(console, this.__processArguments(arguments));
            }
        }
    }, {
        key: 'setLevel',
        value: function setLevel(label) {
            this.level = this.levels[label.toUpperCase()];
        }
    }, {
        key: '__processArguments',
        value: function __processArguments(args) {
            var _args = [].slice.call(args);
            _args.unshift(this.styleString);
            _args.unshift(this.tag);
            return _args;
        }
    }]);

    return Logger;
}();

exports.default = Logger;
module.exports = exports['default'];

},{}],314:[function(require,module,exports){
'use strict';

function Iterator(array) {
    var nextIndex = 0;

    return {
        next: function next(reset) {
            if (reset) {
                nextIndex = 0;
            }
            return nextIndex < array.length ? { value: array[nextIndex++], done: false } : { done: true };
        }
    };
}

function queryfy(_api, query) {
    var previousQuery = dequeryfy(_api);
    var qs = '',
        finalQuery,
        api = _api.slice(0);

    if (api.indexOf('?') > -1) {
        api = api.slice(0, api.indexOf('?'));
    }

    api += '?';
    finalQuery = extend(previousQuery, query);

    for (var key in finalQuery) {
        qs += encodeURIComponent(key);

        if (finalQuery[key]) {
            qs += '=' + encodeURIComponent(finalQuery[key]);
        }
        qs += '&';
    }

    if (qs.length > 0) {
        qs = qs.substring(0, qs.length - 1);
    }
    return [api, qs].join('');
}

function dequeryfy(_url) {
    var param = decodeURIComponent(_url.slice(0));

    var query = param.split('?')[1];
    if (!query) {
        return {};
    }

    var keyvalue = query.split('&');

    return keyvalue.reduce(function (newObj, _keyvalue) {
        var splitted = _keyvalue.split('=');
        var key = splitted[0];
        var value = splitted[1];
        newObj[key] = value;
        return newObj;
    }, {});
}

function extend(o1, o2) {

    var isObject = Object.prototype.toString.apply({});
    if (o1.toString() !== isObject || o2.toString() !== isObject) {
        throw new Error('Cannot merge different type');
    }
    var newObject = {};
    for (var k in o1) {
        if (o1.hasOwnProperty(k)) {
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if (o2.hasOwnProperty(j)) {
            if (Array.isArray(o1[j]) && Array.isArray(o2[j])) {
                newObject[j] = o1[j].concat(o2[j]);
                continue;
            }
            newObject[j] = o2[j];
        }
    }
    return newObject;
}

function getType(obj) {
    return {}.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
}

module.exports = {
    Iterator: Iterator,
    extend: extend,
    queryfy: queryfy,
    dequeryfy: dequeryfy,
    getType: getType
};

},{}],315:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var DEFAULT_CONFIGURATION = {
    DEVICE_READY_TIMEOUT: 5000,
    modules: [['file', {}]]
};
exports.default = DEFAULT_CONFIGURATION;
module.exports = exports['default'];

},{}]},{},[304])(304)
});