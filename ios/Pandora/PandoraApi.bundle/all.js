/*! JSON v3.2.6 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function (window) {
  // Convenience aliases.
  var getClass = {}.toString, isProperty, forEach, undef;

  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // Detect native implementations.
  var nativeJSON = typeof JSON == "object" && JSON;

  // Set up the JSON 3 namespace, preferring the CommonJS `exports` object if
  // available.
  var JSON3 = {};// typeof exports == "object" && exports && !exports.nodeType && exports;
/*
  if (JSON3 && nativeJSON) {
    // Explicitly delegate to the native `stringify` and `parse`
    // implementations in CommonJS environments.
    JSON3.stringify = nativeJSON.stringify;
    JSON3.parse = nativeJSON.parse;
  } else {
    // Export for web browsers, JavaScript engines, and asynchronous module
    // loaders, using the global `JSON` object if available.
    JSON3 = window.JSON = nativeJSON || {};
  }
*/
  // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
  var isExtended = new Date(-3509827334573292);
  try {
    // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
    // results for certain dates in Opera >= 10.53.
    isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
      // Safari < 2.0.2 stores the internal millisecond time value correctly,
      // but clips the values returned by the date methods to the range of
      // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
      isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
  } catch (exception) {}

  // Internal: Determines whether the native `JSON.stringify` and `parse`
  // implementations are spec-compliant. Based on work by Ken Snyder.
  function has(name) {
    if (has[name] !== undef) {
      // Return cached feature test result.
      return has[name];
    }

    var isSupported;
    if (name == "bug-string-char-index") {
      // IE <= 7 doesn't support accessing string characters using square
      // bracket notation. IE 8 only supports this for primitives.
      isSupported = "a"[0] != "a";
    } else if (name == "json") {
      // Indicates whether both `JSON.stringify` and `JSON.parse` are
      // supported.
      isSupported = has("json-stringify") && has("json-parse");
    } else {
      var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
      // Test `JSON.stringify`.
      if (name == "json-stringify") {
        var stringify = JSON3.stringify, stringifySupported = typeof stringify == "function" && isExtended;
        if (stringifySupported) {
          // A test function object with a custom `toJSON` method.
          (value = function () {
            return 1;
          }).toJSON = value;
          try {
            stringifySupported =
              // Firefox 3.1b1 and b2 serialize string, number, and boolean
              // primitives as object literals.
              stringify(0) === "0" &&
              // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
              // literals.
              stringify(new Number()) === "0" &&
              stringify(new String()) == '""' &&
              // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
              // does not define a canonical JSON representation (this applies to
              // objects with `toJSON` properties as well, *unless* they are nested
              // within an object or array).
              stringify(getClass) === undef &&
              // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
              // FF 3.1b3 pass this test.
              stringify(undef) === undef &&
              // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
              // respectively, if the value is omitted entirely.
              stringify() === undef &&
              // FF 3.1b1, 2 throw an error if the given value is not a number,
              // string, array, object, Boolean, or `null` literal. This applies to
              // objects with custom `toJSON` methods as well, unless they are nested
              // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
              // methods entirely.
              stringify(value) === "1" &&
              stringify([value]) == "[1]" &&
              // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
              // `"[null]"`.
              stringify([undef]) == "[null]" &&
              // YUI 3.0.0b1 fails to serialize `null` literals.
              stringify(null) == "null" &&
              // FF 3.1b1, 2 halts serialization if an array contains a function:
              // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
              // elides non-JSON values from objects and arrays, unless they
              // define custom `toJSON` methods.
              stringify([undef, getClass, null]) == "[null,null,null]" &&
              // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
              // where character escape codes are expected (e.g., `\b` => `\u0008`).
              stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
              // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
              stringify(null, value) === "1" &&
              stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          } catch (exception) {
            stringifySupported = false;
          }
        }
        isSupported = stringifySupported;
      }
      // Test `JSON.parse`.
      if (name == "json-parse") {
        var parse = JSON3.parse;
        if (typeof parse == "function") {
          try {
            // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
            // Conforming implementations should also coerce the initial argument to
            // a string prior to parsing.
            if (parse("0") === 0 && !parse(false)) {
              // Simple parsing test.
              value = parse(serialized);
              var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
              if (parseSupported) {
                try {
                  // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                  parseSupported = !parse('"\t"');
                } catch (exception) {}
                if (parseSupported) {
                  try {
                    // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                    // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                    // certain octal literals.
                    parseSupported = parse("01") !== 1;
                  } catch (exception) {}
                }
                if (parseSupported) {
                  try {
                    // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                    // points. These environments, along with FF 3.1b1 and 2,
                    // also allow trailing commas in JSON objects and arrays.
                    parseSupported = parse("1.") !== 1;
                  } catch (exception) {}
                }
              }
            }
          } catch (exception) {
            parseSupported = false;
          }
        }
        isSupported = parseSupported;
      }
    }
    return has[name] = !!isSupported;
  }

  if (!has("json")) {
    // Common `[[Class]]` name aliases.
    var functionClass = "[object Function]";
    var dateClass = "[object Date]";
    var numberClass = "[object Number]";
    var stringClass = "[object String]";
    var arrayClass = "[object Array]";
    var booleanClass = "[object Boolean]";

    // Detect incomplete support for accessing string characters by index.
    var charIndexBuggy = has("bug-string-char-index");

    // Define additional utility methods if the `Date` methods are buggy.
    if (!isExtended) {
      var floor = Math.floor;
      // A mapping between the months of the year and the number of days between
      // January 1st and the first of the respective month.
      var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      // Internal: Calculates the number of days between the Unix epoch and the
      // first day of the given month.
      var getDay = function (year, month) {
        return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
      };
    }

    // Internal: Determines if a property is a direct property of the given
    // object. Delegates to the native `Object#hasOwnProperty` method.
    if (!(isProperty = {}.hasOwnProperty)) {
      isProperty = function (property) {
        var members = {}, constructor;
        if ((members.__proto__ = null, members.__proto__ = {
          // The *proto* property cannot be set multiple times in recent
          // versions of Firefox and SeaMonkey.
          "toString": 1
        }, members).toString != getClass) {
          // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
          // supports the mutable *proto* property.
          isProperty = function (property) {
            // Capture and break the object's prototype chain (see section 8.6.2
            // of the ES 5.1 spec). The parenthesized expression prevents an
            // unsafe transformation by the Closure Compiler.
            var original = this.__proto__, result = property in (this.__proto__ = null, this);
            // Restore the original prototype chain.
            this.__proto__ = original;
            return result;
          };
        } else {
          // Capture a reference to the top-level `Object` constructor.
          constructor = members.constructor;
          // Use the `constructor` property to simulate `Object#hasOwnProperty` in
          // other environments.
          isProperty = function (property) {
            var parent = (this.constructor || constructor).prototype;
            return property in this && !(property in parent && this[property] === parent[property]);
          };
        }
        members = null;
        return isProperty.call(this, property);
      };
    }

    // Internal: A set of primitive types used by `isHostType`.
    var PrimitiveTypes = {
      'boolean': 1,
      'number': 1,
      'string': 1,
      'undefined': 1
    };

    // Internal: Determines if the given object `property` value is a
    // non-primitive.
    var isHostType = function (object, property) {
      var type = typeof object[property];
      return type == 'object' ? !!object[property] : !PrimitiveTypes[type];
    };

    // Internal: Normalizes the `for...in` iteration algorithm across
    // environments. Each enumerated key is yielded to a `callback` function.
    forEach = function (object, callback) {
      var size = 0, Properties, members, property;

      // Tests for bugs in the current environment's `for...in` algorithm. The
      // `valueOf` property inherits the non-enumerable flag from
      // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
      (Properties = function () {
        this.valueOf = 0;
      }).prototype.valueOf = 0;

      // Iterate over a new instance of the `Properties` class.
      members = new Properties();
      for (property in members) {
        // Ignore all properties inherited from `Object.prototype`.
        if (isProperty.call(members, property)) {
          size++;
        }
      }
      Properties = members = null;

      // Normalize the iteration algorithm.
      if (!size) {
        // A list of non-enumerable properties inherited from `Object.prototype`.
        members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
        // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
        // properties.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, length;
          var hasProperty = !isFunction && typeof object.constructor != 'function' && isHostType(object, 'hasOwnProperty') ? object.hasOwnProperty : isProperty;
          for (property in object) {
            // Gecko <= 1.0 enumerates the `prototype` property of functions under
            // certain conditions; IE does not.
            if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
              callback(property);
            }
          }
          // Manually invoke the callback for each non-enumerable property.
          for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
        };
      } else if (size == 2) {
        // Safari <= 2.0.4 enumerates shadowed properties twice.
        forEach = function (object, callback) {
          // Create a set of iterated properties.
          var members = {}, isFunction = getClass.call(object) == functionClass, property;
          for (property in object) {
            // Store each property name to prevent double enumeration. The
            // `prototype` property of functions is not enumerated due to cross-
            // environment inconsistencies.
            if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
              callback(property);
            }
          }
        };
      } else {
        // No bugs detected; use the standard `for...in` algorithm.
        forEach = function (object, callback) {
          var isFunction = getClass.call(object) == functionClass, property, isConstructor;
          for (property in object) {
            if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
              callback(property);
            }
          }
          // Manually invoke the callback for the `constructor` property due to
          // cross-environment inconsistencies.
          if (isConstructor || isProperty.call(object, (property = "constructor"))) {
            callback(property);
          }
        };
      }
      return forEach(object, callback);
    };

    // Public: Serializes a JavaScript `value` as a JSON string. The optional
    // `filter` argument may specify either a function that alters how object and
    // array members are serialized, or an array of strings and numbers that
    // indicates which properties should be serialized. The optional `width`
    // argument may be either a string or number that specifies the indentation
    // level of the output.
    if (!has("json-stringify")) {
      // Internal: A map of control characters and their escaped equivalents.
      var Escapes = {
        92: "\\\\",
        34: '\\"',
        8: "\\b",
        12: "\\f",
        10: "\\n",
        13: "\\r",
        9: "\\t"
      };

      // Internal: Converts `value` into a zero-padded string such that its
      // length is at least equal to `width`. The `width` must be <= 6.
      var leadingZeroes = "000000";
      var toPaddedString = function (width, value) {
        // The `|| 0` expression is necessary to work around a bug in
        // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
        return (leadingZeroes + (value || 0)).slice(-width);
      };

      // Internal: Double-quotes a string `value`, replacing all ASCII control
      // characters (characters with code unit values between 0 and 31) with
      // their escaped equivalents. This is an implementation of the
      // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
      var unicodePrefix = "\\u00";
      var quote = function (value) {
        var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
        var symbols = useCharIndex && (charIndexBuggy ? value.split(""): value);
        for (; index < length; index++) {
          var charCode = value.charCodeAt(index);
          // If the character is a control character, append its Unicode or
          // shorthand escape sequence; otherwise, append the character as-is.
          switch (charCode) {
            case 8: case 9: case 10: case 12: case 13: case 34: case 92:
              result += Escapes[charCode];
              break;
            default:
              if (charCode < 32) {
                result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                break;
              }
              result += useCharIndex ? symbols[index] : value.charAt(index);
          }
        }
        return result + '"';
      };

      // Internal: Recursively serializes an object. Implements the
      // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
      var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
        var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
        try {
          // Necessary for host object support.
          value = object[property];
        } catch (exception) {}
        if (typeof value == "object" && value) {
          className = getClass.call(value);
          if (className == dateClass && !isProperty.call(value, "toJSON")) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              if (getDay) {
                // Manually compute the year, month, date, hours, minutes,
                // seconds, and milliseconds if the `getUTC*` methods are
                // buggy. Adapted from @Yaffle's `date-shim` project.
                date = floor(value / 864e5);
                for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                date = 1 + date - getDay(year, month);
                // The `time` value specifies the time within the day (see ES
                // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                // to compute `A modulo B`, as the `%` operator does not
                // correspond to the `modulo` operation for negative numbers.
                time = (value % 864e5 + 864e5) % 864e5;
                // The hours, minutes, seconds, and milliseconds are obtained by
                // decomposing the time within the day. See section 15.9.1.10.
                hours = floor(time / 36e5) % 24;
                minutes = floor(time / 6e4) % 60;
                seconds = floor(time / 1e3) % 60;
                milliseconds = time % 1e3;
              } else {
                year = value.getUTCFullYear();
                month = value.getUTCMonth();
                date = value.getUTCDate();
                hours = value.getUTCHours();
                minutes = value.getUTCMinutes();
                seconds = value.getUTCSeconds();
                milliseconds = value.getUTCMilliseconds();
              }
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                // Months, dates, hours, minutes, and seconds should have two
                // digits; milliseconds should have three.
                "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                // Milliseconds are optional in ES 5.0, but required in 5.1.
                "." + toPaddedString(3, milliseconds) + "Z";
            } else {
              value = null;
            }
          } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
            // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
            // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
            // ignores all `toJSON` methods on these objects unless they are
            // defined directly on an instance.
            value = value.toJSON(property);
          }
        }
        if (callback) {
          // If a replacement function was provided, call it to obtain the value
          // for serialization.
          value = callback.call(object, property, value);
        }
        if (value === null) {
          return "null";
        }
        className = getClass.call(value);
        if (className == booleanClass) {
          // Booleans are represented literally.
          return "" + value;
        } else if (className == numberClass) {
          // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
          // `"null"`.
          return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
        } else if (className == stringClass) {
          // Strings are double-quoted and escaped.
          return quote("" + value);
        }
        // Recursively serialize objects and arrays.
        if (typeof value == "object") {
          // Check for cyclic structures. This is a linear search; performance
          // is inversely proportional to the number of unique nested objects.
          for (length = stack.length; length--;) {
            if (stack[length] === value) {
              // Cyclic structures cannot be serialized by `JSON.stringify`.
              throw TypeError();
            }
          }
          // Add the object to the stack of traversed objects.
          stack.push(value);
          results = [];
          // Save the current indentation level and indent one additional level.
          prefix = indentation;
          indentation += whitespace;
          if (className == arrayClass) {
            // Recursively serialize array elements.
            for (index = 0, length = value.length; index < length; index++) {
              element = serialize(index, value, callback, properties, whitespace, indentation, stack);
              results.push(element === undef ? "null" : element);
            }
            result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
          } else {
            // Recursively serialize object members. Members are selected from
            // either a user-specified list of property names, or the object
            // itself.
            forEach(properties || value, function (property) {
              var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
              if (element !== undef) {
                // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                // is not the empty string, let `member` {quote(property) + ":"}
                // be the concatenation of `member` and the `space` character."
                // The "`space` character" refers to the literal space
                // character, not the `space` {width} argument provided to
                // `JSON.stringify`.
                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
              }
            });
            result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
          }
          // Remove the object from the traversed object stack.
          stack.pop();
          return result;
        }
      };

      // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
      JSON3.stringify = function (source, filter, width) {
        var whitespace, callback, properties, className;
        if (typeof filter == "function" || typeof filter == "object" && filter) {
          if ((className = getClass.call(filter)) == functionClass) {
            callback = filter;
          } else if (className == arrayClass) {
            // Convert the property names array into a makeshift set.
            properties = {};
            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
          }
        }
        if (width) {
          if ((className = getClass.call(width)) == numberClass) {
            // Convert the `width` to an integer and create a string containing
            // `width` number of space characters.
            if ((width -= width % 1) > 0) {
              for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
            }
          } else if (className == stringClass) {
            whitespace = width.length <= 10 ? width : width.slice(0, 10);
          }
        }
        // Opera <= 7.54u2 discards the values associated with empty string keys
        // (`""`) only if they are used directly within an object member list
        // (e.g., `!("" in { "": 1})`).
        return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
      };
    }
/*
    // Public: Parses a JSON source string.
    if (!has("json-parse")) {
      var fromCharCode = String.fromCharCode;

      // Internal: A map of escaped control characters and their unescaped
      // equivalents.
      var Unescapes = {
        92: "\\",
        34: '"',
        47: "/",
        98: "\b",
        116: "\t",
        110: "\n",
        102: "\f",
        114: "\r"
      };

      // Internal: Stores the parser state.
      var Index, Source;

      // Internal: Resets the parser state and throws a `SyntaxError`.
      var abort = function() {
        Index = Source = null;
        throw SyntaxError();
      };

      // Internal: Returns the next token, or `"$"` if the parser has reached
      // the end of the source string. A token may be a string, number, `null`
      // literal, or Boolean literal.
      var lex = function () {
        var source = Source, length = source.length, value, begin, position, isSigned, charCode;
        while (Index < length) {
          charCode = source.charCodeAt(Index);
          switch (charCode) {
            case 9: case 10: case 13: case 32:
              // Skip whitespace tokens, including tabs, carriage returns, line
              // feeds, and space characters.
              Index++;
              break;
            case 123: case 125: case 91: case 93: case 58: case 44:
              // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
              // the current position.
              value = charIndexBuggy ? source.charAt(Index) : source[Index];
              Index++;
              return value;
            case 34:
              // `"` delimits a JSON string; advance to the next character and
              // begin parsing the string. String tokens are prefixed with the
              // sentinel `@` character to distinguish them from punctuators and
              // end-of-string tokens.
              for (value = "@", Index++; Index < length;) {
                charCode = source.charCodeAt(Index);
                if (charCode < 32) {
                  // Unescaped ASCII control characters (those with a code unit
                  // less than the space character) are not permitted.
                  abort();
                } else if (charCode == 92) {
                  // A reverse solidus (`\`) marks the beginning of an escaped
                  // control character (including `"`, `\`, and `/`) or Unicode
                  // escape sequence.
                  charCode = source.charCodeAt(++Index);
                  switch (charCode) {
                    case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                      // Revive escaped control characters.
                      value += Unescapes[charCode];
                      Index++;
                      break;
                    case 117:
                      // `\u` marks the beginning of a Unicode escape sequence.
                      // Advance to the first character and validate the
                      // four-digit code point.
                      begin = ++Index;
                      for (position = Index + 4; Index < position; Index++) {
                        charCode = source.charCodeAt(Index);
                        // A valid sequence comprises four hexdigits (case-
                        // insensitive) that form a single hexadecimal value.
                        if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                          // Invalid Unicode escape sequence.
                          abort();
                        }
                      }
                      // Revive the escaped character.
                      value += fromCharCode("0x" + source.slice(begin, Index));
                      break;
                    default:
                      // Invalid escape sequence.
                      abort();
                  }
                } else {
                  if (charCode == 34) {
                    // An unescaped double-quote character marks the end of the
                    // string.
                    break;
                  }
                  charCode = source.charCodeAt(Index);
                  begin = Index;
                  // Optimize for the common case where a string is valid.
                  while (charCode >= 32 && charCode != 92 && charCode != 34) {
                    charCode = source.charCodeAt(++Index);
                  }
                  // Append the string as-is.
                  value += source.slice(begin, Index);
                }
              }
              if (source.charCodeAt(Index) == 34) {
                // Advance to the next character and return the revived string.
                Index++;
                return value;
              }
              // Unterminated string.
              abort();
            default:
              // Parse numbers and literals.
              begin = Index;
              // Advance past the negative sign, if one is specified.
              if (charCode == 45) {
                isSigned = true;
                charCode = source.charCodeAt(++Index);
              }
              // Parse an integer or floating-point value.
              if (charCode >= 48 && charCode <= 57) {
                // Leading zeroes are interpreted as octal literals.
                if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                  // Illegal octal literal.
                  abort();
                }
                isSigned = false;
                // Parse the integer component.
                for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                // Floats cannot contain a leading decimal point; however, this
                // case is already accounted for by the parser.
                if (source.charCodeAt(Index) == 46) {
                  position = ++Index;
                  // Parse the decimal component.
                  for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal trailing decimal.
                    abort();
                  }
                  Index = position;
                }
                // Parse exponents. The `e` denoting the exponent is
                // case-insensitive.
                charCode = source.charCodeAt(Index);
                if (charCode == 101 || charCode == 69) {
                  charCode = source.charCodeAt(++Index);
                  // Skip past the sign following the exponent, if one is
                  // specified.
                  if (charCode == 43 || charCode == 45) {
                    Index++;
                  }
                  // Parse the exponential component.
                  for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                  if (position == Index) {
                    // Illegal empty exponent.
                    abort();
                  }
                  Index = position;
                }
                // Coerce the parsed value to a JavaScript number.
                return +source.slice(begin, Index);
              }
              // A negative sign may only precede numbers.
              if (isSigned) {
                abort();
              }
              // `true`, `false`, and `null` literals.
              if (source.slice(Index, Index + 4) == "true") {
                Index += 4;
                return true;
              } else if (source.slice(Index, Index + 5) == "false") {
                Index += 5;
                return false;
              } else if (source.slice(Index, Index + 4) == "null") {
                Index += 4;
                return null;
              }
              // Unrecognized token.
              abort();
          }
        }
        // Return the sentinel `$` character if the parser has reached the end
        // of the source string.
        return "$";
      };

      // Internal: Parses a JSON `value` token.
      var get = function (value) {
        var results, hasMembers;
        if (value == "$") {
          // Unexpected end of input.
          abort();
        }
        if (typeof value == "string") {
          if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
            // Remove the sentinel `@` character.
            return value.slice(1);
          }
          // Parse object and array literals.
          if (value == "[") {
            // Parses a JSON array, returning a new JavaScript array.
            results = [];
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing square bracket marks the end of the array literal.
              if (value == "]") {
                break;
              }
              // If the array literal contains elements, the current token
              // should be a comma separating the previous element from the
              // next.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "]") {
                    // Unexpected trailing `,` in array literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each array element.
                  abort();
                }
              }
              // Elisions and leading commas are not permitted.
              if (value == ",") {
                abort();
              }
              results.push(get(value));
            }
            return results;
          } else if (value == "{") {
            // Parses a JSON object, returning a new JavaScript object.
            results = {};
            for (;; hasMembers || (hasMembers = true)) {
              value = lex();
              // A closing curly brace marks the end of the object literal.
              if (value == "}") {
                break;
              }
              // If the object literal contains members, the current token
              // should be a comma separator.
              if (hasMembers) {
                if (value == ",") {
                  value = lex();
                  if (value == "}") {
                    // Unexpected trailing `,` in object literal.
                    abort();
                  }
                } else {
                  // A `,` must separate each object member.
                  abort();
                }
              }
              // Leading commas are not permitted, object property names must be
              // double-quoted strings, and a `:` must separate each property
              // name and value.
              if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                abort();
              }
              results[value.slice(1)] = get(lex());
            }
            return results;
          }
          // Unexpected token encountered.
          abort();
        }
        return value;
      };

      // Internal: Updates a traversed object member.
      var update = function(source, property, callback) {
        var element = walk(source, property, callback);
        if (element === undef) {
          delete source[property];
        } else {
          source[property] = element;
        }
      };

      // Internal: Recursively traverses a parsed JSON object, invoking the
      // `callback` function for each value. This is an implementation of the
      // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
      var walk = function (source, property, callback) {
        var value = source[property], length;
        if (typeof value == "object" && value) {
          // `forEach` can't be used to traverse an array in Opera <= 8.54
          // because its `Object#hasOwnProperty` implementation returns `false`
          // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
          if (getClass.call(value) == arrayClass) {
            for (length = value.length; length--;) {
              update(value, length, callback);
            }
          } else {
            forEach(value, function (property) {
              update(value, property, callback);
            });
          }
        }
        return callback.call(source, property, value);
      };

      // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
      JSON3.parse = function (source, callback) {
        var result, value;
        Index = 0;
        Source = "" + source;
        result = get(lex());
        // If a JSON string contains multiple tokens, it is invalid.
        if (lex() != "$") {
          abort();
        }
        // Reset the parser state.
        Index = Source = null;
        return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
      };
    }*/
  }

  window.JSON3 = JSON3;
  // Export for asynchronous module loaders.
  /*
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
 */
}(this));;if((!(window.plus)) || (window.plus && (!window.plus.isReady))) window.plus = navigator.plus = {isReady:true};

(function(plus){
    var tools = plus.tools = {
		__UUID__:	0,
		UNKNOWN:	-1,
		IOS:		0,
		ANDROID:	1,
		platform:	-1,
		debug : false,
		UUID: function (obj) {
			return obj + ( this.__UUID__++ ) + new Date().valueOf();
		},
		extend: function(destination, source) {
			for (var property in source) { 
				destination[property] = source[property]; 
			}
		},
		typeName: function(val) {
			return Object.prototype.toString.call(val).slice(8, -1);
		},
		isDate: function(d) {
			return tools.typeName(d) == 'Date';
		},
		isArray: function(a) {
			return tools.typeName(a) == 'Array';
		},
		isDebug :function (){
			return plus.tools.debug;
		},
		stringify : function(args) {
			if ( window.JSON3 ){
				return window.JSON3.stringify(args);
			}
			return JSON.stringify(args);
		},
		isNumber: function(a) {
			return (typeof a === 'number') || (a instanceof Number);
		},
		execJSfile : function(path) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = path;
			function insertScript(s){
				var h=document.head,b=document.body;
				if(h){
					h.insertBefore(s,h.firstChild);
				}else if(b){
					b.insertBefore(s,b.firstChild);
				}else{
					setTimeout(function(){
						insertScript(s);
					},100);
				}
			};
			insertScript(script);
		},
		copyObjProp2Obj : function ( wb, param, excludeProperties ) {
	        var exclude = excludeProperties instanceof Array ?true:false;
	        for ( var p in param ) {
	            var copy = true;
	            if ( exclude ) {
	                for (var i = 0; i < excludeProperties.length; i++) {
	                    if ( p == excludeProperties[i] ) {
	                        copy = false;
	                        break;
	                    }
	                }
	            }
	            if ( copy ) {
	                wb[p] = param[p];
	            } else {
	                copy = true;
	            }
	        }
    	},
		clone: function(obj) {
			if(!obj || typeof obj == 'function' || tools.isDate(obj) || typeof obj != 'object') {
				return obj;
			}

			var retVal, i;

			if(tools.isArray(obj)){
				retVal = [];
				for(i = 0; i < obj.length; ++i){
					retVal.push(tools.clone(obj[i]));
				}
				return retVal;
			}
			retVal = {};
			for(i in obj){
				if(!(i in retVal) || retVal[i] != obj[i]) {
					retVal[i] = tools.clone(obj[i]);
				}
			}
			return retVal;
		}
	};
	tools.debug = (window.__nativeparamer__ && window.__nativeparamer__.debug)? true:false;
	tools.platform = window._____platform_____;

})(window.plus);

