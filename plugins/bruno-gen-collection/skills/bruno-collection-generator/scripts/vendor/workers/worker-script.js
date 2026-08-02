"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e2) {
    throw mod = 0, e2;
  }
};

// node_modules/lodash/lodash.js
var require_lodash = __commonJS({
  "node_modules/lodash/lodash.js"(exports2, module2) {
    (function() {
      var undefined2;
      var VERSION = "4.18.1";
      var LARGE_ARRAY_SIZE = 200;
      var CORE_ERROR_TEXT = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", FUNC_ERROR_TEXT = "Expected a function", INVALID_TEMPL_VAR_ERROR_TEXT = "Invalid `variable` option passed into `_.template`", INVALID_TEMPL_IMPORTS_ERROR_TEXT = "Invalid `imports` option passed into `_.template`";
      var HASH_UNDEFINED = "__lodash_hash_undefined__";
      var MAX_MEMOIZE_SIZE = 500;
      var PLACEHOLDER = "__lodash_placeholder__";
      var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
      var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
      var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
      var DEFAULT_TRUNC_LENGTH = 30, DEFAULT_TRUNC_OMISSION = "...";
      var HOT_COUNT = 800, HOT_SPAN = 16;
      var LAZY_FILTER_FLAG = 1, LAZY_MAP_FLAG = 2, LAZY_WHILE_FLAG = 3;
      var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 17976931348623157e292, NAN = 0 / 0;
      var MAX_ARRAY_LENGTH = 4294967295, MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1, HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
      var wrapFlags = [
        ["ary", WRAP_ARY_FLAG],
        ["bind", WRAP_BIND_FLAG],
        ["bindKey", WRAP_BIND_KEY_FLAG],
        ["curry", WRAP_CURRY_FLAG],
        ["curryRight", WRAP_CURRY_RIGHT_FLAG],
        ["flip", WRAP_FLIP_FLAG],
        ["partial", WRAP_PARTIAL_FLAG],
        ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
        ["rearg", WRAP_REARG_FLAG]
      ];
      var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", domExcTag = "[object DOMException]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]", weakSetTag = "[object WeakSet]";
      var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
      var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
      var reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g, reUnescapedHtml = /[&<>"']/g, reHasEscapedHtml = RegExp(reEscapedHtml.source), reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
      var reEscape = /<%-([\s\S]+?)%>/g, reEvaluate = /<%([\s\S]+?)%>/g, reInterpolate = /<%=([\s\S]+?)%>/g;
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
      var reTrimStart = /^\s+/;
      var reWhitespace = /\s/;
      var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
      var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
      var reForbiddenIdentifierChars = /[()=,{}\[\]\/\s]/;
      var reEscapeChar = /\\(\\)?/g;
      var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
      var reFlags = /\w*$/;
      var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
      var reIsBinary = /^0b[01]+$/i;
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      var reIsOctal = /^0o[0-7]+$/i;
      var reIsUint = /^(?:0|[1-9]\d*)$/;
      var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
      var reNoMatch = /($^)/;
      var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
      var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsDingbatRange = "\\u2700-\\u27bf", rsLowerRange = "a-z\\xdf-\\xf6\\xf8-\\xff", rsMathOpRange = "\\xac\\xb1\\xd7\\xf7", rsNonCharRange = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", rsPunctuationRange = "\\u2000-\\u206f", rsSpaceRange = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", rsUpperRange = "A-Z\\xc0-\\xd6\\xd8-\\xde", rsVarRange = "\\ufe0e\\ufe0f", rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;
      var rsApos = "['\u2019]", rsAstral = "[" + rsAstralRange + "]", rsBreak = "[" + rsBreakRange + "]", rsCombo = "[" + rsComboRange + "]", rsDigits = "\\d+", rsDingbat = "[" + rsDingbatRange + "]", rsLower = "[" + rsLowerRange + "]", rsMisc = "[^" + rsAstralRange + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsUpper = "[" + rsUpperRange + "]", rsZWJ = "\\u200d";
      var rsMiscLower = "(?:" + rsLower + "|" + rsMisc + ")", rsMiscUpper = "(?:" + rsUpper + "|" + rsMisc + ")", rsOptContrLower = "(?:" + rsApos + "(?:d|ll|m|re|s|t|ve))?", rsOptContrUpper = "(?:" + rsApos + "(?:D|LL|M|RE|S|T|VE))?", reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsOrdLower = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", rsOrdUpper = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsEmoji = "(?:" + [rsDingbat, rsRegional, rsSurrPair].join("|") + ")" + rsSeq, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
      var reApos = RegExp(rsApos, "g");
      var reComboMark = RegExp(rsCombo, "g");
      var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
      var reUnicodeWord = RegExp([
        rsUpper + "?" + rsLower + "+" + rsOptContrLower + "(?=" + [rsBreak, rsUpper, "$"].join("|") + ")",
        rsMiscUpper + "+" + rsOptContrUpper + "(?=" + [rsBreak, rsUpper + rsMiscLower, "$"].join("|") + ")",
        rsUpper + "?" + rsMiscLower + "+" + rsOptContrLower,
        rsUpper + "+" + rsOptContrUpper,
        rsOrdUpper,
        rsOrdLower,
        rsDigits,
        rsEmoji
      ].join("|"), "g");
      var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
      var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
      var contextProps = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ];
      var templateCounter = -1;
      var typedArrayTags = {};
      typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
      typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
      var cloneableTags = {};
      cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
      cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
      var deburredLetters = {
        // Latin-1 Supplement block.
        "\xC0": "A",
        "\xC1": "A",
        "\xC2": "A",
        "\xC3": "A",
        "\xC4": "A",
        "\xC5": "A",
        "\xE0": "a",
        "\xE1": "a",
        "\xE2": "a",
        "\xE3": "a",
        "\xE4": "a",
        "\xE5": "a",
        "\xC7": "C",
        "\xE7": "c",
        "\xD0": "D",
        "\xF0": "d",
        "\xC8": "E",
        "\xC9": "E",
        "\xCA": "E",
        "\xCB": "E",
        "\xE8": "e",
        "\xE9": "e",
        "\xEA": "e",
        "\xEB": "e",
        "\xCC": "I",
        "\xCD": "I",
        "\xCE": "I",
        "\xCF": "I",
        "\xEC": "i",
        "\xED": "i",
        "\xEE": "i",
        "\xEF": "i",
        "\xD1": "N",
        "\xF1": "n",
        "\xD2": "O",
        "\xD3": "O",
        "\xD4": "O",
        "\xD5": "O",
        "\xD6": "O",
        "\xD8": "O",
        "\xF2": "o",
        "\xF3": "o",
        "\xF4": "o",
        "\xF5": "o",
        "\xF6": "o",
        "\xF8": "o",
        "\xD9": "U",
        "\xDA": "U",
        "\xDB": "U",
        "\xDC": "U",
        "\xF9": "u",
        "\xFA": "u",
        "\xFB": "u",
        "\xFC": "u",
        "\xDD": "Y",
        "\xFD": "y",
        "\xFF": "y",
        "\xC6": "Ae",
        "\xE6": "ae",
        "\xDE": "Th",
        "\xFE": "th",
        "\xDF": "ss",
        // Latin Extended-A block.
        "\u0100": "A",
        "\u0102": "A",
        "\u0104": "A",
        "\u0101": "a",
        "\u0103": "a",
        "\u0105": "a",
        "\u0106": "C",
        "\u0108": "C",
        "\u010A": "C",
        "\u010C": "C",
        "\u0107": "c",
        "\u0109": "c",
        "\u010B": "c",
        "\u010D": "c",
        "\u010E": "D",
        "\u0110": "D",
        "\u010F": "d",
        "\u0111": "d",
        "\u0112": "E",
        "\u0114": "E",
        "\u0116": "E",
        "\u0118": "E",
        "\u011A": "E",
        "\u0113": "e",
        "\u0115": "e",
        "\u0117": "e",
        "\u0119": "e",
        "\u011B": "e",
        "\u011C": "G",
        "\u011E": "G",
        "\u0120": "G",
        "\u0122": "G",
        "\u011D": "g",
        "\u011F": "g",
        "\u0121": "g",
        "\u0123": "g",
        "\u0124": "H",
        "\u0126": "H",
        "\u0125": "h",
        "\u0127": "h",
        "\u0128": "I",
        "\u012A": "I",
        "\u012C": "I",
        "\u012E": "I",
        "\u0130": "I",
        "\u0129": "i",
        "\u012B": "i",
        "\u012D": "i",
        "\u012F": "i",
        "\u0131": "i",
        "\u0134": "J",
        "\u0135": "j",
        "\u0136": "K",
        "\u0137": "k",
        "\u0138": "k",
        "\u0139": "L",
        "\u013B": "L",
        "\u013D": "L",
        "\u013F": "L",
        "\u0141": "L",
        "\u013A": "l",
        "\u013C": "l",
        "\u013E": "l",
        "\u0140": "l",
        "\u0142": "l",
        "\u0143": "N",
        "\u0145": "N",
        "\u0147": "N",
        "\u014A": "N",
        "\u0144": "n",
        "\u0146": "n",
        "\u0148": "n",
        "\u014B": "n",
        "\u014C": "O",
        "\u014E": "O",
        "\u0150": "O",
        "\u014D": "o",
        "\u014F": "o",
        "\u0151": "o",
        "\u0154": "R",
        "\u0156": "R",
        "\u0158": "R",
        "\u0155": "r",
        "\u0157": "r",
        "\u0159": "r",
        "\u015A": "S",
        "\u015C": "S",
        "\u015E": "S",
        "\u0160": "S",
        "\u015B": "s",
        "\u015D": "s",
        "\u015F": "s",
        "\u0161": "s",
        "\u0162": "T",
        "\u0164": "T",
        "\u0166": "T",
        "\u0163": "t",
        "\u0165": "t",
        "\u0167": "t",
        "\u0168": "U",
        "\u016A": "U",
        "\u016C": "U",
        "\u016E": "U",
        "\u0170": "U",
        "\u0172": "U",
        "\u0169": "u",
        "\u016B": "u",
        "\u016D": "u",
        "\u016F": "u",
        "\u0171": "u",
        "\u0173": "u",
        "\u0174": "W",
        "\u0175": "w",
        "\u0176": "Y",
        "\u0177": "y",
        "\u0178": "Y",
        "\u0179": "Z",
        "\u017B": "Z",
        "\u017D": "Z",
        "\u017A": "z",
        "\u017C": "z",
        "\u017E": "z",
        "\u0132": "IJ",
        "\u0133": "ij",
        "\u0152": "Oe",
        "\u0153": "oe",
        "\u0149": "'n",
        "\u017F": "s"
      };
      var htmlEscapes = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      var htmlUnescapes = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      };
      var stringEscapes = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      };
      var freeParseFloat = parseFloat, freeParseInt = parseInt;
      var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
      var freeSelf = typeof self == "object" && self && self.Object === Object && self;
      var root = freeGlobal || freeSelf || Function("return this")();
      var freeExports = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
      var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
      var moduleExports = freeModule && freeModule.exports === freeExports;
      var freeProcess = moduleExports && freeGlobal.process;
      var nodeUtil = (function() {
        try {
          var types = freeModule && freeModule.require && freeModule.require("util").types;
          if (types) {
            return types;
          }
          return freeProcess && freeProcess.binding && freeProcess.binding("util");
        } catch (e2) {
        }
      })();
      var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer, nodeIsDate = nodeUtil && nodeUtil.isDate, nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsRegExp = nodeUtil && nodeUtil.isRegExp, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
      function apply(func, thisArg, args) {
        switch (args.length) {
          case 0:
            return func.call(thisArg);
          case 1:
            return func.call(thisArg, args[0]);
          case 2:
            return func.call(thisArg, args[0], args[1]);
          case 3:
            return func.call(thisArg, args[0], args[1], args[2]);
        }
        return func.apply(thisArg, args);
      }
      function arrayAggregator(array, setter, iteratee, accumulator) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          var value = array[index];
          setter(accumulator, value, iteratee(value), array);
        }
        return accumulator;
      }
      function arrayEach(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (iteratee(array[index], index, array) === false) {
            break;
          }
        }
        return array;
      }
      function arrayEachRight(array, iteratee) {
        var length = array == null ? 0 : array.length;
        while (length--) {
          if (iteratee(array[length], length, array) === false) {
            break;
          }
        }
        return array;
      }
      function arrayEvery(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (!predicate(array[index], index, array)) {
            return false;
          }
        }
        return true;
      }
      function arrayFilter(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
        while (++index < length) {
          var value = array[index];
          if (predicate(value, index, array)) {
            result[resIndex++] = value;
          }
        }
        return result;
      }
      function arrayIncludes(array, value) {
        var length = array == null ? 0 : array.length;
        return !!length && baseIndexOf(array, value, 0) > -1;
      }
      function arrayIncludesWith(array, value, comparator) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (comparator(value, array[index])) {
            return true;
          }
        }
        return false;
      }
      function arrayMap(array, iteratee) {
        var index = -1, length = array == null ? 0 : array.length, result = Array(length);
        while (++index < length) {
          result[index] = iteratee(array[index], index, array);
        }
        return result;
      }
      function arrayPush(array, values) {
        var index = -1, length = values.length, offset = array.length;
        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }
      function arrayReduce(array, iteratee, accumulator, initAccum) {
        var index = -1, length = array == null ? 0 : array.length;
        if (initAccum && length) {
          accumulator = array[++index];
        }
        while (++index < length) {
          accumulator = iteratee(accumulator, array[index], index, array);
        }
        return accumulator;
      }
      function arrayReduceRight(array, iteratee, accumulator, initAccum) {
        var length = array == null ? 0 : array.length;
        if (initAccum && length) {
          accumulator = array[--length];
        }
        while (length--) {
          accumulator = iteratee(accumulator, array[length], length, array);
        }
        return accumulator;
      }
      function arraySome(array, predicate) {
        var index = -1, length = array == null ? 0 : array.length;
        while (++index < length) {
          if (predicate(array[index], index, array)) {
            return true;
          }
        }
        return false;
      }
      var asciiSize = baseProperty("length");
      function asciiToArray(string) {
        return string.split("");
      }
      function asciiWords(string) {
        return string.match(reAsciiWord) || [];
      }
      function baseFindKey(collection, predicate, eachFunc) {
        var result;
        eachFunc(collection, function(value, key, collection2) {
          if (predicate(value, key, collection2)) {
            result = key;
            return false;
          }
        });
        return result;
      }
      function baseFindIndex(array, predicate, fromIndex, fromRight) {
        var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
        while (fromRight ? index-- : ++index < length) {
          if (predicate(array[index], index, array)) {
            return index;
          }
        }
        return -1;
      }
      function baseIndexOf(array, value, fromIndex) {
        return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
      }
      function baseIndexOfWith(array, value, fromIndex, comparator) {
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
          if (comparator(array[index], value)) {
            return index;
          }
        }
        return -1;
      }
      function baseIsNaN(value) {
        return value !== value;
      }
      function baseMean(array, iteratee) {
        var length = array == null ? 0 : array.length;
        return length ? baseSum(array, iteratee) / length : NAN;
      }
      function baseProperty(key) {
        return function(object) {
          return object == null ? undefined2 : object[key];
        };
      }
      function basePropertyOf(object) {
        return function(key) {
          return object == null ? undefined2 : object[key];
        };
      }
      function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
        eachFunc(collection, function(value, index, collection2) {
          accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
        });
        return accumulator;
      }
      function baseSortBy(array, comparer) {
        var length = array.length;
        array.sort(comparer);
        while (length--) {
          array[length] = array[length].value;
        }
        return array;
      }
      function baseSum(array, iteratee) {
        var result, index = -1, length = array.length;
        while (++index < length) {
          var current = iteratee(array[index]);
          if (current !== undefined2) {
            result = result === undefined2 ? current : result + current;
          }
        }
        return result;
      }
      function baseTimes(n2, iteratee) {
        var index = -1, result = Array(n2);
        while (++index < n2) {
          result[index] = iteratee(index);
        }
        return result;
      }
      function baseToPairs(object, props) {
        return arrayMap(props, function(key) {
          return [key, object[key]];
        });
      }
      function baseTrim(string) {
        return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
      }
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }
      function baseValues(object, props) {
        return arrayMap(props, function(key) {
          return object[key];
        });
      }
      function cacheHas(cache, key) {
        return cache.has(key);
      }
      function charsStartIndex(strSymbols, chrSymbols) {
        var index = -1, length = strSymbols.length;
        while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
        }
        return index;
      }
      function charsEndIndex(strSymbols, chrSymbols) {
        var index = strSymbols.length;
        while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {
        }
        return index;
      }
      function countHolders(array, placeholder) {
        var length = array.length, result = 0;
        while (length--) {
          if (array[length] === placeholder) {
            ++result;
          }
        }
        return result;
      }
      var deburrLetter = basePropertyOf(deburredLetters);
      var escapeHtmlChar = basePropertyOf(htmlEscapes);
      function escapeStringChar(chr) {
        return "\\" + stringEscapes[chr];
      }
      function getValue(object, key) {
        return object == null ? undefined2 : object[key];
      }
      function hasUnicode(string) {
        return reHasUnicode.test(string);
      }
      function hasUnicodeWord(string) {
        return reHasUnicodeWord.test(string);
      }
      function iteratorToArray(iterator) {
        var data, result = [];
        while (!(data = iterator.next()).done) {
          result.push(data.value);
        }
        return result;
      }
      function mapToArray(map) {
        var index = -1, result = Array(map.size);
        map.forEach(function(value, key) {
          result[++index] = [key, value];
        });
        return result;
      }
      function overArg(func, transform) {
        return function(arg) {
          return func(transform(arg));
        };
      }
      function replaceHolders(array, placeholder) {
        var index = -1, length = array.length, resIndex = 0, result = [];
        while (++index < length) {
          var value = array[index];
          if (value === placeholder || value === PLACEHOLDER) {
            array[index] = PLACEHOLDER;
            result[resIndex++] = index;
          }
        }
        return result;
      }
      function setToArray(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
          result[++index] = value;
        });
        return result;
      }
      function setToPairs(set) {
        var index = -1, result = Array(set.size);
        set.forEach(function(value) {
          result[++index] = [value, value];
        });
        return result;
      }
      function strictIndexOf(array, value, fromIndex) {
        var index = fromIndex - 1, length = array.length;
        while (++index < length) {
          if (array[index] === value) {
            return index;
          }
        }
        return -1;
      }
      function strictLastIndexOf(array, value, fromIndex) {
        var index = fromIndex + 1;
        while (index--) {
          if (array[index] === value) {
            return index;
          }
        }
        return index;
      }
      function stringSize(string) {
        return hasUnicode(string) ? unicodeSize(string) : asciiSize(string);
      }
      function stringToArray(string) {
        return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
      }
      function trimmedEndIndex(string) {
        var index = string.length;
        while (index-- && reWhitespace.test(string.charAt(index))) {
        }
        return index;
      }
      var unescapeHtmlChar = basePropertyOf(htmlUnescapes);
      function unicodeSize(string) {
        var result = reUnicode.lastIndex = 0;
        while (reUnicode.test(string)) {
          ++result;
        }
        return result;
      }
      function unicodeToArray(string) {
        return string.match(reUnicode) || [];
      }
      function unicodeWords(string) {
        return string.match(reUnicodeWord) || [];
      }
      var runInContext = (function runInContext2(context) {
        context = context == null ? root : _2.defaults(root.Object(), context, _2.pick(root, contextProps));
        var Array2 = context.Array, Date2 = context.Date, Error2 = context.Error, Function2 = context.Function, Math2 = context.Math, Object2 = context.Object, RegExp2 = context.RegExp, String2 = context.String, TypeError2 = context.TypeError;
        var arrayProto = Array2.prototype, funcProto = Function2.prototype, objectProto = Object2.prototype;
        var coreJsData = context["__core-js_shared__"];
        var funcToString = funcProto.toString;
        var hasOwnProperty = objectProto.hasOwnProperty;
        var idCounter = 0;
        var maskSrcKey = (function() {
          var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
          return uid ? "Symbol(src)_1." + uid : "";
        })();
        var nativeObjectToString = objectProto.toString;
        var objectCtorString = funcToString.call(Object2);
        var oldDash = root._;
        var reIsNative = RegExp2(
          "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        );
        var Buffer2 = moduleExports ? context.Buffer : undefined2, Symbol2 = context.Symbol, Uint8Array2 = context.Uint8Array, allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : undefined2, getPrototype = overArg(Object2.getPrototypeOf, Object2), objectCreate = Object2.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : undefined2, symIterator = Symbol2 ? Symbol2.iterator : undefined2, symToStringTag = Symbol2 ? Symbol2.toStringTag : undefined2;
        var defineProperty = (function() {
          try {
            var func = getNative(Object2, "defineProperty");
            func({}, "", {});
            return func;
          } catch (e2) {
          }
        })();
        var ctxClearTimeout = context.clearTimeout !== root.clearTimeout && context.clearTimeout, ctxNow = Date2 && Date2.now !== root.Date.now && Date2.now, ctxSetTimeout = context.setTimeout !== root.setTimeout && context.setTimeout;
        var nativeCeil = Math2.ceil, nativeFloor = Math2.floor, nativeGetSymbols = Object2.getOwnPropertySymbols, nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : undefined2, nativeIsFinite = context.isFinite, nativeJoin = arrayProto.join, nativeKeys = overArg(Object2.keys, Object2), nativeMax = Math2.max, nativeMin = Math2.min, nativeNow = Date2.now, nativeParseInt = context.parseInt, nativeRandom = Math2.random, nativeReverse = arrayProto.reverse;
        var DataView = getNative(context, "DataView"), Map2 = getNative(context, "Map"), Promise2 = getNative(context, "Promise"), Set2 = getNative(context, "Set"), WeakMap = getNative(context, "WeakMap"), nativeCreate = getNative(Object2, "create");
        var metaMap = WeakMap && new WeakMap();
        var realNames = {};
        var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map2), promiseCtorString = toSource(Promise2), setCtorString = toSource(Set2), weakMapCtorString = toSource(WeakMap);
        var symbolProto = Symbol2 ? Symbol2.prototype : undefined2, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined2, symbolToString = symbolProto ? symbolProto.toString : undefined2;
        function lodash(value) {
          if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
            if (value instanceof LodashWrapper) {
              return value;
            }
            if (hasOwnProperty.call(value, "__wrapped__")) {
              return wrapperClone(value);
            }
          }
          return new LodashWrapper(value);
        }
        var baseCreate = /* @__PURE__ */ (function() {
          function object() {
          }
          return function(proto) {
            if (!isObject(proto)) {
              return {};
            }
            if (objectCreate) {
              return objectCreate(proto);
            }
            object.prototype = proto;
            var result2 = new object();
            object.prototype = undefined2;
            return result2;
          };
        })();
        function baseLodash() {
        }
        function LodashWrapper(value, chainAll) {
          this.__wrapped__ = value;
          this.__actions__ = [];
          this.__chain__ = !!chainAll;
          this.__index__ = 0;
          this.__values__ = undefined2;
        }
        lodash.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          "escape": reEscape,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          "evaluate": reEvaluate,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          "interpolate": reInterpolate,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          "variable": "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          "imports": {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            "_": lodash
          }
        };
        lodash.prototype = baseLodash.prototype;
        lodash.prototype.constructor = lodash;
        LodashWrapper.prototype = baseCreate(baseLodash.prototype);
        LodashWrapper.prototype.constructor = LodashWrapper;
        function LazyWrapper(value) {
          this.__wrapped__ = value;
          this.__actions__ = [];
          this.__dir__ = 1;
          this.__filtered__ = false;
          this.__iteratees__ = [];
          this.__takeCount__ = MAX_ARRAY_LENGTH;
          this.__views__ = [];
        }
        function lazyClone() {
          var result2 = new LazyWrapper(this.__wrapped__);
          result2.__actions__ = copyArray(this.__actions__);
          result2.__dir__ = this.__dir__;
          result2.__filtered__ = this.__filtered__;
          result2.__iteratees__ = copyArray(this.__iteratees__);
          result2.__takeCount__ = this.__takeCount__;
          result2.__views__ = copyArray(this.__views__);
          return result2;
        }
        function lazyReverse() {
          if (this.__filtered__) {
            var result2 = new LazyWrapper(this);
            result2.__dir__ = -1;
            result2.__filtered__ = true;
          } else {
            result2 = this.clone();
            result2.__dir__ *= -1;
          }
          return result2;
        }
        function lazyValue() {
          var array = this.__wrapped__.value(), dir = this.__dir__, isArr = isArray(array), isRight = dir < 0, arrLength = isArr ? array.length : 0, view = getView(0, arrLength, this.__views__), start = view.start, end = view.end, length = end - start, index = isRight ? end : start - 1, iteratees = this.__iteratees__, iterLength = iteratees.length, resIndex = 0, takeCount = nativeMin(length, this.__takeCount__);
          if (!isArr || !isRight && arrLength == length && takeCount == length) {
            return baseWrapperValue(array, this.__actions__);
          }
          var result2 = [];
          outer:
            while (length-- && resIndex < takeCount) {
              index += dir;
              var iterIndex = -1, value = array[index];
              while (++iterIndex < iterLength) {
                var data = iteratees[iterIndex], iteratee2 = data.iteratee, type = data.type, computed = iteratee2(value);
                if (type == LAZY_MAP_FLAG) {
                  value = computed;
                } else if (!computed) {
                  if (type == LAZY_FILTER_FLAG) {
                    continue outer;
                  } else {
                    break outer;
                  }
                }
              }
              result2[resIndex++] = value;
            }
          return result2;
        }
        LazyWrapper.prototype = baseCreate(baseLodash.prototype);
        LazyWrapper.prototype.constructor = LazyWrapper;
        function Hash(entries) {
          var index = -1, length = entries == null ? 0 : entries.length;
          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }
        function hashClear() {
          this.__data__ = nativeCreate ? nativeCreate(null) : {};
          this.size = 0;
        }
        function hashDelete(key) {
          var result2 = this.has(key) && delete this.__data__[key];
          this.size -= result2 ? 1 : 0;
          return result2;
        }
        function hashGet(key) {
          var data = this.__data__;
          if (nativeCreate) {
            var result2 = data[key];
            return result2 === HASH_UNDEFINED ? undefined2 : result2;
          }
          return hasOwnProperty.call(data, key) ? data[key] : undefined2;
        }
        function hashHas(key) {
          var data = this.__data__;
          return nativeCreate ? data[key] !== undefined2 : hasOwnProperty.call(data, key);
        }
        function hashSet(key, value) {
          var data = this.__data__;
          this.size += this.has(key) ? 0 : 1;
          data[key] = nativeCreate && value === undefined2 ? HASH_UNDEFINED : value;
          return this;
        }
        Hash.prototype.clear = hashClear;
        Hash.prototype["delete"] = hashDelete;
        Hash.prototype.get = hashGet;
        Hash.prototype.has = hashHas;
        Hash.prototype.set = hashSet;
        function ListCache(entries) {
          var index = -1, length = entries == null ? 0 : entries.length;
          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }
        function listCacheClear() {
          this.__data__ = [];
          this.size = 0;
        }
        function listCacheDelete(key) {
          var data = this.__data__, index = assocIndexOf(data, key);
          if (index < 0) {
            return false;
          }
          var lastIndex = data.length - 1;
          if (index == lastIndex) {
            data.pop();
          } else {
            splice.call(data, index, 1);
          }
          --this.size;
          return true;
        }
        function listCacheGet(key) {
          var data = this.__data__, index = assocIndexOf(data, key);
          return index < 0 ? undefined2 : data[index][1];
        }
        function listCacheHas(key) {
          return assocIndexOf(this.__data__, key) > -1;
        }
        function listCacheSet(key, value) {
          var data = this.__data__, index = assocIndexOf(data, key);
          if (index < 0) {
            ++this.size;
            data.push([key, value]);
          } else {
            data[index][1] = value;
          }
          return this;
        }
        ListCache.prototype.clear = listCacheClear;
        ListCache.prototype["delete"] = listCacheDelete;
        ListCache.prototype.get = listCacheGet;
        ListCache.prototype.has = listCacheHas;
        ListCache.prototype.set = listCacheSet;
        function MapCache(entries) {
          var index = -1, length = entries == null ? 0 : entries.length;
          this.clear();
          while (++index < length) {
            var entry = entries[index];
            this.set(entry[0], entry[1]);
          }
        }
        function mapCacheClear() {
          this.size = 0;
          this.__data__ = {
            "hash": new Hash(),
            "map": new (Map2 || ListCache)(),
            "string": new Hash()
          };
        }
        function mapCacheDelete(key) {
          var result2 = getMapData(this, key)["delete"](key);
          this.size -= result2 ? 1 : 0;
          return result2;
        }
        function mapCacheGet(key) {
          return getMapData(this, key).get(key);
        }
        function mapCacheHas(key) {
          return getMapData(this, key).has(key);
        }
        function mapCacheSet(key, value) {
          var data = getMapData(this, key), size2 = data.size;
          data.set(key, value);
          this.size += data.size == size2 ? 0 : 1;
          return this;
        }
        MapCache.prototype.clear = mapCacheClear;
        MapCache.prototype["delete"] = mapCacheDelete;
        MapCache.prototype.get = mapCacheGet;
        MapCache.prototype.has = mapCacheHas;
        MapCache.prototype.set = mapCacheSet;
        function SetCache(values2) {
          var index = -1, length = values2 == null ? 0 : values2.length;
          this.__data__ = new MapCache();
          while (++index < length) {
            this.add(values2[index]);
          }
        }
        function setCacheAdd(value) {
          this.__data__.set(value, HASH_UNDEFINED);
          return this;
        }
        function setCacheHas(value) {
          return this.__data__.has(value);
        }
        SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
        SetCache.prototype.has = setCacheHas;
        function Stack(entries) {
          var data = this.__data__ = new ListCache(entries);
          this.size = data.size;
        }
        function stackClear() {
          this.__data__ = new ListCache();
          this.size = 0;
        }
        function stackDelete(key) {
          var data = this.__data__, result2 = data["delete"](key);
          this.size = data.size;
          return result2;
        }
        function stackGet(key) {
          return this.__data__.get(key);
        }
        function stackHas(key) {
          return this.__data__.has(key);
        }
        function stackSet(key, value) {
          var data = this.__data__;
          if (data instanceof ListCache) {
            var pairs = data.__data__;
            if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
              pairs.push([key, value]);
              this.size = ++data.size;
              return this;
            }
            data = this.__data__ = new MapCache(pairs);
          }
          data.set(key, value);
          this.size = data.size;
          return this;
        }
        Stack.prototype.clear = stackClear;
        Stack.prototype["delete"] = stackDelete;
        Stack.prototype.get = stackGet;
        Stack.prototype.has = stackHas;
        Stack.prototype.set = stackSet;
        function arrayLikeKeys(value, inherited) {
          var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result2 = skipIndexes ? baseTimes(value.length, String2) : [], length = result2.length;
          for (var key in value) {
            if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
            (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
            isIndex(key, length)))) {
              result2.push(key);
            }
          }
          return result2;
        }
        function arraySample(array) {
          var length = array.length;
          return length ? array[baseRandom(0, length - 1)] : undefined2;
        }
        function arraySampleSize(array, n2) {
          return shuffleSelf(copyArray(array), baseClamp(n2, 0, array.length));
        }
        function arrayShuffle(array) {
          return shuffleSelf(copyArray(array));
        }
        function assignMergeValue(object, key, value) {
          if (value !== undefined2 && !eq(object[key], value) || value === undefined2 && !(key in object)) {
            baseAssignValue(object, key, value);
          }
        }
        function assignValue(object, key, value) {
          var objValue = object[key];
          if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined2 && !(key in object)) {
            baseAssignValue(object, key, value);
          }
        }
        function assocIndexOf(array, key) {
          var length = array.length;
          while (length--) {
            if (eq(array[length][0], key)) {
              return length;
            }
          }
          return -1;
        }
        function baseAggregator(collection, setter, iteratee2, accumulator) {
          baseEach(collection, function(value, key, collection2) {
            setter(accumulator, value, iteratee2(value), collection2);
          });
          return accumulator;
        }
        function baseAssign(object, source) {
          return object && copyObject(source, keys(source), object);
        }
        function baseAssignIn(object, source) {
          return object && copyObject(source, keysIn(source), object);
        }
        function baseAssignValue(object, key, value) {
          if (key == "__proto__" && defineProperty) {
            defineProperty(object, key, {
              "configurable": true,
              "enumerable": true,
              "value": value,
              "writable": true
            });
          } else {
            object[key] = value;
          }
        }
        function baseAt(object, paths) {
          var index = -1, length = paths.length, result2 = Array2(length), skip = object == null;
          while (++index < length) {
            result2[index] = skip ? undefined2 : get(object, paths[index]);
          }
          return result2;
        }
        function baseClamp(number, lower, upper) {
          if (number === number) {
            if (upper !== undefined2) {
              number = number <= upper ? number : upper;
            }
            if (lower !== undefined2) {
              number = number >= lower ? number : lower;
            }
          }
          return number;
        }
        function baseClone(value, bitmask, customizer, key, object, stack) {
          var result2, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
          if (customizer) {
            result2 = object ? customizer(value, key, object, stack) : customizer(value);
          }
          if (result2 !== undefined2) {
            return result2;
          }
          if (!isObject(value)) {
            return value;
          }
          var isArr = isArray(value);
          if (isArr) {
            result2 = initCloneArray(value);
            if (!isDeep) {
              return copyArray(value, result2);
            }
          } else {
            var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
            if (isBuffer(value)) {
              return cloneBuffer(value, isDeep);
            }
            if (tag == objectTag || tag == argsTag || isFunc && !object) {
              result2 = isFlat || isFunc ? {} : initCloneObject(value);
              if (!isDeep) {
                return isFlat ? copySymbolsIn(value, baseAssignIn(result2, value)) : copySymbols(value, baseAssign(result2, value));
              }
            } else {
              if (!cloneableTags[tag]) {
                return object ? value : {};
              }
              result2 = initCloneByTag(value, tag, isDeep);
            }
          }
          stack || (stack = new Stack());
          var stacked = stack.get(value);
          if (stacked) {
            return stacked;
          }
          stack.set(value, result2);
          if (isSet(value)) {
            value.forEach(function(subValue) {
              result2.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
            });
          } else if (isMap(value)) {
            value.forEach(function(subValue, key2) {
              result2.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
            });
          }
          var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
          var props = isArr ? undefined2 : keysFunc(value);
          arrayEach(props || value, function(subValue, key2) {
            if (props) {
              key2 = subValue;
              subValue = value[key2];
            }
            assignValue(result2, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
          });
          return result2;
        }
        function baseConforms(source) {
          var props = keys(source);
          return function(object) {
            return baseConformsTo(object, source, props);
          };
        }
        function baseConformsTo(object, source, props) {
          var length = props.length;
          if (object == null) {
            return !length;
          }
          object = Object2(object);
          while (length--) {
            var key = props[length], predicate = source[key], value = object[key];
            if (value === undefined2 && !(key in object) || !predicate(value)) {
              return false;
            }
          }
          return true;
        }
        function baseDelay(func, wait, args) {
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return setTimeout(function() {
            func.apply(undefined2, args);
          }, wait);
        }
        function baseDifference(array, values2, iteratee2, comparator) {
          var index = -1, includes2 = arrayIncludes, isCommon = true, length = array.length, result2 = [], valuesLength = values2.length;
          if (!length) {
            return result2;
          }
          if (iteratee2) {
            values2 = arrayMap(values2, baseUnary(iteratee2));
          }
          if (comparator) {
            includes2 = arrayIncludesWith;
            isCommon = false;
          } else if (values2.length >= LARGE_ARRAY_SIZE) {
            includes2 = cacheHas;
            isCommon = false;
            values2 = new SetCache(values2);
          }
          outer:
            while (++index < length) {
              var value = array[index], computed = iteratee2 == null ? value : iteratee2(value);
              value = comparator || value !== 0 ? value : 0;
              if (isCommon && computed === computed) {
                var valuesIndex = valuesLength;
                while (valuesIndex--) {
                  if (values2[valuesIndex] === computed) {
                    continue outer;
                  }
                }
                result2.push(value);
              } else if (!includes2(values2, computed, comparator)) {
                result2.push(value);
              }
            }
          return result2;
        }
        var baseEach = createBaseEach(baseForOwn);
        var baseEachRight = createBaseEach(baseForOwnRight, true);
        function baseEvery(collection, predicate) {
          var result2 = true;
          baseEach(collection, function(value, index, collection2) {
            result2 = !!predicate(value, index, collection2);
            return result2;
          });
          return result2;
        }
        function baseExtremum(array, iteratee2, comparator) {
          var index = -1, length = array.length;
          while (++index < length) {
            var value = array[index], current = iteratee2(value);
            if (current != null && (computed === undefined2 ? current === current && !isSymbol(current) : comparator(current, computed))) {
              var computed = current, result2 = value;
            }
          }
          return result2;
        }
        function baseFill(array, value, start, end) {
          var length = array.length;
          start = toInteger(start);
          if (start < 0) {
            start = -start > length ? 0 : length + start;
          }
          end = end === undefined2 || end > length ? length : toInteger(end);
          if (end < 0) {
            end += length;
          }
          end = start > end ? 0 : toLength(end);
          while (start < end) {
            array[start++] = value;
          }
          return array;
        }
        function baseFilter(collection, predicate) {
          var result2 = [];
          baseEach(collection, function(value, index, collection2) {
            if (predicate(value, index, collection2)) {
              result2.push(value);
            }
          });
          return result2;
        }
        function baseFlatten(array, depth, predicate, isStrict, result2) {
          var index = -1, length = array.length;
          predicate || (predicate = isFlattenable);
          result2 || (result2 = []);
          while (++index < length) {
            var value = array[index];
            if (depth > 0 && predicate(value)) {
              if (depth > 1) {
                baseFlatten(value, depth - 1, predicate, isStrict, result2);
              } else {
                arrayPush(result2, value);
              }
            } else if (!isStrict) {
              result2[result2.length] = value;
            }
          }
          return result2;
        }
        var baseFor = createBaseFor();
        var baseForRight = createBaseFor(true);
        function baseForOwn(object, iteratee2) {
          return object && baseFor(object, iteratee2, keys);
        }
        function baseForOwnRight(object, iteratee2) {
          return object && baseForRight(object, iteratee2, keys);
        }
        function baseFunctions(object, props) {
          return arrayFilter(props, function(key) {
            return isFunction(object[key]);
          });
        }
        function baseGet(object, path) {
          path = castPath(path, object);
          var index = 0, length = path.length;
          while (object != null && index < length) {
            object = object[toKey(path[index++])];
          }
          return index && index == length ? object : undefined2;
        }
        function baseGetAllKeys(object, keysFunc, symbolsFunc) {
          var result2 = keysFunc(object);
          return isArray(object) ? result2 : arrayPush(result2, symbolsFunc(object));
        }
        function baseGetTag(value) {
          if (value == null) {
            return value === undefined2 ? undefinedTag : nullTag;
          }
          return symToStringTag && symToStringTag in Object2(value) ? getRawTag(value) : objectToString(value);
        }
        function baseGt(value, other) {
          return value > other;
        }
        function baseHas(object, key) {
          return object != null && hasOwnProperty.call(object, key);
        }
        function baseHasIn(object, key) {
          return object != null && key in Object2(object);
        }
        function baseInRange(number, start, end) {
          return number >= nativeMin(start, end) && number < nativeMax(start, end);
        }
        function baseIntersection(arrays, iteratee2, comparator) {
          var includes2 = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array2(othLength), maxLength = Infinity, result2 = [];
          while (othIndex--) {
            var array = arrays[othIndex];
            if (othIndex && iteratee2) {
              array = arrayMap(array, baseUnary(iteratee2));
            }
            maxLength = nativeMin(array.length, maxLength);
            caches[othIndex] = !comparator && (iteratee2 || length >= 120 && array.length >= 120) ? new SetCache(othIndex && array) : undefined2;
          }
          array = arrays[0];
          var index = -1, seen = caches[0];
          outer:
            while (++index < length && result2.length < maxLength) {
              var value = array[index], computed = iteratee2 ? iteratee2(value) : value;
              value = comparator || value !== 0 ? value : 0;
              if (!(seen ? cacheHas(seen, computed) : includes2(result2, computed, comparator))) {
                othIndex = othLength;
                while (--othIndex) {
                  var cache = caches[othIndex];
                  if (!(cache ? cacheHas(cache, computed) : includes2(arrays[othIndex], computed, comparator))) {
                    continue outer;
                  }
                }
                if (seen) {
                  seen.push(computed);
                }
                result2.push(value);
              }
            }
          return result2;
        }
        function baseInverter(object, setter, iteratee2, accumulator) {
          baseForOwn(object, function(value, key, object2) {
            setter(accumulator, iteratee2(value), key, object2);
          });
          return accumulator;
        }
        function baseInvoke(object, path, args) {
          path = castPath(path, object);
          object = parent(object, path);
          var func = object == null ? object : object[toKey(last(path))];
          return func == null ? undefined2 : apply(func, object, args);
        }
        function baseIsArguments(value) {
          return isObjectLike(value) && baseGetTag(value) == argsTag;
        }
        function baseIsArrayBuffer(value) {
          return isObjectLike(value) && baseGetTag(value) == arrayBufferTag;
        }
        function baseIsDate(value) {
          return isObjectLike(value) && baseGetTag(value) == dateTag;
        }
        function baseIsEqual(value, other, bitmask, customizer, stack) {
          if (value === other) {
            return true;
          }
          if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
            return value !== value && other !== other;
          }
          return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
        }
        function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
          var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
          objTag = objTag == argsTag ? objectTag : objTag;
          othTag = othTag == argsTag ? objectTag : othTag;
          var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
          if (isSameTag && isBuffer(object)) {
            if (!isBuffer(other)) {
              return false;
            }
            objIsArr = true;
            objIsObj = false;
          }
          if (isSameTag && !objIsObj) {
            stack || (stack = new Stack());
            return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
          }
          if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
            var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
            if (objIsWrapped || othIsWrapped) {
              var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
              stack || (stack = new Stack());
              return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
            }
          }
          if (!isSameTag) {
            return false;
          }
          stack || (stack = new Stack());
          return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
        }
        function baseIsMap(value) {
          return isObjectLike(value) && getTag(value) == mapTag;
        }
        function baseIsMatch(object, source, matchData, customizer) {
          var index = matchData.length, length = index, noCustomizer = !customizer;
          if (object == null) {
            return !length;
          }
          object = Object2(object);
          while (index--) {
            var data = matchData[index];
            if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
              return false;
            }
          }
          while (++index < length) {
            data = matchData[index];
            var key = data[0], objValue = object[key], srcValue = data[1];
            if (noCustomizer && data[2]) {
              if (objValue === undefined2 && !(key in object)) {
                return false;
              }
            } else {
              var stack = new Stack();
              if (customizer) {
                var result2 = customizer(objValue, srcValue, key, object, source, stack);
              }
              if (!(result2 === undefined2 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result2)) {
                return false;
              }
            }
          }
          return true;
        }
        function baseIsNative(value) {
          if (!isObject(value) || isMasked(value)) {
            return false;
          }
          var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
          return pattern.test(toSource(value));
        }
        function baseIsRegExp(value) {
          return isObjectLike(value) && baseGetTag(value) == regexpTag;
        }
        function baseIsSet(value) {
          return isObjectLike(value) && getTag(value) == setTag;
        }
        function baseIsTypedArray(value) {
          return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
        }
        function baseIteratee(value) {
          if (typeof value == "function") {
            return value;
          }
          if (value == null) {
            return identity;
          }
          if (typeof value == "object") {
            return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
          }
          return property(value);
        }
        function baseKeys(object) {
          if (!isPrototype(object)) {
            return nativeKeys(object);
          }
          var result2 = [];
          for (var key in Object2(object)) {
            if (hasOwnProperty.call(object, key) && key != "constructor") {
              result2.push(key);
            }
          }
          return result2;
        }
        function baseKeysIn(object) {
          if (!isObject(object)) {
            return nativeKeysIn(object);
          }
          var isProto = isPrototype(object), result2 = [];
          for (var key in object) {
            if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
              result2.push(key);
            }
          }
          return result2;
        }
        function baseLt(value, other) {
          return value < other;
        }
        function baseMap(collection, iteratee2) {
          var index = -1, result2 = isArrayLike(collection) ? Array2(collection.length) : [];
          baseEach(collection, function(value, key, collection2) {
            result2[++index] = iteratee2(value, key, collection2);
          });
          return result2;
        }
        function baseMatches(source) {
          var matchData = getMatchData(source);
          if (matchData.length == 1 && matchData[0][2]) {
            return matchesStrictComparable(matchData[0][0], matchData[0][1]);
          }
          return function(object) {
            return object === source || baseIsMatch(object, source, matchData);
          };
        }
        function baseMatchesProperty(path, srcValue) {
          if (isKey(path) && isStrictComparable(srcValue)) {
            return matchesStrictComparable(toKey(path), srcValue);
          }
          return function(object) {
            var objValue = get(object, path);
            return objValue === undefined2 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
          };
        }
        function baseMerge(object, source, srcIndex, customizer, stack) {
          if (object === source) {
            return;
          }
          baseFor(source, function(srcValue, key) {
            stack || (stack = new Stack());
            if (isObject(srcValue)) {
              baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
            } else {
              var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : undefined2;
              if (newValue === undefined2) {
                newValue = srcValue;
              }
              assignMergeValue(object, key, newValue);
            }
          }, keysIn);
        }
        function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
          var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
          if (stacked) {
            assignMergeValue(object, key, stacked);
            return;
          }
          var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : undefined2;
          var isCommon = newValue === undefined2;
          if (isCommon) {
            var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
            newValue = srcValue;
            if (isArr || isBuff || isTyped) {
              if (isArray(objValue)) {
                newValue = objValue;
              } else if (isArrayLikeObject(objValue)) {
                newValue = copyArray(objValue);
              } else if (isBuff) {
                isCommon = false;
                newValue = cloneBuffer(srcValue, true);
              } else if (isTyped) {
                isCommon = false;
                newValue = cloneTypedArray(srcValue, true);
              } else {
                newValue = [];
              }
            } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
              newValue = objValue;
              if (isArguments(objValue)) {
                newValue = toPlainObject(objValue);
              } else if (!isObject(objValue) || isFunction(objValue)) {
                newValue = initCloneObject(srcValue);
              }
            } else {
              isCommon = false;
            }
          }
          if (isCommon) {
            stack.set(srcValue, newValue);
            mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
            stack["delete"](srcValue);
          }
          assignMergeValue(object, key, newValue);
        }
        function baseNth(array, n2) {
          var length = array.length;
          if (!length) {
            return;
          }
          n2 += n2 < 0 ? length : 0;
          return isIndex(n2, length) ? array[n2] : undefined2;
        }
        function baseOrderBy(collection, iteratees, orders) {
          if (iteratees.length) {
            iteratees = arrayMap(iteratees, function(iteratee2) {
              if (isArray(iteratee2)) {
                return function(value) {
                  return baseGet(value, iteratee2.length === 1 ? iteratee2[0] : iteratee2);
                };
              }
              return iteratee2;
            });
          } else {
            iteratees = [identity];
          }
          var index = -1;
          iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
          var result2 = baseMap(collection, function(value, key, collection2) {
            var criteria = arrayMap(iteratees, function(iteratee2) {
              return iteratee2(value);
            });
            return { "criteria": criteria, "index": ++index, "value": value };
          });
          return baseSortBy(result2, function(object, other) {
            return compareMultiple(object, other, orders);
          });
        }
        function basePick(object, paths) {
          return basePickBy(object, paths, function(value, path) {
            return hasIn(object, path);
          });
        }
        function basePickBy(object, paths, predicate) {
          var index = -1, length = paths.length, result2 = {};
          while (++index < length) {
            var path = paths[index], value = baseGet(object, path);
            if (predicate(value, path)) {
              baseSet(result2, castPath(path, object), value);
            }
          }
          return result2;
        }
        function basePropertyDeep(path) {
          return function(object) {
            return baseGet(object, path);
          };
        }
        function basePullAll(array, values2, iteratee2, comparator) {
          var indexOf2 = comparator ? baseIndexOfWith : baseIndexOf, index = -1, length = values2.length, seen = array;
          if (array === values2) {
            values2 = copyArray(values2);
          }
          if (iteratee2) {
            seen = arrayMap(array, baseUnary(iteratee2));
          }
          while (++index < length) {
            var fromIndex = 0, value = values2[index], computed = iteratee2 ? iteratee2(value) : value;
            while ((fromIndex = indexOf2(seen, computed, fromIndex, comparator)) > -1) {
              if (seen !== array) {
                splice.call(seen, fromIndex, 1);
              }
              splice.call(array, fromIndex, 1);
            }
          }
          return array;
        }
        function basePullAt(array, indexes) {
          var length = array ? indexes.length : 0, lastIndex = length - 1;
          while (length--) {
            var index = indexes[length];
            if (length == lastIndex || index !== previous) {
              var previous = index;
              if (isIndex(index)) {
                splice.call(array, index, 1);
              } else {
                baseUnset(array, index);
              }
            }
          }
          return array;
        }
        function baseRandom(lower, upper) {
          return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
        }
        function baseRange(start, end, step, fromRight) {
          var index = -1, length = nativeMax(nativeCeil((end - start) / (step || 1)), 0), result2 = Array2(length);
          while (length--) {
            result2[fromRight ? length : ++index] = start;
            start += step;
          }
          return result2;
        }
        function baseRepeat(string, n2) {
          var result2 = "";
          if (!string || n2 < 1 || n2 > MAX_SAFE_INTEGER) {
            return result2;
          }
          do {
            if (n2 % 2) {
              result2 += string;
            }
            n2 = nativeFloor(n2 / 2);
            if (n2) {
              string += string;
            }
          } while (n2);
          return result2;
        }
        function baseRest(func, start) {
          return setToString(overRest(func, start, identity), func + "");
        }
        function baseSample(collection) {
          return arraySample(values(collection));
        }
        function baseSampleSize(collection, n2) {
          var array = values(collection);
          return shuffleSelf(array, baseClamp(n2, 0, array.length));
        }
        function baseSet(object, path, value, customizer) {
          if (!isObject(object)) {
            return object;
          }
          path = castPath(path, object);
          var index = -1, length = path.length, lastIndex = length - 1, nested = object;
          while (nested != null && ++index < length) {
            var key = toKey(path[index]), newValue = value;
            if (key === "__proto__" || key === "constructor" || key === "prototype") {
              return object;
            }
            if (index != lastIndex) {
              var objValue = nested[key];
              newValue = customizer ? customizer(objValue, key, nested) : undefined2;
              if (newValue === undefined2) {
                newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
              }
            }
            assignValue(nested, key, newValue);
            nested = nested[key];
          }
          return object;
        }
        var baseSetData = !metaMap ? identity : function(func, data) {
          metaMap.set(func, data);
          return func;
        };
        var baseSetToString = !defineProperty ? identity : function(func, string) {
          return defineProperty(func, "toString", {
            "configurable": true,
            "enumerable": false,
            "value": constant(string),
            "writable": true
          });
        };
        function baseShuffle(collection) {
          return shuffleSelf(values(collection));
        }
        function baseSlice(array, start, end) {
          var index = -1, length = array.length;
          if (start < 0) {
            start = -start > length ? 0 : length + start;
          }
          end = end > length ? length : end;
          if (end < 0) {
            end += length;
          }
          length = start > end ? 0 : end - start >>> 0;
          start >>>= 0;
          var result2 = Array2(length);
          while (++index < length) {
            result2[index] = array[index + start];
          }
          return result2;
        }
        function baseSome(collection, predicate) {
          var result2;
          baseEach(collection, function(value, index, collection2) {
            result2 = predicate(value, index, collection2);
            return !result2;
          });
          return !!result2;
        }
        function baseSortedIndex(array, value, retHighest) {
          var low = 0, high = array == null ? low : array.length;
          if (typeof value == "number" && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
            while (low < high) {
              var mid = low + high >>> 1, computed = array[mid];
              if (computed !== null && !isSymbol(computed) && (retHighest ? computed <= value : computed < value)) {
                low = mid + 1;
              } else {
                high = mid;
              }
            }
            return high;
          }
          return baseSortedIndexBy(array, value, identity, retHighest);
        }
        function baseSortedIndexBy(array, value, iteratee2, retHighest) {
          var low = 0, high = array == null ? 0 : array.length;
          if (high === 0) {
            return 0;
          }
          value = iteratee2(value);
          var valIsNaN = value !== value, valIsNull = value === null, valIsSymbol = isSymbol(value), valIsUndefined = value === undefined2;
          while (low < high) {
            var mid = nativeFloor((low + high) / 2), computed = iteratee2(array[mid]), othIsDefined = computed !== undefined2, othIsNull = computed === null, othIsReflexive = computed === computed, othIsSymbol = isSymbol(computed);
            if (valIsNaN) {
              var setLow = retHighest || othIsReflexive;
            } else if (valIsUndefined) {
              setLow = othIsReflexive && (retHighest || othIsDefined);
            } else if (valIsNull) {
              setLow = othIsReflexive && othIsDefined && (retHighest || !othIsNull);
            } else if (valIsSymbol) {
              setLow = othIsReflexive && othIsDefined && !othIsNull && (retHighest || !othIsSymbol);
            } else if (othIsNull || othIsSymbol) {
              setLow = false;
            } else {
              setLow = retHighest ? computed <= value : computed < value;
            }
            if (setLow) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return nativeMin(high, MAX_ARRAY_INDEX);
        }
        function baseSortedUniq(array, iteratee2) {
          var index = -1, length = array.length, resIndex = 0, result2 = [];
          while (++index < length) {
            var value = array[index], computed = iteratee2 ? iteratee2(value) : value;
            if (!index || !eq(computed, seen)) {
              var seen = computed;
              result2[resIndex++] = value === 0 ? 0 : value;
            }
          }
          return result2;
        }
        function baseToNumber(value) {
          if (typeof value == "number") {
            return value;
          }
          if (isSymbol(value)) {
            return NAN;
          }
          return +value;
        }
        function baseToString(value) {
          if (typeof value == "string") {
            return value;
          }
          if (isArray(value)) {
            return arrayMap(value, baseToString) + "";
          }
          if (isSymbol(value)) {
            return symbolToString ? symbolToString.call(value) : "";
          }
          var result2 = value + "";
          return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
        }
        function baseUniq(array, iteratee2, comparator) {
          var index = -1, includes2 = arrayIncludes, length = array.length, isCommon = true, result2 = [], seen = result2;
          if (comparator) {
            isCommon = false;
            includes2 = arrayIncludesWith;
          } else if (length >= LARGE_ARRAY_SIZE) {
            var set2 = iteratee2 ? null : createSet(array);
            if (set2) {
              return setToArray(set2);
            }
            isCommon = false;
            includes2 = cacheHas;
            seen = new SetCache();
          } else {
            seen = iteratee2 ? [] : result2;
          }
          outer:
            while (++index < length) {
              var value = array[index], computed = iteratee2 ? iteratee2(value) : value;
              value = comparator || value !== 0 ? value : 0;
              if (isCommon && computed === computed) {
                var seenIndex = seen.length;
                while (seenIndex--) {
                  if (seen[seenIndex] === computed) {
                    continue outer;
                  }
                }
                if (iteratee2) {
                  seen.push(computed);
                }
                result2.push(value);
              } else if (!includes2(seen, computed, comparator)) {
                if (seen !== result2) {
                  seen.push(computed);
                }
                result2.push(value);
              }
            }
          return result2;
        }
        function baseUnset(object, path) {
          path = castPath(path, object);
          var index = -1, length = path.length;
          if (!length) {
            return true;
          }
          while (++index < length) {
            var key = toKey(path[index]);
            if (key === "__proto__" && !hasOwnProperty.call(object, "__proto__")) {
              return false;
            }
            if ((key === "constructor" || key === "prototype") && index < length - 1) {
              return false;
            }
          }
          var obj = parent(object, path);
          return obj == null || delete obj[toKey(last(path))];
        }
        function baseUpdate(object, path, updater, customizer) {
          return baseSet(object, path, updater(baseGet(object, path)), customizer);
        }
        function baseWhile(array, predicate, isDrop, fromRight) {
          var length = array.length, index = fromRight ? length : -1;
          while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {
          }
          return isDrop ? baseSlice(array, fromRight ? 0 : index, fromRight ? index + 1 : length) : baseSlice(array, fromRight ? index + 1 : 0, fromRight ? length : index);
        }
        function baseWrapperValue(value, actions) {
          var result2 = value;
          if (result2 instanceof LazyWrapper) {
            result2 = result2.value();
          }
          return arrayReduce(actions, function(result3, action) {
            return action.func.apply(action.thisArg, arrayPush([result3], action.args));
          }, result2);
        }
        function baseXor(arrays, iteratee2, comparator) {
          var length = arrays.length;
          if (length < 2) {
            return length ? baseUniq(arrays[0]) : [];
          }
          var index = -1, result2 = Array2(length);
          while (++index < length) {
            var array = arrays[index], othIndex = -1;
            while (++othIndex < length) {
              if (othIndex != index) {
                result2[index] = baseDifference(result2[index] || array, arrays[othIndex], iteratee2, comparator);
              }
            }
          }
          return baseUniq(baseFlatten(result2, 1), iteratee2, comparator);
        }
        function baseZipObject(props, values2, assignFunc) {
          var index = -1, length = props.length, valsLength = values2.length, result2 = {};
          while (++index < length) {
            var value = index < valsLength ? values2[index] : undefined2;
            assignFunc(result2, props[index], value);
          }
          return result2;
        }
        function castArrayLikeObject(value) {
          return isArrayLikeObject(value) ? value : [];
        }
        function castFunction(value) {
          return typeof value == "function" ? value : identity;
        }
        function castPath(value, object) {
          if (isArray(value)) {
            return value;
          }
          return isKey(value, object) ? [value] : stringToPath(toString(value));
        }
        var castRest = baseRest;
        function castSlice(array, start, end) {
          var length = array.length;
          end = end === undefined2 ? length : end;
          return !start && end >= length ? array : baseSlice(array, start, end);
        }
        var clearTimeout = ctxClearTimeout || function(id) {
          return root.clearTimeout(id);
        };
        function cloneBuffer(buffer, isDeep) {
          if (isDeep) {
            return buffer.slice();
          }
          var length = buffer.length, result2 = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
          buffer.copy(result2);
          return result2;
        }
        function cloneArrayBuffer(arrayBuffer) {
          var result2 = new arrayBuffer.constructor(arrayBuffer.byteLength);
          new Uint8Array2(result2).set(new Uint8Array2(arrayBuffer));
          return result2;
        }
        function cloneDataView(dataView, isDeep) {
          var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
          return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
        }
        function cloneRegExp(regexp) {
          var result2 = new regexp.constructor(regexp.source, reFlags.exec(regexp));
          result2.lastIndex = regexp.lastIndex;
          return result2;
        }
        function cloneSymbol(symbol) {
          return symbolValueOf ? Object2(symbolValueOf.call(symbol)) : {};
        }
        function cloneTypedArray(typedArray, isDeep) {
          var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
          return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
        }
        function compareAscending(value, other) {
          if (value !== other) {
            var valIsDefined = value !== undefined2, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
            var othIsDefined = other !== undefined2, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
            if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
              return 1;
            }
            if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
              return -1;
            }
          }
          return 0;
        }
        function compareMultiple(object, other, orders) {
          var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
          while (++index < length) {
            var result2 = compareAscending(objCriteria[index], othCriteria[index]);
            if (result2) {
              if (index >= ordersLength) {
                return result2;
              }
              var order = orders[index];
              return result2 * (order == "desc" ? -1 : 1);
            }
          }
          return object.index - other.index;
        }
        function composeArgs(args, partials, holders, isCurried) {
          var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(leftLength + rangeLength), isUncurried = !isCurried;
          while (++leftIndex < leftLength) {
            result2[leftIndex] = partials[leftIndex];
          }
          while (++argsIndex < holdersLength) {
            if (isUncurried || argsIndex < argsLength) {
              result2[holders[argsIndex]] = args[argsIndex];
            }
          }
          while (rangeLength--) {
            result2[leftIndex++] = args[argsIndex++];
          }
          return result2;
        }
        function composeArgsRight(args, partials, holders, isCurried) {
          var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result2 = Array2(rangeLength + rightLength), isUncurried = !isCurried;
          while (++argsIndex < rangeLength) {
            result2[argsIndex] = args[argsIndex];
          }
          var offset = argsIndex;
          while (++rightIndex < rightLength) {
            result2[offset + rightIndex] = partials[rightIndex];
          }
          while (++holdersIndex < holdersLength) {
            if (isUncurried || argsIndex < argsLength) {
              result2[offset + holders[holdersIndex]] = args[argsIndex++];
            }
          }
          return result2;
        }
        function copyArray(source, array) {
          var index = -1, length = source.length;
          array || (array = Array2(length));
          while (++index < length) {
            array[index] = source[index];
          }
          return array;
        }
        function copyObject(source, props, object, customizer) {
          var isNew = !object;
          object || (object = {});
          var index = -1, length = props.length;
          while (++index < length) {
            var key = props[index];
            var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined2;
            if (newValue === undefined2) {
              newValue = source[key];
            }
            if (isNew) {
              baseAssignValue(object, key, newValue);
            } else {
              assignValue(object, key, newValue);
            }
          }
          return object;
        }
        function copySymbols(source, object) {
          return copyObject(source, getSymbols(source), object);
        }
        function copySymbolsIn(source, object) {
          return copyObject(source, getSymbolsIn(source), object);
        }
        function createAggregator(setter, initializer) {
          return function(collection, iteratee2) {
            var func = isArray(collection) ? arrayAggregator : baseAggregator, accumulator = initializer ? initializer() : {};
            return func(collection, setter, getIteratee(iteratee2, 2), accumulator);
          };
        }
        function createAssigner(assigner) {
          return baseRest(function(object, sources) {
            var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined2, guard = length > 2 ? sources[2] : undefined2;
            customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : undefined2;
            if (guard && isIterateeCall(sources[0], sources[1], guard)) {
              customizer = length < 3 ? undefined2 : customizer;
              length = 1;
            }
            object = Object2(object);
            while (++index < length) {
              var source = sources[index];
              if (source) {
                assigner(object, source, index, customizer);
              }
            }
            return object;
          });
        }
        function createBaseEach(eachFunc, fromRight) {
          return function(collection, iteratee2) {
            if (collection == null) {
              return collection;
            }
            if (!isArrayLike(collection)) {
              return eachFunc(collection, iteratee2);
            }
            var length = collection.length, index = fromRight ? length : -1, iterable = Object2(collection);
            while (fromRight ? index-- : ++index < length) {
              if (iteratee2(iterable[index], index, iterable) === false) {
                break;
              }
            }
            return collection;
          };
        }
        function createBaseFor(fromRight) {
          return function(object, iteratee2, keysFunc) {
            var index = -1, iterable = Object2(object), props = keysFunc(object), length = props.length;
            while (length--) {
              var key = props[fromRight ? length : ++index];
              if (iteratee2(iterable[key], key, iterable) === false) {
                break;
              }
            }
            return object;
          };
        }
        function createBind(func, bitmask, thisArg) {
          var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
          function wrapper() {
            var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
            return fn.apply(isBind ? thisArg : this, arguments);
          }
          return wrapper;
        }
        function createCaseFirst(methodName) {
          return function(string) {
            string = toString(string);
            var strSymbols = hasUnicode(string) ? stringToArray(string) : undefined2;
            var chr = strSymbols ? strSymbols[0] : string.charAt(0);
            var trailing = strSymbols ? castSlice(strSymbols, 1).join("") : string.slice(1);
            return chr[methodName]() + trailing;
          };
        }
        function createCompounder(callback) {
          return function(string) {
            return arrayReduce(words(deburr(string).replace(reApos, "")), callback, "");
          };
        }
        function createCtor(Ctor) {
          return function() {
            var args = arguments;
            switch (args.length) {
              case 0:
                return new Ctor();
              case 1:
                return new Ctor(args[0]);
              case 2:
                return new Ctor(args[0], args[1]);
              case 3:
                return new Ctor(args[0], args[1], args[2]);
              case 4:
                return new Ctor(args[0], args[1], args[2], args[3]);
              case 5:
                return new Ctor(args[0], args[1], args[2], args[3], args[4]);
              case 6:
                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
              case 7:
                return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
            }
            var thisBinding = baseCreate(Ctor.prototype), result2 = Ctor.apply(thisBinding, args);
            return isObject(result2) ? result2 : thisBinding;
          };
        }
        function createCurry(func, bitmask, arity) {
          var Ctor = createCtor(func);
          function wrapper() {
            var length = arguments.length, args = Array2(length), index = length, placeholder = getHolder(wrapper);
            while (index--) {
              args[index] = arguments[index];
            }
            var holders = length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder ? [] : replaceHolders(args, placeholder);
            length -= holders.length;
            if (length < arity) {
              return createRecurry(
                func,
                bitmask,
                createHybrid,
                wrapper.placeholder,
                undefined2,
                args,
                holders,
                undefined2,
                undefined2,
                arity - length
              );
            }
            var fn = this && this !== root && this instanceof wrapper ? Ctor : func;
            return apply(fn, this, args);
          }
          return wrapper;
        }
        function createFind(findIndexFunc) {
          return function(collection, predicate, fromIndex) {
            var iterable = Object2(collection);
            if (!isArrayLike(collection)) {
              var iteratee2 = getIteratee(predicate, 3);
              collection = keys(collection);
              predicate = function(key) {
                return iteratee2(iterable[key], key, iterable);
              };
            }
            var index = findIndexFunc(collection, predicate, fromIndex);
            return index > -1 ? iterable[iteratee2 ? collection[index] : index] : undefined2;
          };
        }
        function createFlow(fromRight) {
          return flatRest(function(funcs) {
            var length = funcs.length, index = length, prereq = LodashWrapper.prototype.thru;
            if (fromRight) {
              funcs.reverse();
            }
            while (index--) {
              var func = funcs[index];
              if (typeof func != "function") {
                throw new TypeError2(FUNC_ERROR_TEXT);
              }
              if (prereq && !wrapper && getFuncName(func) == "wrapper") {
                var wrapper = new LodashWrapper([], true);
              }
            }
            index = wrapper ? index : length;
            while (++index < length) {
              func = funcs[index];
              var funcName = getFuncName(func), data = funcName == "wrapper" ? getData(func) : undefined2;
              if (data && isLaziable(data[0]) && data[1] == (WRAP_ARY_FLAG | WRAP_CURRY_FLAG | WRAP_PARTIAL_FLAG | WRAP_REARG_FLAG) && !data[4].length && data[9] == 1) {
                wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
              } else {
                wrapper = func.length == 1 && isLaziable(func) ? wrapper[funcName]() : wrapper.thru(func);
              }
            }
            return function() {
              var args = arguments, value = args[0];
              if (wrapper && args.length == 1 && isArray(value)) {
                return wrapper.plant(value).value();
              }
              var index2 = 0, result2 = length ? funcs[index2].apply(this, args) : value;
              while (++index2 < length) {
                result2 = funcs[index2].call(this, result2);
              }
              return result2;
            };
          });
        }
        function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary2, arity) {
          var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined2 : createCtor(func);
          function wrapper() {
            var length = arguments.length, args = Array2(length), index = length;
            while (index--) {
              args[index] = arguments[index];
            }
            if (isCurried) {
              var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
            }
            if (partials) {
              args = composeArgs(args, partials, holders, isCurried);
            }
            if (partialsRight) {
              args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
            }
            length -= holdersCount;
            if (isCurried && length < arity) {
              var newHolders = replaceHolders(args, placeholder);
              return createRecurry(
                func,
                bitmask,
                createHybrid,
                wrapper.placeholder,
                thisArg,
                args,
                newHolders,
                argPos,
                ary2,
                arity - length
              );
            }
            var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
            length = args.length;
            if (argPos) {
              args = reorder(args, argPos);
            } else if (isFlip && length > 1) {
              args.reverse();
            }
            if (isAry && ary2 < length) {
              args.length = ary2;
            }
            if (this && this !== root && this instanceof wrapper) {
              fn = Ctor || createCtor(fn);
            }
            return fn.apply(thisBinding, args);
          }
          return wrapper;
        }
        function createInverter(setter, toIteratee) {
          return function(object, iteratee2) {
            return baseInverter(object, setter, toIteratee(iteratee2), {});
          };
        }
        function createMathOperation(operator, defaultValue) {
          return function(value, other) {
            var result2;
            if (value === undefined2 && other === undefined2) {
              return defaultValue;
            }
            if (value !== undefined2) {
              result2 = value;
            }
            if (other !== undefined2) {
              if (result2 === undefined2) {
                return other;
              }
              if (typeof value == "string" || typeof other == "string") {
                value = baseToString(value);
                other = baseToString(other);
              } else {
                value = baseToNumber(value);
                other = baseToNumber(other);
              }
              result2 = operator(value, other);
            }
            return result2;
          };
        }
        function createOver(arrayFunc) {
          return flatRest(function(iteratees) {
            iteratees = arrayMap(iteratees, baseUnary(getIteratee()));
            return baseRest(function(args) {
              var thisArg = this;
              return arrayFunc(iteratees, function(iteratee2) {
                return apply(iteratee2, thisArg, args);
              });
            });
          });
        }
        function createPadding(length, chars) {
          chars = chars === undefined2 ? " " : baseToString(chars);
          var charsLength = chars.length;
          if (charsLength < 2) {
            return charsLength ? baseRepeat(chars, length) : chars;
          }
          var result2 = baseRepeat(chars, nativeCeil(length / stringSize(chars)));
          return hasUnicode(chars) ? castSlice(stringToArray(result2), 0, length).join("") : result2.slice(0, length);
        }
        function createPartial(func, bitmask, thisArg, partials) {
          var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
          function wrapper() {
            var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array2(leftLength + argsLength), fn = this && this !== root && this instanceof wrapper ? Ctor : func;
            while (++leftIndex < leftLength) {
              args[leftIndex] = partials[leftIndex];
            }
            while (argsLength--) {
              args[leftIndex++] = arguments[++argsIndex];
            }
            return apply(fn, isBind ? thisArg : this, args);
          }
          return wrapper;
        }
        function createRange(fromRight) {
          return function(start, end, step) {
            if (step && typeof step != "number" && isIterateeCall(start, end, step)) {
              end = step = undefined2;
            }
            start = toFinite(start);
            if (end === undefined2) {
              end = start;
              start = 0;
            } else {
              end = toFinite(end);
            }
            step = step === undefined2 ? start < end ? 1 : -1 : toFinite(step);
            return baseRange(start, end, step, fromRight);
          };
        }
        function createRelationalOperation(operator) {
          return function(value, other) {
            if (!(typeof value == "string" && typeof other == "string")) {
              value = toNumber(value);
              other = toNumber(other);
            }
            return operator(value, other);
          };
        }
        function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary2, arity) {
          var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined2, newHoldersRight = isCurry ? undefined2 : holders, newPartials = isCurry ? partials : undefined2, newPartialsRight = isCurry ? undefined2 : partials;
          bitmask |= isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG;
          bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
          if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
            bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
          }
          var newData = [
            func,
            bitmask,
            thisArg,
            newPartials,
            newHolders,
            newPartialsRight,
            newHoldersRight,
            argPos,
            ary2,
            arity
          ];
          var result2 = wrapFunc.apply(undefined2, newData);
          if (isLaziable(func)) {
            setData(result2, newData);
          }
          result2.placeholder = placeholder;
          return setWrapToString(result2, func, bitmask);
        }
        function createRound(methodName) {
          var func = Math2[methodName];
          return function(number, precision) {
            number = toNumber(number);
            precision = precision == null ? 0 : nativeMin(toInteger(precision), 292);
            if (precision && nativeIsFinite(number)) {
              var pair = (toString(number) + "e").split("e"), value = func(pair[0] + "e" + (+pair[1] + precision));
              pair = (toString(value) + "e").split("e");
              return +(pair[0] + "e" + (+pair[1] - precision));
            }
            return func(number);
          };
        }
        var createSet = !(Set2 && 1 / setToArray(new Set2([, -0]))[1] == INFINITY) ? noop : function(values2) {
          return new Set2(values2);
        };
        function createToPairs(keysFunc) {
          return function(object) {
            var tag = getTag(object);
            if (tag == mapTag) {
              return mapToArray(object);
            }
            if (tag == setTag) {
              return setToPairs(object);
            }
            return baseToPairs(object, keysFunc(object));
          };
        }
        function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary2, arity) {
          var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
          if (!isBindKey && typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          var length = partials ? partials.length : 0;
          if (!length) {
            bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
            partials = holders = undefined2;
          }
          ary2 = ary2 === undefined2 ? ary2 : nativeMax(toInteger(ary2), 0);
          arity = arity === undefined2 ? arity : toInteger(arity);
          length -= holders ? holders.length : 0;
          if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
            var partialsRight = partials, holdersRight = holders;
            partials = holders = undefined2;
          }
          var data = isBindKey ? undefined2 : getData(func);
          var newData = [
            func,
            bitmask,
            thisArg,
            partials,
            holders,
            partialsRight,
            holdersRight,
            argPos,
            ary2,
            arity
          ];
          if (data) {
            mergeData(newData, data);
          }
          func = newData[0];
          bitmask = newData[1];
          thisArg = newData[2];
          partials = newData[3];
          holders = newData[4];
          arity = newData[9] = newData[9] === undefined2 ? isBindKey ? 0 : func.length : nativeMax(newData[9] - length, 0);
          if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
            bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
          }
          if (!bitmask || bitmask == WRAP_BIND_FLAG) {
            var result2 = createBind(func, bitmask, thisArg);
          } else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
            result2 = createCurry(func, bitmask, arity);
          } else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
            result2 = createPartial(func, bitmask, thisArg, partials);
          } else {
            result2 = createHybrid.apply(undefined2, newData);
          }
          var setter = data ? baseSetData : setData;
          return setWrapToString(setter(result2, newData), func, bitmask);
        }
        function customDefaultsAssignIn(objValue, srcValue, key, object) {
          if (objValue === undefined2 || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
            return srcValue;
          }
          return objValue;
        }
        function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
          if (isObject(objValue) && isObject(srcValue)) {
            stack.set(srcValue, objValue);
            baseMerge(objValue, srcValue, undefined2, customDefaultsMerge, stack);
            stack["delete"](srcValue);
          }
          return objValue;
        }
        function customOmitClone(value) {
          return isPlainObject(value) ? undefined2 : value;
        }
        function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
          if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
            return false;
          }
          var arrStacked = stack.get(array);
          var othStacked = stack.get(other);
          if (arrStacked && othStacked) {
            return arrStacked == other && othStacked == array;
          }
          var index = -1, result2 = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined2;
          stack.set(array, other);
          stack.set(other, array);
          while (++index < arrLength) {
            var arrValue = array[index], othValue = other[index];
            if (customizer) {
              var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
            }
            if (compared !== undefined2) {
              if (compared) {
                continue;
              }
              result2 = false;
              break;
            }
            if (seen) {
              if (!arraySome(other, function(othValue2, othIndex) {
                if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
                result2 = false;
                break;
              }
            } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              result2 = false;
              break;
            }
          }
          stack["delete"](array);
          stack["delete"](other);
          return result2;
        }
        function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
          switch (tag) {
            case dataViewTag:
              if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
                return false;
              }
              object = object.buffer;
              other = other.buffer;
            case arrayBufferTag:
              if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
                return false;
              }
              return true;
            case boolTag:
            case dateTag:
            case numberTag:
              return eq(+object, +other);
            case errorTag:
              return object.name == other.name && object.message == other.message;
            case regexpTag:
            case stringTag:
              return object == other + "";
            case mapTag:
              var convert = mapToArray;
            case setTag:
              var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
              convert || (convert = setToArray);
              if (object.size != other.size && !isPartial) {
                return false;
              }
              var stacked = stack.get(object);
              if (stacked) {
                return stacked == other;
              }
              bitmask |= COMPARE_UNORDERED_FLAG;
              stack.set(object, other);
              var result2 = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
              stack["delete"](object);
              return result2;
            case symbolTag:
              if (symbolValueOf) {
                return symbolValueOf.call(object) == symbolValueOf.call(other);
              }
          }
          return false;
        }
        function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
          if (objLength != othLength && !isPartial) {
            return false;
          }
          var index = objLength;
          while (index--) {
            var key = objProps[index];
            if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
              return false;
            }
          }
          var objStacked = stack.get(object);
          var othStacked = stack.get(other);
          if (objStacked && othStacked) {
            return objStacked == other && othStacked == object;
          }
          var result2 = true;
          stack.set(object, other);
          stack.set(other, object);
          var skipCtor = isPartial;
          while (++index < objLength) {
            key = objProps[index];
            var objValue = object[key], othValue = other[key];
            if (customizer) {
              var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
            }
            if (!(compared === undefined2 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
              result2 = false;
              break;
            }
            skipCtor || (skipCtor = key == "constructor");
          }
          if (result2 && !skipCtor) {
            var objCtor = object.constructor, othCtor = other.constructor;
            if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
              result2 = false;
            }
          }
          stack["delete"](object);
          stack["delete"](other);
          return result2;
        }
        function flatRest(func) {
          return setToString(overRest(func, undefined2, flatten), func + "");
        }
        function getAllKeys(object) {
          return baseGetAllKeys(object, keys, getSymbols);
        }
        function getAllKeysIn(object) {
          return baseGetAllKeys(object, keysIn, getSymbolsIn);
        }
        var getData = !metaMap ? noop : function(func) {
          return metaMap.get(func);
        };
        function getFuncName(func) {
          var result2 = func.name + "", array = realNames[result2], length = hasOwnProperty.call(realNames, result2) ? array.length : 0;
          while (length--) {
            var data = array[length], otherFunc = data.func;
            if (otherFunc == null || otherFunc == func) {
              return data.name;
            }
          }
          return result2;
        }
        function getHolder(func) {
          var object = hasOwnProperty.call(lodash, "placeholder") ? lodash : func;
          return object.placeholder;
        }
        function getIteratee() {
          var result2 = lodash.iteratee || iteratee;
          result2 = result2 === iteratee ? baseIteratee : result2;
          return arguments.length ? result2(arguments[0], arguments[1]) : result2;
        }
        function getMapData(map2, key) {
          var data = map2.__data__;
          return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
        }
        function getMatchData(object) {
          var result2 = keys(object), length = result2.length;
          while (length--) {
            var key = result2[length], value = object[key];
            result2[length] = [key, value, isStrictComparable(value)];
          }
          return result2;
        }
        function getNative(object, key) {
          var value = getValue(object, key);
          return baseIsNative(value) ? value : undefined2;
        }
        function getRawTag(value) {
          var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
          try {
            value[symToStringTag] = undefined2;
            var unmasked = true;
          } catch (e2) {
          }
          var result2 = nativeObjectToString.call(value);
          if (unmasked) {
            if (isOwn) {
              value[symToStringTag] = tag;
            } else {
              delete value[symToStringTag];
            }
          }
          return result2;
        }
        var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
          if (object == null) {
            return [];
          }
          object = Object2(object);
          return arrayFilter(nativeGetSymbols(object), function(symbol) {
            return propertyIsEnumerable.call(object, symbol);
          });
        };
        var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
          var result2 = [];
          while (object) {
            arrayPush(result2, getSymbols(object));
            object = getPrototype(object);
          }
          return result2;
        };
        var getTag = baseGetTag;
        if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
          getTag = function(value) {
            var result2 = baseGetTag(value), Ctor = result2 == objectTag ? value.constructor : undefined2, ctorString = Ctor ? toSource(Ctor) : "";
            if (ctorString) {
              switch (ctorString) {
                case dataViewCtorString:
                  return dataViewTag;
                case mapCtorString:
                  return mapTag;
                case promiseCtorString:
                  return promiseTag;
                case setCtorString:
                  return setTag;
                case weakMapCtorString:
                  return weakMapTag;
              }
            }
            return result2;
          };
        }
        function getView(start, end, transforms) {
          var index = -1, length = transforms.length;
          while (++index < length) {
            var data = transforms[index], size2 = data.size;
            switch (data.type) {
              case "drop":
                start += size2;
                break;
              case "dropRight":
                end -= size2;
                break;
              case "take":
                end = nativeMin(end, start + size2);
                break;
              case "takeRight":
                start = nativeMax(start, end - size2);
                break;
            }
          }
          return { "start": start, "end": end };
        }
        function getWrapDetails(source) {
          var match = source.match(reWrapDetails);
          return match ? match[1].split(reSplitDetails) : [];
        }
        function hasPath(object, path, hasFunc) {
          path = castPath(path, object);
          var index = -1, length = path.length, result2 = false;
          while (++index < length) {
            var key = toKey(path[index]);
            if (!(result2 = object != null && hasFunc(object, key))) {
              break;
            }
            object = object[key];
          }
          if (result2 || ++index != length) {
            return result2;
          }
          length = object == null ? 0 : object.length;
          return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
        }
        function initCloneArray(array) {
          var length = array.length, result2 = new array.constructor(length);
          if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
            result2.index = array.index;
            result2.input = array.input;
          }
          return result2;
        }
        function initCloneObject(object) {
          return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
        }
        function initCloneByTag(object, tag, isDeep) {
          var Ctor = object.constructor;
          switch (tag) {
            case arrayBufferTag:
              return cloneArrayBuffer(object);
            case boolTag:
            case dateTag:
              return new Ctor(+object);
            case dataViewTag:
              return cloneDataView(object, isDeep);
            case float32Tag:
            case float64Tag:
            case int8Tag:
            case int16Tag:
            case int32Tag:
            case uint8Tag:
            case uint8ClampedTag:
            case uint16Tag:
            case uint32Tag:
              return cloneTypedArray(object, isDeep);
            case mapTag:
              return new Ctor();
            case numberTag:
            case stringTag:
              return new Ctor(object);
            case regexpTag:
              return cloneRegExp(object);
            case setTag:
              return new Ctor();
            case symbolTag:
              return cloneSymbol(object);
          }
        }
        function insertWrapDetails(source, details) {
          var length = details.length;
          if (!length) {
            return source;
          }
          var lastIndex = length - 1;
          details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
          details = details.join(length > 2 ? ", " : " ");
          return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
        }
        function isFlattenable(value) {
          return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
        }
        function isIndex(value, length) {
          var type = typeof value;
          length = length == null ? MAX_SAFE_INTEGER : length;
          return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
        }
        function isIterateeCall(value, index, object) {
          if (!isObject(object)) {
            return false;
          }
          var type = typeof index;
          if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
            return eq(object[index], value);
          }
          return false;
        }
        function isKey(value, object) {
          if (isArray(value)) {
            return false;
          }
          var type = typeof value;
          if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
            return true;
          }
          return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object2(object);
        }
        function isKeyable(value) {
          var type = typeof value;
          return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
        }
        function isLaziable(func) {
          var funcName = getFuncName(func), other = lodash[funcName];
          if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
            return false;
          }
          if (func === other) {
            return true;
          }
          var data = getData(other);
          return !!data && func === data[0];
        }
        function isMasked(func) {
          return !!maskSrcKey && maskSrcKey in func;
        }
        var isMaskable = coreJsData ? isFunction : stubFalse;
        function isPrototype(value) {
          var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
          return value === proto;
        }
        function isStrictComparable(value) {
          return value === value && !isObject(value);
        }
        function matchesStrictComparable(key, srcValue) {
          return function(object) {
            if (object == null) {
              return false;
            }
            return object[key] === srcValue && (srcValue !== undefined2 || key in Object2(object));
          };
        }
        function memoizeCapped(func) {
          var result2 = memoize(func, function(key) {
            if (cache.size === MAX_MEMOIZE_SIZE) {
              cache.clear();
            }
            return key;
          });
          var cache = result2.cache;
          return result2;
        }
        function mergeData(data, source) {
          var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
          var isCombo = srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_CURRY_FLAG || srcBitmask == WRAP_ARY_FLAG && bitmask == WRAP_REARG_FLAG && data[7].length <= source[8] || srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG) && source[7].length <= source[8] && bitmask == WRAP_CURRY_FLAG;
          if (!(isCommon || isCombo)) {
            return data;
          }
          if (srcBitmask & WRAP_BIND_FLAG) {
            data[2] = source[2];
            newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
          }
          var value = source[3];
          if (value) {
            var partials = data[3];
            data[3] = partials ? composeArgs(partials, value, source[4]) : value;
            data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
          }
          value = source[5];
          if (value) {
            partials = data[5];
            data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
            data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
          }
          value = source[7];
          if (value) {
            data[7] = value;
          }
          if (srcBitmask & WRAP_ARY_FLAG) {
            data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
          }
          if (data[9] == null) {
            data[9] = source[9];
          }
          data[0] = source[0];
          data[1] = newBitmask;
          return data;
        }
        function nativeKeysIn(object) {
          var result2 = [];
          if (object != null) {
            for (var key in Object2(object)) {
              result2.push(key);
            }
          }
          return result2;
        }
        function objectToString(value) {
          return nativeObjectToString.call(value);
        }
        function overRest(func, start, transform2) {
          start = nativeMax(start === undefined2 ? func.length - 1 : start, 0);
          return function() {
            var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array2(length);
            while (++index < length) {
              array[index] = args[start + index];
            }
            index = -1;
            var otherArgs = Array2(start + 1);
            while (++index < start) {
              otherArgs[index] = args[index];
            }
            otherArgs[start] = transform2(array);
            return apply(func, this, otherArgs);
          };
        }
        function parent(object, path) {
          return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
        }
        function reorder(array, indexes) {
          var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
          while (length--) {
            var index = indexes[length];
            array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined2;
          }
          return array;
        }
        function safeGet(object, key) {
          if (key === "constructor" && typeof object[key] === "function") {
            return;
          }
          if (key == "__proto__") {
            return;
          }
          return object[key];
        }
        var setData = shortOut(baseSetData);
        var setTimeout = ctxSetTimeout || function(func, wait) {
          return root.setTimeout(func, wait);
        };
        var setToString = shortOut(baseSetToString);
        function setWrapToString(wrapper, reference, bitmask) {
          var source = reference + "";
          return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
        }
        function shortOut(func) {
          var count = 0, lastCalled = 0;
          return function() {
            var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
            lastCalled = stamp;
            if (remaining > 0) {
              if (++count >= HOT_COUNT) {
                return arguments[0];
              }
            } else {
              count = 0;
            }
            return func.apply(undefined2, arguments);
          };
        }
        function shuffleSelf(array, size2) {
          var index = -1, length = array.length, lastIndex = length - 1;
          size2 = size2 === undefined2 ? length : size2;
          while (++index < size2) {
            var rand = baseRandom(index, lastIndex), value = array[rand];
            array[rand] = array[index];
            array[index] = value;
          }
          array.length = size2;
          return array;
        }
        var stringToPath = memoizeCapped(function(string) {
          var result2 = [];
          if (string.charCodeAt(0) === 46) {
            result2.push("");
          }
          string.replace(rePropName, function(match, number, quote, subString) {
            result2.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
          });
          return result2;
        });
        function toKey(value) {
          if (typeof value == "string" || isSymbol(value)) {
            return value;
          }
          var result2 = value + "";
          return result2 == "0" && 1 / value == -INFINITY ? "-0" : result2;
        }
        function toSource(func) {
          if (func != null) {
            try {
              return funcToString.call(func);
            } catch (e2) {
            }
            try {
              return func + "";
            } catch (e2) {
            }
          }
          return "";
        }
        function updateWrapDetails(details, bitmask) {
          arrayEach(wrapFlags, function(pair) {
            var value = "_." + pair[0];
            if (bitmask & pair[1] && !arrayIncludes(details, value)) {
              details.push(value);
            }
          });
          return details.sort();
        }
        function wrapperClone(wrapper) {
          if (wrapper instanceof LazyWrapper) {
            return wrapper.clone();
          }
          var result2 = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
          result2.__actions__ = copyArray(wrapper.__actions__);
          result2.__index__ = wrapper.__index__;
          result2.__values__ = wrapper.__values__;
          return result2;
        }
        function chunk(array, size2, guard) {
          if (guard ? isIterateeCall(array, size2, guard) : size2 === undefined2) {
            size2 = 1;
          } else {
            size2 = nativeMax(toInteger(size2), 0);
          }
          var length = array == null ? 0 : array.length;
          if (!length || size2 < 1) {
            return [];
          }
          var index = 0, resIndex = 0, result2 = Array2(nativeCeil(length / size2));
          while (index < length) {
            result2[resIndex++] = baseSlice(array, index, index += size2);
          }
          return result2;
        }
        function compact(array) {
          var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result2 = [];
          while (++index < length) {
            var value = array[index];
            if (value) {
              result2[resIndex++] = value;
            }
          }
          return result2;
        }
        function concat() {
          var length = arguments.length;
          if (!length) {
            return [];
          }
          var args = Array2(length - 1), array = arguments[0], index = length;
          while (index--) {
            args[index - 1] = arguments[index];
          }
          return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
        }
        var difference = baseRest(function(array, values2) {
          return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true)) : [];
        });
        var differenceBy = baseRest(function(array, values2) {
          var iteratee2 = last(values2);
          if (isArrayLikeObject(iteratee2)) {
            iteratee2 = undefined2;
          }
          return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2)) : [];
        });
        var differenceWith = baseRest(function(array, values2) {
          var comparator = last(values2);
          if (isArrayLikeObject(comparator)) {
            comparator = undefined2;
          }
          return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values2, 1, isArrayLikeObject, true), undefined2, comparator) : [];
        });
        function drop(array, n2, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n2 = guard || n2 === undefined2 ? 1 : toInteger(n2);
          return baseSlice(array, n2 < 0 ? 0 : n2, length);
        }
        function dropRight(array, n2, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n2 = guard || n2 === undefined2 ? 1 : toInteger(n2);
          n2 = length - n2;
          return baseSlice(array, 0, n2 < 0 ? 0 : n2);
        }
        function dropRightWhile(array, predicate) {
          return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true, true) : [];
        }
        function dropWhile(array, predicate) {
          return array && array.length ? baseWhile(array, getIteratee(predicate, 3), true) : [];
        }
        function fill(array, value, start, end) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          if (start && typeof start != "number" && isIterateeCall(array, value, start)) {
            start = 0;
            end = length;
          }
          return baseFill(array, value, start, end);
        }
        function findIndex(array, predicate, fromIndex) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return -1;
          }
          var index = fromIndex == null ? 0 : toInteger(fromIndex);
          if (index < 0) {
            index = nativeMax(length + index, 0);
          }
          return baseFindIndex(array, getIteratee(predicate, 3), index);
        }
        function findLastIndex(array, predicate, fromIndex) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return -1;
          }
          var index = length - 1;
          if (fromIndex !== undefined2) {
            index = toInteger(fromIndex);
            index = fromIndex < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
          }
          return baseFindIndex(array, getIteratee(predicate, 3), index, true);
        }
        function flatten(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseFlatten(array, 1) : [];
        }
        function flattenDeep(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseFlatten(array, INFINITY) : [];
        }
        function flattenDepth(array, depth) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          depth = depth === undefined2 ? 1 : toInteger(depth);
          return baseFlatten(array, depth);
        }
        function fromPairs(pairs) {
          var index = -1, length = pairs == null ? 0 : pairs.length, result2 = {};
          while (++index < length) {
            var pair = pairs[index];
            baseAssignValue(result2, pair[0], pair[1]);
          }
          return result2;
        }
        function head(array) {
          return array && array.length ? array[0] : undefined2;
        }
        function indexOf(array, value, fromIndex) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return -1;
          }
          var index = fromIndex == null ? 0 : toInteger(fromIndex);
          if (index < 0) {
            index = nativeMax(length + index, 0);
          }
          return baseIndexOf(array, value, index);
        }
        function initial(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseSlice(array, 0, -1) : [];
        }
        var intersection = baseRest(function(arrays) {
          var mapped = arrayMap(arrays, castArrayLikeObject);
          return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped) : [];
        });
        var intersectionBy = baseRest(function(arrays) {
          var iteratee2 = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
          if (iteratee2 === last(mapped)) {
            iteratee2 = undefined2;
          } else {
            mapped.pop();
          }
          return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, getIteratee(iteratee2, 2)) : [];
        });
        var intersectionWith = baseRest(function(arrays) {
          var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
          comparator = typeof comparator == "function" ? comparator : undefined2;
          if (comparator) {
            mapped.pop();
          }
          return mapped.length && mapped[0] === arrays[0] ? baseIntersection(mapped, undefined2, comparator) : [];
        });
        function join(array, separator) {
          return array == null ? "" : nativeJoin.call(array, separator);
        }
        function last(array) {
          var length = array == null ? 0 : array.length;
          return length ? array[length - 1] : undefined2;
        }
        function lastIndexOf(array, value, fromIndex) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return -1;
          }
          var index = length;
          if (fromIndex !== undefined2) {
            index = toInteger(fromIndex);
            index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
          }
          return value === value ? strictLastIndexOf(array, value, index) : baseFindIndex(array, baseIsNaN, index, true);
        }
        function nth(array, n2) {
          return array && array.length ? baseNth(array, toInteger(n2)) : undefined2;
        }
        var pull = baseRest(pullAll);
        function pullAll(array, values2) {
          return array && array.length && values2 && values2.length ? basePullAll(array, values2) : array;
        }
        function pullAllBy(array, values2, iteratee2) {
          return array && array.length && values2 && values2.length ? basePullAll(array, values2, getIteratee(iteratee2, 2)) : array;
        }
        function pullAllWith(array, values2, comparator) {
          return array && array.length && values2 && values2.length ? basePullAll(array, values2, undefined2, comparator) : array;
        }
        var pullAt = flatRest(function(array, indexes) {
          var length = array == null ? 0 : array.length, result2 = baseAt(array, indexes);
          basePullAt(array, arrayMap(indexes, function(index) {
            return isIndex(index, length) ? +index : index;
          }).sort(compareAscending));
          return result2;
        });
        function remove(array, predicate) {
          var result2 = [];
          if (!(array && array.length)) {
            return result2;
          }
          var index = -1, indexes = [], length = array.length;
          predicate = getIteratee(predicate, 3);
          while (++index < length) {
            var value = array[index];
            if (predicate(value, index, array)) {
              result2.push(value);
              indexes.push(index);
            }
          }
          basePullAt(array, indexes);
          return result2;
        }
        function reverse(array) {
          return array == null ? array : nativeReverse.call(array);
        }
        function slice(array, start, end) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          if (end && typeof end != "number" && isIterateeCall(array, start, end)) {
            start = 0;
            end = length;
          } else {
            start = start == null ? 0 : toInteger(start);
            end = end === undefined2 ? length : toInteger(end);
          }
          return baseSlice(array, start, end);
        }
        function sortedIndex(array, value) {
          return baseSortedIndex(array, value);
        }
        function sortedIndexBy(array, value, iteratee2) {
          return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2));
        }
        function sortedIndexOf(array, value) {
          var length = array == null ? 0 : array.length;
          if (length) {
            var index = baseSortedIndex(array, value);
            if (index < length && eq(array[index], value)) {
              return index;
            }
          }
          return -1;
        }
        function sortedLastIndex(array, value) {
          return baseSortedIndex(array, value, true);
        }
        function sortedLastIndexBy(array, value, iteratee2) {
          return baseSortedIndexBy(array, value, getIteratee(iteratee2, 2), true);
        }
        function sortedLastIndexOf(array, value) {
          var length = array == null ? 0 : array.length;
          if (length) {
            var index = baseSortedIndex(array, value, true) - 1;
            if (eq(array[index], value)) {
              return index;
            }
          }
          return -1;
        }
        function sortedUniq(array) {
          return array && array.length ? baseSortedUniq(array) : [];
        }
        function sortedUniqBy(array, iteratee2) {
          return array && array.length ? baseSortedUniq(array, getIteratee(iteratee2, 2)) : [];
        }
        function tail(array) {
          var length = array == null ? 0 : array.length;
          return length ? baseSlice(array, 1, length) : [];
        }
        function take(array, n2, guard) {
          if (!(array && array.length)) {
            return [];
          }
          n2 = guard || n2 === undefined2 ? 1 : toInteger(n2);
          return baseSlice(array, 0, n2 < 0 ? 0 : n2);
        }
        function takeRight(array, n2, guard) {
          var length = array == null ? 0 : array.length;
          if (!length) {
            return [];
          }
          n2 = guard || n2 === undefined2 ? 1 : toInteger(n2);
          n2 = length - n2;
          return baseSlice(array, n2 < 0 ? 0 : n2, length);
        }
        function takeRightWhile(array, predicate) {
          return array && array.length ? baseWhile(array, getIteratee(predicate, 3), false, true) : [];
        }
        function takeWhile(array, predicate) {
          return array && array.length ? baseWhile(array, getIteratee(predicate, 3)) : [];
        }
        var union = baseRest(function(arrays) {
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
        });
        var unionBy = baseRest(function(arrays) {
          var iteratee2 = last(arrays);
          if (isArrayLikeObject(iteratee2)) {
            iteratee2 = undefined2;
          }
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee2, 2));
        });
        var unionWith = baseRest(function(arrays) {
          var comparator = last(arrays);
          comparator = typeof comparator == "function" ? comparator : undefined2;
          return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined2, comparator);
        });
        function uniq(array) {
          return array && array.length ? baseUniq(array) : [];
        }
        function uniqBy(array, iteratee2) {
          return array && array.length ? baseUniq(array, getIteratee(iteratee2, 2)) : [];
        }
        function uniqWith(array, comparator) {
          comparator = typeof comparator == "function" ? comparator : undefined2;
          return array && array.length ? baseUniq(array, undefined2, comparator) : [];
        }
        function unzip(array) {
          if (!(array && array.length)) {
            return [];
          }
          var length = 0;
          array = arrayFilter(array, function(group) {
            if (isArrayLikeObject(group)) {
              length = nativeMax(group.length, length);
              return true;
            }
          });
          return baseTimes(length, function(index) {
            return arrayMap(array, baseProperty(index));
          });
        }
        function unzipWith(array, iteratee2) {
          if (!(array && array.length)) {
            return [];
          }
          var result2 = unzip(array);
          if (iteratee2 == null) {
            return result2;
          }
          return arrayMap(result2, function(group) {
            return apply(iteratee2, undefined2, group);
          });
        }
        var without = baseRest(function(array, values2) {
          return isArrayLikeObject(array) ? baseDifference(array, values2) : [];
        });
        var xor = baseRest(function(arrays) {
          return baseXor(arrayFilter(arrays, isArrayLikeObject));
        });
        var xorBy = baseRest(function(arrays) {
          var iteratee2 = last(arrays);
          if (isArrayLikeObject(iteratee2)) {
            iteratee2 = undefined2;
          }
          return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee2, 2));
        });
        var xorWith = baseRest(function(arrays) {
          var comparator = last(arrays);
          comparator = typeof comparator == "function" ? comparator : undefined2;
          return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined2, comparator);
        });
        var zip = baseRest(unzip);
        function zipObject(props, values2) {
          return baseZipObject(props || [], values2 || [], assignValue);
        }
        function zipObjectDeep(props, values2) {
          return baseZipObject(props || [], values2 || [], baseSet);
        }
        var zipWith = baseRest(function(arrays) {
          var length = arrays.length, iteratee2 = length > 1 ? arrays[length - 1] : undefined2;
          iteratee2 = typeof iteratee2 == "function" ? (arrays.pop(), iteratee2) : undefined2;
          return unzipWith(arrays, iteratee2);
        });
        function chain(value) {
          var result2 = lodash(value);
          result2.__chain__ = true;
          return result2;
        }
        function tap(value, interceptor) {
          interceptor(value);
          return value;
        }
        function thru(value, interceptor) {
          return interceptor(value);
        }
        var wrapperAt = flatRest(function(paths) {
          var length = paths.length, start = length ? paths[0] : 0, value = this.__wrapped__, interceptor = function(object) {
            return baseAt(object, paths);
          };
          if (length > 1 || this.__actions__.length || !(value instanceof LazyWrapper) || !isIndex(start)) {
            return this.thru(interceptor);
          }
          value = value.slice(start, +start + (length ? 1 : 0));
          value.__actions__.push({
            "func": thru,
            "args": [interceptor],
            "thisArg": undefined2
          });
          return new LodashWrapper(value, this.__chain__).thru(function(array) {
            if (length && !array.length) {
              array.push(undefined2);
            }
            return array;
          });
        });
        function wrapperChain() {
          return chain(this);
        }
        function wrapperCommit() {
          return new LodashWrapper(this.value(), this.__chain__);
        }
        function wrapperNext() {
          if (this.__values__ === undefined2) {
            this.__values__ = toArray(this.value());
          }
          var done = this.__index__ >= this.__values__.length, value = done ? undefined2 : this.__values__[this.__index__++];
          return { "done": done, "value": value };
        }
        function wrapperToIterator() {
          return this;
        }
        function wrapperPlant(value) {
          var result2, parent2 = this;
          while (parent2 instanceof baseLodash) {
            var clone2 = wrapperClone(parent2);
            clone2.__index__ = 0;
            clone2.__values__ = undefined2;
            if (result2) {
              previous.__wrapped__ = clone2;
            } else {
              result2 = clone2;
            }
            var previous = clone2;
            parent2 = parent2.__wrapped__;
          }
          previous.__wrapped__ = value;
          return result2;
        }
        function wrapperReverse() {
          var value = this.__wrapped__;
          if (value instanceof LazyWrapper) {
            var wrapped = value;
            if (this.__actions__.length) {
              wrapped = new LazyWrapper(this);
            }
            wrapped = wrapped.reverse();
            wrapped.__actions__.push({
              "func": thru,
              "args": [reverse],
              "thisArg": undefined2
            });
            return new LodashWrapper(wrapped, this.__chain__);
          }
          return this.thru(reverse);
        }
        function wrapperValue() {
          return baseWrapperValue(this.__wrapped__, this.__actions__);
        }
        var countBy = createAggregator(function(result2, value, key) {
          if (hasOwnProperty.call(result2, key)) {
            ++result2[key];
          } else {
            baseAssignValue(result2, key, 1);
          }
        });
        function every(collection, predicate, guard) {
          var func = isArray(collection) ? arrayEvery : baseEvery;
          if (guard && isIterateeCall(collection, predicate, guard)) {
            predicate = undefined2;
          }
          return func(collection, getIteratee(predicate, 3));
        }
        function filter(collection, predicate) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          return func(collection, getIteratee(predicate, 3));
        }
        var find = createFind(findIndex);
        var findLast = createFind(findLastIndex);
        function flatMap(collection, iteratee2) {
          return baseFlatten(map(collection, iteratee2), 1);
        }
        function flatMapDeep(collection, iteratee2) {
          return baseFlatten(map(collection, iteratee2), INFINITY);
        }
        function flatMapDepth(collection, iteratee2, depth) {
          depth = depth === undefined2 ? 1 : toInteger(depth);
          return baseFlatten(map(collection, iteratee2), depth);
        }
        function forEach(collection, iteratee2) {
          var func = isArray(collection) ? arrayEach : baseEach;
          return func(collection, getIteratee(iteratee2, 3));
        }
        function forEachRight(collection, iteratee2) {
          var func = isArray(collection) ? arrayEachRight : baseEachRight;
          return func(collection, getIteratee(iteratee2, 3));
        }
        var groupBy = createAggregator(function(result2, value, key) {
          if (hasOwnProperty.call(result2, key)) {
            result2[key].push(value);
          } else {
            baseAssignValue(result2, key, [value]);
          }
        });
        function includes(collection, value, fromIndex, guard) {
          collection = isArrayLike(collection) ? collection : values(collection);
          fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
          var length = collection.length;
          if (fromIndex < 0) {
            fromIndex = nativeMax(length + fromIndex, 0);
          }
          return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
        }
        var invokeMap = baseRest(function(collection, path, args) {
          var index = -1, isFunc = typeof path == "function", result2 = isArrayLike(collection) ? Array2(collection.length) : [];
          baseEach(collection, function(value) {
            result2[++index] = isFunc ? apply(path, value, args) : baseInvoke(value, path, args);
          });
          return result2;
        });
        var keyBy = createAggregator(function(result2, value, key) {
          baseAssignValue(result2, key, value);
        });
        function map(collection, iteratee2) {
          var func = isArray(collection) ? arrayMap : baseMap;
          return func(collection, getIteratee(iteratee2, 3));
        }
        function orderBy(collection, iteratees, orders, guard) {
          if (collection == null) {
            return [];
          }
          if (!isArray(iteratees)) {
            iteratees = iteratees == null ? [] : [iteratees];
          }
          orders = guard ? undefined2 : orders;
          if (!isArray(orders)) {
            orders = orders == null ? [] : [orders];
          }
          return baseOrderBy(collection, iteratees, orders);
        }
        var partition = createAggregator(function(result2, value, key) {
          result2[key ? 0 : 1].push(value);
        }, function() {
          return [[], []];
        });
        function reduce(collection, iteratee2, accumulator) {
          var func = isArray(collection) ? arrayReduce : baseReduce, initAccum = arguments.length < 3;
          return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEach);
        }
        function reduceRight(collection, iteratee2, accumulator) {
          var func = isArray(collection) ? arrayReduceRight : baseReduce, initAccum = arguments.length < 3;
          return func(collection, getIteratee(iteratee2, 4), accumulator, initAccum, baseEachRight);
        }
        function reject(collection, predicate) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          return func(collection, negate(getIteratee(predicate, 3)));
        }
        function sample(collection) {
          var func = isArray(collection) ? arraySample : baseSample;
          return func(collection);
        }
        function sampleSize(collection, n2, guard) {
          if (guard ? isIterateeCall(collection, n2, guard) : n2 === undefined2) {
            n2 = 1;
          } else {
            n2 = toInteger(n2);
          }
          var func = isArray(collection) ? arraySampleSize : baseSampleSize;
          return func(collection, n2);
        }
        function shuffle(collection) {
          var func = isArray(collection) ? arrayShuffle : baseShuffle;
          return func(collection);
        }
        function size(collection) {
          if (collection == null) {
            return 0;
          }
          if (isArrayLike(collection)) {
            return isString(collection) ? stringSize(collection) : collection.length;
          }
          var tag = getTag(collection);
          if (tag == mapTag || tag == setTag) {
            return collection.size;
          }
          return baseKeys(collection).length;
        }
        function some(collection, predicate, guard) {
          var func = isArray(collection) ? arraySome : baseSome;
          if (guard && isIterateeCall(collection, predicate, guard)) {
            predicate = undefined2;
          }
          return func(collection, getIteratee(predicate, 3));
        }
        var sortBy = baseRest(function(collection, iteratees) {
          if (collection == null) {
            return [];
          }
          var length = iteratees.length;
          if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
            iteratees = [];
          } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
            iteratees = [iteratees[0]];
          }
          return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
        });
        var now = ctxNow || function() {
          return root.Date.now();
        };
        function after(n2, func) {
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          n2 = toInteger(n2);
          return function() {
            if (--n2 < 1) {
              return func.apply(this, arguments);
            }
          };
        }
        function ary(func, n2, guard) {
          n2 = guard ? undefined2 : n2;
          n2 = func && n2 == null ? func.length : n2;
          return createWrap(func, WRAP_ARY_FLAG, undefined2, undefined2, undefined2, undefined2, n2);
        }
        function before(n2, func) {
          var result2;
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          n2 = toInteger(n2);
          return function() {
            if (--n2 > 0) {
              result2 = func.apply(this, arguments);
            }
            if (n2 <= 1) {
              func = undefined2;
            }
            return result2;
          };
        }
        var bind = baseRest(function(func, thisArg, partials) {
          var bitmask = WRAP_BIND_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, getHolder(bind));
            bitmask |= WRAP_PARTIAL_FLAG;
          }
          return createWrap(func, bitmask, thisArg, partials, holders);
        });
        var bindKey = baseRest(function(object, key, partials) {
          var bitmask = WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, getHolder(bindKey));
            bitmask |= WRAP_PARTIAL_FLAG;
          }
          return createWrap(key, bitmask, object, partials, holders);
        });
        function curry(func, arity, guard) {
          arity = guard ? undefined2 : arity;
          var result2 = createWrap(func, WRAP_CURRY_FLAG, undefined2, undefined2, undefined2, undefined2, undefined2, arity);
          result2.placeholder = curry.placeholder;
          return result2;
        }
        function curryRight(func, arity, guard) {
          arity = guard ? undefined2 : arity;
          var result2 = createWrap(func, WRAP_CURRY_RIGHT_FLAG, undefined2, undefined2, undefined2, undefined2, undefined2, arity);
          result2.placeholder = curryRight.placeholder;
          return result2;
        }
        function debounce(func, wait, options) {
          var lastArgs, lastThis, maxWait, result2, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          wait = toNumber(wait) || 0;
          if (isObject(options)) {
            leading = !!options.leading;
            maxing = "maxWait" in options;
            maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
            trailing = "trailing" in options ? !!options.trailing : trailing;
          }
          function invokeFunc(time) {
            var args = lastArgs, thisArg = lastThis;
            lastArgs = lastThis = undefined2;
            lastInvokeTime = time;
            result2 = func.apply(thisArg, args);
            return result2;
          }
          function leadingEdge(time) {
            lastInvokeTime = time;
            timerId = setTimeout(timerExpired, wait);
            return leading ? invokeFunc(time) : result2;
          }
          function remainingWait(time) {
            var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
            return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
          }
          function shouldInvoke(time) {
            var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
            return lastCallTime === undefined2 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
          }
          function timerExpired() {
            var time = now();
            if (shouldInvoke(time)) {
              return trailingEdge(time);
            }
            timerId = setTimeout(timerExpired, remainingWait(time));
          }
          function trailingEdge(time) {
            timerId = undefined2;
            if (trailing && lastArgs) {
              return invokeFunc(time);
            }
            lastArgs = lastThis = undefined2;
            return result2;
          }
          function cancel() {
            if (timerId !== undefined2) {
              clearTimeout(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined2;
          }
          function flush() {
            return timerId === undefined2 ? result2 : trailingEdge(now());
          }
          function debounced() {
            var time = now(), isInvoking = shouldInvoke(time);
            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;
            if (isInvoking) {
              if (timerId === undefined2) {
                return leadingEdge(lastCallTime);
              }
              if (maxing) {
                clearTimeout(timerId);
                timerId = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
              }
            }
            if (timerId === undefined2) {
              timerId = setTimeout(timerExpired, wait);
            }
            return result2;
          }
          debounced.cancel = cancel;
          debounced.flush = flush;
          return debounced;
        }
        var defer = baseRest(function(func, args) {
          return baseDelay(func, 1, args);
        });
        var delay = baseRest(function(func, wait, args) {
          return baseDelay(func, toNumber(wait) || 0, args);
        });
        function flip(func) {
          return createWrap(func, WRAP_FLIP_FLAG);
        }
        function memoize(func, resolver) {
          if (typeof func != "function" || resolver != null && typeof resolver != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          var memoized = function() {
            var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
            if (cache.has(key)) {
              return cache.get(key);
            }
            var result2 = func.apply(this, args);
            memoized.cache = cache.set(key, result2) || cache;
            return result2;
          };
          memoized.cache = new (memoize.Cache || MapCache)();
          return memoized;
        }
        memoize.Cache = MapCache;
        function negate(predicate) {
          if (typeof predicate != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          return function() {
            var args = arguments;
            switch (args.length) {
              case 0:
                return !predicate.call(this);
              case 1:
                return !predicate.call(this, args[0]);
              case 2:
                return !predicate.call(this, args[0], args[1]);
              case 3:
                return !predicate.call(this, args[0], args[1], args[2]);
            }
            return !predicate.apply(this, args);
          };
        }
        function once(func) {
          return before(2, func);
        }
        var overArgs = castRest(function(func, transforms) {
          transforms = transforms.length == 1 && isArray(transforms[0]) ? arrayMap(transforms[0], baseUnary(getIteratee())) : arrayMap(baseFlatten(transforms, 1), baseUnary(getIteratee()));
          var funcsLength = transforms.length;
          return baseRest(function(args) {
            var index = -1, length = nativeMin(args.length, funcsLength);
            while (++index < length) {
              args[index] = transforms[index].call(this, args[index]);
            }
            return apply(func, this, args);
          });
        });
        var partial = baseRest(function(func, partials) {
          var holders = replaceHolders(partials, getHolder(partial));
          return createWrap(func, WRAP_PARTIAL_FLAG, undefined2, partials, holders);
        });
        var partialRight = baseRest(function(func, partials) {
          var holders = replaceHolders(partials, getHolder(partialRight));
          return createWrap(func, WRAP_PARTIAL_RIGHT_FLAG, undefined2, partials, holders);
        });
        var rearg = flatRest(function(func, indexes) {
          return createWrap(func, WRAP_REARG_FLAG, undefined2, undefined2, undefined2, indexes);
        });
        function rest(func, start) {
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          start = start === undefined2 ? start : toInteger(start);
          return baseRest(func, start);
        }
        function spread(func, start) {
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          start = start == null ? 0 : nativeMax(toInteger(start), 0);
          return baseRest(function(args) {
            var array = args[start], otherArgs = castSlice(args, 0, start);
            if (array) {
              arrayPush(otherArgs, array);
            }
            return apply(func, this, otherArgs);
          });
        }
        function throttle(func, wait, options) {
          var leading = true, trailing = true;
          if (typeof func != "function") {
            throw new TypeError2(FUNC_ERROR_TEXT);
          }
          if (isObject(options)) {
            leading = "leading" in options ? !!options.leading : leading;
            trailing = "trailing" in options ? !!options.trailing : trailing;
          }
          return debounce(func, wait, {
            "leading": leading,
            "maxWait": wait,
            "trailing": trailing
          });
        }
        function unary(func) {
          return ary(func, 1);
        }
        function wrap(value, wrapper) {
          return partial(castFunction(wrapper), value);
        }
        function castArray() {
          if (!arguments.length) {
            return [];
          }
          var value = arguments[0];
          return isArray(value) ? value : [value];
        }
        function clone(value) {
          return baseClone(value, CLONE_SYMBOLS_FLAG);
        }
        function cloneWith(value, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          return baseClone(value, CLONE_SYMBOLS_FLAG, customizer);
        }
        function cloneDeep(value) {
          return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
        }
        function cloneDeepWith(value, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
        }
        function conformsTo(object, source) {
          return source == null || baseConformsTo(object, source, keys(source));
        }
        function eq(value, other) {
          return value === other || value !== value && other !== other;
        }
        var gt = createRelationalOperation(baseGt);
        var gte = createRelationalOperation(function(value, other) {
          return value >= other;
        });
        var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
          return arguments;
        })()) ? baseIsArguments : function(value) {
          return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
        };
        var isArray = Array2.isArray;
        var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
        function isArrayLike(value) {
          return value != null && isLength(value.length) && !isFunction(value);
        }
        function isArrayLikeObject(value) {
          return isObjectLike(value) && isArrayLike(value);
        }
        function isBoolean(value) {
          return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
        }
        var isBuffer = nativeIsBuffer || stubFalse;
        var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
        function isElement(value) {
          return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
        }
        function isEmpty(value) {
          if (value == null) {
            return true;
          }
          if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
            return !value.length;
          }
          var tag = getTag(value);
          if (tag == mapTag || tag == setTag) {
            return !value.size;
          }
          if (isPrototype(value)) {
            return !baseKeys(value).length;
          }
          for (var key in value) {
            if (hasOwnProperty.call(value, key)) {
              return false;
            }
          }
          return true;
        }
        function isEqual(value, other) {
          return baseIsEqual(value, other);
        }
        function isEqualWith(value, other, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          var result2 = customizer ? customizer(value, other) : undefined2;
          return result2 === undefined2 ? baseIsEqual(value, other, undefined2, customizer) : !!result2;
        }
        function isError(value) {
          if (!isObjectLike(value)) {
            return false;
          }
          var tag = baseGetTag(value);
          return tag == errorTag || tag == domExcTag || typeof value.message == "string" && typeof value.name == "string" && !isPlainObject(value);
        }
        function isFinite2(value) {
          return typeof value == "number" && nativeIsFinite(value);
        }
        function isFunction(value) {
          if (!isObject(value)) {
            return false;
          }
          var tag = baseGetTag(value);
          return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
        }
        function isInteger(value) {
          return typeof value == "number" && value == toInteger(value);
        }
        function isLength(value) {
          return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        function isObject(value) {
          var type = typeof value;
          return value != null && (type == "object" || type == "function");
        }
        function isObjectLike(value) {
          return value != null && typeof value == "object";
        }
        var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
        function isMatch(object, source) {
          return object === source || baseIsMatch(object, source, getMatchData(source));
        }
        function isMatchWith(object, source, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          return baseIsMatch(object, source, getMatchData(source), customizer);
        }
        function isNaN2(value) {
          return isNumber(value) && value != +value;
        }
        function isNative(value) {
          if (isMaskable(value)) {
            throw new Error2(CORE_ERROR_TEXT);
          }
          return baseIsNative(value);
        }
        function isNull(value) {
          return value === null;
        }
        function isNil(value) {
          return value == null;
        }
        function isNumber(value) {
          return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
        }
        function isPlainObject(value) {
          if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
            return false;
          }
          var proto = getPrototype(value);
          if (proto === null) {
            return true;
          }
          var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
          return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
        }
        var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
        function isSafeInteger(value) {
          return isInteger(value) && value >= -MAX_SAFE_INTEGER && value <= MAX_SAFE_INTEGER;
        }
        var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
        function isString(value) {
          return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
        }
        function isSymbol(value) {
          return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
        }
        var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
        function isUndefined(value) {
          return value === undefined2;
        }
        function isWeakMap(value) {
          return isObjectLike(value) && getTag(value) == weakMapTag;
        }
        function isWeakSet(value) {
          return isObjectLike(value) && baseGetTag(value) == weakSetTag;
        }
        var lt = createRelationalOperation(baseLt);
        var lte = createRelationalOperation(function(value, other) {
          return value <= other;
        });
        function toArray(value) {
          if (!value) {
            return [];
          }
          if (isArrayLike(value)) {
            return isString(value) ? stringToArray(value) : copyArray(value);
          }
          if (symIterator && value[symIterator]) {
            return iteratorToArray(value[symIterator]());
          }
          var tag = getTag(value), func = tag == mapTag ? mapToArray : tag == setTag ? setToArray : values;
          return func(value);
        }
        function toFinite(value) {
          if (!value) {
            return value === 0 ? value : 0;
          }
          value = toNumber(value);
          if (value === INFINITY || value === -INFINITY) {
            var sign = value < 0 ? -1 : 1;
            return sign * MAX_INTEGER;
          }
          return value === value ? value : 0;
        }
        function toInteger(value) {
          var result2 = toFinite(value), remainder = result2 % 1;
          return result2 === result2 ? remainder ? result2 - remainder : result2 : 0;
        }
        function toLength(value) {
          return value ? baseClamp(toInteger(value), 0, MAX_ARRAY_LENGTH) : 0;
        }
        function toNumber(value) {
          if (typeof value == "number") {
            return value;
          }
          if (isSymbol(value)) {
            return NAN;
          }
          if (isObject(value)) {
            var other = typeof value.valueOf == "function" ? value.valueOf() : value;
            value = isObject(other) ? other + "" : other;
          }
          if (typeof value != "string") {
            return value === 0 ? value : +value;
          }
          value = baseTrim(value);
          var isBinary = reIsBinary.test(value);
          return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
        }
        function toPlainObject(value) {
          return copyObject(value, keysIn(value));
        }
        function toSafeInteger(value) {
          return value ? baseClamp(toInteger(value), -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER) : value === 0 ? value : 0;
        }
        function toString(value) {
          return value == null ? "" : baseToString(value);
        }
        var assign = createAssigner(function(object, source) {
          if (isPrototype(source) || isArrayLike(source)) {
            copyObject(source, keys(source), object);
            return;
          }
          for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
              assignValue(object, key, source[key]);
            }
          }
        });
        var assignIn = createAssigner(function(object, source) {
          copyObject(source, keysIn(source), object);
        });
        var assignInWith = createAssigner(function(object, source, srcIndex, customizer) {
          copyObject(source, keysIn(source), object, customizer);
        });
        var assignWith = createAssigner(function(object, source, srcIndex, customizer) {
          copyObject(source, keys(source), object, customizer);
        });
        var at = flatRest(baseAt);
        function create(prototype, properties) {
          var result2 = baseCreate(prototype);
          return properties == null ? result2 : baseAssign(result2, properties);
        }
        var defaults = baseRest(function(object, sources) {
          object = Object2(object);
          var index = -1;
          var length = sources.length;
          var guard = length > 2 ? sources[2] : undefined2;
          if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            length = 1;
          }
          while (++index < length) {
            var source = sources[index];
            var props = keysIn(source);
            var propsIndex = -1;
            var propsLength = props.length;
            while (++propsIndex < propsLength) {
              var key = props[propsIndex];
              var value = object[key];
              if (value === undefined2 || eq(value, objectProto[key]) && !hasOwnProperty.call(object, key)) {
                object[key] = source[key];
              }
            }
          }
          return object;
        });
        var defaultsDeep = baseRest(function(args) {
          args.push(undefined2, customDefaultsMerge);
          return apply(mergeWith, undefined2, args);
        });
        function findKey(object, predicate) {
          return baseFindKey(object, getIteratee(predicate, 3), baseForOwn);
        }
        function findLastKey(object, predicate) {
          return baseFindKey(object, getIteratee(predicate, 3), baseForOwnRight);
        }
        function forIn(object, iteratee2) {
          return object == null ? object : baseFor(object, getIteratee(iteratee2, 3), keysIn);
        }
        function forInRight(object, iteratee2) {
          return object == null ? object : baseForRight(object, getIteratee(iteratee2, 3), keysIn);
        }
        function forOwn(object, iteratee2) {
          return object && baseForOwn(object, getIteratee(iteratee2, 3));
        }
        function forOwnRight(object, iteratee2) {
          return object && baseForOwnRight(object, getIteratee(iteratee2, 3));
        }
        function functions(object) {
          return object == null ? [] : baseFunctions(object, keys(object));
        }
        function functionsIn(object) {
          return object == null ? [] : baseFunctions(object, keysIn(object));
        }
        function get(object, path, defaultValue) {
          var result2 = object == null ? undefined2 : baseGet(object, path);
          return result2 === undefined2 ? defaultValue : result2;
        }
        function has(object, path) {
          return object != null && hasPath(object, path, baseHas);
        }
        function hasIn(object, path) {
          return object != null && hasPath(object, path, baseHasIn);
        }
        var invert = createInverter(function(result2, value, key) {
          if (value != null && typeof value.toString != "function") {
            value = nativeObjectToString.call(value);
          }
          result2[value] = key;
        }, constant(identity));
        var invertBy = createInverter(function(result2, value, key) {
          if (value != null && typeof value.toString != "function") {
            value = nativeObjectToString.call(value);
          }
          if (hasOwnProperty.call(result2, value)) {
            result2[value].push(key);
          } else {
            result2[value] = [key];
          }
        }, getIteratee);
        var invoke = baseRest(baseInvoke);
        function keys(object) {
          return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
        }
        function keysIn(object) {
          return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
        }
        function mapKeys(object, iteratee2) {
          var result2 = {};
          iteratee2 = getIteratee(iteratee2, 3);
          baseForOwn(object, function(value, key, object2) {
            baseAssignValue(result2, iteratee2(value, key, object2), value);
          });
          return result2;
        }
        function mapValues(object, iteratee2) {
          var result2 = {};
          iteratee2 = getIteratee(iteratee2, 3);
          baseForOwn(object, function(value, key, object2) {
            baseAssignValue(result2, key, iteratee2(value, key, object2));
          });
          return result2;
        }
        var merge = createAssigner(function(object, source, srcIndex) {
          baseMerge(object, source, srcIndex);
        });
        var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
          baseMerge(object, source, srcIndex, customizer);
        });
        var omit = flatRest(function(object, paths) {
          var result2 = {};
          if (object == null) {
            return result2;
          }
          var isDeep = false;
          paths = arrayMap(paths, function(path) {
            path = castPath(path, object);
            isDeep || (isDeep = path.length > 1);
            return path;
          });
          copyObject(object, getAllKeysIn(object), result2);
          if (isDeep) {
            result2 = baseClone(result2, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
          }
          var length = paths.length;
          while (length--) {
            baseUnset(result2, paths[length]);
          }
          return result2;
        });
        function omitBy(object, predicate) {
          return pickBy(object, negate(getIteratee(predicate)));
        }
        var pick = flatRest(function(object, paths) {
          return object == null ? {} : basePick(object, paths);
        });
        function pickBy(object, predicate) {
          if (object == null) {
            return {};
          }
          var props = arrayMap(getAllKeysIn(object), function(prop) {
            return [prop];
          });
          predicate = getIteratee(predicate);
          return basePickBy(object, props, function(value, path) {
            return predicate(value, path[0]);
          });
        }
        function result(object, path, defaultValue) {
          path = castPath(path, object);
          var index = -1, length = path.length;
          if (!length) {
            length = 1;
            object = undefined2;
          }
          while (++index < length) {
            var value = object == null ? undefined2 : object[toKey(path[index])];
            if (value === undefined2) {
              index = length;
              value = defaultValue;
            }
            object = isFunction(value) ? value.call(object) : value;
          }
          return object;
        }
        function set(object, path, value) {
          return object == null ? object : baseSet(object, path, value);
        }
        function setWith(object, path, value, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          return object == null ? object : baseSet(object, path, value, customizer);
        }
        var toPairs = createToPairs(keys);
        var toPairsIn = createToPairs(keysIn);
        function transform(object, iteratee2, accumulator) {
          var isArr = isArray(object), isArrLike = isArr || isBuffer(object) || isTypedArray(object);
          iteratee2 = getIteratee(iteratee2, 4);
          if (accumulator == null) {
            var Ctor = object && object.constructor;
            if (isArrLike) {
              accumulator = isArr ? new Ctor() : [];
            } else if (isObject(object)) {
              accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
            } else {
              accumulator = {};
            }
          }
          (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object2) {
            return iteratee2(accumulator, value, index, object2);
          });
          return accumulator;
        }
        function unset(object, path) {
          return object == null ? true : baseUnset(object, path);
        }
        function update(object, path, updater) {
          return object == null ? object : baseUpdate(object, path, castFunction(updater));
        }
        function updateWith(object, path, updater, customizer) {
          customizer = typeof customizer == "function" ? customizer : undefined2;
          return object == null ? object : baseUpdate(object, path, castFunction(updater), customizer);
        }
        function values(object) {
          return object == null ? [] : baseValues(object, keys(object));
        }
        function valuesIn(object) {
          return object == null ? [] : baseValues(object, keysIn(object));
        }
        function clamp(number, lower, upper) {
          if (upper === undefined2) {
            upper = lower;
            lower = undefined2;
          }
          if (upper !== undefined2) {
            upper = toNumber(upper);
            upper = upper === upper ? upper : 0;
          }
          if (lower !== undefined2) {
            lower = toNumber(lower);
            lower = lower === lower ? lower : 0;
          }
          return baseClamp(toNumber(number), lower, upper);
        }
        function inRange(number, start, end) {
          start = toFinite(start);
          if (end === undefined2) {
            end = start;
            start = 0;
          } else {
            end = toFinite(end);
          }
          number = toNumber(number);
          return baseInRange(number, start, end);
        }
        function random(lower, upper, floating) {
          if (floating && typeof floating != "boolean" && isIterateeCall(lower, upper, floating)) {
            upper = floating = undefined2;
          }
          if (floating === undefined2) {
            if (typeof upper == "boolean") {
              floating = upper;
              upper = undefined2;
            } else if (typeof lower == "boolean") {
              floating = lower;
              lower = undefined2;
            }
          }
          if (lower === undefined2 && upper === undefined2) {
            lower = 0;
            upper = 1;
          } else {
            lower = toFinite(lower);
            if (upper === undefined2) {
              upper = lower;
              lower = 0;
            } else {
              upper = toFinite(upper);
            }
          }
          if (lower > upper) {
            var temp = lower;
            lower = upper;
            upper = temp;
          }
          if (floating || lower % 1 || upper % 1) {
            var rand = nativeRandom();
            return nativeMin(lower + rand * (upper - lower + freeParseFloat("1e-" + ((rand + "").length - 1))), upper);
          }
          return baseRandom(lower, upper);
        }
        var camelCase = createCompounder(function(result2, word, index) {
          word = word.toLowerCase();
          return result2 + (index ? capitalize(word) : word);
        });
        function capitalize(string) {
          return upperFirst(toString(string).toLowerCase());
        }
        function deburr(string) {
          string = toString(string);
          return string && string.replace(reLatin, deburrLetter).replace(reComboMark, "");
        }
        function endsWith(string, target, position) {
          string = toString(string);
          target = baseToString(target);
          var length = string.length;
          position = position === undefined2 ? length : baseClamp(toInteger(position), 0, length);
          var end = position;
          position -= target.length;
          return position >= 0 && string.slice(position, end) == target;
        }
        function escape(string) {
          string = toString(string);
          return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
        }
        function escapeRegExp(string) {
          string = toString(string);
          return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
        }
        var kebabCase = createCompounder(function(result2, word, index) {
          return result2 + (index ? "-" : "") + word.toLowerCase();
        });
        var lowerCase = createCompounder(function(result2, word, index) {
          return result2 + (index ? " " : "") + word.toLowerCase();
        });
        var lowerFirst = createCaseFirst("toLowerCase");
        function pad(string, length, chars) {
          string = toString(string);
          length = toInteger(length);
          var strLength = length ? stringSize(string) : 0;
          if (!length || strLength >= length) {
            return string;
          }
          var mid = (length - strLength) / 2;
          return createPadding(nativeFloor(mid), chars) + string + createPadding(nativeCeil(mid), chars);
        }
        function padEnd(string, length, chars) {
          string = toString(string);
          length = toInteger(length);
          var strLength = length ? stringSize(string) : 0;
          return length && strLength < length ? string + createPadding(length - strLength, chars) : string;
        }
        function padStart(string, length, chars) {
          string = toString(string);
          length = toInteger(length);
          var strLength = length ? stringSize(string) : 0;
          return length && strLength < length ? createPadding(length - strLength, chars) + string : string;
        }
        function parseInt2(string, radix, guard) {
          if (guard || radix == null) {
            radix = 0;
          } else if (radix) {
            radix = +radix;
          }
          return nativeParseInt(toString(string).replace(reTrimStart, ""), radix || 0);
        }
        function repeat(string, n2, guard) {
          if (guard ? isIterateeCall(string, n2, guard) : n2 === undefined2) {
            n2 = 1;
          } else {
            n2 = toInteger(n2);
          }
          return baseRepeat(toString(string), n2);
        }
        function replace() {
          var args = arguments, string = toString(args[0]);
          return args.length < 3 ? string : string.replace(args[1], args[2]);
        }
        var snakeCase = createCompounder(function(result2, word, index) {
          return result2 + (index ? "_" : "") + word.toLowerCase();
        });
        function split(string, separator, limit) {
          if (limit && typeof limit != "number" && isIterateeCall(string, separator, limit)) {
            separator = limit = undefined2;
          }
          limit = limit === undefined2 ? MAX_ARRAY_LENGTH : limit >>> 0;
          if (!limit) {
            return [];
          }
          string = toString(string);
          if (string && (typeof separator == "string" || separator != null && !isRegExp(separator))) {
            separator = baseToString(separator);
            if (!separator && hasUnicode(string)) {
              return castSlice(stringToArray(string), 0, limit);
            }
          }
          return string.split(separator, limit);
        }
        var startCase = createCompounder(function(result2, word, index) {
          return result2 + (index ? " " : "") + upperFirst(word);
        });
        function startsWith(string, target, position) {
          string = toString(string);
          position = position == null ? 0 : baseClamp(toInteger(position), 0, string.length);
          target = baseToString(target);
          return string.slice(position, position + target.length) == target;
        }
        function template(string, options, guard) {
          var settings = lodash.templateSettings;
          if (guard && isIterateeCall(string, options, guard)) {
            options = undefined2;
          }
          string = toString(string);
          options = assignWith({}, options, settings, customDefaultsAssignIn);
          var imports = assignWith({}, options.imports, settings.imports, customDefaultsAssignIn), importsKeys = keys(imports), importsValues = baseValues(imports, importsKeys);
          arrayEach(importsKeys, function(key) {
            if (reForbiddenIdentifierChars.test(key)) {
              throw new Error2(INVALID_TEMPL_IMPORTS_ERROR_TEXT);
            }
          });
          var isEscaping, isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
          var reDelimiters = RegExp2(
            (options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$",
            "g"
          );
          var sourceURL = "//# sourceURL=" + (hasOwnProperty.call(options, "sourceURL") ? (options.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++templateCounter + "]") + "\n";
          string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
            interpolateValue || (interpolateValue = esTemplateValue);
            source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
            if (escapeValue) {
              isEscaping = true;
              source += "' +\n__e(" + escapeValue + ") +\n'";
            }
            if (evaluateValue) {
              isEvaluating = true;
              source += "';\n" + evaluateValue + ";\n__p += '";
            }
            if (interpolateValue) {
              source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
            }
            index = offset + match.length;
            return match;
          });
          source += "';\n";
          var variable = hasOwnProperty.call(options, "variable") && options.variable;
          if (!variable) {
            source = "with (obj) {\n" + source + "\n}\n";
          } else if (reForbiddenIdentifierChars.test(variable)) {
            throw new Error2(INVALID_TEMPL_VAR_ERROR_TEXT);
          }
          source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
          source = "function(" + (variable || "obj") + ") {\n" + (variable ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (isEscaping ? ", __e = _.escape" : "") + (isEvaluating ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
          var result2 = attempt(function() {
            return Function2(importsKeys, sourceURL + "return " + source).apply(undefined2, importsValues);
          });
          result2.source = source;
          if (isError(result2)) {
            throw result2;
          }
          return result2;
        }
        function toLower(value) {
          return toString(value).toLowerCase();
        }
        function toUpper(value) {
          return toString(value).toUpperCase();
        }
        function trim(string, chars, guard) {
          string = toString(string);
          if (string && (guard || chars === undefined2)) {
            return baseTrim(string);
          }
          if (!string || !(chars = baseToString(chars))) {
            return string;
          }
          var strSymbols = stringToArray(string), chrSymbols = stringToArray(chars), start = charsStartIndex(strSymbols, chrSymbols), end = charsEndIndex(strSymbols, chrSymbols) + 1;
          return castSlice(strSymbols, start, end).join("");
        }
        function trimEnd(string, chars, guard) {
          string = toString(string);
          if (string && (guard || chars === undefined2)) {
            return string.slice(0, trimmedEndIndex(string) + 1);
          }
          if (!string || !(chars = baseToString(chars))) {
            return string;
          }
          var strSymbols = stringToArray(string), end = charsEndIndex(strSymbols, stringToArray(chars)) + 1;
          return castSlice(strSymbols, 0, end).join("");
        }
        function trimStart(string, chars, guard) {
          string = toString(string);
          if (string && (guard || chars === undefined2)) {
            return string.replace(reTrimStart, "");
          }
          if (!string || !(chars = baseToString(chars))) {
            return string;
          }
          var strSymbols = stringToArray(string), start = charsStartIndex(strSymbols, stringToArray(chars));
          return castSlice(strSymbols, start).join("");
        }
        function truncate(string, options) {
          var length = DEFAULT_TRUNC_LENGTH, omission = DEFAULT_TRUNC_OMISSION;
          if (isObject(options)) {
            var separator = "separator" in options ? options.separator : separator;
            length = "length" in options ? toInteger(options.length) : length;
            omission = "omission" in options ? baseToString(options.omission) : omission;
          }
          string = toString(string);
          var strLength = string.length;
          if (hasUnicode(string)) {
            var strSymbols = stringToArray(string);
            strLength = strSymbols.length;
          }
          if (length >= strLength) {
            return string;
          }
          var end = length - stringSize(omission);
          if (end < 1) {
            return omission;
          }
          var result2 = strSymbols ? castSlice(strSymbols, 0, end).join("") : string.slice(0, end);
          if (separator === undefined2) {
            return result2 + omission;
          }
          if (strSymbols) {
            end += result2.length - end;
          }
          if (isRegExp(separator)) {
            if (string.slice(end).search(separator)) {
              var match, substring = result2;
              if (!separator.global) {
                separator = RegExp2(separator.source, toString(reFlags.exec(separator)) + "g");
              }
              separator.lastIndex = 0;
              while (match = separator.exec(substring)) {
                var newEnd = match.index;
              }
              result2 = result2.slice(0, newEnd === undefined2 ? end : newEnd);
            }
          } else if (string.indexOf(baseToString(separator), end) != end) {
            var index = result2.lastIndexOf(separator);
            if (index > -1) {
              result2 = result2.slice(0, index);
            }
          }
          return result2 + omission;
        }
        function unescape(string) {
          string = toString(string);
          return string && reHasEscapedHtml.test(string) ? string.replace(reEscapedHtml, unescapeHtmlChar) : string;
        }
        var upperCase = createCompounder(function(result2, word, index) {
          return result2 + (index ? " " : "") + word.toUpperCase();
        });
        var upperFirst = createCaseFirst("toUpperCase");
        function words(string, pattern, guard) {
          string = toString(string);
          pattern = guard ? undefined2 : pattern;
          if (pattern === undefined2) {
            return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
          }
          return string.match(pattern) || [];
        }
        var attempt = baseRest(function(func, args) {
          try {
            return apply(func, undefined2, args);
          } catch (e2) {
            return isError(e2) ? e2 : new Error2(e2);
          }
        });
        var bindAll = flatRest(function(object, methodNames) {
          arrayEach(methodNames, function(key) {
            key = toKey(key);
            baseAssignValue(object, key, bind(object[key], object));
          });
          return object;
        });
        function cond(pairs) {
          var length = pairs == null ? 0 : pairs.length, toIteratee = getIteratee();
          pairs = !length ? [] : arrayMap(pairs, function(pair) {
            if (typeof pair[1] != "function") {
              throw new TypeError2(FUNC_ERROR_TEXT);
            }
            return [toIteratee(pair[0]), pair[1]];
          });
          return baseRest(function(args) {
            var index = -1;
            while (++index < length) {
              var pair = pairs[index];
              if (apply(pair[0], this, args)) {
                return apply(pair[1], this, args);
              }
            }
          });
        }
        function conforms(source) {
          return baseConforms(baseClone(source, CLONE_DEEP_FLAG));
        }
        function constant(value) {
          return function() {
            return value;
          };
        }
        function defaultTo(value, defaultValue) {
          return value == null || value !== value ? defaultValue : value;
        }
        var flow = createFlow();
        var flowRight = createFlow(true);
        function identity(value) {
          return value;
        }
        function iteratee(func) {
          return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
        }
        function matches(source) {
          return baseMatches(baseClone(source, CLONE_DEEP_FLAG));
        }
        function matchesProperty(path, srcValue) {
          return baseMatchesProperty(path, baseClone(srcValue, CLONE_DEEP_FLAG));
        }
        var method = baseRest(function(path, args) {
          return function(object) {
            return baseInvoke(object, path, args);
          };
        });
        var methodOf = baseRest(function(object, args) {
          return function(path) {
            return baseInvoke(object, path, args);
          };
        });
        function mixin(object, source, options) {
          var props = keys(source), methodNames = baseFunctions(source, props);
          if (options == null && !(isObject(source) && (methodNames.length || !props.length))) {
            options = source;
            source = object;
            object = this;
            methodNames = baseFunctions(source, keys(source));
          }
          var chain2 = !(isObject(options) && "chain" in options) || !!options.chain, isFunc = isFunction(object);
          arrayEach(methodNames, function(methodName) {
            var func = source[methodName];
            object[methodName] = func;
            if (isFunc) {
              object.prototype[methodName] = function() {
                var chainAll = this.__chain__;
                if (chain2 || chainAll) {
                  var result2 = object(this.__wrapped__), actions = result2.__actions__ = copyArray(this.__actions__);
                  actions.push({ "func": func, "args": arguments, "thisArg": object });
                  result2.__chain__ = chainAll;
                  return result2;
                }
                return func.apply(object, arrayPush([this.value()], arguments));
              };
            }
          });
          return object;
        }
        function noConflict() {
          if (root._ === this) {
            root._ = oldDash;
          }
          return this;
        }
        function noop() {
        }
        function nthArg(n2) {
          n2 = toInteger(n2);
          return baseRest(function(args) {
            return baseNth(args, n2);
          });
        }
        var over = createOver(arrayMap);
        var overEvery = createOver(arrayEvery);
        var overSome = createOver(arraySome);
        function property(path) {
          return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
        }
        function propertyOf(object) {
          return function(path) {
            return object == null ? undefined2 : baseGet(object, path);
          };
        }
        var range = createRange();
        var rangeRight = createRange(true);
        function stubArray() {
          return [];
        }
        function stubFalse() {
          return false;
        }
        function stubObject() {
          return {};
        }
        function stubString() {
          return "";
        }
        function stubTrue() {
          return true;
        }
        function times(n2, iteratee2) {
          n2 = toInteger(n2);
          if (n2 < 1 || n2 > MAX_SAFE_INTEGER) {
            return [];
          }
          var index = MAX_ARRAY_LENGTH, length = nativeMin(n2, MAX_ARRAY_LENGTH);
          iteratee2 = getIteratee(iteratee2);
          n2 -= MAX_ARRAY_LENGTH;
          var result2 = baseTimes(length, iteratee2);
          while (++index < n2) {
            iteratee2(index);
          }
          return result2;
        }
        function toPath(value) {
          if (isArray(value)) {
            return arrayMap(value, toKey);
          }
          return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
        }
        function uniqueId(prefix) {
          var id = ++idCounter;
          return toString(prefix) + id;
        }
        var add = createMathOperation(function(augend, addend) {
          return augend + addend;
        }, 0);
        var ceil = createRound("ceil");
        var divide = createMathOperation(function(dividend, divisor) {
          return dividend / divisor;
        }, 1);
        var floor = createRound("floor");
        function max(array) {
          return array && array.length ? baseExtremum(array, identity, baseGt) : undefined2;
        }
        function maxBy(array, iteratee2) {
          return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseGt) : undefined2;
        }
        function mean(array) {
          return baseMean(array, identity);
        }
        function meanBy(array, iteratee2) {
          return baseMean(array, getIteratee(iteratee2, 2));
        }
        function min(array) {
          return array && array.length ? baseExtremum(array, identity, baseLt) : undefined2;
        }
        function minBy(array, iteratee2) {
          return array && array.length ? baseExtremum(array, getIteratee(iteratee2, 2), baseLt) : undefined2;
        }
        var multiply = createMathOperation(function(multiplier, multiplicand) {
          return multiplier * multiplicand;
        }, 1);
        var round = createRound("round");
        var subtract = createMathOperation(function(minuend, subtrahend) {
          return minuend - subtrahend;
        }, 0);
        function sum(array) {
          return array && array.length ? baseSum(array, identity) : 0;
        }
        function sumBy(array, iteratee2) {
          return array && array.length ? baseSum(array, getIteratee(iteratee2, 2)) : 0;
        }
        lodash.after = after;
        lodash.ary = ary;
        lodash.assign = assign;
        lodash.assignIn = assignIn;
        lodash.assignInWith = assignInWith;
        lodash.assignWith = assignWith;
        lodash.at = at;
        lodash.before = before;
        lodash.bind = bind;
        lodash.bindAll = bindAll;
        lodash.bindKey = bindKey;
        lodash.castArray = castArray;
        lodash.chain = chain;
        lodash.chunk = chunk;
        lodash.compact = compact;
        lodash.concat = concat;
        lodash.cond = cond;
        lodash.conforms = conforms;
        lodash.constant = constant;
        lodash.countBy = countBy;
        lodash.create = create;
        lodash.curry = curry;
        lodash.curryRight = curryRight;
        lodash.debounce = debounce;
        lodash.defaults = defaults;
        lodash.defaultsDeep = defaultsDeep;
        lodash.defer = defer;
        lodash.delay = delay;
        lodash.difference = difference;
        lodash.differenceBy = differenceBy;
        lodash.differenceWith = differenceWith;
        lodash.drop = drop;
        lodash.dropRight = dropRight;
        lodash.dropRightWhile = dropRightWhile;
        lodash.dropWhile = dropWhile;
        lodash.fill = fill;
        lodash.filter = filter;
        lodash.flatMap = flatMap;
        lodash.flatMapDeep = flatMapDeep;
        lodash.flatMapDepth = flatMapDepth;
        lodash.flatten = flatten;
        lodash.flattenDeep = flattenDeep;
        lodash.flattenDepth = flattenDepth;
        lodash.flip = flip;
        lodash.flow = flow;
        lodash.flowRight = flowRight;
        lodash.fromPairs = fromPairs;
        lodash.functions = functions;
        lodash.functionsIn = functionsIn;
        lodash.groupBy = groupBy;
        lodash.initial = initial;
        lodash.intersection = intersection;
        lodash.intersectionBy = intersectionBy;
        lodash.intersectionWith = intersectionWith;
        lodash.invert = invert;
        lodash.invertBy = invertBy;
        lodash.invokeMap = invokeMap;
        lodash.iteratee = iteratee;
        lodash.keyBy = keyBy;
        lodash.keys = keys;
        lodash.keysIn = keysIn;
        lodash.map = map;
        lodash.mapKeys = mapKeys;
        lodash.mapValues = mapValues;
        lodash.matches = matches;
        lodash.matchesProperty = matchesProperty;
        lodash.memoize = memoize;
        lodash.merge = merge;
        lodash.mergeWith = mergeWith;
        lodash.method = method;
        lodash.methodOf = methodOf;
        lodash.mixin = mixin;
        lodash.negate = negate;
        lodash.nthArg = nthArg;
        lodash.omit = omit;
        lodash.omitBy = omitBy;
        lodash.once = once;
        lodash.orderBy = orderBy;
        lodash.over = over;
        lodash.overArgs = overArgs;
        lodash.overEvery = overEvery;
        lodash.overSome = overSome;
        lodash.partial = partial;
        lodash.partialRight = partialRight;
        lodash.partition = partition;
        lodash.pick = pick;
        lodash.pickBy = pickBy;
        lodash.property = property;
        lodash.propertyOf = propertyOf;
        lodash.pull = pull;
        lodash.pullAll = pullAll;
        lodash.pullAllBy = pullAllBy;
        lodash.pullAllWith = pullAllWith;
        lodash.pullAt = pullAt;
        lodash.range = range;
        lodash.rangeRight = rangeRight;
        lodash.rearg = rearg;
        lodash.reject = reject;
        lodash.remove = remove;
        lodash.rest = rest;
        lodash.reverse = reverse;
        lodash.sampleSize = sampleSize;
        lodash.set = set;
        lodash.setWith = setWith;
        lodash.shuffle = shuffle;
        lodash.slice = slice;
        lodash.sortBy = sortBy;
        lodash.sortedUniq = sortedUniq;
        lodash.sortedUniqBy = sortedUniqBy;
        lodash.split = split;
        lodash.spread = spread;
        lodash.tail = tail;
        lodash.take = take;
        lodash.takeRight = takeRight;
        lodash.takeRightWhile = takeRightWhile;
        lodash.takeWhile = takeWhile;
        lodash.tap = tap;
        lodash.throttle = throttle;
        lodash.thru = thru;
        lodash.toArray = toArray;
        lodash.toPairs = toPairs;
        lodash.toPairsIn = toPairsIn;
        lodash.toPath = toPath;
        lodash.toPlainObject = toPlainObject;
        lodash.transform = transform;
        lodash.unary = unary;
        lodash.union = union;
        lodash.unionBy = unionBy;
        lodash.unionWith = unionWith;
        lodash.uniq = uniq;
        lodash.uniqBy = uniqBy;
        lodash.uniqWith = uniqWith;
        lodash.unset = unset;
        lodash.unzip = unzip;
        lodash.unzipWith = unzipWith;
        lodash.update = update;
        lodash.updateWith = updateWith;
        lodash.values = values;
        lodash.valuesIn = valuesIn;
        lodash.without = without;
        lodash.words = words;
        lodash.wrap = wrap;
        lodash.xor = xor;
        lodash.xorBy = xorBy;
        lodash.xorWith = xorWith;
        lodash.zip = zip;
        lodash.zipObject = zipObject;
        lodash.zipObjectDeep = zipObjectDeep;
        lodash.zipWith = zipWith;
        lodash.entries = toPairs;
        lodash.entriesIn = toPairsIn;
        lodash.extend = assignIn;
        lodash.extendWith = assignInWith;
        mixin(lodash, lodash);
        lodash.add = add;
        lodash.attempt = attempt;
        lodash.camelCase = camelCase;
        lodash.capitalize = capitalize;
        lodash.ceil = ceil;
        lodash.clamp = clamp;
        lodash.clone = clone;
        lodash.cloneDeep = cloneDeep;
        lodash.cloneDeepWith = cloneDeepWith;
        lodash.cloneWith = cloneWith;
        lodash.conformsTo = conformsTo;
        lodash.deburr = deburr;
        lodash.defaultTo = defaultTo;
        lodash.divide = divide;
        lodash.endsWith = endsWith;
        lodash.eq = eq;
        lodash.escape = escape;
        lodash.escapeRegExp = escapeRegExp;
        lodash.every = every;
        lodash.find = find;
        lodash.findIndex = findIndex;
        lodash.findKey = findKey;
        lodash.findLast = findLast;
        lodash.findLastIndex = findLastIndex;
        lodash.findLastKey = findLastKey;
        lodash.floor = floor;
        lodash.forEach = forEach;
        lodash.forEachRight = forEachRight;
        lodash.forIn = forIn;
        lodash.forInRight = forInRight;
        lodash.forOwn = forOwn;
        lodash.forOwnRight = forOwnRight;
        lodash.get = get;
        lodash.gt = gt;
        lodash.gte = gte;
        lodash.has = has;
        lodash.hasIn = hasIn;
        lodash.head = head;
        lodash.identity = identity;
        lodash.includes = includes;
        lodash.indexOf = indexOf;
        lodash.inRange = inRange;
        lodash.invoke = invoke;
        lodash.isArguments = isArguments;
        lodash.isArray = isArray;
        lodash.isArrayBuffer = isArrayBuffer;
        lodash.isArrayLike = isArrayLike;
        lodash.isArrayLikeObject = isArrayLikeObject;
        lodash.isBoolean = isBoolean;
        lodash.isBuffer = isBuffer;
        lodash.isDate = isDate;
        lodash.isElement = isElement;
        lodash.isEmpty = isEmpty;
        lodash.isEqual = isEqual;
        lodash.isEqualWith = isEqualWith;
        lodash.isError = isError;
        lodash.isFinite = isFinite2;
        lodash.isFunction = isFunction;
        lodash.isInteger = isInteger;
        lodash.isLength = isLength;
        lodash.isMap = isMap;
        lodash.isMatch = isMatch;
        lodash.isMatchWith = isMatchWith;
        lodash.isNaN = isNaN2;
        lodash.isNative = isNative;
        lodash.isNil = isNil;
        lodash.isNull = isNull;
        lodash.isNumber = isNumber;
        lodash.isObject = isObject;
        lodash.isObjectLike = isObjectLike;
        lodash.isPlainObject = isPlainObject;
        lodash.isRegExp = isRegExp;
        lodash.isSafeInteger = isSafeInteger;
        lodash.isSet = isSet;
        lodash.isString = isString;
        lodash.isSymbol = isSymbol;
        lodash.isTypedArray = isTypedArray;
        lodash.isUndefined = isUndefined;
        lodash.isWeakMap = isWeakMap;
        lodash.isWeakSet = isWeakSet;
        lodash.join = join;
        lodash.kebabCase = kebabCase;
        lodash.last = last;
        lodash.lastIndexOf = lastIndexOf;
        lodash.lowerCase = lowerCase;
        lodash.lowerFirst = lowerFirst;
        lodash.lt = lt;
        lodash.lte = lte;
        lodash.max = max;
        lodash.maxBy = maxBy;
        lodash.mean = mean;
        lodash.meanBy = meanBy;
        lodash.min = min;
        lodash.minBy = minBy;
        lodash.stubArray = stubArray;
        lodash.stubFalse = stubFalse;
        lodash.stubObject = stubObject;
        lodash.stubString = stubString;
        lodash.stubTrue = stubTrue;
        lodash.multiply = multiply;
        lodash.nth = nth;
        lodash.noConflict = noConflict;
        lodash.noop = noop;
        lodash.now = now;
        lodash.pad = pad;
        lodash.padEnd = padEnd;
        lodash.padStart = padStart;
        lodash.parseInt = parseInt2;
        lodash.random = random;
        lodash.reduce = reduce;
        lodash.reduceRight = reduceRight;
        lodash.repeat = repeat;
        lodash.replace = replace;
        lodash.result = result;
        lodash.round = round;
        lodash.runInContext = runInContext2;
        lodash.sample = sample;
        lodash.size = size;
        lodash.snakeCase = snakeCase;
        lodash.some = some;
        lodash.sortedIndex = sortedIndex;
        lodash.sortedIndexBy = sortedIndexBy;
        lodash.sortedIndexOf = sortedIndexOf;
        lodash.sortedLastIndex = sortedLastIndex;
        lodash.sortedLastIndexBy = sortedLastIndexBy;
        lodash.sortedLastIndexOf = sortedLastIndexOf;
        lodash.startCase = startCase;
        lodash.startsWith = startsWith;
        lodash.subtract = subtract;
        lodash.sum = sum;
        lodash.sumBy = sumBy;
        lodash.template = template;
        lodash.times = times;
        lodash.toFinite = toFinite;
        lodash.toInteger = toInteger;
        lodash.toLength = toLength;
        lodash.toLower = toLower;
        lodash.toNumber = toNumber;
        lodash.toSafeInteger = toSafeInteger;
        lodash.toString = toString;
        lodash.toUpper = toUpper;
        lodash.trim = trim;
        lodash.trimEnd = trimEnd;
        lodash.trimStart = trimStart;
        lodash.truncate = truncate;
        lodash.unescape = unescape;
        lodash.uniqueId = uniqueId;
        lodash.upperCase = upperCase;
        lodash.upperFirst = upperFirst;
        lodash.each = forEach;
        lodash.eachRight = forEachRight;
        lodash.first = head;
        mixin(lodash, (function() {
          var source = {};
          baseForOwn(lodash, function(func, methodName) {
            if (!hasOwnProperty.call(lodash.prototype, methodName)) {
              source[methodName] = func;
            }
          });
          return source;
        })(), { "chain": false });
        lodash.VERSION = VERSION;
        arrayEach(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(methodName) {
          lodash[methodName].placeholder = lodash;
        });
        arrayEach(["drop", "take"], function(methodName, index) {
          LazyWrapper.prototype[methodName] = function(n2) {
            n2 = n2 === undefined2 ? 1 : nativeMax(toInteger(n2), 0);
            var result2 = this.__filtered__ && !index ? new LazyWrapper(this) : this.clone();
            if (result2.__filtered__) {
              result2.__takeCount__ = nativeMin(n2, result2.__takeCount__);
            } else {
              result2.__views__.push({
                "size": nativeMin(n2, MAX_ARRAY_LENGTH),
                "type": methodName + (result2.__dir__ < 0 ? "Right" : "")
              });
            }
            return result2;
          };
          LazyWrapper.prototype[methodName + "Right"] = function(n2) {
            return this.reverse()[methodName](n2).reverse();
          };
        });
        arrayEach(["filter", "map", "takeWhile"], function(methodName, index) {
          var type = index + 1, isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;
          LazyWrapper.prototype[methodName] = function(iteratee2) {
            var result2 = this.clone();
            result2.__iteratees__.push({
              "iteratee": getIteratee(iteratee2, 3),
              "type": type
            });
            result2.__filtered__ = result2.__filtered__ || isFilter;
            return result2;
          };
        });
        arrayEach(["head", "last"], function(methodName, index) {
          var takeName = "take" + (index ? "Right" : "");
          LazyWrapper.prototype[methodName] = function() {
            return this[takeName](1).value()[0];
          };
        });
        arrayEach(["initial", "tail"], function(methodName, index) {
          var dropName = "drop" + (index ? "" : "Right");
          LazyWrapper.prototype[methodName] = function() {
            return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
          };
        });
        LazyWrapper.prototype.compact = function() {
          return this.filter(identity);
        };
        LazyWrapper.prototype.find = function(predicate) {
          return this.filter(predicate).head();
        };
        LazyWrapper.prototype.findLast = function(predicate) {
          return this.reverse().find(predicate);
        };
        LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
          if (typeof path == "function") {
            return new LazyWrapper(this);
          }
          return this.map(function(value) {
            return baseInvoke(value, path, args);
          });
        });
        LazyWrapper.prototype.reject = function(predicate) {
          return this.filter(negate(getIteratee(predicate)));
        };
        LazyWrapper.prototype.slice = function(start, end) {
          start = toInteger(start);
          var result2 = this;
          if (result2.__filtered__ && (start > 0 || end < 0)) {
            return new LazyWrapper(result2);
          }
          if (start < 0) {
            result2 = result2.takeRight(-start);
          } else if (start) {
            result2 = result2.drop(start);
          }
          if (end !== undefined2) {
            end = toInteger(end);
            result2 = end < 0 ? result2.dropRight(-end) : result2.take(end - start);
          }
          return result2;
        };
        LazyWrapper.prototype.takeRightWhile = function(predicate) {
          return this.reverse().takeWhile(predicate).reverse();
        };
        LazyWrapper.prototype.toArray = function() {
          return this.take(MAX_ARRAY_LENGTH);
        };
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
          var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName), isTaker = /^(?:head|last)$/.test(methodName), lodashFunc = lodash[isTaker ? "take" + (methodName == "last" ? "Right" : "") : methodName], retUnwrapped = isTaker || /^find/.test(methodName);
          if (!lodashFunc) {
            return;
          }
          lodash.prototype[methodName] = function() {
            var value = this.__wrapped__, args = isTaker ? [1] : arguments, isLazy = value instanceof LazyWrapper, iteratee2 = args[0], useLazy = isLazy || isArray(value);
            var interceptor = function(value2) {
              var result3 = lodashFunc.apply(lodash, arrayPush([value2], args));
              return isTaker && chainAll ? result3[0] : result3;
            };
            if (useLazy && checkIteratee && typeof iteratee2 == "function" && iteratee2.length != 1) {
              isLazy = useLazy = false;
            }
            var chainAll = this.__chain__, isHybrid = !!this.__actions__.length, isUnwrapped = retUnwrapped && !chainAll, onlyLazy = isLazy && !isHybrid;
            if (!retUnwrapped && useLazy) {
              value = onlyLazy ? value : new LazyWrapper(this);
              var result2 = func.apply(value, args);
              result2.__actions__.push({ "func": thru, "args": [interceptor], "thisArg": undefined2 });
              return new LodashWrapper(result2, chainAll);
            }
            if (isUnwrapped && onlyLazy) {
              return func.apply(this, args);
            }
            result2 = this.thru(interceptor);
            return isUnwrapped ? isTaker ? result2.value()[0] : result2.value() : result2;
          };
        });
        arrayEach(["pop", "push", "shift", "sort", "splice", "unshift"], function(methodName) {
          var func = arrayProto[methodName], chainName = /^(?:push|sort|unshift)$/.test(methodName) ? "tap" : "thru", retUnwrapped = /^(?:pop|shift)$/.test(methodName);
          lodash.prototype[methodName] = function() {
            var args = arguments;
            if (retUnwrapped && !this.__chain__) {
              var value = this.value();
              return func.apply(isArray(value) ? value : [], args);
            }
            return this[chainName](function(value2) {
              return func.apply(isArray(value2) ? value2 : [], args);
            });
          };
        });
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
          var lodashFunc = lodash[methodName];
          if (lodashFunc) {
            var key = lodashFunc.name + "";
            if (!hasOwnProperty.call(realNames, key)) {
              realNames[key] = [];
            }
            realNames[key].push({ "name": methodName, "func": lodashFunc });
          }
        });
        realNames[createHybrid(undefined2, WRAP_BIND_KEY_FLAG).name] = [{
          "name": "wrapper",
          "func": undefined2
        }];
        LazyWrapper.prototype.clone = lazyClone;
        LazyWrapper.prototype.reverse = lazyReverse;
        LazyWrapper.prototype.value = lazyValue;
        lodash.prototype.at = wrapperAt;
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.commit = wrapperCommit;
        lodash.prototype.next = wrapperNext;
        lodash.prototype.plant = wrapperPlant;
        lodash.prototype.reverse = wrapperReverse;
        lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
        lodash.prototype.first = lodash.prototype.head;
        if (symIterator) {
          lodash.prototype[symIterator] = wrapperToIterator;
        }
        return lodash;
      });
      var _2 = runInContext();
      if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        root._ = _2;
        define(function() {
          return _2;
        });
      } else if (freeModule) {
        (freeModule.exports = _2)._ = _2;
        freeExports._ = _2;
      } else {
        root._ = _2;
      }
    }).call(exports2);
  }
});

// node_modules/ohm-js/src/Failure.js
var require_Failure = __commonJS({
  "node_modules/ohm-js/src/Failure.js"(exports2, module2) {
    "use strict";
    function isValidType(type) {
      return type === "description" || type === "string" || type === "code";
    }
    function Failure(pexpr, text, type) {
      if (!isValidType(type)) {
        throw new Error("invalid Failure type: " + type);
      }
      this.pexpr = pexpr;
      this.text = text;
      this.type = type;
      this.fluffy = false;
    }
    Failure.prototype.getPExpr = function() {
      return this.pexpr;
    };
    Failure.prototype.getText = function() {
      return this.text;
    };
    Failure.prototype.getType = function() {
      return this.type;
    };
    Failure.prototype.isDescription = function() {
      return this.type === "description";
    };
    Failure.prototype.isStringTerminal = function() {
      return this.type === "string";
    };
    Failure.prototype.isCode = function() {
      return this.type === "code";
    };
    Failure.prototype.isFluffy = function() {
      return this.fluffy;
    };
    Failure.prototype.makeFluffy = function() {
      this.fluffy = true;
    };
    Failure.prototype.clearFluffy = function() {
      this.fluffy = false;
    };
    Failure.prototype.subsumes = function(that) {
      return this.getText() === that.getText() && this.type === that.type && (!this.isFluffy() || this.isFluffy() && that.isFluffy());
    };
    Failure.prototype.toString = function() {
      return this.type === "string" ? JSON.stringify(this.getText()) : this.getText();
    };
    Failure.prototype.clone = function() {
      const failure = new Failure(this.pexpr, this.text, this.type);
      if (this.isFluffy()) {
        failure.makeFluffy();
      }
      return failure;
    };
    Failure.prototype.toKey = function() {
      return this.toString() + "#" + this.type;
    };
    module2.exports = Failure;
  }
});

// node_modules/ohm-js/src/common.js
var require_common = __commonJS({
  "node_modules/ohm-js/src/common.js"(exports2) {
    "use strict";
    var escapeStringFor = {};
    for (let c2 = 0; c2 < 128; c2++) {
      escapeStringFor[c2] = String.fromCharCode(c2);
    }
    escapeStringFor["'".charCodeAt(0)] = "\\'";
    escapeStringFor['"'.charCodeAt(0)] = '\\"';
    escapeStringFor["\\".charCodeAt(0)] = "\\\\";
    escapeStringFor["\b".charCodeAt(0)] = "\\b";
    escapeStringFor["\f".charCodeAt(0)] = "\\f";
    escapeStringFor["\n".charCodeAt(0)] = "\\n";
    escapeStringFor["\r".charCodeAt(0)] = "\\r";
    escapeStringFor["	".charCodeAt(0)] = "\\t";
    escapeStringFor["\v".charCodeAt(0)] = "\\v";
    exports2.abstract = function(optMethodName) {
      const methodName = optMethodName || "";
      return function() {
        throw new Error(
          "this method " + methodName + " is abstract! (it has no implementation in class " + this.constructor.name + ")"
        );
      };
    };
    exports2.assert = function(cond, message) {
      if (!cond) {
        throw new Error(message || "Assertion failed");
      }
    };
    exports2.defineLazyProperty = function(obj, propName, getterFn) {
      let memo;
      Object.defineProperty(obj, propName, {
        get() {
          if (!memo) {
            memo = getterFn.call(this);
          }
          return memo;
        }
      });
    };
    exports2.clone = function(obj) {
      if (obj) {
        return Object.assign({}, obj);
      }
      return obj;
    };
    exports2.repeatFn = function(fn, n2) {
      const arr = [];
      while (n2-- > 0) {
        arr.push(fn());
      }
      return arr;
    };
    exports2.repeatStr = function(str, n2) {
      return new Array(n2 + 1).join(str);
    };
    exports2.repeat = function(x2, n2) {
      return exports2.repeatFn(() => x2, n2);
    };
    exports2.getDuplicates = function(array) {
      const duplicates = [];
      for (let idx = 0; idx < array.length; idx++) {
        const x2 = array[idx];
        if (array.lastIndexOf(x2) !== idx && duplicates.indexOf(x2) < 0) {
          duplicates.push(x2);
        }
      }
      return duplicates;
    };
    exports2.copyWithoutDuplicates = function(array) {
      const noDuplicates = [];
      array.forEach((entry) => {
        if (noDuplicates.indexOf(entry) < 0) {
          noDuplicates.push(entry);
        }
      });
      return noDuplicates;
    };
    exports2.isSyntactic = function(ruleName) {
      const firstChar = ruleName[0];
      return firstChar === firstChar.toUpperCase();
    };
    exports2.isLexical = function(ruleName) {
      return !exports2.isSyntactic(ruleName);
    };
    exports2.padLeft = function(str, len, optChar) {
      const ch = optChar || " ";
      if (str.length < len) {
        return exports2.repeatStr(ch, len - str.length) + str;
      }
      return str;
    };
    exports2.StringBuffer = function() {
      this.strings = [];
    };
    exports2.StringBuffer.prototype.append = function(str) {
      this.strings.push(str);
    };
    exports2.StringBuffer.prototype.contents = function() {
      return this.strings.join("");
    };
    var escapeUnicode = (str) => String.fromCodePoint(parseInt(str, 16));
    exports2.unescapeCodePoint = function(s2) {
      if (s2.charAt(0) === "\\") {
        switch (s2.charAt(1)) {
          case "b":
            return "\b";
          case "f":
            return "\f";
          case "n":
            return "\n";
          case "r":
            return "\r";
          case "t":
            return "	";
          case "v":
            return "\v";
          case "x":
            return escapeUnicode(s2.slice(2, 4));
          case "u":
            return s2.charAt(2) === "{" ? escapeUnicode(s2.slice(3, -1)) : escapeUnicode(s2.slice(2, 6));
          default:
            return s2.charAt(1);
        }
      } else {
        return s2;
      }
    };
    exports2.unexpectedObjToString = function(obj) {
      if (obj == null) {
        return String(obj);
      }
      const baseToString = Object.prototype.toString.call(obj);
      try {
        let typeName;
        if (obj.constructor && obj.constructor.name) {
          typeName = obj.constructor.name;
        } else if (baseToString.indexOf("[object ") === 0) {
          typeName = baseToString.slice(8, -1);
        } else {
          typeName = typeof obj;
        }
        return typeName + ": " + JSON.stringify(String(obj));
      } catch (e2) {
        return baseToString;
      }
    };
  }
});

// node_modules/ohm-js/src/nodes.js
var require_nodes = __commonJS({
  "node_modules/ohm-js/src/nodes.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var Node = class {
      constructor(matchLength) {
        this.matchLength = matchLength;
      }
      get ctorName() {
        throw new Error("subclass responsibility");
      }
      numChildren() {
        return this.children ? this.children.length : 0;
      }
      childAt(idx) {
        if (this.children) {
          return this.children[idx];
        }
      }
      indexOfChild(arg) {
        return this.children.indexOf(arg);
      }
      hasChildren() {
        return this.numChildren() > 0;
      }
      hasNoChildren() {
        return !this.hasChildren();
      }
      onlyChild() {
        if (this.numChildren() !== 1) {
          throw new Error(
            "cannot get only child of a node of type " + this.ctorName + " (it has " + this.numChildren() + " children)"
          );
        } else {
          return this.firstChild();
        }
      }
      firstChild() {
        if (this.hasNoChildren()) {
          throw new Error(
            "cannot get first child of a " + this.ctorName + " node, which has no children"
          );
        } else {
          return this.childAt(0);
        }
      }
      lastChild() {
        if (this.hasNoChildren()) {
          throw new Error(
            "cannot get last child of a " + this.ctorName + " node, which has no children"
          );
        } else {
          return this.childAt(this.numChildren() - 1);
        }
      }
      childBefore(child) {
        const childIdx = this.indexOfChild(child);
        if (childIdx < 0) {
          throw new Error("Node.childBefore() called w/ an argument that is not a child");
        } else if (childIdx === 0) {
          throw new Error("cannot get child before first child");
        } else {
          return this.childAt(childIdx - 1);
        }
      }
      childAfter(child) {
        const childIdx = this.indexOfChild(child);
        if (childIdx < 0) {
          throw new Error("Node.childAfter() called w/ an argument that is not a child");
        } else if (childIdx === this.numChildren() - 1) {
          throw new Error("cannot get child after last child");
        } else {
          return this.childAt(childIdx + 1);
        }
      }
      isTerminal() {
        return false;
      }
      isNonterminal() {
        return false;
      }
      isIteration() {
        return false;
      }
      isOptional() {
        return false;
      }
    };
    var TerminalNode = class extends Node {
      get ctorName() {
        return "_terminal";
      }
      isTerminal() {
        return true;
      }
      get primitiveValue() {
        throw new Error("The `primitiveValue` property was removed in Ohm v17.");
      }
    };
    var NonterminalNode = class extends Node {
      constructor(ruleName, children, childOffsets, matchLength) {
        super(matchLength);
        this.ruleName = ruleName;
        this.children = children;
        this.childOffsets = childOffsets;
      }
      get ctorName() {
        return this.ruleName;
      }
      isNonterminal() {
        return true;
      }
      isLexical() {
        return common.isLexical(this.ctorName);
      }
      isSyntactic() {
        return common.isSyntactic(this.ctorName);
      }
    };
    var IterationNode = class extends Node {
      constructor(children, childOffsets, matchLength, isOptional) {
        super(matchLength);
        this.children = children;
        this.childOffsets = childOffsets;
        this.optional = isOptional;
      }
      get ctorName() {
        return "_iter";
      }
      isIteration() {
        return true;
      }
      isOptional() {
        return this.optional;
      }
    };
    module2.exports = {
      Node,
      TerminalNode,
      NonterminalNode,
      IterationNode
    };
  }
});

// node_modules/ohm-js/third_party/UnicodeCategories.js
var require_UnicodeCategories = __commonJS({
  "node_modules/ohm-js/third_party/UnicodeCategories.js"(exports2, module2) {
    module2.exports = {
      // Letters
      Lu: /[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AE\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]|\uD801[\uDC00-\uDC27\uDCB0-\uDCD3]|\uD803[\uDC80-\uDCB2]|\uD806[\uDCA0-\uDCBF]|\uD835[\uDC00-\uDC19\uDC34-\uDC4D\uDC68-\uDC81\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB5\uDCD0-\uDCE9\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD38\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD6C-\uDD85\uDDA0-\uDDB9\uDDD4-\uDDED\uDE08-\uDE21\uDE3C-\uDE55\uDE70-\uDE89\uDEA8-\uDEC0\uDEE2-\uDEFA\uDF1C-\uDF34\uDF56-\uDF6E\uDF90-\uDFA8\uDFCA]|\uD83A[\uDD00-\uDD21]/,
      Ll: /[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1C80-\u1C88\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F\uDCD8-\uDCFB]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB]|\uD83A[\uDD22-\uDD43]/,
      Lt: /[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,
      Lm: /[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C\uA69D\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E\uFF9F]|\uD81A[\uDF40-\uDF43]|\uD81B[\uDF93-\uDF9F\uDFE0]/,
      Lo: /[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC50-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
      // Numbers
      Nl: /[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]|\uD800[\uDD40-\uDD74\uDF41\uDF4A\uDFD1-\uDFD5]|\uD809[\uDC00-\uDC6E]/,
      Nd: /[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]|\uD801[\uDCA0-\uDCA9]|\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDEF0-\uDEF9]|[\uD805\uD807][\uDC50-\uDC59\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF39]|\uD806[\uDCE0-\uDCE9]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59]|\uD835[\uDFCE-\uDFFF]|\uD83A[\uDD50-\uDD59]/,
      // Marks
      Mn: /[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]|\uD800[\uDDFD\uDEE0\uDF76-\uDF7A]|\uD802[\uDE01-\uDE03\uDE05\uDE06\uDE0C-\uDE0F\uDE38-\uDE3A\uDE3F\uDEE5\uDEE6]|\uD804[\uDC01\uDC38-\uDC46\uDC7F-\uDC81\uDCB3-\uDCB6\uDCB9\uDCBA\uDD00-\uDD02\uDD27-\uDD2B\uDD2D-\uDD34\uDD73\uDD80\uDD81\uDDB6-\uDDBE\uDDCA-\uDDCC\uDE2F-\uDE31\uDE34\uDE36\uDE37\uDE3E\uDEDF\uDEE3-\uDEEA\uDF00\uDF01\uDF3C\uDF40\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC38-\uDC3F\uDC42-\uDC44\uDC46\uDCB3-\uDCB8\uDCBA\uDCBF\uDCC0\uDCC2\uDCC3\uDDB2-\uDDB5\uDDBC\uDDBD\uDDBF\uDDC0\uDDDC\uDDDD\uDE33-\uDE3A\uDE3D\uDE3F\uDE40\uDEAB\uDEAD\uDEB0-\uDEB5\uDEB7\uDF1D-\uDF1F\uDF22-\uDF25\uDF27-\uDF2B]|\uD807[\uDC30-\uDC36\uDC38-\uDC3D\uDC3F\uDC92-\uDCA7\uDCAA-\uDCB0\uDCB2\uDCB3\uDCB5\uDCB6]|\uD81A[\uDEF0-\uDEF4\uDF30-\uDF36]|\uD81B[\uDF8F-\uDF92]|\uD82F[\uDC9D\uDC9E]|\uD834[\uDD67-\uDD69\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDCD0-\uDCD6\uDD44-\uDD4A]|\uDB40[\uDD00-\uDDEF]/,
      Mc: /[\u0903-\u0903]|[\u093E-\u0940]|[\u0949-\u094C]|[\u0982-\u0983]|[\u09BE-\u09C0]|[\u09C7-\u09C8]|[\u09CB-\u09CC]|[\u09D7-\u09D7]|[\u0A3E-\u0A40]|[\u0A83-\u0A83]|[\u0ABE-\u0AC0]|[\u0AC9-\u0AC9]|[\u0ACB-\u0ACC]|[\u0B02-\u0B03]|[\u0B3E-\u0B3E]|[\u0B40-\u0B40]|[\u0B47-\u0B48]|[\u0B4B-\u0B4C]|[\u0B57-\u0B57]|[\u0B83-\u0B83]|[\u0BBE-\u0BBF]|[\u0BC1-\u0BC2]|[\u0BC6-\u0BC8]|[\u0BCA-\u0BCC]|[\u0BD7-\u0BD7]|[\u0C01-\u0C03]|[\u0C41-\u0C44]|[\u0C82-\u0C83]|[\u0CBE-\u0CBE]|[\u0CC0-\u0CC4]|[\u0CC7-\u0CC8]|[\u0CCA-\u0CCB]|[\u0CD5-\u0CD6]|[\u0D02-\u0D03]|[\u0D3E-\u0D40]|[\u0D46-\u0D48]|[\u0D4A-\u0D4C]|[\u0D57-\u0D57]|[\u0F3E-\u0F3F]|[\u0F7F-\u0F7F]/,
      // Punctuation, Connector
      Pc: /[_\u203F\u2040\u2054\uFE33\uFE34\uFE4D-\uFE4F\uFF3F]/,
      // Separator, Space
      Zs: /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
      // These two are not real Unicode categories, but our useful for Ohm.
      // L is a combination of all the letter categories.
      // Ltmo is a combination of Lt, Lm, and Lo.
      L: /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
      Ltmo: /[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]|[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5\u06E6\u07F4\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C\uA69D\uA717-\uA71F\uA770\uA788\uA7F8\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E\uFF9F]|\uD81A[\uDF40-\uDF43]|\uD81B[\uDF93-\uDF9F\uDFE0]|[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E45\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF40\uDF42-\uDF49\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF]|\uD801[\uDC50-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/
    };
  }
});

// node_modules/ohm-js/src/pexprs-main.js
var require_pexprs_main = __commonJS({
  "node_modules/ohm-js/src/pexprs-main.js"(exports2) {
    "use strict";
    var UnicodeCategories = require_UnicodeCategories();
    var common = require_common();
    var PExpr = class _PExpr {
      constructor() {
        if (this.constructor === _PExpr) {
          throw new Error("PExpr cannot be instantiated -- it's abstract");
        }
      }
      // Set the `source` property to the interval containing the source for this expression.
      withSource(interval) {
        if (interval) {
          this.source = interval.trimmed();
        }
        return this;
      }
    };
    var any = Object.create(PExpr.prototype);
    var end = Object.create(PExpr.prototype);
    var Terminal = class extends PExpr {
      constructor(obj) {
        super();
        this.obj = obj;
      }
    };
    var Range = class extends PExpr {
      constructor(from, to) {
        super();
        this.from = from;
        this.to = to;
        this.matchCodePoint = from.length > 1 || to.length > 1;
      }
    };
    var Param = class extends PExpr {
      constructor(index) {
        super();
        this.index = index;
      }
    };
    var Alt = class extends PExpr {
      constructor(terms) {
        super();
        this.terms = terms;
      }
    };
    var Extend = class extends Alt {
      constructor(superGrammar, name, body) {
        const origBody = superGrammar.rules[name].body;
        super([body, origBody]);
        this.superGrammar = superGrammar;
        this.name = name;
        this.body = body;
      }
    };
    var Splice = class extends Alt {
      constructor(superGrammar, ruleName, beforeTerms, afterTerms) {
        const origBody = superGrammar.rules[ruleName].body;
        super([...beforeTerms, origBody, ...afterTerms]);
        this.superGrammar = superGrammar;
        this.ruleName = ruleName;
        this.expansionPos = beforeTerms.length;
      }
    };
    var Seq = class extends PExpr {
      constructor(factors) {
        super();
        this.factors = factors;
      }
    };
    var Iter = class extends PExpr {
      constructor(expr) {
        super();
        this.expr = expr;
      }
    };
    var Star = class extends Iter {
    };
    var Plus = class extends Iter {
    };
    var Opt = class extends Iter {
    };
    Star.prototype.operator = "*";
    Plus.prototype.operator = "+";
    Opt.prototype.operator = "?";
    Star.prototype.minNumMatches = 0;
    Plus.prototype.minNumMatches = 1;
    Opt.prototype.minNumMatches = 0;
    Star.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
    Plus.prototype.maxNumMatches = Number.POSITIVE_INFINITY;
    Opt.prototype.maxNumMatches = 1;
    var Not = class extends PExpr {
      constructor(expr) {
        super();
        this.expr = expr;
      }
    };
    var Lookahead = class extends PExpr {
      constructor(expr) {
        super();
        this.expr = expr;
      }
    };
    var Lex = class extends PExpr {
      constructor(expr) {
        super();
        this.expr = expr;
      }
    };
    var Apply = class extends PExpr {
      constructor(ruleName, args = []) {
        super();
        this.ruleName = ruleName;
        this.args = args;
      }
      isSyntactic() {
        return common.isSyntactic(this.ruleName);
      }
      // This method just caches the result of `this.toString()` in a non-enumerable property.
      toMemoKey() {
        if (!this._memoKey) {
          Object.defineProperty(this, "_memoKey", { value: this.toString() });
        }
        return this._memoKey;
      }
    };
    var UnicodeChar = class extends PExpr {
      constructor(category) {
        super();
        this.category = category;
        this.pattern = UnicodeCategories[category];
      }
    };
    exports2.PExpr = PExpr;
    exports2.any = any;
    exports2.end = end;
    exports2.Terminal = Terminal;
    exports2.Range = Range;
    exports2.Param = Param;
    exports2.Alt = Alt;
    exports2.Extend = Extend;
    exports2.Splice = Splice;
    exports2.Seq = Seq;
    exports2.Iter = Iter;
    exports2.Star = Star;
    exports2.Plus = Plus;
    exports2.Opt = Opt;
    exports2.Not = Not;
    exports2.Lookahead = Lookahead;
    exports2.Lex = Lex;
    exports2.Apply = Apply;
    exports2.UnicodeChar = UnicodeChar;
  }
});

// node_modules/ohm-js/src/pexprs-allowsSkippingPrecedingSpace.js
var require_pexprs_allowsSkippingPrecedingSpace = __commonJS({
  "node_modules/ohm-js/src/pexprs-allowsSkippingPrecedingSpace.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.allowsSkippingPrecedingSpace = common.abstract(
      "allowsSkippingPrecedingSpace"
    );
    pexprs.any.allowsSkippingPrecedingSpace = pexprs.end.allowsSkippingPrecedingSpace = pexprs.Apply.prototype.allowsSkippingPrecedingSpace = pexprs.Terminal.prototype.allowsSkippingPrecedingSpace = pexprs.Range.prototype.allowsSkippingPrecedingSpace = pexprs.UnicodeChar.prototype.allowsSkippingPrecedingSpace = function() {
      return true;
    };
    pexprs.Alt.prototype.allowsSkippingPrecedingSpace = pexprs.Iter.prototype.allowsSkippingPrecedingSpace = pexprs.Lex.prototype.allowsSkippingPrecedingSpace = pexprs.Lookahead.prototype.allowsSkippingPrecedingSpace = pexprs.Not.prototype.allowsSkippingPrecedingSpace = pexprs.Param.prototype.allowsSkippingPrecedingSpace = pexprs.Seq.prototype.allowsSkippingPrecedingSpace = function() {
      return false;
    };
  }
});

// node_modules/ohm-js/src/Namespace.js
var require_Namespace = __commonJS({
  "node_modules/ohm-js/src/Namespace.js"(exports2, module2) {
    "use strict";
    function Namespace() {
    }
    Namespace.prototype = /* @__PURE__ */ Object.create(null);
    Namespace.asNamespace = function(objOrNamespace) {
      if (objOrNamespace instanceof Namespace) {
        return objOrNamespace;
      }
      return Namespace.createNamespace(objOrNamespace);
    };
    Namespace.createNamespace = function(optProps) {
      return Namespace.extend(Namespace.prototype, optProps);
    };
    Namespace.extend = function(namespace, optProps) {
      if (namespace !== Namespace.prototype && !(namespace instanceof Namespace)) {
        throw new TypeError("not a Namespace object: " + namespace);
      }
      const ns = Object.create(namespace, {
        constructor: {
          value: Namespace,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return Object.assign(ns, optProps);
    };
    Namespace.toString = function(ns) {
      return Object.prototype.toString.call(ns);
    };
    module2.exports = Namespace;
  }
});

// node_modules/ohm-js/src/errors.js
var require_errors = __commonJS({
  "node_modules/ohm-js/src/errors.js"(exports2, module2) {
    "use strict";
    var { assert } = require_common();
    var Namespace = require_Namespace();
    var pexprs = require_pexprs_main();
    function createError(message, optInterval) {
      let e2;
      if (optInterval) {
        e2 = new Error(optInterval.getLineAndColumnMessage() + message);
        e2.shortMessage = message;
        e2.interval = optInterval;
      } else {
        e2 = new Error(message);
      }
      return e2;
    }
    function intervalSourcesDontMatch() {
      return createError("Interval sources don't match");
    }
    function grammarSyntaxError(matchFailure) {
      const e2 = new Error();
      Object.defineProperty(e2, "message", {
        enumerable: true,
        get() {
          return matchFailure.message;
        }
      });
      Object.defineProperty(e2, "shortMessage", {
        enumerable: true,
        get() {
          return "Expected " + matchFailure.getExpectedText();
        }
      });
      e2.interval = matchFailure.getInterval();
      return e2;
    }
    function undeclaredGrammar(grammarName, namespace, interval) {
      const message = namespace ? "Grammar " + grammarName + " is not declared in namespace " + Namespace.toString(namespace) : "Undeclared grammar " + grammarName;
      return createError(message, interval);
    }
    function duplicateGrammarDeclaration(grammar, namespace) {
      return createError("Grammar " + grammar.name + " is already declared in this namespace");
    }
    function undeclaredRule(ruleName, grammarName, optInterval) {
      return createError(
        "Rule " + ruleName + " is not declared in grammar " + grammarName,
        optInterval
      );
    }
    function cannotOverrideUndeclaredRule(ruleName, grammarName, optSource) {
      return createError(
        "Cannot override rule " + ruleName + " because it is not declared in " + grammarName,
        optSource
      );
    }
    function cannotExtendUndeclaredRule(ruleName, grammarName, optSource) {
      return createError(
        "Cannot extend rule " + ruleName + " because it is not declared in " + grammarName,
        optSource
      );
    }
    function duplicateRuleDeclaration(ruleName, grammarName, declGrammarName, optSource) {
      let message = "Duplicate declaration for rule '" + ruleName + "' in grammar '" + grammarName + "'";
      if (grammarName !== declGrammarName) {
        message += " (originally declared in '" + declGrammarName + "')";
      }
      return createError(message, optSource);
    }
    function wrongNumberOfParameters(ruleName, expected, actual, source) {
      return createError(
        "Wrong number of parameters for rule " + ruleName + " (expected " + expected + ", got " + actual + ")",
        source
      );
    }
    function wrongNumberOfArguments(ruleName, expected, actual, expr) {
      return createError(
        "Wrong number of arguments for rule " + ruleName + " (expected " + expected + ", got " + actual + ")",
        expr
      );
    }
    function duplicateParameterNames(ruleName, duplicates, source) {
      return createError(
        "Duplicate parameter names in rule " + ruleName + ": " + duplicates.join(", "),
        source
      );
    }
    function invalidParameter(ruleName, expr) {
      return createError(
        "Invalid parameter to rule " + ruleName + ": " + expr + " has arity " + expr.getArity() + ", but parameter expressions must have arity 1",
        expr.source
      );
    }
    var syntacticVsLexicalNote = "NOTE: A _syntactic rule_ is a rule whose name begins with a capital letter. See https://ohmjs.org/d/svl for more details.";
    function applicationOfSyntacticRuleFromLexicalContext(ruleName, applyExpr) {
      return createError(
        "Cannot apply syntactic rule " + ruleName + " from here (inside a lexical context)",
        applyExpr.source
      );
    }
    function applySyntacticWithLexicalRuleApplication(applyExpr) {
      const { ruleName } = applyExpr;
      return createError(
        `applySyntactic is for syntactic rules, but '${ruleName}' is a lexical rule. ` + syntacticVsLexicalNote,
        applyExpr.source
      );
    }
    function unnecessaryExperimentalApplySyntactic(applyExpr) {
      return createError(
        "applySyntactic is not required here (in a syntactic context)",
        applyExpr.source
      );
    }
    function incorrectArgumentType(expectedType, expr) {
      return createError("Incorrect argument type: expected " + expectedType, expr.source);
    }
    function multipleSuperSplices(expr) {
      return createError("'...' can appear at most once in a rule body", expr.source);
    }
    function invalidCodePoint(applyWrapper) {
      const node = applyWrapper._node;
      assert(node && node.isNonterminal() && node.ctorName === "escapeChar_unicodeCodePoint");
      const digitIntervals = applyWrapper.children.slice(1, -1).map((d2) => d2.source);
      const fullInterval = digitIntervals[0].coverageWith(...digitIntervals.slice(1));
      return createError(
        `U+${fullInterval.contents} is not a valid Unicode code point`,
        fullInterval
      );
    }
    function kleeneExprHasNullableOperand(kleeneExpr, applicationStack) {
      const actuals = applicationStack.length > 0 ? applicationStack[applicationStack.length - 1].args : [];
      const expr = kleeneExpr.expr.substituteParams(actuals);
      let message = "Nullable expression " + expr + " is not allowed inside '" + kleeneExpr.operator + "' (possible infinite loop)";
      if (applicationStack.length > 0) {
        const stackTrace = applicationStack.map((app) => new pexprs.Apply(app.ruleName, app.args)).join("\n");
        message += "\nApplication stack (most recent application last):\n" + stackTrace;
      }
      return createError(message, kleeneExpr.expr.source);
    }
    function inconsistentArity(ruleName, expected, actual, expr) {
      return createError(
        "Rule " + ruleName + " involves an alternation which has inconsistent arity (expected " + expected + ", got " + actual + ")",
        expr.source
      );
    }
    function duplicatePropertyNames(duplicates) {
      return createError("Object pattern has duplicate property names: " + duplicates.join(", "));
    }
    function invalidConstructorCall(grammar, ctorName, children) {
      return createError(
        "Attempt to invoke constructor " + ctorName + " with invalid or unexpected arguments"
      );
    }
    function multipleErrors(errors) {
      const messages = errors.map((e2) => e2.message);
      return createError(["Errors:"].concat(messages).join("\n- "), errors[0].interval);
    }
    function missingSemanticAction(ctorName, name, type, stack) {
      let stackTrace = stack.slice(0, -1).map((info) => {
        const ans = "  " + info[0].name + " > " + info[1];
        return info.length === 3 ? ans + " for '" + info[2] + "'" : ans;
      }).join("\n");
      stackTrace += "\n  " + name + " > " + ctorName;
      let moreInfo = "";
      if (ctorName === "_iter") {
        moreInfo = [
          "\nNOTE: as of Ohm v16, there is no default action for iteration nodes \u2014 see ",
          "  https://ohmjs.org/d/dsa for details."
        ].join("\n");
      }
      const message = [
        `Missing semantic action for '${ctorName}' in ${type} '${name}'.${moreInfo}`,
        "Action stack (most recent call last):",
        stackTrace
      ].join("\n");
      const e2 = createError(message);
      e2.name = "missingSemanticAction";
      return e2;
    }
    module2.exports = {
      applicationOfSyntacticRuleFromLexicalContext,
      applySyntacticWithLexicalRuleApplication,
      cannotExtendUndeclaredRule,
      cannotOverrideUndeclaredRule,
      duplicateGrammarDeclaration,
      duplicateParameterNames,
      duplicatePropertyNames,
      duplicateRuleDeclaration,
      inconsistentArity,
      incorrectArgumentType,
      intervalSourcesDontMatch,
      invalidCodePoint,
      invalidConstructorCall,
      invalidParameter,
      grammarSyntaxError,
      kleeneExprHasNullableOperand,
      missingSemanticAction,
      multipleSuperSplices,
      undeclaredGrammar,
      undeclaredRule,
      unnecessaryExperimentalApplySyntactic,
      wrongNumberOfArguments,
      wrongNumberOfParameters,
      throwErrors(errors) {
        if (errors.length === 1) {
          throw errors[0];
        }
        if (errors.length > 1) {
          throw multipleErrors(errors);
        }
      }
    };
  }
});

// node_modules/ohm-js/src/util.js
var require_util = __commonJS({
  "node_modules/ohm-js/src/util.js"(exports2) {
    "use strict";
    var common = require_common();
    function padNumbersToEqualLength(arr) {
      let maxLen = 0;
      const strings = arr.map((n2) => {
        const str = n2.toString();
        maxLen = Math.max(maxLen, str.length);
        return str;
      });
      return strings.map((s2) => common.padLeft(s2, maxLen));
    }
    function strcpy(dest, src, offset) {
      const origDestLen = dest.length;
      const start = dest.slice(0, offset);
      const end = dest.slice(offset + src.length);
      return (start + src + end).substr(0, origDestLen);
    }
    function lineAndColumnToMessage(...ranges) {
      const lineAndCol = this;
      const { offset } = lineAndCol;
      const { repeatStr } = common;
      const sb = new common.StringBuffer();
      sb.append("Line " + lineAndCol.lineNum + ", col " + lineAndCol.colNum + ":\n");
      const lineNumbers = padNumbersToEqualLength([
        lineAndCol.prevLine == null ? 0 : lineAndCol.lineNum - 1,
        lineAndCol.lineNum,
        lineAndCol.nextLine == null ? 0 : lineAndCol.lineNum + 1
      ]);
      const appendLine = (num, content, prefix) => {
        sb.append(prefix + lineNumbers[num] + " | " + content + "\n");
      };
      if (lineAndCol.prevLine != null) {
        appendLine(0, lineAndCol.prevLine, "  ");
      }
      appendLine(1, lineAndCol.line, "> ");
      const lineLen = lineAndCol.line.length;
      let indicationLine = repeatStr(" ", lineLen + 1);
      for (let i2 = 0; i2 < ranges.length; ++i2) {
        let startIdx = ranges[i2][0];
        let endIdx = ranges[i2][1];
        common.assert(startIdx >= 0 && startIdx <= endIdx, "range start must be >= 0 and <= end");
        const lineStartOffset = offset - lineAndCol.colNum + 1;
        startIdx = Math.max(0, startIdx - lineStartOffset);
        endIdx = Math.min(endIdx - lineStartOffset, lineLen);
        indicationLine = strcpy(indicationLine, repeatStr("~", endIdx - startIdx), startIdx);
      }
      const gutterWidth = 2 + lineNumbers[1].length + 3;
      sb.append(repeatStr(" ", gutterWidth));
      indicationLine = strcpy(indicationLine, "^", lineAndCol.colNum - 1);
      sb.append(indicationLine.replace(/ +$/, "") + "\n");
      if (lineAndCol.nextLine != null) {
        appendLine(2, lineAndCol.nextLine, "  ");
      }
      return sb.contents();
    }
    var builtInRulesCallbacks = [];
    exports2.awaitBuiltInRules = (cb) => {
      builtInRulesCallbacks.push(cb);
    };
    exports2.announceBuiltInRules = (grammar) => {
      builtInRulesCallbacks.forEach((cb) => {
        cb(grammar);
      });
      builtInRulesCallbacks = null;
    };
    exports2.getLineAndColumn = (str, offset) => {
      let lineNum = 1;
      let colNum = 1;
      let currOffset = 0;
      let lineStartOffset = 0;
      let nextLine = null;
      let prevLine = null;
      let prevLineStartOffset = -1;
      while (currOffset < offset) {
        const c2 = str.charAt(currOffset++);
        if (c2 === "\n") {
          lineNum++;
          colNum = 1;
          prevLineStartOffset = lineStartOffset;
          lineStartOffset = currOffset;
        } else if (c2 !== "\r") {
          colNum++;
        }
      }
      let lineEndOffset = str.indexOf("\n", lineStartOffset);
      if (lineEndOffset === -1) {
        lineEndOffset = str.length;
      } else {
        const nextLineEndOffset = str.indexOf("\n", lineEndOffset + 1);
        nextLine = nextLineEndOffset === -1 ? str.slice(lineEndOffset) : str.slice(lineEndOffset, nextLineEndOffset);
        nextLine = nextLine.replace(/^\r?\n/, "").replace(/\r$/, "");
      }
      if (prevLineStartOffset >= 0) {
        prevLine = str.slice(prevLineStartOffset, lineStartOffset).replace(/\r?\n$/, "");
      }
      const line = str.slice(lineStartOffset, lineEndOffset).replace(/\r$/, "");
      return {
        offset,
        lineNum,
        colNum,
        line,
        prevLine,
        nextLine,
        toString: lineAndColumnToMessage
      };
    };
    exports2.getLineAndColumnMessage = function(str, offset, ...ranges) {
      return exports2.getLineAndColumn(str, offset).toString(...ranges);
    };
    exports2.uniqueId = /* @__PURE__ */ (() => {
      let idCounter = 0;
      return (prefix) => "" + prefix + idCounter++;
    })();
  }
});

// node_modules/ohm-js/src/pexprs-assertAllApplicationsAreValid.js
var require_pexprs_assertAllApplicationsAreValid = __commonJS({
  "node_modules/ohm-js/src/pexprs-assertAllApplicationsAreValid.js"() {
    "use strict";
    var { abstract, isSyntactic } = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs_main();
    var util = require_util();
    var BuiltInRules;
    util.awaitBuiltInRules((g2) => {
      BuiltInRules = g2;
    });
    var lexifyCount;
    pexprs.PExpr.prototype.assertAllApplicationsAreValid = function(ruleName, grammar) {
      lexifyCount = 0;
      this._assertAllApplicationsAreValid(ruleName, grammar);
    };
    pexprs.PExpr.prototype._assertAllApplicationsAreValid = abstract(
      "_assertAllApplicationsAreValid"
    );
    pexprs.any._assertAllApplicationsAreValid = pexprs.end._assertAllApplicationsAreValid = pexprs.Terminal.prototype._assertAllApplicationsAreValid = pexprs.Range.prototype._assertAllApplicationsAreValid = pexprs.Param.prototype._assertAllApplicationsAreValid = pexprs.UnicodeChar.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
    };
    pexprs.Lex.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
      lexifyCount++;
      this.expr._assertAllApplicationsAreValid(ruleName, grammar);
      lexifyCount--;
    };
    pexprs.Alt.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
      for (let idx = 0; idx < this.terms.length; idx++) {
        this.terms[idx]._assertAllApplicationsAreValid(ruleName, grammar);
      }
    };
    pexprs.Seq.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
      for (let idx = 0; idx < this.factors.length; idx++) {
        this.factors[idx]._assertAllApplicationsAreValid(ruleName, grammar);
      }
    };
    pexprs.Iter.prototype._assertAllApplicationsAreValid = pexprs.Not.prototype._assertAllApplicationsAreValid = pexprs.Lookahead.prototype._assertAllApplicationsAreValid = function(ruleName, grammar) {
      this.expr._assertAllApplicationsAreValid(ruleName, grammar);
    };
    pexprs.Apply.prototype._assertAllApplicationsAreValid = function(ruleName, grammar, skipSyntacticCheck = false) {
      const ruleInfo = grammar.rules[this.ruleName];
      const isContextSyntactic = isSyntactic(ruleName) && lexifyCount === 0;
      if (!ruleInfo) {
        throw errors.undeclaredRule(this.ruleName, grammar.name, this.source);
      }
      if (!skipSyntacticCheck && isSyntactic(this.ruleName) && !isContextSyntactic) {
        throw errors.applicationOfSyntacticRuleFromLexicalContext(this.ruleName, this);
      }
      const actual = this.args.length;
      const expected = ruleInfo.formals.length;
      if (actual !== expected) {
        throw errors.wrongNumberOfArguments(this.ruleName, expected, actual, this.source);
      }
      const isBuiltInApplySyntactic = BuiltInRules && ruleInfo === BuiltInRules.rules.applySyntactic;
      const isBuiltInCaseInsensitive = BuiltInRules && ruleInfo === BuiltInRules.rules.caseInsensitive;
      if (isBuiltInCaseInsensitive) {
        if (!(this.args[0] instanceof pexprs.Terminal)) {
          throw errors.incorrectArgumentType('a Terminal (e.g. "abc")', this.args[0]);
        }
      }
      if (isBuiltInApplySyntactic) {
        const arg = this.args[0];
        if (!(arg instanceof pexprs.Apply)) {
          throw errors.incorrectArgumentType("a syntactic rule application", arg);
        }
        if (!isSyntactic(arg.ruleName)) {
          throw errors.applySyntacticWithLexicalRuleApplication(arg);
        }
        if (isContextSyntactic) {
          throw errors.unnecessaryExperimentalApplySyntactic(this);
        }
      }
      this.args.forEach((arg) => {
        arg._assertAllApplicationsAreValid(ruleName, grammar, isBuiltInApplySyntactic);
        if (arg.getArity() !== 1) {
          throw errors.invalidParameter(this.ruleName, arg);
        }
      });
    };
  }
});

// node_modules/ohm-js/src/pexprs-assertChoicesHaveUniformArity.js
var require_pexprs_assertChoicesHaveUniformArity = __commonJS({
  "node_modules/ohm-js/src/pexprs-assertChoicesHaveUniformArity.js"() {
    "use strict";
    var common = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.assertChoicesHaveUniformArity = common.abstract(
      "assertChoicesHaveUniformArity"
    );
    pexprs.any.assertChoicesHaveUniformArity = pexprs.end.assertChoicesHaveUniformArity = pexprs.Terminal.prototype.assertChoicesHaveUniformArity = pexprs.Range.prototype.assertChoicesHaveUniformArity = pexprs.Param.prototype.assertChoicesHaveUniformArity = pexprs.Lex.prototype.assertChoicesHaveUniformArity = pexprs.UnicodeChar.prototype.assertChoicesHaveUniformArity = function(ruleName) {
    };
    pexprs.Alt.prototype.assertChoicesHaveUniformArity = function(ruleName) {
      if (this.terms.length === 0) {
        return;
      }
      const arity = this.terms[0].getArity();
      for (let idx = 0; idx < this.terms.length; idx++) {
        const term = this.terms[idx];
        term.assertChoicesHaveUniformArity();
        const otherArity = term.getArity();
        if (arity !== otherArity) {
          throw errors.inconsistentArity(ruleName, arity, otherArity, term);
        }
      }
    };
    pexprs.Extend.prototype.assertChoicesHaveUniformArity = function(ruleName) {
      const actualArity = this.terms[0].getArity();
      const expectedArity = this.terms[1].getArity();
      if (actualArity !== expectedArity) {
        throw errors.inconsistentArity(ruleName, expectedArity, actualArity, this.terms[0]);
      }
    };
    pexprs.Seq.prototype.assertChoicesHaveUniformArity = function(ruleName) {
      for (let idx = 0; idx < this.factors.length; idx++) {
        this.factors[idx].assertChoicesHaveUniformArity(ruleName);
      }
    };
    pexprs.Iter.prototype.assertChoicesHaveUniformArity = function(ruleName) {
      this.expr.assertChoicesHaveUniformArity(ruleName);
    };
    pexprs.Not.prototype.assertChoicesHaveUniformArity = function(ruleName) {
    };
    pexprs.Lookahead.prototype.assertChoicesHaveUniformArity = function(ruleName) {
      this.expr.assertChoicesHaveUniformArity(ruleName);
    };
    pexprs.Apply.prototype.assertChoicesHaveUniformArity = function(ruleName) {
    };
  }
});

// node_modules/ohm-js/src/pexprs-assertIteratedExprsAreNotNullable.js
var require_pexprs_assertIteratedExprsAreNotNullable = __commonJS({
  "node_modules/ohm-js/src/pexprs-assertIteratedExprsAreNotNullable.js"() {
    "use strict";
    var common = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.assertIteratedExprsAreNotNullable = common.abstract(
      "assertIteratedExprsAreNotNullable"
    );
    pexprs.any.assertIteratedExprsAreNotNullable = pexprs.end.assertIteratedExprsAreNotNullable = pexprs.Terminal.prototype.assertIteratedExprsAreNotNullable = pexprs.Range.prototype.assertIteratedExprsAreNotNullable = pexprs.Param.prototype.assertIteratedExprsAreNotNullable = pexprs.UnicodeChar.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
    };
    pexprs.Alt.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
      for (let idx = 0; idx < this.terms.length; idx++) {
        this.terms[idx].assertIteratedExprsAreNotNullable(grammar);
      }
    };
    pexprs.Seq.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
      for (let idx = 0; idx < this.factors.length; idx++) {
        this.factors[idx].assertIteratedExprsAreNotNullable(grammar);
      }
    };
    pexprs.Iter.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
      this.expr.assertIteratedExprsAreNotNullable(grammar);
      if (this.expr.isNullable(grammar)) {
        throw errors.kleeneExprHasNullableOperand(this, []);
      }
    };
    pexprs.Opt.prototype.assertIteratedExprsAreNotNullable = pexprs.Not.prototype.assertIteratedExprsAreNotNullable = pexprs.Lookahead.prototype.assertIteratedExprsAreNotNullable = pexprs.Lex.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
      this.expr.assertIteratedExprsAreNotNullable(grammar);
    };
    pexprs.Apply.prototype.assertIteratedExprsAreNotNullable = function(grammar) {
      this.args.forEach((arg) => {
        arg.assertIteratedExprsAreNotNullable(grammar);
      });
    };
  }
});

// node_modules/ohm-js/src/Interval.js
var require_Interval = __commonJS({
  "node_modules/ohm-js/src/Interval.js"(exports2, module2) {
    "use strict";
    var { assert } = require_common();
    var errors = require_errors();
    var util = require_util();
    function Interval(sourceString, startIdx, endIdx) {
      this.sourceString = sourceString;
      this.startIdx = startIdx;
      this.endIdx = endIdx;
    }
    Interval.coverage = function(firstInterval, ...intervals) {
      let { startIdx, endIdx } = firstInterval;
      for (const interval of intervals) {
        if (interval.sourceString !== firstInterval.sourceString) {
          throw errors.intervalSourcesDontMatch();
        } else {
          startIdx = Math.min(startIdx, interval.startIdx);
          endIdx = Math.max(endIdx, interval.endIdx);
        }
      }
      return new Interval(firstInterval.sourceString, startIdx, endIdx);
    };
    Interval.prototype = {
      coverageWith(...intervals) {
        return Interval.coverage(...intervals, this);
      },
      collapsedLeft() {
        return new Interval(this.sourceString, this.startIdx, this.startIdx);
      },
      collapsedRight() {
        return new Interval(this.sourceString, this.endIdx, this.endIdx);
      },
      getLineAndColumn() {
        return util.getLineAndColumn(this.sourceString, this.startIdx);
      },
      getLineAndColumnMessage() {
        const range = [this.startIdx, this.endIdx];
        return util.getLineAndColumnMessage(this.sourceString, this.startIdx, range);
      },
      // Returns an array of 0, 1, or 2 intervals that represents the result of the
      // interval difference operation.
      minus(that) {
        if (this.sourceString !== that.sourceString) {
          throw errors.intervalSourcesDontMatch();
        } else if (this.startIdx === that.startIdx && this.endIdx === that.endIdx) {
          return [];
        } else if (this.startIdx < that.startIdx && that.endIdx < this.endIdx) {
          return [
            new Interval(this.sourceString, this.startIdx, that.startIdx),
            new Interval(this.sourceString, that.endIdx, this.endIdx)
          ];
        } else if (this.startIdx < that.endIdx && that.endIdx < this.endIdx) {
          return [new Interval(this.sourceString, that.endIdx, this.endIdx)];
        } else if (this.startIdx < that.startIdx && that.startIdx < this.endIdx) {
          return [new Interval(this.sourceString, this.startIdx, that.startIdx)];
        } else {
          return [this];
        }
      },
      // Returns a new Interval that has the same extent as this one, but which is relative
      // to `that`, an Interval that fully covers this one.
      relativeTo(that) {
        if (this.sourceString !== that.sourceString) {
          throw errors.intervalSourcesDontMatch();
        }
        assert(
          this.startIdx >= that.startIdx && this.endIdx <= that.endIdx,
          "other interval does not cover this one"
        );
        return new Interval(
          this.sourceString,
          this.startIdx - that.startIdx,
          this.endIdx - that.startIdx
        );
      },
      // Returns a new Interval which contains the same contents as this one,
      // but with whitespace trimmed from both ends.
      trimmed() {
        const { contents } = this;
        const startIdx = this.startIdx + contents.match(/^\s*/)[0].length;
        const endIdx = this.endIdx - contents.match(/\s*$/)[0].length;
        return new Interval(this.sourceString, startIdx, endIdx);
      },
      subInterval(offset, len) {
        const newStartIdx = this.startIdx + offset;
        return new Interval(this.sourceString, newStartIdx, newStartIdx + len);
      }
    };
    Object.defineProperties(Interval.prototype, {
      contents: {
        get() {
          if (this._contents === void 0) {
            this._contents = this.sourceString.slice(this.startIdx, this.endIdx);
          }
          return this._contents;
        },
        enumerable: true
      },
      length: {
        get() {
          return this.endIdx - this.startIdx;
        },
        enumerable: true
      }
    });
    module2.exports = Interval;
  }
});

// node_modules/ohm-js/src/Trace.js
var require_Trace = __commonJS({
  "node_modules/ohm-js/src/Trace.js"(exports2, module2) {
    "use strict";
    var Interval = require_Interval();
    var common = require_common();
    var BALLOT_X = "\u2717";
    var CHECK_MARK = "\u2713";
    var DOT_OPERATOR = "\u22C5";
    var RIGHTWARDS_DOUBLE_ARROW = "\u21D2";
    var SYMBOL_FOR_HORIZONTAL_TABULATION = "\u2409";
    var SYMBOL_FOR_LINE_FEED = "\u240A";
    var SYMBOL_FOR_CARRIAGE_RETURN = "\u240D";
    var Flags = {
      succeeded: 1 << 0,
      isRootNode: 1 << 1,
      isImplicitSpaces: 1 << 2,
      isMemoized: 1 << 3,
      isHeadOfLeftRecursion: 1 << 4,
      terminatesLR: 1 << 5
    };
    function spaces(n2) {
      return common.repeat(" ", n2).join("");
    }
    function getInputExcerpt(input, pos, len) {
      const excerpt = asEscapedString(input.slice(pos, pos + len));
      if (excerpt.length < len) {
        return excerpt + common.repeat(" ", len - excerpt.length).join("");
      }
      return excerpt;
    }
    function asEscapedString(obj) {
      if (typeof obj === "string") {
        return obj.replace(/ /g, DOT_OPERATOR).replace(/\t/g, SYMBOL_FOR_HORIZONTAL_TABULATION).replace(/\n/g, SYMBOL_FOR_LINE_FEED).replace(/\r/g, SYMBOL_FOR_CARRIAGE_RETURN);
      }
      return String(obj);
    }
    function Trace(input, pos1, pos2, expr, succeeded, bindings, optChildren) {
      this.input = input;
      this.pos = this.pos1 = pos1;
      this.pos2 = pos2;
      this.source = new Interval(input, pos1, pos2);
      this.expr = expr;
      this.bindings = bindings;
      this.children = optChildren || [];
      this.terminatingLREntry = null;
      this._flags = succeeded ? Flags.succeeded : 0;
    }
    Trace.prototype.SKIP = {};
    Object.defineProperty(Trace.prototype, "displayString", {
      get() {
        return this.expr.toDisplayString();
      }
    });
    Object.keys(Flags).forEach((name) => {
      const mask = Flags[name];
      Object.defineProperty(Trace.prototype, name, {
        get() {
          return (this._flags & mask) !== 0;
        },
        set(val) {
          if (val) {
            this._flags |= mask;
          } else {
            this._flags &= ~mask;
          }
        }
      });
    });
    Trace.prototype.clone = function() {
      return this.cloneWithExpr(this.expr);
    };
    Trace.prototype.cloneWithExpr = function(expr) {
      const ans = new Trace(
        this.input,
        this.pos,
        this.pos2,
        expr,
        this.succeeded,
        this.bindings,
        this.children
      );
      ans.isHeadOfLeftRecursion = this.isHeadOfLeftRecursion;
      ans.isImplicitSpaces = this.isImplicitSpaces;
      ans.isMemoized = this.isMemoized;
      ans.isRootNode = this.isRootNode;
      ans.terminatesLR = this.terminatesLR;
      ans.terminatingLREntry = this.terminatingLREntry;
      return ans;
    };
    Trace.prototype.recordLRTermination = function(ruleBodyTrace, value) {
      this.terminatingLREntry = new Trace(
        this.input,
        this.pos,
        this.pos2,
        this.expr,
        false,
        [value],
        [ruleBodyTrace]
      );
      this.terminatingLREntry.terminatesLR = true;
    };
    Trace.prototype.walk = function(visitorObjOrFn, optThisArg) {
      let visitor = visitorObjOrFn;
      if (typeof visitor === "function") {
        visitor = { enter: visitor };
      }
      function _walk(node, parent, depth) {
        let recurse = true;
        if (visitor.enter) {
          if (visitor.enter.call(optThisArg, node, parent, depth) === Trace.prototype.SKIP) {
            recurse = false;
          }
        }
        if (recurse) {
          node.children.forEach((child) => {
            _walk(child, node, depth + 1);
          });
          if (visitor.exit) {
            visitor.exit.call(optThisArg, node, parent, depth);
          }
        }
      }
      if (this.isRootNode) {
        this.children.forEach((c2) => {
          _walk(c2, null, 0);
        });
      } else {
        _walk(this, null, 0);
      }
    };
    Trace.prototype.toString = function() {
      const sb = new common.StringBuffer();
      this.walk((node, parent, depth) => {
        if (!node) {
          return this.SKIP;
        }
        const ctorName = node.expr.constructor.name;
        if (ctorName === "Alt") {
          return;
        }
        sb.append(getInputExcerpt(node.input, node.pos, 10) + spaces(depth * 2 + 1));
        sb.append((node.succeeded ? CHECK_MARK : BALLOT_X) + " " + node.displayString);
        if (node.isHeadOfLeftRecursion) {
          sb.append(" (LR)");
        }
        if (node.succeeded) {
          const contents = asEscapedString(node.source.contents);
          sb.append(" " + RIGHTWARDS_DOUBLE_ARROW + "  ");
          sb.append(typeof contents === "string" ? '"' + contents + '"' : contents);
        }
        sb.append("\n");
      });
      return sb.contents();
    };
    module2.exports = Trace;
  }
});

// node_modules/ohm-js/src/pexprs-eval.js
var require_pexprs_eval = __commonJS({
  "node_modules/ohm-js/src/pexprs-eval.js"() {
    "use strict";
    var Trace = require_Trace();
    var common = require_common();
    var errors = require_errors();
    var nodes = require_nodes();
    var pexprs = require_pexprs_main();
    var { TerminalNode } = nodes;
    var { NonterminalNode } = nodes;
    var { IterationNode } = nodes;
    pexprs.PExpr.prototype.eval = common.abstract("eval");
    pexprs.any.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      const ch = inputStream.next();
      if (ch) {
        state.pushBinding(new TerminalNode(ch.length), origPos);
        return true;
      } else {
        state.processFailure(origPos, this);
        return false;
      }
    };
    pexprs.end.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      if (inputStream.atEnd()) {
        state.pushBinding(new TerminalNode(0), origPos);
        return true;
      } else {
        state.processFailure(origPos, this);
        return false;
      }
    };
    pexprs.Terminal.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      if (!inputStream.matchString(this.obj)) {
        state.processFailure(origPos, this);
        return false;
      } else {
        state.pushBinding(new TerminalNode(this.obj.length), origPos);
        return true;
      }
    };
    pexprs.Range.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      const cp = this.matchCodePoint ? inputStream.nextCodePoint() : inputStream.nextCharCode();
      if (cp !== void 0 && this.from.codePointAt(0) <= cp && cp <= this.to.codePointAt(0)) {
        state.pushBinding(new TerminalNode(String.fromCodePoint(cp).length), origPos);
        return true;
      } else {
        state.processFailure(origPos, this);
        return false;
      }
    };
    pexprs.Param.prototype.eval = function(state) {
      return state.eval(state.currentApplication().args[this.index]);
    };
    pexprs.Lex.prototype.eval = function(state) {
      state.enterLexifiedContext();
      const ans = state.eval(this.expr);
      state.exitLexifiedContext();
      return ans;
    };
    pexprs.Alt.prototype.eval = function(state) {
      for (let idx = 0; idx < this.terms.length; idx++) {
        if (state.eval(this.terms[idx])) {
          return true;
        }
      }
      return false;
    };
    pexprs.Seq.prototype.eval = function(state) {
      for (let idx = 0; idx < this.factors.length; idx++) {
        const factor = this.factors[idx];
        if (!state.eval(factor)) {
          return false;
        }
      }
      return true;
    };
    pexprs.Iter.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      const arity = this.getArity();
      const cols = [];
      const colOffsets = [];
      while (cols.length < arity) {
        cols.push([]);
        colOffsets.push([]);
      }
      let numMatches = 0;
      let prevPos = origPos;
      let idx;
      while (numMatches < this.maxNumMatches && state.eval(this.expr)) {
        if (inputStream.pos === prevPos) {
          throw errors.kleeneExprHasNullableOperand(this, state._applicationStack);
        }
        prevPos = inputStream.pos;
        numMatches++;
        const row = state._bindings.splice(state._bindings.length - arity, arity);
        const rowOffsets = state._bindingOffsets.splice(
          state._bindingOffsets.length - arity,
          arity
        );
        for (idx = 0; idx < row.length; idx++) {
          cols[idx].push(row[idx]);
          colOffsets[idx].push(rowOffsets[idx]);
        }
      }
      if (numMatches < this.minNumMatches) {
        return false;
      }
      let offset = state.posToOffset(origPos);
      let matchLength = 0;
      if (numMatches > 0) {
        const lastCol = cols[arity - 1];
        const lastColOffsets = colOffsets[arity - 1];
        const endOffset = lastColOffsets[lastColOffsets.length - 1] + lastCol[lastCol.length - 1].matchLength;
        offset = colOffsets[0][0];
        matchLength = endOffset - offset;
      }
      const isOptional = this instanceof pexprs.Opt;
      for (idx = 0; idx < cols.length; idx++) {
        state._bindings.push(
          new IterationNode(cols[idx], colOffsets[idx], matchLength, isOptional)
        );
        state._bindingOffsets.push(offset);
      }
      return true;
    };
    pexprs.Not.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      state.pushFailuresInfo();
      const ans = state.eval(this.expr);
      state.popFailuresInfo();
      if (ans) {
        state.processFailure(origPos, this);
        return false;
      }
      inputStream.pos = origPos;
      return true;
    };
    pexprs.Lookahead.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      if (state.eval(this.expr)) {
        inputStream.pos = origPos;
        return true;
      } else {
        return false;
      }
    };
    pexprs.Apply.prototype.eval = function(state) {
      const caller = state.currentApplication();
      const actuals = caller ? caller.args : [];
      const app = this.substituteParams(actuals);
      const posInfo = state.getCurrentPosInfo();
      if (posInfo.isActive(app)) {
        return app.handleCycle(state);
      }
      const memoKey = app.toMemoKey();
      const memoRec = posInfo.memo[memoKey];
      if (memoRec && posInfo.shouldUseMemoizedResult(memoRec)) {
        if (state.hasNecessaryInfo(memoRec)) {
          return state.useMemoizedResult(state.inputStream.pos, memoRec);
        }
        delete posInfo.memo[memoKey];
      }
      return app.reallyEval(state);
    };
    pexprs.Apply.prototype.handleCycle = function(state) {
      const posInfo = state.getCurrentPosInfo();
      const { currentLeftRecursion } = posInfo;
      const memoKey = this.toMemoKey();
      let memoRec = posInfo.memo[memoKey];
      if (currentLeftRecursion && currentLeftRecursion.headApplication.toMemoKey() === memoKey) {
        memoRec.updateInvolvedApplicationMemoKeys();
      } else if (!memoRec) {
        memoRec = posInfo.memoize(memoKey, {
          matchLength: 0,
          examinedLength: 0,
          value: false,
          rightmostFailureOffset: -1
        });
        posInfo.startLeftRecursion(this, memoRec);
      }
      return state.useMemoizedResult(state.inputStream.pos, memoRec);
    };
    pexprs.Apply.prototype.reallyEval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      const origPosInfo = state.getCurrentPosInfo();
      const ruleInfo = state.grammar.rules[this.ruleName];
      const { body } = ruleInfo;
      const { description } = ruleInfo;
      state.enterApplication(origPosInfo, this);
      if (description) {
        state.pushFailuresInfo();
      }
      const origInputStreamExaminedLength = inputStream.examinedLength;
      inputStream.examinedLength = 0;
      let value = this.evalOnce(body, state);
      const currentLR = origPosInfo.currentLeftRecursion;
      const memoKey = this.toMemoKey();
      const isHeadOfLeftRecursion = currentLR && currentLR.headApplication.toMemoKey() === memoKey;
      let memoRec;
      if (isHeadOfLeftRecursion) {
        value = this.growSeedResult(body, state, origPos, currentLR, value);
        origPosInfo.endLeftRecursion();
        memoRec = currentLR;
        memoRec.examinedLength = inputStream.examinedLength - origPos;
        memoRec.rightmostFailureOffset = state._getRightmostFailureOffset();
        origPosInfo.memoize(memoKey, memoRec);
      } else if (!currentLR || !currentLR.isInvolved(memoKey)) {
        memoRec = origPosInfo.memoize(memoKey, {
          matchLength: inputStream.pos - origPos,
          examinedLength: inputStream.examinedLength - origPos,
          value,
          failuresAtRightmostPosition: state.cloneRecordedFailures(),
          rightmostFailureOffset: state._getRightmostFailureOffset()
        });
      }
      const succeeded = !!value;
      if (description) {
        state.popFailuresInfo();
        if (!succeeded) {
          state.processFailure(origPos, this);
        }
        if (memoRec) {
          memoRec.failuresAtRightmostPosition = state.cloneRecordedFailures();
        }
      }
      if (state.isTracing() && memoRec) {
        const entry = state.getTraceEntry(origPos, this, succeeded, succeeded ? [value] : []);
        if (isHeadOfLeftRecursion) {
          common.assert(entry.terminatingLREntry != null || !succeeded);
          entry.isHeadOfLeftRecursion = true;
        }
        memoRec.traceEntry = entry;
      }
      inputStream.examinedLength = Math.max(
        inputStream.examinedLength,
        origInputStreamExaminedLength
      );
      state.exitApplication(origPosInfo, value);
      return succeeded;
    };
    pexprs.Apply.prototype.evalOnce = function(expr, state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      if (state.eval(expr)) {
        const arity = expr.getArity();
        const bindings = state._bindings.splice(state._bindings.length - arity, arity);
        const offsets = state._bindingOffsets.splice(state._bindingOffsets.length - arity, arity);
        const matchLength = inputStream.pos - origPos;
        return new NonterminalNode(this.ruleName, bindings, offsets, matchLength);
      } else {
        return false;
      }
    };
    pexprs.Apply.prototype.growSeedResult = function(body, state, origPos, lrMemoRec, newValue) {
      if (!newValue) {
        return false;
      }
      const { inputStream } = state;
      while (true) {
        lrMemoRec.matchLength = inputStream.pos - origPos;
        lrMemoRec.value = newValue;
        lrMemoRec.failuresAtRightmostPosition = state.cloneRecordedFailures();
        if (state.isTracing()) {
          const seedTrace = state.trace[state.trace.length - 1];
          lrMemoRec.traceEntry = new Trace(
            state.input,
            origPos,
            inputStream.pos,
            this,
            true,
            [newValue],
            [seedTrace.clone()]
          );
        }
        inputStream.pos = origPos;
        newValue = this.evalOnce(body, state);
        if (inputStream.pos - origPos <= lrMemoRec.matchLength) {
          break;
        }
        if (state.isTracing()) {
          state.trace.splice(-2, 1);
        }
      }
      if (state.isTracing()) {
        lrMemoRec.traceEntry.recordLRTermination(state.trace.pop(), newValue);
      }
      inputStream.pos = origPos + lrMemoRec.matchLength;
      return lrMemoRec.value;
    };
    pexprs.UnicodeChar.prototype.eval = function(state) {
      const { inputStream } = state;
      const origPos = inputStream.pos;
      const ch = inputStream.next();
      if (ch && this.pattern.test(ch)) {
        state.pushBinding(new TerminalNode(ch.length), origPos);
        return true;
      } else {
        state.processFailure(origPos, this);
        return false;
      }
    };
  }
});

// node_modules/ohm-js/src/pexprs-getArity.js
var require_pexprs_getArity = __commonJS({
  "node_modules/ohm-js/src/pexprs-getArity.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.getArity = common.abstract("getArity");
    pexprs.any.getArity = pexprs.end.getArity = pexprs.Terminal.prototype.getArity = pexprs.Range.prototype.getArity = pexprs.Param.prototype.getArity = pexprs.Apply.prototype.getArity = pexprs.UnicodeChar.prototype.getArity = function() {
      return 1;
    };
    pexprs.Alt.prototype.getArity = function() {
      return this.terms.length === 0 ? 0 : this.terms[0].getArity();
    };
    pexprs.Seq.prototype.getArity = function() {
      let arity = 0;
      for (let idx = 0; idx < this.factors.length; idx++) {
        arity += this.factors[idx].getArity();
      }
      return arity;
    };
    pexprs.Iter.prototype.getArity = function() {
      return this.expr.getArity();
    };
    pexprs.Not.prototype.getArity = function() {
      return 0;
    };
    pexprs.Lookahead.prototype.getArity = pexprs.Lex.prototype.getArity = function() {
      return this.expr.getArity();
    };
  }
});

// node_modules/ohm-js/src/pexprs-outputRecipe.js
var require_pexprs_outputRecipe = __commonJS({
  "node_modules/ohm-js/src/pexprs-outputRecipe.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    function getMetaInfo(expr, grammarInterval) {
      const metaInfo = {};
      if (expr.source && grammarInterval) {
        const adjusted = expr.source.relativeTo(grammarInterval);
        metaInfo.sourceInterval = [adjusted.startIdx, adjusted.endIdx];
      }
      return metaInfo;
    }
    pexprs.PExpr.prototype.outputRecipe = common.abstract("outputRecipe");
    pexprs.any.outputRecipe = function(formals, grammarInterval) {
      return ["any", getMetaInfo(this, grammarInterval)];
    };
    pexprs.end.outputRecipe = function(formals, grammarInterval) {
      return ["end", getMetaInfo(this, grammarInterval)];
    };
    pexprs.Terminal.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["terminal", getMetaInfo(this, grammarInterval), this.obj];
    };
    pexprs.Range.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["range", getMetaInfo(this, grammarInterval), this.from, this.to];
    };
    pexprs.Param.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["param", getMetaInfo(this, grammarInterval), this.index];
    };
    pexprs.Alt.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["alt", getMetaInfo(this, grammarInterval)].concat(
        this.terms.map((term) => term.outputRecipe(formals, grammarInterval))
      );
    };
    pexprs.Extend.prototype.outputRecipe = function(formals, grammarInterval) {
      const extension = this.terms[0];
      return extension.outputRecipe(formals, grammarInterval);
    };
    pexprs.Splice.prototype.outputRecipe = function(formals, grammarInterval) {
      const beforeTerms = this.terms.slice(0, this.expansionPos);
      const afterTerms = this.terms.slice(this.expansionPos + 1);
      return [
        "splice",
        getMetaInfo(this, grammarInterval),
        beforeTerms.map((term) => term.outputRecipe(formals, grammarInterval)),
        afterTerms.map((term) => term.outputRecipe(formals, grammarInterval))
      ];
    };
    pexprs.Seq.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["seq", getMetaInfo(this, grammarInterval)].concat(
        this.factors.map((factor) => factor.outputRecipe(formals, grammarInterval))
      );
    };
    pexprs.Star.prototype.outputRecipe = pexprs.Plus.prototype.outputRecipe = pexprs.Opt.prototype.outputRecipe = pexprs.Not.prototype.outputRecipe = pexprs.Lookahead.prototype.outputRecipe = pexprs.Lex.prototype.outputRecipe = function(formals, grammarInterval) {
      return [
        this.constructor.name.toLowerCase(),
        getMetaInfo(this, grammarInterval),
        this.expr.outputRecipe(formals, grammarInterval)
      ];
    };
    pexprs.Apply.prototype.outputRecipe = function(formals, grammarInterval) {
      return [
        "app",
        getMetaInfo(this, grammarInterval),
        this.ruleName,
        this.args.map((arg) => arg.outputRecipe(formals, grammarInterval))
      ];
    };
    pexprs.UnicodeChar.prototype.outputRecipe = function(formals, grammarInterval) {
      return ["unicodeChar", getMetaInfo(this, grammarInterval), this.category];
    };
  }
});

// node_modules/ohm-js/src/pexprs-introduceParams.js
var require_pexprs_introduceParams = __commonJS({
  "node_modules/ohm-js/src/pexprs-introduceParams.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.introduceParams = common.abstract("introduceParams");
    pexprs.any.introduceParams = pexprs.end.introduceParams = pexprs.Terminal.prototype.introduceParams = pexprs.Range.prototype.introduceParams = pexprs.Param.prototype.introduceParams = pexprs.UnicodeChar.prototype.introduceParams = function(formals) {
      return this;
    };
    pexprs.Alt.prototype.introduceParams = function(formals) {
      this.terms.forEach((term, idx, terms) => {
        terms[idx] = term.introduceParams(formals);
      });
      return this;
    };
    pexprs.Seq.prototype.introduceParams = function(formals) {
      this.factors.forEach((factor, idx, factors) => {
        factors[idx] = factor.introduceParams(formals);
      });
      return this;
    };
    pexprs.Iter.prototype.introduceParams = pexprs.Not.prototype.introduceParams = pexprs.Lookahead.prototype.introduceParams = pexprs.Lex.prototype.introduceParams = function(formals) {
      this.expr = this.expr.introduceParams(formals);
      return this;
    };
    pexprs.Apply.prototype.introduceParams = function(formals) {
      const index = formals.indexOf(this.ruleName);
      if (index >= 0) {
        if (this.args.length > 0) {
          throw new Error("Parameterized rules cannot be passed as arguments to another rule.");
        }
        return new pexprs.Param(index).withSource(this.source);
      } else {
        this.args.forEach((arg, idx, args) => {
          args[idx] = arg.introduceParams(formals);
        });
        return this;
      }
    };
  }
});

// node_modules/ohm-js/src/pexprs-isNullable.js
var require_pexprs_isNullable = __commonJS({
  "node_modules/ohm-js/src/pexprs-isNullable.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.isNullable = function(grammar) {
      return this._isNullable(grammar, /* @__PURE__ */ Object.create(null));
    };
    pexprs.PExpr.prototype._isNullable = common.abstract("_isNullable");
    pexprs.any._isNullable = pexprs.Range.prototype._isNullable = pexprs.Param.prototype._isNullable = pexprs.Plus.prototype._isNullable = pexprs.UnicodeChar.prototype._isNullable = function(grammar, memo) {
      return false;
    };
    pexprs.end._isNullable = function(grammar, memo) {
      return true;
    };
    pexprs.Terminal.prototype._isNullable = function(grammar, memo) {
      if (typeof this.obj === "string") {
        return this.obj === "";
      } else {
        return false;
      }
    };
    pexprs.Alt.prototype._isNullable = function(grammar, memo) {
      return this.terms.length === 0 || this.terms.some((term) => term._isNullable(grammar, memo));
    };
    pexprs.Seq.prototype._isNullable = function(grammar, memo) {
      return this.factors.every((factor) => factor._isNullable(grammar, memo));
    };
    pexprs.Star.prototype._isNullable = pexprs.Opt.prototype._isNullable = pexprs.Not.prototype._isNullable = pexprs.Lookahead.prototype._isNullable = function(grammar, memo) {
      return true;
    };
    pexprs.Lex.prototype._isNullable = function(grammar, memo) {
      return this.expr._isNullable(grammar, memo);
    };
    pexprs.Apply.prototype._isNullable = function(grammar, memo) {
      const key = this.toMemoKey();
      if (!Object.prototype.hasOwnProperty.call(memo, key)) {
        const { body } = grammar.rules[this.ruleName];
        const inlined = body.substituteParams(this.args);
        memo[key] = false;
        memo[key] = inlined._isNullable(grammar, memo);
      }
      return memo[key];
    };
  }
});

// node_modules/ohm-js/src/pexprs-substituteParams.js
var require_pexprs_substituteParams = __commonJS({
  "node_modules/ohm-js/src/pexprs-substituteParams.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.substituteParams = common.abstract("substituteParams");
    pexprs.any.substituteParams = pexprs.end.substituteParams = pexprs.Terminal.prototype.substituteParams = pexprs.Range.prototype.substituteParams = pexprs.UnicodeChar.prototype.substituteParams = function(actuals) {
      return this;
    };
    pexprs.Param.prototype.substituteParams = function(actuals) {
      return actuals[this.index];
    };
    pexprs.Alt.prototype.substituteParams = function(actuals) {
      return new pexprs.Alt(this.terms.map((term) => term.substituteParams(actuals)));
    };
    pexprs.Seq.prototype.substituteParams = function(actuals) {
      return new pexprs.Seq(this.factors.map((factor) => factor.substituteParams(actuals)));
    };
    pexprs.Iter.prototype.substituteParams = pexprs.Not.prototype.substituteParams = pexprs.Lookahead.prototype.substituteParams = pexprs.Lex.prototype.substituteParams = function(actuals) {
      return new this.constructor(this.expr.substituteParams(actuals));
    };
    pexprs.Apply.prototype.substituteParams = function(actuals) {
      if (this.args.length === 0) {
        return this;
      } else {
        const args = this.args.map((arg) => arg.substituteParams(actuals));
        return new pexprs.Apply(this.ruleName, args);
      }
    };
  }
});

// node_modules/ohm-js/src/pexprs-toArgumentNameList.js
var require_pexprs_toArgumentNameList = __commonJS({
  "node_modules/ohm-js/src/pexprs-toArgumentNameList.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    var { copyWithoutDuplicates } = common;
    function isRestrictedJSIdentifier(str) {
      return /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(str);
    }
    function resolveDuplicatedNames(argumentNameList) {
      const count = /* @__PURE__ */ Object.create(null);
      argumentNameList.forEach((argName) => {
        count[argName] = (count[argName] || 0) + 1;
      });
      Object.keys(count).forEach((dupArgName) => {
        if (count[dupArgName] <= 1) {
          return;
        }
        let subscript = 1;
        argumentNameList.forEach((argName, idx) => {
          if (argName === dupArgName) {
            argumentNameList[idx] = argName + "_" + subscript++;
          }
        });
      });
    }
    pexprs.PExpr.prototype.toArgumentNameList = common.abstract("toArgumentNameList");
    pexprs.any.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return ["any"];
    };
    pexprs.end.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return ["end"];
    };
    pexprs.Terminal.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      if (typeof this.obj === "string" && /^[_a-zA-Z0-9]+$/.test(this.obj)) {
        return ["_" + this.obj];
      } else {
        return ["$" + firstArgIndex];
      }
    };
    pexprs.Range.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      let argName = this.from + "_to_" + this.to;
      if (!isRestrictedJSIdentifier(argName)) {
        argName = "_" + argName;
      }
      if (!isRestrictedJSIdentifier(argName)) {
        argName = "$" + firstArgIndex;
      }
      return [argName];
    };
    pexprs.Alt.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      const termArgNameLists = this.terms.map(
        (term) => term.toArgumentNameList(firstArgIndex, true)
      );
      const argumentNameList = [];
      const numArgs = termArgNameLists[0].length;
      for (let colIdx = 0; colIdx < numArgs; colIdx++) {
        const col = [];
        for (let rowIdx = 0; rowIdx < this.terms.length; rowIdx++) {
          col.push(termArgNameLists[rowIdx][colIdx]);
        }
        const uniqueNames = copyWithoutDuplicates(col);
        argumentNameList.push(uniqueNames.join("_or_"));
      }
      if (!noDupCheck) {
        resolveDuplicatedNames(argumentNameList);
      }
      return argumentNameList;
    };
    pexprs.Seq.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      let argumentNameList = [];
      this.factors.forEach((factor) => {
        const factorArgumentNameList = factor.toArgumentNameList(firstArgIndex, true);
        argumentNameList = argumentNameList.concat(factorArgumentNameList);
        firstArgIndex += factorArgumentNameList.length;
      });
      if (!noDupCheck) {
        resolveDuplicatedNames(argumentNameList);
      }
      return argumentNameList;
    };
    pexprs.Iter.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      const argumentNameList = this.expr.toArgumentNameList(firstArgIndex, noDupCheck).map(
        (exprArgumentString) => exprArgumentString[exprArgumentString.length - 1] === "s" ? exprArgumentString + "es" : exprArgumentString + "s"
      );
      if (!noDupCheck) {
        resolveDuplicatedNames(argumentNameList);
      }
      return argumentNameList;
    };
    pexprs.Opt.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return this.expr.toArgumentNameList(firstArgIndex, noDupCheck).map((argName) => {
        return "opt" + argName[0].toUpperCase() + argName.slice(1);
      });
    };
    pexprs.Not.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return [];
    };
    pexprs.Lookahead.prototype.toArgumentNameList = pexprs.Lex.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return this.expr.toArgumentNameList(firstArgIndex, noDupCheck);
    };
    pexprs.Apply.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return [this.ruleName];
    };
    pexprs.UnicodeChar.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return ["$" + firstArgIndex];
    };
    pexprs.Param.prototype.toArgumentNameList = function(firstArgIndex, noDupCheck) {
      return ["param" + this.index];
    };
  }
});

// node_modules/ohm-js/src/pexprs-toDisplayString.js
var require_pexprs_toDisplayString = __commonJS({
  "node_modules/ohm-js/src/pexprs-toDisplayString.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.toDisplayString = common.abstract("toDisplayString");
    pexprs.Alt.prototype.toDisplayString = pexprs.Seq.prototype.toDisplayString = function() {
      if (this.source) {
        return this.source.trimmed().contents;
      }
      return "[" + this.constructor.name + "]";
    };
    pexprs.any.toDisplayString = pexprs.end.toDisplayString = pexprs.Iter.prototype.toDisplayString = pexprs.Not.prototype.toDisplayString = pexprs.Lookahead.prototype.toDisplayString = pexprs.Lex.prototype.toDisplayString = pexprs.Terminal.prototype.toDisplayString = pexprs.Range.prototype.toDisplayString = pexprs.Param.prototype.toDisplayString = function() {
      return this.toString();
    };
    pexprs.Apply.prototype.toDisplayString = function() {
      if (this.args.length > 0) {
        const ps = this.args.map((arg) => arg.toDisplayString());
        return this.ruleName + "<" + ps.join(",") + ">";
      } else {
        return this.ruleName;
      }
    };
    pexprs.UnicodeChar.prototype.toDisplayString = function() {
      return "Unicode [" + this.category + "] character";
    };
  }
});

// node_modules/ohm-js/src/pexprs-toFailure.js
var require_pexprs_toFailure = __commonJS({
  "node_modules/ohm-js/src/pexprs-toFailure.js"() {
    "use strict";
    var Failure = require_Failure();
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.toFailure = common.abstract("toFailure");
    pexprs.any.toFailure = function(grammar) {
      return new Failure(this, "any object", "description");
    };
    pexprs.end.toFailure = function(grammar) {
      return new Failure(this, "end of input", "description");
    };
    pexprs.Terminal.prototype.toFailure = function(grammar) {
      return new Failure(this, this.obj, "string");
    };
    pexprs.Range.prototype.toFailure = function(grammar) {
      return new Failure(this, JSON.stringify(this.from) + ".." + JSON.stringify(this.to), "code");
    };
    pexprs.Not.prototype.toFailure = function(grammar) {
      const description = this.expr === pexprs.any ? "nothing" : "not " + this.expr.toFailure(grammar);
      return new Failure(this, description, "description");
    };
    pexprs.Lookahead.prototype.toFailure = function(grammar) {
      return this.expr.toFailure(grammar);
    };
    pexprs.Apply.prototype.toFailure = function(grammar) {
      let { description } = grammar.rules[this.ruleName];
      if (!description) {
        const article = /^[aeiouAEIOU]/.test(this.ruleName) ? "an" : "a";
        description = article + " " + this.ruleName;
      }
      return new Failure(this, description, "description");
    };
    pexprs.UnicodeChar.prototype.toFailure = function(grammar) {
      return new Failure(this, "a Unicode [" + this.category + "] character", "description");
    };
    pexprs.Alt.prototype.toFailure = function(grammar) {
      const fs = this.terms.map((t2) => t2.toFailure(grammar));
      const description = "(" + fs.join(" or ") + ")";
      return new Failure(this, description, "description");
    };
    pexprs.Seq.prototype.toFailure = function(grammar) {
      const fs = this.factors.map((f2) => f2.toFailure(grammar));
      const description = "(" + fs.join(" ") + ")";
      return new Failure(this, description, "description");
    };
    pexprs.Iter.prototype.toFailure = function(grammar) {
      const description = "(" + this.expr.toFailure(grammar) + this.operator + ")";
      return new Failure(this, description, "description");
    };
  }
});

// node_modules/ohm-js/src/pexprs-toString.js
var require_pexprs_toString = __commonJS({
  "node_modules/ohm-js/src/pexprs-toString.js"() {
    "use strict";
    var common = require_common();
    var pexprs = require_pexprs_main();
    pexprs.PExpr.prototype.toString = common.abstract("toString");
    pexprs.any.toString = function() {
      return "any";
    };
    pexprs.end.toString = function() {
      return "end";
    };
    pexprs.Terminal.prototype.toString = function() {
      return JSON.stringify(this.obj);
    };
    pexprs.Range.prototype.toString = function() {
      return JSON.stringify(this.from) + ".." + JSON.stringify(this.to);
    };
    pexprs.Param.prototype.toString = function() {
      return "$" + this.index;
    };
    pexprs.Lex.prototype.toString = function() {
      return "#(" + this.expr.toString() + ")";
    };
    pexprs.Alt.prototype.toString = function() {
      return this.terms.length === 1 ? this.terms[0].toString() : "(" + this.terms.map((term) => term.toString()).join(" | ") + ")";
    };
    pexprs.Seq.prototype.toString = function() {
      return this.factors.length === 1 ? this.factors[0].toString() : "(" + this.factors.map((factor) => factor.toString()).join(" ") + ")";
    };
    pexprs.Iter.prototype.toString = function() {
      return this.expr + this.operator;
    };
    pexprs.Not.prototype.toString = function() {
      return "~" + this.expr;
    };
    pexprs.Lookahead.prototype.toString = function() {
      return "&" + this.expr;
    };
    pexprs.Apply.prototype.toString = function() {
      if (this.args.length > 0) {
        const ps = this.args.map((arg) => arg.toString());
        return this.ruleName + "<" + ps.join(",") + ">";
      } else {
        return this.ruleName;
      }
    };
    pexprs.UnicodeChar.prototype.toString = function() {
      return "\\p{" + this.category + "}";
    };
  }
});

// node_modules/ohm-js/src/pexprs.js
var require_pexprs = __commonJS({
  "node_modules/ohm-js/src/pexprs.js"(exports2, module2) {
    "use strict";
    module2.exports = require_pexprs_main();
    require_pexprs_allowsSkippingPrecedingSpace();
    require_pexprs_assertAllApplicationsAreValid();
    require_pexprs_assertChoicesHaveUniformArity();
    require_pexprs_assertIteratedExprsAreNotNullable();
    require_pexprs_eval();
    require_pexprs_getArity();
    require_pexprs_outputRecipe();
    require_pexprs_introduceParams();
    require_pexprs_isNullable();
    require_pexprs_substituteParams();
    require_pexprs_toArgumentNameList();
    require_pexprs_toDisplayString();
    require_pexprs_toFailure();
    require_pexprs_toString();
  }
});

// node_modules/ohm-js/src/CaseInsensitiveTerminal.js
var require_CaseInsensitiveTerminal = __commonJS({
  "node_modules/ohm-js/src/CaseInsensitiveTerminal.js"(exports2, module2) {
    "use strict";
    var Failure = require_Failure();
    var { TerminalNode } = require_nodes();
    var { assert } = require_common();
    var { PExpr, Terminal } = require_pexprs();
    var CaseInsensitiveTerminal = class _CaseInsensitiveTerminal extends PExpr {
      constructor(param) {
        super();
        this.obj = param;
      }
      _getString(state) {
        const terminal = state.currentApplication().args[this.obj.index];
        assert(terminal instanceof Terminal, "expected a Terminal expression");
        return terminal.obj;
      }
      // Implementation of the PExpr API
      allowsSkippingPrecedingSpace() {
        return true;
      }
      eval(state) {
        const { inputStream } = state;
        const origPos = inputStream.pos;
        const matchStr = this._getString(state);
        if (!inputStream.matchString(matchStr, true)) {
          state.processFailure(origPos, this);
          return false;
        } else {
          state.pushBinding(new TerminalNode(matchStr.length), origPos);
          return true;
        }
      }
      getArity() {
        return 1;
      }
      substituteParams(actuals) {
        return new _CaseInsensitiveTerminal(this.obj.substituteParams(actuals));
      }
      toDisplayString() {
        return this.obj.toDisplayString() + " (case-insensitive)";
      }
      toFailure(grammar) {
        return new Failure(
          this,
          this.obj.toFailure(grammar) + " (case-insensitive)",
          "description"
        );
      }
      _isNullable(grammar, memo) {
        return this.obj._isNullable(grammar, memo);
      }
    };
    module2.exports = CaseInsensitiveTerminal;
  }
});

// node_modules/ohm-js/src/InputStream.js
var require_InputStream = __commonJS({
  "node_modules/ohm-js/src/InputStream.js"(exports2, module2) {
    "use strict";
    var Interval = require_Interval();
    function InputStream(source) {
      this.source = source;
      this.pos = 0;
      this.examinedLength = 0;
    }
    InputStream.prototype = {
      atEnd() {
        const ans = this.pos === this.source.length;
        this.examinedLength = Math.max(this.examinedLength, this.pos + 1);
        return ans;
      },
      next() {
        const ans = this.source[this.pos++];
        this.examinedLength = Math.max(this.examinedLength, this.pos);
        return ans;
      },
      nextCharCode() {
        const nextChar = this.next();
        return nextChar && nextChar.charCodeAt(0);
      },
      nextCodePoint() {
        const cp = this.source.slice(this.pos++).codePointAt(0);
        if (cp > 65535) {
          this.pos += 1;
        }
        this.examinedLength = Math.max(this.examinedLength, this.pos);
        return cp;
      },
      matchString(s2, optIgnoreCase) {
        let idx;
        if (optIgnoreCase) {
          for (idx = 0; idx < s2.length; idx++) {
            const actual = this.next();
            const expected = s2[idx];
            if (actual == null || actual.toUpperCase() !== expected.toUpperCase()) {
              return false;
            }
          }
          return true;
        }
        for (idx = 0; idx < s2.length; idx++) {
          if (this.next() !== s2[idx]) {
            return false;
          }
        }
        return true;
      },
      sourceSlice(startIdx, endIdx) {
        return this.source.slice(startIdx, endIdx);
      },
      interval(startIdx, optEndIdx) {
        return new Interval(this.source, startIdx, optEndIdx ? optEndIdx : this.pos);
      }
    };
    module2.exports = InputStream;
  }
});

// node_modules/ohm-js/src/MatchResult.js
var require_MatchResult = __commonJS({
  "node_modules/ohm-js/src/MatchResult.js"(exports2, module2) {
    "use strict";
    var common = require_common();
    var util = require_util();
    var Interval = require_Interval();
    function MatchResult(matcher, input, startExpr, cst, cstOffset, rightmostFailurePosition, optRecordedFailures) {
      this.matcher = matcher;
      this.input = input;
      this.startExpr = startExpr;
      this._cst = cst;
      this._cstOffset = cstOffset;
      this._rightmostFailurePosition = rightmostFailurePosition;
      this._rightmostFailures = optRecordedFailures;
      if (this.failed()) {
        common.defineLazyProperty(this, "message", function() {
          const detail = "Expected " + this.getExpectedText();
          return util.getLineAndColumnMessage(this.input, this.getRightmostFailurePosition()) + detail;
        });
        common.defineLazyProperty(this, "shortMessage", function() {
          const detail = "expected " + this.getExpectedText();
          const errorInfo = util.getLineAndColumn(this.input, this.getRightmostFailurePosition());
          return "Line " + errorInfo.lineNum + ", col " + errorInfo.colNum + ": " + detail;
        });
      }
    }
    MatchResult.prototype.succeeded = function() {
      return !!this._cst;
    };
    MatchResult.prototype.failed = function() {
      return !this.succeeded();
    };
    MatchResult.prototype.getRightmostFailurePosition = function() {
      return this._rightmostFailurePosition;
    };
    MatchResult.prototype.getRightmostFailures = function() {
      if (!this._rightmostFailures) {
        this.matcher.setInput(this.input);
        const matchResultWithFailures = this.matcher._match(
          this.startExpr,
          false,
          this.getRightmostFailurePosition()
        );
        this._rightmostFailures = matchResultWithFailures.getRightmostFailures();
      }
      return this._rightmostFailures;
    };
    MatchResult.prototype.toString = function() {
      return this.succeeded() ? "[match succeeded]" : "[match failed at position " + this.getRightmostFailurePosition() + "]";
    };
    MatchResult.prototype.getExpectedText = function() {
      if (this.succeeded()) {
        throw new Error("cannot get expected text of a successful MatchResult");
      }
      const sb = new common.StringBuffer();
      let failures = this.getRightmostFailures();
      failures = failures.filter((failure) => !failure.isFluffy());
      for (let idx = 0; idx < failures.length; idx++) {
        if (idx > 0) {
          if (idx === failures.length - 1) {
            sb.append(failures.length > 2 ? ", or " : " or ");
          } else {
            sb.append(", ");
          }
        }
        sb.append(failures[idx].toString());
      }
      return sb.contents();
    };
    MatchResult.prototype.getInterval = function() {
      const pos = this.getRightmostFailurePosition();
      return new Interval(this.input, pos, pos);
    };
    module2.exports = MatchResult;
  }
});

// node_modules/ohm-js/src/PosInfo.js
var require_PosInfo = __commonJS({
  "node_modules/ohm-js/src/PosInfo.js"(exports2, module2) {
    "use strict";
    function PosInfo() {
      this.applicationMemoKeyStack = [];
      this.memo = {};
      this.maxExaminedLength = 0;
      this.maxRightmostFailureOffset = -1;
      this.currentLeftRecursion = void 0;
    }
    PosInfo.prototype = {
      isActive(application) {
        return this.applicationMemoKeyStack.indexOf(application.toMemoKey()) >= 0;
      },
      enter(application) {
        this.applicationMemoKeyStack.push(application.toMemoKey());
      },
      exit() {
        this.applicationMemoKeyStack.pop();
      },
      startLeftRecursion(headApplication, memoRec) {
        memoRec.isLeftRecursion = true;
        memoRec.headApplication = headApplication;
        memoRec.nextLeftRecursion = this.currentLeftRecursion;
        this.currentLeftRecursion = memoRec;
        const { applicationMemoKeyStack } = this;
        const indexOfFirstInvolvedRule = applicationMemoKeyStack.indexOf(headApplication.toMemoKey()) + 1;
        const involvedApplicationMemoKeys = applicationMemoKeyStack.slice(
          indexOfFirstInvolvedRule
        );
        memoRec.isInvolved = function(applicationMemoKey) {
          return involvedApplicationMemoKeys.indexOf(applicationMemoKey) >= 0;
        };
        memoRec.updateInvolvedApplicationMemoKeys = function() {
          for (let idx = indexOfFirstInvolvedRule; idx < applicationMemoKeyStack.length; idx++) {
            const applicationMemoKey = applicationMemoKeyStack[idx];
            if (!this.isInvolved(applicationMemoKey)) {
              involvedApplicationMemoKeys.push(applicationMemoKey);
            }
          }
        };
      },
      endLeftRecursion() {
        this.currentLeftRecursion = this.currentLeftRecursion.nextLeftRecursion;
      },
      // Note: this method doesn't get called for the "head" of a left recursion -- for LR heads,
      // the memoized result (which starts out being a failure) is always used.
      shouldUseMemoizedResult(memoRec) {
        if (!memoRec.isLeftRecursion) {
          return true;
        }
        const { applicationMemoKeyStack } = this;
        for (let idx = 0; idx < applicationMemoKeyStack.length; idx++) {
          const applicationMemoKey = applicationMemoKeyStack[idx];
          if (memoRec.isInvolved(applicationMemoKey)) {
            return false;
          }
        }
        return true;
      },
      memoize(memoKey, memoRec) {
        this.memo[memoKey] = memoRec;
        this.maxExaminedLength = Math.max(this.maxExaminedLength, memoRec.examinedLength);
        this.maxRightmostFailureOffset = Math.max(
          this.maxRightmostFailureOffset,
          memoRec.rightmostFailureOffset
        );
        return memoRec;
      },
      clearObsoleteEntries(pos, invalidatedIdx) {
        if (pos + this.maxExaminedLength <= invalidatedIdx) {
          return;
        }
        const { memo } = this;
        this.maxExaminedLength = 0;
        this.maxRightmostFailureOffset = -1;
        Object.keys(memo).forEach((k2) => {
          const memoRec = memo[k2];
          if (pos + memoRec.examinedLength > invalidatedIdx) {
            delete memo[k2];
          } else {
            this.maxExaminedLength = Math.max(this.maxExaminedLength, memoRec.examinedLength);
            this.maxRightmostFailureOffset = Math.max(
              this.maxRightmostFailureOffset,
              memoRec.rightmostFailureOffset
            );
          }
        });
      }
    };
    module2.exports = PosInfo;
  }
});

// node_modules/ohm-js/src/MatchState.js
var require_MatchState = __commonJS({
  "node_modules/ohm-js/src/MatchState.js"(exports2, module2) {
    "use strict";
    var InputStream = require_InputStream();
    var MatchResult = require_MatchResult();
    var PosInfo = require_PosInfo();
    var Trace = require_Trace();
    var pexprs = require_pexprs();
    var util = require_util();
    var builtInApplySyntacticBody;
    util.awaitBuiltInRules((builtInRules) => {
      builtInApplySyntacticBody = builtInRules.rules.applySyntactic.body;
    });
    var applySpaces = new pexprs.Apply("spaces");
    function MatchState(matcher, startExpr, optPositionToRecordFailures) {
      this.matcher = matcher;
      this.startExpr = startExpr;
      this.grammar = matcher.grammar;
      this.input = matcher.input;
      this.inputStream = new InputStream(matcher.input);
      this.memoTable = matcher.memoTable;
      this._bindings = [];
      this._bindingOffsets = [];
      this._applicationStack = [];
      this._posStack = [0];
      this.inLexifiedContextStack = [false];
      this.rightmostFailurePosition = -1;
      this._rightmostFailurePositionStack = [];
      this._recordedFailuresStack = [];
      if (optPositionToRecordFailures !== void 0) {
        this.positionToRecordFailures = optPositionToRecordFailures;
        this.recordedFailures = /* @__PURE__ */ Object.create(null);
      }
    }
    MatchState.prototype = {
      posToOffset(pos) {
        return pos - this._posStack[this._posStack.length - 1];
      },
      enterApplication(posInfo, app) {
        this._posStack.push(this.inputStream.pos);
        this._applicationStack.push(app);
        this.inLexifiedContextStack.push(false);
        posInfo.enter(app);
        this._rightmostFailurePositionStack.push(this.rightmostFailurePosition);
        this.rightmostFailurePosition = -1;
      },
      exitApplication(posInfo, optNode) {
        const origPos = this._posStack.pop();
        this._applicationStack.pop();
        this.inLexifiedContextStack.pop();
        posInfo.exit();
        this.rightmostFailurePosition = Math.max(
          this.rightmostFailurePosition,
          this._rightmostFailurePositionStack.pop()
        );
        if (optNode) {
          this.pushBinding(optNode, origPos);
        }
      },
      enterLexifiedContext() {
        this.inLexifiedContextStack.push(true);
      },
      exitLexifiedContext() {
        this.inLexifiedContextStack.pop();
      },
      currentApplication() {
        return this._applicationStack[this._applicationStack.length - 1];
      },
      inSyntacticContext() {
        const currentApplication = this.currentApplication();
        if (currentApplication) {
          return currentApplication.isSyntactic() && !this.inLexifiedContext();
        } else {
          return this.startExpr.factors[0].isSyntactic();
        }
      },
      inLexifiedContext() {
        return this.inLexifiedContextStack[this.inLexifiedContextStack.length - 1];
      },
      skipSpaces() {
        this.pushFailuresInfo();
        this.eval(applySpaces);
        this.popBinding();
        this.popFailuresInfo();
        return this.inputStream.pos;
      },
      skipSpacesIfInSyntacticContext() {
        return this.inSyntacticContext() ? this.skipSpaces() : this.inputStream.pos;
      },
      maybeSkipSpacesBefore(expr) {
        if (expr.allowsSkippingPrecedingSpace() && expr !== applySpaces) {
          return this.skipSpacesIfInSyntacticContext();
        } else {
          return this.inputStream.pos;
        }
      },
      pushBinding(node, origPos) {
        this._bindings.push(node);
        this._bindingOffsets.push(this.posToOffset(origPos));
      },
      popBinding() {
        this._bindings.pop();
        this._bindingOffsets.pop();
      },
      numBindings() {
        return this._bindings.length;
      },
      truncateBindings(newLength) {
        while (this._bindings.length > newLength) {
          this.popBinding();
        }
      },
      getCurrentPosInfo() {
        return this.getPosInfo(this.inputStream.pos);
      },
      getPosInfo(pos) {
        let posInfo = this.memoTable[pos];
        if (!posInfo) {
          posInfo = this.memoTable[pos] = new PosInfo();
        }
        return posInfo;
      },
      processFailure(pos, expr) {
        this.rightmostFailurePosition = Math.max(this.rightmostFailurePosition, pos);
        if (this.recordedFailures && pos === this.positionToRecordFailures) {
          const app = this.currentApplication();
          if (app) {
            expr = expr.substituteParams(app.args);
          } else {
          }
          this.recordFailure(expr.toFailure(this.grammar), false);
        }
      },
      recordFailure(failure, shouldCloneIfNew) {
        const key = failure.toKey();
        if (!this.recordedFailures[key]) {
          this.recordedFailures[key] = shouldCloneIfNew ? failure.clone() : failure;
        } else if (this.recordedFailures[key].isFluffy() && !failure.isFluffy()) {
          this.recordedFailures[key].clearFluffy();
        }
      },
      recordFailures(failures, shouldCloneIfNew) {
        Object.keys(failures).forEach((key) => {
          this.recordFailure(failures[key], shouldCloneIfNew);
        });
      },
      cloneRecordedFailures() {
        if (!this.recordedFailures) {
          return void 0;
        }
        const ans = /* @__PURE__ */ Object.create(null);
        Object.keys(this.recordedFailures).forEach((key) => {
          ans[key] = this.recordedFailures[key].clone();
        });
        return ans;
      },
      getRightmostFailurePosition() {
        return this.rightmostFailurePosition;
      },
      _getRightmostFailureOffset() {
        return this.rightmostFailurePosition >= 0 ? this.posToOffset(this.rightmostFailurePosition) : -1;
      },
      // Returns the memoized trace entry for `expr` at `pos`, if one exists, `null` otherwise.
      getMemoizedTraceEntry(pos, expr) {
        const posInfo = this.memoTable[pos];
        if (posInfo && expr instanceof pexprs.Apply) {
          const memoRec = posInfo.memo[expr.toMemoKey()];
          if (memoRec && memoRec.traceEntry) {
            const entry = memoRec.traceEntry.cloneWithExpr(expr);
            entry.isMemoized = true;
            return entry;
          }
        }
        return null;
      },
      // Returns a new trace entry, with the currently active trace array as its children.
      getTraceEntry(pos, expr, succeeded, bindings) {
        if (expr instanceof pexprs.Apply) {
          const app = this.currentApplication();
          const actuals = app ? app.args : [];
          expr = expr.substituteParams(actuals);
        }
        return this.getMemoizedTraceEntry(pos, expr) || new Trace(this.input, pos, this.inputStream.pos, expr, succeeded, bindings, this.trace);
      },
      isTracing() {
        return !!this.trace;
      },
      hasNecessaryInfo(memoRec) {
        if (this.trace && !memoRec.traceEntry) {
          return false;
        }
        if (this.recordedFailures && this.inputStream.pos + memoRec.rightmostFailureOffset === this.positionToRecordFailures) {
          return !!memoRec.failuresAtRightmostPosition;
        }
        return true;
      },
      useMemoizedResult(origPos, memoRec) {
        if (this.trace) {
          this.trace.push(memoRec.traceEntry);
        }
        const memoRecRightmostFailurePosition = this.inputStream.pos + memoRec.rightmostFailureOffset;
        this.rightmostFailurePosition = Math.max(
          this.rightmostFailurePosition,
          memoRecRightmostFailurePosition
        );
        if (this.recordedFailures && this.positionToRecordFailures === memoRecRightmostFailurePosition && memoRec.failuresAtRightmostPosition) {
          this.recordFailures(memoRec.failuresAtRightmostPosition, true);
        }
        this.inputStream.examinedLength = Math.max(
          this.inputStream.examinedLength,
          memoRec.examinedLength + origPos
        );
        if (memoRec.value) {
          this.inputStream.pos += memoRec.matchLength;
          this.pushBinding(memoRec.value, origPos);
          return true;
        }
        return false;
      },
      // Evaluate `expr` and return `true` if it succeeded, `false` otherwise. On success, `bindings`
      // will have `expr.getArity()` more elements than before, and the input stream's position may
      // have increased. On failure, `bindings` and position will be unchanged.
      eval(expr) {
        const { inputStream } = this;
        const origNumBindings = this._bindings.length;
        let origRecordedFailures;
        if (this.recordedFailures) {
          origRecordedFailures = this.recordedFailures;
          this.recordedFailures = /* @__PURE__ */ Object.create(null);
        }
        const origPos = inputStream.pos;
        const memoPos = this.maybeSkipSpacesBefore(expr);
        let origTrace;
        if (this.trace) {
          origTrace = this.trace;
          this.trace = [];
        }
        const ans = expr.eval(this);
        if (this.trace) {
          const bindings = this._bindings.slice(origNumBindings);
          const traceEntry = this.getTraceEntry(memoPos, expr, ans, bindings);
          traceEntry.isImplicitSpaces = expr === applySpaces;
          traceEntry.isRootNode = expr === this.startExpr;
          origTrace.push(traceEntry);
          this.trace = origTrace;
        }
        if (ans) {
          if (this.recordedFailures && inputStream.pos === this.positionToRecordFailures) {
            Object.keys(this.recordedFailures).forEach((key) => {
              this.recordedFailures[key].makeFluffy();
            });
          }
        } else {
          inputStream.pos = origPos;
          this.truncateBindings(origNumBindings);
        }
        if (this.recordedFailures) {
          this.recordFailures(origRecordedFailures, false);
        }
        if (expr === builtInApplySyntacticBody) {
          this.skipSpaces();
        }
        return ans;
      },
      getMatchResult() {
        this.eval(this.startExpr);
        let rightmostFailures;
        if (this.recordedFailures) {
          rightmostFailures = Object.keys(this.recordedFailures).map(
            (key) => this.recordedFailures[key]
          );
        }
        const cst = this._bindings[0];
        if (cst) {
          cst.grammar = this.grammar;
        }
        return new MatchResult(
          this.matcher,
          this.input,
          this.startExpr,
          cst,
          this._bindingOffsets[0],
          this.rightmostFailurePosition,
          rightmostFailures
        );
      },
      getTrace() {
        this.trace = [];
        const matchResult = this.getMatchResult();
        const rootTrace = this.trace[this.trace.length - 1];
        rootTrace.result = matchResult;
        return rootTrace;
      },
      pushFailuresInfo() {
        this._rightmostFailurePositionStack.push(this.rightmostFailurePosition);
        this._recordedFailuresStack.push(this.recordedFailures);
      },
      popFailuresInfo() {
        this.rightmostFailurePosition = this._rightmostFailurePositionStack.pop();
        this.recordedFailures = this._recordedFailuresStack.pop();
      }
    };
    module2.exports = MatchState;
  }
});

// node_modules/ohm-js/src/Matcher.js
var require_Matcher = __commonJS({
  "node_modules/ohm-js/src/Matcher.js"(exports2, module2) {
    "use strict";
    var MatchState = require_MatchState();
    var pexprs = require_pexprs();
    function Matcher(grammar) {
      this.grammar = grammar;
      this.memoTable = [];
      this.input = "";
    }
    Matcher.prototype.getInput = function() {
      return this.input;
    };
    Matcher.prototype.setInput = function(str) {
      if (this.input !== str) {
        this.replaceInputRange(0, this.input.length, str);
      }
      return this;
    };
    Matcher.prototype.replaceInputRange = function(startIdx, endIdx, str) {
      const currentInput = this.input;
      if (startIdx < 0 || startIdx > currentInput.length || endIdx < 0 || endIdx > currentInput.length || startIdx > endIdx) {
        throw new Error("Invalid indices: " + startIdx + " and " + endIdx);
      }
      this.input = currentInput.slice(0, startIdx) + str + currentInput.slice(endIdx);
      const restOfMemoTable = this.memoTable.slice(endIdx);
      this.memoTable.length = startIdx;
      for (let idx = 0; idx < str.length; idx++) {
        this.memoTable.push(void 0);
      }
      restOfMemoTable.forEach(function(posInfo) {
        this.memoTable.push(posInfo);
      }, this);
      for (let pos = 0; pos < startIdx; pos++) {
        const posInfo = this.memoTable[pos];
        if (posInfo) {
          posInfo.clearObsoleteEntries(pos, startIdx);
        }
      }
      return this;
    };
    Matcher.prototype.match = function(optStartApplicationStr) {
      return this._match(this._getStartExpr(optStartApplicationStr), false);
    };
    Matcher.prototype.trace = function(optStartApplicationStr) {
      return this._match(this._getStartExpr(optStartApplicationStr), true);
    };
    Matcher.prototype._match = function(startExpr, tracing, optPositionToRecordFailures) {
      const state = new MatchState(this, startExpr, optPositionToRecordFailures);
      return tracing ? state.getTrace() : state.getMatchResult();
    };
    Matcher.prototype._getStartExpr = function(optStartApplicationStr) {
      const applicationStr = optStartApplicationStr || this.grammar.defaultStartRule;
      if (!applicationStr) {
        throw new Error("Missing start rule argument -- the grammar has no default start rule.");
      }
      const startApp = this.grammar.parseApplication(applicationStr);
      return new pexprs.Seq([startApp, pexprs.end]);
    };
    module2.exports = Matcher;
  }
});

// node_modules/ohm-js/src/Semantics.js
var require_Semantics = __commonJS({
  "node_modules/ohm-js/src/Semantics.js"(exports2, module2) {
    "use strict";
    var InputStream = require_InputStream();
    var { IterationNode } = require_nodes();
    var MatchResult = require_MatchResult();
    var common = require_common();
    var errors = require_errors();
    var util = require_util();
    var globalActionStack = [];
    var hasOwnProperty = (x2, prop) => Object.prototype.hasOwnProperty.call(x2, prop);
    var Wrapper = class {
      constructor(node, sourceInterval, baseInterval) {
        this._node = node;
        this.source = sourceInterval;
        this._baseInterval = baseInterval;
        if (node.isNonterminal()) {
          common.assert(sourceInterval === baseInterval);
        }
        this._childWrappers = [];
      }
      toString() {
        return "[semantics wrapper for " + this._node.grammar.name + "]";
      }
      _forgetMemoizedResultFor(attributeName) {
        delete this._node[this._semantics.attributeKeys[attributeName]];
        this.children.forEach((child) => {
          child._forgetMemoizedResultFor(attributeName);
        });
      }
      // Returns the wrapper of the specified child node. Child wrappers are created lazily and
      // cached in the parent wrapper's `_childWrappers` instance variable.
      child(idx) {
        if (!(0 <= idx && idx < this._node.numChildren())) {
          return void 0;
        }
        let childWrapper = this._childWrappers[idx];
        if (!childWrapper) {
          const childNode = this._node.childAt(idx);
          const offset = this._node.childOffsets[idx];
          const source = this._baseInterval.subInterval(offset, childNode.matchLength);
          const base = childNode.isNonterminal() ? source : this._baseInterval;
          childWrapper = this._childWrappers[idx] = this._semantics.wrap(childNode, source, base);
        }
        return childWrapper;
      }
      // Returns an array containing the wrappers of all of the children of the node associated
      // with this wrapper.
      _children() {
        for (let idx = 0; idx < this._node.numChildren(); idx++) {
          this.child(idx);
        }
        return this._childWrappers;
      }
      // Returns `true` if the CST node associated with this wrapper corresponds to an iteration
      // expression, i.e., a Kleene-*, Kleene-+, or an optional. Returns `false` otherwise.
      isIteration() {
        return this._node.isIteration();
      }
      // Returns `true` if the CST node associated with this wrapper is a terminal node, `false`
      // otherwise.
      isTerminal() {
        return this._node.isTerminal();
      }
      // Returns `true` if the CST node associated with this wrapper is a nonterminal node, `false`
      // otherwise.
      isNonterminal() {
        return this._node.isNonterminal();
      }
      // Returns `true` if the CST node associated with this wrapper is a nonterminal node
      // corresponding to a syntactic rule, `false` otherwise.
      isSyntactic() {
        return this.isNonterminal() && this._node.isSyntactic();
      }
      // Returns `true` if the CST node associated with this wrapper is a nonterminal node
      // corresponding to a lexical rule, `false` otherwise.
      isLexical() {
        return this.isNonterminal() && this._node.isLexical();
      }
      // Returns `true` if the CST node associated with this wrapper is an iterator node
      // having either one or no child (? operator), `false` otherwise.
      // Otherwise, throws an exception.
      isOptional() {
        return this._node.isOptional();
      }
      // Create a new _iter wrapper in the same semantics as this wrapper.
      iteration(optChildWrappers) {
        const childWrappers = optChildWrappers || [];
        const childNodes = childWrappers.map((c2) => c2._node);
        const iter = new IterationNode(childNodes, [], -1, false);
        const wrapper = this._semantics.wrap(iter, null, null);
        wrapper._childWrappers = childWrappers;
        return wrapper;
      }
      // Returns an array containing the children of this CST node.
      get children() {
        return this._children();
      }
      // Returns the name of grammar rule that created this CST node.
      get ctorName() {
        return this._node.ctorName;
      }
      // TODO: Remove this eventually (deprecated in v0.12).
      get interval() {
        throw new Error("The `interval` property is deprecated -- use `source` instead");
      }
      // Returns the number of children of this CST node.
      get numChildren() {
        return this._node.numChildren();
      }
      // Returns the contents of the input stream consumed by this CST node.
      get sourceString() {
        return this.source.contents;
      }
    };
    function Semantics(grammar, superSemantics) {
      const self2 = this;
      this.grammar = grammar;
      this.checkedActionDicts = false;
      this.Wrapper = class extends (superSemantics ? superSemantics.Wrapper : Wrapper) {
        constructor(node, sourceInterval, baseInterval) {
          super(node, sourceInterval, baseInterval);
          self2.checkActionDictsIfHaventAlready();
          this._semantics = self2;
        }
      };
      this.super = superSemantics;
      if (superSemantics) {
        if (!(grammar.equals(this.super.grammar) || grammar._inheritsFrom(this.super.grammar))) {
          throw new Error(
            "Cannot extend a semantics for grammar '" + this.super.grammar.name + "' for use with grammar '" + grammar.name + "' (not a sub-grammar)"
          );
        }
        this.operations = Object.create(this.super.operations);
        this.attributes = Object.create(this.super.attributes);
        this.attributeKeys = /* @__PURE__ */ Object.create(null);
        for (const attributeName in this.attributes) {
          Object.defineProperty(this.attributeKeys, attributeName, {
            value: util.uniqueId(attributeName)
          });
        }
      } else {
        this.operations = /* @__PURE__ */ Object.create(null);
        this.attributes = /* @__PURE__ */ Object.create(null);
        this.attributeKeys = /* @__PURE__ */ Object.create(null);
      }
    }
    Semantics.prototype.toString = function() {
      return "[semantics for " + this.grammar.name + "]";
    };
    Semantics.prototype.checkActionDictsIfHaventAlready = function() {
      if (!this.checkedActionDicts) {
        this.checkActionDicts();
        this.checkedActionDicts = true;
      }
    };
    Semantics.prototype.checkActionDicts = function() {
      let name;
      for (name in this.operations) {
        this.operations[name].checkActionDict(this.grammar);
      }
      for (name in this.attributes) {
        this.attributes[name].checkActionDict(this.grammar);
      }
    };
    Semantics.prototype.toRecipe = function(semanticsOnly) {
      function hasSuperSemantics(s2) {
        return s2.super !== Semantics.BuiltInSemantics._getSemantics();
      }
      let str = "(function(g) {\n";
      if (hasSuperSemantics(this)) {
        str += "  var semantics = " + this.super.toRecipe(true) + "(g";
        const superSemanticsGrammar = this.super.grammar;
        let relatedGrammar = this.grammar;
        while (relatedGrammar !== superSemanticsGrammar) {
          str += ".superGrammar";
          relatedGrammar = relatedGrammar.superGrammar;
        }
        str += ");\n";
        str += "  return g.extendSemantics(semantics)";
      } else {
        str += "  return g.createSemantics()";
      }
      ["Operation", "Attribute"].forEach((type) => {
        const semanticOperations = this[type.toLowerCase() + "s"];
        Object.keys(semanticOperations).forEach((name) => {
          const { actionDict, formals, builtInDefault } = semanticOperations[name];
          let signature = name;
          if (formals.length > 0) {
            signature += "(" + formals.join(", ") + ")";
          }
          let method;
          if (hasSuperSemantics(this) && this.super[type.toLowerCase() + "s"][name]) {
            method = "extend" + type;
          } else {
            method = "add" + type;
          }
          str += "\n    ." + method + "(" + JSON.stringify(signature) + ", {";
          const srcArray = [];
          Object.keys(actionDict).forEach((actionName) => {
            if (actionDict[actionName] !== builtInDefault) {
              let source = actionDict[actionName].toString().trim();
              source = source.replace(/^.*\(/, "function(");
              srcArray.push("\n      " + JSON.stringify(actionName) + ": " + source);
            }
          });
          str += srcArray.join(",") + "\n    })";
        });
      });
      str += ";\n  })";
      if (!semanticsOnly) {
        str = "(function() {\n  var grammar = this.fromRecipe(" + this.grammar.toRecipe() + ");\n  var semantics = " + str + "(grammar);\n  return semantics;\n});\n";
      }
      return str;
    };
    function parseSignature(signature, type) {
      if (!Semantics.prototypeGrammar) {
        common.assert(signature.indexOf("(") === -1);
        return {
          name: signature,
          formals: []
        };
      }
      const r2 = Semantics.prototypeGrammar.match(
        signature,
        type === "operation" ? "OperationSignature" : "AttributeSignature"
      );
      if (r2.failed()) {
        throw new Error(r2.message);
      }
      return Semantics.prototypeGrammarSemantics(r2).parse();
    }
    function newDefaultAction(type, name, doIt) {
      return function(...children) {
        const thisThing = this._semantics.operations[name] || this._semantics.attributes[name];
        const args = thisThing.formals.map((formal) => this.args[formal]);
        if (!this.isIteration() && children.length === 1) {
          return doIt.apply(children[0], args);
        } else {
          throw errors.missingSemanticAction(this.ctorName, name, type, globalActionStack);
        }
      };
    }
    Semantics.prototype.addOperationOrAttribute = function(type, signature, actionDict) {
      const typePlural = type + "s";
      const parsedNameAndFormalArgs = parseSignature(signature, type);
      const { name } = parsedNameAndFormalArgs;
      const { formals } = parsedNameAndFormalArgs;
      this.assertNewName(name, type);
      const builtInDefault = newDefaultAction(type, name, doIt);
      const realActionDict = { _default: builtInDefault };
      Object.keys(actionDict).forEach((name2) => {
        realActionDict[name2] = actionDict[name2];
      });
      const entry = type === "operation" ? new Operation(name, formals, realActionDict, builtInDefault) : new Attribute(name, realActionDict, builtInDefault);
      entry.checkActionDict(this.grammar);
      this[typePlural][name] = entry;
      function doIt(...args) {
        const thisThing = this._semantics[typePlural][name];
        if (arguments.length !== thisThing.formals.length) {
          throw new Error(
            "Invalid number of arguments passed to " + name + " " + type + " (expected " + thisThing.formals.length + ", got " + arguments.length + ")"
          );
        }
        const argsObj = /* @__PURE__ */ Object.create(null);
        for (const [idx, val] of Object.entries(args)) {
          const formal = thisThing.formals[idx];
          argsObj[formal] = val;
        }
        const oldArgs = this.args;
        this.args = argsObj;
        const ans = thisThing.execute(this._semantics, this);
        this.args = oldArgs;
        return ans;
      }
      if (type === "operation") {
        this.Wrapper.prototype[name] = doIt;
        this.Wrapper.prototype[name].toString = function() {
          return "[" + name + " operation]";
        };
      } else {
        Object.defineProperty(this.Wrapper.prototype, name, {
          get: doIt,
          configurable: true
          // So the property can be deleted.
        });
        Object.defineProperty(this.attributeKeys, name, {
          value: util.uniqueId(name)
        });
      }
    };
    Semantics.prototype.extendOperationOrAttribute = function(type, name, actionDict) {
      const typePlural = type + "s";
      parseSignature(name, "attribute");
      if (!(this.super && name in this.super[typePlural])) {
        throw new Error(
          "Cannot extend " + type + " '" + name + "': did not inherit an " + type + " with that name"
        );
      }
      if (hasOwnProperty(this[typePlural], name)) {
        throw new Error("Cannot extend " + type + " '" + name + "' again");
      }
      const inheritedFormals = this[typePlural][name].formals;
      const inheritedActionDict = this[typePlural][name].actionDict;
      const newActionDict = Object.create(inheritedActionDict);
      Object.keys(actionDict).forEach((name2) => {
        newActionDict[name2] = actionDict[name2];
      });
      this[typePlural][name] = type === "operation" ? new Operation(name, inheritedFormals, newActionDict) : new Attribute(name, newActionDict);
      this[typePlural][name].checkActionDict(this.grammar);
    };
    Semantics.prototype.assertNewName = function(name, type) {
      if (hasOwnProperty(Wrapper.prototype, name)) {
        throw new Error("Cannot add " + type + " '" + name + "': that's a reserved name");
      }
      if (name in this.operations) {
        throw new Error(
          "Cannot add " + type + " '" + name + "': an operation with that name already exists"
        );
      }
      if (name in this.attributes) {
        throw new Error(
          "Cannot add " + type + " '" + name + "': an attribute with that name already exists"
        );
      }
    };
    Semantics.prototype.wrap = function(node, source, optBaseInterval) {
      const baseInterval = optBaseInterval || source;
      return node instanceof this.Wrapper ? node : new this.Wrapper(node, source, baseInterval);
    };
    Semantics.createSemantics = function(grammar, optSuperSemantics) {
      const s2 = new Semantics(
        grammar,
        optSuperSemantics !== void 0 ? optSuperSemantics : Semantics.BuiltInSemantics._getSemantics()
      );
      const proxy = function ASemantics(matchResult) {
        if (!(matchResult instanceof MatchResult)) {
          throw new TypeError(
            "Semantics expected a MatchResult, but got " + common.unexpectedObjToString(matchResult)
          );
        }
        if (matchResult.failed()) {
          throw new TypeError("cannot apply Semantics to " + matchResult.toString());
        }
        const cst = matchResult._cst;
        if (cst.grammar !== grammar) {
          throw new Error(
            "Cannot use a MatchResult from grammar '" + cst.grammar.name + "' with a semantics for '" + grammar.name + "'"
          );
        }
        const inputStream = new InputStream(matchResult.input);
        return s2.wrap(cst, inputStream.interval(matchResult._cstOffset, matchResult.input.length));
      };
      proxy.addOperation = function(signature, actionDict) {
        s2.addOperationOrAttribute("operation", signature, actionDict);
        return proxy;
      };
      proxy.extendOperation = function(name, actionDict) {
        s2.extendOperationOrAttribute("operation", name, actionDict);
        return proxy;
      };
      proxy.addAttribute = function(name, actionDict) {
        s2.addOperationOrAttribute("attribute", name, actionDict);
        return proxy;
      };
      proxy.extendAttribute = function(name, actionDict) {
        s2.extendOperationOrAttribute("attribute", name, actionDict);
        return proxy;
      };
      proxy._getActionDict = function(operationOrAttributeName) {
        const action = s2.operations[operationOrAttributeName] || s2.attributes[operationOrAttributeName];
        if (!action) {
          throw new Error(
            '"' + operationOrAttributeName + '" is not a valid operation or attribute name in this semantics for "' + grammar.name + '"'
          );
        }
        return action.actionDict;
      };
      proxy._remove = function(operationOrAttributeName) {
        let semantic;
        if (operationOrAttributeName in s2.operations) {
          semantic = s2.operations[operationOrAttributeName];
          delete s2.operations[operationOrAttributeName];
        } else if (operationOrAttributeName in s2.attributes) {
          semantic = s2.attributes[operationOrAttributeName];
          delete s2.attributes[operationOrAttributeName];
        }
        delete s2.Wrapper.prototype[operationOrAttributeName];
        return semantic;
      };
      proxy.getOperationNames = function() {
        return Object.keys(s2.operations);
      };
      proxy.getAttributeNames = function() {
        return Object.keys(s2.attributes);
      };
      proxy.getGrammar = function() {
        return s2.grammar;
      };
      proxy.toRecipe = function(semanticsOnly) {
        return s2.toRecipe(semanticsOnly);
      };
      proxy.toString = s2.toString.bind(s2);
      proxy._getSemantics = function() {
        return s2;
      };
      return proxy;
    };
    var Operation = class {
      constructor(name, formals, actionDict, builtInDefault) {
        this.name = name;
        this.formals = formals;
        this.actionDict = actionDict;
        this.builtInDefault = builtInDefault;
      }
      checkActionDict(grammar) {
        grammar._checkTopDownActionDict(this.typeName, this.name, this.actionDict);
      }
      // Execute this operation on the CST node associated with `nodeWrapper` in the context of the
      // given Semantics instance.
      execute(semantics, nodeWrapper) {
        try {
          const { ctorName } = nodeWrapper._node;
          let actionFn = this.actionDict[ctorName];
          if (actionFn) {
            globalActionStack.push([this, ctorName]);
            return actionFn.apply(nodeWrapper, nodeWrapper._children());
          }
          if (nodeWrapper.isNonterminal()) {
            actionFn = this.actionDict._nonterminal;
            if (actionFn) {
              globalActionStack.push([this, "_nonterminal", ctorName]);
              return actionFn.apply(nodeWrapper, nodeWrapper._children());
            }
          }
          globalActionStack.push([this, "default action", ctorName]);
          return this.actionDict._default.apply(nodeWrapper, nodeWrapper._children());
        } finally {
          globalActionStack.pop();
        }
      }
    };
    Operation.prototype.typeName = "operation";
    var Attribute = class extends Operation {
      constructor(name, actionDict, builtInDefault) {
        super(name, [], actionDict, builtInDefault);
      }
      execute(semantics, nodeWrapper) {
        const node = nodeWrapper._node;
        const key = semantics.attributeKeys[this.name];
        if (!hasOwnProperty(node, key)) {
          node[key] = Operation.prototype.execute.call(this, semantics, nodeWrapper);
        }
        return node[key];
      }
    };
    Attribute.prototype.typeName = "attribute";
    module2.exports = Semantics;
  }
});

// node_modules/ohm-js/src/Grammar.js
var require_Grammar = __commonJS({
  "node_modules/ohm-js/src/Grammar.js"(exports2, module2) {
    "use strict";
    var CaseInsensitiveTerminal = require_CaseInsensitiveTerminal();
    var Matcher = require_Matcher();
    var Semantics = require_Semantics();
    var common = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs();
    var SPECIAL_ACTION_NAMES = ["_iter", "_terminal", "_nonterminal", "_default"];
    function getSortedRuleValues(grammar) {
      return Object.keys(grammar.rules).sort().map((name) => grammar.rules[name]);
    }
    var jsonToJS = (str) => str.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    function Grammar(name, superGrammar, rules, optDefaultStartRule) {
      this.name = name;
      this.superGrammar = superGrammar;
      this.rules = rules;
      if (optDefaultStartRule) {
        if (!(optDefaultStartRule in rules)) {
          throw new Error(
            "Invalid start rule: '" + optDefaultStartRule + "' is not a rule in grammar '" + name + "'"
          );
        }
        this.defaultStartRule = optDefaultStartRule;
      }
    }
    var ohmGrammar;
    var buildGrammar;
    Grammar.initApplicationParser = function(grammar, builderFn) {
      ohmGrammar = grammar;
      buildGrammar = builderFn;
    };
    Grammar.prototype = {
      matcher() {
        return new Matcher(this);
      },
      // Return true if the grammar is a built-in grammar, otherwise false.
      // NOTE: This might give an unexpected result if called before BuiltInRules is defined!
      isBuiltIn() {
        return this === Grammar.ProtoBuiltInRules || this === Grammar.BuiltInRules;
      },
      equals(g2) {
        if (this === g2) {
          return true;
        }
        if (g2 == null || this.name !== g2.name || this.defaultStartRule !== g2.defaultStartRule || !(this.superGrammar === g2.superGrammar || this.superGrammar.equals(g2.superGrammar))) {
          return false;
        }
        const myRules = getSortedRuleValues(this);
        const otherRules = getSortedRuleValues(g2);
        return myRules.length === otherRules.length && myRules.every((rule, i2) => {
          return rule.description === otherRules[i2].description && rule.formals.join(",") === otherRules[i2].formals.join(",") && rule.body.toString() === otherRules[i2].body.toString();
        });
      },
      match(input, optStartApplication) {
        const m2 = this.matcher();
        m2.replaceInputRange(0, 0, input);
        return m2.match(optStartApplication);
      },
      trace(input, optStartApplication) {
        const m2 = this.matcher();
        m2.replaceInputRange(0, 0, input);
        return m2.trace(optStartApplication);
      },
      createSemantics() {
        return Semantics.createSemantics(this);
      },
      extendSemantics(superSemantics) {
        return Semantics.createSemantics(this, superSemantics._getSemantics());
      },
      // Check that every key in `actionDict` corresponds to a semantic action, and that it maps to
      // a function of the correct arity. If not, throw an exception.
      _checkTopDownActionDict(what, name, actionDict) {
        const problems = [];
        for (const k2 in actionDict) {
          const v2 = actionDict[k2];
          const isSpecialAction = SPECIAL_ACTION_NAMES.includes(k2);
          if (!isSpecialAction && !(k2 in this.rules)) {
            problems.push(`'${k2}' is not a valid semantic action for '${this.name}'`);
            continue;
          }
          if (typeof v2 !== "function") {
            problems.push(`'${k2}' must be a function in an action dictionary for '${this.name}'`);
            continue;
          }
          const actual = v2.length;
          const expected = this._topDownActionArity(k2);
          if (actual !== expected) {
            let details;
            if (k2 === "_iter" || k2 === "_nonterminal") {
              details = `it should use a rest parameter, e.g. \`${k2}(...children) {}\`. NOTE: this is new in Ohm v16 \u2014 see https://ohmjs.org/d/ati for details.`;
            } else {
              details = `expected ${expected}, got ${actual}`;
            }
            problems.push(`Semantic action '${k2}' has the wrong arity: ${details}`);
          }
        }
        if (problems.length > 0) {
          const prettyProblems = problems.map((problem) => "- " + problem);
          const error = new Error(
            [
              `Found errors in the action dictionary of the '${name}' ${what}:`,
              ...prettyProblems
            ].join("\n")
          );
          error.problems = problems;
          throw error;
        }
      },
      // Return the expected arity for a semantic action named `actionName`, which
      // is either a rule name or a special action name like '_nonterminal'.
      _topDownActionArity(actionName) {
        return SPECIAL_ACTION_NAMES.includes(actionName) ? 0 : this.rules[actionName].body.getArity();
      },
      _inheritsFrom(grammar) {
        let g2 = this.superGrammar;
        while (g2) {
          if (g2.equals(grammar, true)) {
            return true;
          }
          g2 = g2.superGrammar;
        }
        return false;
      },
      toRecipe(superGrammarExpr = void 0) {
        const metaInfo = {};
        if (this.source) {
          metaInfo.source = this.source.contents;
        }
        let startRule = null;
        if (this.defaultStartRule) {
          startRule = this.defaultStartRule;
        }
        const rules = {};
        Object.keys(this.rules).forEach((ruleName) => {
          const ruleInfo = this.rules[ruleName];
          const { body } = ruleInfo;
          const isDefinition = !this.superGrammar || !this.superGrammar.rules[ruleName];
          let operation;
          if (isDefinition) {
            operation = "define";
          } else {
            operation = body instanceof pexprs.Extend ? "extend" : "override";
          }
          const metaInfo2 = {};
          if (ruleInfo.source && this.source) {
            const adjusted = ruleInfo.source.relativeTo(this.source);
            metaInfo2.sourceInterval = [adjusted.startIdx, adjusted.endIdx];
          }
          const description = isDefinition ? ruleInfo.description : null;
          const bodyRecipe = body.outputRecipe(ruleInfo.formals, this.source);
          rules[ruleName] = [
            operation,
            // "define"/"extend"/"override"
            metaInfo2,
            description,
            ruleInfo.formals,
            bodyRecipe
          ];
        });
        let superGrammarOutput = "null";
        if (superGrammarExpr) {
          superGrammarOutput = superGrammarExpr;
        } else if (this.superGrammar && !this.superGrammar.isBuiltIn()) {
          superGrammarOutput = this.superGrammar.toRecipe();
        }
        const recipeElements = [
          ...["grammar", metaInfo, this.name].map(JSON.stringify),
          superGrammarOutput,
          ...[startRule, rules].map(JSON.stringify)
        ];
        return jsonToJS(`[${recipeElements.join(",")}]`);
      },
      // TODO: Come up with better names for these methods.
      // TODO: Write the analog of these methods for inherited attributes.
      toOperationActionDictionaryTemplate() {
        return this._toOperationOrAttributeActionDictionaryTemplate();
      },
      toAttributeActionDictionaryTemplate() {
        return this._toOperationOrAttributeActionDictionaryTemplate();
      },
      _toOperationOrAttributeActionDictionaryTemplate() {
        const sb = new common.StringBuffer();
        sb.append("{");
        let first = true;
        for (const ruleName in this.rules) {
          const { body } = this.rules[ruleName];
          if (first) {
            first = false;
          } else {
            sb.append(",");
          }
          sb.append("\n");
          sb.append("  ");
          this.addSemanticActionTemplate(ruleName, body, sb);
        }
        sb.append("\n}");
        return sb.contents();
      },
      addSemanticActionTemplate(ruleName, body, sb) {
        sb.append(ruleName);
        sb.append(": function(");
        const arity = this._topDownActionArity(ruleName);
        sb.append(common.repeat("_", arity).join(", "));
        sb.append(") {\n");
        sb.append("  }");
      },
      // Parse a string which expresses a rule application in this grammar, and return the
      // resulting Apply node.
      parseApplication(str) {
        let app;
        if (str.indexOf("<") === -1) {
          app = new pexprs.Apply(str);
        } else {
          const cst = ohmGrammar.match(str, "Base_application");
          app = buildGrammar(cst, {});
        }
        if (!(app.ruleName in this.rules)) {
          throw errors.undeclaredRule(app.ruleName, this.name);
        }
        const { formals } = this.rules[app.ruleName];
        if (formals.length !== app.args.length) {
          const { source } = this.rules[app.ruleName];
          throw errors.wrongNumberOfParameters(
            app.ruleName,
            formals.length,
            app.args.length,
            source
          );
        }
        return app;
      }
    };
    Grammar.ProtoBuiltInRules = new Grammar(
      "ProtoBuiltInRules",
      // name
      void 0,
      // supergrammar
      {
        any: {
          body: pexprs.any,
          formals: [],
          description: "any character",
          primitive: true
        },
        end: {
          body: pexprs.end,
          formals: [],
          description: "end of input",
          primitive: true
        },
        caseInsensitive: {
          body: new CaseInsensitiveTerminal(new pexprs.Param(0)),
          formals: ["str"],
          primitive: true
        },
        lower: {
          body: new pexprs.UnicodeChar("Ll"),
          formals: [],
          description: "a lowercase letter",
          primitive: true
        },
        upper: {
          body: new pexprs.UnicodeChar("Lu"),
          formals: [],
          description: "an uppercase letter",
          primitive: true
        },
        // Union of Lt (titlecase), Lm (modifier), and Lo (other), i.e. any letter not in Ll or Lu.
        unicodeLtmo: {
          body: new pexprs.UnicodeChar("Ltmo"),
          formals: [],
          description: "a Unicode character in Lt, Lm, or Lo",
          primitive: true
        },
        // These rules are not truly primitive (they could be written in userland) but are defined
        // here for bootstrapping purposes.
        spaces: {
          body: new pexprs.Star(new pexprs.Apply("space")),
          formals: []
        },
        space: {
          body: new pexprs.Range("\0", " "),
          formals: [],
          description: "a space"
        }
      }
    );
    module2.exports = Grammar;
  }
});

// node_modules/ohm-js/src/GrammarDecl.js
var require_GrammarDecl = __commonJS({
  "node_modules/ohm-js/src/GrammarDecl.js"(exports2, module2) {
    "use strict";
    var Grammar = require_Grammar();
    var InputStream = require_InputStream();
    var common = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs();
    function GrammarDecl(name) {
      this.name = name;
    }
    GrammarDecl.prototype.sourceInterval = function(startIdx, endIdx) {
      return this.source.subInterval(startIdx, endIdx - startIdx);
    };
    GrammarDecl.prototype.ensureSuperGrammar = function() {
      if (!this.superGrammar) {
        this.withSuperGrammar(
          // TODO: The conditional expression below is an ugly hack. It's kind of ok because
          // I doubt anyone will ever try to declare a grammar called `BuiltInRules`. Still,
          // we should try to find a better way to do this.
          this.name === "BuiltInRules" ? Grammar.ProtoBuiltInRules : Grammar.BuiltInRules
        );
      }
      return this.superGrammar;
    };
    GrammarDecl.prototype.ensureSuperGrammarRuleForOverriding = function(name, source) {
      const ruleInfo = this.ensureSuperGrammar().rules[name];
      if (!ruleInfo) {
        throw errors.cannotOverrideUndeclaredRule(name, this.superGrammar.name, source);
      }
      return ruleInfo;
    };
    GrammarDecl.prototype.installOverriddenOrExtendedRule = function(name, formals, body, source) {
      const duplicateParameterNames = common.getDuplicates(formals);
      if (duplicateParameterNames.length > 0) {
        throw errors.duplicateParameterNames(name, duplicateParameterNames, source);
      }
      const ruleInfo = this.ensureSuperGrammar().rules[name];
      const expectedFormals = ruleInfo.formals;
      const expectedNumFormals = expectedFormals ? expectedFormals.length : 0;
      if (formals.length !== expectedNumFormals) {
        throw errors.wrongNumberOfParameters(name, expectedNumFormals, formals.length, source);
      }
      return this.install(name, formals, body, ruleInfo.description, source);
    };
    GrammarDecl.prototype.install = function(name, formals, body, description, source) {
      this.rules[name] = {
        body: body.introduceParams(formals),
        formals,
        description,
        source
      };
      return this;
    };
    GrammarDecl.prototype.withSuperGrammar = function(superGrammar) {
      if (this.superGrammar) {
        throw new Error("the super grammar of a GrammarDecl cannot be set more than once");
      }
      this.superGrammar = superGrammar;
      this.rules = Object.create(superGrammar.rules);
      if (!superGrammar.isBuiltIn()) {
        this.defaultStartRule = superGrammar.defaultStartRule;
      }
      return this;
    };
    GrammarDecl.prototype.withDefaultStartRule = function(ruleName) {
      this.defaultStartRule = ruleName;
      return this;
    };
    GrammarDecl.prototype.withSource = function(source) {
      this.source = new InputStream(source).interval(0, source.length);
      return this;
    };
    GrammarDecl.prototype.build = function() {
      const grammar = new Grammar(
        this.name,
        this.ensureSuperGrammar(),
        this.rules,
        this.defaultStartRule
      );
      const grammarErrors = [];
      let grammarHasInvalidApplications = false;
      Object.keys(grammar.rules).forEach((ruleName) => {
        const { body } = grammar.rules[ruleName];
        try {
          body.assertChoicesHaveUniformArity(ruleName);
        } catch (e2) {
          grammarErrors.push(e2);
        }
        try {
          body.assertAllApplicationsAreValid(ruleName, grammar);
        } catch (e2) {
          grammarErrors.push(e2);
          grammarHasInvalidApplications = true;
        }
      });
      if (!grammarHasInvalidApplications) {
        Object.keys(grammar.rules).forEach((ruleName) => {
          const { body } = grammar.rules[ruleName];
          try {
            body.assertIteratedExprsAreNotNullable(grammar, []);
          } catch (e2) {
            grammarErrors.push(e2);
          }
        });
      }
      if (grammarErrors.length > 0) {
        errors.throwErrors(grammarErrors);
      }
      if (this.source) {
        grammar.source = this.source;
      }
      return grammar;
    };
    GrammarDecl.prototype.define = function(name, formals, body, description, source) {
      this.ensureSuperGrammar();
      if (this.superGrammar.rules[name]) {
        throw errors.duplicateRuleDeclaration(name, this.name, this.superGrammar.name, source);
      } else if (this.rules[name]) {
        throw errors.duplicateRuleDeclaration(name, this.name, this.name, source);
      }
      const duplicateParameterNames = common.getDuplicates(formals);
      if (duplicateParameterNames.length > 0) {
        throw errors.duplicateParameterNames(name, duplicateParameterNames, source);
      }
      return this.install(name, formals, body, description, source);
    };
    GrammarDecl.prototype.override = function(name, formals, body, descIgnored, source) {
      this.ensureSuperGrammarRuleForOverriding(name, source);
      this.installOverriddenOrExtendedRule(name, formals, body, source);
      return this;
    };
    GrammarDecl.prototype.extend = function(name, formals, fragment, descIgnored, source) {
      const ruleInfo = this.ensureSuperGrammar().rules[name];
      if (!ruleInfo) {
        throw errors.cannotExtendUndeclaredRule(name, this.superGrammar.name, source);
      }
      const body = new pexprs.Extend(this.superGrammar, name, fragment);
      body.source = fragment.source;
      this.installOverriddenOrExtendedRule(name, formals, body, source);
      return this;
    };
    module2.exports = GrammarDecl;
  }
});

// node_modules/ohm-js/src/Builder.js
var require_Builder = __commonJS({
  "node_modules/ohm-js/src/Builder.js"(exports2, module2) {
    "use strict";
    var Grammar = require_Grammar();
    var GrammarDecl = require_GrammarDecl();
    var pexprs = require_pexprs();
    function Builder() {
    }
    Builder.prototype = {
      currentDecl: null,
      currentRuleName: null,
      newGrammar(name) {
        return new GrammarDecl(name);
      },
      grammar(metaInfo, name, superGrammar, defaultStartRule, rules) {
        const gDecl = new GrammarDecl(name);
        if (superGrammar) {
          gDecl.withSuperGrammar(
            superGrammar instanceof Grammar ? superGrammar : this.fromRecipe(superGrammar)
          );
        }
        if (defaultStartRule) {
          gDecl.withDefaultStartRule(defaultStartRule);
        }
        if (metaInfo && metaInfo.source) {
          gDecl.withSource(metaInfo.source);
        }
        this.currentDecl = gDecl;
        Object.keys(rules).forEach((ruleName) => {
          this.currentRuleName = ruleName;
          const ruleRecipe = rules[ruleName];
          const action = ruleRecipe[0];
          const metaInfo2 = ruleRecipe[1];
          const description = ruleRecipe[2];
          const formals = ruleRecipe[3];
          const body = this.fromRecipe(ruleRecipe[4]);
          let source;
          if (gDecl.source && metaInfo2 && metaInfo2.sourceInterval) {
            source = gDecl.source.subInterval(
              metaInfo2.sourceInterval[0],
              metaInfo2.sourceInterval[1] - metaInfo2.sourceInterval[0]
            );
          }
          gDecl[action](ruleName, formals, body, description, source);
        });
        this.currentRuleName = this.currentDecl = null;
        return gDecl.build();
      },
      terminal(x2) {
        return new pexprs.Terminal(x2);
      },
      range(from, to) {
        return new pexprs.Range(from, to);
      },
      param(index) {
        return new pexprs.Param(index);
      },
      alt(...termArgs) {
        let terms = [];
        for (let arg of termArgs) {
          if (!(arg instanceof pexprs.PExpr)) {
            arg = this.fromRecipe(arg);
          }
          if (arg instanceof pexprs.Alt) {
            terms = terms.concat(arg.terms);
          } else {
            terms.push(arg);
          }
        }
        return terms.length === 1 ? terms[0] : new pexprs.Alt(terms);
      },
      seq(...factorArgs) {
        let factors = [];
        for (let arg of factorArgs) {
          if (!(arg instanceof pexprs.PExpr)) {
            arg = this.fromRecipe(arg);
          }
          if (arg instanceof pexprs.Seq) {
            factors = factors.concat(arg.factors);
          } else {
            factors.push(arg);
          }
        }
        return factors.length === 1 ? factors[0] : new pexprs.Seq(factors);
      },
      star(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Star(expr);
      },
      plus(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Plus(expr);
      },
      opt(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Opt(expr);
      },
      not(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Not(expr);
      },
      la(expr) {
        return this.lookahead(expr);
      },
      lookahead(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Lookahead(expr);
      },
      lex(expr) {
        if (!(expr instanceof pexprs.PExpr)) {
          expr = this.fromRecipe(expr);
        }
        return new pexprs.Lex(expr);
      },
      app(ruleName, optParams) {
        if (optParams && optParams.length > 0) {
          optParams = optParams.map(function(param) {
            return param instanceof pexprs.PExpr ? param : this.fromRecipe(param);
          }, this);
        }
        return new pexprs.Apply(ruleName, optParams);
      },
      // Note that unlike other methods in this class, this method cannot be used as a
      // convenience constructor. It only works with recipes, because it relies on
      // `this.currentDecl` and `this.currentRuleName` being set.
      splice(beforeTerms, afterTerms) {
        return new pexprs.Splice(
          this.currentDecl.superGrammar,
          this.currentRuleName,
          beforeTerms.map((term) => this.fromRecipe(term)),
          afterTerms.map((term) => this.fromRecipe(term))
        );
      },
      fromRecipe(recipe) {
        const args = recipe[0] === "grammar" ? recipe.slice(1) : recipe.slice(2);
        const result = this[recipe[0]](...args);
        const metaInfo = recipe[1];
        if (metaInfo) {
          if (metaInfo.sourceInterval && this.currentDecl) {
            result.withSource(this.currentDecl.sourceInterval(...metaInfo.sourceInterval));
          }
        }
        return result;
      }
    };
    module2.exports = Builder;
  }
});

// node_modules/ohm-js/package.json
var require_package = __commonJS({
  "node_modules/ohm-js/package.json"(exports2, module2) {
    module2.exports = {
      name: "ohm-js",
      version: "16.6.0",
      description: "An object-oriented language for parsing and pattern matching",
      repository: "https://github.com/harc/ohm",
      keywords: [
        "parser",
        "compiler",
        "pattern matching",
        "pattern-matching",
        "ometa",
        "ometa/js",
        "ometa-js",
        "ometajs",
        "rapid",
        "prototyping"
      ],
      homepage: "https://ohmjs.org",
      bugs: "https://github.com/harc/ohm/issues",
      main: "index.js",
      module: "dist/ohm.esm.js",
      files: [
        "src",
        "dist",
        "extras",
        "third_party",
        "index.d.ts"
      ],
      types: "index.d.ts",
      scripts: {
        prebootstrap: "bash scripts/prebootstrap",
        bootstrap: "bash scripts/bootstrap --test || (echo 'Bootstrap failed.' && mv -v dist/ohm-grammar.js.old dist/ohm-grammar.js && mv -v dist/built-in-rules.js.old dist/built-in-rules.js && mv -v dist/operations-and-attributes.js.old dist/operations-and-attributes.js)",
        build: "yarn build-debug && webpack --mode=production",
        "build-debug": "webpack --mode=development && yarn build-esm && node scripts/generate-types.mjs",
        "build-esm": "rollup -c rollup.config.mjs",
        clean: "rm -f dist/ohm.js dist/ohm.min.js",
        lint: "eslint . --ignore-path ../.eslintignore",
        format: "prettier . --write --ignore-path ../.prettierignore --config ../.prettierrc && eslint . --ignore-path ../.eslintignore --fix",
        test: "ava && ava --config ava-ts.config.js test/test-typings.ts",
        "test-watch": "ava --watch",
        "pre-commit": "yarn run lint && yarn run build && yarn run test",
        prepublishOnly: "bash scripts/prepublishOnly",
        prepack: "cp ../../README.md . && yarn build",
        postpack: "rm README.md",
        postpublish: "echo '\u{1F449}  Now go to https://github.com/harc/ohm/releases and create a release.'",
        "unsafe-bootstrap": "bash scripts/bootstrap",
        "update-contributors": "bash scripts/update-contributors",
        watch: "webpack --mode=development --watch"
      },
      license: "MIT",
      author: "Alex Warth <alexwarth@gmail.com> (http://tinlizzie.org/~awarth)",
      contributors: [
        "Patrick Dubroy <pdubroy@gmail.com>",
        "Meixian Li <lmeixian@gmail.com>",
        "Marko R\xF6der <m.roeder@photon-software.de>",
        "Tony Garnock-Jones <tonygarnockjones@gmail.com>",
        "Saketh Kasibatla <sake.kasi@gmail.com>",
        "Lionel Landwerlin <llandwerlin@gmail.com>",
        "Jason Merrill <jwmerrill@gmail.com>",
        "Ray Toal <rtoal@lmu.edu>",
        "Yoshiki Ohshima <Yoshiki.Ohshima@acm.org>",
        "megabuz <3299889+megabuz@users.noreply.github.com>",
        "Jonathan Edwards <JonathanMEdwards@gmail.com>",
        "Milan Lajto\u0161 <milan.lajtos@me.com>",
        "Neil Jewers <njjewers@uwaterloo.ca>",
        "stagas <gstagas@gmail.com>",
        "AngryPowman <angrypowman@qq.com>",
        "Arthur Carabott <arthurc@gmail.com>",
        "Casey Olson <casey.m.olson@gmail.com>",
        "Daniel Tomlinson <DanielTomlinson@me.com>",
        "Ian Harris <ian@fofgof.xyz>",
        "Justin Chase <justin.m.chase@gmail.com>",
        "Leslie Ying <acetophore@users.noreply.github.com>",
        "Luca Guzzon <luca.guzzon@gmail.com>",
        "Mike Niebling <(none)>",
        "Patrick Dubroy <patrick@sourcegraph.com>",
        "Pierre Donias <pierre.donias@gmail.com>",
        "Stan Rozenraukh <stan@stanistan.com>",
        "Stephan Seidt <stephan.seidt@gmail.com>",
        "Steve Phillips <steve@tryingtobeawesome.com>",
        "Szymon Kaliski <kaliskiszymon@gmail.com>",
        "Thomas Nyberg <tomnyberg@gmail.com>",
        "Vse Mozhet Byt <vsemozhetbyt@gmail.com>",
        "Wil Chung <10446+iamwilhelm@users.noreply.github.com>",
        "Zachary Sakowitz <zsakowitz@gmail.com>",
        "abego <ub@abego-software.de>",
        "acslk <d_vd415@hotmail.com>",
        "codeZeilen <codeZeilen@users.noreply.github.com>",
        "kassadin <kassadin@foxmail.com>",
        "owch <bowenrainyday@gmail.com>",
        "sfinnie <scott.finnie@gmail.com>"
      ],
      dependencies: {},
      devDependencies: {
        "@ohm-js/cli": "^1.0.0",
        "@rollup/plugin-commonjs": "^21.0.1",
        "@rollup/plugin-json": "^4.1.0",
        "@rollup/plugin-node-resolve": "^13.1.3",
        ava: "^3.15.0",
        "ava-spec": "^1.1.1",
        dedent: "^0.7.0",
        eslint: "^7.9.0",
        "eslint-config-google": "^0.14.0",
        "eslint-plugin-ava": "^11.0.0",
        "eslint-plugin-camelcase-ohm": "^0.2.1",
        "eslint-plugin-no-extension-in-require": "^0.2.0",
        husky: "^4.2.5",
        jsdom: "^9.9.1",
        json: "^9.0.6",
        markscript: "^0.5.0",
        "node-static": "^0.7.11",
        "ohm-grammar-ecmascript": "^1.0.0",
        rollup: "^2.63.0",
        "ts-loader": "^8.0.4",
        "ts-node": "^9.0.0",
        typescript: "^4.0.3",
        "walk-sync": "^2.2.0",
        webpack: "^4.44.2",
        "webpack-cli": "^3.3.12"
      },
      engines: {
        node: ">=0.12.1"
      }
    };
  }
});

// node_modules/ohm-js/src/version.js
var require_version = __commonJS({
  "node_modules/ohm-js/src/version.js"(exports2, module2) {
    "use strict";
    module2.exports = typeof __GLOBAL_OHM_VERSION__ === "string" ? __GLOBAL_OHM_VERSION__ : require_package().version;
  }
});

// node_modules/ohm-js/src/makeRecipe.js
var require_makeRecipe = __commonJS({
  "node_modules/ohm-js/src/makeRecipe.js"(exports2) {
    "use strict";
    var Builder = require_Builder();
    function makeRecipe(recipe) {
      if (typeof recipe === "function") {
        return recipe.call(new Builder());
      } else {
        if (typeof recipe === "string") {
          recipe = JSON.parse(recipe);
        }
        return new Builder().fromRecipe(recipe);
      }
    }
    exports2.makeRecipe = makeRecipe;
  }
});

// node_modules/ohm-js/dist/built-in-rules.js
var require_built_in_rules = __commonJS({
  "node_modules/ohm-js/dist/built-in-rules.js"(exports2, module2) {
    var { makeRecipe } = require_makeRecipe();
    module2.exports = makeRecipe(["grammar", { "source": 'BuiltInRules {\n\n  alnum  (an alpha-numeric character)\n    = letter\n    | digit\n\n  letter  (a letter)\n    = lower\n    | upper\n    | unicodeLtmo\n\n  digit  (a digit)\n    = "0".."9"\n\n  hexDigit  (a hexadecimal digit)\n    = digit\n    | "a".."f"\n    | "A".."F"\n\n  ListOf<elem, sep>\n    = NonemptyListOf<elem, sep>\n    | EmptyListOf<elem, sep>\n\n  NonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  EmptyListOf<elem, sep>\n    = /* nothing */\n\n  listOf<elem, sep>\n    = nonemptyListOf<elem, sep>\n    | emptyListOf<elem, sep>\n\n  nonemptyListOf<elem, sep>\n    = elem (sep elem)*\n\n  emptyListOf<elem, sep>\n    = /* nothing */\n\n  // Allows a syntactic rule application within a lexical context.\n  applySyntactic<app> = app\n}' }, "BuiltInRules", null, null, { "alnum": ["define", { "sourceInterval": [18, 78] }, "an alpha-numeric character", [], ["alt", { "sourceInterval": [60, 78] }, ["app", { "sourceInterval": [60, 66] }, "letter", []], ["app", { "sourceInterval": [73, 78] }, "digit", []]]], "letter": ["define", { "sourceInterval": [82, 142] }, "a letter", [], ["alt", { "sourceInterval": [107, 142] }, ["app", { "sourceInterval": [107, 112] }, "lower", []], ["app", { "sourceInterval": [119, 124] }, "upper", []], ["app", { "sourceInterval": [131, 142] }, "unicodeLtmo", []]]], "digit": ["define", { "sourceInterval": [146, 177] }, "a digit", [], ["range", { "sourceInterval": [169, 177] }, "0", "9"]], "hexDigit": ["define", { "sourceInterval": [181, 254] }, "a hexadecimal digit", [], ["alt", { "sourceInterval": [219, 254] }, ["app", { "sourceInterval": [219, 224] }, "digit", []], ["range", { "sourceInterval": [231, 239] }, "a", "f"], ["range", { "sourceInterval": [246, 254] }, "A", "F"]]], "ListOf": ["define", { "sourceInterval": [258, 336] }, null, ["elem", "sep"], ["alt", { "sourceInterval": [282, 336] }, ["app", { "sourceInterval": [282, 307] }, "NonemptyListOf", [["param", { "sourceInterval": [297, 301] }, 0], ["param", { "sourceInterval": [303, 306] }, 1]]], ["app", { "sourceInterval": [314, 336] }, "EmptyListOf", [["param", { "sourceInterval": [326, 330] }, 0], ["param", { "sourceInterval": [332, 335] }, 1]]]]], "NonemptyListOf": ["define", { "sourceInterval": [340, 388] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [372, 388] }, ["param", { "sourceInterval": [372, 376] }, 0], ["star", { "sourceInterval": [377, 388] }, ["seq", { "sourceInterval": [378, 386] }, ["param", { "sourceInterval": [378, 381] }, 1], ["param", { "sourceInterval": [382, 386] }, 0]]]]], "EmptyListOf": ["define", { "sourceInterval": [392, 434] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [438, 438] }]], "listOf": ["define", { "sourceInterval": [438, 516] }, null, ["elem", "sep"], ["alt", { "sourceInterval": [462, 516] }, ["app", { "sourceInterval": [462, 487] }, "nonemptyListOf", [["param", { "sourceInterval": [477, 481] }, 0], ["param", { "sourceInterval": [483, 486] }, 1]]], ["app", { "sourceInterval": [494, 516] }, "emptyListOf", [["param", { "sourceInterval": [506, 510] }, 0], ["param", { "sourceInterval": [512, 515] }, 1]]]]], "nonemptyListOf": ["define", { "sourceInterval": [520, 568] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [552, 568] }, ["param", { "sourceInterval": [552, 556] }, 0], ["star", { "sourceInterval": [557, 568] }, ["seq", { "sourceInterval": [558, 566] }, ["param", { "sourceInterval": [558, 561] }, 1], ["param", { "sourceInterval": [562, 566] }, 0]]]]], "emptyListOf": ["define", { "sourceInterval": [572, 682] }, null, ["elem", "sep"], ["seq", { "sourceInterval": [685, 685] }]], "applySyntactic": ["define", { "sourceInterval": [685, 710] }, null, ["app"], ["param", { "sourceInterval": [707, 710] }, 0]] }]);
  }
});

// node_modules/ohm-js/src/grammarDeferredInit.js
var require_grammarDeferredInit = __commonJS({
  "node_modules/ohm-js/src/grammarDeferredInit.js"() {
    "use strict";
    var Grammar = require_Grammar();
    Grammar.BuiltInRules = require_built_in_rules();
  }
});

// node_modules/ohm-js/dist/operations-and-attributes.js
var require_operations_and_attributes = __commonJS({
  "node_modules/ohm-js/dist/operations-and-attributes.js"(exports2, module2) {
    var { makeRecipe } = require_makeRecipe();
    module2.exports = makeRecipe(["grammar", { "source": 'OperationsAndAttributes {\n\n  AttributeSignature =\n    name\n\n  OperationSignature =\n    name Formals?\n\n  Formals\n    = "(" ListOf<name, ","> ")"\n\n  name  (a name)\n    = nameFirst nameRest*\n\n  nameFirst\n    = "_"\n    | letter\n\n  nameRest\n    = "_"\n    | alnum\n\n}' }, "OperationsAndAttributes", null, "AttributeSignature", { "AttributeSignature": ["define", { "sourceInterval": [29, 58] }, null, [], ["app", { "sourceInterval": [54, 58] }, "name", []]], "OperationSignature": ["define", { "sourceInterval": [62, 100] }, null, [], ["seq", { "sourceInterval": [87, 100] }, ["app", { "sourceInterval": [87, 91] }, "name", []], ["opt", { "sourceInterval": [92, 100] }, ["app", { "sourceInterval": [92, 99] }, "Formals", []]]]], "Formals": ["define", { "sourceInterval": [104, 143] }, null, [], ["seq", { "sourceInterval": [118, 143] }, ["terminal", { "sourceInterval": [118, 121] }, "("], ["app", { "sourceInterval": [122, 139] }, "ListOf", [["app", { "sourceInterval": [129, 133] }, "name", []], ["terminal", { "sourceInterval": [135, 138] }, ","]]], ["terminal", { "sourceInterval": [140, 143] }, ")"]]], "name": ["define", { "sourceInterval": [147, 187] }, "a name", [], ["seq", { "sourceInterval": [168, 187] }, ["app", { "sourceInterval": [168, 177] }, "nameFirst", []], ["star", { "sourceInterval": [178, 187] }, ["app", { "sourceInterval": [178, 186] }, "nameRest", []]]]], "nameFirst": ["define", { "sourceInterval": [191, 223] }, null, [], ["alt", { "sourceInterval": [207, 223] }, ["terminal", { "sourceInterval": [207, 210] }, "_"], ["app", { "sourceInterval": [217, 223] }, "letter", []]]], "nameRest": ["define", { "sourceInterval": [227, 257] }, null, [], ["alt", { "sourceInterval": [242, 257] }, ["terminal", { "sourceInterval": [242, 245] }, "_"], ["app", { "sourceInterval": [252, 257] }, "alnum", []]]] }]);
  }
});

// node_modules/ohm-js/src/semanticsDeferredInit.js
var require_semanticsDeferredInit = __commonJS({
  "node_modules/ohm-js/src/semanticsDeferredInit.js"() {
    "use strict";
    var Semantics = require_Semantics();
    var util = require_util();
    util.awaitBuiltInRules((builtInRules) => {
      const operationsAndAttributesGrammar = require_operations_and_attributes();
      initBuiltInSemantics(builtInRules);
      initPrototypeParser(operationsAndAttributesGrammar);
    });
    function initBuiltInSemantics(builtInRules) {
      const actions = {
        empty() {
          return this.iteration();
        },
        nonEmpty(first, _2, rest) {
          return this.iteration([first].concat(rest.children));
        }
      };
      Semantics.BuiltInSemantics = Semantics.createSemantics(builtInRules, null).addOperation(
        "asIteration",
        {
          emptyListOf: actions.empty,
          nonemptyListOf: actions.nonEmpty,
          EmptyListOf: actions.empty,
          NonemptyListOf: actions.nonEmpty
        }
      );
    }
    function initPrototypeParser(grammar) {
      Semantics.prototypeGrammarSemantics = grammar.createSemantics().addOperation("parse", {
        AttributeSignature(name) {
          return {
            name: name.parse(),
            formals: []
          };
        },
        OperationSignature(name, optFormals) {
          return {
            name: name.parse(),
            formals: optFormals.children.map((c2) => c2.parse())[0] || []
          };
        },
        Formals(oparen, fs, cparen) {
          return fs.asIteration().children.map((c2) => c2.parse());
        },
        name(first, rest) {
          return this.sourceString;
        }
      });
      Semantics.prototypeGrammar = grammar;
    }
  }
});

// node_modules/ohm-js/src/deferredInit.js
var require_deferredInit = __commonJS({
  "node_modules/ohm-js/src/deferredInit.js"() {
    "use strict";
    require_grammarDeferredInit();
    require_semanticsDeferredInit();
  }
});

// node_modules/ohm-js/dist/ohm-grammar.js
var require_ohm_grammar = __commonJS({
  "node_modules/ohm-js/dist/ohm-grammar.js"(exports2, module2) {
    var { makeRecipe } = require_makeRecipe();
    module2.exports = makeRecipe(["grammar", { "source": `Ohm {

  Grammars
    = Grammar*

  Grammar
    = ident SuperGrammar? "{" Rule* "}"

  SuperGrammar
    = "<:" ident

  Rule
    = ident Formals? ruleDescr? "="  RuleBody  -- define
    | ident Formals?            ":=" OverrideRuleBody  -- override
    | ident Formals?            "+=" RuleBody  -- extend

  RuleBody
    = "|"? NonemptyListOf<TopLevelTerm, "|">

  TopLevelTerm
    = Seq caseName  -- inline
    | Seq

  OverrideRuleBody
    = "|"? NonemptyListOf<OverrideTopLevelTerm, "|">

  OverrideTopLevelTerm
    = "..."  -- superSplice
    | TopLevelTerm

  Formals
    = "<" ListOf<ident, ","> ">"

  Params
    = "<" ListOf<Seq, ","> ">"

  Alt
    = NonemptyListOf<Seq, "|">

  Seq
    = Iter*

  Iter
    = Pred "*"  -- star
    | Pred "+"  -- plus
    | Pred "?"  -- opt
    | Pred

  Pred
    = "~" Lex  -- not
    | "&" Lex  -- lookahead
    | Lex

  Lex
    = "#" Base  -- lex
    | Base

  Base
    = ident Params? ~(ruleDescr? "=" | ":=" | "+=")  -- application
    | oneCharTerminal ".." oneCharTerminal           -- range
    | terminal                                       -- terminal
    | "(" Alt ")"                                    -- paren

  ruleDescr  (a rule description)
    = "(" ruleDescrText ")"

  ruleDescrText
    = (~")" any)*

  caseName
    = "--" (~"\\n" space)* name (~"\\n" space)* ("\\n" | &"}")

  name  (a name)
    = nameFirst nameRest*

  nameFirst
    = "_"
    | letter

  nameRest
    = "_"
    | alnum

  ident  (an identifier)
    = name

  terminal
    = "\\"" terminalChar* "\\""

  oneCharTerminal
    = "\\"" terminalChar "\\""

  terminalChar
    = escapeChar
      | ~"\\\\" ~"\\"" ~"\\n" "\\u{0}".."\\u{10FFFF}"

  escapeChar  (an escape sequence)
    = "\\\\\\\\"                                     -- backslash
    | "\\\\\\""                                     -- doubleQuote
    | "\\\\\\'"                                     -- singleQuote
    | "\\\\b"                                      -- backspace
    | "\\\\n"                                      -- lineFeed
    | "\\\\r"                                      -- carriageReturn
    | "\\\\t"                                      -- tab
    | "\\\\u{" hexDigit hexDigit? hexDigit?
             hexDigit? hexDigit? hexDigit? "}"   -- unicodeCodePoint
    | "\\\\u" hexDigit hexDigit hexDigit hexDigit  -- unicodeEscape
    | "\\\\x" hexDigit hexDigit                    -- hexEscape

  space
   += comment

  comment
    = "//" (~"\\n" any)* &("\\n" | end)  -- singleLine
    | "/*" (~"*/" any)* "*/"  -- multiLine

  tokens = token*

  token = caseName | comment | ident | operator | punctuation | terminal | any

  operator = "<:" | "=" | ":=" | "+=" | "*" | "+" | "?" | "~" | "&"

  punctuation = "<" | ">" | "," | "--"
}` }, "Ohm", null, "Grammars", { "Grammars": ["define", { "sourceInterval": [9, 32] }, null, [], ["star", { "sourceInterval": [24, 32] }, ["app", { "sourceInterval": [24, 31] }, "Grammar", []]]], "Grammar": ["define", { "sourceInterval": [36, 83] }, null, [], ["seq", { "sourceInterval": [50, 83] }, ["app", { "sourceInterval": [50, 55] }, "ident", []], ["opt", { "sourceInterval": [56, 69] }, ["app", { "sourceInterval": [56, 68] }, "SuperGrammar", []]], ["terminal", { "sourceInterval": [70, 73] }, "{"], ["star", { "sourceInterval": [74, 79] }, ["app", { "sourceInterval": [74, 78] }, "Rule", []]], ["terminal", { "sourceInterval": [80, 83] }, "}"]]], "SuperGrammar": ["define", { "sourceInterval": [87, 116] }, null, [], ["seq", { "sourceInterval": [106, 116] }, ["terminal", { "sourceInterval": [106, 110] }, "<:"], ["app", { "sourceInterval": [111, 116] }, "ident", []]]], "Rule_define": ["define", { "sourceInterval": [131, 181] }, null, [], ["seq", { "sourceInterval": [131, 170] }, ["app", { "sourceInterval": [131, 136] }, "ident", []], ["opt", { "sourceInterval": [137, 145] }, ["app", { "sourceInterval": [137, 144] }, "Formals", []]], ["opt", { "sourceInterval": [146, 156] }, ["app", { "sourceInterval": [146, 155] }, "ruleDescr", []]], ["terminal", { "sourceInterval": [157, 160] }, "="], ["app", { "sourceInterval": [162, 170] }, "RuleBody", []]]], "Rule_override": ["define", { "sourceInterval": [188, 248] }, null, [], ["seq", { "sourceInterval": [188, 235] }, ["app", { "sourceInterval": [188, 193] }, "ident", []], ["opt", { "sourceInterval": [194, 202] }, ["app", { "sourceInterval": [194, 201] }, "Formals", []]], ["terminal", { "sourceInterval": [214, 218] }, ":="], ["app", { "sourceInterval": [219, 235] }, "OverrideRuleBody", []]]], "Rule_extend": ["define", { "sourceInterval": [255, 305] }, null, [], ["seq", { "sourceInterval": [255, 294] }, ["app", { "sourceInterval": [255, 260] }, "ident", []], ["opt", { "sourceInterval": [261, 269] }, ["app", { "sourceInterval": [261, 268] }, "Formals", []]], ["terminal", { "sourceInterval": [281, 285] }, "+="], ["app", { "sourceInterval": [286, 294] }, "RuleBody", []]]], "Rule": ["define", { "sourceInterval": [120, 305] }, null, [], ["alt", { "sourceInterval": [131, 305] }, ["app", { "sourceInterval": [131, 170] }, "Rule_define", []], ["app", { "sourceInterval": [188, 235] }, "Rule_override", []], ["app", { "sourceInterval": [255, 294] }, "Rule_extend", []]]], "RuleBody": ["define", { "sourceInterval": [309, 362] }, null, [], ["seq", { "sourceInterval": [324, 362] }, ["opt", { "sourceInterval": [324, 328] }, ["terminal", { "sourceInterval": [324, 327] }, "|"]], ["app", { "sourceInterval": [329, 362] }, "NonemptyListOf", [["app", { "sourceInterval": [344, 356] }, "TopLevelTerm", []], ["terminal", { "sourceInterval": [358, 361] }, "|"]]]]], "TopLevelTerm_inline": ["define", { "sourceInterval": [385, 408] }, null, [], ["seq", { "sourceInterval": [385, 397] }, ["app", { "sourceInterval": [385, 388] }, "Seq", []], ["app", { "sourceInterval": [389, 397] }, "caseName", []]]], "TopLevelTerm": ["define", { "sourceInterval": [366, 418] }, null, [], ["alt", { "sourceInterval": [385, 418] }, ["app", { "sourceInterval": [385, 397] }, "TopLevelTerm_inline", []], ["app", { "sourceInterval": [415, 418] }, "Seq", []]]], "OverrideRuleBody": ["define", { "sourceInterval": [422, 491] }, null, [], ["seq", { "sourceInterval": [445, 491] }, ["opt", { "sourceInterval": [445, 449] }, ["terminal", { "sourceInterval": [445, 448] }, "|"]], ["app", { "sourceInterval": [450, 491] }, "NonemptyListOf", [["app", { "sourceInterval": [465, 485] }, "OverrideTopLevelTerm", []], ["terminal", { "sourceInterval": [487, 490] }, "|"]]]]], "OverrideTopLevelTerm_superSplice": ["define", { "sourceInterval": [522, 543] }, null, [], ["terminal", { "sourceInterval": [522, 527] }, "..."]], "OverrideTopLevelTerm": ["define", { "sourceInterval": [495, 562] }, null, [], ["alt", { "sourceInterval": [522, 562] }, ["app", { "sourceInterval": [522, 527] }, "OverrideTopLevelTerm_superSplice", []], ["app", { "sourceInterval": [550, 562] }, "TopLevelTerm", []]]], "Formals": ["define", { "sourceInterval": [566, 606] }, null, [], ["seq", { "sourceInterval": [580, 606] }, ["terminal", { "sourceInterval": [580, 583] }, "<"], ["app", { "sourceInterval": [584, 602] }, "ListOf", [["app", { "sourceInterval": [591, 596] }, "ident", []], ["terminal", { "sourceInterval": [598, 601] }, ","]]], ["terminal", { "sourceInterval": [603, 606] }, ">"]]], "Params": ["define", { "sourceInterval": [610, 647] }, null, [], ["seq", { "sourceInterval": [623, 647] }, ["terminal", { "sourceInterval": [623, 626] }, "<"], ["app", { "sourceInterval": [627, 643] }, "ListOf", [["app", { "sourceInterval": [634, 637] }, "Seq", []], ["terminal", { "sourceInterval": [639, 642] }, ","]]], ["terminal", { "sourceInterval": [644, 647] }, ">"]]], "Alt": ["define", { "sourceInterval": [651, 685] }, null, [], ["app", { "sourceInterval": [661, 685] }, "NonemptyListOf", [["app", { "sourceInterval": [676, 679] }, "Seq", []], ["terminal", { "sourceInterval": [681, 684] }, "|"]]]], "Seq": ["define", { "sourceInterval": [689, 704] }, null, [], ["star", { "sourceInterval": [699, 704] }, ["app", { "sourceInterval": [699, 703] }, "Iter", []]]], "Iter_star": ["define", { "sourceInterval": [719, 736] }, null, [], ["seq", { "sourceInterval": [719, 727] }, ["app", { "sourceInterval": [719, 723] }, "Pred", []], ["terminal", { "sourceInterval": [724, 727] }, "*"]]], "Iter_plus": ["define", { "sourceInterval": [743, 760] }, null, [], ["seq", { "sourceInterval": [743, 751] }, ["app", { "sourceInterval": [743, 747] }, "Pred", []], ["terminal", { "sourceInterval": [748, 751] }, "+"]]], "Iter_opt": ["define", { "sourceInterval": [767, 783] }, null, [], ["seq", { "sourceInterval": [767, 775] }, ["app", { "sourceInterval": [767, 771] }, "Pred", []], ["terminal", { "sourceInterval": [772, 775] }, "?"]]], "Iter": ["define", { "sourceInterval": [708, 794] }, null, [], ["alt", { "sourceInterval": [719, 794] }, ["app", { "sourceInterval": [719, 727] }, "Iter_star", []], ["app", { "sourceInterval": [743, 751] }, "Iter_plus", []], ["app", { "sourceInterval": [767, 775] }, "Iter_opt", []], ["app", { "sourceInterval": [790, 794] }, "Pred", []]]], "Pred_not": ["define", { "sourceInterval": [809, 824] }, null, [], ["seq", { "sourceInterval": [809, 816] }, ["terminal", { "sourceInterval": [809, 812] }, "~"], ["app", { "sourceInterval": [813, 816] }, "Lex", []]]], "Pred_lookahead": ["define", { "sourceInterval": [831, 852] }, null, [], ["seq", { "sourceInterval": [831, 838] }, ["terminal", { "sourceInterval": [831, 834] }, "&"], ["app", { "sourceInterval": [835, 838] }, "Lex", []]]], "Pred": ["define", { "sourceInterval": [798, 862] }, null, [], ["alt", { "sourceInterval": [809, 862] }, ["app", { "sourceInterval": [809, 816] }, "Pred_not", []], ["app", { "sourceInterval": [831, 838] }, "Pred_lookahead", []], ["app", { "sourceInterval": [859, 862] }, "Lex", []]]], "Lex_lex": ["define", { "sourceInterval": [876, 892] }, null, [], ["seq", { "sourceInterval": [876, 884] }, ["terminal", { "sourceInterval": [876, 879] }, "#"], ["app", { "sourceInterval": [880, 884] }, "Base", []]]], "Lex": ["define", { "sourceInterval": [866, 903] }, null, [], ["alt", { "sourceInterval": [876, 903] }, ["app", { "sourceInterval": [876, 884] }, "Lex_lex", []], ["app", { "sourceInterval": [899, 903] }, "Base", []]]], "Base_application": ["define", { "sourceInterval": [918, 979] }, null, [], ["seq", { "sourceInterval": [918, 963] }, ["app", { "sourceInterval": [918, 923] }, "ident", []], ["opt", { "sourceInterval": [924, 931] }, ["app", { "sourceInterval": [924, 930] }, "Params", []]], ["not", { "sourceInterval": [932, 963] }, ["alt", { "sourceInterval": [934, 962] }, ["seq", { "sourceInterval": [934, 948] }, ["opt", { "sourceInterval": [934, 944] }, ["app", { "sourceInterval": [934, 943] }, "ruleDescr", []]], ["terminal", { "sourceInterval": [945, 948] }, "="]], ["terminal", { "sourceInterval": [951, 955] }, ":="], ["terminal", { "sourceInterval": [958, 962] }, "+="]]]]], "Base_range": ["define", { "sourceInterval": [986, 1041] }, null, [], ["seq", { "sourceInterval": [986, 1022] }, ["app", { "sourceInterval": [986, 1001] }, "oneCharTerminal", []], ["terminal", { "sourceInterval": [1002, 1006] }, ".."], ["app", { "sourceInterval": [1007, 1022] }, "oneCharTerminal", []]]], "Base_terminal": ["define", { "sourceInterval": [1048, 1106] }, null, [], ["app", { "sourceInterval": [1048, 1056] }, "terminal", []]], "Base_paren": ["define", { "sourceInterval": [1113, 1168] }, null, [], ["seq", { "sourceInterval": [1113, 1124] }, ["terminal", { "sourceInterval": [1113, 1116] }, "("], ["app", { "sourceInterval": [1117, 1120] }, "Alt", []], ["terminal", { "sourceInterval": [1121, 1124] }, ")"]]], "Base": ["define", { "sourceInterval": [907, 1168] }, null, [], ["alt", { "sourceInterval": [918, 1168] }, ["app", { "sourceInterval": [918, 963] }, "Base_application", []], ["app", { "sourceInterval": [986, 1022] }, "Base_range", []], ["app", { "sourceInterval": [1048, 1056] }, "Base_terminal", []], ["app", { "sourceInterval": [1113, 1124] }, "Base_paren", []]]], "ruleDescr": ["define", { "sourceInterval": [1172, 1231] }, "a rule description", [], ["seq", { "sourceInterval": [1210, 1231] }, ["terminal", { "sourceInterval": [1210, 1213] }, "("], ["app", { "sourceInterval": [1214, 1227] }, "ruleDescrText", []], ["terminal", { "sourceInterval": [1228, 1231] }, ")"]]], "ruleDescrText": ["define", { "sourceInterval": [1235, 1266] }, null, [], ["star", { "sourceInterval": [1255, 1266] }, ["seq", { "sourceInterval": [1256, 1264] }, ["not", { "sourceInterval": [1256, 1260] }, ["terminal", { "sourceInterval": [1257, 1260] }, ")"]], ["app", { "sourceInterval": [1261, 1264] }, "any", []]]]], "caseName": ["define", { "sourceInterval": [1270, 1338] }, null, [], ["seq", { "sourceInterval": [1285, 1338] }, ["terminal", { "sourceInterval": [1285, 1289] }, "--"], ["star", { "sourceInterval": [1290, 1304] }, ["seq", { "sourceInterval": [1291, 1302] }, ["not", { "sourceInterval": [1291, 1296] }, ["terminal", { "sourceInterval": [1292, 1296] }, "\n"]], ["app", { "sourceInterval": [1297, 1302] }, "space", []]]], ["app", { "sourceInterval": [1305, 1309] }, "name", []], ["star", { "sourceInterval": [1310, 1324] }, ["seq", { "sourceInterval": [1311, 1322] }, ["not", { "sourceInterval": [1311, 1316] }, ["terminal", { "sourceInterval": [1312, 1316] }, "\n"]], ["app", { "sourceInterval": [1317, 1322] }, "space", []]]], ["alt", { "sourceInterval": [1326, 1337] }, ["terminal", { "sourceInterval": [1326, 1330] }, "\n"], ["lookahead", { "sourceInterval": [1333, 1337] }, ["terminal", { "sourceInterval": [1334, 1337] }, "}"]]]]], "name": ["define", { "sourceInterval": [1342, 1382] }, "a name", [], ["seq", { "sourceInterval": [1363, 1382] }, ["app", { "sourceInterval": [1363, 1372] }, "nameFirst", []], ["star", { "sourceInterval": [1373, 1382] }, ["app", { "sourceInterval": [1373, 1381] }, "nameRest", []]]]], "nameFirst": ["define", { "sourceInterval": [1386, 1418] }, null, [], ["alt", { "sourceInterval": [1402, 1418] }, ["terminal", { "sourceInterval": [1402, 1405] }, "_"], ["app", { "sourceInterval": [1412, 1418] }, "letter", []]]], "nameRest": ["define", { "sourceInterval": [1422, 1452] }, null, [], ["alt", { "sourceInterval": [1437, 1452] }, ["terminal", { "sourceInterval": [1437, 1440] }, "_"], ["app", { "sourceInterval": [1447, 1452] }, "alnum", []]]], "ident": ["define", { "sourceInterval": [1456, 1489] }, "an identifier", [], ["app", { "sourceInterval": [1485, 1489] }, "name", []]], "terminal": ["define", { "sourceInterval": [1493, 1531] }, null, [], ["seq", { "sourceInterval": [1508, 1531] }, ["terminal", { "sourceInterval": [1508, 1512] }, '"'], ["star", { "sourceInterval": [1513, 1526] }, ["app", { "sourceInterval": [1513, 1525] }, "terminalChar", []]], ["terminal", { "sourceInterval": [1527, 1531] }, '"']]], "oneCharTerminal": ["define", { "sourceInterval": [1535, 1579] }, null, [], ["seq", { "sourceInterval": [1557, 1579] }, ["terminal", { "sourceInterval": [1557, 1561] }, '"'], ["app", { "sourceInterval": [1562, 1574] }, "terminalChar", []], ["terminal", { "sourceInterval": [1575, 1579] }, '"']]], "terminalChar": ["define", { "sourceInterval": [1583, 1660] }, null, [], ["alt", { "sourceInterval": [1602, 1660] }, ["app", { "sourceInterval": [1602, 1612] }, "escapeChar", []], ["seq", { "sourceInterval": [1621, 1660] }, ["not", { "sourceInterval": [1621, 1626] }, ["terminal", { "sourceInterval": [1622, 1626] }, "\\"]], ["not", { "sourceInterval": [1627, 1632] }, ["terminal", { "sourceInterval": [1628, 1632] }, '"']], ["not", { "sourceInterval": [1633, 1638] }, ["terminal", { "sourceInterval": [1634, 1638] }, "\n"]], ["range", { "sourceInterval": [1639, 1660] }, "\0", "\u{10FFFF}"]]]], "escapeChar_backslash": ["define", { "sourceInterval": [1703, 1758] }, null, [], ["terminal", { "sourceInterval": [1703, 1709] }, "\\\\"]], "escapeChar_doubleQuote": ["define", { "sourceInterval": [1765, 1822] }, null, [], ["terminal", { "sourceInterval": [1765, 1771] }, '\\"']], "escapeChar_singleQuote": ["define", { "sourceInterval": [1829, 1886] }, null, [], ["terminal", { "sourceInterval": [1829, 1835] }, "\\'"]], "escapeChar_backspace": ["define", { "sourceInterval": [1893, 1948] }, null, [], ["terminal", { "sourceInterval": [1893, 1898] }, "\\b"]], "escapeChar_lineFeed": ["define", { "sourceInterval": [1955, 2009] }, null, [], ["terminal", { "sourceInterval": [1955, 1960] }, "\\n"]], "escapeChar_carriageReturn": ["define", { "sourceInterval": [2016, 2076] }, null, [], ["terminal", { "sourceInterval": [2016, 2021] }, "\\r"]], "escapeChar_tab": ["define", { "sourceInterval": [2083, 2132] }, null, [], ["terminal", { "sourceInterval": [2083, 2088] }, "\\t"]], "escapeChar_unicodeCodePoint": ["define", { "sourceInterval": [2139, 2243] }, null, [], ["seq", { "sourceInterval": [2139, 2221] }, ["terminal", { "sourceInterval": [2139, 2145] }, "\\u{"], ["app", { "sourceInterval": [2146, 2154] }, "hexDigit", []], ["opt", { "sourceInterval": [2155, 2164] }, ["app", { "sourceInterval": [2155, 2163] }, "hexDigit", []]], ["opt", { "sourceInterval": [2165, 2174] }, ["app", { "sourceInterval": [2165, 2173] }, "hexDigit", []]], ["opt", { "sourceInterval": [2188, 2197] }, ["app", { "sourceInterval": [2188, 2196] }, "hexDigit", []]], ["opt", { "sourceInterval": [2198, 2207] }, ["app", { "sourceInterval": [2198, 2206] }, "hexDigit", []]], ["opt", { "sourceInterval": [2208, 2217] }, ["app", { "sourceInterval": [2208, 2216] }, "hexDigit", []]], ["terminal", { "sourceInterval": [2218, 2221] }, "}"]]], "escapeChar_unicodeEscape": ["define", { "sourceInterval": [2250, 2309] }, null, [], ["seq", { "sourceInterval": [2250, 2291] }, ["terminal", { "sourceInterval": [2250, 2255] }, "\\u"], ["app", { "sourceInterval": [2256, 2264] }, "hexDigit", []], ["app", { "sourceInterval": [2265, 2273] }, "hexDigit", []], ["app", { "sourceInterval": [2274, 2282] }, "hexDigit", []], ["app", { "sourceInterval": [2283, 2291] }, "hexDigit", []]]], "escapeChar_hexEscape": ["define", { "sourceInterval": [2316, 2371] }, null, [], ["seq", { "sourceInterval": [2316, 2339] }, ["terminal", { "sourceInterval": [2316, 2321] }, "\\x"], ["app", { "sourceInterval": [2322, 2330] }, "hexDigit", []], ["app", { "sourceInterval": [2331, 2339] }, "hexDigit", []]]], "escapeChar": ["define", { "sourceInterval": [1664, 2371] }, "an escape sequence", [], ["alt", { "sourceInterval": [1703, 2371] }, ["app", { "sourceInterval": [1703, 1709] }, "escapeChar_backslash", []], ["app", { "sourceInterval": [1765, 1771] }, "escapeChar_doubleQuote", []], ["app", { "sourceInterval": [1829, 1835] }, "escapeChar_singleQuote", []], ["app", { "sourceInterval": [1893, 1898] }, "escapeChar_backspace", []], ["app", { "sourceInterval": [1955, 1960] }, "escapeChar_lineFeed", []], ["app", { "sourceInterval": [2016, 2021] }, "escapeChar_carriageReturn", []], ["app", { "sourceInterval": [2083, 2088] }, "escapeChar_tab", []], ["app", { "sourceInterval": [2139, 2221] }, "escapeChar_unicodeCodePoint", []], ["app", { "sourceInterval": [2250, 2291] }, "escapeChar_unicodeEscape", []], ["app", { "sourceInterval": [2316, 2339] }, "escapeChar_hexEscape", []]]], "space": ["extend", { "sourceInterval": [2375, 2394] }, null, [], ["app", { "sourceInterval": [2387, 2394] }, "comment", []]], "comment_singleLine": ["define", { "sourceInterval": [2412, 2458] }, null, [], ["seq", { "sourceInterval": [2412, 2443] }, ["terminal", { "sourceInterval": [2412, 2416] }, "//"], ["star", { "sourceInterval": [2417, 2429] }, ["seq", { "sourceInterval": [2418, 2427] }, ["not", { "sourceInterval": [2418, 2423] }, ["terminal", { "sourceInterval": [2419, 2423] }, "\n"]], ["app", { "sourceInterval": [2424, 2427] }, "any", []]]], ["lookahead", { "sourceInterval": [2430, 2443] }, ["alt", { "sourceInterval": [2432, 2442] }, ["terminal", { "sourceInterval": [2432, 2436] }, "\n"], ["app", { "sourceInterval": [2439, 2442] }, "end", []]]]]], "comment_multiLine": ["define", { "sourceInterval": [2465, 2501] }, null, [], ["seq", { "sourceInterval": [2465, 2487] }, ["terminal", { "sourceInterval": [2465, 2469] }, "/*"], ["star", { "sourceInterval": [2470, 2482] }, ["seq", { "sourceInterval": [2471, 2480] }, ["not", { "sourceInterval": [2471, 2476] }, ["terminal", { "sourceInterval": [2472, 2476] }, "*/"]], ["app", { "sourceInterval": [2477, 2480] }, "any", []]]], ["terminal", { "sourceInterval": [2483, 2487] }, "*/"]]], "comment": ["define", { "sourceInterval": [2398, 2501] }, null, [], ["alt", { "sourceInterval": [2412, 2501] }, ["app", { "sourceInterval": [2412, 2443] }, "comment_singleLine", []], ["app", { "sourceInterval": [2465, 2487] }, "comment_multiLine", []]]], "tokens": ["define", { "sourceInterval": [2505, 2520] }, null, [], ["star", { "sourceInterval": [2514, 2520] }, ["app", { "sourceInterval": [2514, 2519] }, "token", []]]], "token": ["define", { "sourceInterval": [2524, 2600] }, null, [], ["alt", { "sourceInterval": [2532, 2600] }, ["app", { "sourceInterval": [2532, 2540] }, "caseName", []], ["app", { "sourceInterval": [2543, 2550] }, "comment", []], ["app", { "sourceInterval": [2553, 2558] }, "ident", []], ["app", { "sourceInterval": [2561, 2569] }, "operator", []], ["app", { "sourceInterval": [2572, 2583] }, "punctuation", []], ["app", { "sourceInterval": [2586, 2594] }, "terminal", []], ["app", { "sourceInterval": [2597, 2600] }, "any", []]]], "operator": ["define", { "sourceInterval": [2604, 2669] }, null, [], ["alt", { "sourceInterval": [2615, 2669] }, ["terminal", { "sourceInterval": [2615, 2619] }, "<:"], ["terminal", { "sourceInterval": [2622, 2625] }, "="], ["terminal", { "sourceInterval": [2628, 2632] }, ":="], ["terminal", { "sourceInterval": [2635, 2639] }, "+="], ["terminal", { "sourceInterval": [2642, 2645] }, "*"], ["terminal", { "sourceInterval": [2648, 2651] }, "+"], ["terminal", { "sourceInterval": [2654, 2657] }, "?"], ["terminal", { "sourceInterval": [2660, 2663] }, "~"], ["terminal", { "sourceInterval": [2666, 2669] }, "&"]]], "punctuation": ["define", { "sourceInterval": [2673, 2709] }, null, [], ["alt", { "sourceInterval": [2687, 2709] }, ["terminal", { "sourceInterval": [2687, 2690] }, "<"], ["terminal", { "sourceInterval": [2693, 2696] }, ">"], ["terminal", { "sourceInterval": [2699, 2702] }, ","], ["terminal", { "sourceInterval": [2705, 2709] }, "--"]]] }]);
  }
});

// node_modules/ohm-js/src/main.js
var require_main = __commonJS({
  "node_modules/ohm-js/src/main.js"(exports2, module2) {
    "use strict";
    var Builder = require_Builder();
    var Grammar = require_Grammar();
    var Namespace = require_Namespace();
    var common = require_common();
    var errors = require_errors();
    var pexprs = require_pexprs();
    var util = require_util();
    var version = require_version();
    var { makeRecipe } = require_makeRecipe();
    var ohmGrammar;
    var superSplicePlaceholder = Object.create(pexprs.PExpr.prototype);
    var isBuffer = (obj) => !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
    function buildGrammar(match, namespace, optOhmGrammarForTesting) {
      const builder = new Builder();
      let decl;
      let currentRuleName;
      let currentRuleFormals;
      let overriding = false;
      const metaGrammar = optOhmGrammarForTesting || ohmGrammar;
      const helpers = metaGrammar.createSemantics().addOperation("visit", {
        Grammars(grammarIter) {
          return grammarIter.children.map((c2) => c2.visit());
        },
        Grammar(id, s2, _open, rules, _close) {
          const grammarName = id.visit();
          decl = builder.newGrammar(grammarName, namespace);
          s2.child(0) && s2.child(0).visit();
          rules.children.map((c2) => c2.visit());
          const g2 = decl.build();
          g2.source = this.source.trimmed();
          if (grammarName in namespace) {
            throw errors.duplicateGrammarDeclaration(g2, namespace);
          }
          namespace[grammarName] = g2;
          return g2;
        },
        SuperGrammar(_2, n2) {
          const superGrammarName = n2.visit();
          if (superGrammarName === "null") {
            decl.withSuperGrammar(null);
          } else {
            if (!namespace || !(superGrammarName in namespace)) {
              throw errors.undeclaredGrammar(superGrammarName, namespace, n2.source);
            }
            decl.withSuperGrammar(namespace[superGrammarName]);
          }
        },
        Rule_define(n2, fs, d2, _2, b2) {
          currentRuleName = n2.visit();
          currentRuleFormals = fs.children.map((c2) => c2.visit())[0] || [];
          if (!decl.defaultStartRule && decl.ensureSuperGrammar() !== Grammar.ProtoBuiltInRules) {
            decl.withDefaultStartRule(currentRuleName);
          }
          const body = b2.visit();
          const description = d2.children.map((c2) => c2.visit())[0];
          const source = this.source.trimmed();
          return decl.define(currentRuleName, currentRuleFormals, body, description, source);
        },
        Rule_override(n2, fs, _2, b2) {
          currentRuleName = n2.visit();
          currentRuleFormals = fs.children.map((c2) => c2.visit())[0] || [];
          const source = this.source.trimmed();
          decl.ensureSuperGrammarRuleForOverriding(currentRuleName, source);
          overriding = true;
          const body = b2.visit();
          overriding = false;
          return decl.override(currentRuleName, currentRuleFormals, body, null, source);
        },
        Rule_extend(n2, fs, _2, b2) {
          currentRuleName = n2.visit();
          currentRuleFormals = fs.children.map((c2) => c2.visit())[0] || [];
          const body = b2.visit();
          const source = this.source.trimmed();
          return decl.extend(currentRuleName, currentRuleFormals, body, null, source);
        },
        RuleBody(_2, terms) {
          return builder.alt(...terms.visit()).withSource(this.source);
        },
        OverrideRuleBody(_2, terms) {
          const args = terms.visit();
          const expansionPos = args.indexOf(superSplicePlaceholder);
          if (expansionPos >= 0) {
            const beforeTerms = args.slice(0, expansionPos);
            const afterTerms = args.slice(expansionPos + 1);
            afterTerms.forEach((t2) => {
              if (t2 === superSplicePlaceholder) throw errors.multipleSuperSplices(t2);
            });
            return new pexprs.Splice(
              decl.superGrammar,
              currentRuleName,
              beforeTerms,
              afterTerms
            ).withSource(this.source);
          } else {
            return builder.alt(...args).withSource(this.source);
          }
        },
        Formals(opointy, fs, cpointy) {
          return fs.visit();
        },
        Params(opointy, ps, cpointy) {
          return ps.visit();
        },
        Alt(seqs) {
          return builder.alt(...seqs.visit()).withSource(this.source);
        },
        TopLevelTerm_inline(b2, n2) {
          const inlineRuleName = currentRuleName + "_" + n2.visit();
          const body = b2.visit();
          const source = this.source.trimmed();
          const isNewRuleDeclaration = !(decl.superGrammar && decl.superGrammar.rules[inlineRuleName]);
          if (overriding && !isNewRuleDeclaration) {
            decl.override(inlineRuleName, currentRuleFormals, body, null, source);
          } else {
            decl.define(inlineRuleName, currentRuleFormals, body, null, source);
          }
          const params = currentRuleFormals.map((formal) => builder.app(formal));
          return builder.app(inlineRuleName, params).withSource(body.source);
        },
        OverrideTopLevelTerm_superSplice(_2) {
          return superSplicePlaceholder;
        },
        Seq(expr) {
          return builder.seq(...expr.children.map((c2) => c2.visit())).withSource(this.source);
        },
        Iter_star(x2, _2) {
          return builder.star(x2.visit()).withSource(this.source);
        },
        Iter_plus(x2, _2) {
          return builder.plus(x2.visit()).withSource(this.source);
        },
        Iter_opt(x2, _2) {
          return builder.opt(x2.visit()).withSource(this.source);
        },
        Pred_not(_2, x2) {
          return builder.not(x2.visit()).withSource(this.source);
        },
        Pred_lookahead(_2, x2) {
          return builder.lookahead(x2.visit()).withSource(this.source);
        },
        Lex_lex(_2, x2) {
          return builder.lex(x2.visit()).withSource(this.source);
        },
        Base_application(rule, ps) {
          const params = ps.children.map((c2) => c2.visit())[0] || [];
          return builder.app(rule.visit(), params).withSource(this.source);
        },
        Base_range(from, _2, to) {
          return builder.range(from.visit(), to.visit()).withSource(this.source);
        },
        Base_terminal(expr) {
          return builder.terminal(expr.visit()).withSource(this.source);
        },
        Base_paren(open, x2, close) {
          return x2.visit();
        },
        ruleDescr(open, t2, close) {
          return t2.visit();
        },
        ruleDescrText(_2) {
          return this.sourceString.trim();
        },
        caseName(_2, space1, n2, space2, end) {
          return n2.visit();
        },
        name(first, rest) {
          return this.sourceString;
        },
        nameFirst(expr) {
        },
        nameRest(expr) {
        },
        terminal(open, cs, close) {
          return cs.children.map((c2) => c2.visit()).join("");
        },
        oneCharTerminal(open, c2, close) {
          return c2.visit();
        },
        escapeChar(c2) {
          try {
            return common.unescapeCodePoint(this.sourceString);
          } catch (err) {
            if (err instanceof RangeError && err.message.startsWith("Invalid code point ")) {
              throw errors.invalidCodePoint(c2);
            }
            throw err;
          }
        },
        NonemptyListOf(x2, _2, xs) {
          return [x2.visit()].concat(xs.children.map((c2) => c2.visit()));
        },
        EmptyListOf() {
          return [];
        },
        _terminal() {
          return this.sourceString;
        }
      });
      return helpers(match).visit();
    }
    function compileAndLoad(source, namespace) {
      const m2 = ohmGrammar.match(source, "Grammars");
      if (m2.failed()) {
        throw errors.grammarSyntaxError(m2);
      }
      return buildGrammar(m2, namespace);
    }
    function grammar(source, optNamespace) {
      const ns = grammars(source, optNamespace);
      const grammarNames = Object.keys(ns);
      if (grammarNames.length === 0) {
        throw new Error("Missing grammar definition");
      } else if (grammarNames.length > 1) {
        const secondGrammar = ns[grammarNames[1]];
        const interval = secondGrammar.source;
        throw new Error(
          util.getLineAndColumnMessage(interval.sourceString, interval.startIdx) + "Found more than one grammar definition -- use ohm.grammars() instead."
        );
      }
      return ns[grammarNames[0]];
    }
    function grammars(source, optNamespace) {
      const ns = Namespace.extend(Namespace.asNamespace(optNamespace));
      if (typeof source !== "string") {
        if (isBuffer(source)) {
          source = source.toString();
        } else {
          throw new TypeError(
            "Expected string as first argument, got " + common.unexpectedObjToString(source)
          );
        }
      }
      compileAndLoad(source, ns);
      return ns;
    }
    function grammarFromScriptElement(optNode) {
      throw new Error(
        "grammarFromScriptElement was removed in Ohm v16.0. See https://ohmjs.org/d/gfs for more info."
      );
    }
    function grammarsFromScriptElements(optNodeOrNodeList) {
      throw new Error(
        "grammarsFromScriptElements was removed in Ohm v16.0. See https://ohmjs.org/d/gfs for more info."
      );
    }
    module2.exports = {
      createNamespace: Namespace.createNamespace,
      grammar,
      grammars,
      grammarFromScriptElement,
      grammarsFromScriptElements,
      makeRecipe,
      ohmGrammar: null,
      // Initialized below, after Grammar.BuiltInRules.
      pexprs,
      util,
      version
    };
    module2.exports._buildGrammar = buildGrammar;
    require_deferredInit();
    util.announceBuiltInRules(Grammar.BuiltInRules);
    module2.exports.ohmGrammar = ohmGrammar = require_ohm_grammar();
    Grammar.initApplicationParser(ohmGrammar, buildGrammar);
  }
});

// node_modules/ohm-js/extras/VisitorFamily.js
var require_VisitorFamily = __commonJS({
  "node_modules/ohm-js/extras/VisitorFamily.js"(exports2, module2) {
    "use strict";
    var { assert } = require_common();
    function getProp(name, thing, fn) {
      return fn(thing[name]);
    }
    function mapProp(name, thing, fn) {
      return thing[name].map(fn);
    }
    function getPropWalkFn(descriptor) {
      const parts = descriptor.split(/ ?\[\]/);
      if (parts.length === 2) {
        return mapProp.bind(null, parts[0]);
      }
      return getProp.bind(null, descriptor);
    }
    function getProps(walkFns, thing, fn) {
      return walkFns.map((walkFn) => walkFn(thing, fn));
    }
    function getWalkFn(shape) {
      if (typeof shape === "string") {
        return getProps.bind(null, [getPropWalkFn(shape)]);
      } else if (Array.isArray(shape)) {
        return getProps.bind(null, shape.map(getPropWalkFn));
      } else {
        assert(typeof shape === "function", "Expected a string, Array, or function");
        assert(shape.length === 2, "Expected a function of arity 2, got " + shape.length);
        return shape;
      }
    }
    function isRestrictedIdentifier(str) {
      return /^[a-zA-Z_][0-9a-zA-Z_]*$/.test(str);
    }
    function trim(s2) {
      return s2.trim();
    }
    function parseSignature(sig) {
      const parts = sig.split(/[()]/).map(trim);
      if (parts.length === 3 && parts[2] === "") {
        const name = parts[0];
        let params = [];
        if (parts[1].length > 0) {
          params = parts[1].split(",").map(trim);
        }
        if (isRestrictedIdentifier(name) && params.every(isRestrictedIdentifier)) {
          return { name, formals: params };
        }
      }
      throw new Error("Invalid operation signature: " + sig);
    }
    function VisitorFamily(config) {
      this._shapes = config.shapes;
      this._getTag = config.getTag;
      this.Adapter = function(thing, family) {
        this._adaptee = thing;
        this._family = family;
      };
      this.Adapter.prototype.valueOf = function() {
        throw new Error("heeey!");
      };
      this.operations = {};
      this._arities = /* @__PURE__ */ Object.create(null);
      this._getChildren = /* @__PURE__ */ Object.create(null);
      Object.keys(this._shapes).forEach((k2) => {
        const shape = this._shapes[k2];
        this._getChildren[k2] = getWalkFn(shape);
        if (typeof shape !== "function") {
          this._arities[k2] = Array.isArray(shape) ? shape.length : 1;
        }
      });
      this._wrap = (thing) => new this.Adapter(thing, this);
    }
    VisitorFamily.prototype.wrap = function(thing) {
      return this._wrap(thing);
    };
    VisitorFamily.prototype._checkActionDict = function(dict) {
      Object.keys(dict).forEach((k2) => {
        assert(k2 in this._getChildren, "Unrecognized action name '" + k2 + "'");
        const action = dict[k2];
        assert(typeof action === "function", "Key '" + k2 + "': expected function, got " + action);
        if (k2 in this._arities) {
          const expected = this._arities[k2];
          const actual = dict[k2].length;
          assert(
            actual === expected,
            "Action '" + k2 + "' has the wrong arity: expected " + expected + ", got " + actual
          );
        }
      });
    };
    VisitorFamily.prototype.addOperation = function(signature, actions) {
      const sig = parseSignature(signature);
      const { name } = sig;
      this._checkActionDict(actions);
      this.operations[name] = {
        name,
        formals: sig.formals,
        actions
      };
      const family = this;
      this.Adapter.prototype[name] = function(...args) {
        const tag = family._getTag(this._adaptee);
        assert(tag in family._getChildren, "getTag returned unrecognized tag '" + tag + "'");
        assert(tag in actions, "No action for '" + tag + "' in operation '" + name + "'");
        const argsObj = /* @__PURE__ */ Object.create(null);
        for (const [i2, val] of Object.entries(args)) {
          argsObj[sig.formals[i2]] = val;
        }
        const oldArgs = this.args;
        this.args = argsObj;
        const ans = actions[tag].apply(
          this,
          family._getChildren[tag](this._adaptee, family._wrap)
        );
        this.args = oldArgs;
        return ans;
      };
      return this;
    };
    module2.exports = VisitorFamily;
  }
});

// node_modules/ohm-js/extras/semantics-toAST.js
var require_semantics_toAST = __commonJS({
  "node_modules/ohm-js/extras/semantics-toAST.js"(exports2, module2) {
    "use strict";
    var defaultOperation = {
      _terminal() {
        return this.sourceString;
      },
      _nonterminal(...children) {
        const { ctorName } = this._node;
        const { mapping } = this.args;
        if (!Object.prototype.hasOwnProperty.call(mapping, ctorName)) {
          if (this.isLexical()) {
            return this.sourceString;
          }
          const realChildren = children.filter((child) => !child.isTerminal());
          if (realChildren.length === 1) {
            return realChildren[0].toAST(mapping);
          }
        }
        if (typeof mapping[ctorName] === "number") {
          return children[mapping[ctorName]].toAST(mapping);
        }
        const propMap = mapping[ctorName] || children;
        const node = {
          type: ctorName
        };
        for (const prop in propMap) {
          const mappedProp = mapping[ctorName] && mapping[ctorName][prop];
          if (typeof mappedProp === "number") {
            node[prop] = children[mappedProp].toAST(mapping);
          } else if (typeof mappedProp === "string" || typeof mappedProp === "boolean" || mappedProp === null) {
            node[prop] = mappedProp;
          } else if (typeof mappedProp === "object" && mappedProp instanceof Number) {
            node[prop] = Number(mappedProp);
          } else if (typeof mappedProp === "function") {
            node[prop] = mappedProp.call(this, children);
          } else if (mappedProp === void 0) {
            if (children[prop] && !children[prop].isTerminal()) {
              node[prop] = children[prop].toAST(mapping);
            } else {
              delete node[prop];
            }
          }
        }
        return node;
      },
      _iter(...children) {
        if (this._node.isOptional()) {
          if (this.numChildren === 0) {
            return null;
          } else {
            return children[0].toAST(this.args.mapping);
          }
        }
        return children.map(function(child) {
          return child.toAST(this.args.mapping);
        }, this);
      },
      NonemptyListOf(first, sep, rest) {
        return [first.toAST(this.args.mapping)].concat(rest.toAST(this.args.mapping));
      },
      EmptyListOf() {
        return [];
      }
    };
    function toAST(res, mapping) {
      if (typeof res.failed !== "function" || res.failed()) {
        throw new Error("toAST() expects a succesful MatchResult as first parameter");
      }
      mapping = Object.assign({}, mapping);
      const operation = Object.assign({}, defaultOperation);
      for (const termName in mapping) {
        if (typeof mapping[termName] === "function") {
          operation[termName] = mapping[termName];
          delete mapping[termName];
        }
      }
      const g2 = res._cst.grammar;
      const s2 = g2.createSemantics().addOperation("toAST(mapping)", operation);
      return s2(res).toAST(mapping);
    }
    function semanticsForToAST(g2) {
      if (typeof g2.createSemantics !== "function") {
        throw new Error("semanticsToAST() expects a Grammar as parameter");
      }
      return g2.createSemantics().addOperation("toAST(mapping)", defaultOperation);
    }
    module2.exports = {
      helper: toAST,
      semantics: semanticsForToAST
    };
  }
});

// node_modules/ohm-js/extras/index.js
var require_extras = __commonJS({
  "node_modules/ohm-js/extras/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      VisitorFamily: require_VisitorFamily(),
      semanticsForToAST: require_semantics_toAST().semantics,
      toAST: require_semantics_toAST().helper
    };
  }
});

// node_modules/ohm-js/index.js
var require_ohm_js = __commonJS({
  "node_modules/ohm-js/index.js"(exports2, module2) {
    "use strict";
    var ohm = require_main();
    ohm.extras = require_extras();
    module2.exports = ohm;
  }
});

// node_modules/@usebruno/lang/v2/src/utils.js
var require_utils = __commonJS({
  "node_modules/@usebruno/lang/v2/src/utils.js"(exports2, module2) {
    var safeParseJson = (json) => {
      try {
        return JSON.parse(json);
      } catch (e2) {
        return null;
      }
    };
    var indentString = (str, levels = 1) => {
      if (!str || !str.length) {
        return str || "";
      }
      const indent = "  ".repeat(levels);
      return str.split(/\r\n|\r|\n/).map((line) => indent + line).join("\n");
    };
    var outdentString = (str, spaces = 2) => {
      if (!str || !str.length) {
        return str || "";
      }
      const spacesRegex = new RegExp(`^ {${spaces}}`);
      return str.split(/\r\n|\r|\n/).map((line) => line.replace(spacesRegex, "")).join("\n");
    };
    var getValueString = (value) => {
      if (!value) {
        return "";
      }
      const hasNewLines = value.includes("\n") || value.includes("\r");
      if (!hasNewLines) {
        return value;
      }
      return `'''
${indentString(value)}
'''`;
    };
    var getKeyString = (key) => {
      const quotableChars = [":", '"', "{", "}", " "];
      return quotableChars.some((char) => key.includes(char)) ? '"' + key.replaceAll('"', '\\"') + '"' : key;
    };
    var getValueUrl = (url) => {
      if (!url) {
        return "";
      }
      const hasNewLines = url.includes("\n") || url.includes("\r");
      if (!hasNewLines) {
        return url;
      }
      return `'''
${indentString(url, 2)}
'''`;
    };
    function serializeAnnotations(annotations) {
      if (!annotations?.length) return "";
      return annotations.map((a2) => {
        if (a2.value === void 0) return `@${a2.name}`;
        if (a2.value.includes("\n")) {
          return `@${a2.name}('''
${indentString(a2.value)}
''')`;
        }
        const quote = a2.value.includes("'") ? '"' : "'";
        return `@${a2.name}(${quote}${a2.value}${quote})`;
      }).join("\n") + "\n";
    }
    module2.exports = {
      safeParseJson,
      indentString,
      outdentString,
      getValueString,
      getKeyString,
      getValueUrl,
      serializeAnnotations
    };
  }
});

// node_modules/@usebruno/lang/v2/src/common/attributes.js
var require_attributes = __commonJS({
  "node_modules/@usebruno/lang/v2/src/common/attributes.js"(exports2, module2) {
    var astBaseAttribute = {
      dictionary(_1, _2, pairlist, _3) {
        return pairlist.ast;
      },
      pairlist(_1, pair, _2, rest) {
        return [pair.ast, ...rest.ast];
      },
      pair(_1, key, _2, _3, _4, value, _5) {
        let res = {};
        if (Array.isArray(value.ast)) {
          res[key.ast] = value.ast;
          return res;
        }
        res[key.ast] = value.ast ? value.ast.trim() : "";
        return res;
      },
      esc_quote_char(_1, quote) {
        return quote.sourceString;
      },
      quoted_key(disabled, _1, chars, _2) {
        return (disabled ? disabled.sourceString : "") + chars.ast.join("");
      },
      key(chars) {
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      textblock(line, _1, rest) {
        return [line.ast, ...rest.ast].join("\n");
      },
      textline(chars) {
        return chars.sourceString;
      },
      textchar(char) {
        return char.sourceString;
      },
      nl(_1, _2) {
        return "";
      },
      st(_2) {
        return "";
      },
      tagend(_1, _2) {
        return "";
      },
      _terminal() {
        return this.sourceString;
      },
      multilinetextblockdelimiter(_2) {
        return "";
      },
      multilinetextblock(_1, content, _2, _3, contentType) {
        const multilineString = content.sourceString.split("\n").map((line) => line.slice(4)).join("\n");
        if (!contentType.sourceString) {
          return multilineString;
        }
        return `${multilineString} ${contentType.sourceString}`;
      },
      singlelinevalue(chars) {
        return chars.sourceString?.trim() || "";
      },
      _iter(...elements) {
        return elements.map((e2) => e2.ast);
      }
    };
    module2.exports = astBaseAttribute;
  }
});

// node_modules/@usebruno/lang/v2/src/common/semantic-utils.js
var require_semantic_utils = __commonJS({
  "node_modules/@usebruno/lang/v2/src/common/semantic-utils.js"(exports2, module2) {
    var _2 = require_lodash();
    var mapPairListToKeyValPairs = (pairList = [], parseEnabled = true) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        if (!parseEnabled) {
          return {
            name,
            value
          };
        }
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        return {
          name,
          value,
          enabled
        };
      });
    };
    var mapRequestParams = (pairList = [], type) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        return {
          name,
          value,
          enabled,
          type
        };
      });
    };
    var multipartExtractContentType = (pair) => {
      if (_2.isString(pair.value)) {
        const match = pair.value.match(/^(.*?)\s*@contentType\((.*?)\)\s*$/s);
        if (match != null && match.length > 2) {
          pair.value = match[1];
          pair.contentType = match[2];
        } else {
          pair.contentType = "";
        }
      }
    };
    var fileExtractContentType = (pair) => {
      if (_2.isString(pair.value)) {
        const match = pair.value.match(/^(.*?)\s*@contentType\((.*?)\)\s*$/s);
        if (match && match.length > 2) {
          pair.value = match[1].trim();
          pair.contentType = match[2].trim();
        } else {
          pair.contentType = "";
        }
      }
    };
    var mapPairListToKeyValPairsMultipart = (pairList = [], parseEnabled = true) => {
      const pairs = mapPairListToKeyValPairs(pairList, parseEnabled);
      return pairs.map((pair) => {
        pair.type = "text";
        multipartExtractContentType(pair);
        if (pair.value.startsWith("@file(") && pair.value.endsWith(")")) {
          let filestr = pair.value.replace(/^@file\(/, "").replace(/\)$/, "");
          pair.type = "file";
          pair.value = filestr.split("|");
        }
        return pair;
      });
    };
    var mapPairListToKeyValPairsFile = (pairList = [], parseEnabled = true) => {
      const pairs = mapPairListToKeyValPairs(pairList, parseEnabled);
      return pairs.map((pair) => {
        fileExtractContentType(pair);
        if (pair.value.startsWith("@file(") && pair.value.endsWith(")")) {
          let filePath = pair.value.replace(/^@file\(/, "").replace(/\)$/, "");
          pair.filePath = filePath;
          pair.selected = pair.enabled;
          delete pair.value;
          delete pair.name;
          delete pair.enabled;
        }
        return pair;
      });
    };
    var concatArrays = (objValue, srcValue) => {
      if (_2.isArray(objValue) && _2.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
    };
    module2.exports = {
      mapPairListToKeyValPairs,
      mapRequestParams,
      multipartExtractContentType,
      fileExtractContentType,
      mapPairListToKeyValPairsMultipart,
      mapPairListToKeyValPairsFile,
      concatArrays
    };
  }
});

// node_modules/@usebruno/lang/v2/src/example/request/bruToJson.js
var require_bruToJson = __commonJS({
  "node_modules/@usebruno/lang/v2/src/example/request/bruToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var { safeParseJson, outdentString } = require_utils();
    var astBaseAttribute = require_attributes();
    var {
      mapPairListToKeyValPairs,
      mapRequestParams,
      mapPairListToKeyValPairsMultipart,
      mapPairListToKeyValPairsFile,
      concatArrays
    } = require_semantic_utils();
    var requestGrammar = ohm.grammar(`Request {
  RequestFile = requestcontent*
  
  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend) any

  // Multiline text block surrounded by '''
  multilinetextblockdelimiter = "'''"
  multilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter st* contenttypeannotation?
  contenttypeannotation = "@contentType(" (~")" any)* ")"

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend nl pair)*
  pair = st* (quoted_key | key) st* ":" st* value st*
  disable_char = "~"
  quote_char = "\\""
  esc_char = "\\\\"
  esc_quote_char = esc_char quote_char
  quoted_key_char = ~(quote_char | esc_quote_char | nl) any
  quoted_key = disable_char? quote_char (esc_quote_char | quoted_key_char)* quote_char
  key = keychar*
  value = list | multilinetextblock | singlelinevalue
  singlelinevalue = valuechar*

  // List
  list = st* "[" nl+ listitems? st* nl+ st* "]"
  listitems = listitem (nl+ listitem)*
  listitem = st+ (alnum | "_" | "-")+ st*

  // Text Blocks
  textblock = textline (~tagend nl textline)*
  textline = textchar*
  textchar = ~nl any

  // Request content
  requestcontent = requesturl | requestmethod | requestmode | requestparamspath | requestparamsquery | requestheaders | requestbodies
  requesturl = "url" st* ":" st* valuechar*
  requestmethod = "method" st* ":" st* valuechar*
  requestmode = "mode" st* ":" st* valuechar*
  requestparamspath = "params:path" st* ":" st* dictionary
  requestparamsquery = "params:query" st* ":" st* dictionary
  requestheaders = "headers" st* ":" st* dictionary
  requestbodies = bodyjson | bodytext | bodyxml | bodysparql | bodygraphql | bodygraphqlvars | bodyformurlencoded | bodymultipart | bodyfile

  // All body types from request side
  bodyjson = "body:json" st* ":" st* "{" nl* textblock tagend
  bodytext = "body:text" st* ":" st* "{" nl* textblock tagend
  bodyxml = "body:xml" st* ":" st* "{" nl* textblock tagend
  bodysparql = "body:sparql" st* ":" st* "{" nl* textblock tagend
  bodygraphql = "body:graphql" st* ":" st* "{" nl* textblock tagend
  bodygraphqlvars = "body:graphql:vars" st* ":" st* "{" nl* textblock tagend
  bodyformurlencoded = "body:form-urlencoded" st* ":" st* dictionary
  bodymultipart = "body:multipart-form" st* ":" st* dictionary
  bodyfile = "body:file" st* ":" st* dictionary
}`);
    var astRequestAttribute = {
      RequestFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {};
        }
        return _2.reduce(
          tags.ast,
          (result, item) => {
            return _2.mergeWith(result, item, concatArrays);
          },
          {}
        );
      },
      requesturl(_1, _22, _3, _4, value) {
        return {
          url: value.sourceString ? value.sourceString.trim() : ""
        };
      },
      requestmethod(_1, _22, _3, _4, value) {
        return {
          method: value.sourceString ? value.sourceString.trim() : ""
        };
      },
      requestmode(_1, _22, _3, _4, value) {
        const modeValue = value.sourceString ? value.sourceString.trim() : "";
        return {
          body: {
            mode: modeValue || "none"
          }
        };
      },
      requestparamspath(_1, _22, _3, _4, dictionary) {
        return {
          params: mapRequestParams(dictionary.ast, "path")
        };
      },
      requestparamsquery(_1, _22, _3, _4, dictionary) {
        return {
          params: mapRequestParams(dictionary.ast, "query")
        };
      },
      requestheaders(_1, _22, _3, _4, dictionary) {
        return {
          headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      // All body types from request side
      bodyjson(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "json",
            json: outdentString(textblock.sourceString)
          }
        };
      },
      bodytext(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "text",
            text: outdentString(textblock.sourceString)
          }
        };
      },
      bodyxml(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "xml",
            xml: outdentString(textblock.sourceString)
          }
        };
      },
      bodysparql(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "sparql",
            sparql: outdentString(textblock.sourceString)
          }
        };
      },
      bodygraphql(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "graphql",
            graphql: {
              query: outdentString(textblock.sourceString)
            }
          }
        };
      },
      bodygraphqlvars(_1, _22, _3, _4, _5, _6, textblock, _8) {
        return {
          body: {
            mode: "graphql",
            graphql: {
              variables: outdentString(textblock.sourceString)
            }
          }
        };
      },
      bodyformurlencoded(_1, _22, _3, _4, dictionary) {
        return {
          body: {
            mode: "formUrlEncoded",
            formUrlEncoded: mapPairListToKeyValPairs(dictionary.ast)
          }
        };
      },
      bodymultipart(_1, _22, _3, _4, dictionary) {
        return {
          body: {
            mode: "multipartForm",
            multipartForm: mapPairListToKeyValPairsMultipart(dictionary.ast)
          }
        };
      },
      bodyfile(_1, _22, _3, _4, dictionary) {
        return {
          body: {
            mode: "file",
            file: mapPairListToKeyValPairsFile(dictionary.ast)
          }
        };
      }
    };
    var grammarSemantics = requestGrammar.createSemantics();
    grammarSemantics.addAttribute("ast", { ...astBaseAttribute, ...astRequestAttribute });
    var parseRequest = (input) => {
      const match = requestGrammar.match(input);
      if (match.succeeded()) {
        let ast = grammarSemantics(match).ast;
        return ast;
      } else {
        console.log("match failed", match);
        throw new Error(match.message);
      }
    };
    module2.exports = parseRequest;
  }
});

// node_modules/@usebruno/lang/v2/src/example/response/bruToJson.js
var require_bruToJson2 = __commonJS({
  "node_modules/@usebruno/lang/v2/src/example/response/bruToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var { safeParseJson, outdentString } = require_utils();
    var astBaseAttribute = require_attributes();
    var { mapPairListToKeyValPairs } = require_semantic_utils();
    var responseGrammar = ohm.grammar(`Response {
  ResponseFile = responsecontent*
  
  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend) any

  // Multiline text block surrounded by '''
  multilinetextblockdelimiter = "'''"
  multilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter st* contenttypeannotation?
  contenttypeannotation = "@contentType(" (~")" any)* ")"

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend nl pair)*
  pair = st* (quoted_key | key) st* ":" st* value st*
  disable_char = "~"
  quote_char = "\\""
  esc_char = "\\\\"
  esc_quote_char = esc_char quote_char
  quoted_key_char = ~(quote_char | esc_quote_char | nl) any
  quoted_key = disable_char? quote_char (esc_quote_char | quoted_key_char)* quote_char
  key = keychar*
  value = list | multilinetextblock | singlelinevalue
  singlelinevalue = valuechar*

  // List
  list = st* "[" nl+ listitems? st* nl+ st* "]"
  listitems = listitem (nl+ listitem)*
  listitem = st+ (alnum | "_" | "-")+ st*

  // Text Blocks
  textblock = textline (~tagend nl textline)*
  textline = textchar*
  textchar = ~nl any

  // Response content
  responsecontent = responseheaders | responsestatus | responsebodyblock
  responseheaders = "headers" st* ":" st* dictionary nl*
  responsestatus = "status" st* ":" st* dictionary nl*
  responsebodyblock = "body" st* ":" st* "{" nl* responsebodyfields tagend
  responsebodyfields = (responsebodytype | responsebodycontentvalue)*
  responsebodytype = st* "type" st* ":" st* valuechar* nl*
  responsebodycontentvalue = st* "content" st* ":" st* multilinetextblock
}`);
    var astResponseAttribute = {
      ResponseFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {};
        }
        const validItems = tags.ast.filter((item) => item && Object.keys(item).length > 0);
        return _2.reduce(validItems, (result, item) => {
          return _2.merge(result, item);
        }, {});
      },
      responsecontent(content) {
        return content.ast;
      },
      responseheaders(_1, _22, _3, _4, dictionary, _6) {
        return { headers: mapPairListToKeyValPairs(dictionary.ast) };
      },
      responsestatus(_1, _22, _3, _4, dictionary, _6) {
        const statusPairs = mapPairListToKeyValPairs(dictionary.ast, false);
        return {
          status: statusPairs.find((p2) => p2.name === "code")?.value || 200,
          statusText: statusPairs.find((p2) => p2.name === "text")?.value || "OK"
        };
      },
      responsebodyblock(_1, _22, _3, _4, _5, _6, responsebodyfields, _8) {
        const bodyData = {};
        if (Array.isArray(responsebodyfields.ast)) {
          responsebodyfields.ast.forEach((field) => {
            if (field && typeof field === "object") {
              if (field.type !== void 0) {
                bodyData.type = field.type;
              }
              if (field.content !== void 0) {
                bodyData.content = field.content;
              }
            }
          });
        }
        return {
          body: bodyData
        };
      },
      responsebodytype(_1, _22, _3, _4, _5, value, _7) {
        return {
          type: value.sourceString ? value.sourceString.trim() : ""
        };
      },
      responsebodycontentvalue(_1, _22, _3, _4, _5, multilinetextblock) {
        const multilineString = multilinetextblock.sourceString?.replace(/^'''|'''$/g, "").replace(/  $/g, "").replace(/^\n|\n$/g, "");
        return {
          content: outdentString(multilineString ?? "", 4)
        };
      }
    };
    var grammarSemantics = responseGrammar.createSemantics();
    grammarSemantics.addAttribute("ast", { ...astBaseAttribute, ...astResponseAttribute });
    var parseResponse = (input) => {
      const match = responseGrammar.match(input);
      if (match.succeeded()) {
        let ast = grammarSemantics(match).ast;
        return ast;
      } else {
        console.log("match failed", match);
        throw new Error(match.message);
      }
    };
    module2.exports = parseResponse;
  }
});

// node_modules/@usebruno/lang/v2/src/example/bruToJson.js
var require_bruToJson3 = __commonJS({
  "node_modules/@usebruno/lang/v2/src/example/bruToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var { safeParseJson, outdentString } = require_utils();
    var parseRequest = require_bruToJson();
    var parseResponse = require_bruToJson2();
    var astBaseAttribute = require_attributes();
    var exampleGrammar = ohm.grammar(`Example {
  ExampleFile = (name | description | request | response)*
  
  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend) any

  // Multiline text block surrounded by '''
  multilinetextblockdelimiter = "'''"
  multilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter st* contenttypeannotation?
  contenttypeannotation = "@contentType(" (~")" any)* ")"

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend nl pair)*
  pair = st* (quoted_key | key) st* ":" st* value st*
  disable_char = "~"
  quote_char = "\\""
  esc_char = "\\\\"
  esc_quote_char = esc_char quote_char
  quoted_key_char = ~(quote_char | esc_quote_char | nl) any
  quoted_key = disable_char? quote_char (esc_quote_char | quoted_key_char)* quote_char
  key = keychar*
  value = list | multilinetextblock | singlelinevalue
  singlelinevalue = valuechar*
  
  // List
  list = st* "[" nl+ listitems? st* nl+ st* "]"
  listitems = listitem (nl+ listitem)*
  listitem = st+ (alnum | "_" | "-")+ st*
  
  // Text Blocks
  textblock = textline (~tagend nl textline)*
  textline = textchar*
  textchar = ~nl any
  textvalue = multilinetextblock | singlelinevalue

  // Root level properties
  name =  "name" st* ":" st* valuechar* st*
  description = "description" st* ":" st* textvalue st*

  // Request block
  request = nl* "request" st* ":" st* "{" nl* requestcontent+ nl* "}" nl*
  requestcontent = (~tagend any)+

  // Response block
  response =  "response" st* ":" st* "{" nl* responsecontent nl* "}" nl*
  responsecontent = (~tagend any)+
}`);
    var astExampleAttribute = {
      ExampleFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {};
        }
        const result = _2.reduce(tags.ast, (acc, item) => {
          return _2.merge(acc, item);
        }, {});
        return result;
      },
      // Root level properties
      name(_1, _22, _3, _4, value, _6) {
        return {
          name: value.sourceString ? value.sourceString.trim() : ""
        };
      },
      description(_1, _22, _3, _4, value, _6) {
        return {
          description: value.ast ? value.ast.trim() : ""
        };
      },
      textvalue(content) {
        return content.ast;
      },
      multilinetextblock(_1, content, _22, _3, contentType) {
        const multilineString = outdentString(content.sourceString);
        if (!contentType.sourceString) {
          return multilineString;
        }
        return `${multilineString} ${contentType.sourceString}`;
      },
      request(_1, _22, _3, _4, _5, _6, _7, requestcontent, _8, _9, _10) {
        if (!requestcontent || !requestcontent.ast || !requestcontent.ast.length) {
          return {};
        }
        const outdentedContent = outdentString(requestcontent.sourceString);
        const parsedRequest = parseRequest(outdentedContent);
        return {
          request: parsedRequest
        };
      },
      requestcontent(chars) {
        return chars.sourceString;
      },
      response(_1, _22, _3, _4, _5, _6, content, _7, _8, _9) {
        const outdentedContent = outdentString(content.sourceString);
        const parsedResponse = parseResponse(outdentedContent);
        return { response: parsedResponse };
      },
      responsecontent(chars) {
        return chars.sourceString;
      }
    };
    var grammarSemantics = exampleGrammar.createSemantics();
    grammarSemantics.addAttribute("ast", { ...astBaseAttribute, ...astExampleAttribute });
    var parseExample = (input) => {
      const match = exampleGrammar.match(input);
      if (match.succeeded()) {
        let ast = grammarSemantics(match).ast;
        return ast;
      } else {
        console.log("match failed", match);
        throw new Error(match.message);
      }
    };
    module2.exports = parseExample;
  }
});

// node_modules/@usebruno/lang/v2/src/bruToJson.js
var require_bruToJson4 = __commonJS({
  "node_modules/@usebruno/lang/v2/src/bruToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var { safeParseJson, outdentString } = require_utils();
    var parseExample = require_bruToJson3();
    var ANNOTATIONS_KEY = /* @__PURE__ */ Symbol("annotations");
    var grammar = ohm.grammar(`Bru {
  BruFile = (meta | http | grpc | ws | query | params | headers | metadata | auths | bodies | varsandassert | script | tests | settings | docs | example)*
  auths = authawsv4 | authbasic | authbearer | authdigest | authNTLM | authOAuth1 | authOAuth2 | authwsse | authapikey | authOauth2Configs
  bodies = bodyjson | bodytext | bodyxml | bodysparql | bodygraphql | bodygraphqlvars | bodyforms | body | bodygrpc | bodyws
  bodyforms = bodyformurlencoded | bodymultipart | bodyfile
  params = paramspath | paramsquery
  
  // Oauth2 additional parameters
  authOauth2Configs = oauth2AuthReqConfig | oauth2AccessTokenReqConfig | oauth2RefreshTokenReqConfig
  oauth2AuthReqConfig = oauth2AuthReqHeaders | oauth2AuthReqQueryParams 
  oauth2AccessTokenReqConfig = oauth2AccessTokenReqHeaders | oauth2AccessTokenReqQueryParams | oauth2AccessTokenReqBody
  oauth2RefreshTokenReqConfig = oauth2RefreshTokenReqHeaders | oauth2RefreshTokenReqQueryParams | oauth2RefreshTokenReqBody
 
  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend) any

   // Multiline text block surrounded by '''
  multilinetextblockdelimiter = "'''"
  multilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter st* contenttypeannotation?
  contenttypeannotation = "@contentType(" (~")" any)* ")"

  // Annotation support (decorators on pairs)
  annotationname = annotationchar+
  annotationchar = ~("(" | ")" | " " | "\\t" | "\\r" | "\\n" | ":") any
  annotationsinglequotedargchar = ~"'" any
  annotationsinglequotedarg = "'" annotationsinglequotedargchar* "'"
  annotationdoublequotedargchar = ~"\\"" any
  annotationdoublequotedarg = "\\"" annotationdoublequotedargchar* "\\""
  annotationunquotedargchar = ~")" any
  annotationunquotedarg = annotationunquotedargchar*
  annotationargvalue = annotationsinglequotedarg | annotationdoublequotedarg | annotationunquotedarg
  annotationmultilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter
  annotationargscontents = annotationmultilinetextblock | annotationargvalue
  annotationargs = "(" annotationargscontents ")"
  annotation = "@" annotationname annotationargs?
  annotationentry = st* annotation ~":" st* nl
  pairannotations = annotationentry*

  // Dictionary Blocks
  dictionary = st* "{" st* pairlist? tagend
  pairlist = optionalnl* pair (~tagend stnl* pair)* (~tagend space)*
  pair = st* pairannotations st* (quoted_key | key) st* ":" st* value st*
  disable_char = "~"
  quote_char = "\\""
  esc_char = "\\\\"
  esc_quote_char = esc_char quote_char
  quoted_key_char = ~(quote_char | esc_quote_char | nl) any
  quoted_key = disable_char? quote_char (esc_quote_char | quoted_key_char)* quote_char
  key = keychar*
  value = list | multilinetextblock | singlelinevalue
  singlelinevalue = valuechar*

  // Dictionary for Assert Block
  assertdictionary = st* "{" assertpairlist? tagend
  assertpairlist = optionalnl* assertpair (~tagend stnl* assertpair)* (~tagend space)*
  assertpair = st* pairannotations st* assertkey st* ":" st* value st*
  assertkey = ~tagend assertkeychar*
  assertkeychar = ~(tagend | nl | ":") any

  // Text Blocks
  textblock = textline (~tagend nl textline)*
  textline = textchar*
  textchar = ~nl any

  // List
  list = st* "[" nl+ listitems? st* nl+ st* "]"
  listitems = listitem (nl+ listitem)*
  listitem = st+ (alnum | "_" | "-")+ st*

  meta = "meta" dictionary
  settings = "settings" dictionary

  http = get | post | put | delete | patch | options | head | connect | trace | httpcustom
  grpc = "grpc" dictionary
  ws = "ws" dictionary
  get = "get" dictionary
  post = "post" dictionary
  put = "put" dictionary
  delete = "delete" dictionary
  patch = "patch" dictionary
  options = "options" dictionary
  head = "head" dictionary
  connect = "connect" dictionary
  trace = "trace" dictionary
  httpcustom = "http" dictionary


  headers = "headers" dictionary
  metadata = "metadata" dictionary

  query = "query" dictionary
  paramspath = "params:path" dictionary
  paramsquery = "params:query" dictionary

  varsandassert = varsreq | varsres | assert
  varsreq = "vars:pre-request" dictionary
  varsres = "vars:post-response" dictionary
  assert = "assert" assertdictionary

  authawsv4 = "auth:awsv4" dictionary
  authbasic = "auth:basic" dictionary
  authbearer = "auth:bearer" dictionary
  authdigest = "auth:digest" dictionary
  authNTLM = "auth:ntlm" dictionary
  authOAuth1 = "auth:oauth1" dictionary
  authOAuth2 = "auth:oauth2" dictionary
  authwsse = "auth:wsse" dictionary
  authapikey = "auth:apikey" dictionary

  oauth2AuthReqHeaders = "auth:oauth2:additional_params:auth_req:headers" dictionary
  oauth2AuthReqQueryParams = "auth:oauth2:additional_params:auth_req:queryparams" dictionary
  oauth2AccessTokenReqHeaders = "auth:oauth2:additional_params:access_token_req:headers" dictionary
  oauth2AccessTokenReqQueryParams = "auth:oauth2:additional_params:access_token_req:queryparams" dictionary
  oauth2AccessTokenReqBody = "auth:oauth2:additional_params:access_token_req:body" dictionary
  oauth2RefreshTokenReqHeaders = "auth:oauth2:additional_params:refresh_token_req:headers" dictionary
  oauth2RefreshTokenReqQueryParams = "auth:oauth2:additional_params:refresh_token_req:queryparams" dictionary
  oauth2RefreshTokenReqBody = "auth:oauth2:additional_params:refresh_token_req:body" dictionary

  body = "body" st* "{" nl* textblock tagend
  bodyjson = "body:json" st* "{" nl* textblock tagend
  bodytext = "body:text" st* "{" nl* textblock tagend
  bodyxml = "body:xml" st* "{" nl* textblock tagend
  bodysparql = "body:sparql" st* "{" nl* textblock tagend
  bodygraphql = "body:graphql" st* "{" nl* textblock tagend
  bodygraphqlvars = "body:graphql:vars" st* "{" nl* textblock tagend
  bodygrpc = "body:grpc" dictionary
  bodyws = "body:ws" dictionary

  bodyformurlencoded = "body:form-urlencoded" dictionary
  bodymultipart = "body:multipart-form" dictionary
  bodyfile = "body:file" dictionary


  // Examples - multiple example blocks
  example = "example" st* "{" nl* examplecontent tagend
  examplecontent = (~tagend any)*
  
  script = scriptreq | scriptres
  scriptreq = "script:pre-request" st* "{" nl* textblock tagend
  scriptres = "script:post-response" st* "{" nl* textblock tagend
  tests = "tests" st* "{" nl* textblock tagend
  docs = "docs" st* "{" nl* textblock tagend
}`);
    var mapPairListToKeyValPairs = (pairList = [], parseEnabled = true) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        const rawAnnotations = pair[ANNOTATIONS_KEY];
        if (!parseEnabled) {
          const result2 = { name, value };
          if (rawAnnotations && rawAnnotations.length) result2.annotations = rawAnnotations;
          return result2;
        }
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        const result = { name, value, enabled };
        if (rawAnnotations && rawAnnotations.length) result.annotations = rawAnnotations;
        return result;
      });
    };
    var mapRequestParams = (pairList = [], type) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        const rawAnnotations = pair[ANNOTATIONS_KEY];
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        const result = { name, value, enabled, type };
        if (rawAnnotations && rawAnnotations.length) result.annotations = rawAnnotations;
        return result;
      });
    };
    var multipartExtractContentType = (pair) => {
      if (_2.isString(pair.value)) {
        const match = pair.value.match(/^(.*?)\s*@contentType\((.*?)\)\s*$/s);
        if (match != null && match.length > 2) {
          pair.value = match[1];
          pair.contentType = match[2];
        } else {
          pair.contentType = "";
        }
      }
    };
    var fileExtractContentType = (pair) => {
      if (_2.isString(pair.value)) {
        const match = pair.value.match(/^(.*?)\s*@contentType\((.*?)\)\s*$/s);
        if (match && match.length > 2) {
          pair.value = match[1].trim();
          pair.contentType = match[2].trim();
        } else {
          pair.contentType = "";
        }
      }
    };
    var mapPairListToKeyValPairsMultipart = (pairList = [], parseEnabled = true) => {
      const pairs = mapPairListToKeyValPairs(pairList, parseEnabled);
      return pairs.map((pair) => {
        pair.type = "text";
        multipartExtractContentType(pair);
        if (pair.value.startsWith("@file(") && pair.value.endsWith(")")) {
          let filestr = pair.value.replace(/^@file\(/, "").replace(/\)$/, "");
          pair.type = "file";
          pair.value = filestr.split("|");
        }
        return pair;
      });
    };
    var mapPairListToKeyValPairsFile = (pairList = [], parseEnabled = true) => {
      const pairs = mapPairListToKeyValPairs(pairList, parseEnabled);
      return pairs.map((pair) => {
        fileExtractContentType(pair);
        if (pair.value.startsWith("@file(") && pair.value.endsWith(")")) {
          let filePath = pair.value.replace(/^@file\(/, "").replace(/\)$/, "");
          pair.filePath = filePath;
          pair.selected = pair.enabled;
          delete pair.value;
          delete pair.name;
          delete pair.enabled;
        }
        return pair;
      });
    };
    var concatArrays = (objValue, srcValue) => {
      if (_2.isArray(objValue) && _2.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
    };
    var mapPairListToKeyValPair = (pairList = []) => {
      if (!pairList || !pairList.length) {
        return {};
      }
      return _2.merge({}, ...pairList[0]);
    };
    var createGetNumFromRecord = (obj) => (key, { fallback } = {}) => {
      if (!(key in obj)) return fallback;
      const asNumber = typeof obj[key] === "number" ? obj[key] : Number(obj[key]);
      if (isNaN(asNumber)) {
        return fallback;
      }
      return asNumber;
    };
    var parseExampleContent = (content) => {
      try {
        const lines = content.split("\n");
        let minIndent = Infinity;
        lines.forEach((line) => {
          if (line.trim() !== "") {
            const indent = line.match(/^[ \t]*/)[0].length;
            minIndent = Math.min(minIndent, indent);
          }
        });
        const unindentedLines = lines.map((line) => {
          if (line.trim() === "") return line;
          return line.substring(minIndent);
        });
        const unindentedContent = unindentedLines.join("\n").trim();
        return parseExample(unindentedContent);
      } catch (error) {
        console.error("Error parsing example content:", error);
        return { error: error.message };
      }
    };
    var sem = grammar.createSemantics().addAttribute("ast", {
      BruFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {};
        }
        return _2.reduce(
          tags.ast,
          (result, item) => {
            return _2.mergeWith(result, item, concatArrays);
          },
          {}
        );
      },
      dictionary(_1, _22, _3, pairlist, _4) {
        return pairlist.ast;
      },
      pairlist(_1, pair, _22, rest, _3) {
        return [pair.ast, ...rest.ast];
      },
      pairannotations(entries) {
        return entries.ast;
      },
      annotationentry(_1, annotation, _22, _3) {
        return annotation.ast;
      },
      annotation(_at, name, argsIter) {
        const annotObj = { name: name.ast };
        const argsArr = argsIter.ast;
        if (argsArr.length > 0) {
          annotObj.value = argsArr[0];
        }
        return annotObj;
      },
      annotationname(chars) {
        return chars.sourceString;
      },
      annotationsinglequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationdoublequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationunquotedarg(chars) {
        return chars.sourceString;
      },
      annotationargvalue(alt) {
        return alt.ast;
      },
      annotationmultilinetextblock(_1, content, _22) {
        const lines = content.sourceString.split("\n");
        let minIndent = 4;
        const dedented = lines.map((line) => line.trim() === "" ? "" : line.substring(minIndent));
        if (dedented.length > 0 && dedented[0] === "") dedented.shift();
        if (dedented.length > 0 && dedented[dedented.length - 1] === "") dedented.pop();
        return dedented.join("\n");
      },
      annotationargscontents(alt) {
        return alt.ast;
      },
      annotationargs(_open, value, _close) {
        return value.ast;
      },
      pair(_1, annotations, _keyindent, key, _22, _3, _4, value, _5) {
        let res = {};
        if (Array.isArray(value.ast)) {
          res[key.ast] = value.ast;
        } else {
          res[key.ast] = value.ast ? value.ast.trim() : "";
        }
        const annotationList = annotations.ast;
        if (annotationList && annotationList.length > 0) {
          res[ANNOTATIONS_KEY] = annotationList;
        }
        return res;
      },
      esc_quote_char(_1, quote) {
        return quote.sourceString;
      },
      quoted_key(disabled, _1, chars, _22) {
        return (disabled ? disabled.sourceString : "") + chars.ast.join("");
      },
      key(chars) {
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      assertdictionary(_1, _22, pairlist, _3) {
        return pairlist.ast;
      },
      assertpairlist(_1, pair, _22, rest, _3) {
        return [pair.ast, ...rest.ast];
      },
      assertpair(_1, annotations, _22, key, _3, _4, _5, value, _6) {
        let res = {};
        res[key.ast] = value.ast ? value.ast.trim() : "";
        const annotationList = annotations.ast;
        if (annotationList && annotationList.length > 0) {
          res[ANNOTATIONS_KEY] = annotationList;
        }
        return res;
      },
      assertkey(chars) {
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      list(_1, _22, _3, listitems, _4, _5, _6, _7) {
        return listitems.ast.flat();
      },
      listitems(listitem, _1, rest) {
        return [listitem.ast, ...rest.ast];
      },
      listitem(_1, textchar, _22) {
        return textchar.sourceString;
      },
      textblock(line, _1, rest) {
        return [line.ast, ...rest.ast].join("\n");
      },
      textline(chars) {
        return chars.sourceString;
      },
      textchar(char) {
        return char.sourceString;
      },
      nl(_1, _22) {
        return "";
      },
      st(_3) {
        return "";
      },
      tagend(_1, _22) {
        return "";
      },
      _terminal() {
        return this.sourceString;
      },
      multilinetextblockdelimiter(_3) {
        return "";
      },
      multilinetextblock(_1, content, _22, _3, contentType) {
        const multilineString = content.sourceString.split("\n").map((line) => line.slice(4)).join("\n");
        if (!contentType.sourceString) {
          return multilineString;
        }
        return `${multilineString} ${contentType.sourceString}`;
      },
      singlelinevalue(chars) {
        return chars.sourceString?.trim() || "";
      },
      _iter(...elements) {
        return elements.map((e2) => e2.ast);
      },
      meta(_1, dictionary) {
        let meta = mapPairListToKeyValPair(dictionary.ast);
        if (!meta.seq) {
          meta.seq = 1;
        }
        if (!meta.type) {
          meta.type = "http";
        }
        return {
          meta
        };
      },
      settings(_1, dictionary) {
        let settings = mapPairListToKeyValPair(dictionary.ast);
        const getNumFromRecord = createGetNumFromRecord(settings);
        const keepAliveInterval = getNumFromRecord("keepAliveInterval");
        const parsedSettings = {};
        if (settings.followRedirects !== void 0) {
          parsedSettings.followRedirects = typeof settings.followRedirects === "boolean" ? settings.followRedirects : settings.followRedirects === "true";
        }
        if (settings.maxRedirects !== void 0) {
          const maxRedirects = parseInt(settings.maxRedirects, 10);
          if (!isNaN(maxRedirects)) {
            parsedSettings.maxRedirects = maxRedirects;
          }
        }
        if (settings.timeout !== void 0) {
          if (settings.timeout === "inherit") {
            parsedSettings.timeout = "inherit";
          } else {
            const timeout = parseInt(settings.timeout, 10);
            if (!isNaN(timeout)) {
              parsedSettings.timeout = timeout;
            }
          }
        }
        const _settings = {
          encodeUrl: typeof settings.encodeUrl === "boolean" ? settings.encodeUrl : settings.encodeUrl === "true",
          timeout: parsedSettings.timeout !== void 0 ? parsedSettings.timeout : 0
        };
        if (parsedSettings.followRedirects !== void 0) {
          _settings.followRedirects = parsedSettings.followRedirects;
        }
        if (parsedSettings.maxRedirects !== void 0) {
          _settings.maxRedirects = parsedSettings.maxRedirects;
        }
        if (keepAliveInterval) {
          _settings.keepAliveInterval = keepAliveInterval;
        }
        return {
          settings: _settings
        };
      },
      grpc(_1, dictionary) {
        return {
          grpc: mapPairListToKeyValPair(dictionary.ast)
        };
      },
      ws(_1, dictionary) {
        return {
          ws: mapPairListToKeyValPair(dictionary.ast)
        };
      },
      get(_1, dictionary) {
        return {
          http: {
            method: "get",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      post(_1, dictionary) {
        return {
          http: {
            method: "post",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      put(_1, dictionary) {
        return {
          http: {
            method: "put",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      delete(_1, dictionary) {
        return {
          http: {
            method: "delete",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      patch(_1, dictionary) {
        return {
          http: {
            method: "patch",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      options(_1, dictionary) {
        return {
          http: {
            method: "options",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      head(_1, dictionary) {
        return {
          http: {
            method: "head",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      connect(_1, dictionary) {
        return {
          http: {
            method: "connect",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      trace(_1, dictionary) {
        return {
          http: {
            method: "trace",
            ...mapPairListToKeyValPair(dictionary.ast)
          }
        };
      },
      httpcustom(_1, dictionary) {
        const dict = mapPairListToKeyValPair(dictionary.ast);
        const method = dict.method;
        const rest = { ...dict };
        delete rest.method;
        return {
          http: {
            method,
            ...rest
          }
        };
      },
      query(_1, dictionary) {
        return {
          params: mapRequestParams(dictionary.ast, "query")
        };
      },
      paramspath(_1, dictionary) {
        return {
          params: mapRequestParams(dictionary.ast, "path")
        };
      },
      paramsquery(_1, dictionary) {
        return {
          params: mapRequestParams(dictionary.ast, "query")
        };
      },
      headers(_1, dictionary) {
        return {
          headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      metadata(_1, dictionary) {
        return {
          metadata: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      authawsv4(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const accessKeyIdKey = _2.find(auth, { name: "accessKeyId" });
        const secretAccessKeyKey = _2.find(auth, { name: "secretAccessKey" });
        const sessionTokenKey = _2.find(auth, { name: "sessionToken" });
        const serviceKey = _2.find(auth, { name: "service" });
        const regionKey = _2.find(auth, { name: "region" });
        const profileNameKey = _2.find(auth, { name: "profileName" });
        const accessKeyId = accessKeyIdKey ? accessKeyIdKey.value : "";
        const secretAccessKey = secretAccessKeyKey ? secretAccessKeyKey.value : "";
        const sessionToken = sessionTokenKey ? sessionTokenKey.value : "";
        const service = serviceKey ? serviceKey.value : "";
        const region = regionKey ? regionKey.value : "";
        const profileName = profileNameKey ? profileNameKey.value : "";
        return {
          auth: {
            awsv4: {
              accessKeyId,
              secretAccessKey,
              sessionToken,
              service,
              region,
              profileName
            }
          }
        };
      },
      authbasic(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        return {
          auth: {
            basic: {
              username,
              password
            }
          }
        };
      },
      authbearer(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const tokenKey = _2.find(auth, { name: "token" });
        const token = tokenKey ? tokenKey.value : "";
        return {
          auth: {
            bearer: {
              token
            }
          }
        };
      },
      authdigest(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        return {
          auth: {
            digest: {
              username,
              password
            }
          }
        };
      },
      authNTLM(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const domainKey = _2.find(auth, { name: "domain" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        const domain = passwordKey ? domainKey.value : "";
        return {
          auth: {
            ntlm: {
              username,
              password,
              domain
            }
          }
        };
      },
      authOAuth1(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const findValue = (name) => {
          const item = _2.find(auth, { name });
          return item ? item.value : "";
        };
        return {
          auth: {
            oauth1: {
              consumerKey: findValue("consumer_key"),
              consumerSecret: findValue("consumer_secret"),
              accessToken: findValue("access_token"),
              accessTokenSecret: findValue("token_secret"),
              callbackUrl: findValue("callback_url"),
              verifier: findValue("verifier"),
              signatureMethod: findValue("signature_method"),
              privateKey: (() => {
                const val = findValue("private_key");
                return val && val.startsWith("@file(") && val.endsWith(")") ? val.slice(6, -1) : val;
              })(),
              privateKeyType: (() => {
                const val = findValue("private_key");
                return val && val.startsWith("@file(") && val.endsWith(")") ? "file" : "text";
              })(),
              timestamp: findValue("timestamp"),
              nonce: findValue("nonce"),
              version: findValue("version"),
              realm: findValue("realm"),
              placement: findValue("placement"),
              includeBodyHash: findValue("include_body_hash") === "true"
            }
          }
        };
      },
      authOAuth2(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const grantTypeKey = _2.find(auth, { name: "grant_type" });
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const callbackUrlKey = _2.find(auth, { name: "callback_url" });
        const authorizationUrlKey = _2.find(auth, { name: "authorization_url" });
        const accessTokenUrlKey = _2.find(auth, { name: "access_token_url" });
        const refreshTokenUrlKey = _2.find(auth, { name: "refresh_token_url" });
        const clientIdKey = _2.find(auth, { name: "client_id" });
        const clientSecretKey = _2.find(auth, { name: "client_secret" });
        const scopeKey = _2.find(auth, { name: "scope" });
        const stateKey = _2.find(auth, { name: "state" });
        const pkceKey = _2.find(auth, { name: "pkce" });
        const credentialsPlacementKey = _2.find(auth, { name: "credentials_placement" });
        const credentialsIdKey = _2.find(auth, { name: "credentials_id" });
        const tokenPlacementKey = _2.find(auth, { name: "token_placement" });
        const tokenHeaderPrefixKey = _2.find(auth, { name: "token_header_prefix" });
        const tokenQueryKeyKey = _2.find(auth, { name: "token_query_key" });
        const autoFetchTokenKey = _2.find(auth, { name: "auto_fetch_token" });
        const autoRefreshTokenKey = _2.find(auth, { name: "auto_refresh_token" });
        const tokenSourceKey = _2.find(auth, { name: "token_source" });
        return {
          auth: {
            oauth2: grantTypeKey?.value && grantTypeKey?.value == "password" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              username: usernameKey ? usernameKey.value : "",
              password: passwordKey ? passwordKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : grantTypeKey?.value && grantTypeKey?.value == "authorization_code" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              callbackUrl: callbackUrlKey ? callbackUrlKey.value : "",
              authorizationUrl: authorizationUrlKey ? authorizationUrlKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              state: stateKey ? stateKey.value : "",
              pkce: pkceKey ? safeParseJson(pkceKey?.value) ?? false : false,
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : grantTypeKey?.value && grantTypeKey?.value == "client_credentials" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : grantTypeKey?.value && grantTypeKey?.value == "implicit" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              callbackUrl: callbackUrlKey ? callbackUrlKey.value : "",
              authorizationUrl: authorizationUrlKey ? authorizationUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              state: stateKey ? stateKey.value : "",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true
            } : {}
          }
        };
      },
      oauth2AuthReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_auth_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AuthReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_auth_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqBody(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_bodyvalues: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqBody(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_bodyvalues: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      authwsse(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const userKey = _2.find(auth, { name: "username" });
        const secretKey = _2.find(auth, { name: "password" });
        const username = userKey ? userKey.value : "";
        const password = secretKey ? secretKey.value : "";
        return {
          auth: {
            wsse: {
              username,
              password
            }
          }
        };
      },
      authapikey(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const findValueByName = (name) => {
          const item = _2.find(auth, { name });
          return item ? item.value : "";
        };
        const key = findValueByName("key");
        const value = findValueByName("value");
        const placement = findValueByName("placement");
        return {
          auth: {
            apikey: {
              key,
              value,
              placement
            }
          }
        };
      },
      bodyformurlencoded(_1, dictionary) {
        return {
          body: {
            formUrlEncoded: mapPairListToKeyValPairs(dictionary.ast)
          }
        };
      },
      bodymultipart(_1, dictionary) {
        return {
          body: {
            multipartForm: mapPairListToKeyValPairsMultipart(dictionary.ast)
          }
        };
      },
      bodyfile(_1, dictionary) {
        return {
          body: {
            file: mapPairListToKeyValPairsFile(dictionary.ast)
          }
        };
      },
      body(_1, _22, _3, _4, textblock, _5) {
        return {
          http: {
            body: "json"
          },
          body: {
            json: outdentString(textblock.sourceString)
          }
        };
      },
      bodyjson(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            json: outdentString(textblock.sourceString)
          }
        };
      },
      bodytext(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            text: outdentString(textblock.sourceString)
          }
        };
      },
      bodyxml(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            xml: outdentString(textblock.sourceString)
          }
        };
      },
      bodysparql(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            sparql: outdentString(textblock.sourceString)
          }
        };
      },
      bodygraphql(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            graphql: {
              query: outdentString(textblock.sourceString)
            }
          }
        };
      },
      bodygraphqlvars(_1, _22, _3, _4, textblock, _5) {
        return {
          body: {
            graphql: {
              variables: outdentString(textblock.sourceString)
            }
          }
        };
      },
      varsreq(_1, dictionary) {
        const vars = mapPairListToKeyValPairs(dictionary.ast);
        _2.each(vars, (v2) => {
          let name = v2.name;
          if (name && name.length && name.charAt(0) === "@") {
            v2.name = name.slice(1);
            v2.local = true;
          } else {
            v2.local = false;
          }
        });
        return {
          vars: {
            req: vars
          }
        };
      },
      varsres(_1, dictionary) {
        const vars = mapPairListToKeyValPairs(dictionary.ast);
        _2.each(vars, (v2) => {
          let name = v2.name;
          if (name && name.length && name.charAt(0) === "@") {
            v2.name = name.slice(1);
            v2.local = true;
          } else {
            v2.local = false;
          }
        });
        return {
          vars: {
            res: vars
          }
        };
      },
      assert(_1, dictionary) {
        return {
          assertions: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      scriptreq(_1, _22, _3, _4, textblock, _5) {
        return {
          script: {
            req: outdentString(textblock.sourceString)
          }
        };
      },
      scriptres(_1, _22, _3, _4, textblock, _5) {
        return {
          script: {
            res: outdentString(textblock.sourceString)
          }
        };
      },
      tests(_1, _22, _3, _4, textblock, _5) {
        return {
          tests: outdentString(textblock.sourceString)
        };
      },
      docs(_1, _22, _3, _4, textblock, _5) {
        return {
          docs: outdentString(textblock.sourceString)
        };
      },
      bodygrpc(_1, dictionary) {
        const pairs = mapPairListToKeyValPairs(dictionary.ast, false);
        const namePair = _2.find(pairs, { name: "name" });
        const contentPair = _2.find(pairs, { name: "content" });
        const messageName = namePair ? namePair.value : "";
        const messageContent = contentPair ? contentPair.value : "";
        return {
          body: {
            mode: "grpc",
            grpc: [{
              name: messageName,
              content: messageContent
            }]
          }
        };
      },
      bodyws(_1, dictionary) {
        const pairs = mapPairListToKeyValPairs(dictionary.ast, false);
        const namePair = _2.find(pairs, { name: "name" });
        const contentPair = _2.find(pairs, { name: "content" });
        const typePair = _2.find(pairs, { name: "type" });
        const messageName = namePair ? namePair.value : "";
        const messageContent = contentPair ? contentPair.value : "";
        const messageTypeContent = typePair ? typePair.value : "";
        return {
          body: {
            mode: "ws",
            ws: [
              {
                name: messageName,
                type: messageTypeContent,
                content: messageContent
              }
            ]
          }
        };
      },
      example(_1, _22, _3, _4, examplecontent, _5) {
        const content = examplecontent.sourceString;
        const parsedExample = parseExampleContent(content);
        return {
          examples: [parsedExample]
        };
      },
      examplecontent(chars) {
        return outdentString(chars.sourceString);
      }
    });
    var parser = (input) => {
      const match = grammar.match(input);
      if (match.succeeded()) {
        let ast = sem(match).ast;
        return ast;
      } else {
        throw new Error(match.message);
      }
    };
    module2.exports = parser;
  }
});

// node_modules/@usebruno/lang/v2/src/example/jsonToBru.js
var require_jsonToBru = __commonJS({
  "node_modules/@usebruno/lang/v2/src/example/jsonToBru.js"(exports2, module2) {
    var { indentString, getValueString } = require_utils();
    var stripLastLine = (text) => {
      if (!text || !text.length) return text;
      return text.replace(/(\r?\n)$/, "");
    };
    var quoteKey = (key) => {
      const quotableChars = [":", '"', "{", "}", " "];
      return quotableChars.some((char) => key.includes(char)) ? '"' + key.replaceAll('"', '\\"') + '"' : key;
    };
    var indentStringCustom = (str, spaces = 4) => {
      if (!str || !str.length) {
        return str || "";
      }
      const indent = " ".repeat(spaces);
      return str.split(/\r\n|\r|\n/).map((line) => indent + line).join("\n");
    };
    var jsonToExampleBru = (json) => {
      const { name, description, request, response } = json;
      const { url, method, params, headers, body } = request || {};
      const { headers: responseHeaders, status: responseStatus, statusText: responseStatusText, body: responseBody } = response || {};
      let bru = "";
      if (name) {
        bru += `name: ${name}
`;
      }
      if (description) {
        const descriptionValue = getValueString(description);
        bru += `description: ${descriptionValue}
`;
      }
      bru += "\nrequest: {\n";
      bru += `  url: ${url}
`;
      bru += `  method: ${method}
`;
      if (request && request.body && request.body.mode) {
        bru += `  mode: ${request.body.mode}
`;
      }
      if (params && params.length) {
        const queryParams = params.filter((param) => param.type === "query");
        const pathParams = params.filter((param) => param.type === "path");
        if (queryParams.length) {
          bru += "  params:query: {\n";
          bru += `${indentStringCustom(queryParams.map((item) => `${item.enabled ? "" : "~"}${quoteKey(item.name)}: ${item.value}`).join("\n"), 4)}`;
          bru += "\n  }\n\n";
        }
        if (pathParams.length) {
          bru += "  params:path: {\n";
          bru += `${indentStringCustom(pathParams.map((item) => `${item.enabled ? "" : "~"}${quoteKey(item.name)}: ${item.value}`).join("\n"), 4)}`;
          bru += "\n  }\n\n";
        }
      }
      if (headers && headers.length) {
        bru += "  headers: {\n";
        bru += `${indentStringCustom(headers.map((item) => `${item.enabled ? "" : "~"}${quoteKey(item.name)}: ${item.value}`).join("\n"), 4)}`;
        bru += "\n  }\n\n";
      }
      if (body && body.json) {
        bru += `  body:json: {
${indentStringCustom(body.json, 4)}
  }

`;
      }
      if (body && body.text) {
        bru += `  body:text: {
${indentStringCustom(body.text, 4)}
  }

`;
      }
      if (body && body.xml) {
        bru += `  body:xml: {
${indentStringCustom(body.xml, 4)}
  }

`;
      }
      if (body && body.sparql) {
        bru += `  body:sparql: {
${indentStringCustom(body.sparql, 4)}
  }

`;
      }
      if (body && body.graphql && body.graphql.query) {
        bru += `  body:graphql: {
${indentStringCustom(body.graphql.query, 4)}
  }

`;
      }
      if (body && body.graphql && body.graphql.variables) {
        bru += `  body:graphql:vars: {
${indentStringCustom(body.graphql.variables, 4)}
  }

`;
      }
      if (body && body.formUrlEncoded && body.formUrlEncoded.length) {
        bru += `  body:form-urlencoded: {
`;
        const enabledValues = body.formUrlEncoded.filter((item) => item.enabled).map((item) => `${quoteKey(item.name)}: ${item.value}`).join("\n");
        const disabledValues = body.formUrlEncoded.filter((item) => !item.enabled).map((item) => `~${quoteKey(item.name)}: ${item.value}`).join("\n");
        if (enabledValues) {
          bru += `${indentStringCustom(enabledValues, 4)}
`;
        }
        if (disabledValues) {
          bru += `${indentStringCustom(disabledValues, 4)}
`;
        }
        bru += "  }\n\n";
      }
      if (body && body.multipartForm && body.multipartForm.length) {
        bru += `  body:multipart-form: {
`;
        const multipartForms = body.multipartForm;
        if (multipartForms.length) {
          bru += `${indentStringCustom(multipartForms.map((item) => {
            const enabled = item.enabled ? "" : "~";
            const contentType = item.contentType && item.contentType !== "" ? " @contentType(" + item.contentType + ")" : "";
            if (item.type === "text") {
              const valueString = getValueString(item.value);
              return `${enabled}${quoteKey(item.name)}: ${valueString}${contentType}`;
            }
            if (item.type === "file") {
              const filepaths = Array.isArray(item.value) ? item.value : [];
              const filestr = filepaths.join("|");
              const value = `@file(${filestr})`;
              return `${enabled}${quoteKey(item.name)}: ${value}${contentType}`;
            }
          }).join("\n"), 4)}
`;
        }
        bru += "  }\n\n";
      }
      if (body && body.file && body.file.length) {
        bru += `  body:file: {
`;
        const files = body.file;
        if (files.length) {
          bru += `${indentStringCustom(files.map((item) => {
            const selected = item.selected ? "" : "~";
            const contentType = item.contentType && item.contentType !== "" ? " @contentType(" + item.contentType + ")" : "";
            const filePath = item.filePath || "";
            const value = `@file(${filePath})`;
            const itemName = "file";
            return `${selected}${quoteKey(itemName)}: ${value}${contentType}`;
          }).join("\n"), 4)}
`;
        }
        bru += "  }\n\n";
      }
      if (bru.endsWith("\n\n")) {
        bru = stripLastLine(bru);
      }
      bru += "}\n\n";
      if (response) {
        bru += "response: {\n";
        if (responseHeaders && responseHeaders.length) {
          bru += "  headers: {\n";
          bru += `${indentStringCustom(responseHeaders.map((item) => `${quoteKey(item.name)}: ${item.value}`).join("\n"), 4)}`;
          bru += "\n  }\n\n";
        }
        if (responseStatus || responseStatusText) {
          bru += "  status: {\n";
          if (responseStatus !== void 0) {
            bru += `    code: ${responseStatus}
`;
          }
          if (responseStatusText !== void 0) {
            bru += `    text: ${responseStatusText}
`;
          }
          bru += "  }\n\n";
        }
        if (responseBody) {
          bru += "  body: {\n";
          if (responseBody.type) {
            bru += `    type: ${responseBody.type}
`;
          }
          if (responseBody.content !== void 0) {
            let contentString = typeof responseBody.content === "string" ? responseBody.content : JSON.stringify(responseBody.content, null, 2);
            bru += `    content: '''
${indentStringCustom(contentString, 6)}
    '''
`;
          }
          bru += "  }\n\n";
        }
        bru = stripLastLine(bru);
        bru += "}";
      }
      while (bru.endsWith("\n")) {
        bru = stripLastLine(bru);
      }
      return bru;
    };
    module2.exports = jsonToExampleBru;
  }
});

// node_modules/@usebruno/lang/v2/src/jsonToBru.js
var require_jsonToBru2 = __commonJS({
  "node_modules/@usebruno/lang/v2/src/jsonToBru.js"(exports2, module2) {
    var _2 = require_lodash();
    var { indentString, getValueString, getKeyString, getValueUrl, serializeAnnotations } = require_utils();
    var jsonToExampleBru = require_jsonToBru();
    var enabled = (items = [], key = "enabled") => items.filter((item) => item[key]);
    var disabled = (items = [], key = "enabled") => items.filter((item) => !item[key]);
    var stripLastLine = (text) => {
      if (!text || !text.length) return text;
      return text.replace(/(\r?\n)$/, "");
    };
    var jsonToBru = (json) => {
      const { meta, http, grpc, ws, params, headers, metadata, auth, body, script, tests, vars, assertions, settings, docs, examples } = json;
      let bru = "";
      if (meta) {
        bru += "meta {\n";
        const tags = meta.tags;
        delete meta.tags;
        for (const key in meta) {
          bru += `  ${key}: ${meta[key]}
`;
        }
        if (tags && tags.length) {
          bru += `  tags: [
`;
          for (const tag of tags) {
            bru += `    ${tag}
`;
          }
          bru += `  ]
`;
        }
        bru += "}\n\n";
      }
      if (http?.method) {
        const { method, url, body: body2, auth: auth2 } = http;
        const standardMethods = /* @__PURE__ */ new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace", "connect"]);
        const isStandard = standardMethods.has(method);
        bru += isStandard ? `${method} {` : `http {
  method: ${method}`;
        bru += `
  url: ${getValueUrl(url)}`;
        if (body2?.length) {
          bru += `
  body: ${body2}`;
        }
        if (auth2?.length) {
          bru += `
  auth: ${auth2}`;
        }
        bru += `
}

`;
      }
      if (grpc && grpc.url) {
        bru += `grpc {
  url: ${grpc.url}`;
        if (grpc.method && grpc.method.length) {
          bru += `
  method: ${grpc.method}`;
        }
        if (grpc.body && grpc.body.length) {
          bru += `
  body: ${grpc.body}`;
        }
        if (grpc.protoPath && grpc.protoPath.length) {
          bru += `
  protoPath: ${grpc.protoPath}`;
        }
        if (grpc.auth && grpc.auth.length) {
          bru += `
  auth: ${grpc.auth}`;
        }
        if (grpc.methodType && grpc.methodType.length) {
          bru += `
  methodType: ${grpc.methodType}`;
        }
        bru += `
}

`;
      }
      if (ws && ws.url) {
        bru += `ws {
  url: ${ws.url}`;
        if (ws.body && ws.body.length) {
          bru += `
  body: ${ws.body}`;
        }
        if (ws.auth && ws.auth.length) {
          bru += `
  auth: ${ws.auth}`;
        }
        if (ws.methodType && ws.methodType.length) {
          bru += `
  methodType: ${ws.methodType}`;
        }
        bru += `
}

`;
      }
      if (params && params.length) {
        const queryParams = params.filter((param) => param.type === "query");
        const pathParams = params.filter((param) => param.type === "path");
        if (queryParams.length) {
          bru += "params:query {";
          if (enabled(queryParams).length) {
            bru += `
${indentString(
              enabled(queryParams).map((item) => `${serializeAnnotations(item.annotations)}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}`;
          }
          if (disabled(queryParams).length) {
            bru += `
${indentString(
              disabled(queryParams).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}`;
          }
          bru += "\n}\n\n";
        }
        if (pathParams.length) {
          bru += "params:path {";
          bru += `
${indentString(pathParams.map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
          bru += "\n}\n\n";
        }
      }
      if (headers && headers.length) {
        bru += "headers {";
        if (enabled(headers).length) {
          bru += `
${indentString(
            enabled(headers).map((item) => `${serializeAnnotations(item.annotations)}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        if (disabled(headers).length) {
          bru += `
${indentString(
            disabled(headers).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (metadata && metadata.length) {
        bru += "metadata {";
        if (enabled(metadata).length) {
          bru += `
${indentString(
            enabled(metadata).map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        if (disabled(metadata).length) {
          bru += `
${indentString(
            disabled(metadata).map((item) => `${serializeAnnotations(item.annotations)}~${item.name}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (auth && auth.awsv4) {
        bru += `auth:awsv4 {
${indentString(`accessKeyId: ${auth?.awsv4?.accessKeyId || ""}`)}
${indentString(`secretAccessKey: ${auth?.awsv4?.secretAccessKey || ""}`)}
${indentString(`sessionToken: ${auth?.awsv4?.sessionToken || ""}`)}
${indentString(`service: ${auth?.awsv4?.service || ""}`)}
${indentString(`region: ${auth?.awsv4?.region || ""}`)}
${indentString(`profileName: ${auth?.awsv4?.profileName || ""}`)}
}

`;
      }
      if (auth && auth.basic) {
        bru += `auth:basic {
${indentString(`username: ${auth?.basic?.username || ""}`)}
${indentString(`password: ${auth?.basic?.password || ""}`)}
}

`;
      }
      if (auth && auth.wsse) {
        bru += `auth:wsse {
${indentString(`username: ${auth?.wsse?.username || ""}`)}
${indentString(`password: ${auth?.wsse?.password || ""}`)}
}

`;
      }
      if (auth && auth.bearer) {
        bru += `auth:bearer {
${indentString(`token: ${auth?.bearer?.token || ""}`)}
}

`;
      }
      if (auth && auth.digest) {
        bru += `auth:digest {
${indentString(`username: ${auth?.digest?.username || ""}`)}
${indentString(`password: ${auth?.digest?.password || ""}`)}
}

`;
      }
      if (auth && auth.ntlm) {
        bru += `auth:ntlm {
${indentString(`username: ${auth?.ntlm?.username || ""}`)}
${indentString(`password: ${auth?.ntlm?.password || ""}`)}
${indentString(`domain: ${auth?.ntlm?.domain || ""}`)}

}

`;
      }
      if (auth && auth.oauth1) {
        bru += `auth:oauth1 {
${indentString(`consumer_key: ${auth?.oauth1?.consumerKey || ""}`)}
${indentString(`consumer_secret: ${auth?.oauth1?.consumerSecret || ""}`)}
${indentString(`access_token: ${auth?.oauth1?.accessToken || ""}`)}
${indentString(`token_secret: ${auth?.oauth1?.accessTokenSecret || ""}`)}
${indentString(`callback_url: ${auth?.oauth1?.callbackUrl || ""}`)}
${indentString(`verifier: ${auth?.oauth1?.verifier || ""}`)}
${indentString(`signature_method: ${auth?.oauth1?.signatureMethod || ""}`)}
${indentString(`private_key: ${auth?.oauth1?.privateKeyType === "file" ? `@file(${auth?.oauth1?.privateKey || ""})` : getValueString(auth?.oauth1?.privateKey || "")}`)}
${indentString(`timestamp: ${auth?.oauth1?.timestamp || ""}`)}
${indentString(`nonce: ${auth?.oauth1?.nonce || ""}`)}
${indentString(`version: ${auth?.oauth1?.version || ""}`)}
${indentString(`realm: ${auth?.oauth1?.realm || ""}`)}
${indentString(`placement: ${auth?.oauth1?.placement || ""}`)}
${indentString(`include_body_hash: ${(auth?.oauth1?.includeBodyHash || false).toString()}`)}
}

`;
      }
      if (auth && auth.oauth2) {
        switch (auth?.oauth2?.grantType) {
          case "password":
            bru += `auth:oauth2 {
${indentString(`grant_type: password`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`username: ${auth?.oauth2?.username || ""}`)}
${indentString(`password: ${auth?.oauth2?.password || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
          case "authorization_code":
            bru += `auth:oauth2 {
${indentString(`grant_type: authorization_code`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ""}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ""}`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`state: ${auth?.oauth2?.state || ""}`)}
${indentString(`pkce: ${(auth?.oauth2?.pkce || false).toString()}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
          case "client_credentials":
            bru += `auth:oauth2 {
${indentString(`grant_type: client_credentials`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
          case "implicit":
            bru += `auth:oauth2 {
${indentString(`grant_type: implicit`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ""}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`state: ${auth?.oauth2?.state || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
}

`;
            break;
        }
        if (auth?.oauth2?.additionalParameters) {
          const { authorization: authorizationParams, token: tokenParams, refresh: refreshParams } = auth?.oauth2?.additionalParameters;
          const authorizationHeaders = authorizationParams?.filter((p2) => p2?.sendIn == "headers");
          if (authorizationHeaders?.length) {
            bru += `auth:oauth2:additional_params:auth_req:headers {
${indentString(
              authorizationHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const authorizationQueryParams = authorizationParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (authorizationQueryParams?.length) {
            bru += `auth:oauth2:additional_params:auth_req:queryparams {
${indentString(
              authorizationQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenHeaders = tokenParams?.filter((p2) => p2?.sendIn == "headers");
          if (tokenHeaders?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:headers {
${indentString(
              tokenHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenQueryParams = tokenParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (tokenQueryParams?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:queryparams {
${indentString(
              tokenQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenBodyValues = tokenParams?.filter((p2) => p2?.sendIn == "body");
          if (tokenBodyValues?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:body {
${indentString(
              tokenBodyValues.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshHeaders = refreshParams?.filter((p2) => p2?.sendIn == "headers");
          if (refreshHeaders?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:headers {
${indentString(
              refreshHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshQueryParams = refreshParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (refreshQueryParams?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:queryparams {
${indentString(
              refreshQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshBodyValues = refreshParams?.filter((p2) => p2?.sendIn == "body");
          if (refreshBodyValues?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:body {
${indentString(
              refreshBodyValues.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
        }
      }
      if (auth && auth.apikey) {
        bru += `auth:apikey {
${indentString(`key: ${auth?.apikey?.key || ""}`)}
${indentString(`value: ${auth?.apikey?.value || ""}`)}
${indentString(`placement: ${auth?.apikey?.placement || ""}`)}
}

`;
      }
      if (body && body.json && body.json.length) {
        bru += `body:json {
${indentString(body.json)}
}

`;
      }
      if (body && body.text && body.text.length) {
        bru += `body:text {
${indentString(body.text)}
}

`;
      }
      if (body && body.xml && body.xml.length) {
        bru += `body:xml {
${indentString(body.xml)}
}

`;
      }
      if (body && body.sparql && body.sparql.length) {
        bru += `body:sparql {
${indentString(body.sparql)}
}

`;
      }
      if (body && body.formUrlEncoded && body.formUrlEncoded.length) {
        bru += `body:form-urlencoded {
`;
        if (enabled(body.formUrlEncoded).length) {
          const enabledValues = enabled(body.formUrlEncoded).map((item) => `${serializeAnnotations(item.annotations)}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n");
          bru += `${indentString(enabledValues)}
`;
        }
        if (disabled(body.formUrlEncoded).length) {
          const disabledValues = disabled(body.formUrlEncoded).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n");
          bru += `${indentString(disabledValues)}
`;
        }
        bru += "}\n\n";
      }
      if (body && body.multipartForm && body.multipartForm.length) {
        bru += `body:multipart-form {`;
        const multipartForms = enabled(body.multipartForm).concat(disabled(body.multipartForm));
        if (multipartForms.length) {
          bru += `
${indentString(
            multipartForms.map((item) => {
              const enabled2 = item.enabled ? "" : "~";
              const contentType = item.contentType && item.contentType !== "" ? " @contentType(" + item.contentType + ")" : "";
              const annotPrefix = serializeAnnotations(item.annotations);
              if (item.type === "text") {
                return `${annotPrefix}${enabled2}${getKeyString(item.name)}: ${getValueString(item.value)}${contentType}`;
              }
              if (item.type === "file") {
                const filepaths = Array.isArray(item.value) ? item.value : [];
                const filestr = filepaths.join("|");
                const value = `@file(${filestr})`;
                return `${annotPrefix}${enabled2}${getKeyString(item.name)}: ${value}${contentType}`;
              }
            }).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (body && body.file && body.file.length) {
        bru += `body:file {`;
        const files = enabled(body.file, "selected").concat(disabled(body.file, "selected"));
        if (files.length) {
          bru += `
${indentString(
            files.map((item) => {
              const selected = item.selected ? "" : "~";
              const contentType = item.contentType && item.contentType !== "" ? " @contentType(" + item.contentType + ")" : "";
              const annotPrefix = serializeAnnotations(item.annotations);
              const filePath = item.filePath || "";
              const value = `@file(${filePath})`;
              const itemName = "file";
              return `${annotPrefix}${selected}${itemName}: ${value}${contentType}`;
            }).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (body && body.graphql && body.graphql.query) {
        bru += `body:graphql {
`;
        bru += `${indentString(body.graphql.query)}`;
        bru += "\n}\n\n";
      }
      if (body && body.graphql && body.graphql.variables) {
        bru += `body:graphql:vars {
`;
        bru += `${indentString(body.graphql.variables)}`;
        bru += "\n}\n\n";
      }
      if (body && body.grpc) {
        if (Array.isArray(body.grpc)) {
          body.grpc.forEach((m2) => {
            const { name, content } = m2;
            bru += `body:grpc {
`;
            bru += `${indentString(`name: ${getValueString(name)}`)}
`;
            let jsonValue = typeof content === "object" ? JSON.stringify(content, null, 2) : content || "{}";
            bru += `${indentString(`content: '''
${indentString(jsonValue)}
'''`)}
`;
            bru += "}\n\n";
          });
        }
      }
      if (body && body.ws) {
        if (Array.isArray(body.ws)) {
          body.ws.forEach((message) => {
            const { name, content, type = "" } = message;
            bru += `body:ws {
`;
            bru += `${indentString(`name: ${getValueString(name)}`)}
`;
            if (type.length) {
              bru += `${indentString(`type: ${getValueString(type)}`)}
`;
            }
            let contentValue = typeof content === "object" ? JSON.stringify(content, null, 2) : content || "{}";
            bru += `${indentString(`content: '''
${indentString(contentValue)}
'''`)}
`;
            bru += "}\n\n";
          });
        }
      }
      let reqvars = _2.get(vars, "req");
      let resvars = _2.get(vars, "res");
      if (reqvars && reqvars.length) {
        const varsEnabled = _2.filter(reqvars, (v2) => v2.enabled && !v2.local);
        const varsDisabled = _2.filter(reqvars, (v2) => !v2.enabled && !v2.local);
        const varsLocalEnabled = _2.filter(reqvars, (v2) => v2.enabled && v2.local);
        const varsLocalDisabled = _2.filter(reqvars, (v2) => !v2.enabled && v2.local);
        bru += `vars:pre-request {`;
        if (varsEnabled.length) {
          bru += `
${indentString(varsEnabled.map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalEnabled.length) {
          bru += `
${indentString(varsLocalEnabled.map((item) => `${serializeAnnotations(item.annotations)}@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsDisabled.length) {
          bru += `
${indentString(varsDisabled.map((item) => `${serializeAnnotations(item.annotations)}~${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalDisabled.length) {
          bru += `
${indentString(varsLocalDisabled.map((item) => `${serializeAnnotations(item.annotations)}~@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        bru += "\n}\n\n";
      }
      if (resvars && resvars.length) {
        const varsEnabled = _2.filter(resvars, (v2) => v2.enabled && !v2.local);
        const varsDisabled = _2.filter(resvars, (v2) => !v2.enabled && !v2.local);
        const varsLocalEnabled = _2.filter(resvars, (v2) => v2.enabled && v2.local);
        const varsLocalDisabled = _2.filter(resvars, (v2) => !v2.enabled && v2.local);
        bru += `vars:post-response {`;
        if (varsEnabled.length) {
          bru += `
${indentString(varsEnabled.map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalEnabled.length) {
          bru += `
${indentString(varsLocalEnabled.map((item) => `${serializeAnnotations(item.annotations)}@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsDisabled.length) {
          bru += `
${indentString(varsDisabled.map((item) => `${serializeAnnotations(item.annotations)}~${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalDisabled.length) {
          bru += `
${indentString(varsLocalDisabled.map((item) => `${serializeAnnotations(item.annotations)}~@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        bru += "\n}\n\n";
      }
      if (assertions && assertions.length) {
        bru += `assert {`;
        if (enabled(assertions).length) {
          bru += `
${indentString(
            enabled(assertions).map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        if (disabled(assertions).length) {
          bru += `
${indentString(
            disabled(assertions).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (script && script.req && script.req.length) {
        bru += `script:pre-request {
${indentString(script.req)}
}

`;
      }
      if (script && script.res && script.res.length) {
        bru += `script:post-response {
${indentString(script.res)}
}

`;
      }
      if (tests && tests.length) {
        bru += `tests {
${indentString(tests)}
}

`;
      }
      if (settings && Object.keys(settings).length) {
        bru += "settings {\n";
        for (const key in settings) {
          bru += `  ${key}: ${settings[key]}
`;
        }
        bru += "}\n\n";
      }
      if (docs && docs.length) {
        bru += `docs {
${indentString(docs)}
}

`;
      }
      if (examples && examples.length) {
        examples.forEach((example) => {
          const bruExample = jsonToExampleBru(example);
          bru += `example {
${indentString(bruExample)}
}

`;
        });
      }
      return stripLastLine(bru);
    };
    module2.exports = jsonToBru;
    module2.exports.jsonToExampleBru = jsonToExampleBru;
  }
});

// node_modules/@usebruno/lang/v2/src/envToJson.js
var require_envToJson = __commonJS({
  "node_modules/@usebruno/lang/v2/src/envToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var ANNOTATIONS_KEY = /* @__PURE__ */ Symbol("annotations");
    var indentLevel = 4;
    var grammar = ohm.grammar(`Bru {
  BruEnvFile = (vars | secretvars | externalsecrets | color)*

  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend | multilinetextblockstart) any

  multilinetextblockdelimiter = "'''"
  multilinetextblockstart = "'''" nl
  multilinetextblockend = nl st* "'''"
  multilinetextblock = multilinetextblockstart multilinetextblockcontent multilinetextblockend
  multilinetextblockcontent = (~multilinetextblockend any)*

  // Annotation support (decorators on pairs)
  annotationname = annotationchar+
  annotationchar = ~("(" | ")" | " " | "\\t" | "\\r" | "\\n" | ":") any
  annotationsinglequotedargchar = ~"'" any
  annotationsinglequotedarg = "'" annotationsinglequotedargchar* "'"
  annotationdoublequotedargchar = ~"\\"" any
  annotationdoublequotedarg = "\\"" annotationdoublequotedargchar* "\\""
  annotationunquotedargchar = ~")" any
  annotationunquotedarg = annotationunquotedargchar*
  annotationargvalue = annotationsinglequotedarg | annotationdoublequotedarg | annotationunquotedarg
  annotationmultilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter
  annotationargscontents = annotationmultilinetextblock | annotationargvalue
  annotationargs = "(" annotationargscontents ")"
  annotation = "@" annotationname annotationargs?
  annotationentry = st* annotation ~":" st* nl
  pairannotations = annotationentry*

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend stnl* pair)* (~tagend space)*
  pair = st* pairannotations st* key st* ":" st* value st*
  key = keychar*
  value = multilinetextblock | valuechar*

  // Array Blocks
  array = st* "[" stnl* valuelist stnl* "]"
  valuelist = stnl* arrayvalue stnl* ("," stnl* arrayvalue)*
  arrayvalue = pairannotations st* arrayvaluechar*
  arrayvaluechar = ~(nl | st | "[" | "]" | ",") any

  secretvars = "vars:secret" array
  externalsecrets = "vars:externalsecrets:" externalsecretsname dictionary
  externalsecretsname = externalsecretsnamechar+
  externalsecretsnamechar = ~(st | nl | "{") any
  vars = "vars" dictionary
  color = "color:" any*
}`);
    var mapPairListToKeyValPairs = (pairList = []) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        const rawAnnotations = pair[ANNOTATIONS_KEY];
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        const result = { name, value, enabled };
        if (rawAnnotations && rawAnnotations.length) {
          result.annotations = rawAnnotations;
        }
        return result;
      });
    };
    var mapArrayListToKeyValPairs = (arrayList = []) => {
      arrayList = arrayList.filter((item) => item && item.name && item.name.length);
      if (!arrayList.length) {
        return [];
      }
      return _2.map(arrayList, (item) => {
        let name = item.name;
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        const result = { name, value: "", enabled };
        if (item.annotations && item.annotations.length) {
          result.annotations = item.annotations;
        }
        return result;
      });
    };
    var concatArrays = (objValue, srcValue) => {
      if (_2.isArray(objValue) && _2.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
    };
    var sem = grammar.createSemantics().addAttribute("ast", {
      BruEnvFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {
            variables: []
          };
        }
        return _2.reduce(
          tags.ast,
          (result, item) => {
            return _2.mergeWith(result, item, concatArrays);
          },
          {}
        );
      },
      array(_1, _22, _3, valuelist, _4, _5) {
        return valuelist.ast;
      },
      arrayvalue(annotations, _st, chars) {
        const result = { name: chars.sourceString ? chars.sourceString.trim() : "" };
        const annotationList = annotations.ast;
        if (annotationList && annotationList.length > 0) {
          result.annotations = annotationList;
        }
        return result;
      },
      valuelist(_1, value, _22, _3, _4, rest) {
        return [value.ast, ...rest.ast];
      },
      dictionary(_1, _22, pairlist, _3) {
        return pairlist.ast;
      },
      pairlist(_1, pair, _22, rest, _3) {
        return [pair.ast, ...rest.ast];
      },
      pairannotations(entries) {
        return entries.ast;
      },
      annotationentry(_1, annotation, _22, _3) {
        return annotation.ast;
      },
      annotation(_at, name, argsIter) {
        const annotObj = { name: name.ast };
        const argsArr = argsIter.ast;
        if (argsArr.length > 0) {
          annotObj.value = argsArr[0];
        }
        return annotObj;
      },
      annotationname(chars) {
        return chars.sourceString;
      },
      annotationsinglequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationdoublequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationunquotedarg(chars) {
        return chars.sourceString;
      },
      annotationargvalue(alt) {
        return alt.ast;
      },
      annotationmultilinetextblock(_1, content, _22) {
        const lines = content.sourceString.split("\n");
        let minIndent = 4;
        const dedented = lines.map((line) => line.trim() === "" ? "" : line.substring(minIndent));
        if (dedented.length > 0 && dedented[0] === "") dedented.shift();
        if (dedented.length > 0 && dedented[dedented.length - 1] === "") dedented.pop();
        return dedented.join("\n");
      },
      annotationargscontents(alt) {
        return alt.ast;
      },
      annotationargs(_open, value, _close) {
        return value.ast;
      },
      pair(_1, annotations, _22, key, _3, _4, _5, value, _6) {
        let res = {};
        res[key.ast] = value.ast ? value.ast.trim() : "";
        const annotationList = annotations.ast;
        if (annotationList && annotationList.length > 0) {
          res[ANNOTATIONS_KEY] = annotationList;
        }
        return res;
      },
      key(chars) {
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      value(chars) {
        if (chars.ctorName === "multilinetextblock") {
          return chars.ast;
        }
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      multilinetextblockstart(_1, _22) {
        return "";
      },
      multilinetextblockend(_1, _22, _3) {
        return "";
      },
      multilinetextblockdelimiter(_3) {
        return "";
      },
      multilinetextblock(_1, content, _22) {
        return content.ast.split(/\r\n|\r|\n/).map((line) => line.slice(indentLevel)).join("\n").trim();
      },
      multilinetextblockcontent(chars) {
        return chars.sourceString;
      },
      nl(_1, _22) {
        return "";
      },
      st(_3) {
        return "";
      },
      tagend(_1, _22) {
        return "";
      },
      _iter(...elements) {
        return elements.map((e2) => e2.ast);
      },
      vars(_1, dictionary) {
        const vars = mapPairListToKeyValPairs(dictionary.ast);
        _2.each(vars, (v2) => {
          v2.secret = false;
        });
        return {
          variables: vars
        };
      },
      secretvars: (_1, array) => {
        const vars = mapArrayListToKeyValPairs(array.ast);
        _2.each(vars, (v2) => {
          v2.secret = true;
        });
        return {
          variables: vars
        };
      },
      externalsecrets(_1, name, dictionary) {
        const variables = mapPairListToKeyValPairs(dictionary.ast).map((pair) => ({
          name: pair.name,
          value: pair.value
        }));
        return {
          externalSecrets: {
            type: name.ast,
            variables
          }
        };
      },
      externalsecretsname(chars) {
        return chars.sourceString;
      },
      color: (_1, anystring) => {
        return {
          color: anystring.sourceString.trim()
        };
      }
    });
    var parser = (input) => {
      const match = grammar.match(input);
      if (match.succeeded()) {
        return sem(match).ast;
      } else {
        throw new Error(match.message);
      }
    };
    module2.exports = parser;
  }
});

// node_modules/@usebruno/lang/v2/src/jsonToEnv.js
var require_jsonToEnv = __commonJS({
  "node_modules/@usebruno/lang/v2/src/jsonToEnv.js"(exports2, module2) {
    var _2 = require_lodash();
    var { getValueString, indentString, serializeAnnotations } = require_utils();
    var envToJson = (json) => {
      const variables = _2.get(json, "variables", []);
      const externalSecrets = _2.get(json, "externalSecrets", null);
      const color = _2.get(json, "color", null);
      const vars = variables.filter((variable) => !variable.secret).map((variable) => {
        const { name, value, enabled, annotations } = variable;
        const prefix = enabled ? "" : "~";
        return indentString(`${serializeAnnotations(annotations)}${prefix}${name}: ${getValueString(value)}`);
      });
      const secretVars = variables.filter((variable) => variable.secret).map((variable) => {
        const { name, enabled, annotations } = variable;
        const prefix = enabled ? "" : "~";
        return indentString(`${serializeAnnotations(annotations)}${prefix}${name}`);
      });
      let output = "";
      if (!variables || !variables.length) {
        output += `vars {
}
`;
      }
      if (vars.length) {
        output += `vars {
${vars.join("\n")}
}
`;
      }
      if (secretVars.length) {
        output += `vars:secret [
${secretVars.join(",\n")}
]
`;
      }
      if (externalSecrets && externalSecrets.type) {
        const serializedVariables = (externalSecrets.variables || []).map(
          ({ name, value }) => indentString(`${name}: ${getValueString(value)}`)
        );
        output += `vars:externalsecrets:${externalSecrets.type} {
${serializedVariables.join("\n")}
}
`;
      }
      if (color) {
        output += `color: ${color}
`;
      }
      return output;
    };
    module2.exports = envToJson;
  }
});

// node_modules/dotenv/package.json
var require_package2 = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.6.1",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=text --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      homepage: "https://github.com/motdotla/dotenv#readme",
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main2 = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var crypto = require("crypto");
    var packageJson = require_package2();
    var version = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i2 = 0; i2 < length; i2++) {
        try {
          const key = keys[i2].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i2 + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.log(`[dotenv@${version}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version}][DEBUG] ${message}`);
    }
    function _log(message) {
      console.log(`[dotenv@${version}] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (debug || !quiet) {
        _log("Loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const quiet = options && "quiet" in options ? options.quiet : true;
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e2) {
          if (debug) {
            _debug(`Failed to load ${path2} ${e2.message}`);
          }
          lastError = e2;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (debug || !quiet) {
        const keysCount = Object.keys(parsedAll).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e2) {
            if (debug) {
              _debug(`Failed to load ${filePath} ${e2.message}`);
            }
            lastError = e2;
          }
        }
        _log(`injecting env (${keysCount}) from ${shortPaths.join(",")}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// node_modules/@usebruno/lang/v2/src/dotenvToJson.js
var require_dotenvToJson = __commonJS({
  "node_modules/@usebruno/lang/v2/src/dotenvToJson.js"(exports2, module2) {
    var dotenv = require_main2();
    var parser = (input) => {
      const buf = Buffer.from(input);
      const parsed = dotenv.parse(buf);
      return parsed;
    };
    module2.exports = parser;
  }
});

// node_modules/@usebruno/lang/v2/src/collectionBruToJson.js
var require_collectionBruToJson = __commonJS({
  "node_modules/@usebruno/lang/v2/src/collectionBruToJson.js"(exports2, module2) {
    var ohm = require_ohm_js();
    var _2 = require_lodash();
    var { safeParseJson, outdentString } = require_utils();
    var ANNOTATIONS_KEY = /* @__PURE__ */ Symbol("annotations");
    var grammar = ohm.grammar(`Bru {
  BruFile = (meta | query | headers | auth | auths | vars | script | tests | docs)*
  auths = authawsv4 | authbasic | authbearer | authdigest | authNTLM | authOAuth1 | authOAuth2 | authwsse | authapikey | authOauth2Configs

  // Oauth2 additional parameters
  authOauth2Configs = oauth2AuthReqConfig | oauth2AccessTokenReqConfig | oauth2RefreshTokenReqConfig
  oauth2AuthReqConfig = oauth2AuthReqHeaders | oauth2AuthReqQueryParams 
  oauth2AccessTokenReqConfig = oauth2AccessTokenReqHeaders | oauth2AccessTokenReqQueryParams | oauth2AccessTokenReqBody
  oauth2RefreshTokenReqConfig = oauth2RefreshTokenReqHeaders | oauth2RefreshTokenReqQueryParams | oauth2RefreshTokenReqBody

  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend) any

  // Multiline text block surrounded by '''
  multilinetextblockdelimiter = "'''"
  multilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter

  // Annotation support (decorators on pairs)
  annotationname = annotationchar+
  annotationchar = ~("(" | ")" | " " | "\\t" | "\\r" | "\\n" | ":") any
  annotationsinglequotedargchar = ~"'" any
  annotationsinglequotedarg = "'" annotationsinglequotedargchar* "'"
  annotationdoublequotedargchar = ~"\\"" any
  annotationdoublequotedarg = "\\"" annotationdoublequotedargchar* "\\""
  annotationunquotedargchar = ~")" any
  annotationunquotedarg = annotationunquotedargchar*
  annotationargvalue = annotationsinglequotedarg | annotationdoublequotedarg | annotationunquotedarg
  annotationmultilinetextblock = multilinetextblockdelimiter (~multilinetextblockdelimiter any)* multilinetextblockdelimiter
  annotationargscontents = annotationmultilinetextblock | annotationargvalue
  annotationargs = "(" annotationargscontents ")"
  annotation = "@" annotationname annotationargs?
  annotationentry = st* annotation ~":" st* nl
  pairannotations = annotationentry*

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend stnl* pair)* (~tagend space)*
  pair = st* pairannotations st* (quoted_key | key) st* ":" st* value st*
  disable_char = "~"
  quote_char = "\\""
  esc_char = "\\\\"
  esc_quote_char = esc_char quote_char
  quoted_key_char = ~(quote_char | esc_quote_char | nl) any
  quoted_key = disable_char? quote_char (esc_quote_char | quoted_key_char)* quote_char
  key = keychar*
  value = multilinetextblock | valuechar*

  // Text Blocks
  textblock = textline (~tagend nl textline)*
  textline = textchar*
  textchar = ~nl any
  
  meta = "meta" dictionary

  auth = "auth" dictionary

  oauth2AuthReqHeaders = "auth:oauth2:additional_params:auth_req:headers" dictionary
  oauth2AuthReqQueryParams = "auth:oauth2:additional_params:auth_req:queryparams" dictionary
  oauth2AccessTokenReqHeaders = "auth:oauth2:additional_params:access_token_req:headers" dictionary
  oauth2AccessTokenReqQueryParams = "auth:oauth2:additional_params:access_token_req:queryparams" dictionary
  oauth2AccessTokenReqBody = "auth:oauth2:additional_params:access_token_req:body" dictionary
  oauth2RefreshTokenReqHeaders = "auth:oauth2:additional_params:refresh_token_req:headers" dictionary
  oauth2RefreshTokenReqQueryParams = "auth:oauth2:additional_params:refresh_token_req:queryparams" dictionary
  oauth2RefreshTokenReqBody = "auth:oauth2:additional_params:refresh_token_req:body" dictionary

  headers = "headers" dictionary

  query = "query" dictionary

  vars = varsreq | varsres
  varsreq = "vars:pre-request" dictionary
  varsres = "vars:post-response" dictionary

  authawsv4 = "auth:awsv4" dictionary
  authbasic = "auth:basic" dictionary
  authbearer = "auth:bearer" dictionary
  authdigest = "auth:digest" dictionary
  authNTLM = "auth:ntlm" dictionary
  authOAuth1 = "auth:oauth1" dictionary
  authOAuth2 = "auth:oauth2" dictionary
  authwsse = "auth:wsse" dictionary
  authapikey = "auth:apikey" dictionary

  script = scriptreq | scriptres
  scriptreq = "script:pre-request" st* "{" nl* textblock tagend
  scriptres = "script:post-response" st* "{" nl* textblock tagend
  tests = "tests" st* "{" nl* textblock tagend
  docs = "docs" st* "{" nl* textblock tagend
}`);
    var mapPairListToKeyValPairs = (pairList = [], parseEnabled = true) => {
      if (!pairList.length) {
        return [];
      }
      return _2.map(pairList[0], (pair) => {
        let name = _2.keys(pair)[0];
        let value = pair[name];
        const rawAnnotations = pair[ANNOTATIONS_KEY];
        if (!parseEnabled) {
          const result2 = { name, value };
          if (rawAnnotations && rawAnnotations.length) result2.annotations = rawAnnotations;
          return result2;
        }
        let enabled = true;
        if (name && name.length && name.charAt(0) === "~") {
          name = name.slice(1);
          enabled = false;
        }
        const result = { name, value, enabled };
        if (rawAnnotations && rawAnnotations.length) {
          result.annotations = rawAnnotations;
        }
        return result;
      });
    };
    var concatArrays = (objValue, srcValue) => {
      if (_2.isArray(objValue) && _2.isArray(srcValue)) {
        return objValue.concat(srcValue);
      }
    };
    var mapPairListToKeyValPair = (pairList = []) => {
      if (!pairList || !pairList.length) {
        return {};
      }
      return _2.merge({}, ...pairList[0]);
    };
    var sem = grammar.createSemantics().addAttribute("ast", {
      BruFile(tags) {
        if (!tags || !tags.ast || !tags.ast.length) {
          return {};
        }
        return _2.reduce(
          tags.ast,
          (result, item) => {
            return _2.mergeWith(result, item, concatArrays);
          },
          {}
        );
      },
      dictionary(_1, _22, pairlist, _3) {
        return pairlist.ast;
      },
      pairlist(_1, pair, _22, rest, _3) {
        return [pair.ast, ...rest.ast];
      },
      pairannotations(entries) {
        return entries.ast;
      },
      annotationentry(_1, annotation, _22, _3) {
        return annotation.ast;
      },
      annotation(_at, name, argsIter) {
        const annotObj = { name: name.ast };
        const argsArr = argsIter.ast;
        if (argsArr.length > 0) {
          annotObj.value = argsArr[0];
        }
        return annotObj;
      },
      annotationname(chars) {
        return chars.sourceString;
      },
      annotationsinglequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationdoublequotedarg(_open, chars, _close) {
        return chars.sourceString;
      },
      annotationunquotedarg(chars) {
        return chars.sourceString;
      },
      annotationargvalue(alt) {
        return alt.ast;
      },
      annotationmultilinetextblock(_1, content, _22) {
        const lines = content.sourceString.split("\n");
        let minIndent = 4;
        const dedented = lines.map((line) => line.trim() === "" ? "" : line.substring(minIndent));
        if (dedented.length > 0 && dedented[0] === "") dedented.shift();
        if (dedented.length > 0 && dedented[dedented.length - 1] === "") dedented.pop();
        return dedented.join("\n");
      },
      annotationargscontents(alt) {
        return alt.ast;
      },
      annotationargs(_open, value, _close) {
        return value.ast;
      },
      pair(_1, annotations, _22, key, _3, _4, _5, value, _6) {
        let res = {};
        res[key.ast] = value.ast ? value.ast.trim() : "";
        const annotationList = annotations.ast;
        if (annotationList && annotationList.length > 0) {
          res[ANNOTATIONS_KEY] = annotationList;
        }
        return res;
      },
      quoted_key(disabled, _1, chars, _22) {
        return (disabled ? disabled.sourceString : "") + chars.ast.join("");
      },
      esc_quote_char(_1, quote) {
        return quote.sourceString;
      },
      quoted_key_char(char) {
        return char.sourceString;
      },
      key(chars) {
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      value(chars) {
        if (chars.ctorName === "list") {
          return chars.ast;
        }
        try {
          let isMultiline = chars.sourceString?.startsWith(`'''`) && chars.sourceString?.endsWith(`'''`);
          if (isMultiline) {
            const multilineString = chars.sourceString?.replace(/^'''|'''$/g, "");
            return multilineString.split("\n").map((line) => line.slice(4)).join("\n");
          }
          return chars.sourceString ? chars.sourceString.trim() : "";
        } catch (err) {
          console.error(err);
        }
        return chars.sourceString ? chars.sourceString.trim() : "";
      },
      textblock(line, _1, rest) {
        return [line.ast, ...rest.ast].join("\n");
      },
      textline(chars) {
        return chars.sourceString;
      },
      textchar(char) {
        return char.sourceString;
      },
      multilinetextblock(_1, content, _22) {
        return content.sourceString.trim();
      },
      nl(_1, _22) {
        return "";
      },
      st(_3) {
        return "";
      },
      tagend(_1, _22) {
        return "";
      },
      _iter(...elements) {
        return elements.map((e2) => e2.ast);
      },
      meta(_1, dictionary) {
        let meta = mapPairListToKeyValPair(dictionary.ast) || {};
        meta.type = "collection";
        return {
          meta
        };
      },
      auth(_1, dictionary) {
        let auth = mapPairListToKeyValPair(dictionary.ast) || {};
        return {
          auth: {
            mode: auth?.mode || "none"
          }
        };
      },
      query(_1, dictionary) {
        return {
          query: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      headers(_1, dictionary) {
        return {
          headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      authawsv4(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const accessKeyIdKey = _2.find(auth, { name: "accessKeyId" });
        const secretAccessKeyKey = _2.find(auth, { name: "secretAccessKey" });
        const sessionTokenKey = _2.find(auth, { name: "sessionToken" });
        const serviceKey = _2.find(auth, { name: "service" });
        const regionKey = _2.find(auth, { name: "region" });
        const profileNameKey = _2.find(auth, { name: "profileName" });
        const accessKeyId = accessKeyIdKey ? accessKeyIdKey.value : "";
        const secretAccessKey = secretAccessKeyKey ? secretAccessKeyKey.value : "";
        const sessionToken = sessionTokenKey ? sessionTokenKey.value : "";
        const service = serviceKey ? serviceKey.value : "";
        const region = regionKey ? regionKey.value : "";
        const profileName = profileNameKey ? profileNameKey.value : "";
        return {
          auth: {
            awsv4: {
              accessKeyId,
              secretAccessKey,
              sessionToken,
              service,
              region,
              profileName
            }
          }
        };
      },
      authbasic(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        return {
          auth: {
            basic: {
              username,
              password
            }
          }
        };
      },
      authbearer(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const tokenKey = _2.find(auth, { name: "token" });
        const token = tokenKey ? tokenKey.value : "";
        return {
          auth: {
            bearer: {
              token
            }
          }
        };
      },
      authdigest(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        return {
          auth: {
            digest: {
              username,
              password
            }
          }
        };
      },
      authNTLM(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const domainKey = _2.find(auth, { name: "domain" });
        const username = usernameKey ? usernameKey.value : "";
        const password = passwordKey ? passwordKey.value : "";
        const domain = domainKey ? domainKey.value : "";
        return {
          auth: {
            ntlm: {
              username,
              password,
              domain
            }
          }
        };
      },
      authOAuth1(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const findValue = (name) => {
          const item = _2.find(auth, { name });
          return item ? item.value : "";
        };
        return {
          auth: {
            oauth1: {
              consumerKey: findValue("consumer_key"),
              consumerSecret: findValue("consumer_secret"),
              accessToken: findValue("access_token"),
              accessTokenSecret: findValue("token_secret"),
              callbackUrl: findValue("callback_url"),
              verifier: findValue("verifier"),
              signatureMethod: findValue("signature_method"),
              privateKey: (() => {
                const val = findValue("private_key");
                return val && val.startsWith("@file(") && val.endsWith(")") ? val.slice(6, -1) : val;
              })(),
              privateKeyType: (() => {
                const val = findValue("private_key");
                return val && val.startsWith("@file(") && val.endsWith(")") ? "file" : "text";
              })(),
              timestamp: findValue("timestamp"),
              nonce: findValue("nonce"),
              version: findValue("version"),
              realm: findValue("realm"),
              placement: findValue("placement"),
              includeBodyHash: findValue("include_body_hash") === "true"
            }
          }
        };
      },
      authOAuth2(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const grantTypeKey = _2.find(auth, { name: "grant_type" });
        const usernameKey = _2.find(auth, { name: "username" });
        const passwordKey = _2.find(auth, { name: "password" });
        const callbackUrlKey = _2.find(auth, { name: "callback_url" });
        const authorizationUrlKey = _2.find(auth, { name: "authorization_url" });
        const accessTokenUrlKey = _2.find(auth, { name: "access_token_url" });
        const refreshTokenUrlKey = _2.find(auth, { name: "refresh_token_url" });
        const clientIdKey = _2.find(auth, { name: "client_id" });
        const clientSecretKey = _2.find(auth, { name: "client_secret" });
        const scopeKey = _2.find(auth, { name: "scope" });
        const stateKey = _2.find(auth, { name: "state" });
        const pkceKey = _2.find(auth, { name: "pkce" });
        const credentialsPlacementKey = _2.find(auth, { name: "credentials_placement" });
        const credentialsIdKey = _2.find(auth, { name: "credentials_id" });
        const tokenPlacementKey = _2.find(auth, { name: "token_placement" });
        const tokenHeaderPrefixKey = _2.find(auth, { name: "token_header_prefix" });
        const tokenQueryKeyKey = _2.find(auth, { name: "token_query_key" });
        const autoFetchTokenKey = _2.find(auth, { name: "auto_fetch_token" });
        const autoRefreshTokenKey = _2.find(auth, { name: "auto_refresh_token" });
        const tokenSourceKey = _2.find(auth, { name: "token_source" });
        return {
          auth: {
            oauth2: grantTypeKey?.value && grantTypeKey?.value == "password" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              username: usernameKey ? usernameKey.value : "",
              password: passwordKey ? passwordKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : grantTypeKey?.value && grantTypeKey?.value == "authorization_code" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              callbackUrl: callbackUrlKey ? callbackUrlKey.value : "",
              authorizationUrl: authorizationUrlKey ? authorizationUrlKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              state: stateKey ? stateKey.value : "",
              pkce: pkceKey ? safeParseJson(pkceKey?.value) ?? false : false,
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : grantTypeKey?.value && grantTypeKey?.value == "implicit" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              callbackUrl: callbackUrlKey ? callbackUrlKey.value : "",
              authorizationUrl: authorizationUrlKey ? authorizationUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              state: stateKey ? stateKey.value : "",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true
            } : grantTypeKey?.value && grantTypeKey?.value == "client_credentials" ? {
              grantType: grantTypeKey ? grantTypeKey.value : "",
              accessTokenUrl: accessTokenUrlKey ? accessTokenUrlKey.value : "",
              refreshTokenUrl: refreshTokenUrlKey ? refreshTokenUrlKey.value : "",
              clientId: clientIdKey ? clientIdKey.value : "",
              clientSecret: clientSecretKey ? clientSecretKey.value : "",
              scope: scopeKey ? scopeKey.value : "",
              credentialsPlacement: credentialsPlacementKey?.value ? credentialsPlacementKey.value : "body",
              credentialsId: credentialsIdKey?.value ? credentialsIdKey.value : "credentials",
              tokenSource: tokenSourceKey?.value ? tokenSourceKey.value : "access_token",
              tokenPlacement: tokenPlacementKey?.value ? tokenPlacementKey.value : "header",
              tokenHeaderPrefix: tokenHeaderPrefixKey?.value ? tokenHeaderPrefixKey.value : "",
              tokenQueryKey: tokenQueryKeyKey?.value ? tokenQueryKeyKey.value : "access_token",
              autoFetchToken: autoFetchTokenKey ? safeParseJson(autoFetchTokenKey?.value) ?? true : true,
              autoRefreshToken: autoRefreshTokenKey ? safeParseJson(autoRefreshTokenKey?.value) ?? false : false
            } : {}
          }
        };
      },
      oauth2AuthReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_auth_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AuthReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_auth_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2AccessTokenReqBody(_1, dictionary) {
        return {
          oauth2_additional_parameters_access_token_req_bodyvalues: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqHeaders(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_headers: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqQueryParams(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_queryparams: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      oauth2RefreshTokenReqBody(_1, dictionary) {
        return {
          oauth2_additional_parameters_refresh_token_req_bodyvalues: mapPairListToKeyValPairs(dictionary.ast)
        };
      },
      authwsse(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const userKey = _2.find(auth, { name: "username" });
        const secretKey = _2.find(auth, { name: "password" });
        const username = userKey ? userKey.value : "";
        const password = secretKey ? secretKey.value : "";
        return {
          auth: {
            wsse: {
              username,
              password
            }
          }
        };
      },
      authapikey(_1, dictionary) {
        const auth = mapPairListToKeyValPairs(dictionary.ast, false);
        const findValueByName = (name) => {
          const item = _2.find(auth, { name });
          return item ? item.value : "";
        };
        const key = findValueByName("key");
        const value = findValueByName("value");
        const placement = findValueByName("placement");
        return {
          auth: {
            apikey: {
              key,
              value,
              placement
            }
          }
        };
      },
      varsreq(_1, dictionary) {
        const vars = mapPairListToKeyValPairs(dictionary.ast);
        _2.each(vars, (v2) => {
          let name = v2.name;
          if (name && name.length && name.charAt(0) === "@") {
            v2.name = name.slice(1);
            v2.local = true;
          } else {
            v2.local = false;
          }
        });
        return {
          vars: {
            req: vars
          }
        };
      },
      varsres(_1, dictionary) {
        const vars = mapPairListToKeyValPairs(dictionary.ast);
        _2.each(vars, (v2) => {
          let name = v2.name;
          if (name && name.length && name.charAt(0) === "@") {
            v2.name = name.slice(1);
            v2.local = true;
          } else {
            v2.local = false;
          }
        });
        return {
          vars: {
            res: vars
          }
        };
      },
      scriptreq(_1, _22, _3, _4, textblock, _5) {
        return {
          script: {
            req: outdentString(textblock.sourceString)
          }
        };
      },
      scriptres(_1, _22, _3, _4, textblock, _5) {
        return {
          script: {
            res: outdentString(textblock.sourceString)
          }
        };
      },
      tests(_1, _22, _3, _4, textblock, _5) {
        return {
          tests: outdentString(textblock.sourceString)
        };
      },
      docs(_1, _22, _3, _4, textblock, _5) {
        return {
          docs: outdentString(textblock.sourceString)
        };
      }
    });
    var parser = (input) => {
      const match = grammar.match(input);
      if (match.succeeded()) {
        let ast = sem(match).ast;
        return ast;
      } else {
        throw new Error(match.message);
      }
    };
    module2.exports = parser;
  }
});

// node_modules/@usebruno/lang/v2/src/jsonToCollectionBru.js
var require_jsonToCollectionBru = __commonJS({
  "node_modules/@usebruno/lang/v2/src/jsonToCollectionBru.js"(exports2, module2) {
    var _2 = require_lodash();
    var { indentString, getValueString, getKeyString, serializeAnnotations } = require_utils();
    var enabled = (items = []) => items.filter((item) => item.enabled);
    var disabled = (items = []) => items.filter((item) => !item.enabled);
    var stripLastLine = (text) => {
      if (!text || !text.length) return text;
      return text.replace(/(\r?\n)$/, "");
    };
    var jsonToCollectionBru = (json) => {
      const { meta, query, headers, auth, script, tests, vars, docs } = json;
      let bru = "";
      if (meta) {
        bru += "meta {\n";
        for (const key in meta) {
          bru += `  ${key}: ${meta[key]}
`;
        }
        bru += "}\n\n";
      }
      if (query && query.length) {
        bru += "query {";
        if (enabled(query).length) {
          bru += `
${indentString(
            enabled(query).map((item) => `${serializeAnnotations(item.annotations)}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        if (disabled(query).length) {
          bru += `
${indentString(
            disabled(query).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (headers && headers.length) {
        bru += "headers {";
        if (enabled(headers).length) {
          bru += `
${indentString(
            enabled(headers).map((item) => `${serializeAnnotations(item.annotations)}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        if (disabled(headers).length) {
          bru += `
${indentString(
            disabled(headers).map((item) => `${serializeAnnotations(item.annotations)}~${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
          )}`;
        }
        bru += "\n}\n\n";
      }
      if (auth && auth.mode) {
        bru += `auth {
${indentString(`mode: ${auth.mode}`)}
}

`;
      }
      if (auth && auth.awsv4) {
        bru += `auth:awsv4 {
${indentString(`accessKeyId: ${auth.awsv4.accessKeyId}`)}
${indentString(`secretAccessKey: ${auth.awsv4.secretAccessKey}`)}
${indentString(`sessionToken: ${auth.awsv4.sessionToken}`)}
${indentString(`service: ${auth.awsv4.service}`)}
${indentString(`region: ${auth.awsv4.region}`)}
${indentString(`profileName: ${auth.awsv4.profileName}`)}
}

`;
      }
      if (auth && auth.basic) {
        bru += `auth:basic {
${indentString(`username: ${auth.basic.username}`)}
${indentString(`password: ${auth.basic.password}`)}
}

`;
      }
      if (auth && auth.wsse) {
        bru += `auth:wsse {
${indentString(`username: ${auth.wsse.username}`)}
${indentString(`password: ${auth.wsse.password}`)}
}

`;
      }
      if (auth && auth.bearer) {
        bru += `auth:bearer {
${indentString(`token: ${auth.bearer.token}`)}
}

`;
      }
      if (auth && auth.digest) {
        bru += `auth:digest {
${indentString(`username: ${auth.digest.username}`)}
${indentString(`password: ${auth.digest.password}`)}
}

`;
      }
      if (auth && auth.ntlm) {
        bru += `auth:ntlm {
${indentString(`username: ${auth.ntlm.username}`)}
${indentString(`password: ${auth.ntlm.password}`)}
${indentString(`domain: ${auth.ntlm.domain}`)}

}

`;
      }
      if (auth && auth.apikey) {
        bru += `auth:apikey {
${indentString(`key: ${auth?.apikey?.key || ""}`)}
${indentString(`value: ${auth?.apikey?.value || ""}`)}
${indentString(`placement: ${auth?.apikey?.placement || ""}`)}
}
`;
      }
      if (auth && auth.oauth1) {
        bru += `auth:oauth1 {
${indentString(`consumer_key: ${auth?.oauth1?.consumerKey || ""}`)}
${indentString(`consumer_secret: ${auth?.oauth1?.consumerSecret || ""}`)}
${indentString(`access_token: ${auth?.oauth1?.accessToken || ""}`)}
${indentString(`token_secret: ${auth?.oauth1?.accessTokenSecret || ""}`)}
${indentString(`callback_url: ${auth?.oauth1?.callbackUrl || ""}`)}
${indentString(`verifier: ${auth?.oauth1?.verifier || ""}`)}
${indentString(`signature_method: ${auth?.oauth1?.signatureMethod || ""}`)}
${indentString(`private_key: ${auth?.oauth1?.privateKeyType === "file" ? `@file(${auth?.oauth1?.privateKey || ""})` : getValueString(auth?.oauth1?.privateKey || "")}`)}
${indentString(`timestamp: ${auth?.oauth1?.timestamp || ""}`)}
${indentString(`nonce: ${auth?.oauth1?.nonce || ""}`)}
${indentString(`version: ${auth?.oauth1?.version || ""}`)}
${indentString(`realm: ${auth?.oauth1?.realm || ""}`)}
${indentString(`placement: ${auth?.oauth1?.placement || ""}`)}
${indentString(`include_body_hash: ${(auth?.oauth1?.includeBodyHash || false).toString()}`)}
}

`;
      }
      if (auth && auth.oauth2) {
        switch (auth?.oauth2?.grantType) {
          case "password":
            bru += `auth:oauth2 {
${indentString(`grant_type: password`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`username: ${auth?.oauth2?.username || ""}`)}
${indentString(`password: ${auth?.oauth2?.password || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
          case "authorization_code":
            bru += `auth:oauth2 {
${indentString(`grant_type: authorization_code`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ""}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ""}`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`state: ${auth?.oauth2?.state || ""}`)}
${indentString(`pkce: ${(auth?.oauth2?.pkce || false).toString()}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
          case "implicit":
            bru += `auth:oauth2 {
${indentString(`grant_type: implicit`)}
${indentString(`callback_url: ${auth?.oauth2?.callbackUrl || ""}`)}
${indentString(`authorization_url: ${auth?.oauth2?.authorizationUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`state: ${auth?.oauth2?.state || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
}

`;
            break;
          case "client_credentials":
            bru += `auth:oauth2 {
${indentString(`grant_type: client_credentials`)}
${indentString(`access_token_url: ${auth?.oauth2?.accessTokenUrl || ""}`)}
${indentString(`refresh_token_url: ${auth?.oauth2?.refreshTokenUrl || ""}`)}
${indentString(`client_id: ${auth?.oauth2?.clientId || ""}`)}
${indentString(`client_secret: ${auth?.oauth2?.clientSecret || ""}`)}
${indentString(`scope: ${auth?.oauth2?.scope || ""}`)}
${indentString(`credentials_placement: ${auth?.oauth2?.credentialsPlacement || ""}`)}
${indentString(`credentials_id: ${auth?.oauth2?.credentialsId || ""}`)}
${indentString(`token_source: ${auth?.oauth2?.tokenSource || "access_token"}`)}
${indentString(`token_placement: ${auth?.oauth2?.tokenPlacement || ""}`)}${auth?.oauth2?.tokenPlacement == "header" ? "\n" + indentString(`token_header_prefix: ${auth?.oauth2?.tokenHeaderPrefix || ""}`) : ""}${auth?.oauth2?.tokenPlacement !== "header" ? "\n" + indentString(`token_query_key: ${auth?.oauth2?.tokenQueryKey || ""}`) : ""}
${indentString(`auto_fetch_token: ${(auth?.oauth2?.autoFetchToken ?? true).toString()}`)}
${indentString(`auto_refresh_token: ${(auth?.oauth2?.autoRefreshToken ?? false).toString()}`)}
}

`;
            break;
        }
        if (auth?.oauth2?.additionalParameters) {
          const { authorization: authorizationParams, token: tokenParams, refresh: refreshParams } = auth?.oauth2?.additionalParameters;
          const authorizationHeaders = authorizationParams?.filter((p2) => p2?.sendIn == "headers");
          if (authorizationHeaders?.length) {
            bru += `auth:oauth2:additional_params:auth_req:headers {
${indentString(
              authorizationHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const authorizationQueryParams = authorizationParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (authorizationQueryParams?.length) {
            bru += `auth:oauth2:additional_params:auth_req:queryparams {
${indentString(
              authorizationQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenHeaders = tokenParams?.filter((p2) => p2?.sendIn == "headers");
          if (tokenHeaders?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:headers {
${indentString(
              tokenHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenQueryParams = tokenParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (tokenQueryParams?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:queryparams {
${indentString(
              tokenQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const tokenBodyValues = tokenParams?.filter((p2) => p2?.sendIn == "body");
          if (tokenBodyValues?.length) {
            bru += `auth:oauth2:additional_params:access_token_req:body {
${indentString(
              tokenBodyValues.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshHeaders = refreshParams?.filter((p2) => p2?.sendIn == "headers");
          if (refreshHeaders?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:headers {
${indentString(
              refreshHeaders.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshQueryParams = refreshParams?.filter((p2) => p2?.sendIn == "queryparams");
          if (refreshQueryParams?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:queryparams {
${indentString(
              refreshQueryParams.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
          const refreshBodyValues = refreshParams?.filter((p2) => p2?.sendIn == "body");
          if (refreshBodyValues?.length) {
            bru += `auth:oauth2:additional_params:refresh_token_req:body {
${indentString(
              refreshBodyValues.filter((item) => item?.name?.length).map((item) => `${item.enabled ? "" : "~"}${getKeyString(item.name)}: ${getValueString(item.value)}`).join("\n")
            )}
}

`;
          }
        }
      }
      let reqvars = _2.get(vars, "req");
      let resvars = _2.get(vars, "res");
      if (reqvars && reqvars.length) {
        const varsEnabled = _2.filter(reqvars, (v2) => v2.enabled && !v2.local);
        const varsDisabled = _2.filter(reqvars, (v2) => !v2.enabled && !v2.local);
        const varsLocalEnabled = _2.filter(reqvars, (v2) => v2.enabled && v2.local);
        const varsLocalDisabled = _2.filter(reqvars, (v2) => !v2.enabled && v2.local);
        bru += `vars:pre-request {`;
        if (varsEnabled.length) {
          bru += `
${indentString(varsEnabled.map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalEnabled.length) {
          bru += `
${indentString(varsLocalEnabled.map((item) => `${serializeAnnotations(item.annotations)}@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsDisabled.length) {
          bru += `
${indentString(varsDisabled.map((item) => `${serializeAnnotations(item.annotations)}~${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalDisabled.length) {
          bru += `
${indentString(varsLocalDisabled.map((item) => `${serializeAnnotations(item.annotations)}~@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        bru += "\n}\n\n";
      }
      if (resvars && resvars.length) {
        const varsEnabled = _2.filter(resvars, (v2) => v2.enabled && !v2.local);
        const varsDisabled = _2.filter(resvars, (v2) => !v2.enabled && !v2.local);
        const varsLocalEnabled = _2.filter(resvars, (v2) => v2.enabled && v2.local);
        const varsLocalDisabled = _2.filter(resvars, (v2) => !v2.enabled && v2.local);
        bru += `vars:post-response {`;
        if (varsEnabled.length) {
          bru += `
${indentString(varsEnabled.map((item) => `${serializeAnnotations(item.annotations)}${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalEnabled.length) {
          bru += `
${indentString(varsLocalEnabled.map((item) => `${serializeAnnotations(item.annotations)}@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsDisabled.length) {
          bru += `
${indentString(varsDisabled.map((item) => `${serializeAnnotations(item.annotations)}~${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        if (varsLocalDisabled.length) {
          bru += `
${indentString(varsLocalDisabled.map((item) => `${serializeAnnotations(item.annotations)}~@${item.name}: ${getValueString(item.value)}`).join("\n"))}`;
        }
        bru += "\n}\n\n";
      }
      if (script && script.req && script.req.length) {
        bru += `script:pre-request {
${indentString(script.req)}
}

`;
      }
      if (script && script.res && script.res.length) {
        bru += `script:post-response {
${indentString(script.res)}
}

`;
      }
      if (tests && tests.length) {
        bru += `tests {
${indentString(tests)}
}

`;
      }
      if (docs && docs.length) {
        bru += `docs {
${indentString(docs)}
}

`;
      }
      return stripLastLine(bru);
    };
    module2.exports = jsonToCollectionBru;
  }
});

// node_modules/@usebruno/lang/src/index.js
var require_src = __commonJS({
  "node_modules/@usebruno/lang/src/index.js"(exports2, module2) {
    var bruToJsonV2 = require_bruToJson4();
    var jsonToBruV2 = require_jsonToBru2();
    var bruToEnvJsonV2 = require_envToJson();
    var envJsonToBruV2 = require_jsonToEnv();
    var dotenvToJson = require_dotenvToJson();
    var collectionBruToJson = require_collectionBruToJson();
    var jsonToCollectionBru = require_jsonToCollectionBru();
    module2.exports = {
      bruToJsonV2,
      jsonToBruV2,
      bruToEnvJsonV2,
      envJsonToBruV2,
      collectionBruToJson,
      jsonToCollectionBru,
      dotenvToJson
    };
  }
});

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/yaml/dist/nodes/identity.js"(exports2) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports2.ALIAS = ALIAS;
    exports2.DOC = DOC;
    exports2.MAP = MAP;
    exports2.NODE_TYPE = NODE_TYPE;
    exports2.PAIR = PAIR;
    exports2.SCALAR = SCALAR;
    exports2.SEQ = SEQ;
    exports2.hasAnchor = hasAnchor;
    exports2.isAlias = isAlias;
    exports2.isCollection = isCollection;
    exports2.isDocument = isDocument;
    exports2.isMap = isMap;
    exports2.isNode = isNode;
    exports2.isPair = isPair;
    exports2.isScalar = isScalar;
    exports2.isSeq = isSeq;
  }
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/yaml/dist/visit.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i2 = 0; i2 < node.items.length; ++i2) {
            const ci = visit_(i2, node.items[i2], visitor, path);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i2, 1);
              i2 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i2 = 0; i2 < node.items.length; ++i2) {
            const ci = await visitAsync_(i2, node.items[i2], visitor, path);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i2, 1);
              i2 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports2.visit = visit;
    exports2.visitAsync = visitAsync;
  }
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/yaml/dist/doc/directives.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports2.Directives = Directives;
  }
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/yaml/dist/doc/anchors.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i2 = 1; true; ++i2) {
        const name = `${prefix}${i2}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports2.anchorIsValid = anchorIsValid;
    exports2.anchorNames = anchorNames;
    exports2.createNodeAnchors = createNodeAnchors;
    exports2.findNewAnchor = findNewAnchor;
  }
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/yaml/dist/doc/applyReviver.js"(exports2) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i2 = 0, len = val.length; i2 < len; ++i2) {
            const v0 = val[i2];
            const v1 = applyReviver(reviver, val, String(i2), v0);
            if (v1 === void 0)
              delete val[i2];
            else if (v1 !== v0)
              val[i2] = v1;
          }
        } else if (val instanceof Map) {
          for (const k2 of Array.from(val.keys())) {
            const v0 = val.get(k2);
            const v1 = applyReviver(reviver, val, k2, v0);
            if (v1 === void 0)
              val.delete(k2);
            else if (v1 !== v0)
              val.set(k2, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k2, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k2, v0);
            if (v1 === void 0)
              delete val[k2];
            else if (v1 !== v0)
              val[k2] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports2.applyReviver = applyReviver;
  }
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/yaml/dist/nodes/toJS.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v2, i2) => toJS(v2, String(i2), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports2.toJS = toJS;
  }
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/yaml/dist/nodes/Node.js"(exports2) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports2.NodeBase = NodeBase;
  }
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/yaml/dist/nodes/Alias.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const { anchors: anchors2, doc, maxAliasCount } = ctx;
        const source = this.resolve(doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        let data = anchors2.get(source);
        if (!data) {
          toJS.toJS(source, null, ctx);
          data = anchors2.get(source);
        }
        if (data?.res === void 0) {
          const msg = "This should not happen: Alias anchor was not resolved?";
          throw new ReferenceError(msg);
        }
        if (maxAliasCount >= 0) {
          data.count += 1;
          if (data.aliasCount === 0)
            data.aliasCount = getAliasCount(doc, source, anchors2);
          if (data.count * data.aliasCount > maxAliasCount) {
            const msg = "Excessive alias count indicates a resource exhaustion attack";
            throw new ReferenceError(msg);
          }
        }
        return data.res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c2 = getAliasCount(doc, item, anchors2);
          if (c2 > count)
            count = c2;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports2.Alias = Alias;
  }
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/yaml/dist/nodes/Scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports2.Scalar = Scalar;
    exports2.isScalarValue = isScalarValue;
  }
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/yaml/dist/doc/createNode.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t2) => t2.tag === tagName);
        const tagObj = match.find((t2) => !t2.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t2) => t2.identify?.(value) && !t2.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports2.createNode = createNode;
  }
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/yaml/dist/nodes/Collection.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema, path, value) {
      let v2 = value;
      for (let i2 = path.length - 1; i2 >= 0; --i2) {
        const k2 = path[i2];
        if (typeof k2 === "number" && Number.isInteger(k2) && k2 >= 0) {
          const a2 = [];
          a2[k2] = v2;
          v2 = a2;
        } else {
          v2 = /* @__PURE__ */ new Map([[k2, v2]]);
        }
      }
      return createNode.createNode(v2, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n2 = node.value;
          return n2 == null || allowScalar && identity.isScalar(n2) && n2.value == null && !n2.commentBefore && !n2.comment && !n2.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports2.Collection = Collection;
    exports2.collectionFromPath = collectionFromPath;
    exports2.isEmptyPath = isEmptyPath;
  }
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyComment.js"(exports2) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports2.indentComment = indentComment;
    exports2.lineComment = lineComment;
    exports2.stringifyComment = stringifyComment;
  }
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/yaml/dist/stringify/foldFlowLines.js"(exports2) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i2 = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i2 = consumeMoreIndentedLines(text, i2, indent.length);
        if (i2 !== -1)
          end = i2 + endStep;
      }
      for (let ch; ch = text[i2 += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i2;
          switch (text[i2 + 1]) {
            case "x":
              i2 += 3;
              break;
            case "u":
              i2 += 5;
              break;
            case "U":
              i2 += 9;
              break;
            default:
              i2 += 1;
          }
          escEnd = i2;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i2 = consumeMoreIndentedLines(text, i2, indent.length);
          end = i2 + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i2 + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i2;
          }
          if (i2 >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i2 += 1];
                overflow = true;
              }
              const j2 = i2 > escEnd + 1 ? i2 - 2 : escStart - 1;
              if (escapedFolds[j2])
                return text;
              folds.push(j2);
              escapedFolds[j2] = true;
              end = j2 + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i3 = 0; i3 < folds.length; ++i3) {
        const fold = folds[i3];
        const end2 = folds[i3 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i2, indent) {
      let end = i2;
      let start = i2 + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i2 < start + indent) {
          ch = text[++i2];
        } else {
          do {
            ch = text[++i2];
          } while (ch && ch !== "\n");
          end = i2;
          start = i2 + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports2.FOLD_BLOCK = FOLD_BLOCK;
    exports2.FOLD_FLOW = FOLD_FLOW;
    exports2.FOLD_QUOTED = FOLD_QUOTED;
    exports2.foldFlowLines = foldFlowLines;
  }
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyString.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i2 = 0, start = 0; i2 < strLen; ++i2) {
        if (str[i2] === "\n") {
          if (i2 - start > limit)
            return true;
          start = i2 + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start = 0;
      for (let i2 = 0, ch = json[i2]; ch; ch = json[++i2]) {
        if (ch === " " && json[i2 + 1] === "\\" && json[i2 + 2] === "n") {
          str += json.slice(start, i2) + "\\ ";
          i2 += 1;
          start = i2;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i2 + 1]) {
            case "u":
              {
                str += json.slice(start, i2);
                const code = json.substr(i2 + 2, 4);
                switch (code) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str += "\\x" + code.substr(2);
                    else
                      str += json.substr(i2, 6);
                }
                i2 += 5;
                start = i2 + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i2 + 2] === '"' || json.length < minMultiLineLength) {
                i2 += 1;
              } else {
                str += json.slice(start, i2) + "\n\n";
                while (json[i2 + 2] === "\\" && json[i2 + 3] === "n" && json[i2 + 4] !== '"') {
                  str += "\n";
                  i2 += 2;
                }
                str += indent;
                if (json[i2 + 2] === " ")
                  str += "\\";
                i2 += 1;
                start = i2 + 1;
              }
              break;
            default:
              i2 += 1;
          }
      }
      str = start ? str + json.slice(start) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value = value.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t2 = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t2);
        if (res === null)
          throw new Error(`Unsupported default string type ${t2}`);
      }
      return res;
    }
    exports2.stringifyString = stringifyString;
  }
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/yaml/dist/stringify/stringify.js"(exports2) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t2) => t2.tag === item.tag);
        if (match.length > 0)
          return match.find((t2) => t2.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t2) => t2.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t2) => t2.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t2) => t2.format === item.format) ?? match.find((t2) => !t2.format);
      } else {
        obj = item;
        tagObj = tags.find((t2) => t2.nodeClass && obj instanceof t2.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o2) => tagObj = o2 });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports2.createStringifyContext = createStringifyContext;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyPair.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports2.stringifyPair = stringifyPair;
  }
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/yaml/dist/log.js"(exports2) {
    "use strict";
    var node_process = require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports2.debug = debug;
    exports2.warn = warn;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports2.addMergeToJSMap = addMergeToJSMap;
    exports2.isMergeKey = isMergeKey;
    exports2.merge = merge;
  }
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports2) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports2.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/yaml/dist/nodes/Pair.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k2 = createNode.createNode(key, void 0, ctx);
      const v2 = createNode.createNode(value, void 0, ctx);
      return new Pair(k2, v2);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_2, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports2.Pair = Pair;
    exports2.createPair = createPair;
  }
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyCollection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i2 = 0; i2 < items.length; ++i2) {
        const item = items[i2];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str2);
      }
      let str;
      if (lines.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines[0];
        for (let i2 = 1; i2 < lines.length; ++i2) {
          const line = lines[i2];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i2 = 0; i2 < items.length; ++i2) {
        const item = items[i2];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
        if (i2 < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines.push(str);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start;
          for (const line of lines)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines.push(ic.trimStart());
      }
    }
    exports2.stringifyCollection = stringifyCollection;
  }
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLMap.js"(exports2) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k2 = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k2)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k2)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i2 = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i2 === -1)
            this.items.push(_pair);
          else
            this.items.splice(i2, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_2, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports2.YAMLMap = YAMLMap;
    exports2.findPair = findPair;
  }
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/yaml/dist/schema/common/map.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports2.map = map;
  }
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/yaml/dist/nodes/YAMLSeq.js"(exports2) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_2, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i2 = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i2++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i2 = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i2++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports2.YAMLSeq = YAMLSeq;
  }
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/yaml/dist/schema/common/seq.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports2.seq = seq;
  }
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/yaml/dist/schema/common/string.js"(exports2) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports2.string = string;
  }
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/yaml/dist/schema/common/null.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports2.nullTag = nullTag;
  }
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/yaml/dist/schema/core/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports2.boolTag = boolTag;
  }
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyNumber.js"(exports2) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num = typeof value === "number" ? value : Number(value);
      if (!isFinite(num))
        return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
      let n2 = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n2) && !n2.includes("e")) {
        let i2 = n2.indexOf(".");
        if (i2 < 0) {
          i2 = n2.length;
          n2 += ".";
        }
        let d2 = minFractionDigits - (n2.length - i2 - 1);
        while (d2-- > 0)
          n2 += "0";
      }
      return n2;
    }
    exports2.stringifyNumber = stringifyNumber;
  }
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/yaml/dist/schema/core/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/yaml/dist/schema/core/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/yaml/dist/schema/core/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/yaml/dist/schema/json/schema.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports2) {
    "use strict";
    var node_buffer = require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i2 = 0; i2 < str.length; ++i2)
            buffer[i2] = str.charCodeAt(i2);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s2 = "";
          for (let i2 = 0; i2 < buf.length; ++i2)
            s2 += String.fromCharCode(buf[i2]);
          str = btoa(s2);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n2 = Math.ceil(str.length / lineWidth);
          const lines = new Array(n2);
          for (let i2 = 0, o2 = 0; i2 < n2; ++i2, o2 += lineWidth) {
            lines[i2] = str.substr(o2, lineWidth);
          }
          str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports2.binary = binary;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i2 = 0; i2 < seq.items.length; ++i2) {
          let item = seq.items[i2];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i2] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i2 = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i2++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports2.createPairs = createPairs;
    exports2.pairs = pairs;
    exports2.resolvePairs = resolvePairs;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_2, ctx) {
        if (!ctx)
          return super.toJSON(_2);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports2.YAMLOMap = YAMLOMap;
    exports2.omap = omap;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports2.falseTag = falseTag;
    exports2.trueTag = trueTag;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num = Number(node.value);
        return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f2 = str.substring(dot + 1).replace(/_/g, "");
          if (f2[f2.length - 1] === "0")
            node.minFractionDigits = f2.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports2.float = float;
    exports2.floatExp = floatExp;
    exports2.floatNaN = floatNaN;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n3 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n3 : n3;
      }
      const n2 = parseInt(str, radix);
      return sign === "-" ? -1 * n2 : n2;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports2.int = int;
    exports2.intBin = intBin;
    exports2.intHex = intHex;
    exports2.intOct = intOct;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_2, ctx) {
        return super.toJSON(_2, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports2.YAMLSet = YAMLSet;
    exports2.set = set;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports2) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num = (n2) => asBigInt ? BigInt(n2) : Number(n2);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p2) => res2 * num(60) + num(p2), num(0));
      return sign === "-" ? num(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num = (n2) => n2;
      if (typeof value === "bigint")
        num = (n2) => BigInt(n2);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num(-1);
      }
      const _60 = num(60);
      const parts = [value % _60];
      if (value < 60) {
        parts.unshift(0);
      } else {
        value = (value - parts[0]) / _60;
        parts.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts[0]) / _60;
          parts.unshift(value);
        }
      }
      return sign + parts.map((n2) => String(n2).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d2 = parseSexagesimal(tz, false);
          if (Math.abs(d2) < 30)
            d2 *= 60;
          date -= 6e4 * d2;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports2.floatTime = floatTime;
    exports2.intTime = intTime;
    exports2.timestamp = timestamp;
  }
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports2.schema = schema;
  }
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/yaml/dist/schema/tags.js"(exports2) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports2.coreKnownTags = coreKnownTags;
    exports2.getTags = getTags;
  }
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/yaml/dist/schema/Schema.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a2, b2) => a2.key < b2.key ? -1 : a2.key > b2.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports2.Schema = Schema;
  }
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/yaml/dist/stringify/stringifyDocument.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports2.stringifyDocument = stringifyDocument;
  }
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/yaml/dist/doc/Document.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v2) => typeof v2 === "number" || v2 instanceof String || v2 instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k2 = this.createNode(key, null, options);
        const v2 = this.createNode(value, null, options);
        return new Pair.Pair(k2, v2);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s2 = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s2}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports2.Document = Document;
  }
});

// node_modules/yaml/dist/errors.js
var require_errors2 = __commonJS({
  "node_modules/yaml/dist/errors.js"(exports2) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports2.YAMLError = YAMLError;
    exports2.YAMLParseError = YAMLParseError;
    exports2.YAMLWarning = YAMLWarning;
    exports2.prettifyError = prettifyError;
  }
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/yaml/dist/compose/resolve-props.js"(exports2) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports2.resolveProps = resolveProps;
  }
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/yaml/dist/compose/util-contains-newline.js"(exports2) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports2.containsNewline = containsNewline;
  }
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports2) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports2.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/yaml/dist/compose/util-map-includes.js"(exports2) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a2, b2) => a2 === b2 || identity.isScalar(a2) && identity.isScalar(b2) && a2.value === b2.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports2.mapIncludes = mapIncludes;
  }
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-map.js"(exports2) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep, value } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports2.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-seq.js"(exports2) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports2.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/yaml/dist/compose/resolve-end.js"(exports2) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep + cb;
              sep = "";
              break;
            }
            case "newline":
              if (comment)
                sep += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports2.resolveEnd = resolveEnd;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i2 = 0; i2 < fc.items.length; ++i2) {
        const collItem = fc.items[i2];
        const { start, key, sep, value } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep && !value) {
            if (i2 === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i2 < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i2 === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep)
                for (const st of sep) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports2.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/yaml/dist/compose/compose-collection.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t2) => t2.tag === tagName && t2.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports2.composeCollection = composeCollection;
  }
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i2 = lines.length - 1; i2 >= 0; --i2) {
        const content = lines[i2][1];
        if (content === "" || content === "\r")
          chompStart = i2;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i2 = 0; i2 < chompStart; ++i2) {
        const [indent, content] = lines[i2];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i2;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i2 = lines.length - 1; i2 >= chompStart; --i2) {
        if (lines[i2][0].length > trimIndent)
          chompStart = i2 + 1;
      }
      let value = "";
      let sep = "";
      let prevMoreIndented = false;
      for (let i2 = 0; i2 < contentStart; ++i2)
        value += lines[i2][0].slice(trimIndent) + "\n";
      for (let i2 = contentStart; i2 < chompStart; ++i2) {
        let [indent, content] = lines[i2];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep === " ")
            sep = "\n";
          else if (!prevMoreIndented && sep === "\n")
            sep = "\n\n";
          value += sep + indent.slice(trimIndent) + content;
          sep = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep === "\n")
            value += "\n";
          else
            sep = "\n";
        } else {
          value += sep + content;
          sep = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i2 = chompStart; i2 < lines.length; ++i2)
            value += "\n" + lines[i2][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i2 = 1; i2 < source.length; ++i2) {
        const ch = source[i2];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n2 = Number(ch);
          if (!indent && n2)
            indent = n2;
          else if (error === -1)
            error = offset + i2;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i2 = 1; i2 < props.length; ++i2) {
        const token = props[i2];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m2 = first.match(/^( *)/);
      const line0 = m2?.[1] ? [m2[1], first.slice(m2[1].length)] : ["", first];
      const lines = [line0];
      for (let i2 = 1; i2 < split.length; i2 += 2)
        lines.push([split[i2], split[i2 + 1]]);
      return lines;
    }
    exports2.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports2) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return foldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return foldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function foldLines(source) {
      let first, line;
      try {
        first = new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
        line = new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
      } catch {
        first = /(.*?)[ \t]*\r?\n/sy;
        line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
      }
      let match = first.exec(source);
      if (!match)
        return source;
      let res = match[1];
      let sep = " ";
      let pos = first.lastIndex;
      line.lastIndex = pos;
      while (match = line.exec(source)) {
        if (match[1] === "") {
          if (sep === "\n")
            res += sep;
          else
            sep = "\n";
        } else {
          res += sep + match[1];
          sep = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i2 = 1; i2 < source.length - 1; ++i2) {
        const ch = source[i2];
        if (ch === "\r" && source[i2 + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i2);
          res += fold;
          i2 = offset;
        } else if (ch === "\\") {
          let next = source[++i2];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i2 + 1];
            while (next === " " || next === "	")
              next = source[++i2 + 1];
          } else if (next === "\r" && source[i2 + 1] === "\n") {
            next = source[++i2 + 1];
            while (next === " " || next === "	")
              next = source[++i2 + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i2 + 1, length, onError);
            i2 += length;
          } else {
            const raw = source.substr(i2 - 1, 2);
            onError(i2 - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i2;
          let next = source[i2 + 1];
          while (next === " " || next === "	")
            next = source[++i2 + 1];
          if (next !== "\n" && !(next === "\r" && source[i2 + 2] === "\n"))
            res += i2 > wsStart ? source.slice(wsStart, i2 + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports2.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/yaml/dist/compose/compose-scalar.js"(exports2) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports2.composeScalar = composeScalar;
  }
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports2) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i2 = pos - 1; i2 >= 0; --i2) {
          let st = before[i2];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i2];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i2];
          }
          break;
        }
      }
      return offset;
    }
    exports2.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/yaml/dist/compose/compose-node.js"(exports2) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports2.composeEmptyNode = composeEmptyNode;
    exports2.composeNode = composeNode;
  }
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/yaml/dist/compose/compose-doc.js"(exports2) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports2.composeDoc = composeDoc;
  }
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/yaml/dist/compose/composer.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors2();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i2 = 0; i2 < prelude.length; ++i2) {
        const source = prelude[i2];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i2 + 1]?.[0] !== "#")
              i2 += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i2 = 0; i2 < this.errors.length; ++i2)
            doc.errors.push(this.errors[i2]);
          for (let i2 = 0; i2 < this.warnings.length; ++i2)
            doc.warnings.push(this.warnings[i2]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports2.Composer = Composer;
  }
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/yaml/dist/parse/cst-scalar.js"(exports2) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors2();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports2.createScalarToken = createScalarToken;
    exports2.resolveAsScalar = resolveAsScalar;
    exports2.setScalarValue = setScalarValue;
  }
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/yaml/dist/parse/cst-stringify.js"(exports2) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep, value }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep)
        for (const st of sep)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/yaml/dist/parse/cst-visit.js"(exports2) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i2 = 0; i2 < token.items.length; ++i2) {
            const ci = _visit(Object.freeze(path.concat([[field, i2]])), token.items[i2], visitor);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i2, 1);
              i2 -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports2.visit = visit;
  }
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/yaml/dist/parse/cst.js"(exports2) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports2.createScalarToken = cstScalar.createScalarToken;
    exports2.resolveAsScalar = cstScalar.resolveAsScalar;
    exports2.setScalarValue = cstScalar.setScalarValue;
    exports2.stringify = cstStringify.stringify;
    exports2.visit = cstVisit.visit;
    exports2.BOM = BOM;
    exports2.DOCUMENT = DOCUMENT;
    exports2.FLOW_END = FLOW_END;
    exports2.SCALAR = SCALAR;
    exports2.isCollection = isCollection;
    exports2.isScalar = isScalar;
    exports2.prettyToken = prettyToken;
    exports2.tokenType = tokenType;
  }
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/yaml/dist/parse/lexer.js"(exports2) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i2 = this.pos;
        let ch = this.buffer[i2];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i2];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i2 + 1] === "\n";
        return false;
      }
      charAt(n2) {
        return this.buffer[this.pos + n2];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n2) {
        return this.pos + n2 <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n2) {
        return this.buffer.substr(this.pos, n2);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n2 = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n2);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s2 = this.peek(3);
          if ((s2 === "---" || s2 === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s2 === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n2 = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n2;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n2 = yield* this.pushIndicators();
        switch (line[n2]) {
          case "#":
            yield* this.pushCount(line.length - n2);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n2 += yield* this.parseBlockScalarHeader();
            n2 += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n2);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n2 = 0;
        while (line[n2] === ",") {
          n2 += yield* this.pushCount(1);
          n2 += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n2 += yield* this.pushIndicators();
        switch (line[n2]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n2);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n2 = 0;
            while (this.buffer[end - 1 - n2] === "\\")
              n2 += 1;
            if (n2 % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i2 = this.pos;
        while (true) {
          const ch = this.buffer[++i2];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i3 = this.pos; ch = this.buffer[i3]; ++i3) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i3;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i3 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i2 = nl + 1;
        ch = this.buffer[i2];
        while (ch === " ")
          ch = this.buffer[++i2];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i2];
          nl = i2 - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i3 = nl - 1;
            let ch2 = this.buffer[i3];
            if (ch2 === "\r")
              ch2 = this.buffer[--i3];
            const lastChar = i3;
            while (ch2 === " ")
              ch2 = this.buffer[--i3];
            if (ch2 === "\n" && i3 >= this.pos && i3 + 1 + indent > lastChar)
              nl = i3;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i2 = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i2]) {
          if (ch === ":") {
            const next = this.buffer[i2 + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i2;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i2 + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i2 += 1;
                ch = "\n";
                next = this.buffer[i2 + 1];
              } else
                end = i2;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i2 + 1);
              if (cs === -1)
                break;
              i2 = Math.max(i2, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i2;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n2) {
        if (n2 > 0) {
          yield this.buffer.substr(this.pos, n2);
          this.pos += n2;
          return n2;
        }
        return 0;
      }
      *pushToIndex(i2, allowEmpty) {
        const s2 = this.buffer.slice(this.pos, i2);
        if (s2) {
          yield s2;
          this.pos += s2.length;
          return s2.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n2 = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n2 += yield* this.pushTag();
              n2 += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n2 += yield* this.pushUntil(isNotAnchorChar);
              n2 += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n2 += yield* this.pushCount(1);
                n2 += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n2;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i2 = this.pos + 2;
          let ch = this.buffer[i2];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i2];
          return yield* this.pushToIndex(ch === ">" ? i2 + 1 : i2, false);
        } else {
          let i2 = this.pos + 1;
          let ch = this.buffer[i2];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i2];
            else if (ch === "%" && hexDigits.has(this.buffer[i2 + 1]) && hexDigits.has(this.buffer[i2 + 2])) {
              ch = this.buffer[i2 += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i2, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i2 = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i2];
        } while (ch === " " || allowTabs && ch === "	");
        const n2 = i2 - this.pos;
        if (n2 > 0) {
          yield this.buffer.substr(this.pos, n2);
          this.pos = i2;
        }
        return n2;
      }
      *pushUntil(test) {
        let i2 = this.pos;
        let ch = this.buffer[i2];
        while (!test(ch))
          ch = this.buffer[++i2];
        return yield* this.pushToIndex(i2, false);
      }
    };
    exports2.Lexer = Lexer;
  }
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/yaml/dist/parse/line-counter.js"(exports2) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports2.LineCounter = LineCounter;
  }
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/yaml/dist/parse/parser.js"(exports2) {
    "use strict";
    var node_process = require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type) {
      for (let i2 = 0; i2 < list.length; ++i2)
        if (list[i2].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i2 = 0; i2 < list.length; ++i2) {
        switch (list[i2].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i2;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i2 = prev.length;
      loop: while (--i2 >= 0) {
        switch (prev[i2].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i2]?.type === "space") {
      }
      return prev.splice(i2, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i2 = 0; i2 < source.length; ++i2)
          target.push(source[i2]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n2) {
        return this.stack[this.stack.length - n2];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep;
          if (scalar.end) {
            sep = scalar.end;
            sep.push(this.sourceToken);
            delete scalar.end;
          } else
            sep = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i2 = 0; i2 < it.sep.length; ++i2) {
              const st = it.sep[i2];
              switch (st.type) {
                case "newline":
                  nl.push(i2);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep = it.sep;
                  sep.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep = fc.end.splice(1, fc.end.length);
            sep.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports2.Parser = Parser;
  }
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/yaml/dist/public-api.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors2();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports2.parse = parse;
    exports2.parseAllDocuments = parseAllDocuments;
    exports2.parseDocument = parseDocument;
    exports2.stringify = stringify;
  }
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/yaml/dist/index.js"(exports2) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors2();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports2.Composer = composer.Composer;
    exports2.Document = Document.Document;
    exports2.Schema = Schema.Schema;
    exports2.YAMLError = errors.YAMLError;
    exports2.YAMLParseError = errors.YAMLParseError;
    exports2.YAMLWarning = errors.YAMLWarning;
    exports2.Alias = Alias.Alias;
    exports2.isAlias = identity.isAlias;
    exports2.isCollection = identity.isCollection;
    exports2.isDocument = identity.isDocument;
    exports2.isMap = identity.isMap;
    exports2.isNode = identity.isNode;
    exports2.isPair = identity.isPair;
    exports2.isScalar = identity.isScalar;
    exports2.isSeq = identity.isSeq;
    exports2.Pair = Pair.Pair;
    exports2.Scalar = Scalar.Scalar;
    exports2.YAMLMap = YAMLMap.YAMLMap;
    exports2.YAMLSeq = YAMLSeq.YAMLSeq;
    exports2.CST = cst;
    exports2.Lexer = lexer.Lexer;
    exports2.LineCounter = lineCounter.LineCounter;
    exports2.Parser = parser.Parser;
    exports2.parse = publicApi.parse;
    exports2.parseAllDocuments = publicApi.parseAllDocuments;
    exports2.parseDocument = publicApi.parseDocument;
    exports2.stringify = publicApi.stringify;
    exports2.visit = visit.visit;
    exports2.visitAsync = visit.visitAsync;
  }
});

// node_modules/nanoid/url-alphabet/index.cjs
var require_url_alphabet = __commonJS({
  "node_modules/nanoid/url-alphabet/index.cjs"(exports2, module2) {
    var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
    module2.exports = { urlAlphabet };
  }
});

// node_modules/nanoid/index.cjs
var require_nanoid = __commonJS({
  "node_modules/nanoid/index.cjs"(exports2, module2) {
    var crypto = require("crypto");
    var { urlAlphabet } = require_url_alphabet();
    var POOL_SIZE_MULTIPLIER = 128;
    var pool;
    var poolOffset;
    var fillPool = (bytes) => {
      if (!pool || pool.length < bytes) {
        pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
        crypto.randomFillSync(pool);
        poolOffset = 0;
      } else if (poolOffset + bytes > pool.length) {
        crypto.randomFillSync(pool);
        poolOffset = 0;
      }
      poolOffset += bytes;
    };
    var random = (bytes) => {
      fillPool(bytes |= 0);
      return pool.subarray(poolOffset - bytes, poolOffset);
    };
    var customRandom = (alphabet, defaultSize, getRandom) => {
      let mask = (2 << 31 - Math.clz32(alphabet.length - 1 | 1)) - 1;
      let step = Math.ceil(1.6 * mask * defaultSize / alphabet.length);
      return (size = defaultSize) => {
        let id = "";
        while (true) {
          let bytes = getRandom(step);
          let i2 = step;
          while (i2--) {
            id += alphabet[bytes[i2] & mask] || "";
            if (id.length === size) return id;
          }
        }
      };
    };
    var customAlphabet = (alphabet, size = 21) => customRandom(alphabet, size, random);
    var nanoid = (size = 21) => {
      fillPool(size |= 0);
      let id = "";
      for (let i2 = poolOffset - size; i2 < poolOffset; i2++) {
        id += urlAlphabet[pool[i2] & 63];
      }
      return id;
    };
    module2.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random };
  }
});

// node_modules/@usebruno/filestore/dist/cjs/workers/worker-script.js
var e = require("node:worker_threads");
var t = require_lodash();
var r = require_src();
var s = require_dist();
function n(e2) {
  var t2 = /* @__PURE__ */ Object.create(null);
  return e2 && Object.keys(e2).forEach((function(r2) {
    if ("default" !== r2) {
      var s2 = Object.getOwnPropertyDescriptor(e2, r2);
      Object.defineProperty(t2, r2, s2.get ? s2 : { enumerable: true, get: function() {
        return e2[r2];
      } });
    }
  })), t2.default = e2, Object.freeze(t2);
}
var a = n(t);
var o = n(s);
var i = [{ type: "authorization", sendIn: "headers", source: "oauth2_additional_parameters_auth_req_headers" }, { type: "authorization", sendIn: "queryparams", source: "oauth2_additional_parameters_auth_req_queryparams" }, { type: "token", sendIn: "headers", source: "oauth2_additional_parameters_access_token_req_headers" }, { type: "token", sendIn: "queryparams", source: "oauth2_additional_parameters_access_token_req_queryparams" }, { type: "token", sendIn: "body", source: "oauth2_additional_parameters_access_token_req_bodyvalues" }, { type: "refresh", sendIn: "headers", source: "oauth2_additional_parameters_refresh_token_req_headers" }, { type: "refresh", sendIn: "queryparams", source: "oauth2_additional_parameters_refresh_token_req_queryparams" }, { type: "refresh", sendIn: "body", source: "oauth2_additional_parameters_refresh_token_req_bodyvalues" }];
var l = (e2, t2) => e2?.length ? e2.map(((e3) => ({ ...e3, sendIn: t2 }))) : [];
var c = (e2, t2, r2) => {
  if (!/* @__PURE__ */ ((e3, t3) => "authorization" === e3 ? "authorization_code" === t3 || "implicit" === t3 : "token" !== e3 && "refresh" !== e3 || "implicit" !== t3)(t2, r2)) return [];
  const s2 = i.filter(((e3) => e3.type === t2)), n2 = [];
  for (const t3 of s2) {
    const r3 = e2[t3.source], s3 = l(r3, t3.sendIn);
    n2.push(...s3);
  }
  return n2;
};
var u = (e2, t2 = false) => {
  try {
    const s2 = t2 ? e2 : r.bruToJsonV2(e2);
    let n2 = a.get(s2, "meta.type");
    switch (n2) {
      case "http":
      default:
        n2 = "http-request";
        break;
      case "graphql":
        n2 = "graphql-request";
        break;
      case "grpc":
        n2 = "grpc-request";
        break;
      case "ws":
        n2 = "ws-request";
    }
    const o2 = a.get(s2, "meta.seq"), i2 = a.get(s2, "meta.tags", []), l2 = { "grpc-request": "grpc.url", "ws-request": "ws.url", default: "http.url" }, u2 = { type: n2, name: a.get(s2, "meta.name"), seq: a.isNaN(o2) ? 1 : Number(o2), settings: a.get(s2, "settings", {}), tags: Array.isArray(i2) ? i2 : [], request: { method: "grpc-request" === n2 ? a.get(s2, "grpc.method", "") : String(a.get(s2, "http.method") ?? "").toUpperCase(), url: a.get(s2, l2[n2], a.get(s2, l2.default)), headers: "grpc-request" === n2 ? a.get(s2, "metadata", []) : a.get(s2, "headers", []), auth: a.get(s2, "auth", {}), body: a.get(s2, "body", {}), script: a.get(s2, "script", {}), vars: a.get(s2, "vars", {}), assertions: a.get(s2, "assertions", []), tests: a.get(s2, "tests", ""), docs: a.get(s2, "docs", "") }, examples: a.get(s2, "examples", []).map(((e3) => d(e3, true, n2, a.get(s2, "http.method")))) };
    if ("grpc-request" === n2) {
      const e3 = a.get(s2, "grpc.methodType");
      e3 && (u2.request.methodType = e3);
      const t3 = a.get(s2, "grpc.protoPath");
      t3 && (u2.request.protoPath = t3), u2.request.auth.mode = a.get(s2, "grpc.auth", "none"), u2.request.body = a.get(s2, "body", { mode: "grpc", grpc: a.get(s2, "body.grpc", [{ name: "message 1", content: "{}" }]) });
    } else "ws-request" === n2 ? (u2.request.auth.mode = a.get(s2, "ws.auth", "none"), u2.request.body = a.get(s2, "body", { mode: "ws", ws: a.get(s2, "body.ws", [{ name: "message 1", content: "{}" }]) })) : (u2.request.params = a.get(s2, "params", []), u2.request.auth.mode = a.get(s2, "http.auth", "none"), u2.request.body.mode = a.get(s2, "http.body", "none"));
    const p2 = s2?.auth?.oauth2?.grantType;
    if (p2) {
      const e3 = ((e4) => {
        const t3 = e4.auth.oauth2.grantType, r2 = {};
        try {
          const s3 = ["authorization", "token", "refresh"];
          for (const n3 of s3) {
            const s4 = c(e4, n3, t3);
            s4.length > 0 && (r2[n3] = s4);
          }
        } catch (e5) {
          console.error(e5), console.error("Error while getting the oauth2 additional parameters!");
        }
        return r2;
      })(s2);
      Object.keys(e3 || {}).length > 0 && (u2.request.auth.oauth2.additionalParameters = e3);
    }
    return u2;
  } catch (e3) {
    throw console.log("parseBruRequest error", e3), e3;
  }
};
var d = (e2, t2 = false, s2, n2) => {
  try {
    const o2 = t2 ? e2 : r.bruToJsonV2(e2), i2 = s2 || a.get(o2, "meta.type", "http"), l2 = n2 || a.get(o2, "http.method", "GET");
    let c2 = i2;
    switch (i2) {
      case "http":
      default:
        c2 = "http-request";
        break;
      case "graphql":
        c2 = "graphql-request";
        break;
      case "grpc":
        c2 = "grpc-request";
        break;
      case "ws":
        c2 = "ws-request";
    }
    let u2 = a.get(o2, "response.status", "200"), d2 = a.get(o2, "response.statusText", "OK");
    isNaN(Number(u2)) && !isNaN(Number(d2)) && ([u2, d2] = [d2, u2]);
    return { type: c2, name: a.get(o2, "name"), description: a.get(o2, "description", ""), request: { method: a.get(o2, "request.method") || l2, url: a.get(o2, "request.url"), headers: a.get(o2, "request.headers", []), body: a.get(o2, "request.body", { mode: "none" }), params: a.get(o2, "request.params", []) }, response: { headers: a.get(o2, "response.headers", []).map(((e3) => ({ name: e3.name, value: e3.value }))), status: Number(u2) || 200, statusText: d2 || "OK", body: { type: a.get(o2, "response.body.type", "json"), content: a.get(o2, "response.body.content", "") } } };
  } catch (e3) {
    throw console.log("bruExampleToJson error", e3), e3;
  }
};
var p = (e2) => {
  try {
    return { name: a.get(e2, "name"), description: a.get(e2, "description", ""), request: { method: a.get(e2, "request.method"), url: a.get(e2, "request.url"), headers: a.get(e2, "request.headers", []), body: a.get(e2, "request.body", {}), params: a.get(e2, "request.params", []) }, response: a.get(e2, "response", {}) };
  } catch (e3) {
    throw e3;
  }
};
var m = ["info", "http", "graphql", "grpc", "websocket", "runtime", "settings", "examples", "docs", "items", "request"];
var h = (e2) => {
  const t2 = o.stringify(e2, { lineWidth: 0, indent: 2, minContentWidth: 0, defaultStringType: "PLAIN" }).split("\n"), r2 = [];
  for (let e3 = 0; e3 < t2.length; e3++) {
    const s2 = t2[e3];
    if (e3 > 0 && !s2.startsWith(" ") && !s2.startsWith("	")) {
      const e4 = s2.split(":")[0];
      m.includes(e4) && r2.length > 0 && "" !== r2[r2.length - 1].trim() && r2.push("");
    }
    r2.push(s2);
  }
  return r2.join("\n");
};
var { customAlphabet: g } = require_nanoid();
var y = (e2) => "string" == typeof e2;
var f = (e2) => "number" == typeof e2;
var q = (e2) => y(e2) && e2.trim().length > 0;
var k = (e2, t2 = "") => null == e2 ? t2 : "string" == typeof e2 ? e2 : String(e2);
var b = () => g("useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict", 21)();
var v = (e2) => "boolean" == typeof e2 ? e2 : void 0;
var w = (e2) => {
  if (!Array.isArray(e2) || 0 === e2.length) return;
  const t2 = e2.filter(((e3) => e3 && q(e3.name))).map(((e3) => {
    const t3 = ((e4) => {
      if (y(e4)) switch (e4.trim().toLowerCase()) {
        case "headers":
          return "header";
        case "queryparams":
          return "query";
        case "body":
          return "body";
        default:
          return;
      }
    })(e3.sendIn);
    if (!t3) return;
    const r2 = { name: e3.name.trim(), placement: t3 };
    return q(e3.value) && (r2.value = e3.value), r2;
  })).filter(((e3) => Boolean(e3)));
  return t2.length > 0 ? t2 : void 0;
};
var T = (e2) => {
  const t2 = {};
  return q(e2.clientId) && (t2.clientId = e2.clientId), q(e2.clientSecret) && (t2.clientSecret = e2.clientSecret), q(e2.credentialsPlacement) && (t2.placement = e2.credentialsPlacement), Object.keys(t2).length > 0 ? t2 : void 0;
};
var U = (e2) => {
  const t2 = {};
  return q(e2.credentialsId) && (t2.id = e2.credentialsId), q(e2.tokenPlacement) || (t2.placement = { header: "" }), "header" === e2.tokenPlacement && (t2.placement = { header: e2.tokenHeaderPrefix }), "url" === e2.tokenPlacement && (t2.placement = { query: e2.tokenQueryKey }), t2.source = e2.tokenSource || "access_token", Object.keys(t2).length > 0 ? t2 : void 0;
};
var P = (e2) => {
  const t2 = v(e2.autoFetchToken), r2 = v(e2.autoRefreshToken), s2 = {};
  return void 0 !== t2 && (s2.autoFetchToken = t2), void 0 !== r2 && (s2.autoRefreshToken = r2), Object.keys(s2).length > 0 ? s2 : void 0;
};
var x = (e2) => {
  const t2 = { type: "oauth2", flow: "resource_owner_password_credentials" };
  q(e2.accessTokenUrl) && (t2.accessTokenUrl = e2.accessTokenUrl), q(e2.refreshTokenUrl) && (t2.refreshTokenUrl = e2.refreshTokenUrl);
  const r2 = T(e2);
  r2 && (t2.credentials = r2);
  const s2 = ((e3) => {
    const t3 = {};
    return q(e3.username) && (t3.username = e3.username), q(e3.password) && (t3.password = e3.password), Object.keys(t3).length > 0 ? t3 : void 0;
  })(e2);
  s2 && (t2.resourceOwner = s2), q(e2.scope) && (t2.scope = e2.scope);
  const n2 = w(e2.additionalParameters?.token), a2 = w(e2.additionalParameters?.refresh);
  (n2 || a2) && (t2.additionalParameters = {}, n2 && (t2.additionalParameters.accessTokenRequest = n2), a2 && (t2.additionalParameters.refreshTokenRequest = a2));
  const o2 = U(e2);
  o2 && (t2.tokenConfig = o2);
  const i2 = P(e2);
  return i2 && (t2.settings = i2), t2;
};
var _ = (e2) => {
  if (e2) switch (e2.grantType) {
    case "client_credentials":
      return ((e3) => {
        const t2 = { type: "oauth2", flow: "client_credentials" };
        q(e3.accessTokenUrl) && (t2.accessTokenUrl = e3.accessTokenUrl), q(e3.refreshTokenUrl) && (t2.refreshTokenUrl = e3.refreshTokenUrl);
        const r2 = T(e3);
        r2 && (t2.credentials = r2), q(e3.scope) && (t2.scope = e3.scope);
        const s2 = w(e3.additionalParameters?.token), n2 = w(e3.additionalParameters?.refresh);
        (s2 || n2) && (t2.additionalParameters = {}, s2 && (t2.additionalParameters.accessTokenRequest = s2), n2 && (t2.additionalParameters.refreshTokenRequest = n2));
        const a2 = U(e3);
        a2 && (t2.tokenConfig = a2);
        const o2 = P(e3);
        return o2 && (t2.settings = o2), t2;
      })(e2);
    case "password":
      return x(e2);
    case "authorization_code":
      return ((e3) => {
        const t2 = { type: "oauth2", flow: "authorization_code" };
        q(e3.authorizationUrl) && (t2.authorizationUrl = e3.authorizationUrl), q(e3.accessTokenUrl) && (t2.accessTokenUrl = e3.accessTokenUrl), q(e3.refreshTokenUrl) && (t2.refreshTokenUrl = e3.refreshTokenUrl), q(e3.callbackUrl) && (t2.callbackUrl = e3.callbackUrl);
        const r2 = T(e3);
        r2 && (t2.credentials = r2);
        const s2 = w(e3.additionalParameters?.authorization), n2 = w(e3.additionalParameters?.token), a2 = w(e3.additionalParameters?.refresh);
        (s2 || n2 || a2) && (t2.additionalParameters = {}, s2 && (t2.additionalParameters.authorizationRequest = s2), n2 && (t2.additionalParameters.accessTokenRequest = n2), a2 && (t2.additionalParameters.refreshTokenRequest = a2)), q(e3.scope) && (t2.scope = e3.scope), q(e3.state) && (t2.state = e3.state);
        const o2 = ((e4) => {
          if (null != e4) return e4 ? {} : { disabled: true };
        })(e3.pkce);
        o2 && (t2.pkce = o2);
        const i2 = U(e3);
        i2 && (t2.tokenConfig = i2);
        const l2 = P(e3);
        return l2 && (t2.settings = l2), t2;
      })(e2);
    case "implicit":
      return ((e3) => {
        const t2 = { type: "oauth2", flow: "implicit" };
        q(e3.authorizationUrl) && (t2.authorizationUrl = e3.authorizationUrl), q(e3.callbackUrl) && (t2.callbackUrl = e3.callbackUrl), q(e3.clientId) && (t2.credentials = { clientId: e3.clientId }), q(e3.scope) && (t2.scope = e3.scope), q(e3.state) && (t2.state = e3.state);
        const r2 = w(e3.additionalParameters?.authorization);
        r2 && (t2.additionalParameters = { authorizationRequest: r2 });
        const s2 = U(e3);
        s2 && (t2.tokenConfig = s2);
        const n2 = P(e3);
        return n2 && (t2.settings = n2), t2;
      })(e2);
    default:
      return void console.warn(`toOpenCollectionOAuth2: Unsupported OAuth2 grant type "${e2.grantType}".`);
  }
};
var R = (e2) => {
  if (!Array.isArray(e2) || 0 === e2.length) return null;
  const t2 = e2.map(((e3) => {
    const t3 = ((e4) => {
      if (!e4) return null;
      switch (e4) {
        case "header":
          return "headers";
        case "query":
          return "queryparams";
        case "body":
          return "body";
        default:
          return null;
      }
    })(e3.placement);
    return { name: e3.name || null, value: e3.value || null, sendIn: t3 || "headers", enabled: true };
  }));
  return t2.length > 0 ? t2 : null;
};
var C = (e2) => {
  if (e2 && "none" !== e2.mode) {
    if ("inherit" === e2.mode) return "inherit";
    switch (e2.mode) {
      case "awsv4":
        return ((e3) => {
          const t2 = { type: "awsv4" };
          return e3 ? (y(e3.accessKeyId) && (t2.accessKeyId = e3.accessKeyId), y(e3.secretAccessKey) && (t2.secretAccessKey = e3.secretAccessKey), y(e3.sessionToken) && (t2.sessionToken = e3.sessionToken), y(e3.service) && (t2.service = e3.service), y(e3.region) && (t2.region = e3.region), y(e3.profileName) && (t2.profileName = e3.profileName), t2) : t2;
        })(e2.awsv4);
      case "basic":
        return ((e3) => {
          const t2 = { type: "basic" };
          return e3 ? (y(e3.username) && (t2.username = e3.username), y(e3.password) && (t2.password = e3.password), t2) : t2;
        })(e2.basic);
      case "bearer":
        return ((e3) => {
          const t2 = { type: "bearer" };
          return e3 ? (y(e3.token) && (t2.token = e3.token), t2) : t2;
        })(e2.bearer);
      case "digest":
        return ((e3) => {
          const t2 = { type: "digest" };
          return e3 ? (y(e3.username) && (t2.username = e3.username), y(e3.password) && (t2.password = e3.password), t2) : t2;
        })(e2.digest);
      case "ntlm":
        return ((e3) => {
          const t2 = { type: "ntlm" };
          return e3 ? (y(e3.username) && (t2.username = e3.username), y(e3.password) && (t2.password = e3.password), y(e3.domain) && (t2.domain = e3.domain), t2) : t2;
        })(e2.ntlm);
      case "wsse":
        return ((e3) => {
          const t2 = { type: "wsse" };
          return e3 ? (y(e3.username) && (t2.username = e3.username), y(e3.password) && (t2.password = e3.password), t2) : t2;
        })(e2.wsse);
      case "apikey":
        return ((e3) => {
          const t2 = { type: "apikey" };
          return e3 ? (y(e3.key) && (t2.key = e3.key), y(e3.value) && (t2.value = e3.value), y(e3.placement) && ("header" === e3.placement ? t2.placement = "header" : "queryparams" === e3.placement && (t2.placement = "query")), t2) : t2;
        })(e2.apikey);
      case "oauth1":
        return ((e3) => {
          const t2 = { type: "oauth1" };
          return e3 ? (y(e3.consumerKey) && (t2.consumerKey = e3.consumerKey), y(e3.consumerSecret) && (t2.consumerSecret = e3.consumerSecret), y(e3.accessToken) && (t2.accessToken = e3.accessToken), y(e3.accessTokenSecret) && (t2.accessTokenSecret = e3.accessTokenSecret), y(e3.callbackUrl) && (t2.callbackUrl = e3.callbackUrl), y(e3.verifier) && (t2.verifier = e3.verifier), y(e3.signatureMethod) && (t2.signatureMethod = e3.signatureMethod), y(e3.privateKey) && (t2.privateKey = "file" === e3.privateKeyType ? { type: "file", value: e3.privateKey } : { type: "text", value: e3.privateKey }), y(e3.timestamp) && (t2.timestamp = e3.timestamp), y(e3.nonce) && (t2.nonce = e3.nonce), y(e3.version) && (t2.version = e3.version), y(e3.realm) && (t2.realm = e3.realm), y(e3.placement) && (t2.placement = e3.placement), "boolean" == typeof e3.includeBodyHash && (t2.includeBodyHash = e3.includeBodyHash), t2) : t2;
        })(e2.oauth1);
      case "oauth2":
        return _(e2.oauth2);
      default:
        return void console.warn(`toOpenCollectionAuth failed: Unsupported auth mode "${e2.mode}".`);
    }
  }
};
var I = (e2) => {
  const t2 = { mode: "none", awsv4: null, basic: null, bearer: null, digest: null, ntlm: null, oauth2: null, wsse: null, apikey: null };
  if (!e2) return t2;
  if ("inherit" === e2) return t2.mode = "inherit", t2;
  switch (e2.type) {
    case "awsv4":
      t2.mode = "awsv4", t2.awsv4 = { accessKeyId: e2.accessKeyId || null, secretAccessKey: e2.secretAccessKey || null, sessionToken: e2.sessionToken || null, service: e2.service || null, region: e2.region || null, profileName: e2.profileName || null };
      break;
    case "basic":
      t2.mode = "basic", t2.basic = { username: e2.username || null, password: e2.password || null };
      break;
    case "bearer":
      t2.mode = "bearer", t2.bearer = { token: e2.token || "" };
      break;
    case "digest":
      t2.mode = "digest", t2.digest = { username: e2.username || null, password: e2.password || null };
      break;
    case "ntlm":
      t2.mode = "ntlm", t2.ntlm = { username: e2.username || null, password: e2.password || null, domain: e2.domain || null };
      break;
    case "wsse":
      t2.mode = "wsse", t2.wsse = { username: e2.username || null, password: e2.password || null };
      break;
    case "apikey":
      t2.mode = "apikey", t2.apikey = { key: e2.key || null, value: e2.value || null, placement: "query" === e2.placement ? "queryparams" : "header" === e2.placement ? "header" : null };
      break;
    case "oauth1":
      t2.mode = "oauth1", t2.oauth1 = { consumerKey: e2.consumerKey || null, consumerSecret: e2.consumerSecret || null, accessToken: e2.accessToken || null, accessTokenSecret: e2.accessTokenSecret || null, callbackUrl: e2.callbackUrl || null, verifier: e2.verifier || null, signatureMethod: e2.signatureMethod || "HMAC-SHA1", privateKey: ("object" == typeof e2.privateKey && e2.privateKey ? e2.privateKey.value : e2.privateKey) || null, privateKeyType: "object" == typeof e2.privateKey && e2.privateKey ? e2.privateKey.type : "text", timestamp: e2.timestamp || null, nonce: e2.nonce || null, version: e2.version || "1.0", realm: e2.realm || null, placement: e2.placement || "header", includeBodyHash: e2.includeBodyHash || false };
      break;
    case "oauth2":
      t2.mode = "oauth2", t2.oauth2 = ((e3) => {
        if (!e3) return null;
        const t3 = { grantType: "authorization_code", username: null, password: null, callbackUrl: null, authorizationUrl: null, accessTokenUrl: null, clientId: null, clientSecret: null, scope: null, state: null, pkce: false, credentialsPlacement: null, credentialsId: null, tokenPlacement: null, tokenHeaderPrefix: null, tokenQueryKey: null, tokenSource: "access_token", refreshTokenUrl: null, autoRefreshToken: false, autoFetchToken: true, additionalParameters: null };
        switch (e3.flow) {
          case "client_credentials":
            if (t3.grantType = "client_credentials", e3.accessTokenUrl && (t3.accessTokenUrl = e3.accessTokenUrl), e3.refreshTokenUrl && (t3.refreshTokenUrl = e3.refreshTokenUrl), e3.credentials?.clientId && (t3.clientId = e3.credentials.clientId), e3.credentials?.clientSecret && (t3.clientSecret = e3.credentials.clientSecret), e3.credentials?.placement && (t3.credentialsPlacement = e3.credentials.placement), e3.scope && (t3.scope = e3.scope), e3.tokenConfig?.id && (t3.credentialsId = e3.tokenConfig.id), e3.tokenConfig?.source && (t3.tokenSource = e3.tokenConfig.source || "access_token"), e3.tokenConfig?.placement && ("header" in e3.tokenConfig.placement ? (t3.tokenPlacement = "header", t3.tokenHeaderPrefix = e3.tokenConfig.placement.header || "") : "query" in e3.tokenConfig.placement && (t3.tokenPlacement = "url", t3.tokenQueryKey = e3.tokenConfig.placement.query || "")), e3.additionalParameters) {
              const r2 = {};
              if (e3.additionalParameters.accessTokenRequest) {
                const t4 = R(e3.additionalParameters.accessTokenRequest);
                t4 && (r2.token = t4);
              }
              if (e3.additionalParameters.refreshTokenRequest) {
                const t4 = R(e3.additionalParameters.refreshTokenRequest);
                t4 && (r2.refresh = t4);
              }
              Object.keys(r2).length > 0 && (t3.additionalParameters = r2);
            }
            break;
          case "resource_owner_password_credentials":
            if (t3.grantType = "password", e3.accessTokenUrl && (t3.accessTokenUrl = e3.accessTokenUrl), e3.refreshTokenUrl && (t3.refreshTokenUrl = e3.refreshTokenUrl), e3.credentials?.clientId && (t3.clientId = e3.credentials.clientId), e3.credentials?.clientSecret && (t3.clientSecret = e3.credentials.clientSecret), e3.credentials?.placement && (t3.credentialsPlacement = e3.credentials.placement), e3.resourceOwner?.username && (t3.username = e3.resourceOwner.username), e3.resourceOwner?.password && (t3.password = e3.resourceOwner.password), e3.scope && (t3.scope = e3.scope), e3.tokenConfig?.id && (t3.credentialsId = e3.tokenConfig.id), e3.tokenConfig?.source && (t3.tokenSource = e3.tokenConfig.source || "access_token"), e3.tokenConfig?.placement && ("header" in e3.tokenConfig.placement ? (t3.tokenPlacement = "header", t3.tokenHeaderPrefix = e3.tokenConfig.placement.header || "") : "query" in e3.tokenConfig.placement && (t3.tokenPlacement = "url", t3.tokenQueryKey = e3.tokenConfig.placement.query || "")), e3.additionalParameters) {
              const r2 = {};
              if (e3.additionalParameters.accessTokenRequest) {
                const t4 = R(e3.additionalParameters.accessTokenRequest);
                t4 && (r2.token = t4);
              }
              if (e3.additionalParameters.refreshTokenRequest) {
                const t4 = R(e3.additionalParameters.refreshTokenRequest);
                t4 && (r2.refresh = t4);
              }
              Object.keys(r2).length > 0 && (t3.additionalParameters = r2);
            }
            break;
          case "authorization_code":
            if (t3.grantType = "authorization_code", e3.authorizationUrl && (t3.authorizationUrl = e3.authorizationUrl), e3.accessTokenUrl && (t3.accessTokenUrl = e3.accessTokenUrl), e3.refreshTokenUrl && (t3.refreshTokenUrl = e3.refreshTokenUrl), e3.callbackUrl && (t3.callbackUrl = e3.callbackUrl), e3.credentials?.clientId && (t3.clientId = e3.credentials.clientId), e3.credentials?.clientSecret && (t3.clientSecret = e3.credentials.clientSecret), e3.credentials?.placement && (t3.credentialsPlacement = e3.credentials.placement), e3.scope && (t3.scope = e3.scope), e3.state && (t3.state = e3.state), e3.tokenConfig?.id && (t3.credentialsId = e3.tokenConfig.id), e3.tokenConfig?.source && (t3.tokenSource = e3.tokenConfig.source || "access_token"), e3.tokenConfig?.placement && ("header" in e3.tokenConfig.placement ? (t3.tokenPlacement = "header", t3.tokenHeaderPrefix = e3.tokenConfig.placement.header || "") : "query" in e3.tokenConfig.placement && (t3.tokenPlacement = "url", t3.tokenQueryKey = e3.tokenConfig.placement.query || "")), e3.additionalParameters) {
              const r2 = {};
              if (e3.additionalParameters.authorizationRequest) {
                const t4 = R(e3.additionalParameters.authorizationRequest);
                t4 && (r2.authorization = t4);
              }
              if (e3.additionalParameters.accessTokenRequest) {
                const t4 = R(e3.additionalParameters.accessTokenRequest);
                t4 && (r2.token = t4);
              }
              if (e3.additionalParameters.refreshTokenRequest) {
                const t4 = R(e3.additionalParameters.refreshTokenRequest);
                t4 && (r2.refresh = t4);
              }
              Object.keys(r2).length > 0 && (t3.additionalParameters = r2);
            }
            break;
          case "implicit":
            if (t3.grantType = "implicit", e3.authorizationUrl && (t3.authorizationUrl = e3.authorizationUrl), e3.callbackUrl && (t3.callbackUrl = e3.callbackUrl), e3.credentials?.clientId && (t3.clientId = e3.credentials.clientId), e3.scope && (t3.scope = e3.scope), e3.state && (t3.state = e3.state), e3.tokenConfig?.id && (t3.credentialsId = e3.tokenConfig.id), e3.tokenConfig?.source && (t3.tokenSource = e3.tokenConfig.source || "access_token"), e3.tokenConfig?.placement && ("header" in e3.tokenConfig.placement ? (t3.tokenPlacement = "header", t3.tokenHeaderPrefix = e3.tokenConfig.placement.header || "") : "query" in e3.tokenConfig.placement && (t3.tokenPlacement = "url", t3.tokenQueryKey = e3.tokenConfig.placement.query || "")), e3.additionalParameters) {
              const r2 = {};
              if (e3.additionalParameters.authorizationRequest) {
                const t4 = R(e3.additionalParameters.authorizationRequest);
                t4 && (r2.authorization = t4);
              }
              Object.keys(r2).length > 0 && (t3.additionalParameters = r2);
            }
            break;
          default:
            return null;
        }
        if (void 0 !== e3.settings?.autoFetchToken && (t3.autoFetchToken = e3.settings.autoFetchToken), void 0 !== e3.settings?.autoRefreshToken && (t3.autoRefreshToken = e3.settings.autoRefreshToken), "authorization_code" === t3.grantType && "authorization_code" === e3.flow) {
          const r2 = e3;
          void 0 !== r2.pkce && (t3.pkce = !r2.pkce.disabled);
        }
        return null === t3.additionalParameters && delete t3.additionalParameters, t3;
      })(e2);
      break;
    default:
      console.warn("toBrunoAuth failed: Unsupported auth type");
  }
  return t2;
};
var j = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    const t3 = { name: e3.name || "", value: e3.value || "" };
    return e3?.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
  }));
  return t2.length ? t2 : void 0;
};
var S = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => ({ uid: b(), name: k(e3.name), value: k(e3.value), enabled: !("disabled" in e3) || true !== e3.disabled })));
  return t2.length ? t2 : void 0;
};
var E = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    const t3 = { name: e3.name || "", value: e3.value || "", type: e3.type };
    return e3?.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
  }));
  return t2.length ? t2 : void 0;
};
var K = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    const t3 = { uid: b(), name: k(e3.name), value: k(e3.value), type: e3.type, enabled: true !== e3.disabled };
    return e3.description && ("string" == typeof e3.description && e3.description.trim().length ? t3.description = e3.description : "object" == typeof e3.description && e3.description.content?.trim().length && (t3.description = e3.description.content)), t3;
  }));
  return t2.length ? t2 : void 0;
};
var z = (e2) => {
  if (e2) switch (e2.mode) {
    case "none":
    case "graphql":
    default:
      return;
    case "json":
      return { type: "json", data: e2.json || "" };
    case "text":
      return { type: "text", data: e2.text || "" };
    case "xml":
      return { type: "xml", data: e2.xml || "" };
    case "sparql":
      return { type: "sparql", data: e2.sparql || "" };
    case "formUrlEncoded":
      const t2 = e2.formUrlEncoded?.map(((e3) => {
        const t3 = { name: e3.name || "", value: e3.value || "" };
        return e3?.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
      })) || [];
      return { type: "form-urlencoded", ...t2.length > 0 && { data: t2 } };
    case "multipartForm":
      const r2 = e2.multipartForm?.map(((e3) => {
        const t3 = { name: e3.name || "", type: e3.type, value: e3.value || ("file" === e3.type ? [] : "") };
        return e3?.contentType?.trim().length && (t3.contentType = e3.contentType), e3?.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
      })) || [];
      return { type: "multipart-form", ...r2.length > 0 && { data: r2 } };
    case "file":
      const s2 = e2.file?.map(((e3) => ({ filePath: e3.filePath || "", contentType: e3.contentType || "", selected: e3.selected ?? false }))) || [];
      return { type: "file", ...s2.length > 0 && { data: s2 } };
  }
};
var N = (e2) => {
  if (!e2) return { mode: "none", json: null, text: null, xml: null, sparql: null, formUrlEncoded: [], multipartForm: [], graphql: null, file: [] };
  const t2 = { mode: "none", json: null, text: null, xml: null, sparql: null, formUrlEncoded: [], multipartForm: [], graphql: null, file: [] };
  switch (e2.type) {
    case "json":
      t2.mode = "json", t2.json = e2.data || "";
      break;
    case "text":
      t2.mode = "text", t2.text = e2.data || "";
      break;
    case "xml":
      t2.mode = "xml", t2.xml = e2.data || "";
      break;
    case "sparql":
      t2.mode = "sparql", t2.sparql = e2.data || "";
      break;
    case "form-urlencoded":
      t2.mode = "formUrlEncoded", t2.formUrlEncoded = e2.data?.map(((e3) => {
        const t3 = { uid: b(), name: k(e3.name), value: k(e3.value), enabled: true !== e3.disabled };
        return e3.description && ("string" == typeof e3.description && e3.description.trim().length ? t3.description = e3.description : "object" == typeof e3.description && e3.description.content?.trim().length && (t3.description = e3.description.content)), t3;
      })) || [];
      break;
    case "multipart-form":
      t2.mode = "multipartForm", t2.multipartForm = e2.data?.map(((e3) => {
        const t3 = { uid: b(), type: e3.type, name: k(e3.name), value: "file" === e3.type ? e3.value || [] : k(e3.value), contentType: e3.contentType || null, enabled: true !== e3.disabled };
        return e3.description && ("string" == typeof e3.description && e3.description.trim().length ? t3.description = e3.description : "object" == typeof e3.description && e3.description.content?.trim().length && (t3.description = e3.description.content)), t3;
      })) || [];
      break;
    case "file":
      t2.mode = "file", t2.file = e2.data?.map(((e3) => ({ uid: b(), filePath: e3.filePath || "", contentType: e3.contentType || "", selected: e3.selected ?? false }))) || [];
  }
  return t2;
};
var A = (e2) => {
  const t2 = e2 && "req" in e2 ? e2.req : e2, r2 = Array.isArray(t2) ? t2 : [];
  if (!r2.length) return;
  const s2 = r2.map(((e3) => {
    const t3 = { name: e3.name || "", value: e3.datatype && "string" !== e3.datatype ? { type: e3.datatype, data: k(e3.value) } : e3.value || "" };
    return e3?.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
  }));
  return s2.length > 0 ? s2 : void 0;
};
var O = (e2) => {
  if (!e2?.length) return { req: [], res: [] };
  const t2 = [];
  return e2.forEach(((e3) => {
    const r2 = { uid: b(), name: k(e3.name), value: "", enabled: true !== e3.disabled, local: false };
    var s2;
    "object" == typeof (s2 = e3.value) && null !== s2 && !Array.isArray(s2) && "type" in s2 && "data" in s2 ? (r2.value = k(e3.value.data), "string" !== e3.value.type && "null" !== e3.value.type && (r2.datatype = e3.value.type)) : r2.value = k(e3.value), e3.description && (r2.description = "string" == typeof e3.description ? e3.description : e3.description?.content || ""), t2.push(r2);
  })), { req: t2, res: [] };
};
var F = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    const t3 = { type: "set-variable", phase: "after-response", selector: { expression: e3.value || "", method: "jsonq" }, variable: { name: e3.name || "", scope: e3.local ? "request" : "runtime" } };
    return e3.description?.trim().length && (t3.description = e3.description), false === e3.enabled && (t3.disabled = true), t3;
  }));
  return t2.length > 0 ? t2 : void 0;
};
var H = (e2) => {
  if (!e2?.length) return [];
  const t2 = [];
  return e2.forEach(((e3) => {
    if ("set-variable" === e3.type && "after-response" === e3.phase) {
      const r2 = e3, s2 = { uid: b(), name: k(r2.variable?.name), value: k(r2.selector?.expression), enabled: true !== r2.disabled, local: false };
      r2.description && (s2.description = "string" == typeof r2.description ? r2.description : r2.description?.content || ""), t2.push(s2);
    }
  })), t2;
};
var B = (e2) => {
  const t2 = [];
  return e2?.script?.req?.trim().length && t2.push({ type: "before-request", code: e2.script.req.trim() }), e2?.script?.res?.trim().length && t2.push({ type: "after-response", code: e2.script.res.trim() }), e2?.tests?.trim().length && t2.push({ type: "tests", code: e2.tests.trim() }), t2.length > 0 ? t2 : void 0;
};
var M = (e2) => {
  if (!e2 || !Array.isArray(e2) || 0 === e2.length) return;
  const t2 = {};
  for (const r2 of e2) "before-request" === r2.type && r2.code && (t2.script || (t2.script = {}), t2.script.req = r2.code), "after-response" === r2.type && r2.code && (t2.script || (t2.script = {}), t2.script.res = r2.code), "tests" === r2.type && r2.code && (t2.tests = r2.code);
  return Object.keys(t2).length > 0 ? t2 : void 0;
};
var W = ["eq", "neq", "gt", "gte", "lt", "lte", "in", "notIn", "contains", "notContains", "length", "matches", "notMatches", "startsWith", "endsWith", "between", "isEmpty", "isNotEmpty", "isNull", "isUndefined", "isDefined", "isTruthy", "isFalsy", "isJson", "isNumber", "isString", "isBoolean", "isArray"];
var Q = ["isEmpty", "isNotEmpty", "isNull", "isUndefined", "isDefined", "isTruthy", "isFalsy", "isJson", "isNumber", "isString", "isBoolean", "isArray"];
var G = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    const { operator: t3, value: r2 } = ((e4 = "") => {
      if (!e4 || "string" != typeof e4 || !e4.length) return { operator: "eq", value: e4 };
      const [t4, ...r3] = e4.trim().split(" "), s3 = r3.join(" ");
      return Q.includes(t4) ? { operator: t4, value: void 0 } : W.includes(t4) ? { operator: t4, value: s3 } : { operator: "eq", value: e4 };
    })(e3.value || ""), s2 = { expression: e3.name || "", operator: t3, ...void 0 !== r2 && { value: r2 } };
    return e3?.description?.trim().length && (s2.description = e3.description), false === e3.enabled && (s2.disabled = true), s2;
  }));
  return t2.length > 0 ? t2 : void 0;
};
var J = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => {
    let t3 = k(e3.operator);
    void 0 !== e3.value && null !== e3.value && (t3 = `${e3.operator} ${k(e3.value)}`);
    const r2 = { uid: b(), name: k(e3.expression), value: t3, enabled: true !== e3.disabled };
    return e3.description && ("string" == typeof e3.description && e3.description.trim().length ? r2.description = e3.description : "object" == typeof e3.description && e3.description.content?.trim().length && (r2.description = e3.description.content)), r2;
  }));
  return t2.length > 0 ? t2 : void 0;
};
var $ = (e2) => {
  if (!e2?.length) return;
  const t2 = e2.map(((e3) => ({ uid: b(), name: k(e3.name), value: k(e3.value), enabled: true !== e3.disabled })));
  return t2.length ? t2 : void 0;
};
var L = (e2) => {
  try {
    const s2 = ((e3) => o.parse(e3))(e2), n2 = ((e3) => {
      const t3 = e3?.info?.type;
      switch (t3) {
        case "http":
          e3.runtime?.auth && !e3.http?.auth && (e3.http.auth = e3.runtime.auth);
          break;
        case "graphql":
          e3.runtime?.auth && !e3.graphql?.auth && (e3.graphql.auth = e3.runtime.auth);
          break;
        case "grpc":
          e3.runtime?.auth && !e3.grpc?.auth && (e3.grpc.auth = e3.runtime.auth);
          break;
        case "websocket":
          e3.runtime?.auth && !e3.websocket?.auth && (e3.websocket.auth = e3.runtime.auth);
      }
      return e3;
    })(s2), a2 = "info" in (r2 = n2) && r2.info && "type" in r2.info ? r2.info.type : "type" in r2 ? r2.type : void 0;
    if (!n2 || !a2) throw new Error("Invalid item: missing type");
    switch (a2) {
      case "http":
        return ((e3) => {
          const t3 = e3.info, r3 = e3.http, s3 = e3.runtime, n3 = { url: k(r3?.url), method: k(r3?.method, "GET"), headers: S(r3?.headers) || [], params: K(r3?.params) || [], auth: I(r3?.auth), body: N(r3?.body) || { mode: "none", json: null, text: null, xml: null, sparql: null, formUrlEncoded: [], multipartForm: [], graphql: null, file: [] }, script: { req: null, res: null }, vars: { req: [], res: [] }, assertions: [], tests: null, docs: null }, a3 = M(s3?.scripts);
          a3?.script && n3.script && (a3.script.req && (n3.script.req = a3.script.req), a3.script.res && (n3.script.res = a3.script.res)), a3?.tests && (n3.tests = a3.tests);
          const o2 = O(s3?.variables), i2 = H(s3?.actions);
          n3.vars = { req: o2.req, res: i2 };
          const l2 = J(s3?.assertions);
          l2 && (n3.assertions = l2), e3.docs && (n3.docs = e3.docs);
          const c2 = { uid: b(), type: "http-request", seq: t3?.seq || 1, name: k(t3?.name, "Untitled Request"), tags: t3?.tags || [], request: n3, settings: null, fileContent: null, root: null, items: [], examples: [], filename: null, pathname: null };
          if (e3.settings) {
            const t4 = {};
            "boolean" == typeof e3.settings.encodeUrl ? t4.encodeUrl = e3.settings.encodeUrl : t4.encodeUrl = true, "number" == typeof e3.settings.timeout ? t4.timeout = e3.settings.timeout : "inherit" === e3.settings.timeout ? t4.timeout = "inherit" : t4.timeout = 0, "boolean" == typeof e3.settings.followRedirects ? t4.followRedirects = e3.settings.followRedirects : t4.followRedirects = true, "number" == typeof e3.settings.maxRedirects ? t4.maxRedirects = e3.settings.maxRedirects : t4.maxRedirects = 5, c2.settings = t4;
          }
          return e3.examples?.length && (c2.examples = e3.examples.map(((e4) => {
            const t4 = { uid: b(), itemUid: b(), name: k(e4.name, "Untitled Example"), type: "http-request", request: null, response: null };
            return e4.description && ("string" == typeof e4.description && e4.description.trim().length ? t4.description = e4.description : "object" == typeof e4.description && e4.description.content?.trim().length && (t4.description = e4.description.content)), e4.request && (t4.request = { url: k(e4.request.url), method: k(e4.request.method, "GET"), headers: S(e4.request.headers) || [], params: K(e4.request.params) || [], body: N(e4.request.body) || { mode: "none", json: null, text: null, xml: null, sparql: null, formUrlEncoded: null, multipartForm: null, graphql: null, file: null } }), e4.response && (t4.response = { status: "number" == typeof e4.response.status ? e4.response.status : void 0 !== e4.response.status ? Number(e4.response.status) : null, statusText: e4.response.statusText || null, headers: S(e4.response.headers) || [], body: null }, e4.response.body && (t4.response.body = { type: e4.response.body.type || "text", content: e4.response.body.data || "" })), t4;
          }))), c2;
        })(n2);
      case "graphql":
        return ((e3) => {
          const t3 = e3.info, r3 = e3.graphql, s3 = e3.runtime, n3 = { url: k(r3?.url), method: k(r3?.method, "POST"), headers: S(r3?.headers) || [], params: K(r3?.params) || [], auth: I(r3?.auth), body: { mode: "graphql", json: null, text: null, xml: null, sparql: null, formUrlEncoded: [], multipartForm: [], graphql: { query: r3?.body?.query || "", variables: r3?.body?.variables || "" }, file: [] }, script: { req: null, res: null }, vars: { req: [], res: [] }, assertions: [], tests: null, docs: null }, a3 = M(s3?.scripts);
          a3?.script && n3.script && (a3.script.req && (n3.script.req = a3.script.req), a3.script.res && (n3.script.res = a3.script.res)), a3?.tests && (n3.tests = a3.tests);
          const o2 = O(s3?.variables), i2 = H(s3?.actions);
          n3.vars = { req: o2.req, res: i2 };
          const l2 = J(s3?.assertions);
          l2 && (n3.assertions = l2), e3.docs && (n3.docs = e3.docs);
          const c2 = { uid: b(), type: "graphql-request", seq: t3?.seq || 1, name: k(t3?.name, "Untitled Request"), tags: t3?.tags || [], request: n3, settings: null, fileContent: null, root: null, items: [], examples: [], filename: null, pathname: null };
          if (e3.settings) {
            const t4 = {};
            "boolean" == typeof e3.settings.encodeUrl ? t4.encodeUrl = e3.settings.encodeUrl : t4.encodeUrl = true, "number" == typeof e3.settings.timeout ? t4.timeout = e3.settings.timeout : "inherit" === e3.settings.timeout ? t4.timeout = "inherit" : t4.timeout = 0, "boolean" == typeof e3.settings.followRedirects ? t4.followRedirects = e3.settings.followRedirects : t4.followRedirects = true, "number" == typeof e3.settings.maxRedirects ? t4.maxRedirects = e3.settings.maxRedirects : t4.maxRedirects = 5, c2.settings = t4;
          }
          return c2;
        })(n2);
      case "grpc":
        return ((e3) => {
          const t3 = e3.info, r3 = e3.grpc, s3 = e3.runtime, n3 = { url: k(r3?.url), method: k(r3?.method), methodType: r3?.methodType || "", protoPath: r3?.protoFilePath || null, headers: $(r3?.metadata) || [], auth: I(r3?.auth), body: { mode: "grpc", grpc: [] }, script: { req: null, res: null }, vars: { req: [], res: [] }, assertions: [], tests: null, docs: null };
          q(r3?.message) && (n3.body.grpc = [{ name: "", content: r3?.message }]);
          const a3 = M(s3?.scripts);
          a3?.script && n3.script && (a3.script.req && (n3.script.req = a3.script.req), a3.script.res && (n3.script.res = a3.script.res)), a3?.tests && (n3.tests = a3.tests);
          const o2 = O(s3?.variables);
          n3.vars = o2;
          const i2 = J(s3?.assertions);
          return i2 && (n3.assertions = i2), e3.docs && (n3.docs = e3.docs), { uid: b(), type: "grpc-request", seq: t3?.seq || 1, name: k(t3?.name, "Untitled Request"), tags: t3?.tags || [], request: n3, settings: {}, fileContent: null, root: null, items: [], examples: [], filename: null, pathname: null };
        })(n2);
      case "websocket":
        return ((e3) => {
          const t3 = e3.info, r3 = e3.websocket, s3 = e3.runtime, n3 = { url: k(r3?.url), headers: S(r3?.headers) || [], auth: I(r3?.auth), body: { mode: "ws", ws: [] }, script: { req: null, res: null }, vars: { req: [], res: [] }, assertions: [], tests: null, docs: null };
          if (r3?.message) {
            const e4 = r3.message, t4 = k(e4.data);
            t4.trim().length && (n3.body.ws = [{ name: "", type: e4.type || "text", content: t4 }]);
          }
          const a3 = M(s3?.scripts);
          a3?.script && n3.script && (a3.script.req && (n3.script.req = a3.script.req), a3.script.res && (n3.script.res = a3.script.res)), a3?.tests && (n3.tests = a3.tests);
          const o2 = O(s3?.variables);
          n3.vars = o2, e3.docs && (n3.docs = e3.docs);
          const i2 = { timeout: 0, keepAliveInterval: 0 };
          return e3.settings && ("number" == typeof e3.settings.timeout && (i2.timeout = e3.settings.timeout), "number" == typeof e3.settings.keepAliveInterval && (i2.keepAliveInterval = e3.settings.keepAliveInterval)), { uid: b(), type: "ws-request", seq: t3?.seq || 1, name: k(t3?.name, "Untitled Request"), tags: t3?.tags || [], request: n3, settings: i2, fileContent: null, root: null, items: [], examples: [], filename: null, pathname: null };
        })(n2);
      case "script":
        return t2 = n2, { uid: b(), type: "js", seq: 1, name: "Script", tags: [], request: null, settings: null, fileContent: t2.script || "", root: null, items: [], examples: [], filename: null, pathname: null };
      case "folder":
        throw new Error("Folder items should be handled separately using parseFolder");
      default:
        throw new Error(`Unsupported item type: ${a2}`);
    }
  } catch (e3) {
    throw console.error("Error parsing item:", e3), e3;
  }
  var t2, r2;
};
var D = (e2) => {
  try {
    switch (e2.type) {
      case "http-request":
        return ((e3) => {
          try {
            const t2 = {}, r2 = e3.request, s2 = { name: q(e3.name) ? e3.name : "Untitled Request", type: "http" };
            e3.seq && (s2.seq = e3.seq), e3.tags?.length && (s2.tags = e3.tags), t2.info = s2;
            const n2 = { method: q(r2.method) ? r2.method : "GET", url: q(r2.url) ? r2.url : "" }, a2 = j(r2.headers);
            a2 && (n2.headers = a2);
            const o2 = E(r2.params);
            o2 && (n2.params = o2);
            const i2 = z(r2.body);
            i2 && (n2.body = i2);
            const l2 = C(r2.auth);
            l2 && (n2.auth = l2), t2.http = n2;
            const c2 = {};
            let u2 = false;
            const d2 = A(r2.vars);
            d2 && (c2.variables = d2, u2 = true);
            const p2 = B(r2);
            p2 && (c2.scripts = p2, u2 = true);
            const m2 = G(r2.assertions);
            m2 && (c2.assertions = m2, u2 = true);
            const g2 = r2.vars?.res, y2 = F(g2);
            y2 && (c2.actions = y2, u2 = true), u2 && (t2.runtime = c2);
            const k2 = e3.settings, b2 = {};
            b2.encodeUrl = true === k2?.encodeUrl || false !== k2?.encodeUrl;
            const v2 = k2?.timeout;
            f(v2) ? b2.timeout = v2 : b2.timeout = 0, b2.followRedirects = true === k2?.followRedirects || false !== k2?.followRedirects;
            const w2 = k2?.maxRedirects;
            if (f(w2) ? b2.maxRedirects = w2 : b2.maxRedirects = 5, t2.settings = b2, e3.examples?.length) {
              const r3 = e3.examples.map(((e4) => {
                const t3 = {};
                if (t3.name = e4?.name || "Untitled Example", q(e4.description) && (t3.description = e4.description), e4.request) {
                  t3.request = {}, t3.request.url = e4.request.url || "", t3.request.method = e4.request.method || "GET";
                  const r4 = j(e4.request.headers);
                  r4 && (t3.request.headers = r4);
                  const s3 = E(e4.request.params);
                  s3 && (t3.request.params = s3);
                  const n3 = z(e4.request.body);
                  void 0 !== n3 && (t3.request.body = n3);
                }
                if (e4.response) {
                  t3.response = {};
                  const r4 = Number(e4.response.status);
                  Number.isInteger(r4) && r4 > 0 && (t3.response.status = r4), q(e4.response.statusText) && (t3.response.statusText = e4.response.statusText);
                  const s3 = ((e5) => {
                    if (!e5?.length) return;
                    const t4 = e5.map(((e6) => ({ name: e6.name || "", value: e6.value || "" })));
                    return t4.length ? t4 : void 0;
                  })(e4.response.headers);
                  if (s3 && (t3.response.headers = s3), e4.response.body && e4.response.body.type && void 0 !== e4.response.body.content) {
                    const r5 = e4.response.body.content, s4 = "string" == typeof r5 ? r5 : JSON.stringify(r5, null, 2);
                    t3.response.body = { type: e4.response.body.type, data: s4 };
                  }
                }
                return t3;
              }));
              r3?.length && (t2.examples = r3);
            }
            return q(r2.docs) && (t2.docs = r2.docs), h(t2);
          } catch (e4) {
            throw console.error("Error stringifying HTTP request:", e4), e4;
          }
        })(e2);
      case "graphql-request":
        return ((e3) => {
          try {
            const t2 = {}, r2 = e3.request, s2 = { name: q(e3.name) ? e3.name : "Untitled Request", type: "graphql" };
            e3.seq && (s2.seq = e3.seq), e3.tags?.length && (s2.tags = e3.tags), t2.info = s2;
            const n2 = { method: q(r2.method) ? r2.method : "POST", url: q(r2.url) ? r2.url : "" }, a2 = j(r2.headers);
            a2 && (n2.headers = a2);
            const o2 = E(r2.params);
            if (o2 && (n2.params = o2), "graphql" === r2.body?.mode && r2.body.graphql) {
              const e4 = {};
              let t3 = false;
              q(r2.body.graphql.query) && (e4.query = r2.body.graphql.query, t3 = true), q(r2.body.graphql.variables) && (e4.variables = r2.body.graphql.variables, t3 = true), t3 && (n2.body = e4);
            }
            const i2 = C(r2.auth);
            i2 && (n2.auth = i2), t2.graphql = n2;
            const l2 = {};
            let c2 = false;
            const u2 = A(r2.vars);
            u2 && (l2.variables = u2, c2 = true);
            const d2 = B(r2);
            d2 && (l2.scripts = d2, c2 = true);
            const p2 = G(r2.assertions);
            p2 && (l2.assertions = p2, c2 = true);
            const m2 = r2.vars?.res, g2 = F(m2);
            g2 && (l2.actions = g2, c2 = true), c2 && (t2.runtime = l2);
            const y2 = e3.settings, k2 = {};
            k2.encodeUrl = true === y2?.encodeUrl || false !== y2?.encodeUrl;
            const b2 = y2?.timeout;
            f(b2) ? k2.timeout = b2 : k2.timeout = 0, k2.followRedirects = true === y2?.followRedirects || false !== y2?.followRedirects;
            const v2 = y2?.maxRedirects;
            return f(v2) ? k2.maxRedirects = v2 : k2.maxRedirects = 5, t2.settings = k2, q(r2.docs) && (t2.docs = r2.docs), h(t2);
          } catch (e4) {
            throw console.error("Error stringifying GraphQL request:", e4), e4;
          }
        })(e2);
      case "grpc-request":
        return ((e3) => {
          try {
            const t2 = {}, r2 = e3.request, s2 = { name: q(e3.name) ? e3.name : "Untitled Request", type: "grpc" };
            e3.seq && (s2.seq = e3.seq), e3.tags?.length && (s2.tags = e3.tags), t2.info = s2;
            const n2 = { url: q(r2.url) ? r2.url : "", method: q(r2.method) ? r2.method : "" };
            if (r2.methodType && (n2.methodType = r2.methodType), q(r2.protoPath) && (n2.protoFilePath = r2.protoPath), r2.headers?.length) {
              const e4 = r2.headers.map(((e5) => {
                const t3 = { name: e5.name || "", value: e5.value || "" };
                return e5?.description?.trim().length && (t3.description = e5.description), false === e5.enabled && (t3.disabled = true), t3;
              }));
              e4.length && (n2.metadata = e4);
            }
            if ("grpc" === r2.body?.mode && r2.body.grpc?.length) {
              const e4 = r2.body.grpc;
              if (e4.length) {
                const t3 = e4[0].content || "";
                t3.trim().length && (n2.message = t3);
              }
            }
            const a2 = C(r2.auth);
            a2 && (n2.auth = a2), t2.grpc = n2;
            const o2 = {};
            let i2 = false;
            const l2 = A(r2.vars);
            l2 && (o2.variables = l2, i2 = true);
            const c2 = B(r2);
            c2 && (o2.scripts = c2, i2 = true);
            const u2 = G(r2.assertions);
            return u2 && (o2.assertions = u2, i2 = true), i2 && (t2.runtime = o2), q(r2.docs) && (t2.docs = r2.docs), h(t2);
          } catch (e4) {
            throw console.error("Error stringifying gRPC request:", e4), e4;
          }
        })(e2);
      case "ws-request":
        return ((e3) => {
          try {
            const t2 = {}, r2 = e3.request, s2 = { name: q(e3.name) ? e3.name : "Untitled Request", type: "websocket" };
            e3.seq && (s2.seq = e3.seq), e3.tags?.length && (s2.tags = e3.tags), t2.info = s2;
            const n2 = { url: q(r2.url) ? r2.url : "" }, a2 = j(r2.headers);
            if (a2 && (n2.headers = a2), "ws" === r2.body?.mode && r2.body.ws?.length) {
              const e4 = r2.body.ws;
              if (e4.length) {
                const t3 = e4[0], r3 = { type: t3.type || "text", data: t3.content || "" };
                r3.data.trim().length && (n2.message = r3);
              }
            }
            const o2 = C(r2.auth);
            o2 && (n2.auth = o2), t2.websocket = n2;
            const i2 = {};
            let l2 = false;
            const c2 = A(r2.vars);
            c2 && (i2.variables = c2, l2 = true);
            const u2 = B(r2);
            u2 && (i2.scripts = u2, l2 = true), l2 && (t2.runtime = i2);
            const d2 = e3.settings;
            if (d2) {
              t2.settings = {};
              const e4 = Number(d2.timeout);
              t2.settings.timeout = isNaN(e4) ? 0 : e4;
              const r3 = Number(d2.keepAliveInterval);
              t2.settings.keepAliveInterval = isNaN(r3) ? 0 : r3;
            }
            return q(r2.docs) && (t2.docs = r2.docs), h(t2);
          } catch (e4) {
            throw console.error("Error stringifying WebSocket request:", e4), e4;
          }
        })(e2);
      case "js":
        return ((e3) => {
          try {
            const t2 = { type: "script" };
            return e3.fileContent?.trim().length && (t2.script = e3.fileContent), h(t2);
          } catch (e4) {
            throw console.error("Error stringifying script:", e4), e4;
          }
        })(e2);
      case "folder":
        throw new Error("Folder items should be handled separately using stringifyFolder");
      default:
        throw new Error(`Unsupported item type: ${e2.type}`);
    }
  } catch (e3) {
    throw console.error("Error stringifying item:", e3), e3;
  }
};
var V = "yml";
e.parentPort?.on("message", (async (t2) => {
  try {
    const { taskType: s2, data: n2 } = t2, { data: o2, format: i2 = V } = n2;
    let l2;
    if ("parse" === s2) l2 = "yml" === i2 ? L(o2) : u(o2);
    else {
      if ("stringify" !== s2) throw new Error(`Unknown task type: ${s2}`);
      l2 = "yml" === i2 ? D(o2) : ((e2) => {
        try {
          let t3 = a.get(e2, "type");
          switch (t3) {
            case "http-request":
            default:
              t3 = "http";
              break;
            case "graphql-request":
              t3 = "graphql";
              break;
            case "grpc-request":
              t3 = "grpc";
              break;
            case "ws-request":
              t3 = "ws";
          }
          const s3 = a.get(e2, "seq"), n3 = { meta: { name: a.get(e2, "name"), type: t3, seq: a.isNaN(s3) ? 1 : Number(s3), tags: a.get(e2, "tags", []) } };
          if ("http" === t3 || "graphql" === t3) n3.http = { method: String(a.get(e2, "request.method") ?? "").toLowerCase(), url: a.get(e2, "request.url"), auth: a.get(e2, "request.auth.mode", "none"), body: a.get(e2, "request.body.mode", "none") }, n3.params = a.get(e2, "request.params", []), n3.body = a.get(e2, "request.body", { mode: "json", json: "{}" });
          else if ("grpc" === t3) {
            n3.grpc = { url: a.get(e2, "request.url"), auth: a.get(e2, "request.auth.mode", "none"), body: a.get(e2, "request.body.mode", "grpc") };
            const t4 = a.get(e2, "request.method"), r2 = a.get(e2, "request.methodType"), s4 = a.get(e2, "request.protoPath");
            t4 && (n3.grpc.method = t4), r2 && (n3.grpc.methodType = r2), s4 && (n3.grpc.protoPath = s4), n3.body = a.get(e2, "request.body", { mode: "grpc", grpc: a.get(e2, "request.body.grpc", [{ name: "message 1", content: "{}" }]) });
          } else "ws" === t3 && (n3.ws = { url: a.get(e2, "request.url"), auth: a.get(e2, "request.auth.mode", "none"), body: a.get(e2, "request.body.mode", "ws") }, n3.body = a.get(e2, "request.body", { mode: "ws", ws: a.get(e2, "request.body.ws", [{ name: "message 1", content: "{}" }]) }));
          return "grpc" === t3 ? n3.metadata = a.get(e2, "request.headers", []) : n3.headers = a.get(e2, "request.headers", []), n3.auth = a.get(e2, "request.auth", {}), n3.script = a.get(e2, "request.script", {}), n3.vars = { req: a.get(e2, "request.vars.req", []), res: a.get(e2, "request.vars.res", []) }, n3.assertions = a.get(e2, "request.assertions", []), n3.tests = a.get(e2, "request.tests", ""), n3.settings = a.get(e2, "settings", {}), n3.docs = a.get(e2, "request.docs", ""), n3.examples = a.get(e2, "examples", []).map(((e3) => p(e3))), r.jsonToBruV2(n3);
        } catch (e3) {
          throw e3;
        }
      })(o2);
    }
    e.parentPort?.postMessage(l2);
  } catch (t3) {
    console.error("Worker error:", t3), e.parentPort?.postMessage({ error: t3?.message });
  }
}));
