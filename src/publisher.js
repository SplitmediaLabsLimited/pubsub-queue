const getDelayed = require('./getDelayed');

class PubsubPublisher {
  constructor(client, topicName) {
    this.client = client;
    this.topic = this.client.topic(topicName);
  }

  /**
   * Publishes a job to the queue
   * @param {Object} job
   * @param {string} job.type - type of job
   * @param {Object} job.payload - the payload of the job
   * @param {string} job.delayed - the date/time that the job should be started in ISO 8601 format
   * @param {string|Object} job.retries - how many times it this job should retry if it fails
   * @param {string} job.retries.unit - the unit of the delay (seconds, minutes, hours, days)
   * @param {number} job.retries.value - the number of the delay
   *
   */
  publish(arg1, arg2) {
    let job;
    let topic;
    if (typeof arg1 === 'string' && typeof arg2 === 'object') {
      job = arg2;
      topic = this.client.topic(topic);
    } else if (typeof arg1 === 'object') {
      job = arg1;
      topic = this.topic;
    }

    const { type, payload = {}, delayed = null, retries = null } = job;

    const attributes = {
      type,
    };

    if (delayed) {
      attributes.delayed = getDelayed(delayed);
    }

    if (retries) {
      attributes.retries = retries;
    }

    return topic.publish(Buffer.from(JSON.stringify(payload)), attributes);
  }
}

module.exports = PubsubPublisher;