(function(plus){
    function createExecIframe() {
		function insertScript(s){
			var b=document.body;
			if(b){
				if ( !s.parentNode ) {
					b.appendChild(s);
				}
			}else{
				setTimeout(function(){
					insertScript(s);
				},100);
			}
		};
	
        var iframe = document.createElement("iframe");
        iframe.id = "exebridge";
        iframe.style.display = 'none';
       // document.body.appendChild(iframe);
        insertScript(iframe);
        return iframe;
    }
var T = plus.tools,
	B = plus.bridge = {
		NO_RESULT:					0,
		OK:							1,
		CLASS_NOT_FOUND_EXCEPTION:	2,
		ILLEGAL_ACCESS_EXCEPTION:	3,
		INSTANTIATION_EXCEPTION:	4,
		MALFORMED_URL_EXCEPTION:	5,
		IO_EXCEPTION:				6,
		INVALID_ACTION:				7,
		JSON_EXCEPTION:				8,
		ERROR:						9,
		callbacks:{},
		commandQueue: [],
		commandQueueFlushing:false,
		synExecXhr: new XMLHttpRequest(),
		execIframe: null,
		nativecomm: function () {
			var json = '[' + B.commandQueue.join(',') + ']';
			B.commandQueue.length = 0;
			return json
		},
		execImg:null,
		createImg : function(){
			function insertScript(s){
				var b=document.body;
				console.log('11111111111111111110'+b);
				if(b){
					b.appendChild(s);
				}else{
					setTimeout(function(){
						insertScript(s);
					},100);
				}
			};
			
			var img = document.createElement("img");
	        img.id = "exebridge";
	        img.style.display = 'none';
	        insertScript(img);
	        return img;
		},
		exec:function ( service, action, args, callbackid ) {
			if ( T.IOS == T.platform ) {
				B.commandQueue.push(T.stringify([window.__HtMl_Id__, service, action, callbackid || null, args]));
				if( B.execIframe && !B.execIframe.parentNode ) {
					document.body.appendChild(B.execIframe);
				}
				if ( B.commandQueue.length == 1 && !B.commandQueueFlushing ) {
					B.execIframe = B.execIframe || createExecIframe();
					B.execIframe.src = "plus://command"
				}
			} else if ( T.ANDROID == T.platform ) {
				/*if(B.execImg && !B.execImg.parentNode){
					document.body.appendChild(B.execImg);
				}else{
					B.execImg = B.execImg || B.createImg();
					B.execImg.src = 'pdr:'+T.stringify([service,action,true,T.stringify(args)]);
				}*/
				
				window.prompt(T.stringify(args),'pdr:'+T.stringify([service,action,true]))
			}
		},
		execSync: function ( service, action, args, fn) {
			if ( T.IOS == T.platform ) {
				var json = T.stringify([[window.__HtMl_Id__, service, action, null, args]]),
					sync = B.synExecXhr;
				sync.open( 'post', "http://localhost:13131/cmds", false );
				sync.setRequestHeader( "Content-Type", 'multipart/form-data' );
				//sync.setRequestHeader( "Content-Length", json.length );
				sync.send( json );
				if ( fn ) {
					return fn(sync.responseText);
				}
				return window.eval( sync.responseText );
			} else if ( T.ANDROID == T.platform ) {
				var ret = window.prompt(T.stringify(args),'pdr:'+T.stringify([service,action,false]));
				if ( fn ) {
					return fn(ret);
				}
				return eval(ret);
			}
		},
		callbackFromNative: function ( callbackId, playload ) {
			var fun = B.callbacks[callbackId];
			if ( fun ) {
				if ( playload.status == B.OK && fun.success) {
					if ( fun.success ) fun.success( playload.message )
				} else {
					if ( fun.fail )fun.fail( playload.message )
				}
				if ( !playload.keepCallback ) {
					delete B.callbacks[callbackId]
				}
			}
		},
		callbackId: function ( successCallback, failCallback ) {
			var callbackId = T.UUID('plus');
			B.callbacks[callbackId] = { success:successCallback, fail:failCallback };
			return callbackId;
		}
	}

})(window.plus);
plus.obj = plus.obj || {};
plus.obj.Callback = (function(){
        function Callback(){
			var __me__ = this;
            __me__.__callbacks__ = {};
            
            __me__.__callback_id__ = plus.bridge.callbackId(function(args){
                var _evt = args.evt,
					_args = args.args,
					_arr = __me__.__callbacks__[_evt];
                if(_arr){
					var len = _arr.length,
						i = 0;
                    for(; i < len; i++){
                        __me__.onCallback(_arr[i],_evt,_args)
                    }
                }
            })
        }
        function onCallback(fun,evt,args){
           //抛异常
           throw "Please override the function of 'Callback.onCallback'"
        }
        
        
        Callback.prototype.addEventListener = function(evtType,fun,capture){
        	var notice = false,
				that = this;
	        if(fun){
	            if(!that.__callbacks__[evtType]){
	            	that.__callbacks__[evtType]=[];
	            	notice = true
	            }
	            that.__callbacks__[evtType].push(fun)
	        }
	        return notice
        }
        
        Callback.prototype.removeEventListener = function(evtType,fun){
        	var notice = false,
				that = this;
            if(that.__callbacks__[evtType]){
                that.__callbacks__[evtType].pop(fun);
                notice = (that.__callbacks__[evtType].length === 0);
                if(notice) that.__callbacks__[evtType] = null
            }
            return notice
        }       
        return Callback;
   })();;(function(plus, W){
    var B = plus.bridge,
		T = plus.tools,
		service = "Accelerometer",
		running = false,// Is teh accel sensor running?
		timers = {},// Keeps reference to watchAcceleration calls.
		listeners = [],// Array of listeners; used to keep track of when we should call start and stop.
		accel = null,// Last returned acceleration object from native
		Acceleration = function(x, y, z) {
			this.xAxis = x;
			this.yAxis = y;
			this.zAxis = z;
		};

    // Tells native to start.
    function start(frequency) {
        var callbackid = B.callbackId(function(a) {
            var tempListeners = listeners.slice(0);
            accel = new Acceleration(a.x, a.y, a.z);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].win(accel);
            }
        }, function(e) {
            var tempListeners = listeners.slice(0);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].fail(e);
            }
        });
        B.exec(service, "start", [callbackid,frequency]);
        running = true
    }

    // Tells native to stop.
    function stop() {
        B.exec(service, "stop", []);
        running = false;
    }

    // Adds a callback pair to the listeners array
    function createCallbackPair(win, fail) {
        return {win:win, fail:fail};
    }

    // Removes a win/fail listener pair from the listeners array
    function removeListeners(l) {
        var idx = listeners.indexOf(l);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) {
                stop();
            }
        }
    }

    var accelerometer = {
        /**
         * Asynchronously acquires the current acceleration.
         *
         * @param {Function} successCallback    The function to call when the acceleration data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
         * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
         */
        getCurrentAcceleration: function(successCallback, errorCallback, options) {
            var p = createCallbackPair(function(a) {
					removeListeners(p);
					successCallback(a);
				}, function(e) {
					removeListeners(p);
					errorCallback && errorCallback(e);
				});
            listeners.push(p);

            if (!running) {
                start(-1);
            }
        },

        /**
        * Asynchronously acquires the acceleration repeatedly at a given interval.
        *
         * @param {Function} successCallback    The function to call each time the acceleration data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the acceleration data. (OPTIONAL)
         * @param {AccelerationOptions} options The options for getting the accelerometer data such as timeout. (OPTIONAL)
         * @return String                       The watch id that must be passed to #clearWatch to stop watching.
         */
        watchAcceleration: function(successCallback, errorCallback, options) {
            // Default interval (10 sec)
            var frequency = (options && options.frequency && typeof options.frequency == 'number') ? options.frequency : 500;

            // Keep reference to watch id, and report accel readings as often as defined in frequency
            var id = T.UUID('watch');

            var p = createCallbackPair(function(){}, function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            });
            listeners.push(p);

            timers[id] = {
                timer:W.setInterval(function() {
                    if (accel) {
                        successCallback(accel);
                    }
                }, frequency),
                listeners:p
            };

            if (running) {
                // If we're already running then immediately invoke the success callback
                // but only if we have retrieved a value, sample code does not check for null ...
                if (accel) {
                    successCallback(accel);
                }
            } else {
                start(frequency);
            }

            return id;
        },

        /*
        * Clears the specified accelerometer watch.
        *
        * @param {String} id       The id of the watch returned from #watchAcceleration.
        */
        clearWatch: function(id) {
            // Stop javascript timer & remove from timer list
            if (id && timers[id]) {
                W.clearInterval(timers[id].timer);
                removeListeners(timers[id].listeners);
                delete timers[id];
            }
        }
    };

    plus.accelerometer = accelerometer;
})(this.plus, this);;(function(plus)
{
    var B = plus.bridge,
		T = plus.tools,
		_Audio__ = "Audio",
		_RecExecMethod = "RecorderExecMethod",
		_AudioExecMethod="AudioExecMethod",
		_AudioSyncExecMethod = "AudioSyncExecMethod";
    plus.audio = {
        getRecorder:function()
        {
            var AudioRecorder =
            {
                _Audio_UUID__:T.UUID('Record'),
                supportedFormats:['amr','3gp'],
                supportedSamplerates:[8000,16000,44100],
                record:function(RecordOption, successCallback, failCallback)
                {
                    var callBackID = B.callbackId(successCallback, failCallback);
                    B.exec(_Audio__, _RecExecMethod, ['record',[this._Audio_UUID__, callBackID , RecordOption]]);
                }, 
                stop:function()
                {
                    B.exec(_Audio__, _RecExecMethod, ['stop',[this._Audio_UUID__]]);
                },
                pause:function()
                {
                    B.exec(_Audio__, _RecExecMethod, ['pause',[this._Audio_UUID__]]);
                } 
            };
            if ( T.IOS == T.platform ) {
                AudioRecorder.supportedFormats = ['wav', 'aac', 'amr'];    
            };
            return AudioRecorder;
        }, 
        createPlayer:function(filePath)
        {
            var AudioPlayer = 
            {
                _Player_FilePath : filePath,
                _Audio_Player_UUID_:T.UUID('Player'),
                                            
                play:function(  successCallBack, failCallback )
                {
                    var CallBackID = B.callbackId(successCallBack, failCallback);
                    B.exec(_Audio__, _AudioExecMethod, ['play', [this._Audio_Player_UUID_, CallBackID]]);
                },
                pause:function()
                {
                    B.exec(_Audio__, _AudioExecMethod, ['pause', [this._Audio_Player_UUID_]]);
                },
                resume:function()
                {
                    B.exec(_Audio__, _AudioExecMethod, ['resume', [this._Audio_Player_UUID_]]);
                },
                stop:function()
                {
                    B.exec(_Audio__, _AudioExecMethod, ['stop', [this._Audio_Player_UUID_]]);
                },
                seekTo:function(position)
                {
                    B.exec(_Audio__, _AudioExecMethod, ['seekTo', [this._Audio_Player_UUID_, position]]);
                },
                getDuration:function()
                {
                    return B.execSync(_Audio__, _AudioSyncExecMethod, ['getDuration', [this._Audio_Player_UUID_]]);
                },
                getPosition:function()
                {
                    return B.execSync(_Audio__, _AudioSyncExecMethod, ['getPosition', [this._Audio_Player_UUID_]]);
                },
                setRoute :function(aRoute){
                    B.exec(_Audio__, _AudioExecMethod, ['setRoute', [this._Audio_Player_UUID_, aRoute]]);
                }
               //
            };
            B.execSync(_Audio__, _AudioSyncExecMethod, ['CreatePlayer', [AudioPlayer._Audio_Player_UUID_, AudioPlayer._Player_FilePath]]);
            return AudioPlayer;
        },
        ROUTE_SPEAKER : 0,
        ROUTE_EARPIECE : 1
    };
})(window.plus);;(function(plus){
    var _BARCODE = 'barcode',
		B = window.plus.bridge;

    function Barcode(id, filters ){
		var me = this;
        me.onmarked = null;
        me.onerror = null;
        
        var callbackId = B.callbackId( function(args){
				if( typeof me.onmarked === 'function' ){
					me.onmarked(args.type, args.message,args.file);
				}
			}, function(code){
				if ( typeof me.onerror === 'function' ) {
					me.onerror(code);
				}
			}),
			div = document.getElementById(id);
        div.addEventListener("resize", function(){
            var args = [div.offsetLeft, div.offsetTop,div.offsetWidth,div.offsetHeight];
            B.exec( _BARCODE, "resize", [args]);
        }, false);
        var args = [div.offsetLeft, div.offsetTop, div.offsetWidth, div.offsetHeight];
        B.exec( _BARCODE, "Barcode", [callbackId,args, filters ] );
    };
	var proto = Barcode.prototype;
    proto.start = function(options) {
        B.exec( _BARCODE, "start", [options] );
    };

    proto.setFlash = function(open) {
        B.exec( _BARCODE, "setFlash", [open] );
    };

    proto.cancel = function() {
        B.exec( _BARCODE, "cancel", [] );
    };

    var barcode = {
		Barcode : Barcode,
		scan : function (path, successCallback, errorCallback, filters ) {
				var success = typeof successCallback !== 'function' ? null : function(args) {
						successCallback(args.type, args.message, args.file);
					},
					fail = typeof errorCallback !== 'function' ? null : function(code) {
						errorCallback(code);
					},
					callbackID = B.callbackId(success, fail);
				B.exec(_BARCODE, "scan", [callbackID, path, filters ]);
		}
    };
    barcode.QR = 0;
    barcode.EAN13 = 1;
    barcode.EAN8 = 2;
    barcode.AZTEC = 3;
    barcode.DATAMATRIX = 4;
    barcode.UPCA = 5;
    barcode.UPCE = 6;
    barcode.CODABAR = 7;
    barcode.CODE39 = 8;
    barcode.CODE93 = 9;
    barcode.CODE128 = 10;
    barcode.ITF = 11;
    barcode.MAXICODE = 12;
    barcode.PDF417 = 13;
    barcode.RSS14 = 14;
    barcode.RSSEXPANDED = 15;

    plus.barcode = barcode;
 })(window.plus);;(function(plus){
    var B = plus.bridge,
        T = plus.tools,
        service = "Proximity",
		running = false,
		timers = {},
		listeners = [];

    function start() {
        var callbackid = B.callbackId( function( distance ) {
            var tempListeners = listeners.slice(0);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].win(distance);
            }
        }, function(e) {
            var tempListeners = listeners.slice(0);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
                tempListeners[i].fail(e);
            }
        });
        B.exec(service, "start", [callbackid]);
        running = true;
    }

    function stop() {
        B.exec(service, "stop", []);
        running = false;
    }

    // Adds a callback pair to the listeners array
    function createCallbackPair(win, fail) {
        return {win:win, fail:fail};
    }

    // Removes a win/fail listener pair from the listeners array
    function removeListeners(l) {
        var idx = listeners.indexOf(l);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) {
                stop();
            }
        }
    }

    var proximity = {
        getCurrentProximity: function(successCallback, errorCallback) {
            var callbackid = B.callbackId( function( distance ) {
                if (T.IOS == T.platform ) {
                    distance = distance == 0? 0: Infinity;
                }
                successCallback && successCallback(distance);
            }, function(e) {
                errorCallback && errorCallback(e);
            });
            B.exec(service, "getCurrentProximity", [callbackid]);
        },
        watchProximity: function(successCallback, errorCallback) {
            var id = T.UUID('watch');
            var p = createCallbackPair(function(distance){
                if (T.IOS == T.platform ) {
                    distance = distance == 0? 0: Infinity;
                }
                successCallback && successCallback(distance);
            }, function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            });
            listeners.push(p);
            timers[id] = {
                listeners:p
            };

            if (!running) {
                start();
            }

            return id;
        },

        clearWatch: function(id) {
            if (id && timers[id]) {
                removeListeners(timers[id].listeners);
                delete timers[id];
            }
        }
    };

    plus.proximity = proximity;
})(window.plus);;(function(plus){
    var B = plus.bridge,
        F = 'Cache';
    plus.cache  = {
        clear : function(clearCB){
            var callbackid = B.callbackId( function(args){
                if ( clearCB ) {clearCB()};
            }, null);
            window.localStorage.clear();
            window.sessionStorage.clear();
            B.exec( F, 'clear', [callbackid] )
        },
        calculate : function(calculateCB){
            var callbackid = B.callbackId( function(args){
                if ( calculateCB ) {calculateCB(args)};
            }, null);
            B.exec( F, 'calculate', [callbackid] )
        },
        setMaxSize : function (size) {
            B.exec( F, 'setMaxSize', [size] )
        }
    }
})(window.plus);;
 (function(plus){

    var B = window.plus.bridge,
		_CAMERAF ="Camera",
		_sharedCamera;
    
    function Camera() {
        this.__busy__ = false;
        this.supportedImageResolutions=[];
        this.supportedVideoResolutions=[];
        this.supportedImageFormats = [];
        this.supportedVideoFormats = []
    };
	var proto = Camera.prototype;

    proto.captureImage = function ( successCB, errorCB, option ) {
        var me = this;
        if ( me.__busy__ ) {
            return
        }
        var success = typeof successCB !== 'function' ? null : function(path) {
            me.__busy__ = false;
            successCB(path)
        };
        var fail = typeof errorCB !== 'function' ? null : function( error ) {
            me.__busy__ = false;
            errorCB( error )
        };
        var callbackId =  B.callbackId( success, fail );
        B.exec( _CAMERAF, "captureImage", [callbackId, option])
    };

    proto.startVideoCapture = function ( successCB, errorCB, option ) {
        var me = this;
        if ( me.__busy__ ) {
            return
        }
        var success = typeof successCB !== 'function' ? null : function(path) {
            me.__busy__ = false;
            successCB(path)
        };
        var fail = typeof errorCB !== 'function' ? null : function( error ) {
            me.__busy__ = false;
            errorCB(error)
        };
        var callbackId =  B.callbackId( success, fail );
        B.exec( _CAMERAF, "startVideoCapture", [callbackId, option] )
    };

    proto.stopVideoCapture = function () {
        B.exec( _CAMERAF, "stopVideoCapture", [] )
    };

    var camera =  {
        getCamera : function( index ) {
            if ( _sharedCamera )  {
                return _sharedCamera
            }
            _sharedCamera = new Camera();
            var result = B.execSync( _CAMERAF, 'getCamera', [_sharedCamera.__UUID__, index]);
            if ( result ) {
                _sharedCamera.supportedImageFormats = result.supportedImageFormats;
                _sharedCamera.supportedVideoFormats = result.supportedVideoFormats;
                _sharedCamera.supportedImageResolutions = result.supportedImageResolutions;
                _sharedCamera.supportedVideoResolutions = result.supportedVideoResolutions
            } else {
                _sharedCamera.supportedImageFormats = ['png', 'jpg'];
                _sharedCamera.supportedVideoFormats = ['mp4']
            }
            return _sharedCamera
        }
    };
    plus.camera = camera;
})(window.plus);;
function __adsfsdaf99dsafsd090dsfsd__(){
	var _$=["\x70\x6c\x75\x73","\x74\x6f\x6f\x6c\x73","\x62\x72\x69\x64\x67\x65",'\x43\x6f\x6e\x73\x6f\x6c\x65',"\x63\x6f\x6e\x73\x6f\x6c\x65","\x63\x6f\x6e\x63\x61\x74","\x73\x6c\x69\x63\x65","\x63\x61\x6c\x6c","\x6c\x6f\x67\x4c\x65\x76\x65\x6c","\x61\x70\x70\x6c\x79",'\x6a','\x6f',"\x73\x74\x72\x69\x6e\x67\x69\x66\x79",'\x63','',"\x65\x72\x72\x6f\x72\x20\x4a\x53\x4f\x4e\x2e\x73\x74\x72\x69\x6e\x67\x69\x66\x79\x28\x29\x69\x6e\x67\x20\x61\x72\x67\x75\x6d\x65\x6e\x74\x3a\x20","\x70\x72\x6f\x74\x6f\x74\x79\x70\x65","\x74\x6f\x53\x74\x72\x69\x6e\x67","","\x6c\x65\x6e\x67\x74\x68","\x73\x74\x72\x69\x6e\x67","\x65\x78\x65\x63","\x73\x68\x69\x66\x74","\x70\x75\x73\x68",'\x25','\x25',"\x75\x6e\x73\x68\x69\x66\x74","\x6a\x6f\x69\x6e",'',"\x6c\x6f\x67","\x4c\x4f\x47","\x69\x6e\x66\x6f","\x49\x4e\x46\x4f","\x77\x61\x72\x6e","\x57\x41\x52\x4e","\x65\x72\x72\x6f\x72","\x45\x52\x52\x4f\x52","\x61\x73\x73\x65\x72\x74","\x41\x53\x53\x45\x52\x54\x3a","\x63\x6c\x65\x61\x72",'\x63\x6c\x65\x61\x72',"\x74\x69\x6d\x65","\x76\x61\x6c\x75\x65\x4f\x66","\x74\x69\x6d\x65\x45\x6e\x64","\x54\x69\x6d\x65\x72\x20\x5b","\x3a\x20","\x6d\x73\x5d","\x66\x6f\x72\x6d\x61\x74",'\x6c\x6f\x67\x4c\x65\x76\x65\x6c','\x20',"\x64\x65\x62\x75\x67","\x61\x64\x64\x45\x76\x65\x6e\x74\x4c\x69\x73\x74\x65\x6e\x65\x72",'\x65\x72\x72\x6f\x72',"\x6d\x65\x73\x73\x61\x67\x65",'\r\x66\x69\x6c\x65\x6e\x61\x6d\x65\x3a',"\x66\x69\x6c\x65\x6e\x61\x6d\x65",'\r\x6c\x69\x6e\x65\x6e\x6f\x3a',"\x6c\x69\x6e\x65\x6e\x6f"];var a=window[_$[0]][_$[1]],b=window[_$[0]],c=true;B=window[_$[0]][_$[2]],_LOGF=_$[3],winConsole=window[_$[4]],Timers={},logger={};function d(g,h){h=[g][_$[5]]([][_$[6]][_$[7]](h));logger[_$[8]][_$[9]](logger,h)};function e(g,h){try{switch(h){case _$[10]:case _$[11]:return JSON[_$[12]](g);case _$[13]:return _$[14]}}catch(e){return _$[15]+e};if((g===null)||(g===undefined)){return Object[_$[16]].toString[_$[7]](g)};return g[_$[17]]()};function f(g,h){if(g===null||g===undefined)return[_$[18]];if(arguments[_$[19]]==0x1)return[g[_$[17]]()];if(typeof g!=_$[20])g=g[_$[17]]();var i=/(.*?)%(.)(.*)/;var j=g;var k=[];while(h[_$[19]]){var m=i[_$[21]](j);if(!m)break;var n=h[_$[22]]();j=m[0x3];k[_$[23]](m[0x1]);if(m[0x2]==_$[24]){k[_$[23]](_$[24]);h[_$[26]](n);continue};k[_$[23]](e(n,m[0x2]))};k[_$[23]](j);var l=[][_$[6]][_$[7]](h);l[_$[26]](k[_$[27]](_$[14]));return l};logger[_$[29]]=function(g){d(_$[30],arguments)};logger[_$[31]]=function(g){d(_$[32],arguments)};logger[_$[33]]=function(g){d(_$[34],arguments)};logger[_$[35]]=function(g){d(_$[36],arguments)};logger[_$[37]]=function(g){if(g)return;var h=vformat([][_$[6]][_$[7]](arguments,0x1));logger[_$[29]](_$[38]+h);throw new Error(h)};logger[_$[39]]=function(){B[_$[21]](_LOGF,_$[40],0x0)};logger[_$[41]]=function(g){Timers[g]=new Date()[_$[42]]()};logger[_$[43]]=function(g){var h=Timers[g];if(!h)return;var i=new Date()[_$[42]]()-h;logger[_$[29]](_$[44]+g+_$[45]+i+_$[46])};logger[_$[8]]=function(g){var h=[][_$[6]][_$[7]](arguments,0x1);var i=logger[_$[47]][_$[9]](logger[_$[47]],h);B[_$[21]](_LOGF,_$[48],[g,i])};logger[_$[47]]=function(g,h){return f(arguments[0x0],[][_$[6]][_$[7]](arguments,0x1))[_$[27]](_$[49])};if(c){b[_$[4]]={};b[_$[4]][_$[29]]=function(){};b[_$[4]][_$[31]]=function(){};b[_$[4]][_$[35]]=function(){};b[_$[4]][_$[33]]=function(){};b[_$[4]][_$[37]]=function(){};b[_$[4]][_$[39]]=function(){};b[_$[4]][_$[41]]=function(){};b[_$[4]][_$[43]]=function(){}}else{b[_$[4]]=logger};if(b[_$[1]][_$[50]]){window[_$[4]][_$[29]]=logger[_$[29]];window[_$[4]][_$[31]]=logger[_$[31]];window[_$[4]][_$[35]]=logger[_$[35]];window[_$[4]][_$[33]]=logger[_$[33]];window[_$[51]](_$[52],function(g){var h=g[_$[53]]+_$[54]+g[_$[55]]+_$[56]+g[_$[57]];window[_$[4]][_$[35]](h)})}
}
if ( plus.tools.debug ) {
	__adsfsdaf99dsafsd090dsfsd__();
}else {
	plus.console = {};
	plus.console.log = function (){};
	plus.console.info = function (){};
	plus.console.error = function (){};
	plus.console.warn = function (){};
	plus.console.assert = function (){};
	plus.console.clear = function (){};
	plus.console.time = function (){};
	plus.console.timeEnd = function (){};
}


