"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var getDelayed_1 = __importDefault(require("./getDelayed"));
var staticDate = new Date('2020-01-01T00:00:00Z');
test('undefined', function () {
    var bla = {};
    expect(getDelayed_1.default(bla.delayed, staticDate)).toBe(null);
});
test('null', function () {
    expect(getDelayed_1.default(null, staticDate)).toBe(null);
});
test('string', function () {
    expect(getDelayed_1.default('2020-01-01T00:00:00Z', staticDate)).toBe('2020-01-01T00:00:00.000Z');
});
test('invalid string', function () {
    expect(getDelayed_1.default('wth?', staticDate)).toBe(null);
});
test('object', function () {
    expect(getDelayed_1.default({
        unit: 'd',
        value: 1,
    }, staticDate)).toBe('2020-01-02T00:00:00.000Z');
});
