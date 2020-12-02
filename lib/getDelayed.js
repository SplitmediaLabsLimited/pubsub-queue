"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var addSeconds_1 = __importDefault(require("date-fns/addSeconds"));
var addMinutes_1 = __importDefault(require("date-fns/addMinutes"));
var addHours_1 = __importDefault(require("date-fns/addHours"));
var addDays_1 = __importDefault(require("date-fns/addDays"));
function delayObjectToString(delayed, from) {
    var add;
    switch (delayed.unit) {
        case 's':
        case 'sec':
        case 'second':
        case 'seconds':
            add = addSeconds_1.default;
            break;
        case 'm':
        case 'min':
        case 'minute':
        case 'minutes':
            add = addMinutes_1.default;
            break;
        case 'h':
        case 'hour':
        case 'hours':
            add = addHours_1.default;
            break;
        case 'd':
        case 'day':
        case 'days':
            add = addDays_1.default;
            break;
    }
    return add(from, delayed.value).toISOString();
}
function getDelayed(delayed, from) {
    if (from === void 0) { from = new Date(); }
    if (typeof delayed === 'string') {
        return delayed;
    }
    else if (typeof delayed === 'object') {
        return delayObjectToString(delayed, from);
    }
    return null;
}
exports.default = getDelayed;