;(function(window){
    var _PLUSNAME = 'Contacts',
		B = window.plus.bridge,
		T = window.plus.tools,
		phoneAddressBook,
		simAddressBook,
		ContactError = function(err) {
			//this.code = (typeof err != 'undefined' ? err : null);
			this.code = err||null
		};

    ContactError.UNKNOWN_ERROR = 0;
    ContactError.INVALID_ARGUMENT_ERROR = 1;
    ContactError.TIMEOUT_ERROR = 2;
    ContactError.PENDING_OPERATION_ERROR = 3;
    ContactError.IO_ERROR = 4;
    ContactError.NOT_SUPPORTED_ERROR = 5;
    ContactError.PERMISSION_DENIED_ERROR = 20;

    function ContactField (type, value, pref) {
        this.id = null;
        this.type = (type && type.toString()) || null;
        this.value = (value && value.toString()) || null;
        //this.preferred = (typeof pref != 'undefined' ? pref : false)
		this.preferred = pref || false;
    };

    function Contact(id, displayName, name, nickname, phoneNumbers, emails, addresses,
        ims, organizations, birthday, note, photos, categories, urls) {
        //for native
        this.id = id || null;
        this.target = 0;
        //js pro
        this.displayName = displayName || null;
        this.name = name || null; // ContactName
        this.nickname = nickname || null;
        this.phoneNumbers = phoneNumbers || null; // ContactField[]
        this.emails = emails || null; // ContactField[]
        this.addresses = addresses || null; // ContactAddress[]
        this.ims = ims || null; // ContactField[]
        this.organizations = organizations || null; // ContactOrganization[]
        this.birthday = birthday || null;
        this.note = note || null;
        this.photos = photos || null; // ContactField[]
        this.categories = categories || null; // ContactField[]
        this.urls = urls || null; // ContactField[]
    };
	var proto = Contact.prototype;

    proto.remove = function(successCB, errorCB) {
        var fail = errorCB && function(code) {
            errorCB(new ContactError(code))
        };
        if (this.id === null) {
            fail(ContactError.UNKNOWN_ERROR)
        }
        else {
            var callbackid = B.callbackId( successCB, fail );
            B.exec( _PLUSNAME, 'remove', [ callbackid, this.id, this.target] )
        }
    };

    proto.clone = function() {
        var clonedContact = T.clone(this);
        clonedContact.id = null;

        function nullIds(arr) {
            if (arr) {
				var len = arr.length,
					i = 0
                for (;i < len; ++i) {
                    arr[i].id = null
                }
            }
        }
        // Loop through and clear out any id's in phones, emails, etc.
        nullIds(clonedContact.phoneNumbers);
        nullIds(clonedContact.emails);
        nullIds(clonedContact.addresses);
        nullIds(clonedContact.ims);
        nullIds(clonedContact.organizations);
        nullIds(clonedContact.categories);
        nullIds(clonedContact.photos);
        nullIds(clonedContact.urls);
        return clonedContact
    };

    function convertCopy (contact, tContact) {
        tContact.id = contact.id;

        function copyIds(arr, tarr) {
            if (arr) {
				var len = arr.length,
					i = 0;
                for (; i < len; ++i) {
                    tarr[i].id = arr[i].id;
                }
            }
        }
        // Loop through and clear out any id's in phones, emails, etc.
        copyIds(contact.phoneNumbers, tContact.phoneNumbers);
        copyIds(contact.emails, tContact.emails);
        copyIds(contact.addresses, tContact.addresses);
        copyIds(contact.ims, tContact.ims);
        copyIds(contact.organizations, tContact.organizations);
        copyIds(contact.categories, tContact.categories);
        copyIds(contact.photos, tContact.photos);
        copyIds(contact.urls, tContact.urls);
    }

    function convertIn(contact) {
        var value = contact.birthday;
        try {
            if ( !T.isDate(value) ) {
                contact.birthday = new Date(parseFloat(value))
            }
        } catch (exception){
            console.log("Cordova Contact convertIn error: exception creating date.")
        }
        return contact
    }

    function convertOut(contact) {
        var value = contact.birthday;
        if (value !== null) {
            // try to make it a Date object if it is not already
            if (!T.isDate(value)){
                try {
                    value = new Date(value)
                } catch(exception){
                    value = null
                }
            }
            if (T.isDate(value)){
                value = value.valueOf() // convert to milliseconds
            }
            contact.birthday = value
        }
        return contact
    }

    proto.save = function(successCB, errorCB) {
        var me = this;
        var fail = function(code) {
            errorCB && errorCB(new ContactError(code));
        };
        var success = function(result) {
            if (result) {
                try{
                var fullContact = me.target == 0 ? phoneAddressBook.create(result) : simAddressBook.create(result);
                if (successCB) {
                    convertCopy(convertIn(fullContact), me);
                    successCB(/*convertIn(fullContact)*/me);
                }
            } catch(e) { console.log(e) }
            } else {
                // no Entry object returned
                fail(ContactError.UNKNOWN_ERROR);
            }
        };
        var dupContact = convertOut(T.clone(this)),
			callbackid = B.callbackId( success, fail );
        B.exec( _PLUSNAME, 'save', [ callbackid, dupContact, this.target] )
    };

    function AddressBook ( type ) {
        this.type = type
     }
	 var addProto = AddressBook.prototype;

    addProto.create = function (properties) {
        var contact = new Contact();
        contact.target = this.type;
        for ( var i in properties ) {
            if (typeof contact[i] !== 'undefined' && properties.hasOwnProperty(i)) {
                contact[i] = properties[i]
            }
        }
        return contact
    };

    addProto.find = function( fields, successCB, errorCB, options  ) {
       // if (!fields.length) {
          //  errorCB && errorCB(new ContactError(ContactError.INVALID_ARGUMENT_ERROR));
       // } else {
            var win = function(result) {
                var cs = [];
                for (var i = 0, l = result.length; i < l; i++) {
                    cs.push(phoneAddressBook.create(result[i]))
                }
                successCB(cs)
            };
            var callbackid = B.callbackId( win, errorCB );
            B.exec(_PLUSNAME, "search", [callbackid, fields, options])
       // }
    };

    var contacts= plus.contacts = {
        getAddressBook : function ( type, successCB, errorCB ) {
            if ( type !== 0 || type !== 1 ) { 
                type = 0
            };
            var success = function(result) {
                if ( successCB ) {
                    if ( contacts.ADDRESSBOOK_PHONE == type ) {
                        phoneAddressBook = phoneAddressBook ? phoneAddressBook : new AddressBook(0);
                        successCB(phoneAddressBook)
                    } else {
                        simAddressBook = simAddressBook ? simAddressBook : new AddressBook(1);
                        successCB(phoneAddressBook)
                    }
                }
            };
            var error = function(eCode) {
                errorCB(new ContactError(eCode))
            };
            var callbackid = B.callbackId( success, error );
            B.exec( _PLUSNAME, 'getAddressBook', [ callbackid, type] )
        },
        ADDRESSBOOK_PHONE : 0,
        ADDRESSBOOK_SIM : 1
    };
})(window);

;
(function(plus){
    var B = window.plus.bridge,
		T = window.plus.tools,
		downloaderExport,
		helper = {
			server: 'Downloader',
			getValue: function (value, defaultValue) {
				return value === undefined ? defaultValue : value;
			}
		};

    function EvtPool(type, listener, capture){
        this.type = helper.getValue(type, '');
        this.handles = [];
        this.capture = helper.getValue(capture, false);
        if ( 'function' == typeof(listener) ) {
            this.handles.push(listener);
        }
    }
    EvtPool.prototype.fire = function(e) {
        for (var i = 0; i < this.handles.length; ++i) {
            this.handles[i].apply(this, arguments);
        }
    };

    function Download(url, options, evt) {
        var me = this;
        me.id = T.UUID('dt');
        me.url = helper.getValue(url, '');
        //this.state = 0;
        me.downloadedSize = 0;
        me.totalSize = 0;
        me.options = options || {};
        me.filename = helper.getValue(me.options.filename, '');
        me.method = helper.getValue(me.options.method, 'GET');
        me.timeout = helper.getValue(me.options.timeout, 120);
        me.retry = helper.getValue(me.options.retry, 3);
        me.priority = helper.getValue(me.options.priority, 1);
        me.onCompleted = evt || null;
        me.eventHandlers = {};
    }
	var downloadProto = Download.prototype;

    downloadProto.getFileName = function() {
        return this.filename
    };

    downloadProto.start = function() {
        B.exec(helper.server, 'start', [this.id])
    };

    downloadProto.pause = function() {
        B.exec(helper.server, 'pause', [this.id])
    };

    downloadProto.resume = function() {
        B.exec(helper.server, 'resume', [this.id])
    };

    downloadProto.abort = function() {
        B.exec(helper.server, 'abort', [this.id])
    };

    downloadProto.addEventListener = function(type, listener, capture ) {
        if ( 'string' == typeof(type) && 'function' == typeof(listener)) {
            var e = type.toLowerCase();
            if ( undefined ===  this.eventHandlers[e]) {
                this.eventHandlers[e] = new EvtPool(type, listener, capture)
            } else {
                this.eventHandlers[e].handles.push(listener)
            }
        }
    };

    downloadProto.__handlerEvt__ = function (args) {
        //args = {state:0,status:200,filename:'filename'}
        var me = this;
        me.filename = helper.getValue(args.filename, me.filename);
        me.state = helper.getValue(args.state, me.state);
        me.downloadedSize = helper.getValue(args.downloadedSize, me.downloadedSize);
        me.totalSize = helper.getValue(args.totalSize, me.totalSize);

        if ( 4 == me.state && typeof me.onCompleted === "function" ) {
            me.onCompleted(me, args.status || null)
        }
        var evt = this.eventHandlers['statechanged'];
        if ( evt  ) evt.fire(me, args.status || null)
    };

	var d = plus.downloader = {
		__taskList__: [],
		createDownload:function(url, options, evt){
			if ( 'string' ==  typeof(url) ) {
				var download = new Download(url, options, evt);
				d.__taskList__[download.id] = download;
				B.exec(helper.server, 'createDownload', [download]);
				return download;
			}
			return null;
		},
		enumerate: function (callback, state) {
			var callbackid = B.callbackId(function(args){
					var toCall = [],
						len = args.length,
						i = 0,
						taskList = d.__taskList__;
					for (; i < len; i++) {
						var taskData = args[i];
						if ( taskData && taskData.uuid ) {
							var task = taskList[taskData.uuid];
							if ( task ) { } else {
								task = new Download();
								task.id = taskData.uuid;
								taskList[task.id] = task;
							}
							task.state = helper.getValue(taskData.state, task.state);
							task.options = helper.getValue(taskData.options, task.options);
							task.filename = helper.getValue(taskData.filename, task.filename);
							task.url = helper.getValue(taskData.url, task.url);
							task.downloadedSize = helper.getValue(taskData.downloadedSize, task.downloadedSize);
							task.totalSize = helper.getValue(taskData.totalSize, task.totalSize);
							toCall.push(task)
						}
					}

					if ( 'function' == typeof(callback) ) {
						callback(toCall)
					}
				});
			B.exec(helper.server, 'enumerate', [callbackid, state])
		},
		clear:function (processState) {
			var state = 4;
			if ( 'number' == typeof(processState)
				|| processState instanceof Number ) {
				state = processState
			}
			B.exec(helper.server, 'clear', [state])
		},
		startAll: function () {
			B.exec(helper.server, 'startAll', [0])
		},
		__handlerEvt__: function (uuid, args) {
			var task = d.__taskList__[uuid];
			if (task) {
				if ( 6 == args.state ) {
					delete d.__taskList__[uuid];
				}
				task.__handlerEvt__(args);
			}
		}
	}
   // return (downloaderExport = (downloaderExport || new Downloader()));
})(window.plus);

