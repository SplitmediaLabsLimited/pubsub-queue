"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var isAfter_1 = __importDefault(require("date-fns/isAfter"));
var events_1 = require("events");
var publisher_1 = __importDefault(require("./publisher"));
var utils_1 = require("./utils");
var getDelayed_1 = __importDefault(require("./getDelayed"));
var getRetries_1 = __importDefault(require("./getRetries"));
var PubsubWorker = /** @class */ (function (_super) {
    __extends(PubsubWorker, _super);
    function PubsubWorker(client, queueConfig) {
        var _this = _super.call(this) || this;
        _this.client = client;
        _this.queueConfig = queueConfig;
        _this.topic = _this.client.topic(queueConfig.topicName);
        _this.publisher = new publisher_1.default(_this.client, queueConfig.topicName);
        if (queueConfig.buriedTopicName) {
            _this.buriedPublisher = new publisher_1.default(_this.client, queueConfig.buriedTopicName);
        }
        return _this;
    }
    PubsubWorker.prototype.work = function (handlers, message) {
        return __awaiter(this, void 0, void 0, function () {
            var type, handler, delayed, retries, dataString, data, ackOnStart, extra, err_1, retryCount, success, extra, i, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        type = message.attributes.type;
                        handler = (function () {
                            if (typeof handlers === 'function') {
                                return handlers(type);
                            }
                            return handlers[type];
                        })();
                        // no handler for this type, crash!
                        if (!handler) {
                            throw new Error("No handlers for type \"" + type + "\"");
                        }
                        delayed = message.attributes.delayed ||
                            getDelayed_1.default(handler.delayed, message.publishTime);
                        if (delayed) {
                            if (!isAfter_1.default(new Date(), new Date(delayed))) {
                                // not ready, put it back in the queue
                                message.nack();
                                return [2 /*return*/];
                            }
                        }
                        retries = getRetries_1.default(message.attributes.retries
                            ? Number(message.attributes.retries)
                            : handler.retries);
                        dataString = message.data.toString('utf8');
                        data = utils_1.safeJSONParse(dataString);
                        ackOnStart = false;
                        if (typeof message.attributes.ackOnStart === 'boolean') {
                            ackOnStart = message.attributes.ackOnStart;
                        }
                        else if (typeof handler.ackOnStart === 'boolean') {
                            ackOnStart = handler.ackOnStart;
                        }
                        if (ackOnStart) {
                            message.ack();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 13]);
                        // send event that we've picked up a job
                        this.emit('job.reserved', {
                            id: message.id,
                            type: type,
                            delayed: delayed,
                            retries: retries,
                            payload: data,
                        });
                        return [4 /*yield*/, this.runHandler(handler, data, message, ackOnStart, delayed)];
                    case 2:
                        extra = _a.sent();
                        // send an event that we're done with the job
                        this.emit('job.handled', {
                            id: message.id,
                            type: type,
                            delayed: delayed,
                            retries: retries,
                            payload: data,
                            extra: extra,
                        });
                        return [3 /*break*/, 13];
                    case 3:
                        err_1 = _a.sent();
                        retryCount = 0;
                        if (!(err_1.retry !== false && retries.count > 0)) return [3 /*break*/, 12];
                        success = false;
                        extra = {};
                        i = 1;
                        _a.label = 4;
                    case 4:
                        if (!(i <= retries.count)) return [3 /*break*/, 11];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 9, , 10]);
                        if (!(success === false)) return [3 /*break*/, 8];
                        retryCount = i;
                        return [4 /*yield*/, utils_1.sleep(retries.delay ? retries.delay : 1000)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.runHandler(handler, data, message, ackOnStart, delayed)];
                    case 7:
                        extra = _a.sent();
                        success = true;
                        return [3 /*break*/, 11];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        err_2 = _a.sent();
                        console.log("try #" + i + " failed");
                        if (err_2.retry === false) {
                            return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 4];
                    case 11:
                        if (success) {
                            this.emit('job.handled', {
                                id: message.id,
                                type: type,
                                delayed: delayed,
                                retries: retries,
                                retried: true,
                                retryCount: retryCount,
                                payload: data,
                                extra: extra,
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 12;
                    case 12:
                        // can only reach this code path here if there's no retries, or if the retry failed
                        if (!ackOnStart) {
                            message.ack();
                        }
                        if (this.buriedPublisher) {
                            // republish in the buried tube
                            this.buriedPublisher.publish({
                                type: type,
                                payload: data,
                            });
                        }
                        // send event that we have buried the job
                        this.emit('job.buried', {
                            id: message.id,
                            type: type,
                            delayed: delayed,
                            retries: retries,
                            retryCount: retryCount,
                            payload: data,
                            error: err_1,
                        });
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    PubsubWorker.prototype.runHandler = function (handler, data, message, ackOnStart, delayed) {
        if (ackOnStart === void 0) { ackOnStart = false; }
        return __awaiter(this, void 0, void 0, function () {
            var extra, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        extra = {};
                        return [4 /*yield*/, handler.work(data, message)];
                    case 1:
                        response = _a.sent();
                        if (typeof response === 'string') {
                            this.handleRetry(response, message, ackOnStart, delayed);
                        }
                        else if (typeof response === 'object') {
                            this.handleRetry(response.status, message, ackOnStart, delayed);
                            extra = response.extra || {};
                        }
                        else if (!ackOnStart) {
                            message.ack();
                        }
                        return [2 /*return*/, extra];
                }
            });
        });
    };
    PubsubWorker.prototype.handleRetry = function (status, message, ackOnStart, delayed) {
        var retry = status === 'put' || status === 'retry';
        if (ackOnStart) {
            if (retry) {
                // for consistency with message-level delayed,
                // make sure handler-level delayed is the same across retries
                if (delayed && message.attributes.delayed == null) {
                    message.attributes.delayed = delayed;
                }
                this.topic.publish(message.data, message.attributes);
            }
        }
        else if (retry) {
            message.nack();
        }
        else {
            message.ack();
        }
    };
    /**
     * Start the worker
     */
    PubsubWorker.prototype.start = function (handlers, options) {
        var _this = this;
        if (handlers === void 0) { handlers = {}; }
        if (options === void 0) { options = {}; }
        this.topic
            .subscription(this.queueConfig.subscriptionName, options)
            .on('message', function (message) { return _this.work(handlers, message); });
    };
    return PubsubWorker;
}(events_1.EventEmitter));
exports.default = PubsubWorker;
