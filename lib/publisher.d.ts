import { PubSub, Topic } from '@google-cloud/pubsub';
import type { DelayedConfig } from './getDelayed';
import type { RetryConfig } from './getRetries';
import { JobPayload } from '.';
export declare type Job = {
    type: string;
    payload?: JobPayload;
    delayed?: DelayedConfig;
    retries?: RetryConfig;
};
export default class PubsubPublisher {
    client: PubSub;
    topic: Topic;
    constructor(client: PubSub, topicName: string);
    /**
     * Publishes a job to the queue
     */
    publish(arg1: Job): Promise<string>;
    publish(arg1: string, arg2?: Job): Promise<string>;
}