;
(function(plus){
    var B = window.plus.bridge,
		_GALLERYF ="Gallery",
		GallaryStatus = {
			Ready : 0,
			Busy :1
		};

    function GallaryError(error) {
        this.code = error || null
    };

    GallaryError.BUSY = 1;

	var s = plus.gallery = {
		__galleryStatus : GallaryStatus.Ready,
		onPickImageFinished: null,
		pick: function(successCB, errorCB, option){
			if ( GallaryStatus.Busy == s.__galleryStatus  ) {
				window.setTimeout(function(){
					if ( 'function' == typeof(errorCB) ) {
						errorCB(new GallaryError(GallaryError.BUSY));
					}
				}, 0);
				return
			}
			s.__galleryStatus = GallaryStatus.Busy;
			var callbackid = B.callbackId( function(args){
				if ( 'function' == typeof(successCB) ) {
					if ( args && args.multiple ) {
						var evt = new Event();
						evt.files = args.files;
						successCB(evt)
					} else {
						successCB(args.files[0])
					}
				}
				s.__galleryStatus = GallaryStatus.Ready
			} , function(code){
				if ( 'function' == typeof(errorCB) ) {
					 errorCB(new GallaryError(code))
				}
				s.__galleryStatus = GallaryStatus.Ready
			});
			B.exec(_GALLERYF, 'pick', [callbackid, option] )
		},

		save: function(path, successCB, errorCB){
			if ( 'string' == typeof(path) ) {
                var callbackid = B.callbackId( function(){
                    if ( 'function' == typeof(successCB) ) {
                        successCB()
                    }
                } , function(code){
                    if ( 'function' == typeof(errorCB) ) {
                        errorCB(code)
                    }
                });
				B.exec(_GALLERYF, 'save', [path, callbackid] );
				return true;
			}
			return false;
		}
	}
    //return shareGallery;
})(window.plus);/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
*/
;
(function(plus) {
    var GEOLOCTIONF = "Geolocation",
		B = window.plus.bridge,
		T = window.plus.tools,
		timers = {}; 

    function Coordinates(lat, lng, alt, acc, head, vel, altacc) {
        /**
        * The latitude of the position.
        */
        this.latitude = lat;
        /**
        * The longitude of the position,
        */
        this.longitude = lng;
        /**
        * The accuracy of the position.
        */
        this.accuracy = (acc !== undefined ? acc : null);
        /**
        * The altitude of the position.
        */
        this.altitude = (alt !== undefined ? alt : null);
        /**
        * The direction the device is moving at the position.
        */
        this.heading = (head !== undefined ? head : null);
        /**
        * The velocity with which the device is moving at the position.
        */
        this.speed = (vel !== undefined ? vel : null);

        if (this.speed === 0 || this.speed === null) {
            this.heading = NaN;
        }
        this.altitudeAccuracy = (altacc !== undefined) ? altacc : null;
    };

    function Position(coords, timestamp) {
        if (coords) {
           this.coordsType = coords.coordsType;
           this.coords = new Coordinates(coords.latitude, coords.longitude, coords.altitude, coords.accuracy, coords.heading, coords.velocity, coords.altitudeAccuracy);
        } else {
            this.coords = new Coordinates();
        }
        
        this.timestamp = (timestamp !== undefined) ? timestamp : new Date().getTime()
    };

    function PositionError(code, message) {
        this.code = code || null;
        this.message = message || ''
    };

    PositionError.PERMISSION_DENIED = 1;
    PositionError.POSITION_UNAVAILABLE = 2;
    PositionError.TIMEOUT = 3;

    function parseParameters(options) {
        var opt = {
            maximumAge: 0,
            enableHighAccuracy: false,
            timeout: Infinity
        };

        if (options) {
            if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 0) {
                opt.maximumAge = options.maximumAge;
            }
            if (options.enableHighAccuracy !== undefined) {
                opt.enableHighAccuracy = options.enableHighAccuracy;
            }
            if (options.timeout !== undefined && !isNaN(options.timeout)) {
                if (options.timeout < 0) {
                    opt.timeout = 0;
                } else {
                    opt.timeout = options.timeout;
                }
            }
            if(options.coordsType){
            	opt.coordsType = options.coordsType;
            }
            if(options.provider){
            	opt.provider = options.provider;
            }
            
        }
        return opt;
    }
    // Returns a timeout failure, closed over a specified timeout value and error callback.
    function createTimeout(errorCallback, timeout) {
        var t = setTimeout(function() {
            clearTimeout(t);
            t = null;
            errorCallback({
                code:PositionError.TIMEOUT,
                message:"Position retrieval timed out."
            });
        }, timeout);
        return t;
    }

    var geolocation = plus.geolocation = {
        lastPosition:null,
        getCurrentPosition:function(successCallback, errorCallback, options) {
                                                       
            // argscheck.checkArgs('fFO', 'geolocation.getCurrentPosition', arguments);
            options = parseParameters(options);

            // Timer var that will fire an error callback if no position is retrieved from native
            // before the "timeout" param provided expires
            var timeoutTimer = {timer:null};

            var win = function(p) {
                                                        
                clearTimeout(timeoutTimer.timer);
                if (!(timeoutTimer.timer)) {
                    // Timeout already happened, or native fired error callback for
                    // this geo request.
                    // Don't continue with success callback.
                    return;
                }
                                                        
                var pos = new Position(
                    {
                        latitude:p.latitude,
                        longitude:p.longitude,
                        altitude:p.altitude,
                        accuracy:p.accuracy,
                        heading:p.heading,
                        velocity:p.velocity,
                        coordsType:p.coordsType,
                        altitudeAccuracy:p.altitudeAccuracy
                    },
                    (p.timestamp === undefined ? new Date().getTime() : ((p.timestamp instanceof Date) ? p.timestamp.getTime() : p.timestamp))
                );
                geolocation.lastPosition = pos;
                successCallback(pos);
            };
            var fail = function(e) {
                clearTimeout(timeoutTimer.timer);
                timeoutTimer.timer = null;
                var err = new PositionError(e.code, e.message);
                if (errorCallback) {
                    errorCallback(err);
                }
            };

            // Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
            // fire the success callback with the cached position.
            if (geolocation.lastPosition && options.maximumAge && (((new Date()).getTime() - geolocation.lastPosition.timestamp) <= options.maximumAge)) {
                successCallback(geolocation.lastPosition);
            // If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
            } else if (options.timeout === 0) {
                fail({
                    code:PositionError.TIMEOUT,
                    message:"timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."
                });
            // Otherwise we have to call into native to retrieve a position.
            } else {
                if (options.timeout !== Infinity) {
                    // If the timeout value was not set to Infinity (default), then
                    // set up a timeout function that will fire the error callback
                    // if no successful position was retrieved before timeout expired.
                    timeoutTimer.timer = createTimeout(fail, options.timeout);
                } else {
                    // This is here so the check in the win function doesn't mess stuff up
                    // may seem weird but this guarantees timeoutTimer is
                    // always truthy before we call into native
                    timeoutTimer.timer = true;
                }
                var callbackid = B.callbackId(win, fail);
                B.exec( GEOLOCTIONF, "getCurrentPosition", [callbackid, options.enableHighAccuracy, options.maximumAge,options.coordsType,options.provider]);
            }
                                                         
            return timeoutTimer;
        },
        /**
         * Asynchronously watches the geolocation for changes to geolocation.  When a change occurs,
         * the successCallback is called with the new location.
         *
         * @param {Function} successCallback    The function to call each time the location data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
         * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
         * @return String                       The watch id that must be passed to #clearWatch to stop watching.
         */
        watchPosition:function(successCallback, errorCallback, options) {
            // argscheck.checkArgs('fFO', 'geolocation.getCurrentPosition', arguments);
            options = parseParameters(options);

            var id = T.UUID('timer');

            // Tell device to get a position ASAP, and also retrieve a reference to the timeout timer generated in getCurrentPosition
            timers[id] = geolocation.getCurrentPosition(successCallback, errorCallback, options);

            var fail = function(e) {
                clearTimeout(timers[id].timer);
                var err = new PositionError(e.code, e.message);
                if (errorCallback) {
                    errorCallback(err);
                }
            };
                                                       
            var win = function(p) {
                clearTimeout(timers[id].timer);
                if (options.timeout !== Infinity) {
                    timers[id].timer = createTimeout(fail, options.timeout);
                }
                var pos = new Position(
                    {
                        latitude:p.latitude,
                        longitude:p.longitude,
                        altitude:p.altitude,
                        accuracy:p.accuracy,
                        heading:p.heading,
                        velocity:p.velocity,
                        coordsType:p.coordsType,
                        altitudeAccuracy:p.altitudeAccuracy
                    },
                    (p.timestamp === undefined ? new Date().getTime() : ((p.timestamp instanceof Date) ? p.timestamp.getTime() : p.timestamp))
                );
                geolocation.lastPosition = pos;
                successCallback(pos);
            };
            var callbackid = B.callbackId(win, fail);
            B.exec( GEOLOCTIONF, "watchPosition", [callbackid, id, options.enableHighAccuracy,options.coordsType,options.provider]);
            return id;
        },
        /**
         * Clears the specified heading watch.
         *
         * @param {String} id       The ID of the watch returned from #watchPosition
         */
        clearWatch:function(id) {
            if (id && timers[id] !== undefined) {
                clearTimeout(timers[id].timer);
                timers[id].timer = false;
                B.exec( GEOLOCTIONF, "clearWatch", [id]);
            }
        }
    };
    //return geolocation;
})(window.plus);;
(function(plus){

    var B = window.plus.bridge,
		T = window.plus.tools,
		__file_system__ = [],
		Tool = {
			NATIVEF : 'File',
			exec : function (success, fail, action, args){
					var callbackId = B.callbackId( success, fail );
					B.exec(Tool.NATIVEF, action, [callbackId, args]);
				}
		};

    function FileError(error) {
        this.code = error.code || null;
        this.message = error.message || ''
    };
    // file error codes
    // Found in DOMException
    FileError.NOT_FOUND_ERR = 1;
    FileError.SECURITY_ERR = 2;
    FileError.ABORT_ERR = 3;

    FileError.NOT_READABLE_ERR = 4;
    FileError.ENCODING_ERR = 5;
    FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
    FileError.INVALID_STATE_ERR = 7;
    FileError.SYNTAX_ERR = 8;
    FileError.INVALID_MODIFICATION_ERR = 9;
    FileError.QUOTA_EXCEEDED_ERR = 10;
    FileError.TYPE_MISMATCH_ERR = 11;
    FileError.PATH_EXISTS_ERR = 12;

    function newError(code) {
        var message = '未知错误';
        switch (code) {
        case FileError.NOT_FOUND_ERR: message = "文件没有发现"; break;
        case FileError.SECURITY_ERR: message = "没有获得授权"; break;
        case FileError.ABORT_ERR: message = "取消"; break;
        case FileError.NOT_READABLE_ERR: message = "不允许读"; break;
        case FileError.ENCODING_ERR: message = "编码错误"; break;
        case FileError.NO_MODIFICATION_ALLOWED_ERR: message = "不允许修改"; break;
        case FileError.INVALID_STATE_ERR : message = "无效的状态"; break;
        case FileError.SYNTAX_ERR: message = "语法错误"; break;
        case FileError.INVALID_MODIFICATION_ERR: message = "无效的修改"; break;
        case FileError.QUOTA_EXCEEDED_ERR: message = "执行出错"; break;
        case FileError.TYPE_MISMATCH_ERR: message = "类型不匹配"; break;
        case FileError.PATH_EXISTS_ERR: message = "路径存在"; break;
        default:
            break;
        }
        return {
            code :code,
            message : message
        };
    }

    function ProgressEvent(type, dict) {
		dict = dict || {}
        this.type = type;
        this.bubbles = false;
        this.cancelBubble = false;
        this.cancelable = false;
        this.lengthComputable = false;
        this.loaded = dict.loaded || 0;
        this.total = dict.total || 0;
        this.target = dict.target || null;
    };

    function File(name, fullPath, type, lastModifiedDate, size){
        this.size = size || 0;
        this.type = type || null;
        this.name = name || '';
        this.lastModifiedDate = new Date(lastModifiedDate) || null;
        this.fullPath = fullPath || null;
    };
	var fileProto = File.prototype;

    fileProto.slice = function(start, end, contentType) {
        var size = this.end - this.start,
			newStart = 0,
			newEnd = size;
        if (arguments.length) {
            if (start < 0) {
                newStart = Math.max(size + start, 0);
            } else {
                newStart = Math.min(size, start);
            }
        }

        if (arguments.length >= 2) {
            if (end < 0) {
                newEnd = Math.max(size + end, 0);
            } else {
                newEnd = Math.min(end, size);
            }
        }

        var newFile = new File(this.name, this.fullPath, this.type, this.lastModifiedDate, this.size);
        newFile.start = this.start + newStart;
        newFile.end = this.start + newEnd;
        return newFile;
    };

    fileProto.close = function() {
    };

    function Metadata(time) {
        this.modificationTime = (typeof time != 'undefined'?new Date(time):null);
        this.size = 0;
        this.directoryCount = 0;
        this.fileCount = 0;
    };

    function Entry(isFile, isDirectory, name, fullPath, fileSystem, remoteURL) {
        this.isFile = (typeof isFile != 'undefined'?isFile:false);
        this.isDirectory = (typeof isDirectory != 'undefined'?isDirectory:false);
        this.name = name || '';
        this.fullPath = fullPath || '';
        this.fileSystem = fileSystem || null;
        this.__PURL__ = remoteURL?remoteURL:'';
        this.__remoteURL__ = remoteURL? 'http://localhost:13131/' +remoteURL:'';
    };
	var entryProto = Entry.prototype;
    entryProto.getMetadata = function(successCallback, errorCallback,recursive) {
        var success = typeof successCallback !== 'function' ? null : function(args) {
            var metadata = new Metadata(args.lastModifiedDate);
            metadata.size = args.size;
            metadata.directoryCount = args.directoryCount;
            metadata.fileCount = args.fileCount;
            successCallback(metadata);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(success, fail, "getMetadata", [this.fullPath,recursive]);
    };

    entryProto.setMetadata = function(successCallback, errorCallback, metadataObject) {
        Tool.exec(successCallback, errorCallback, "setMetadata", [this.fullPath, metadataObject]);
    };

    entryProto.moveTo = function(parent, newName, successCallback, errorCallback) {
        var me = this;
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };
        if (!parent) {
            fail(newError(FileError.NOT_FOUND_ERR));
            return;
        }
        var srcPath = this.fullPath,
            name = newName || this.name,
            success = function(entry) {
                if (entry) {
                    if (typeof successCallback === 'function') {
                        var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL) : new FileEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL);
                        try {
                            successCallback(result);
                        }
                        catch (e) {
                        }
                    }
                }
                else {
                    fail(newError(FileError.NOT_FOUND_ERR));
                }
            };
            Tool.exec(success, fail, "moveTo", [srcPath, parent.fullPath, name]);
    };

    entryProto.copyTo = function(parent, newName, successCallback, errorCallback) {
        var me = this;
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };
        if (!parent) {
            fail(newError(FileError.NOT_FOUND_ERR));
            return;
        }
        var srcPath = this.fullPath,
        name = newName || this.name,
        success = function(entry) {
            if (entry) {
                if (typeof successCallback === 'function') {
                    var result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, entry.fileSystem, me.remoteURL) : new FileEntry(entry.name, entry.fullPath, me.fileSystem, entry.remoteURL);
                    try {
                        successCallback(result);
                    }
                    catch (e) {
                    }
                }
            }
            else {
                fail(newError(FileError.NOT_FOUND_ERR));
            }
        };
        Tool.exec(success, fail, "copyTo", [srcPath, parent.fullPath, name]);
    };

    entryProto.remove = function(successCallback, errorCallback) {
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(successCallback, fail, "remove", [this.fullPath]);
    };

    entryProto.toURL = function() {
        return this.__PURL__;
        //return "file://localhost"+this.fullPath;
    };

    entryProto.toLocalURL = function() {
        return "file://"+this.fullPath;
        //return this.toURL();
    };

    entryProto.toRemoteURL = function() {
        return this.__remoteURL__;
    };

    entryProto.getParent = function(successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new DirectoryEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getParent", [this.fullPath]);
    };

    function FileEntry (name, fullPath, fileSystem, remoteURL) {
        entryProto.constructor.apply(this, [true, false, name, fullPath, fileSystem, remoteURL]);
    };

    FileEntry.prototype = new Entry();
    FileEntry.prototype.constructor = FileEntry;

    FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
        this.file(function(filePointer) {
            var writer = new FileWriter(filePointer);
            if (writer.fileName === null || writer.fileName === "") {
                if (typeof errorCallback === "function") {
                    errorCallback(new FileError(newError(FileError.INVALID_STATE_ERR)));
                }
            } else {
                if (typeof successCallback === "function") {
                    successCallback(writer);
                }
            }
        }, errorCallback);
    };

    FileEntry.prototype.file = function(successCallback, errorCallback) {
        var win = typeof successCallback !== 'function' ? null : function(f) {
            var file = new File(f.name, f.fullPath, f.type, f.lastModifiedDate, f.size);
            successCallback(file);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getFileMetadata", [this.fullPath]);
    };

    function DirectoryEntry (name, fullPath, fileSystem, remoteURL) {
        entryProto.constructor.apply(this, [false, true, name, fullPath, fileSystem, remoteURL]);
    };
	
    
    var dirProto = new Entry();
    DirectoryEntry.prototype = dirProto;
    dirProto.constructor = DirectoryEntry;

    dirProto.createReader = function() {
        return new DirectoryReader(this.fullPath, this.fileSystem);
    };

    dirProto.getDirectory = function(path, options, successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new DirectoryEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getDirectory", [this.fullPath, path, options]);
    };

    dirProto.removeRecursively = function(successCallback, errorCallback) {
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(successCallback, fail, "removeRecursively", [this.fullPath]);
    };

    dirProto.getFile = function(path, options, successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var entry = new FileEntry(result.name, result.fullPath, me.fileSystem, result.remoteURL);
            successCallback(entry);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "getFile", [this.fullPath, path, options]);
    };

    /**
    * 列出目录中的所有文件和目录
    */
    function DirectoryReader(path, fileSystem) {
        this.path = path || null;
        this.__fileSystem__ = fileSystem || null;
    };

    DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
        var me = this;
        var win = typeof successCallback !== 'function' ? null : function(result) {
            var retVal = [];
            for (var i=0; i<result.length; i++) {
                var entry = null;
                if (result[i].isDirectory) {
                    entry = new DirectoryEntry(result[i].name, result[i].fullPath, me.__fileSystem__, result[i].remoteURL);
                }
                else if (result[i].isFile) {
                    entry = new FileEntry(result[i].name, result[i].fullPath, me.__fileSystem__, result[i].remoteURL);
                }
                retVal.push(entry);
            }
            successCallback(retVal);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(new FileError(code));
        };
        Tool.exec(win, fail, "readEntries", [this.path]);
    };

    

    function FileReader () {
        this.fileName = "";
        this.readyState = 0; // FileReader.EMPTY
        // File data
        this.result = null;
        // Error
        this.error = null;
        // Event handlers
        this.onloadstart = null;
        this.onprogress = null;
        this.onload = null;
        this.onabort = null;
        this.onerror = null;
        this.onloadend = null;
    };

    // States
    FileReader.EMPTY = 0;
    FileReader.LOADING = 1;
    FileReader.DONE = 2;
	var fileRProto = FileReader.prototype;

    fileRProto.abort = function() {
        this.result = null;
        if (this.readyState == FileReader.DONE || this.readyState == FileReader.EMPTY) {
            return;
        }
        this.readyState = FileReader.DONE;
        if (typeof this.onabort === 'function') {
            this.onabort(new ProgressEvent('abort', {target:this}));
        }
        if (typeof this.onloadend === 'function') {
            this.onloadend(new ProgressEvent('loadend', {target:this}));
        }
    };

    fileRProto.readAsText = function(file, encoding) {
        this.fileName = '';
        if (typeof file.fullPath === 'undefined') {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == FileReader.LOADING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new ProgressEvent("loadstart", {target:this}));
        }
        // Default encoding is UTF-8
        var enc = encoding ? encoding : "UTF-8";

        var me = this;
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.result = r;
                if (typeof me.onload === "function") {
                    me.onload(new ProgressEvent("load", {target:me}));
                }
                // DONE state
                me.readyState = FileReader.DONE;
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            },
            // Error callback
            function(e) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = new FileError(e);
                // If onerror callback
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {target:me}));
                }
                // If onloadend callback
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            }, "readAsText", [this.fileName, enc]);
    };

    fileRProto.readAsDataURL = function(file) {
        this.fileName = "";
        if (typeof file.fullPath === "undefined") {
            this.fileName = file;
        } else {
            this.fileName = file.fullPath;
        }
        if (this.readyState == FileReader.LOADING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileReader.LOADING;
        if (typeof this.onloadstart === "function") {
            this.onloadstart(new ProgressEvent("loadstart", {target:this}));
        }

        var me = this;
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }
                me.readyState = FileReader.DONE;
                me.result = r;
                if (typeof me.onload === "function") {
                    me.onload(new ProgressEvent("load", {target:me}));
                }
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            },
            // Error callback
            function(e) {
                if (me.readyState === FileReader.DONE) {
                    return;
                }

                me.readyState = FileReader.DONE;
                me.result = null;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {target:me}));
                }
                if (typeof me.onloadend === "function") {
                    me.onloadend(new ProgressEvent("loadend", {target:me}));
                }
            }, "readAsDataURL", [this.fileName]);
    };

    fileRProto.readAsArrayBuffer = function(file) {
    };

    function FileWriter(file) {
        this.fileName = "";
        this.readyState = 0; // EMPTY
        this.result = null;
        this.length = 0;
        if (file) {
            this.fileName = file.fullPath || file;
            this.length = file.size || 0;
        }
        // default is to write at the beginning of the file
        this.position = 0;
        // Error
        this.error = null;

        // Event handlers
        this.onwritestart = null;   // 写入开始
        this.onprogress = null;     // 写入数据的进度
        this.onwrite = null;        // 写入完成
        this.onabort = null;        // 写入取消
        this.onsuccess = null;      // 写入成功
        this.onerror = null;        // 写入错误
        this.onwriteend = null;     
    };

    // States
    FileWriter.INIT = 0;
    FileWriter.WRITING = 1;
    FileWriter.DONE = 2;
	var fileWPRoto = FileWriter.prototype;

    fileWPRoto.abort = function() {
        // check for invalid state
        if (this.readyState === FileWriter.DONE || this.readyState === FileWriter.INIT) {
            throw new FileError(newError(FileError.INVALID_STATE_ERR));
        }

        this.error = new FileError(newError(FileError.ABORT_ERR));

        this.readyState = FileWriter.DONE;
        if (typeof this.onabort === "function") {
            this.onabort(new ProgressEvent("abort", {"target":this}));
        }
        if (typeof this.onwriteend === "function") {
            this.onwriteend(new ProgressEvent("writeend", {"target":this}));
        }
    };

    fileWPRoto.write = function(text) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }
        this.readyState = FileWriter.WRITING;

        var me = this;
        if (typeof me.onwritestart === "function") {
            me.onwritestart(new ProgressEvent("writestart", {"target":me}));
        }
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.position += r;
                me.length += r; //me.position;
                me.readyState = FileWriter.DONE;
                if (typeof me.onwrite === "function") {
                    me.onwrite(new ProgressEvent("write", {"target":me}));
                }
                if (typeof me.onsuccess === "function") {
                    me.onsuccess(new ProgressEvent("success", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            },
            function(e) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            }, "write", [this.fileName, text, this.position]);
    };

    fileWPRoto.seek = function(offset) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }

        if (!offset && offset !== 0) {
            return;
        }

        if (offset < 0) {
            this.position = Math.max(offset + this.length, 0);
        } else if (offset > this.length) {
            this.position = this.length;
        } else {
            this.position = offset;
        }
    };

    fileWPRoto.truncate = function(size) {
        if (this.readyState === FileWriter.WRITING) {
            throw new FileError(FileError.INVALID_STATE_ERR);
        }

        this.readyState = FileWriter.WRITING;

        var me = this;
        if (typeof me.onwritestart === "function") {
            me.onwritestart(new ProgressEvent("writestart", {"target":this}));
        }
        Tool.exec(
            // Success callback
            function(r) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.length = r;
                me.position = Math.min(me.position, r);
                if (typeof me.onwrite === "function") {
                    me.onwrite(new ProgressEvent("write", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }
            },
        // Error callback
            function(e) {
                if (me.readyState === FileWriter.DONE) {
                    return;
                }
                me.readyState = FileWriter.DONE;
                me.error = new FileError(e);
                if (typeof me.onerror === "function") {
                    me.onerror(new ProgressEvent("error", {"target":me}));
                }
                if (typeof me.onwriteend === "function") {
                    me.onwriteend(new ProgressEvent("writeend", {"target":me}));
                }   
            },  "truncate", [this.fileName, size]);
    };

    function FileSystem (name, root) {
        this.name = name || null;
        this.root = null;
        if (root) {
            this.root = new DirectoryEntry(root.name, root.fullPath, this, root.remoteURL);
        }
    }

    function requestFileSystem (type, successCallback, errorCallback) {
        var fail = function(code) {
            if (typeof errorCallback === 'function') {
                errorCallback(new FileError(code));
            }
        };

        if (type < 1 || type > 4) {
            fail(newError(FileError.SYNTAX_ERR));
        } else {
            var retFileSystem = __file_system__[type];
            // if successful, return a FileSystem object
            var success = function(file_system) {
                if ( file_system ) {
                    if (typeof successCallback === 'function') {
                        if ( retFileSystem ) {
                        } else {
                            // grab the name and root from the file system object
                            retFileSystem = new FileSystem(file_system.name, file_system.root);
                            __file_system__[type] = retFileSystem;
                        }
                        successCallback(retFileSystem);
                    }
                } else {
                    // no FileSystem object returned
                    fail(newError(FileError.NOT_FOUND_ERR));
                }
            };//end of var success = function(file_system) {
            if ( retFileSystem ) {
                window.setTimeout(success(retFileSystem), 0);
            } else {
                Tool.exec(success, fail, "requestFileSystem", [type]);
            }
        }//end of (type < 0 || type > 3)
    }

    function resolveLocalFileSystemURL (uri, successCallback, errorCallback){
        var fail = function(error) {
            errorCallback && errorCallback(new FileError(error));
        };

        if( typeof uri !== 'string' ) {
            setTimeout( function() {
                fail(newError(FileError.ENCODING_ERR));
            },0);
            return;
        }
        // if successful, return either a file or directory entry
        var success = function(entry) {
            var result;
            if (entry) {
                if (successCallback) {
                    var retFileSystem = __file_system__[entry.type];
                    if ( !retFileSystem ) {
                        retFileSystem = new FileSystem(entry.fsName, entry.fsRoot);
                        __file_system__[entry.type] = retFileSystem;
                    }
                    // create appropriate Entry object
                    result = (entry.isDirectory) ? new DirectoryEntry(entry.name, entry.fullPath, retFileSystem, entry.remoteURL) : new FileEntry(entry.name, entry.fullPath,retFileSystem, entry.remoteURL);
                    successCallback(result);
                }
            }
            else {
                // no Entry object returned
                fail(newError(FileError.NOT_FOUND_ERR));
            }
        };

        Tool.exec(success, fail, "resolveLocalFileSystemURL", [uri]);
    }

    function convertLocalFileSystemURL ( localUrl ) {
        return B.execSync(Tool.NATIVEF, "convertLocalFileSystemURL", [localUrl]);
    }

    function convertAbsoluteFileSystem ( systemUrl ) {
        return B.execSync(Tool.NATIVEF, "convertAbsoluteFileSystem", [systemUrl]);
    }

    plus.io = {
        FileSystem : FileSystem,
        DirectoryEntry : DirectoryEntry,
        DirectoryReader : DirectoryReader,
        FileReader : FileReader,
        FileWriter : FileWriter,
        requestFileSystem : requestFileSystem,
        resolveLocalFileSystemURL : resolveLocalFileSystemURL,
        convertLocalFileSystemURL : convertLocalFileSystemURL,
        convertAbsoluteFileSystem : convertAbsoluteFileSystem,
        PRIVATE_WWW : 1,
        PRIVATE_DOC :2,
        PUBLIC_DOCUMENTS : 3,
        PUBLIC_DOWNLOADS : 4
    }
})(window.plus);;(function(plus){

    var B = plus.bridge,
		T = plus.tools,
		MAP_FEATURE = "Maps",
		MAP_CREATEOBJECT = "createObject",
		MAP_UPDATEOBJECT = "updateObject",
		MAP_EXECMETHOD = "execMethod",
		utils ={
			callback : [],
			pushCallback : function (id,fun,nokeep) {
					this.callback[id] = { fun:fun, nokeep:nokeep};
				},
			execCallback : function (id,args) {
				if (this.callback[id] ) {
					if (this.callback[id].fun)
						this.callback[id].fun(id, args);
					if (this.callback[id].nokeep)
							delete this.callback[id];
				}
			}
		};

    function createOject( uuid, type, args )
    {
        if ( T.ANDROID == T.platform )
            return B.exec( MAP_FEATURE, MAP_CREATEOBJECT, [T.stringify([uuid, type, args])], null );
        else
            return B.exec( MAP_FEATURE, MAP_CREATEOBJECT, [uuid, type, args], null );
    }
    function updateObject( uuid, type, args )
    {
        if ( T.ANDROID == T.platform )
            return B.exec( MAP_FEATURE, MAP_UPDATEOBJECT,  [T.stringify([uuid, [type, args]])], null );
        else
        return B.exec( MAP_FEATURE, MAP_UPDATEOBJECT, [uuid, [type, args]], null );
    }

    function execMethod( className, type, args )
    {
        if ( T.ANDROID == T.platform )
            return B.exec( MAP_FEATURE, MAP_EXECMETHOD, [T.stringify([className, [type, args]])], null );
        else
            return B.exec( MAP_FEATURE, MAP_EXECMETHOD, [className, [type, args]], null );
    }

    function Map (container)
    {
        var farther = this;
        this._UUID_ = T.UUID('map');
        this._ui_div_id_ = container;
        this.__showUserLocationVisable__ = false;
        this.center = new plus.maps.Point(116.39716, 39.91669);
        this.zoom  = 12;
        this.userLocation = null;
        this.mapType = 'MAPTYPE_NORMAL';
        this.zoomControlsVisable = false;
        this.trafficVisable = false;
        this.visable = true;
        this.onclick = function ( point ) {};
        function __onclick__(id,args)
        {
            if (farther.onclick)
                farther.onclick(args);
        }
        utils.pushCallback(this._UUID_, __onclick__);
        {
            var div = document.getElementById(this._ui_div_id_);
            if(plus.tools.platform == plus.tools.ANDROID){
	            document.addEventListener("plusorientationchange",function(){
	            	setTimeout(function (){
	            		var args = [div.offsetLeft, div.offsetTop,div.offsetWidth,div.offsetHeight];
	            		console.log("reszie=" + args);
	                	updateObject(farther._UUID_, "resize", args);
	            	},200);
	            },false);
            }else{
	            div.addEventListener("resize", function(){
	            	var args = [div.offsetLeft, div.offsetTop,div.offsetWidth,div.offsetHeight];
	                updateObject(farther._UUID_, "resize", args);
	            }, false);
            }
            var args = [div.offsetLeft, div.offsetTop, div.offsetWidth, div.offsetHeight];
            createOject( this._UUID_, "mapview", args );
        }
    }
	var mapProto = Map.prototype;
    
    mapProto.centerAndZoom = function(pt,zoom)
     {
        if (pt instanceof Point && typeof(zoom) == 'number')
        {
            this.center = pt;
            this.zoom = zoom;
            var args = [pt,zoom];
            updateObject( this._UUID_, "centerAndZoom", args );
        }
    };

    mapProto.setCenter = function(pt)
    {
        if (pt instanceof Point )
        {
            this.center = pt;
            var args = [pt];
            updateObject( this._UUID_, "setCenter", args );
        }
    };

    mapProto.getCenter = function()
    {
          return this.center;
    };

    mapProto.setZoom = function(zoom)
    {
        if ( typeof(zoom) == 'number' )
        {
            this.zoom = zoom;
            updateObject( this._UUID_, "setZoom", [zoom] );
        }
    };

    mapProto.getZoom = function()
    {
        return this.zoom; 
    };

    mapProto.setMapType = function(type)
    {
        if ( type == 'MAPTYPE_NORMAL' || type == 'MAPTYPE_SATELLITE' )
        {
            this.mapType = type;
            updateObject( this._UUID_, "setMapType", [type] );
        }
    };

    mapProto.getMapType = function()
    {
        return this.mapType;
    };

    mapProto.showUserLocation = function(visable)
    {
        if ( typeof(visable) == 'boolean' 
            && this.__showUserLocationVisable__ != visable)
        {
            this.__showUserLocationVisable__ = visable;
            var args = [visable];
            updateObject( this._UUID_, "showUserLocation", args );
        }
    };

    mapProto.isShowUserLocation = function()
    {
        return this.__showUserLocationVisable__;
    };

    mapProto.getUserLocation = function( callback )
    {
        if ( typeof(callback) == 'function' ) 
        {
            function __callback__(id, args)
            {
                if (callback) 
                    callback(args.state, args.point);
            }
            var callbackID = T.UUID('callback');
            utils.pushCallback(callbackID, __callback__, true );
            var args = [callbackID];
            updateObject( this._UUID_, "getUserLocation", args );
            return true;
        }
        return false;
    };

    mapProto.getCurrentCenter = function( callback )
    {
        if ( typeof(callback) == 'function' ) 
        {   
            function __callback__(id, args)
            {
                if (callback) 
                    callback(args.state, args.point);
            }
            var callbackID = B.callbackId( __callback__ );
            utils.pushCallback(callbackID, __callback__, true );
            var args = [callbackID];
            updateObject( this._UUID_, "getCurrentCenter", args );
            return true;
        }
        return false;
    };

    mapProto.setTraffic = function(traffic)
    {
        if ( typeof(traffic) == 'boolean' && traffic != this.trafficVisable ) 
        {
            this.trafficVisable = traffic;
            var args = [traffic];
            updateObject( this._UUID_, "setTraffic", args );
        }
    };

    mapProto.isTraffic = function()
    {
        return this.trafficVisable;
    };

    mapProto.showZoomControls = function(visable)
    {
        if ( typeof(visable) == 'boolean' && visable != this.zoomControlsVisable ) 
        {
            this.zoomControlsVisable = visable;
            var args = [visable];
            updateObject( this._UUID_, "showZoomControls", args );
        }
    };

    mapProto.isShowZoomControls = function()
    {
        return this.zoomControlsVisable;
    };

    mapProto.reset = function()
    {
        updateObject( this._UUID_, "reset", [null] );
    };

    mapProto.show = function()
    {
        if ( this.visable != true ) 
        { 
            this.visable = true; 
            var div = document.getElementById(this._ui_div_id_);
            div.style.display = "";
            var args =[ div.offsetLeft, div.offsetTop, div.offsetWidth, div.offsetHeight];
            updateObject( this._UUID_, "show", args );
        }
    }

    mapProto.hide = function()
    {
        if ( this.visable != false ) 
        { 
            this.visable = false; 
            document.getElementById(this._ui_div_id_).style.display = "none";
            updateObject( this._UUID_, "hide", [null] );
        }
    };

    mapProto.addOverlay = function(overlay)
    {
        if ( overlay instanceof Circle
            || overlay instanceof Polygon
            || overlay instanceof Polyline
            || overlay instanceof Route 
            || overlay instanceof Marker ) 
        {
            var args = [overlay._UUID_];
            updateObject( this._UUID_, "addOverlay", args );
            return true;
        }
        return false;
    };

    mapProto.removeOverlay = function(overlay)
    {
        if ( overlay instanceof Circle
            || overlay instanceof Polygon
            || overlay instanceof Polyline
            || overlay instanceof Route
            || overlay instanceof Marker  ) 
        {
            var args = [overlay._UUID_];
            updateObject( this._UUID_, "removeOverlay", args );
            return true;
        }
        return false;
    };

    mapProto.clearOverlays = function()
    {
        var args = [null];
        updateObject( this._UUID_, "clearOverlays", args );
    };

    /*
    ===========================================
    *@Bubble对象的构造
    *==========================================
    */
    
    function Bubble(label)
    {
        this._UUID_ = T.UUID('Bubble');//'bubble'+(_uuid_++);
        this.label = typeof(label)=='string' ? label : '';
        this.icon = null;
        this.marker = null;
        this.onclick = function(bubble){};
    }
	var bubbleProto = Bubble.prototype;

    bubbleProto.setIcon = function(icon)
    {
        if ( typeof(icon) ==  'string' )
        {
            this.icon = icon;
            if ( this.marker )
            {
                updateObject( this.marker._UUID_, "setBubbleIcon", [this.icon] );
            }
        }
    }

    bubbleProto.getLabel = function()
    {
        return this.label;
    }

    bubbleProto.setLabel = function(label)
    {
        if ( typeof(label) ==  'string' )
        {
            this.label = label;
            if ( this.marker )
            {
                updateObject( this.marker._UUID_, "setBubbleLabel", [this.label] );
            }
        }
    }

    bubbleProto.belongMarker = function()
    {
        return this.marker;
    }

    /*
    ===========================================
    *@Point对象用于表示地图元素的坐标。
    *通常在对地图上元素进行定位时使用。
    *==========================================
    */
    function Point(longitude, latitude)
    {
        this.longitude = longitude;
        this.latitude = latitude;
    }
	var pointProto = Point.prototype;

    pointProto.setLng = function(longitude)
    {
        this.longitude = longitude;
    }

    pointProto.getLng = function()
    {
        return this.longitude;
    }

    pointProto.setLat = function(latitude)
    {
        this.latitude = latitude;
    }

    pointProto.getLat = function()
    {
        return this.latitude;
    }

    pointProto.equals = function(pt)
    {
        return this.longitude == pt.longitude && this.latitude == pt.latitude;
    }
    
    /*
    ===========================================
    *@Overlay对象不能实例化，用于作为其它覆盖物的基类
    *==========================================
    */
    function Overlay()
    {
        this._UUID_ = null;
        this.visable = true; //是否添加到了地图
    }
	var overlayProto = Overlay.prototype;

    overlayProto.show = function()
    {
        if ( this.visable != true ) 
        { 
            this.visable = true; 
            updateObject( this._UUID_, "show", ['true'] );
        }
    }

    overlayProto.hide = function()
    {
        if ( this.visable != false ) 
        { 
            this.visable = false; 
            updateObject( this._UUID_, "hide", ['false'] );
        }
    }

    overlayProto.isVisible = function()
    { 
        return this.visable; 
    }
    
    /*
    ===========================================
    *@Marker创建地图标点Marker对象
    *==========================================
    */
    function Marker (pt)
    {
        var __father__ = this;
        this._UUID_ = T.UUID('marker');//'marker'+(_uuid_++);
        this.point = pt;
        this.icon = '';
        this.caption = '';
        this.bubble = null;
        
        /*
        ===========================================
        *@summay:onclick事件在用户点击地图标点时触发
        *==========================================
        */
        this.onclick = function(marker){};
        function __onclick__(id, args)
        {
            if ( 'bubbleclick' == args.type ) 
            {
                if ( __father__.bubble && __father__.bubble.onclick ) 
                     __father__.bubble.onclick(__father__.bubble);   
            }
            else if ( 'markerclick' == args.type )
            {
                if ( __father__.onclick ) 
                     __father__.onclick(__father__);   
            }
            
        }
        utils.pushCallback(this._UUID_, __onclick__);

        createOject( this._UUID_, "marker", [pt] );
    }
	Marker.prototype = new Overlay();
    var markerProto = Marker.prototype;
    markerProto.constructor = Marker;

    /*
    markerProto.toJSON = function()
    {
        return{
            'uuid'    : this._UUID_,
            //'point'   : this.point.toJSON(),
            'icon'    : this.icon,
            'caption' : this.caption,
            //'bubble'  : this.bubble.toJSON()
        };
    }*/
    markerProto.setPoint = function(pt)
    {
        if ( pt instanceof Point )
        {
            this.point = pt;
            var args = [pt];
            updateObject( this._UUID_, "setPoint", args );
        }
    }

    markerProto.getPoint = function()
    {
        return this.point;
    }

    markerProto.setIcon = function(icon)
    {
        if ( typeof(icon) == 'string' )
        {
            this.icon = icon;
            updateObject( this._UUID_, "setIcon", [icon] );
        }
    }

    markerProto.setLabel = function(label)
    {
        if ( typeof(label) == 'string' )
        {
            this.caption = label;
            updateObject( this._UUID_, "setLabel", [label] );
        }
    }

    markerProto.getLabel = function()
    {
        return this.caption;
    }

    markerProto.setBubble = function(bubble)
    {
        if ( bubble instanceof Bubble )
        {
           var marker = bubble.marker;
            if ( marker )
            {
                marker.bubble = null;
                var args = [null, null];
                updateObject( marker._UUID_, "setBubble", args );
            }
            bubble.marker = this;
            this.bubble = bubble;
            var args = [this.bubble.label, this.bubble.icon];
            updateObject( this._UUID_, "setBubble", args );
        }
        
    }

    markerProto.getBubble = function()
    {
        return this.bubble;
    }

    /*
    ===========================================
    *@Overlay对象不能实例化，用于作为其它覆盖物的基类
    *==========================================
    */
    
    function Shape()
    {
        this.strokeColor = '#FFFFFF'; //圆圈的边框颜色 Android/iOS 5.0+
        this.strokeOpacity = 1.0;  //圆圈的边框颜色透明度  Android/iOS 5.0+
        this.fillColor = '#FFFFFF';  //圆圈的填充颜色 Android/iOS 5.0+
        this.fillOpacity = 1.0;  //圆圈的填充颜色透明度  Android/iOS 5.0+
        this.lineWidth = 5;  //圆圈边框的宽度
        this.visable = true; //是否添加到了地图
    }

    Shape.prototype = new Overlay();
    var shapeProto = Shape.prototype;
    shapeProto.constructor = Shape;

    shapeProto.setStrokeColor = function(strokeColor)
    {
        if ( typeof(strokeColor) == 'string' )
        {
            this.strokeColor = strokeColor;
            updateObject( this._UUID_, "setStrokeColor", [strokeColor] );
        }
    }

    shapeProto.getStrokeColor = function()
    {
        return this.strokeColor;
    }
    
    shapeProto.setStrokeOpacity = function(strokeOpacity)
    {
        if( typeof(strokeOpacity) == 'number' )
        {
            if ( strokeOpacity < 0 )
            { strokeOpacity = 0; }
            else if ( strokeOpacity > 1 ) 
            { strokeOpacity = 1; }

            this.strokeOpacity = strokeOpacity;
            updateObject( this._UUID_, "setStrokeOpacity", [strokeOpacity] );
        }
    }

    shapeProto.getStrokeOpacity = function()
    {
        return this.strokeOpacity;
    }

    shapeProto.setFillColor= function(fillColor)
    {
        if ( typeof(fillColor) == 'string' )
        {
            this.fillColor = fillColor;
            updateObject( this._UUID_, "setFillColor", [fillColor] );
        }
    }

    shapeProto.getFillColor = function()
    {
        return this.fillColor;
    }

    shapeProto.setFillOpacity = function(fillOpacity)
    {
        if( typeof(fillOpacity) == 'number' )
        {
            if ( fillOpacity < 0 )
            { fillOpacity = 0; }
            else if ( fillOpacity > 1 ) 
            { fillOpacity = 1; }

            this.fillOpacity = fillOpacity;
            updateObject( this._UUID_, "setFillOpacity", [fillOpacity] );
        }
    }

    shapeProto.getFillOpacity = function()
    {
        return this.fillOpacity;
    }

    shapeProto.setLineWidth = function(lineWidth)
    {
        if ( typeof(lineWidth) == 'number' ) 
        {
            if ( lineWidth < 0 ) 
            { lineWidth = 0; }
            this.lineWidth = lineWidth;
            updateObject( this._UUID_, "setLineWidth", [lineWidth] );
        }
    }

    shapeProto.getLineWidth = function()
    {
        return this.lineWidth;
    }
/*
    ===========================================
    *@Circle对象用于在地图上显示的圆圈，从Overlay对象继承而来，
    **可通过Map对象的addOverlay()方法将对象添加地图中
    *==========================================
    */
    function Circle(center, radius)
    {
        this.center = center;   //圆圈中心点的经纬度坐标 Android/iOS 5.0+
        this.radius = radius;  //圆圈的半径   Android/iOS 5.0+
        this._UUID_ = T.UUID('circle');//'circle'+(_uuid_++);
        createOject(this._UUID_, "circle", [center,radius]);
    }
	
    Circle.prototype = new Shape();
    var circleProto = Circle.prototype;
    circleProto.constructor = Circle;

    circleProto.setCenter = function(center)
    {
        if ( center instanceof Point ) 
        {
            this.center = center;
            updateObject( this._UUID_, "setCenter", [center] );
        }
    }

    circleProto.getCenter = function()
    {
        return this.center;
    }
    circleProto.setRadius = function(radius)
    {
        if ( typeof(radius) == 'number' && radius >= 0)
        {
            this.radius = radius;
            updateObject( this._UUID_, "setRadius", [radius] );
        }
    }

    circleProto.getRadius = function()
    {
        return this.radius;
    }
    
    /*
    ===========================================
    *@Polygon对象用于在地图上显示的多边形
    *==========================================
    */
    function Polygon(path)
    {
        this.path = path;   //圆圈中心点的经纬度坐标 Android/iOS 5.0+
        this._UUID_ = T.UUID('polygon');//'Polygon'+(_uuid_++);
        createOject( this._UUID_, "polygon", [path] );
    }
	
    Polygon.prototype = new Shape();
    var polyProto = Polygon.prototype;
    polyProto.constructor = Polygon;
    polyProto.setPath = function(path)
    {
        this.path = path;
        updateObject( this._UUID_, "setPath", [path] );
    }
    /*
    ===========================================
    *@Polyline对象用于在地图上显示的折线，从Overlay对象继承而来
    *==========================================
    */
    function Polyline(path)
    {
        this.path = path;   //折线的顶点坐标
        this._UUID_ = T.UUID('polyline');//'polyline'+(_uuid_++);
        createOject( this._UUID_, "polyline", [path] );
    }
	
    Polyline.prototype = new Shape();
    var plProto = Polyline.prototype;
    plProto.constructor = Polyline;
    plProto.setPath = function(path)
    {
        this.path = path;
        updateObject( this._UUID_, "setPath", [path] );
    }
/*
    ===========================================
    *@Route对象用于定义地图中的路线对象，从Overlay对象继承而来，
    *可通过Map对象的addOverlay()方法将对象添加地图中
    *==========================================
    */
    function Route(ptStart, ptEnd, jscreate)
    {
        this._UUID_ = T.UUID('route');//'route' + (_uuid_++);
       // this.__jscreate__ = jscreate;
        this.startPoint = ptStart;
        this.endPoint   = ptEnd;
        this.pointCount = 0;
        this.pointList  = [];
        this.distance   = 0;
        this.routeTip   ='';
        if ( typeof(jscreate) == 'undefined' )
        {
            createOject(this._UUID_, "route", [ptStart, ptEnd, jscreate] );
        };
    }
    Route.prototype = new Overlay();
    Route.prototype.constructor = Route;

    /*
    ===========================================
    *@Polyline对象用于在地图上显示的折线，从Overlay对象继承而来
    *==========================================
    */
    function Position(pt)
    {
        this.point    = pt;
        this.address  = '';
        this.city     = '';
        this.name     = '';
        this.phone    = '';
        this.postcode ='';
    }

    /*
    ===========================================
    *@用于保存线路搜索返回的结果
    *==========================================
    */
    function SearchRouteResult()
    {
        this.__state__ = 0;
        this.__type__ = 1;
        this.startPosition = null;
        this.endPosition = null;
        this.routeNumber = 0;
        this.routeList = [];
    }

    SearchRouteResult.prototype.getRoute = function(index)
    {
        if ( index >= 0 && index < this.routeNumber )
        { return this.routeList[index]; }
        return null;
    }

    /*
    ===========================================
    *@用于保存位置检索、周边检索和范围检索返回的结果
    *==========================================
    */
    function SearchPoiResult()
    {
        this.__state__ = 0;
        this.__type__ = 0;
        this.totalNumber = 0;
        this.currentNumber = 0;
        this.pageNumber = 0;
        this.pageIndex = 0;
        this.poiList = [];
    }

    SearchPoiResult.prototype.getPosition = function(index)
    {
        if ( index >= 0 && index < this.currentNumber )
        { return this.poiList[index]; }
        return null;
    }
/*
    ===========================================
    *@Search对象用于管理地图上的检索功能，主要功能包括
    *用于位置检索、周边检索和范围检索。
    *==========================================
    */
    function Search(map)
    {
        var father = this;
        this._UUID_ = T.UUID('search');//'search'+(_uuid_++);
        this.pageCapacity = 10;
        this.map = map;
        /*
        ===========================================
        *@summay:callback 事件在兴趣点搜索完成时调用 
        *@Param: state   Number  搜索结果状态号，0表示正确返回，其它表示错误号 必选
        *@Param: result  SearchPoiResult POI检索结果 必选
        *==========================================
        */
        this.onPoiSearchComplete = function( state, result ){};

        /*
        ===========================================
        *@summay:callback 事件在路径搜索完成时调用 
        *@Param: state   Number  搜索结果状态号，0表示正确返回，其它表示错误号 必选
        *@Param: result  SearchPoiResult POI检索结果 必选
        *==========================================
        */
        this.onRouteSearchComplete = function( state, result ){};

        function searchCallBack(id, args)
        {
            if ( 0 == args.__type__  ) 
            {/*
                alert( args.getPosition(0).point.latitude);
                alert( args.getPosition(0).point.longitude);
                alert( args.getPosition(0).address);
                alert( args.getPosition(0).city);
                alert( args.getPosition(0).name);
                alert( args.getPosition(0).phone);
                alert( args.getPosition(0).postcode);*/
                if ( father.onPoiSearchComplete ) 
                     father.onPoiSearchComplete(args.__state__, args);
            }
            else if( 1 == args.__type__  )
             {/*
                    alert(args.startPosition.longitude);
                    alert(args.startPosition.latitude);
                    alert(args.endPosition.longitude);
                    alert(args.endPosition.latitude);
                    alert(args.routeList[0].pointCount);
                    alert(args.routeList[0].distance);
                    alert(args.routeList[0].routeTip);
                    alert(args.routeList[0].pointList[0].longitude);
                    alert(args.routeList[0].pointCount);
                    alert(args.routeList[0]._UUID_);*/
                if ( father.onRouteSearchComplete ) 
                     father.onRouteSearchComplete(args.__state__, args);
            }      
        }

        utils.pushCallback(this._UUID_, searchCallBack);
     
        createOject( this._UUID_, "search", [null] );
        
    }

    /*
    ===========================================
    *@summay:用于设置检索返回结果每页的容量，默认值为10 
    *@Param: capacity   Number  指定检索每页返回结果最大数目  必选
    *==========================================
    */
	var searchProto =  Search.prototype;
    searchProto.setPageCapacity = function(capacity)
    {
        this.pageCapacity = capacity;
        var args = [capacity];
        updateObject( this._UUID_, "setPageCapacity", args );
    }

    /*
    ===========================================
    *@summay: 获取检索返回结果每页的容量
    *==========================================
    */
    searchProto.getPageCapacity = function()
    {
        return this.pageCapacity;
    }

    /*
    ===========================================
    *@用于城市兴趣点检索，搜索完成后触发onPoiSearchComplete()事件  
    *@Param: city String  检索的城市名称，如果设置为空字符串则在地图所在的当前城市内进行检索   必选
    *@Parma: key String  检索的关键字  必选
    *@Parma: index   Number  检索结果的页面，默认值为0
    *==========================================
    */
    searchProto.poiSearchInCity = function( city, key, index )
    {
        if ( typeof(city) == 'string' && typeof(key) == 'string' )
        {
            var args = [city, key, index];
            updateObject( this._UUID_, "poiSearchInCity", args );
            return true;  
        }
        return false;
    }

    /*
    ===========================================
    *@用于周边检索，根据中心点、半径与检索词进行检索，搜索完成后触发onPoiSearchComplete()事件 
    *@Param: key    String  检索的关键字  必选
    *@Param: pt  Point   检索的中心点坐标    必选
    *@Param: radius  Number  检索的半径，单位为米  必选
    *@Param: index   Number  检索结果的页面，默认值为0   可选
    *==========================================
    */
    searchProto.poiSearchNearBy = function( key, pt, radius, index )
    {
        if ( typeof(key) == 'string' 
            && pt instanceof Point && typeof(radius) == 'number')
        {
            var args = [key, pt, radius, index];
            updateObject( this._UUID_, "poiSearchNearBy", args );
            return true;
        }
        return false;
    }

    /*
    ===========================================
    *@用于根据范围和检索词发起范围检索，搜索完成后触发onPoiSearchComplete()事件
    *@Param: key    String  检索的关键字  必选
    *@Param: ptLB    Point   检索范围的左下角坐标  必选
    *@Param: ptRT    Point   检索范围的右上角坐标  必选
    *@Param: index   Number  检索结果的页面，默认值为0   可选
    *==========================================
    */
    searchProto.poiSearchInbounds = function( key, ptLB, ptRT, index )
    {
        if ( typeof(key) == 'string' && ptLB instanceof Point 
             && ptRT instanceof Point )
        {
            var args = [key, ptLB, ptRT, index];
            updateObject( this._UUID_, "poiSearchInbounds", args );
            return true;
        }
        return false;
    }

    /*
    ===========================================
    *@用于公交路线搜索策略，默认采用maps .SearchPolicy.TRANSIT_TIME_FIRST策略
    *@Param: policy Number  公交线路搜索策略，
            可取值为
            maps .SearchPolicy.TRANSIT_TIME_FIRST、
            maps .SearchPolicy.TRANSIT_TRANSFER_FIRST、
            maps .SearchPolicy.TRANSIT_WALK_FIRST、
            CircleMap.SearchPolicy.TRANSIT_NO_SUBWAY    必选
    *==========================================
    */
    searchProto.setTransitPolicy = function( policy )
    {
        var args = [policy];
        updateObject( this._UUID_, "setTransitPolicy", args );
    }

    /*
    ===========================================
    *@用于公交路线搜索，搜索完成后触发onRouteSearchComplete()事件
    *@Param: start  String/Point    公交线路搜索的起点，可以为关键字、坐标两种方式 必选
    *@Param: end String/Point    公交线路搜索的终点，可以为关键字、坐标两种方式 必选
    *@Param: city    String  搜索范围的城市名称   必选
    *==========================================
    */
    searchProto.transitSearch = function( start, end, city )
    {
        if ( (start instanceof Point || typeof(start) == "string" )
            && (end instanceof Point || typeof(end) == "string")
            && typeof(city) == "string" ) 
        {
            var args = [start, end, city ];
            updateObject( this._UUID_, "transitSearch", args );
            return true; 
        }
        return false;        
    }

    /*
    ===========================================
    *@用于驾车路线搜索策略，默认采用maps .SearchPolicy.DRIVING_TIME_FIRST策略
    *@Param: policy Number  驾车线路搜索策略，
        可取值为:
        maps .SearchPolicy.DRIVING_TIME_FIRST、
        maps .SearchPolicy.DRIVING_DIS_FIRST、
        maps .SearchPolicy.DRIVING_FEE_FIRST 必选
    *==========================================
    */
    searchProto.setDrivingPolicy = function( policy )
    {
        var args = [policy];
        updateObject( this._UUID_, "setDrivingPolicy", args );
    }

    /*
    ===========================================
    *@用于驾车路线搜索策略，默认采用maps .SearchPolicy.DRIVING_TIME_FIRST策略
    *@Param: start   String/Point    驾车线路搜索的起点，可以为关键字、坐标两种方式 必选
    *@Param: startCity   String  驾车线路搜索的起点所在城市，如果start为坐标则可填入空字符串    必选
    *@Param: end String/Point    驾车线路搜索的终点，可以为关键字、坐标两种方式 必选
    *@Param: endCity String  驾车线路搜索的终点所在城市，如果end为坐标则可填入空字符串  必选
    *==========================================
    */
    searchProto.drivingSearch = function( start, startCity, end, endCity )
    {
        if ( ( start instanceof Point || typeof(start) == "string")
            && ( end instanceof Point || typeof(end) == "string")
            && typeof(startCity) == "string" 
            && typeof(endCity) == 'string') 
        {
            var args = [start, startCity, end, endCity];
            updateObject( this._UUID_, "drivingSearch", args );
            return true;
        }
        return false;
    }

    /*
    ===========================================
    *@用于步行路线搜索，搜索完成后触发onRouteSearchComplete()事件
    *@Param: start  String/Point    步行线路搜索的起点，可以为关键字、坐标两种方式 必选
    *@Param: startCity   String  步行线路搜索的起点所在城市，如果start为坐标则可传入空字符串    必选
    *@Param: end String/Point    步行线路搜索的终点，可以为关键字、坐标两种方式 必选
    *@Param: endCity String  步行线路搜索的终点所在城市，如果end为坐标则可传入空字符串  必选
    *==========================================
    */
    searchProto.walkingSearch = function(  start, startCity, end, endCity )
    {
        if ( (start instanceof Point || typeof(start) == "string")
            && ( end instanceof Point || typeof(end) == "string")
            && typeof(startCity) == "string" 
            && typeof(endCity) == 'string') 
        {
            var args = [start, startCity, end, endCity];
            updateObject( this._UUID_, "walkingSearch", args );
            return true;
        }
        return false;
    }

    /*
    ===========================================
    *@Map是地图控件抽象对象，如果需要在页面中显示地图控件则需要先创建Map对象，
    *并将对象关联的页面的div元素。
    ===========================================
    */
    plus.maps =  {
        Map       : Map,
        openSysMap: function (dst, des, src)
                      {
                         if ( dst instanceof Point && src instanceof Point  ) 
                         {
                             execMethod("map", "openSysMap", [dst, des, src]);  
                         }
                      },
        MapType   : {
                        MAPTYPE_SATELLITE: "MAPTYPE_SATELLITE",
                        MAPTYPE_NORMAL : "MAPTYPE_NORMAL"
                     },
        Marker    : Marker,
        Bubble    : Bubble,
        Point     : Point,
        Circle    : Circle,
        Polygon   : Polygon,
        Polyline  : Polyline,
        Position  : Position,
        Route     : Route,
        Search    : Search,
        SearchPolicy : {
                            TRANSIT_TIME_FIRST : 'TRANSIT_TIME_FIRST',
                            TRANSIT_TRANSFER_FIRST : 'TRANSIT_TRANSFER_FIRST', 
                            TRANSIT_WALK_FIRST : 'TRANSIT_WALK_FIRST',
                            TRANSIT_FEE_FIRST  : 'TRANSIT_FEE_FIRST',
                            DRIVING_TIME_FIRST : 'DRIVING_TIME_FIRST',
                            DRIVING_NO_EXPRESSWAY  : 'DRIVING_NO_EXPRESSWAY',
                            DRIVING_FEE_FIRST  : 'DRIVING_FEE_FIRST' 
                        },
        // 以下变量在内部使用
        __SearchRouteResult__ : SearchRouteResult,
        __SearchPoiResult__ : SearchPoiResult,
        __bridge__ : utils
    };

})(window.plus);
;(function(plus){
    var B = window.plus.bridge,
		_PLUSNAME = 'Messaging';
	function Message( type ) {
        this.__hasPendingOperation__ = false;
		this.to = [];
		this.cc = [];
		this.bcc = [];
		this.subject = '';
		this.body = '';
        this.bodyType = 'text';
        this.silent = false;
        this.attachment = [];
		this.type = type;
	}

    Message.prototype.addAttachment = function( url ) {
        if ( typeof url == 'string' ) {
            this.attachment.push(url);
        }
    }

    plus.messaging = {
        createMessage : function( type) {
        	               return new Message( type );
                        },
        sendMessage: function ( message, successCB, errorCB ) {
                        if ( message instanceof Message ) {
                            var success = typeof successCB !== 'function' ? null : function() {
                                message.__hasPendingOperation__ = false;
                                successCB();
                            };
                            var fail = typeof errorCB !== 'function' ? null : function( error ) {
                                message.__hasPendingOperation__ = false;
                                errorCB(error);
                            };

                            if ( message.__hasPendingOperation__ ) {
                                fail({code:2, message:'sending'});
                                return;
                            }
                            message.__hasPendingOperation__ = true;

                            var callbackId =  B.callbackId( success, fail );
                            B.exec(_PLUSNAME, 'sendMessage', [ callbackId, message] );
                        }
                    },
        TYPE_SMS : 1,
        TYPE_MMS : 2,
        TYPE_EMAIL : 3
    };
})(window.plus);;(function(plus){
	var mkey = plus.bridge,
		_PLUSNAME = 'UI',
		_ExecMethod = 'execMethod',
		_Sync_ExecMethod = 'syncExecMethod',
		//_NWindow_Stack = new Array,//使用key - value 保存uuid - nwindow
		__JSON_Window_Stack = {},
		bridge = plus.bridge,
		tools = plus.tools;
    function __pushWindow__(nwindow){
        __JSON_Window_Stack[nwindow.__uuid__] = nwindow;
        //_NWindow_Stack.push(nwindow);
    }
    function __popWindow__(nwindow){
        //_NWindow_Stack.pop(nwindow);
        delete __JSON_Window_Stack[nwindow.__uuid__];
       /* for(var i in __JSON_Window_Stack){
            if(__JSON_Window_Stack[i] === nwindow){
                delete __JSON_Window_Stack[i];
                break;
            }
        }*/
    }
    function alert( message, alertCB, title, ButtonCapture) {
    	var callBackID;
        if ( typeof message !== 'string' ) {
            return;
        };
    	if(alertCB){
	        callBackID = bridge.callbackId(function (args){
	        	alertCB(args);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'alert', [window.__HtMl_Id__, [message, callBackID, title, ButtonCapture]]]);
    }

    function toast( message, options ){
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'toast', [window.__HtMl_Id__, [message, options]]]);
    }
    function confirm(message, confirmCB, title, buttons) {
       var callBackID;
        if ( typeof message !== 'string' ) {
            return;
        };
    	if(confirmCB){
    		callBackID = bridge.callbackId(function (args){
	        	confirmCB(args);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'confirm', [window.__HtMl_Id__, [message, callBackID, title, buttons]]]);
    }
    function prompt(message, promptCB, title, tip, buttons)
    {
        var callBackID ;
        if(promptCB){
        	callBackID = bridge.callbackId(function (args){
	        	promptCB(args.index,args.message);
	        });
        }
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'prompt', [window.__HtMl_Id__, [message, callBackID, title, tip, buttons]]]);
    }

    function pickDate( successCallback, errorCallback, options ) {
        var nativeOptions = {};
        if ( options ) {
            if ( options.minDate instanceof Date ) { 
                nativeOptions.startYear = options.minDate.getFullYear();
                nativeOptions.startMonth = options.minDate.getMonth();
                nativeOptions.startDay= options.minDate.getDate();
            } else if ( tools.isNumber(options.startYear) ) {
                nativeOptions.startYear = options.startYear;
                nativeOptions.startMonth = 0;
                nativeOptions.startDay= 1;
            } 
            if ( options.maxDate instanceof Date ) { 
                nativeOptions.endYear = options.maxDate.getFullYear();
                nativeOptions.endMonth = options.maxDate.getMonth();
                nativeOptions.endDay= options.minDate.getDate();
            } else if ( tools.isNumber(options.endYear) ) {
                nativeOptions.endYear = options.endYear;
                nativeOptions.endMonth = 11;
                nativeOptions.endDay= 31;
            } 

            if ( options.date instanceof Date ) { 
                nativeOptions.setYear = options.date.getFullYear();
                nativeOptions.setMonth = options.date.getMonth();
                nativeOptions.setDay = options.date.getDate();
            }

            nativeOptions.popover = options.popover;
            nativeOptions.title = options.title;
        }

        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            successCallback(date);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callBackID = bridge.callbackId(success, fail);
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickDate', [window.__HtMl_Id__, [callBackID, nativeOptions]]]);
    }
                                      
    function pickTime( successCallback, errorCallback, options ) {
        var needRecover = false;
        if ( typeof options === 'object' ) {
            var time = options.time;
            if ( time instanceof Date ) {
                options.__hours = time.getHours();
                options.__minutes = time.getMinutes();
                needRecover = true;
            }
        }
        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            successCallback(date);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callBackID = bridge.callbackId(success, fail);
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickTime', [window.__HtMl_Id__, [callBackID,options]]]);
        if ( needRecover ) {
            delete options.__hours;
            delete options.__minutes;
        };
    }

    function createWindow(url, options )
    {
        var nWin = new plus.ui.NWindow(url, options );
        return nWin;
    }
    var __nviews__ = {};
    function register(identity,fun){
        __nviews__[identity] = fun;
    }
    function createView(identity,options){
        var ret = new __nviews__[identity](options);
        if (options) {                             
           ret.id = options.id;
        }
                                     
        mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'createView',[window.__HtMl_Id__,[identity,ret.__uuid__,options,ret.__callback_id__]]]);
        //mkey.exec(_PLUSNAME,_ExecMethod,[identity, ret.__uuid__,'createView',options]);
        return ret;
    }

    function closeWindow (pWin, aniType)
    {
        if(pWin){
            pWin.close(aniType);                  
        }
    }
    function enumWindow ()
    {
        var _json_windows_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'enumWindow', [window.__HtMl_Id__]]);
        var _stack_ = [];
        var _json_stack_ = {};
        //if(_NWindow_Stack.length != _json_windows_.length)
        {//对比js层页面栈数据与native层数据是否一致
            for(var i = 0;i < _json_windows_.length; i++)
            {
                var _json_window_ = _json_windows_[i];//json 格式
                var _window = __JSON_Window_Stack[_json_window_.uuid];//从json栈获取指定uuid的nwindow
                
                if(_window == null || _window === undefined)
                {//当前js页面栈没有新创建的NWindow                    
                     _window  = new plus.ui.NWindow(null,null,true);
                     _window.__uuid__ = _json_window_.uuid;
                    mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
                }
                _stack_.push(_window);
                _json_stack_[_window.__uuid__] = _window;
            }
            //_NWindow_Stack = _stack_;
            __JSON_Window_Stack = _json_stack_;
        }
        return _stack_;
        //创建一个新的NWindow数组，以免内部数值受到影响
       // return _NWindow_Stack.slice(0);
    }
    function findWindowByName(_name)
    {
        var _json_window_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'findWindowByName',[window.__HtMl_Id__,[_name]]] );
                                      
        if(_json_window_)
        {
            var _window = __JSON_Window_Stack[_json_window_.uuid];
            if(_window == null){
                _window  = new plus.ui.NWindow(null, null,true);
                _window.__uuid__ = _json_window_.uuid;
                mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
            }
            return _window;
        }
    }
    function getSelfWindow()
    {     
        var __window__ = __JSON_Window_Stack[window.__HtMl_Id__];  
        if(__window__ == null || __window__ === undefined)
        {
               __window__  = new plus.ui.NWindow(null,null,true);
               __window__.__uuid__ = window.__HtMl_Id__;
              // _NWindow_Stack.push(__window__);
               __JSON_Window_Stack[__window__.__uuid__] = __window__;
               mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[__window__.__uuid__,[__window__.__callback_id__]]]);
            
        }
       return __window__;              
    }
    
    function closeSplashscreen(){
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'closeSplashscreen', [0]]);
    }

    function setFullscreen (fullscreen) {
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setFullscreen', [fullscreen]]);
    }

    function exec(nview,action,actionArgs){
        mkey.exec(_PLUSNAME, _ExecMethod, [nview.__IDENTITY__,action,[nview.__uuid__, actionArgs]]);
    }

    function execSync(nview,action,actionArgs){
        return mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [nview.__IDENTITY__,action,[ nview.__uuid__,actionArgs]]);
    }
    
    function WaitingView( title, options ){
    	this.__uuid__ = window.plus.tools.UUID('WaitingView');
    	this.onclose = null;
    	var me = this;
    	var oncloseCallbackId = bridge.callbackId(function (){
        		if( typeof me.onclose === 'function' ){
        			me.onclose();
        		}
        	});
    	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView', [this.__uuid__,[title, options,oncloseCallbackId]]]);
    }
    WaitingView.prototype.close = function  () {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_close', [this.__uuid__]]);
    }
    WaitingView.prototype.setTitle = function  (title) {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_setTitle', [this.__uuid__,[title]]]);
    }
    function createWaiting( title, options ){
        return new WaitingView( title, options );
    }

    function isFullscreen (){
        return  mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'isFullScreen', [0]]);      
    }

    plus.ui = {
        createWaiting:createWaiting,
        pickTime:pickTime,
        pickDate:pickDate,
        alert:alert,
        confirm:confirm,
        prompt:prompt,
        toast:toast,
        findWindowByName:findWindowByName,
        closeWindow:closeWindow,
        createWindow:createWindow,
        getSelfWindow:getSelfWindow,
        enumWindow:enumWindow,
        register:register,
        createView:createView,
        exec:exec,
        execSync:execSync,
        closeSplashscreen:closeSplashscreen,
        setFullscreen:setFullscreen,
        isFullscreen :isFullscreen,
        __pushWindow__:__pushWindow__,
        __popWindow__:__popWindow__,
        __nviews__:__nviews__
    };
})(window.plus);
(function(ui){
    var bridge = plus.bridge;
    function NView(type){
        this.__IDENTITY__ = type;
        this.__uuid__ = window.plus.tools.UUID(type);
        this.id;
        plus.obj.Callback.call(this);
    }
    NView.prototype.getMetrics = function(callback){
        var callBackID;
        if(callback){
        	callBackID = bridge.callbackId(function (args){
        		callback(args);
        	});
            ui.exec(this, 'getMetrics',[callBackID, window.__HtMl_Id__] );
        }
    }
    NView.prototype.onCallback = function (fun,evt,args) {
        fun(args);
    }
    
   NView.prototype.addEventListener = function(eventType, callback,capture)
    {
        var notice = plus.obj.Callback.prototype.addEventListener.apply(this,[eventType, callback,capture]);
        if(notice){
            var args = [eventType, window.__HtMl_Id__];
            ui.exec(this,'addEventListener',args );
        }
    };
    NView.prototype.removeEventListener = function(eventType, callback)
    {
        var notice = plus.obj.Callback.prototype.removeEventListener.apply(this,[eventType, callback]);
        if(notice){
            var args = [eventType, window.__HtMl_Id__];
            ui.exec(this,'removeEventListener',args );
        }
    };

    ui.NView = NView;
})(window.plus.ui);

