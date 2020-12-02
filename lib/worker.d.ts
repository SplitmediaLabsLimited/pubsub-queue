/// <reference types="node" />
import { EventEmitter } from 'events';
import Publisher from './publisher';
import { DelayedConfig } from './getDelayed';
import { RetryConfig } from './getRetries';
import { Message, PubSub, Topic } from '@google-cloud/pubsub';
import { JobPayload, QueueConfig } from '.';
export declare type JobStatus = string | 'put' | 'retry';
export declare type JobResult = void | JobStatus | {
    status: string;
    extra: any;
};
export declare type Handler = {
    ackOnStart?: boolean;
    retries?: RetryConfig;
    delayed?: DelayedConfig;
    work: (payload: JobPayload, message: Message) => Promise<JobResult>;
};
export declare type DynamicHandler = (type: string) => Handler;
export declare type Handlers = Record<string, Handler> | DynamicHandler;
export default class PubsubWorker extends EventEmitter {
    client: PubSub;
    queueConfig: QueueConfig;
    topic: Topic;
    publisher: Publisher;
    buriedPublisher?: Publisher;
    constructor(client: PubSub, queueConfig: QueueConfig);
    work(handlers: Handlers, message: Message): Promise<void>;
    runHandler(handler: Handler, data: JobPayload, message: Message, ackOnStart?: boolean, delayed?: string | null): Promise<{}>;
    handleRetry(status: JobStatus, message: Message, ackOnStart: boolean, delayed?: string | null): void;
    /**
     * Start the worker
     */
    start(handlers?: {}, options?: {}): void;
}
