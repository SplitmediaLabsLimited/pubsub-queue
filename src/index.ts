import { ClientConfig, PubSub } from '@google-cloud/pubsub';
import PubsubPublisher from './publisher';
import PubsubWorker from './worker';

export interface JobPayload {
  [key: string]: string;
}

export type QueueConfig = {
  topicName: string; // name of the default topicName for the jobs
  subscriptionName: string; // name of the subscription under the topic
  buriedTopicName?: string; // name of the buried topics. When a job fails, it'll get published here
};

export default class PubsubQueue {
  connectionConfig: ClientConfig;
  queueConfig: QueueConfig;
  _client?: PubSub;
  publisher?: PubsubPublisher;
  worker?: PubsubWorker;

  constructor(connectionConfig: ClientConfig = {}, queueConfig: QueueConfig) {
    this.connectionConfig = connectionConfig;
    this.queueConfig = queueConfig;
  }

  client() {
    if (!this._client) {
      this._client = new PubSub(this.connectionConfig);
    }

    return this._client;
  }

  get Publisher() {
    const client = this.client();

    if (!this.publisher) {
      this.publisher = new PubsubPublisher(client, this.queueConfig.topicName);
    }

    return this.publisher;
  }

  get Worker() {
    const client = this.client();

    if (!this.worker) {
      this.worker = new PubsubWorker(client, this.queueConfig);
    }

    return this.worker;
  }
}