(function(ui){
    var IDENTITY = 'NWindow';
    var bridge = plus.bridge;
    function NWindow(url, options ,capture)
    {
        this.__view_array__ = new Array;
        ui.NView.prototype.constructor.apply(this, [IDENTITY]);
        if(!capture){//是否调用到native层
        	ui.__pushWindow__(this);
            ui.exec( this, IDENTITY,[url, options,this.__callback_id__, window.location.href] );
        }
    }
	var bProto = NWindow.prototype;
    plus.tools.extend(bProto,ui.NView.prototype);
    //plus.tools.extend(bProto,plus.obj.Callback.prototype);
    bProto.constructor = NWindow;
   
    bProto.show = function(aniShow,duration,assWin)
    {
        ui.exec(this, 'show',[aniShow,duration,assWin] );
    }
    bProto.close = function(aniType,duration)
    {
		plus.bridge.callbackFromNative(this.__callback_id__,{status:plus.bridge.OK,message:{evt:'close'},keepCallback:true});//执行close事件

        ui.__popWindow__(this);
        ui.exec(this, 'close', [aniType,duration]);
    };
    bProto.setOption = function( pOptions )
    { 
       ui.exec(this, 'setOption',[pOptions] );
    };
    bProto.setVisible = function(bVisable)
    {
        ui.exec(this, 'setVisible', [bVisable]);
    };
    bProto.setPreloadJsFile = function(jsfile){
        ui.exec(this, 'setPreloadJsFile', [jsfile]);
    };
    bProto.appendPreloadJsFile = function(jsfile){
        ui.exec(this, 'appendPreloadJsFile', [jsfile]);
    };
    bProto.setContentVisible = function(bVisable){
        ui.exec(this, 'setContentVisible', [bVisable]);
    };
    bProto.getUrl = function(){
        return ui.execSync(this, 'getUrl', []);
    };

    bProto.getTitle = function(){
        return ui.execSync(this, 'getTitle', []);
    };

    bProto.getOption = function()
    { 
        return ui.execSync(this, 'getOption');
    };
    bProto.load = function(url)
    {
        ui.exec(this, 'load', [url, window.location.href]);
    };
    bProto.stop = function() {
        ui.exec(this, 'stop', []);
    };
    bProto.reload = function(force) {
        ui.exec(this, 'reload', [force]);
    };

    bProto.back = function() {
        ui.exec(this, 'back', []);
    };
    bProto.forward = function() {
        ui.exec(this, 'forward', []);
    };

    bProto.canBack = function(cb) {
        var callBackID;
        if(cb){
            callBackID = bridge.callbackId(function (args){
                cb(args);
            });
        }
        ui.exec(this, 'canBack',[callBackID] );
    };
    bProto.canForward = function(cb) {
        var callBackID;
        if(cb){
            callBackID = bridge.callbackId(function (args){
                cb(args);
            });
        }
        ui.exec(this, 'canForward',[callBackID] );
    };

    bProto.clear = function()
    {
        ui.exec(this, 'clear', []);
    };
    bProto.evalJS = function(script)
    {
        ui.exec(this, 'evalJS',[script] );
    };
   
    bProto.append = function(extView){
        this.__view_array__.push(extView);
        ui.exec(this,'append',[extView.__IDENTITY__,extView.__uuid__]);
    }
    bProto.setPullToRefresh = function(options,refreshCB){
        var callbackId ;
        if(refreshCB){
           callbackId = plus.bridge.callbackId(refreshCB);
        }
        this.addEventListener('pulldownrefreshevent',refreshCB,false);
        ui.exec(this,'setPullToRefresh',[options,callbackId]);
    }
    bProto.endPullToRefresh = function(){
        ui.exec(this,'endPullToRefresh',[]);
    }
    bProto.findViewById = function(id){
        var size = this.__view_array__.length;
        for(var i = size - 1; i >= 0; i--){
            var view = this.__view_array__[i];
            if(id == view.id){
                return view;
            }
        }
        var viewJson = ui.execSync(this,'findViewById',[id] );
        var identity = viewJson.identity;
        var options = viewJson.option;
        var uuid = viewJson.uuid;
        var ret = new plus.ui.__nviews__[identity](options);
        ret.__uuid__ = viewJson.uuid;
        this.__view_array__.push(ret);
        return ret;
    }
    ui.NWindow = NWindow;
})(plus.ui);

