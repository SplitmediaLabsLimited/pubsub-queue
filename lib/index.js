"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubsubPublisher = exports.PubsubWorker = void 0;
var pubsub_1 = require("@google-cloud/pubsub");
var publisher_1 = __importDefault(require("./publisher"));
exports.PubsubPublisher = publisher_1.default;
var worker_1 = __importDefault(require("./worker"));
exports.PubsubWorker = worker_1.default;
var PubsubQueue = /** @class */ (function () {
    function PubsubQueue(connectionConfig, queueConfig) {
        if (connectionConfig === void 0) { connectionConfig = {}; }
        this.connectionConfig = connectionConfig;
        this.queueConfig = queueConfig;
        this._client = null;
        this.publisher = null;
        this.worker = null;
    }
    PubsubQueue.prototype.client = function () {
        if (!this._client) {
            this._client = new pubsub_1.PubSub(this.connectionConfig);
        }
        return this._client;
    };
    Object.defineProperty(PubsubQueue.prototype, "Publisher", {
        get: function () {
            var client = this.client();
            if (!this.publisher) {
                this.publisher = new publisher_1.default(client, this.queueConfig.topicName);
            }
            return this.publisher;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PubsubQueue.prototype, "Worker", {
        get: function () {
            var client = this.client();
            if (!this.worker) {
                this.worker = new worker_1.default(client, this.queueConfig);
            }
            return this.worker;
        },
        enumerable: false,
        configurable: true
    });
    return PubsubQueue;
}());
exports.default = PubsubQueue;
