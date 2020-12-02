import { Attributes, PubSub, Topic } from '@google-cloud/pubsub';
import getDelayed from './getDelayed';
import type { DelayedConfig } from './getDelayed';
import type { RetryConfig } from './getRetries';
import { JobPayload } from '.';

export type Job = {
  type: string;
  payload?: JobPayload;
  delayed?: DelayedConfig;
  retries?: RetryConfig;
};

export default class PubsubPublisher {
  client: PubSub;
  topic: Topic;

  constructor(client: PubSub, topicName: string) {
    this.client = client;
    this.topic = this.client.topic(topicName);
  }

  /**
   * Publishes a job to the queue
   */
  public publish(arg1: Job): Promise<string>;
  public publish(arg1: string, arg2?: Job): Promise<string>;
  public publish(arg1: any, arg2?: any): Promise<string> {
    let job: Job;
    let topic;
    if (typeof arg1 === 'string' && typeof arg2 === 'object') {
      job = arg2;
      topic = this.client.topic(arg1);
    } else {
      job = arg1;
      topic = this.topic;
    }

    const { type, payload = {}, delayed = null, retries = null } = job;

    const attributes: Attributes = {
      type,
    };

    if (delayed) {
      const delay = getDelayed(delayed);

      if (delay) {
        attributes.delayed = delay;
      }
    }

    if (retries) {
      attributes.retries = String(retries.count);
    }

    return topic.publish(Buffer.from(JSON.stringify(payload)), attributes);
  }
}
