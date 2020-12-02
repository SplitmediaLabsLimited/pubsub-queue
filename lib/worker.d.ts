/// <reference types="node" />
import { EventEmitter } from 'events';
import Publisher from './publisher';
import { DelayedConfig } from './getDelayed';
import { RetryConfig } from './getRetries';
import { Message, PubSub, Topic } from '@google-cloud/pubsub';
import { JobPayload, QueueConfig } from '.';
declare type JobStatus = string | 'put' | 'retry';
declare type JobResult = JobStatus | {
    status: string;
    extra: any;
};
declare type Handler = {
    ackOnStart?: boolean;
    retries?: RetryConfig;
    delayed?: DelayedConfig;
    work: (payload: JobPayload, message: Message) => Promise<JobResult>;
};
declare type DynamicHandler = (type: string) => Handler;
declare type Handlers = Record<string, Handler> | DynamicHandler;
export default class PubsubWorker extends EventEmitter {
    client: PubSub;
    queueConfig: QueueConfig;
    topic: Topic;
    publisher: Publisher;
    buriedPublisher?: Publisher;
    constructor(client: PubSub, queueConfig: QueueConfig);
    work(handlers: Handlers, message: Message): Promise<void>;
    runHandler(handler: Handler, data: JobPayload, message: Message, ackOnStart: boolean | undefined, delayed: string | null): Promise<{}>;
    handleRetry(status: JobStatus, message: Message, ackOnStart: boolean, delayed: string | null): void;
    /**
     * Start the worker
     */
    start(handlers?: {}, options?: {}): void;
}
export {};
