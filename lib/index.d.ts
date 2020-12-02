import { ClientConfig, PubSub } from '@google-cloud/pubsub';
export interface JobPayload {
    [key: string]: string;
}
export declare type QueueConfig = {
    topicName: string;
    subscriptionName: string;
    buriedTopicName?: string;
};
export default class PubsubQueue {
    connectionConfig: ClientConfig;
    queueConfig: QueueConfig;
    _client?: PubSub;
    publisher?: any;
    worker?: any;
    constructor(connectionConfig: ClientConfig | undefined, queueConfig: QueueConfig);
    client(): PubSub;
    get Publisher(): any;
    get Worker(): any;
}
