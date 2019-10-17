const { PubSub } = require('@google-cloud/pubsub');
const PubsubPublisher = require('./publisher');
const PubsubWorker = require('./worker');

class PubsubQueue {
  /**
   * Publishes a job to the queue
   * @param {Object} GCloudConfiguration
   * @param {Object} queueConfig
   * @param {string} queueConfig.topicName - the topic name to listen / publish to
   * @param {string} queueConfig.subscriptionName - the subscription name for the worker
   * @param {string} queueConfig.buriedTopicName - the buried topic, where it sends buried messages to
   * @param {boolean} queueConfig.workerAckOnStart - if true, worker will ack message before calling handler, and republishes on retry; otherwise, ack on handler success, and nack on retry
   *
   *
   */
  constructor(GCloudConfiguration = {}, queueConfig = {}) {
    this.connectionConfig = GCloudConfiguration;
    this.queueConfig = queueConfig;
    this._client = null;
    this.publisher = null;
    this.worker = null;
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

module.exports = PubsubQueue;
