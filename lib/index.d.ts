import { ClientConfig, PubSub } from '@google-cloud/pubsub';
import PubsubPublisher from './publisher';
import PubsubWorker from './worker';
export { PubsubWorker, PubsubPublisher };
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
    _client: PubSub | null;
    publisher: PubsubPublisher | null;
    worker: PubsubWorker | null;
    constructor(connectionConfig: ClientConfig | undefined, queueConfig: QueueConfig);
    client(): PubSub;
    get Publisher(): PubsubPublisher;
    get Worker(): PubsubWorker;
}
