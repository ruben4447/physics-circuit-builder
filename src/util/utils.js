/**
 * Given a set of polar coordinates, return cartesian
 * @param  {Number} theta Angle in radians
 * @param  {Number} r     Radius
 * @return {Number[]}     [x, y] coordinates in cartesian plane
 */
export function polToCart(theta, r) {
    return [
        r * Math.cos(theta),
        r * Math.sin(theta)
    ];
}

/**
 * Check is point given lies close to the line
 * @param  {Number} x1  x coordinate of start point of line
 * @param  {Number} y1  y coordinate of start point of line
 * @param  {Number} x2  x coordinate of end point of line
 * @param  {Number} y2  y coordinate of end point of line
 * @param  {Number} x   x coordinate of point
 * @param  {Number} y   y coordinate of point
 * @param  {Number} maxDist Maximum distance from line we will allow
 * @return {Boolean} Is the distance to the line <= maxDist?
 */
export function isNearLine(x1, y1, x2, y2, x, y, maxDist = 1) {
    let lenA = (Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
    let lenB = (Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
    let lenC = (Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    let d;
    // Is angle obtuse?
    if (lenB > lenA + lenC) {
        d = Math.sqrt(lenA);
    } else if (lenA > lenB + lenC) {
        d = Math.sqrt(lenB);
    } else {
        lenA = Math.sqrt(lenA);
        lenB = Math.sqrt(lenB);
        lenC = Math.sqrt(lenC);

        const s = (lenA + lenB + lenC) / 2;
        d = (2 / lenC) * Math.sqrt(s * (s - lenA) * (s - lenB) * (s - lenC));
    }

    return d <= maxDist;
}

/**
 * Clamp a value between two values
 */
export function clamp(n, min, max) {
    if (typeof n !== 'number') return (min + max) / 2;
    if (max < min)[max, min] = [min, max];
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

/**
 * Given <n> resistances, find the total resistance in series
 * R = r1 + r2 ... rn
 * @param  {Number[]} r    Resistances
 * @return {Number}      Total resistance
 */
export function resistanceInSeries(...r) {
    return r.reduce((tot, r) => tot + r);
}

/**
 * Given <n> resistances, find the total resistance in parallel
 * 1/R = 1/r1 + 1/r2 ... 1/rn
 * Solve for R: R = (r1 * r2 ... rn) / (r1 + r2 ... rn)
 * @param  {Number[]} r    Resistances
 * @return {Number}      Total resistance
 */
export function resistanceInParallel(...r) {
    let num = r.reduce((tot, r) => (r === 0) ? tot : tot * r);
    let den = r.reduce((tot, r) => (r === 0) ? tot : tot + r);
    let res = num / den;
    return res;
}

/**
 * Maps a number in range to another range, keeping the relative position
 * @param  {number} n      number to map
 * @param  {number} start1 original range lower bound
 * @param  {number} stop1  original range upper bound
 * @param  {number} start2 new range lower bound
 * @param  {number} stop2  new range upper bound
 * @return {number}        newly mapped number
 */
export function mapNumber(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

/**
 * Return last element in array
 * @param {any[]}   Array
 * @return {any}    Last element
 */
export function arrLast(array) {
    return array[array.length - 1];
}

/**
 * Remove item from array
 * @param  {any} item   Item to remove
 * @param {any[]} array Array to remove from
 * @return {Boolean} Removed?
 */
export function arrRemove(item, array) {
    const i = array.indexOf(item);
    if (i !== -1) {
        array.splice(i, 1);
        return true;
    }
    return false;
}

/**
 * Return random element from array
 * @param  {any[]} array
 * @return {any} random element
 */
export function arrRandom(array) {
    const i = randomInt(array.length);
    return array[i];
}

/**
 * Given a number, round it to x decimal points
 * @param  {Number} num  Number to round
 * @param  {Number} dp   Decimal places to round to
 * @return {Number}      Rounded result
 */
export function roundTo(num, dp = 0) {
    if (dp === 0) return Math.round(num);

    num = num.toFixed(11); // Remove rounding errors
    const x = Math.pow(10, dp);
    return Math.round(num * x) / x;
}

/**
 * Generate random decimal
 * @param  {Number} min Minimum bound
 * @param  {Number} max Maximum bound (non-inclusive)
 * @return {Number}     Random output
 */
export function randomFloat(min, max) {
    if (arguments.length === 1) {
        max = min;
        min = 0;
    }
    return (Math.random() * (max - min)) + min;
}

/**
 * Generate random integer
 * @param  {Number} min Minimum bound
 * @param  {Number} max Maximum bound (non-inclusive)
 * @return {Number}     Random output
 */
export function randomInt(min, max) {
    if (arguments.length === 1) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Convert HSB to RGB
 * @param  {number} h       Hue, degrees (0-360)
 * @param  {number} s       Saturation, percentage (0-100)
 * @param  {number} b       Brightness, percentage (0-100)
 * @return {number[]}        [red (0-255), green (0-255), blue (0-255)]
 */
export function hsb2rgb(h, s, b) {
    h = clamp(h, 0, 360);
    if (h === 360) h = 0;
    s = clamp(s, 0, 100) / 100;
    b = clamp(b, 0, 100) / 100;

    let c = b * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = b - c;

    let rgb = [0, 0, 0];

    if (0 <= h && h < 60) {
        rgb = [c, x, 0];
    } else if (60 <= h && h < 120) {
        rgb = [x, c, 0];
    } else if (120 <= h && h < 180) {
        rgb = [0, c, x];
    } else if (180 <= h && h < 240) {
        rgb = [0, x, c];
    } else if (240 <= h && h < 300) {
        rgb = [x, 0, c];
    } else if (300 <= h && h < 360) {
        rgb = [c, 0, x];
    }

    rgb = rgb.map(n => (n + m) * 255);
    return rgb;
}

/**
 * Convert degrees to radians
 * - Callable to convert argument to radians
 *      @param  {Number} deg       Angle in degrees
 *      @return {Number}           Angle in radians
 * - Contain constants of degrees
 *      FORMAT: _<deg> = <deg> in radians
 *      E.G. Degrees._10 = 10 degrees in radians
 */
export const Degrees = function (deg) {
    return deg * 0.017453292519943295; // PI / 180
};
Degrees._1 = 0.0174533;
Degrees._5 = 0.0872665;
Degrees._10 = 0.174533;
Degrees._45 = 0.7853981633974483; //Math.PI / 4;
Degrees._90 = 1.5707963267948966; //Math.PI / 2;
Degrees._180 = 3.141592653589793; //Math.PI;
Degrees._270 = 4.71238898038469; // 180deg + 90deg;
Degrees._360 = 6.283185307179586; //Math.PI * 2;

/**
 * Convert radians to degrees
 * @param  {Number} rad
 * @return {Number} Degrees
 */
const rad2degK = 180 / Math.PI;
export function rad2deg(rad) {
    return rad * rad2degK;
}

/**
 * Define a property onto an object
 * @param  {object} obj     Target object
 * @param  {String} name    Name of property
 * @param  {any}    value   Value of property
 * @param  {object} options Options associated with setting the property
 *      - type: <type>      Set type of property
 *      - readonly: true    Set property to readonly
 */
export function defineProp(obj, name, value, options = {}) {
    // Store value of property
    let _val = value;

    // If type is present, check that type exists
    if (options.type !== undefined) {
        _checkType(options.type, value);
    }

    Object.defineProperty(obj, name, {
        get() {
            return _val;
        },
        set(arg) {
            if (options.readonly === true) throw new TypeError(`Assignment to readonly property '${name}'`);
            if (options.type !== undefined) _checkType(options.type, arg);
            _val = arg;
        }
    });
}

/**
 * Return a export function which checks its arguments before executing.
 * @param  {object}   args Object of <arg>:<type>
 * @param  {Function} fn   Actual export function to execute
 * @return {Function}      fn, but checks types
 */
export function typedFunction(args, fn) {
    if (typeof args !== 'object') throw new TypeError(`typedFunction: 1st argument must be object of arguments`);
    if (typeof fn !== 'function') throw new TypeError(`typedFunction: 2nd argument must be a function`);

    // Check if valid type
    for (let arg in args) {
        if (args.hasOwnProperty(arg)) {
            _checkType(args[arg], null);
        }
    }

    // Get array of types
    const argNames = Object.keys(args);
    const types = Object.values(args);

    return function () {
        // Check if same number of arguments
        if (types.length !== fn.length) throw new TypeError(`typedFunction: type declared for ${types.length} arguments, but export function accepts ${fn.length}`);

        // Check types
        for (let i = 0; i < arguments.length; i++) {
            const type = types[i];
            const value = arguments[i];
            try {
                _checkType(type, value);
            } catch (e) {
                throw new TypeError(`Argument '"${argNames[i]}"' is not assignable to parameter of type '${type}'`);
            }
        }

        return fn(...arguments);
    };
}

const number = 'number';
const any = 'any';
const string = 'string';
const boolean = 'boolean';

/**
 * Check if a value fits into a provided type
 * @param  {String} type    Type
 * @param  {any}    value   Value to check
 * @throw  {TypeError} If types do not match
 */
export function _checkType(type, value) {
    let isError = false;
    let isArray = false;

    // Is typed array?
    if (type.indexOf('[]') !== -1) {
        isArray = true;
        if (!Array.isArray(value)) throw new TypeError(`Cannot implicitly convert '${value}' to array`);
        type = type.replace('[]', '');
    }

    // Check type
    type = type.toString().toLowerCase();
    // Other type?
    switch (type) {
        case 'number':
            if (isArray || value == null) break;
            if (typeof value !== 'number' || isNaN(value)) isError = true;
            break;
        case 'string':
            if (isArray || value == null) break;
            if (typeof value !== 'string') isError = true;
            break;
        case 'boolean':
            if (isArray || value == null) break;
            if (value !== true && value !== false) isError = true;
            break;
        case 'any':
            break;
        default:
            throw new TypeError(`Unknown type '${type}'`);
    }

    if (isArray) {
        // Legal type
        try {
            for (let e of value) {
                _checkType(type, e);
            }
        } catch (e) {
            throw new TypeError(`Cannot convert to ${type}[]: ${e.message}`);
        }
    }

    if (isError) {
        throw new TypeError(`Cannot implicitly convert '${value}' to ${type} type`);
    }
    return value;
}

/**
 * Return HTML string for a boolean value
 * @param  {Boolean} bool The boolean value
 * @return {String}       HTML string
 */
export function getHtmlBoolString(bool) {
    return (bool === true) ?
        '<span style=\'color: forestgreen; font-weight: bold;\'>True</span>' :
        '<span style=\'color: crimson;\'>False</span>';
}

/**
 * Capitalise a string
 * @param  {String} string
 * @return {String}
 */
export function capitalise(string) {
    return string[0].toUpperCase() + string.substr(1);
}

/**
 * Take string and nicify it
 * - e.g. 'variable resistor' -> 'Variable Resistor'
 * @param  {String} str String to transform
 * @param  {String} joiner  What to join word array with
 * @return {String} output
 */
export function nicifyString(str, joiner = ' ') {
    str = str.toString();
    str = str.replace(/_/g, ' ');
    str = str.replace(/-/g, '');
    str = str.replace(/\s{2,}/g, ' ');

    const words = str.split(/\s/g);
    for (let i = 0; i < words.length; i++) {
        words[i] = capitalise(words[i]);
    }
    const output = words.join(joiner);
    return output;
}

/**
 * Take string and transform to class name
 * - e.g. 'variable resistor' -> 'VariableResistor'
 * @param  {String} str String to transform
 * @return {String} output
 */
export function toClassName(str) {
    return nicifyString(str, '');
}

/**
 * Convert joules to degrees celcius
 * @param  {Number} joules
 * @return {Number} Degrees celcius
 */
export function joules2deg(joules) {
    return joules * 0.00052656507646646;
}

/**
 * Convert degrees celcius to joules
 * @param  {Number} deg
 * @return {Number} Joules
 */
export function deg2joules(deg) {
    return deg / 0.00052656507646646;
}

/**
 * Dispatch an event on an element
 * @param  {HTMLElement} elem   Element to dispatch event on
 * @param  {String} type        Event name e.g. 'change'
 * @return {Event} The dispatched event
 */
export function eventOn(elem, type) {
    const event = new Event(type, {
        bubbles: true,
        cancelable: true
    });
    elem.dispatchEvent(event);
    return event;
}

/**
 * Find distance between two coordinates (a and b)
 * @param  {Number} ax  X coordinate of first point
 * @param  {Number} ay  Y coordinate of first point
 * @param  {Number} bx  X coordinate of second point
 * @param  {Number} by  Y coordinate of second point
 * @return {Number} Distance between the points
 */
export function distance(ax, ay, bx, by) {
    let dx = bx - ax;
    let dy = by - ay;
    return Math.sqrt((dx * dx) + (dy * dy));
}

/**
 * Sort object by keys aphabetically
 * @param  {Object} obj Object to sort
 * @return {Object} Sorted object
 */
export function sortObj(obj) {
    const sorted = {};

    // Sort keys
    const keys = Object.keys(obj);
    keys.sort();

    // Put sorted keys into "sorted", taking their original values with the,
    for (let key of keys) {
        sorted[key] = obj[key];
    }

    return sorted;
}

/**
 * Format a number
 * @param  {Number} num
 * @param  {Number} digits  How many fractional digits?
 * @param  {Boolean} asHTML HTML string?
 * @return {String} Exponential string
 */
export function numberFormat(num, digits, asHTML = true) {
    if (typeof num !== 'number') return num;

    let str = num.toExponential(digits);
    let parts = str.split('e');

    // Remove uneeded fractional digits
    let n = Number(parts[0]).toString();

    if (n.indexOf('.') !== -1) {
        // Place commas
        let nParts = n.split('.');
        nParts[0] = nParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        n = nParts.join('.');
    }

    // Seperate exponent, and remove '+'
    let exp = parts[1].replace('+', '');

    // Combine to main with superscript
    let result = n;
    if (exp !== '0') {
        result += asHTML ?
            '&times;10<sup>' + exp + '</sup>' :
            'e' + exp;
    }

    return result;
}