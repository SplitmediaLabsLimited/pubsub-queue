"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var getDelayed_1 = __importDefault(require("./getDelayed"));
var PubsubPublisher = /** @class */ (function () {
    function PubsubPublisher(client, topicName) {
        this.client = client;
        this.topic = this.client.topic(topicName);
    }
    PubsubPublisher.prototype.publish = function (arg1, arg2) {
        var job;
        var topic;
        if (typeof arg1 === 'string' && typeof arg2 === 'object') {
            job = arg2;
            topic = this.client.topic(arg1);
        }
        else {
            job = arg1;
            topic = this.topic;
        }
        var type = job.type, _a = job.payload, payload = _a === void 0 ? {} : _a, _b = job.delayed, delayed = _b === void 0 ? null : _b, _c = job.retries, retries = _c === void 0 ? null : _c;
        var attributes = {
            type: type,
        };
        if (delayed) {
            var delay = getDelayed_1.default(delayed);
            if (delay) {
                attributes.delayed = delay;
            }
        }
        if (retries) {
            attributes.retries = String(retries.count);
        }
        return topic.publish(Buffer.from(JSON.stringify(payload)), attributes);
    };
    return PubsubPublisher;
}());
exports.default = PubsubPublisher;
