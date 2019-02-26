function delayObjectToString(delayed) {
  let add;
  switch (delayed.unit) {
    case 's':
    case 'sec':
    case 'second':
    case 'seconds':
      add = require('date-fns/add_seconds');
      break;
    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
      add = require('date-fns/add_minutes');
      break;
    case 'h':
    case 'hour':
    case 'hours':
      add = require('date-fns/add_hours');
      break;
    case 'd':
    case 'day':
    case 'days':
      add = require('date-fns/add_days');
      break;
  }

  return add(new Date(), delayed.value).toISOString();
}

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
  publish(job) {
    const { type, payload = {}, delayed = null, retries = null } = job;

    const attributes = {
      type,
    };

    if (delayed) {
      if (typeof delayed === 'string') {
        attributes.delayed = delayed;
      } else if (typeof delayed === 'object') {
        attributes.delayed = delayObjectToString(delayed);
      }
    }

    if (retries) {
      attributes.retries = retries;
    }

    return this.topic.publish(Buffer.from(JSON.stringify(payload)), attributes);
  }
}

module.exports = PubsubPublisher;
