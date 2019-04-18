const isAfter = require('date-fns/is_after');
const EventEmitter = require('events');
const Publisher = require('./publisher');
const sleep = require('./sleep');
const getRetries = require('./getRetries');

class PubsubWorker extends EventEmitter {
  constructor(client, queueConfig) {
    super();
    this.client = client;
    this.queueConfig = queueConfig;
    this.topic = this.client.topic(queueConfig.topicName);

    this.publisher = new Publisher(this.client, queueConfig.topicName);
    this.buriedPublisher = new Publisher(
      this.client,
      queueConfig.buriedTopicName
    );
  }

  async work(handlers, message) {
    // parse data payload
    const dataString = message.data.toString('utf8');
    const data = JSON.parse(dataString);

    // extract relevant attributes
    const { type, delayed } = message.attributes;

    // check for delayed
    if (delayed) {
      if (!isAfter(new Date(), new Date(delayed))) {
        // not ready, put it back in the queue
        message.nack();
        return;
      }
    }

    // get the handler
    const handler = handlers[type];

    const retries = getRetries(message.attributes.retries, handler.retries);

    // no handler for this type, crash!
    if (!handler) {
      throw new Error(`No handlers for type "${type}"`);
    }

    try {
      // send event that we've picked up a job
      this.emit('job.reserved', {
        id: message.id,
        type,
        delayed,
        retries,
        payload: data,
      });

      let extra = {};

      // do the work !
      const response = await handler.work(data, message);

      if (typeof response === 'string') {
        if (response === 'put' || response === 'retry') {
          message.nack();
        } else {
          message.ack();
        }
      } else if (typeof response === 'object') {
        if (response.status === 'put' || response.status === 'retry') {
          message.nack();
        } else {
          message.ack();
        }

        extra = response.extra || {};
      } else {
        message.ack();
      }

      // send an event that we're done with the job
      this.emit('job.handled', {
        id: message.id,
        type,
        delayed,
        retries,
        payload: data,
        extra,
      });
    } catch (err) {
      let retryCount = 0;

      if (retries.count > 0) {
        let success = false;

        retryloop: for (let i = 1; i <= retries.count; i++) {
          try {
            if (success === false) {
              retryCount = i;
              await sleep(retries.delay);
              await handler.work(data, message);
              message.ack();
              success = true;
              break retryloop;
            }
          } catch (err) {
            console.log(`try #${i} failed`);
          }
        }

        if (success) {
          this.emit('job.handled', {
            id: message.id,
            type,
            delayed,
            retries,
            retried: true,
            retryCount,
            payload: data,
          });
          message.ack();
          return;
        }
      }

      // can only reach this code path here if there's no retries, or if the retry failed
      message.ack();

      // republish in the buried tube
      this.buriedPublisher.publish({
        type,
        payload: data,
      });

      // send event that we have buried the job
      this.emit('job.buried', {
        id: message.id,
        type,
        delayed,
        retries,
        retryCount,
        payload: data,
        error: err,
      });
    }
  }

  /**
   * Start the worker
   */
  start(handlers = {}, options = {}) {
    this.topic
      .subscription(this.queueConfig.subscriptionName, options)
      .on('message', message => this.work(handlers, message));
  }
}

module.exports = PubsubWorker;