;(function(ui){
    var identity = 'Navigator';
    ui.register(identity,Navigator);
    
    function Navigator () {
       ui.NView.prototype.constructor.apply(this,['Navigator']);
       plus.obj.Callback.prototype.constructor.apply(this);
    }
	var navProto = Navigator.prototype;
    navProto.constructor = Navigator;
    plus.tools.extend(navProto,ui.NView.prototype);

    navProto.setLeft = function(option){
        ui.exec(this,'setLeft',[option]);
    }
    navProto.setRight = function(option){
         ui.exec(this,'setRight',[option]);
    }
    
	navProto.setSystemList = function(option){
        ui.exec(this,'setSystemList',[option]);
    }
	navProto.setRight = function(option){
        ui.exec(this,'setRight',[option]);
    }
    navProto.addNavigationListener = function(callback){
        var callbackId = plus.bridge.callbackId(callback);
        ui.exec(this,'addNavigationListener',[callbackId]);
    }

    navProto.addListItemListener = function(callback){
        var callbackId = plus.bridge.callbackId(callback);
        ui.exec(this,'addListItemListener',[callbackId]);
    }

    navProto.setTitleText = function(text){
        ui.exec(this,'setTitleText',[text]);
    }

    navProto.setList = function(options){

        ui.exec(this,'setList',[options]);
    }

    ui.Navigator = Navigator;
})(plus.ui);

