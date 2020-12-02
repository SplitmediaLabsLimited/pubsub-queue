"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var publisher_1 = __importDefault(require("./publisher"));
var publish = jest.fn();
// @ts-ignore
var mockClient = {
    topic: jest.fn().mockReturnValue({
        publish: publish,
    }),
};
test('object', function () {
    var instance = new publisher_1.default(mockClient, 'some-topic');
    instance.publish({
        type: 'some-type',
        payload: {
            hello: 'world',
        },
    });
    expect(publish).toBeCalledWith(Buffer.from(JSON.stringify({ hello: 'world' })), {
        type: 'some-type',
    });
});
test('custom topic', function () {
    var instance = new publisher_1.default(mockClient, 'some-topic');
    instance.publish('custom-topic', {
        type: 'some-type',
        payload: {
            hello: 'world',
        },
    });
    expect(mockClient.topic).toBeCalledWith('custom-topic');
    expect(publish).toBeCalledWith(Buffer.from(JSON.stringify({ hello: 'world' })), {
        type: 'some-type',
    });
});
