"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetries = void 0;
exports.defaultRetries = {
    count: 0,
    delay: 1000,
};
function getRetries(retries) {
    if (retries) {
        if (typeof retries === 'object' && retries.count) {
            return __assign(__assign({}, exports.defaultRetries), retries);
        }
        else if (typeof retries === 'number') {
            return __assign(__assign({}, exports.defaultRetries), { count: retries });
        }
    }
    return exports.defaultRetries;
}
exports.default = getRetries;