;(function(plus){
    var B = plus.bridge,
        T = plus.tools,
        service = "Orientation",
		running = false,// Is the accel sensor running?
		timers = {},// Keeps reference to watchAcceleration calls.
		listeners = [],// Array of listeners; used to keep track of when we should call start and stop.
		accel = null, // Last returned orientation object from event
		Rotation = function(x, y, z, m, t, h) {
			this.alpha = x;
			this.beta = y;
			this.gamma = z;
            this.magneticHeading = m;
            this.trueHeading = t;
            this.headingAccuracy = h;
        },
        magneticHeading = undefined,
        trueHeading = undefined,
        headingAccuracy = undefined;

    function DeviceOrientationHandle(event){
        var tempListeners = listeners.slice(0);
        accel = new Rotation(event.alpha, event.beta, event.gamma, magneticHeading, trueHeading, headingAccuracy );
        for (var i = 0, l = tempListeners.length; i < l; i++) {
            tempListeners[i].win(accel);
        }
    }

    function start() {
        if(T.platform != T.ANDROID){
           window.addEventListener("deviceorientation", DeviceOrientationHandle, false);
        }
        var callbackid = B.callbackId(function(a) {
            magneticHeading = a.magneticHeading;
            trueHeading = a.trueHeading;
            headingAccuracy = a.headingAccuracy;
            if(T.platform == T.ANDROID){
                DeviceOrientationHandle(a);
            }
        }, function(e) {
            var tempListeners = listeners.slice(0);
            for (var i = 0, l = tempListeners.length; i < l; i++) {
               // tempListeners[i].fail(e);
            }
        });
        B.exec(service, "start", [callbackid]);
        running = true;
    }

    function stop() {
        if(T.platform != T.ANDROID){
            window.removeEventListener("deviceorientation", DeviceOrientationHandle, false);
        }
        B.exec(service, "stop", []);
        running = false;
    }

    // Adds a callback pair to the listeners array
    function createCallbackPair(win, fail) {
        return {win:win, fail:fail};
    }

    // Removes a win/fail listener pair from the listeners array
    function removeListeners(l) {
        var idx = listeners.indexOf(l);
        if (idx > -1) {
            listeners.splice(idx, 1);
            if (listeners.length === 0) {
                stop();
            }
        }
    }

    var orientation = {
        /**
         * Asynchronously acquires the current orientation.
         *
         * @param {Function} successCallback    The function to call when the orientation data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the orientation data. (OPTIONAL)
         */
        getCurrentOrientation: function(successCallback, errorCallback) {
            var p;
            var win = function(a) {
                removeListeners(p);
                successCallback(a);
            };
            var fail = function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            };

            p = createCallbackPair(win, fail);
            listeners.push(p);

            if (!running) {
                start();
            }
        },

        /**
        * Asynchronously acquires the orientation repeatedly at a given interval.
        *
         * @param {Function} successCallback    The function to call each time the orientation data is available
         * @param {Function} errorCallback      The function to call when there is an error getting the orientation data. (OPTIONAL)
         * @param {OrientationOptions} options The options for getting the orientation data such as timeout. (OPTIONAL)
         * @return String                       The watch id that must be passed to #clearWatch to stop watching.
         */
        watchOrientation: function(successCallback, errorCallback, options) {
            // Default interval (10 sec)
            var frequency = (options && options.frequency && (typeof options.frequency == 'number'|| options.frequency instanceof Number)) ? options.frequency : 500;

            // Keep reference to watch id, and report accel readings as often as defined in frequency
            var id = T.UUID('watch');

            var p = createCallbackPair(function(){}, function(e) {
                removeListeners(p);
                errorCallback && errorCallback(e);
            });
            listeners.push(p);

            timers[id] = {
                timer:window.setInterval(function() {
                    if (accel) {
                        successCallback(accel);
                    }
                }, frequency),
                listeners:p
            };

            if (running) {
                // If we're already running then immediately invoke the success callback
                // but only if we have retrieved a value, sample code does not check for null ...
                if (accel) {
                    successCallback(accel);
                }
            } else {
                start();
            }

            return id;
        },

        /**
        * Clears the specified orientation watch.
        *
        * @param {String} id       The id of the watch returned from #watchOrientation.
        */
        clearWatch: function(id) {
            // Stop javascript timer & remove from timer list
            if (id && timers[id]) {
                window.clearInterval(timers[id].timer);
                removeListeners(timers[id].listeners);
                delete timers[id];
            }
        }
    };

    plus.orientation = orientation;
})(window.plus);;
(function(plus){
    var _PAYMENT = 'Payment',
		B = window.plus.bridge;
    function Channel (){
        this.id = '';
        this.description = '',
        this.serviceReady = true,
        this.installService = function(){
            B.exec( _PAYMENT, "installService", [this.id] );
        }
    }
    var payment = {
        Channel : Channel,
        getChannels : function( successCallback, errorCallback ){
            var success = typeof successCallback !== 'function' ? null : function(channels) {
                var ret = [],
					len = channels.length;
                for(var i = 0; i < len; i++){
                    var channel = new payment.Channel();
                    channel.id = channels[i].id;
                    channel.description = channels[i].description;
                    channel.serviceReady = channels[i].serviceReady;
                    ret[i] = channel;
                }
                successCallback(ret);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                var err = {};
                
                errorCallback(error);
            };
            var callbackId =  B.callbackId( success, fail );
            
            B.exec( _PAYMENT, "getChannels", [callbackId] );
        },
        request : function(channel, statement, successCallback, errorCallback){
            var success = typeof successCallback !== 'function' ? null : function(strings) {
                successCallback(strings);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                errorCallback(error);
            };

            if ( !(channel instanceof Channel)  ) {
                window.setTimeout( function(){
                    fail({code:62000});
                },0);
                return;
            };

            var callbackId =  B.callbackId( success, fail );
            B.exec( _PAYMENT, "request", [channel.id,statement,callbackId] );
        }
    };
    plus.payment = payment;
})(window.plus);;__Mkey__Push__ = (function(){

    var callback = [],
		__mkey__Push__ = 
    {
        pushCallback_Push :  function (id,fun,nokeep)
        {
            callback[id] = { fun:fun, nokeep:nokeep};
        },
        execCallback_Push : function (id,eventType,args)
        {
            if (callback[id] )
            {
                if (callback[id].fun)
                {                                                    
                    if(eventType == 'click')
                    {
                        //此时为pagewindow
                        callback[id].fun(args);
                    }
                    else
                    {
                        callback[id].fun(args);
                    }
                }
            }     
        },
    };
    return __mkey__Push__;
})();
(function(plus)
{
    var mkey = window.plus.bridge,
		tools = window.plus.tools,
		_PUSHG = "Push";
    plus.push = {
        getClientInfo:function()
        {
            var eaToken = mkey.execSync(_PUSHG, 'getClientInfo', []);
            //alert(eaToken);
            return eaToken;
        }, 
        createMessage:function( message, Payload, Option)
        {
            if(tools.platform == tools.IOS){
                mkey.exec(_PUSHG, 'createMessage', [message, Payload, Option]);
            }else{
                var message = new Message(message, Payload, Option);
                var uuid = mkey.execSync(_PUSHG, 'createMessage', [message]);
                message.__UUID__ = uuid;
            }  
        },
        clear:function()
        {
            mkey.exec(_PUSHG, 'clear',[]);
        },
        addEventListener:function( type, Listener, capture)
        {
            var Udid = tools.UUID(type);
            __Mkey__Push__.pushCallback_Push(Udid, Listener, capture);
            mkey.exec(_PUSHG, 'addEventListener', [window.__HtMl_Id__, Udid, type]);
        },
        remove:function(message)
        {
            mkey.exec(_PUSHG, 'remove', [message.__UUID__]);
        },
        getAllMessage:function()
        {
            return mkey.execSync(_PUSHG, 'getAllMessage', []);
        },
        setAutoNotification:function(auto){
            mkey.exec(_PUSHG, 'setAutoNotification', [auto]);
        },
    };
    function Message(message , Payload, options){
        this.__UUID__ = null;
        this.message = message;
        this.Payload = Payload;
        this.options = options
    }

})(window.plus);;(function(plus){
    var B = window.plus.bridge,
		_PLUSNAME = 'Runtime';
	plus.runtime = {
			arguments:null,
			version:null,
			innerVersion:null,
			restart:function(){
				B.exec(_PLUSNAME,'restart',[]);
			},
			install:function(SusFilePath,widgetOptions,SuccessCallback,ErrorCallback)
			{
				var callbackid = B.callbackId(SuccessCallback,ErrorCallback);
				B.exec(_PLUSNAME,'install',[SusFilePath,callbackid,widgetOptions]);
			},
			getProperty:function(appid,propertyCallback){
				var callbackid = B.callbackId( propertyCallback );
			B.exec( _PLUSNAME, 'getProperty', [appid,callbackid] );
			},
		  quit : function(){    
			B.exec(_PLUSNAME,'quit',[]);
		  },
		  openURL : function (url, errorCB,identity)
				  {
		          var callbackid = B.callbackId( null,function(code){
		              if( 'function' === typeof(errorCB)){
		              errorCB(code);
		              }
		          });
					B.exec(_PLUSNAME, 'openURL', [url,callbackid, identity] );
				  },
		  launchApplication : function (appInf, errorCB)
				  {
					var callbackid = B.callbackId( null,function(code){
						  if( 'function' === typeof(errorCB)){
							errorCB(code);
						  }
					});
					B.exec(_PLUSNAME, 'launchApplication', [appInf, callbackid] );
				  },
		  setBadgeNumber: function(badgeNumber){
				  if ('number' == typeof(badgeNumber)) {
					  B.exec(_PLUSNAME, 'setBadgeNumber', [badgeNumber] );
				  }
				},
		  openFile: function(filepath,options,errorCB){
				  var callbackid = B.callbackId( null,function(code){
						  if( 'function' === typeof(errorCB)){
							errorCB(code);
						  }
					});
				   B.exec(_PLUSNAME, 'openFile', [filepath,options,callbackid] );
				},
		};
})(window.plus);
;
(function(plus){
    var B = plus.bridge,
		T = plus.tools,
		shareF = 'Share',
		services = {};

    function GeoPosition(){
        this.latitude = null;
        this.longitude = null;
    }

    function ShareMessage(){
        this.content = null;
        this.url = [];
        this.pictures = null;
        this.accessToken = null;
        this.geo = null;
    }

    function ShareService(id, description, authenticated, accessToken){
        this.id = id;
        this.description = description;
        this.authenticated = authenticated;
        this.accessToken = accessToken;
        this.nativeClient = false;
    }
	var sharProto = ShareService.prototype;
    sharProto.authorize = function(successCallback, errorCallback) {
        var me = this;
        var success = typeof successCallback !== 'function' ? null : function(args) {
            me.authenticated = args.authenticated;
            me.accessToken = args.accessToken;
            successCallback(me);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callbackID = B.callbackId(success, fail);
        B.exec(shareF, "authorize", [callbackID, this.id]);
    };

    sharProto.forbid = function() {
        this.authenticated = false;
        this.accessToken = null;
        B.exec(shareF, "forbid", [this.id]);
    };

    sharProto.send = function(msg, successCallback, errorCallback) {
        var success = typeof successCallback !== 'function' ? null : function(args) {
            successCallback();
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            errorCallback(code);
        };
        var callbackID = B.callbackId(success, fail);
        B.exec(shareF, "send", [callbackID, this.id, msg]);
    };

    function Authorize(id,display) {
        var me = this;
        me.__UUID__ = T.UUID('Authorize');
        me.__componentid__ = id;
        me.display = display;
        me.onloaded = null;
        me.onauthenticated = null;
        me.onerror = null;
        me.__top__ = 0;
        me.__left__ = 0;
        me.__width__ = 0;
        me.__height__ = 0;
        {
            var left = 0, top = 0, width = 0, height = 0;
            var div = document.getElementById(me.__componentid__);
            if (div) {
                me.__left__ = div.offsetLeft; me.__top__ = div.offsetTop;
                me.__width__ = div.offsetWidth; me.__height__ = div.offsetHeight;
            }
            var fail = function(code) {
                if ( typeof me.onerror === 'function' ) {
                    me.onerror(code);
                }
            };
            var success = function(args) {
                if ( 'load' == args.evt ) {
                    if ( typeof me.onloaded === 'function' ) {
                        me.onloaded();
                    }
                } else if ( 'auth' == args.evt ) {
                    if ( typeof me.onauthenticated === 'function' ) {
                        plus.share.getServices(function ( services ){ 
                            for (var i = 0; i < services.length; i++) {
                                var service = services[i];
                                if ( service.id == args.type ) {
                                    service.authenticated = args.authenticated;
                                    service.accessToken = args.accessToken;
                                    me.onauthenticated(service);
                                    break;
                                }
                            };
                        }, function( code){
                            fail(code);
                        });
                    }
                }
            };
            var callbackID = B.callbackId(success, fail);
            B.exec(shareF, "create", [me.__UUID__,  callbackID, me.display, me.__left__, me.__top__, me.__width__, me.__height__]);
        }
    }

    Authorize.prototype.load = function (id) {
        this.id = id;
        B.exec(shareF, "load", [this.__UUID__, id]);
    }

    Authorize.prototype.setVisible = function(visible){
        B.exec(shareF, "setVisible", [this.__UUID__, visible]);
    }

    var share = {
        Authorize   : Authorize,
        getServices : function(successCallback, errorCallback) {
            var success = typeof successCallback !== 'function' ? null : function(args) {
                var retServers = [];
                for (var i = 0; i < args.length; i++) {
                    var payload = args[i];
                    if ( payload.id ) {
                        var expSer = services[payload.id];
                        if ( expSer ) {
                        } else {
                            expSer = new ShareService();
                        }
                        expSer.id = payload.id;
                        expSer.description = payload.description;
                        expSer.authenticated = payload.authenticated;
                        expSer.accessToken = payload.accessToken;
                        expSer.nativeClient = payload.nativeClient;
                        services[payload.id] = expSer;
                        retServers.push(expSer);
                    }
                }
                successCallback(retServers);
            };
            var fail = typeof errorCallback !== 'function' ? null : function(code) {
                errorCallback(code);
            };
            var callbackID = B.callbackId(success, fail);
            B.exec(shareF, "getServices", [callbackID]);
        }
    };
    plus.share = share;
})(window.plus);        ;
(function(plus){
    var _SPEECHF = 'Speech',
		bridge = window.plus.bridge,
		speech = {
        startRecognize : function( options, successCallback, errorCallback ){
            var success = typeof successCallback !== 'function' ? null : function(strings) {
                successCallback(strings);
            };
            var fail = typeof errorCallback !== 'function' ? null : function( error ) {
                errorCallback(error);
            };
            var callbackId =  bridge.callbackId( success, fail );
            var eventCallbackIds = {};
            
            if(options.onstart){
            	var os = typeof options.onstart !== 'function' ? null : function() {
	                options.onstart();
	            };
            	eventCallbackIds.onstart = bridge.callbackId( os );
            }
            
            if(options.onend){
            	var oe = typeof options.onend !== 'function' ? null : function() {
	                options.onend();
	            };
            	eventCallbackIds.onend = bridge.callbackId( oe );
            }
            bridge.exec( _SPEECHF, "startRecognize", [callbackId, options,eventCallbackIds] );
        },
        stopRecognize : function(){
            bridge.exec( _SPEECHF, "stopRecognize", [] );
        }
    };
    plus.speech = speech;
})(window.plus);;
(function(plus){
    var bridge = plus.bridge,
		F = 'Statistic';
    plus.statistic = {
        eventTrig : function(id, label) {
            bridge.exec(F, 'eventTrig', [id, label]);
        },
        eventStart : function(id, label) {
            bridge.exec(F, 'eventStart', [id, label]);
        },
        eventEnd : function(id, label) {
            bridge.exec(F, 'eventEnd', [id, label]);
        },
        eventDuration : function(id, duration, label) {
            bridge.exec(F, 'eventDuration', [id, duration, label]);
        }
    };
})(window.plus);        ;
(function(plus){
    var bridge = window.plus.bridge,
		_STORAGEF = 'Storage';
	plus.storage = {
		getLength: function() {
			return bridge.execSync(_STORAGEF, 'getLength', [null]);
		},

		getItem: function (key){
			if ( typeof(key) == 'string' ) {
				return bridge.execSync(_STORAGEF, 'getItem', [key], function(r){
					try{
						var reslut = window.eval(r);
						if ( null == reslut ) {return null;}
						return r;
					} catch (e) {return r;}
					return r;
				});
			}
			return false;
		},

		setItem : function (key, value){
			if ( typeof(key) == 'string' && typeof(value) == 'string' ) {
				return bridge.execSync(_STORAGEF, 'setItem', [key, value]);
			}
			return false;
		},

		removeItem : function (key){
			if ( typeof(key) == 'string' ) {
				return bridge.execSync(_STORAGEF, 'removeItem', [key]);
			}
			return false;
		},

		clear : function(){
			return bridge.execSync(_STORAGEF, 'clear', [null]);
		},

		key : function(index){
			if ( typeof(index) == 'number' ) {
				return bridge.execSync(_STORAGEF, 'key', [index]);
			}
			return false;
		}
	};
})(window.plus);;
(function(plus){
    var bridge = window.plus.bridge,
        tools = window.plus.tools,
		helper = {
			UUID: function (){
				return tools.UUID('uploader');
			},
			server: 'Uploader',
			getValue: function (value, defaultValue) {
				return value === undefined ? defaultValue : value;
			}
		};
    

    function EvtPool(type, listener, capture){
        this.type = helper.getValue(type, '');
        this.handles = [];
        this.capture = helper.getValue(capture, false);
        if ( 'function' == typeof(listener) ) {
            this.handles.push(listener);
        }
    }

   EvtPool.prototype.fire = function(e) {
        for (var i = 0; i < this.handles.length; ++i) {
            this.handles[i].apply(this, arguments);
        }
    };

    function Upload(url, options, evt) {                              
        this.__UUID__ = helper.UUID();
        this.url = helper.getValue(url, '');
        this.state = 0;
        this.options = options || {};
        this.uploadedSize = 0;
        this.totalSize = 0;
        this.responseText = '';
        this.method = helper.getValue(this.options.method, 'GET');
        this.timeout = helper.getValue(this.options.timeout, 120);
        this.retry = helper.getValue(this.options.retry, 3);
        this.priority = helper.getValue(this.options.priority, 1);
        this.onCompleted = evt || null;
        this.eventHandlers = {};
    }

    Upload.prototype.addFile = function(path, options) {
        if ( 'string' == typeof(path) && 'object' == typeof(options)) {
            bridge.exec(helper.server, 'addFile', [this.__UUID__, path, options]);
            return true;
        }
        return false;
    };

    Upload.prototype.addData = function(key, value) {
        if ( 'string' == typeof(key) && 'string' == typeof(value)) {
            bridge.exec(helper.server, 'addData', [this.__UUID__, key, value]);
            return true;
        }
        return false;
    };

    Upload.prototype.start = function() {
        bridge.exec(helper.server, 'start', [this.__UUID__]);
    };

    Upload.prototype.pause = function() {
        bridge.exec(helper.server, 'pause', [this.__UUID__]);
    };

    Upload.prototype.resume = function() {
        bridge.exec(helper.server, 'resume', [this.__UUID__]);
    };

    Upload.prototype.abort = function() {
        bridge.exec(helper.server, 'abort', [this.__UUID__]);
    };
                                                     
    Upload.prototype.addEventListener = function(type, listener, capture ) {                                          
        if ( 'string' == typeof(type) && 'function' == typeof(listener)) {
            var e = type.toLowerCase();
            if ( undefined ===  this.eventHandlers[e]) {
                this.eventHandlers[e] = new EvtPool(type, listener, capture);
            } else {
                this.eventHandlers[e].handles.push(listener);
            }
        }
    };

    Upload.prototype.__handlerEvt__ = function (args) {
        //args = {state:0,status:200,filename:'filename'}
        var me = this;
        me.state = helper.getValue(args.state, me.state);
        me.uploadedSize = helper.getValue(args.uploadedSize, me.uploadedSize);
        me.totalSize = helper.getValue(args.totalSize, me.totalSize);
        
        if ( 4 == me.state && typeof me.onCompleted === "function" ) {
            me.responseText = helper.getValue(args.responseText, me.responseText);
            me.onCompleted(me, args.status || null);
        }
        var evt = this.eventHandlers['statechanged'];
        if ( evt  ) {
            evt.fire(me, args.status || null);
        }
    };

    plus.uploader= {
        __taskList__: {},
		createUpload : function(url, options, evt){
			if ( 'string' ==  typeof(url) ) {
				var upload = new Upload(url, options, evt);
				this.__taskList__[upload.__UUID__] = upload;
				bridge.exec(helper.server, 'createUpload', [upload]);
				return upload;
			}
			return null; 
		},

		enumerate : function (callback, state) {
			var me = this;
			var taskList = me.__taskList__;
			var callbackid = bridge.callbackId( function(args){
				for (var i = 0; i < args.length; i++) {
					var taskData = args[i];       
					if ( taskData && taskData.uuid ) {                             
						var task = taskList[taskData.uuid];                          
						if ( task ) { } else {                    
							task = new Upload();
							task.__UUID__ = taskData.uuid;              
							taskList[task.__UUID__] = task;
						}
						task.state = helper.getValue(taskData.state, task.state);
						task.options = helper.getValue(taskData.options, task.options);;
						task.url = helper.getValue(taskData.url, task.url);
						task.uploadedSize = helper.getValue(taskData.uploadedSize, task.uploadedSize);
						task.totalSize = helper.getValue(taskData.totalSize, task.totalSize);
						task.responseText = helper.getValue(taskData.responseText, task.responseText);
					}
				}

				var toCall = [];
				for (var item in taskList ) {
					toCall.push(taskList[item]);
				}

				if ( 'function' == typeof(callback) ) {
					callback(toCall);
				}
			});
			bridge.exec(helper.server, 'enumerate', [callbackid]);
		},

		clear : function (processState) {
			var state = 4;
			if ( 'number' == typeof(processState) ) {
				state = processState; 
			}
			bridge.exec(helper.server, 'clear', [state]);
		},

		startAll : function () {
			bridge.exec(helper.server, 'startAll', [0]);
		},

		__handlerEvt__ : function (uuid, args) {
			var task = this.__taskList__[uuid];
			if (task) {
				task.__handlerEvt__(args);
			}
		}
    };
})(window.plus);

;(function(plus){
    var bridge = window.plus.bridge,
		_PLUSNAME = 'SUSF';
  	
  	plus.widget = {
  		restart:function(){
  			mkey.exec(_PLUSNAME,'restart',[]);
  		},
  		install:function(SusFilePath,widgetOptions,SuccessCallback,ErrorCallback)
        {
  			var callbackid = mkey.helper.callbackid(SuccessCallback,ErrorCallback);
  			mkey.exec(_PLUSNAME,'install',[SusFilePath,callbackid,widgetOptions]);
  		},
  		getProperty:function(appid,propertyCallback){
  			var funId = mkey.helper.callbackid(propertyCallback);
  			mkey.exec(_PLUSNAME,'getProperty',[appid,funId]);
  		}
  	};
})(window.plus);
;
(function(plus){

    var B = plus.bridge,
		T = plus.tools;

    function XMLHttpRequest(){
        this.__init__();
        this.__UUID__ = T.UUID('xhr');
    }

    XMLHttpRequest.Uninitialized = 0;
    XMLHttpRequest.Open = 1;
    XMLHttpRequest.Sent = 2;
    XMLHttpRequest.Receiving = 3;
    XMLHttpRequest.Loaded = 4;
    XMLHttpRequest.__F__ = 'XMLHttpRequest';
	var proto = XMLHttpRequest.prototype;

    proto.__init__ = function() {
        this.readyState = XMLHttpRequest.Uninitialized;
        this.responseText = '';
        this.responseXML = null;
        this.status = XMLHttpRequest.Uninitialized;
        this.statusText = null;
        this.onreadystatechange;
        this.responseType = null;
        this.response = null;
        this.__noParseResponseHeader__ = null;
        this.__requestHeaders__ = {};
        this.__responseHeaders__ = {};
        this.__cacheReponseHeaders__ = {};
    };

    proto.abort = function() {
        if ( this.readyState > XMLHttpRequest.Uninitialized ) {
            this.__init__();
            B.exec(XMLHttpRequest.__F__, 'abort', [this.__UUID__]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
        }
    };

    proto.getAllResponseHeaders = function() {
        if ( this.readyState >= XMLHttpRequest.Receiving ) {
            if ( this.__noParseResponseHeader__ ) {
                return this.__noParseResponseHeader__;
            }
            var header = '';
            for (var p in this.__responseHeaders__ ) {
                header = header + p + ' : ' + this.__responseHeaders__[p] + '\r\n';
            }
            this.__noParseResponseHeader__ = header;
            return this.__noParseResponseHeader__;
        }
        return null;
    };

    proto.getResponseHeader = function( headerName ) {
        if ( 'string' == typeof(headerName) 
            && this.readyState >= XMLHttpRequest.Receiving ) {
            var headerValue = null;
            headerName = headerName.toLowerCase();
            headerValue = this.__cacheReponseHeaders__[headerName];
            if ( headerValue ) {
                return headerValue;
            } else {
                for (var p in this.__responseHeaders__ ) {
                    var value = this.__responseHeaders__[p];
                    p = p.toLowerCase();
                    if ( headerName  === p ) {
                        if ( headerValue ) {
                            headerValue =  headerValue + ', ' + value;
                        } else {
                            headerValue = value;
                        }
                    }   
                }
                this.__cacheReponseHeaders__[headerName] = headerValue;
                return headerValue;
            }
        }
        return null;
    };

    proto.setRequestHeader = function( headerName, headerValue ) {
        if ( 'string' == typeof(headerName) 
            &&  'string' == typeof(headerValue) 
            && XMLHttpRequest.Open == this.readyState ) {
            var srcValue = this.__requestHeaders__[headerName];
            if ( srcValue ) {
                this.__requestHeaders__[headerName] = srcValue+', '+headerValue;
            } else {
                this.__requestHeaders__[headerName] = headerValue;
            }
        }
    };

    proto.open = function( method, url, username, password ) {
        if ( XMLHttpRequest.Open == this.readyState 
            || XMLHttpRequest.Loaded == this.readyState ) {
            this.__init__();
        } 
                                        
        if ( XMLHttpRequest.Uninitialized == this.readyState ) {
            this.readyState = XMLHttpRequest.Open;
            B.exec(XMLHttpRequest.__F__, 'open', [this.__UUID__, method, url, username, password]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
        }
    };

    proto.send = function( body ) {
        var me = this;
        if ( XMLHttpRequest.Open == this.readyState ) {
            this.readyState = XMLHttpRequest.Sent;
            var callbackid = B.callbackId( function(args){
                if ( XMLHttpRequest.Receiving == args.readyState ) {
                    if ( XMLHttpRequest.Sent == me.readyState ) {
                        me.readyState = XMLHttpRequest.Receiving;
                        me.status = args.status;
                        me.statusText = args.statusText;
                        me.__responseHeaders__ = args.header;
                    } else if (XMLHttpRequest.Receiving == me.readyState ) {
                        me.responseText = args.responseText;
                    }
                } else if ( XMLHttpRequest.Loaded == args.readyState ) {
                    me.readyState = XMLHttpRequest.Loaded;
                    try {
                        if ( me.responseText ) {
                            var parser= new DOMParser();
                            me.responseXML = parser.parseFromString(me.responseText,"text/xml");
                        }
                    } catch ( e ){
                        me.responseXML = null;
                    }
                    try {
                        if ( 'document' == me.responseType ) {
                            var parser= new DOMParser();
                            me.response = me.responseXML;
                        } else if ( 'json' == me.responseType ) {
                            me.response = JSON.parse(me.responseText);
                        }
                    } catch ( e ){
                        me.response = null;
                    }
                }

                if (typeof me.onreadystatechange === 'function') {
                    me.onreadystatechange();
                }
            });
            B.exec(XMLHttpRequest.__F__, 'send', [this.__UUID__, callbackid, body, this.__requestHeaders__]);
            if (typeof this.onreadystatechange === 'function') {
                this.onreadystatechange();
            }
            return;
        }
        throw new Error("XMLHttpRequest not open");
    };

    plus.net = {
        XMLHttpRequest : XMLHttpRequest
    };
})(window.plus);

;
(function(plus){
    var bridge = window.plus.bridge,
		_ZIPG = "Zip";
    plus.zip = {
         decompress:function(zipfile, targetPath, successCallback, failCallback) {
            var callBackID = bridge.callbackId(successCallback, failCallback);
            bridge.exec(_ZIPG, 'decompress', [zipfile, targetPath, callBackID]);
        }, 
        compress:function(srcPath, zipFile, successCallback, failCallback)
        {
            var callBackID = bridge.callbackId(successCallback, failCallback);
            bridge.exec(_ZIPG, 'compress', [srcPath, zipFile, callBackID]);
        }        
    };
})(window.plus);;(function(plus){
    var bridge = window.plus.bridge,
    tools  = window.plus.tools;
    _Server = "Invocation";
    _importHash = [];
    _frameObjHash = {};
    _currentFrameObj = null;

    var iosTools = {};
    var classTemplate = {};

    iosTools.undefObjectHash = {};
    var jsbDef='';
    if(plus.tools.IOS == plus.tools.platform){
        jsbDef += "plus.ios.";  
        
    }else if(plus.tools.ANDROID == plus.tools.platform){
        jsbDef += "plus.android.";  
    }

    iosTools.process = function( output ) {
        var args = [];
        for (var i = 0; i < output.length; i++) {
            args.push( this.warp(output[i]));
        }
        return args;
    };

    iosTools.attach = function ( className, fn ){
        var list = this.undefObjectHash[className];
        if ( list && fn ) {
            for (var i = 0; i < list.length; i++) {
                list[i].__proto__ = fn.prototype;
            };
            delete this.undefObjectHash.className;
        }  
    }
    iosTools.New = function ( args, pNative  ) {
        var inv = null;
        if ( args ) {
            if ( 'object' == args.type ){
                var fn = classTemplate.isImport(args.className);
                if ( fn ) {
                    inv = new fn();
                } else {
                    inv = new JSBBaseObject();
                    var list = this.undefObjectHash[args.className];
                    if ( !list ) {
                        this.undefObjectHash[args.className] = list = [];
                    }
                    list.push(inv);
                }
                inv.className = args.className;
                inv.__UUID__ = args.value;
                return inv;
            }
            return args.value;
        }
        return null;
    };
	iosTools.handleClassName = function(className){
		return className.replace('$','.');
	},
    iosTools.saveContent = function( fileName,content ) {
    	 bridge.execSync(_Server, '__saveContent', [fileName,content]);
    },
    iosTools.warp = function( arg ) {
        var wrapArg = {};
        if ( arg && 'JSBObject' == arg.__TYPE__ ) {
            wrapArg.type = 'object';
            wrapArg.value = arg.__UUID__;
        } else if ( arg instanceof JNBType ) {
            wrapArg.type = arg.type;
            wrapArg.value = arg.value;
        } else if ( 'undefined' == typeof(arg) || arg == null  ) {
            wrapArg.type = 'null';
            wrapArg.value = arg;
        } else if ( 'string' == typeof(arg) || 'String' == typeof(arg)) {
            wrapArg.type = 'string';
            wrapArg.value = arg;
        } else if ( 'number' == typeof(arg) ) {
            wrapArg.type = 'number';
            wrapArg.value = arg;
        } else if ('boolean' == typeof(arg)) {
            wrapArg.type = 'boolean';
            wrapArg.value = arg;
        } else {
            wrapArg = arg;
        } 
        return wrapArg;
    };

    function JNBType(type , value) {
        this.type = type;
        this.value = value;
    }
    JNBType.prototype.constructor = JNBType;

    function JSBBaseObject () {
        this.__TYPE__ = 'JSBObject';
        this.__UUID__ = tools.UUID('JSBaseObject');
    }

    JSBBaseObject.prototype.plusSetAttribute = function () {
        var ret = null;
        try {
            var args = [];
            for (var i = 1; i < arguments.length; i++) {
                args.push( iosTools.warp(arguments[i]));
            }
            ret = window.plus.bridge.execSync(_Server, '__plusSetAttribute', [this.__UUID__, arguments[0], args]);
            ret = iosTools.New(ret, true);
        } catch (e) {
            throw e;
        }
        return ret;
    };
    JSBBaseObject.prototype.plusGetAttribute = function (name){
        var ret = null;
        try {
            ret = window.plus.bridge.execSync(_Server, '__plusGetAttribute', [this.__UUID__, name]);
            ret = plus.ios.__Tool.New(ret, true);
        } catch (e) {
            throw e;
        }
        return ret;
    };

    JSBBaseObject.prototype.plusCallMethod = function ( arg ){
        var ret = null;
        try {
            var methodName = '';
            var args = [];
            var index = 0;
            for (var p in arg) {
                if ('string' != typeof(p)) {
                    return;
                } 
                var v = arg[p];
                if ( 0 == index ) {
                    methodName = p;
                    if ( 'undefined' == typeof(v)  ) {
                        index++;
                        break;
                    } else {
                        methodName += ':'
                    }
                } else {
                    methodName += ( p +':');
                }
                args.push(v);
                index++;
            }

            if ( 0 == index ) {
                return;
            }

            var args = window.plus.ios.__Tool.process(args);
            ret = window.plus.bridge.execSync( _Server, '__exec', [this.__UUID__, methodName , args]);
            ret = plus.ios.__Tool.New(ret, true);
        } catch (e) {
            throw e;
        }
        return ret;
    };

    function JSImplements ( name, obj ) {
        var me = this;
        this.__UUID__ = tools.UUID('JSImplements');
        this.callback = obj;
        this.callbackId = bridge.callbackId(function (args){
                                            var nativeArgs = args.arguments;
                                            var outArgs = [];
                                            for (var i = 0; i < nativeArgs.length; i++){
                                                outArgs.push(plus.ios.__Tool.New(nativeArgs[i], true));
                                            }
                                            me.callback[args.method].apply(me, outArgs);
                                        }, null);
        var allMethod = [];
        for(var attr in obj) {
            allMethod.push(attr);
        }

        var ret = bridge.execSync(_Server, 'implements', [this.__UUID__, name,  allMethod, this.callbackId]);
        return plus.ios.__Tool.New(ret, true);
    }
    JSImplements.prototype = new JSBBaseObject();
    JSImplements.prototype.constructor = JSImplements;

    function JSBridge (){
        this.__Tool = iosTools;
        this.__JSBBaseObject = JSBBaseObject;
    }

    classTemplate.hashTable = {};
    classTemplate.importClass = function ( className, superClsName ) {
        var classDef = this.isImport(className);
        if ( classDef ) { 
            return classDef;
        }
        var clsTemplete = this.newClassDefine( className, superClsName );
        var retInfo = bridge.execSync( _Server, 'import', [className] );

        var classMethods = retInfo.ClassMethod;
        for (var i = 0; i < classMethods.length; i++ ) {
            clsTemplete += this.AddMethodToClass( className, classMethods[i], true );
        }

        var InstanceMethods = retInfo.InstanceMethod;
        for (var i = 0; i < InstanceMethods.length; i++ ) {
            clsTemplete += this.AddMethodToClass( className, InstanceMethods[i] );
        }
        if ( plus.tools.ANDROID == plus.tools.platform ) {
            var ClassConstKeys = retInfo.ClassConstKeys;
            var ClassConstValues = retInfo.ClassConstValues;
            for (var i = 0; i < ClassConstKeys.length; i++ ) {
                clsTemplete += this.AddStaticConstToClass( className, ClassConstKeys[i] ,ClassConstValues[i]);
            }
        }
        this.hashTable[className] = classDef = classTemplate.createClass( className, clsTemplete );
        iosTools.attach(className, classDef);
        return classDef;
    };

    classTemplate.isImport = function ( clsName ) {
        return classTemplate.hashTable[clsName];
    };

    classTemplate.newClassDefine = function(className, superClsName) {
        var classDef = "";
        var f_className = className;
        var f_superClsName = superClsName;
    	className = iosTools.handleClassName(className);
    	if ( superClsName ) {
    		superClsName = iosTools.handleClassName(superClsName);//解决父类是内部类，需要置换'$'为'.'
    	}
        var jsClassNameDef,jsSuperClsNameDef;
        jsClassNameDef = jsbDef + className;
        jsSuperClsNameDef = jsbDef + superClsName;
        var ss = jsClassNameDef.split('.');
        var tt = "window";
        for(var i = 0; i < ss.length - 1;i++){
            tt = tt + "." + ss[i];
            classDef += "if(!" + tt + ")";
            classDef += tt + "={};";
        }
        classDef += tt + "." + ss[ss.length - 1] + "="
        classDef += "function(create) {\
            this.__UUID__ = window.plus.tools.UUID('JSB');\
            this.__TYPE__ = 'JSBObject';\
            var args = window.plus.ios.__Tool.process(arguments);\
            if ( create && plus.tools.IOS == plus.tools.platform ) {} else {\
                window.plus.bridge.execSync('" + _Server + "', '__Instance'," + "[this.__UUID__, '" +  f_className + "',args]);\
            }\
        };";
        if ( !superClsName ) {
            superClsName = 'plus.ios.__JSBBaseObject';
        } else{
            superClsName = jsSuperClsNameDef;
        }

        if ( superClsName ) {
            classDef += (jsClassNameDef + ".prototype = new " + superClsName + "('__super__constructor__')") + ";";
            classDef += (jsClassNameDef + ".prototype.constructor = " + jsClassNameDef) + ";";
        } 
        return classDef;
    };

    classTemplate.createClass = function ( className, javasrcipt ){
    	className = iosTools.handleClassName(className);
        var newCls = "(function(plus){" + javasrcipt + "return " + jsbDef + className + ";})(window.plus);";
//      window.plus.ios.__Tool.saveContent("_doc/"+className + ".js",newCls); //存储生成的js类
        return window.eval( newCls );
    };
    classTemplate.AddStaticConstToClass = function ( className, constName, constValue ) {
        var constDef;
    	className = iosTools.handleClassName(className);
        constDef = jsbDef + className + "."+constName + "=" + constValue + ";";
        constDef += jsbDef + className + ".prototype." + constName + "=" + constValue + ";";
        return constDef;
    }
    classTemplate.AddMethodToClass = function ( className, methodName, isClassMethod ) {
        var methodDef;
       	var f_className = className;
    	className = iosTools.handleClassName(className);
        var jsMethodName = '';
        if(plus.tools.IOS == plus.tools.platform){
            var subMethodNames = methodName.split(":");
            var methodSubLength = subMethodNames.length;
            if ( methodSubLength > 0 ) { 
                for (var i =  0; i < methodSubLength; i++) {
                    jsMethodName += subMethodNames[i];
                }
            } else {
                jsMethodName = subMethodNames;
            }
        }else{
            jsMethodName = methodName;
        }
        if ( isClassMethod ) {
            methodDef = jsbDef + className + "." + jsMethodName;
        } else {
            methodDef = jsbDef + className + ".prototype." + jsMethodName;
        }
        methodDef += " = function (){\
            var ret = null;\
            try {\
                var args = window.plus.ios.__Tool.process(arguments);";
        if ( isClassMethod ) {
            methodDef += "ret = window.plus.bridge.execSync('" + _Server + "', '__execStatic', ['" + f_className +"', '" + methodName + "', args]);";
        } else {
            methodDef += "ret = window.plus.bridge.execSync('" + _Server + "', '__exec', [this.__UUID__, '" + methodName + "', args]);";
        }
        methodDef += "ret = plus.ios.__Tool.New(ret, true);\
            } catch (e) {\
                throw e;\
            }\
            return ret;\
        };";
        return methodDef;
    };
	
    JSBridge.prototype.importClass = function ( className ) {
    	var objHandler ;
    	if(className.__TYPE__){
    		if(className.className){
	    		objHandler = className;
	    		className = className.className;
    		}else{
    			return;
    		}
    	}
        var classDef = classTemplate.isImport(className);
        if ( classDef ) { 
            return classDef;
        }
        var inheritList = bridge.execSync( _Server, '__inheritList', [className] );
        if ( inheritList ) {
            var inheritLength = inheritList.length;
            for (var i = inheritLength - 1; i >= 0; i--) {
                if ( i == (inheritLength - 1) ) {
                    classDef = classTemplate.importClass(inheritList[i], null );
                } else {
                    classDef = classTemplate.importClass(inheritList[i], inheritList[i+1] );
                }
            }
            if(objHandler){
            	objHandler.__proto__ = classDef.prototype;
            }
            return classDef;
        }
        return null;
    };

/*    JSBridge.prototype.attach = function ( obj, clsName ) {
        var cls = classTemplate.hashTable[clsName];
        if ( !cls ) {
            cls = newCls = this.importClass( clsName );
        }
        obj.__proto__ = cls.prototype;
        return cls;
    };
*/
    JSBridge.prototype.invoke = function ( obj, name ) {
        var ret = null;
        var args = [];
        for (var i = 2; i < arguments.length; i++) {
            args.push( window.plus.ios.__Tool.warp(arguments[i]));
        }
        if ( typeof(obj) === 'string' ) { 
            //调用静态
            try {
                ret = window.plus.bridge.execSync(_Server, '__execStatic', [obj, name, args]);
            } catch (e) {
                throw e;
            }
        } else if ( obj && 'JSBObject' == obj.__TYPE__ ) {
            ret = window.plus.bridge.execSync(_Server, '__exec', [obj.__UUID__, name, args]);
        }
        else if ( null == obj && typeof(name) === 'string' ) {
            ret = window.plus.bridge.execSync(_Server, '__execCFunction', [name, args]);
        }
        ret = plus.ios.__Tool.New(ret, true);
        return ret;
    };

    JSBridge.prototype.setAttribute = function ( obj, name, value ) {
        if ( typeof(obj) === 'function' ) { 
            //调用静态
        } else if ( obj && 'JSBObject' == obj.__TYPE__ ) {
            obj.plusSetAttribute( name, value );
        }
    };

    JSBridge.prototype.getAttribute = function ( obj, name ) {
        if ( typeof(obj) === 'function' ) { 
            //调用静态
        } else if ( obj && 'JSBObject' == obj.__TYPE__ ) {
            return obj.plusGetAttribute( name );
        }
        return null;
    };

    JSBridge.prototype.load = function ( lib ) {
        window.plus.bridge.execSync(_Server, '__loadDylib', [lib]);
    };

    JSBridge.prototype.newObject = function ( type, value ) {
        var ret = null;
        if ( 'string' === typeof(type) ) {
        	var args = [];
	        for (var i = 1; i < arguments.length; i++) {
	            args.push( window.plus.ios.__Tool.warp(arguments[i]));
	        }
            ret = window.plus.bridge.execSync(_Server, '__newObject', [type,args]);
        }
        ret = plus.ios.__Tool.New(ret, true);
        if ( ret ) {
            return ret;
        }
        return new JNBType(type, value); 
    };

    JSBridge.prototype.currentWebview = function () {
        if ( !_currentFrameObj ) {
            var ret = window.plus.bridge.execSync(_Server, 'currentWebview', []);
            _currentFrameObj = plus.ios.__Tool.New(ret, true);
        }
        return _currentFrameObj;
    };

    JSBridge.prototype.getWebviewById = function (id) {
        if ( id === window.__HtMl_Id__ ) {
            return this.currentWebview();
        }
        var ret = _frameObjHash[id];
        if ( !ret ) {
            ret = window.plus.bridge.execSync(_Server, 'getWebviewById', [id]);
            ret = plus.ios.__Tool.New(ret, true);
            if ( ret ) {
                _frameObjHash[id] = ret;
            }
        }
        return ret;
    };

    JSBridge.prototype.deleteObject = function ( obj ) {
        bridge.execSync(_Server, '__release', [obj.__UUID__]);
    };

    JSBridge.prototype.implements = function ( name, obj ) {
        return new JSImplements(name, obj);
    };

    plus.ios = plus.android = new JSBridge();
    if ( plus.tools.ANDROID == plus.tools.platform ){
        plus.android.runtimeMainActivity = function(){
            var ret = plus.bridge.execSync(_Server,'getContext',[]);
            var cls = ret.className;
            ret = plus.ios.__Tool.New(ret, true);
            plus.android.importClass(cls);
            return ret;
        };
    }
})(window.plus);// webview
;(function(plus){
	var mkey = plus.bridge,
		_PLUSNAME = 'UI',
		_ExecMethod = 'execMethod',
		_Sync_ExecMethod = 'syncExecMethod',
		__JSON_Window_Stack = {},
		bridge = plus.bridge,
		tools = plus.tools;
    function __pushWindow__(nwindow){
        __JSON_Window_Stack[nwindow.__uuid__] = nwindow;
    }
    function __popWindow__(nwindow){
        delete __JSON_Window_Stack[nwindow.__uuid__];
    }
 
    function create(url, webviewid, options, extras )
    {
        options=options||{};
        options.name=webviewid;
        var nWin = new plus.webview.Webview(url, options, false, extras );
        return nWin;
    }

    function close(pWin, aniType)
    {
        var w=null;
        //if (!pWin) {return};
        if(typeof(pWin) == "string")
        {
            w = getWebviewById(pWin);
        }
        else if (pWin instanceof plus.webview.Webview )
        {
            w = pWin;
        }
        else
        {
            return;
        }
        w&&w.close(aniType);
    }
    function all ()
    {
        var _json_windows_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'enumWindow', [window.__HtMl_Id__]]);
        var _stack_ = [];
        var _json_stack_ = {};
        for(var i = 0;i < _json_windows_.length; i++)
        {
            var _json_window_ = _json_windows_[i];//json 格式
            var _window = __JSON_Window_Stack[_json_window_.uuid];//从json栈获取指定uuid的Webview
            
            if(!_window)
            {//当前js页面栈没有新创建的Webview                    
                 _window  = new plus.webview.Webview(null,null,true,_json_window_.extras);
                 _window.__uuid__ = _json_window_.uuid;
                 _window.id = _json_window_.id;
                 // 同步窗口回调id
                mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
            }
            _stack_.push(_window);
            _json_stack_[_window.__uuid__] = _window;
        }
        __JSON_Window_Stack= _json_stack_;
         return _stack_;
   }

   function _find__Window_By_UUID__(uuid,id,extras)
   {
        if (!uuid || typeof uuid !== "string" ) {return;};
        var _stack_ = [];
        var _json_stack_ = {};

        var _window = __JSON_Window_Stack[uuid];//从json栈获取指定uuid的Webview
        
        if(!_window)
        {//当前js页面栈没有新创建的Webview                    
             _window  = new plus.webview.Webview(null,null,true,extras);
             _window.__uuid__ = uuid;
             _window.id__ = id;
             // 同步窗口回调id
            mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
            __JSON_Window_Stack[uuid] = _window;
        }
    
        return _window;
   }

    function getWebviewById(_name)
    {
        if (!_name || typeof _name != "string") 
        {
            return;
        }
        var _json_window_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'findWindowByName',[window.__HtMl_Id__,[_name]]] );
                                      
        if(_json_window_)
        {
            var _window = __JSON_Window_Stack[_json_window_.uuid];
            if(_window == null){
                _window  = new plus.webview.Webview(null, null,true,_json_window_.extras);
                _window.__uuid__ = _json_window_.uuid;
                _window.id = _json_window_.id;
                mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
                __JSON_Window_Stack[_window.__uuid__] =_window;
            }
            return _window;
        }
    }
    function currentWebview()
    {     
        var __window__ = __JSON_Window_Stack[window.__HtMl_Id__];  
        if(__window__ == null || __window__ === undefined)
        {
//      	if(window.__WebVieW_Id__){
//      		__window__ = this.getWebviewById(window.__WebVieW_Id__);
//      	}else{
        		var _json_window_ = mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'currentWebview', [window.__HtMl_Id__]]);
	           __window__  = new plus.webview.Webview(null,null,true,_json_window_.extras);
	           __window__.__uuid__ = window.__HtMl_Id__;
	           __window__.id = _json_window_.id;
	           __JSON_Window_Stack[__window__.__uuid__] = __window__;
	           mkey.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[__window__.__uuid__,[__window__.__callback_id__]]]);
