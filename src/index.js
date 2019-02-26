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
   *
   */
  constructor(GCloudConfiguration = {}, queueConfig = {}) {
    this.connectionConfig = GCloudConfiguration;
    this.queueConfig = queueConfig;
    this.client = new PubSub(this.connectionConfig);
    this.publisher = new PubsubPublisher(
      this.client,
      this.queueConfig.topicName
    );
    this.worker = new PubsubWorker(this.client, this.queueConfig);
  }

  get Publisher() {
    return this.publisher;
  }

  get Worker() {
    return this.worker;
  }
}

module.exports = PubsubQueue;
