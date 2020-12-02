"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeJSONParse = exports.sleep = void 0;
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
function safeJSONParse(val) {
    try {
        return JSON.parse(val);
    }
    catch (err) {
        return val;
    }
}
exports.safeJSONParse = safeJSONParse;