//      	}
        }
       return __window__;              
    }

    function hide(pWin,aniHide, duration )
    {
        var w=null;
        if(typeof(pWin) == "string")
        {
            w = getWebviewById(pWin);
        }
        else if (pWin instanceof plus.webview.Webview )
        {
            w = pWin;
        }
        else
        { return;}
        w&&w.hide(aniHide, duration);
    }

    function exec(nview,action,actionArgs){
        mkey.exec(_PLUSNAME, _ExecMethod, [nview.__IDENTITY__,action,[nview.__uuid__, actionArgs]]);
    }

    function execSync(nview,action,actionArgs){
        return mkey.execSync(_PLUSNAME, _Sync_ExecMethod, [nview.__IDENTITY__,action,[ nview.__uuid__,actionArgs]]);
    }
    
    function open(url, webviewid, options, niShow, duration, showedCB ,extras)
	{
		var nWebview = plus.webview.create(url, webviewid, options,extras);
		nWebview.show(niShow, duration, showedCB );
        return nWebview;
	}
	
	function show(pWin, niShow, duration, showedCB )
	{
        var w=null;
        if(typeof(pWin) == "string")
        {
            w = getWebviewById(pWin);
        }
        else if (pWin instanceof plus.webview.Webview )
        {
            w = pWin;
        }
        else
        { return;}
        w&&w.show(niShow, duration, showedCB );
	}
	
	function __Webview_LoadEvent_CallBack_(EventArgys)
	{
		var EventObj = __JSON_Window_Stack[EventArgys.WebviewID];
		if (!EventObj) 
        {return;}

        if(EventArgys.Event == "onloading")
		{
			if(EventObj.onloading != null)
			{
				EventObj.onloading();
			}
		}
		else if(EventArgys.Event == "onclose")
		{
			if(EventObj.onclose != null)
			{
				EventObj.onclose();
			}
            delete __JSON_Window_Stack[EventArgys.WebviewID];
		}
		else if(EventArgys.Event == "onerror")
		{
			if(EventObj.onerror != null)
			{
				EventObj.onerror();
			}
		}
		else if(EventArgys.Event == "onloaded")
		{
			if(EventObj.onloaded != null)
			{
				EventObj.onloaded();
			}
		}
		}

	
    plus.webview = {
    	open:open,
    	show:show,
        hide:hide,
        getWebviewById:getWebviewById,
        close:close,
        create:create,
        currentWebview:currentWebview,
        all:all,
        exec:exec,
        execSync:execSync,
        _find__Window_By_UUID__:_find__Window_By_UUID__,
        __pushWindow__:__pushWindow__,
        __popWindow__:__popWindow__,   
        __JSON_Window_Stack:__JSON_Window_Stack,
        __Webview_LoadEvent_CallBack_:__Webview_LoadEvent_CallBack_
    };
})(window.plus);


// NView
(function(ui){
    var bridge = plus.bridge;
    function NView(type){
        this.__IDENTITY__ = type;
        this.__uuid__ = window.plus.tools.UUID(type);
        this.id;
        plus.obj.Callback.call(this);
    }
    
    NView.prototype.getMetrics = function(callback){
        var callBackID;
        if(callback){
        	callBackID = bridge.callbackId(function (args){
                var calEvent = {};
                calEvent.canForward = args;                
        		callback(calEvent);
        	});
            ui.exec(this, 'getMetrics',[callBackID, window.__HtMl_Id__] );
        }
    }
    NView.prototype.onCallback = function (fun,evt,args) {
        if ( evt == 'popGesture' ) {
            var private_args = args.private_args;
            args.target =  plus.webview._find__Window_By_UUID__(private_args.uuid, private_args.id,private_args.extras);
            delete  args.private_args;
        }
        fun(args);
    }
    
   NView.prototype.addEventListener = function(eventType, callback,capture)
    {
        var notice = plus.obj.Callback.prototype.addEventListener.apply(this,[eventType, callback,capture]);
        if(notice){
           
            var args = [eventType, window.__HtMl_Id__];
            ui.exec(this,'addEventListener',args );
        }
    };
    NView.prototype.removeEventListener = function(eventType, callback)
    {
        var notice = plus.obj.Callback.prototype.removeEventListener.apply(this,[eventType, callback]);
        if(notice){
            var args = [eventType, window.__HtMl_Id__];
            ui.exec(this,'removeEventListener',args );
        }
    };

    ui.NView = NView;
})(window.plus.webview);

// Webview
(function(ui){
    var IDENTITY = 'NWindow';
    var _PLUSNAME = 'UI';
    var _Sync_ExecMethod = 'syncExecMethod';
    var _ExecMethod = 'execMethod';
    var bridge = plus.bridge;
    function Webview(url, options ,capture, extras)
    {
        this.__view_array__ = new Array;
        ui.NView.prototype.constructor.apply(this, [IDENTITY]);
        this.id = null;
        if ( options && options.name ) { this.id = options.name; }
        if(extras){
	        for(var p in extras){
			    this[p] =  extras[p];
			}
        }
        if(!capture){//是否调用到native层
        	ui.__pushWindow__(this);
            ui.exec( this, IDENTITY,[url, options,this.__callback_id__, window.location.href, extras] );
        }
    }
	var bProto = Webview.prototype;
    plus.tools.extend(bProto,ui.NView.prototype);
    //plus.tools.extend(bProto,plus.obj.Callback.prototype);
    bProto.constructor = Webview;
   
    bProto.show = function(aniShow,duration,showedCB )
    {
        var callBackID;
        if(showedCB && typeof showedCB == "function"){
            callBackID = bridge.callbackId(function (){
                showedCB();
            });
        }
        ui.exec(this, 'show',[aniShow,duration,null/*给参数保留是为了兼容原plus.ui误删*/,callBackID] );
    }
    bProto.close = function(aniType,duration)
    {
    	if(this === plus.webview.__JSON_Window_Stack[window.__HtMl_Id__]){
			plus.bridge.callbackFromNative(this.__callback_id__,{status:plus.bridge.OK,message:{evt:'close'},keepCallback:true});//执行close事件
    	}
       // ui.__popWindow__(this);
        ui.exec(this, 'close', [aniType,duration]);
    };
    bProto.setStyle = function( pOptions )
    { 
        if (!pOptions || typeof pOptions !== "object") 
        {
           return;
        }
        ui.exec(this, 'setOption',[pOptions] );
    };
    bProto.nativeInstanceObject = function( )
    { 
        var njs = plus.ios || plus.android;
        if ( njs && njs.getWebviewById ) {
            return njs.getWebviewById(this.__uuid__);
        }
        return null;
    };
    bProto.hide = function( aniHide, duration)
    {
        ui.exec(this,'hide',[aniHide, duration]);
    };
    bProto.setVisible = function(bVisable)
    {
        ui.exec(this, 'setVisible', [bVisable]);
    };
    bProto.isVisible = function()
    {
        return ui.execSync(this,"isVisible",[]);
    }
    bProto.setJsFile = function(jsfile){
        if (!jsfile || typeof jsfile != "string") {return;};
        ui.exec(this, 'setPreloadJsFile', [jsfile]);
    };
    bProto.appendJsFile = function(jsfile){
        if (!jsfile || typeof jsfile != "string") {return;};
        ui.exec(this, 'appendPreloadJsFile', [jsfile]);
    };
    bProto.setContentVisible = function(bVisable){
        ui.exec(this, 'setContentVisible', [bVisable]);
    };
    bProto.opener = function()
    {
        var winID = ui.execSync(this,"opener",[]);
        if (!winID) {return null;}
    	return  plus.webview._find__Window_By_UUID__(winID.uuid, winID.id,winID.extras);
    };
    bProto.opened = function()
    {// 参考枚举接口优化，避免再次调用native同步数据
        var _json_windows_ = ui.execSync(this,"opened",[]);
        if (!_json_windows_) {return;}
        var _stack_ = [];
        var _json_stack_ = {};
        for(var i = 0;i < _json_windows_.length; i++)
        {
            var _json_window_ = _json_windows_[i];//json 格式
            var _window = plus.webview.__JSON_Window_Stack[_json_window_];//从json栈获取指定uuid的Webview
            
            if(!_window)
            {//当前js页面栈没有新创建的Webview                    
                 _window  = new plus.webview.Webview(null,null,true,_json_window_.extras);
                 _window.__uuid__ = _json_window_.uuid;
                 _window.id = _json_window_.id;
                 // 同步窗口回调id
                bridge.exec(_PLUSNAME,_ExecMethod,[_PLUSNAME,'setcallbackid',[_window.__uuid__,[_window.__callback_id__]]]);
            }
            _stack_.push(_window);
            _json_stack_[_window.__uuid__] = _window;
        }

         return _stack_;
    };
    bProto.remove = function(webview)
    {
    	var RemoveID;
    	if(typeof(webview) == "string")
    	{
    		RemoveID = webview;
    	}
    	else if(webview instanceof plus.webview.Webview )
    	{
    		RemoveID = webview.__uuid__;
    	}
        else
        {return;}
    	ui.exec(this, "remove", [RemoveID]);
    };
    bProto.removeFromParent = function()
    {
    	ui.exec(this,"removeFromParent",[]);
    };
    bProto.parent = function()
  	{
        var winID = ui.execSync(this,"parent",[]);
        if (!winID) {return null;}
        return  plus.webview._find__Window_By_UUID__(winID.uuid, winID.id,winID.extras);
  	};
  	bProto.children = function()
  	{
        var arguArry = [];
        var winJson = ui.execSync(this,"children",[]);
        for(var i=0;i<winJson.length;i++)
        {
            arguArry.push(plus.webview._find__Window_By_UUID__(winJson[i].uuid, winJson[i].id,winJson.extras));
        }
        return arguArry;
  	};
    bProto.getURL = function(){
        return ui.execSync(this, 'getUrl', []);
    };

    bProto.getTitle = function(){
        return ui.execSync(this, 'getTitle', []);
    };

    bProto.getStyle = function()
    { 
        return ui.execSync(this, 'getOption');
    };
    bProto.loadURL = function(url)
    {
        if (!url || typeof url !== "string") {return;};
        ui.exec(this, 'load', [url, window.location.href]);
    };
    bProto.loadData = function(data, datatype, charset)
    {
        if (!data || typeof data !== "string") {return;};
    	ui.exec(this, "loadData", [data, window.location.href, datatype, charset]);
    };
    bProto.stop = function() {
        ui.exec(this, 'stop', []);
    };
    bProto.reload = function(force) {
        ui.exec(this, 'reload', [force]);
    };

    bProto.back = function() {
        ui.exec(this, 'back', []);
    };
    bProto.forward = function() {
        ui.exec(this, 'forward', []);
    };

    bProto.canBack = function(cb) 
    {
        if (!cb || typeof cb !== "function") {return;};
        var callBackID;
        if(cb){
            callBackID = bridge.callbackId(function (args){
                var calEvent = {}; 
                calEvent.canBack = args; 
                cb(calEvent);
            });
        }
        ui.exec(this, 'canBack',[callBackID] );
    };
    bProto.canForward = function(cb) {
        if (!cb || typeof cb !== "function") {return;};
        var callBackID;
        if(cb){
            callBackID = bridge.callbackId(function (args){
                var calEvent = {};
                calEvent.canForward = args; 
                cb(calEvent);
            });
        }
        ui.exec(this, 'canForward',[callBackID] );
    };

    bProto.clear = function()
    {
        ui.exec(this, 'clear', []);
    };
    bProto.evalJS = function(script)
    {
        if (!script || typeof script !== "string") {return;}
        ui.exec(this, 'evalJS',[script] );
    };   
    bProto.append = function(extView){
        if (extView) 
        {
            if (extView instanceof plus.webview.Webview) 
            {
                this.__view_array__.push(extView);
                ui.exec(this,'append',[extView.__IDENTITY__,extView.__uuid__]);
            };
        }
    }
    bProto.setPullToRefresh = function(options,refreshCB){
        var callbackId ;
        if(refreshCB){
           callbackId = plus.bridge.callbackId(refreshCB);
        }
        this.addEventListener('pulldownrefreshevent',refreshCB,false);
        ui.exec(this,'setPullToRefresh',[options,callbackId]);
    }
    bProto.endPullToRefresh = function(){
        ui.exec(this,'endPullToRefresh',[]);
    }
    bProto.setBounce = function(poptions,coptions){
        ui.exec(this,'setBounce',[poptions,coptions]);
    }
    bProto.resetBounce = function(){
        ui.exec(this,'resetBounce',[]);
    }
    bProto.setBlockNetworkImage = function(block){
        ui.exec(this,'setBlockNetworkImage',[block]);
    }
    ui.Webview = Webview;

})(window.plus.webview);



// nativeUI
;(function(plus){
	var mkey = plus.bridge,
		_PLUSNAME = 'UI',
		_ExecMethod = 'execMethod',
		_Sync_ExecMethod = 'syncExecMethod',
		bridge = plus.bridge,
		tools = plus.tools;

    function alert( message, alertCB, title, ButtonCapture) {
    	var callBackID;
        var messageRun;

        if (!message) {return;}
        else if ( typeof message !== 'string' ) 
        {
            messageRun = message.toString();
        }
        else
        {
            messageRun = message;
        }

    	if(alertCB){
	        callBackID = bridge.callbackId(function (args){            
	        	alertCB(args);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'alert', [window.__HtMl_Id__, [messageRun, callBackID, title, ButtonCapture]]]);
    }

    function actionSheet( actionsheetStyle, actionsheetCallback ) {
        var callBackID;
        if( actionsheetCallback ){
            callBackID = bridge.callbackId(function (args){  
                var postevent = {};
                postevent.index = args;          
                actionsheetCallback(postevent);
            });
        }
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'actionSheet', [window.__HtMl_Id__, [actionsheetStyle, callBackID]]]);
    }

    function toast( message, options )
    {
        var messageRun;
        if (!message) {return;}
        else if ( typeof message !== 'string' ) 
        {
            messageRun = message.toString();
        }
        else
        {
            messageRun = message;
        }
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'toast', [window.__HtMl_Id__, [messageRun, options]]]);
    }
    function confirm(message, confirmCB, title, buttons) {
       var callBackID;
         var messageRun;
         if (!message){return;}
        else if ( typeof message !== 'string' ) 
        {
            messageRun = message.toString();
        }
        else
        {
            messageRun = message;
        }
    	if(confirmCB){
    		callBackID = bridge.callbackId(function (args){
                var cbargu = {};
                cbargu.index = args;
	        	confirmCB(cbargu);
	        });
    	}
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'confirm', [window.__HtMl_Id__, [messageRun, callBackID, title, buttons]]]);
    }
    function prompt(message, promptCB, title, tip, buttons)
    {
        var messageRun;
        if(!message){return;}
        else if ( typeof message !== 'string' ) 
        {
            messageRun = message.toString();
        }
        else
        {
            messageRun = message;
        }

        var callBackID ;
        if(promptCB){
        	callBackID = bridge.callbackId(function (args){
                args.value = args.message;
	        	promptCB(args);
	        });
        }
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'prompt', [window.__HtMl_Id__, [messageRun, callBackID, title, tip, buttons]]]);
    }

    function pickDate( successCallback, errorCallback, options ) {
        if (!successCallback || typeof successCallback !== "function") {return;};
        var nativeOptions = {};
        if ( options ) {
            if ( options.minDate instanceof Date ) { 
                nativeOptions.startYear = options.minDate.getFullYear();
                nativeOptions.startMonth = options.minDate.getMonth();
                nativeOptions.startDay= options.minDate.getDate();
            } else if ( tools.isNumber(options.startYear) ) {
                nativeOptions.startYear = options.startYear;
                nativeOptions.startMonth = 0;
                nativeOptions.startDay= 1;
            } 
            if ( options.maxDate instanceof Date ) { 
                nativeOptions.endYear = options.maxDate.getFullYear();
                nativeOptions.endMonth = options.maxDate.getMonth();
                nativeOptions.endDay= options.maxDate.getDate();
            } else if ( tools.isNumber(options.endYear) ) {
                nativeOptions.endYear = options.endYear;
                nativeOptions.endMonth = 11;
                nativeOptions.endDay= 31;
            } 

            if ( options.date instanceof Date ) { 
                nativeOptions.setYear = options.date.getFullYear();
                nativeOptions.setMonth = options.date.getMonth();
                nativeOptions.setDay = options.date.getDate();
            }

            nativeOptions.popover = options.popover;
            nativeOptions.title = options.title;
        }

        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            var cbData = {};
            cbData.date = date;
            successCallback(cbData);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            var cbData = {};
            cbData.error=code;
            errorCallback(cbData);
        };
        var callBackID = bridge.callbackId(success, fail);        
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickDate', [window.__HtMl_Id__, [callBackID, nativeOptions]]]);
    }
                                      
    function pickTime( successCallback, errorCallback, options ) {
        if (!successCallback || typeof successCallback !== "function") {return;};
        var needRecover = false;
        if ( typeof options === 'object' ) {
            var time = options.time;
            if ( time instanceof Date ) {
                options.__hours = time.getHours();
                options.__minutes = time.getMinutes();
                needRecover = true;
            }
        }
        var success = typeof successCallback !== 'function' ? null : function(time) {
            var date = (typeof time != 'undefined'?new Date(time):null);
            var cbData = {};
            cbData.date=date;
            successCallback(cbData);
        };
        var fail = typeof errorCallback !== 'function' ? null : function(code) {
            var cbData = {};
            cbData.error=code;
            errorCallback(cbData);
        };
        var callBackID = bridge.callbackId(success, fail);
        mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME, 'pickTime', [window.__HtMl_Id__, [callBackID,options]]]);
        if ( needRecover ) {
            delete options.__hours;
            delete options.__minutes;
        };
    }

    function WaitingView( title, options ){
    	this.__uuid__ = window.plus.tools.UUID('WaitingView');
    	this.onclose = null;
    	var me = this;
    	var oncloseCallbackId = bridge.callbackId(function (){
        		if( typeof me.onclose === 'function' ){
        			me.onclose();
        		}
        	});
    	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView', [this.__uuid__,[title, options,oncloseCallbackId]]]);
    }

    WaitingView.prototype.close = function  () {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_close', [this.__uuid__]]);
    }
    WaitingView.prototype.setTitle = function  (title) {
     	mkey.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'WaitingView_setTitle', [this.__uuid__,[title]]]);
    }

    function showWaiting( title, options ){
        return new WaitingView( title, options );
    }

    function closeWaiting()
    {
        bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'closeWaiting', []]);
    }

    plus.nativeUI = {
        pickTime:pickTime,
        pickDate:pickDate,
        alert:alert,
        confirm:confirm,
        showWaiting:showWaiting,
        prompt:prompt,
        toast:toast,
        actionSheet:actionSheet,
        closeWaiting:closeWaiting
    };
})(window.plus);
// navigator
;(function(plus){
    var bridge = window.plus.bridge,
    _PLUSNAME = 'UI',
    _Sync_ExecMethod = 'syncExecMethod',
    _ExecMethod = 'execMethod';	
    plus.navigator = 
    {
    	closeSplashscreen:function()
    	{
    		bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'closeSplashscreen', [0]]);
    	},
    	isFullscreen:function()
    	{
    		return bridge.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'isFullScreen', [0]]);
    	},
    	setFullscreen:function(fullscreen)
    	{
    		bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setFullscreen', [fullscreen]]);
    	},
        setStatusBarBackground:function(bkColor)
        {
            bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setStatusBarBackground', [bkColor]]);
        },
        getStatusBarBackground:function()
        {
            return bridge.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'getStatusBarBackground', []]);
        },
        setStatusBarStyle:function(style)
        {
            bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setStatusBarStyle', [style]]);
        },
        getStatusBarStyle:function()
        {
            return bridge.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'getStatusBarStyle', []]);
        },
        setUserAgent:function(value,h5plus)
        {
        	bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setUserAgent', [value,h5plus]]);
        },
        getUserAgent:function()
        {
        	return bridge.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'getUserAgent', []],function(r){
					try{
						var reslut = window.eval(r);
						if ( null == reslut ) {return null;}
						return r;
					} catch (e) {return r;}
					return r;
				});
        },
        removeCookie:function(url )
        {
            bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'removeCookie', [url]]);
        },
        removeSessionCookie:function(url, value )
        {
            bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'removeSessionCookie', []]);
        },
        removeAllCookie:function(url, value )
        {
            bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'removeAllCookie', []]);
        },
        setCookie:function(url, value )
        {
        	bridge.exec(_PLUSNAME, _ExecMethod, [_PLUSNAME,'setCookie', [url, value ]]);
        },
        getCookie:function(url)
        {
        	return bridge.execSync(_PLUSNAME, _Sync_ExecMethod, [_PLUSNAME,'getCookie', [url]],function(r){
					try{
						var reslut = window.eval(r);
					if ( null == reslut ) {return null;}
						return r;
					} catch (e) {return r;}
					return r;
				});
        }
    };
})(window.plus);
// key
;(function(plus){
    var bridge = window.plus.bridge,
    _PLUSNAME = 'UI',
    _Sync_ExecMethod = 'syncExecMethod',
    _ExecMethod = 'execMethod';
    plus.key={};    
    keyEvent = {};
    keyEvent["backbutton"] = "back";
    keyEvent["menubutton"] = "menu";
    keyEvent["searchbutton"] = "search";
    keyEvent["volumeupbutton"] = "volumeup";
    keyEvent["volumedownbutton"] = "volumedown";
    keyEvent["keyup"] = "keyup";
    keyEvent["keydown"] = "keydown";
    keyEvent["longpressed"] = "longpressed";
    plus.key.addEventListener=function(eventType, callback, capture)
    	{           
            if (!eventType || !callback || typeof eventType !== "string" || typeof callback != "function") 
            {return;}

            function keyEventFun(args)
            { 
                var eve = {};
                eve.keycode = args.keyType;
                eve.keyCode = args.keyCode;
                eve.keyType = args.keyType;
                callback(eve);            
            }
            
            var localWin = plus.webview.currentWebview();
            var notice = plus.obj.Callback.prototype.addEventListener.apply(localWin,[keyEvent[eventType], keyEventFun, capture]);
            if(notice){
                var args = [keyEvent[eventType], window.__HtMl_Id__];
                
                bridge.exec(_PLUSNAME, _ExecMethod, [localWin.__IDENTITY__,'addEventListener',[localWin.__uuid__, args]]);
            }
            
        }
    plus.key.removeEventListener=function(eventType, callback)
    	{
             if (!eventType || !callback || typeof eventType !== "string" || typeof callback != "function") 
            {return;}
            var localWin = plus.webview.currentWebview();
            var notice = plus.obj.Callback.prototype.removeEventListener.apply(localWin,[keyEvent[eventType], callback]);
            if(notice){
                var args = [keyEvent[eventType], window.__HtMl_Id__];
                var localWin = plus.webview.currentWebview();
                bridge.exec(_PLUSNAME, _ExecMethod, [localWin.__IDENTITY__,'removeEventListener',[localWin.__uuid__, args]]);
            }
        }

})(window.plus);
