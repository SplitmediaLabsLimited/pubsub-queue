const isAfter = require('date-fns/is_after');
const EventEmitter = require('events');
const Publisher = require('./publisher');
const sleep = require('./sleep');
const getDelayed = require('./getDelayed');
const getRetries = require('./getRetries');

function safeJSONParse(val) {
  try {
    return JSON.parse(val);
  } catch (err) {
    return val;
  }
}

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
    // get the handler
    const { type } = message.attributes;
    const handler = handlers[type];

    // no handler for this type, crash!
    if (!handler) {
      throw new Error(`No handlers for type "${type}"`);
    }

    // check for delayed
    const delayed =
      message.attributes.delayed ||
      getDelayed(handler.delayed, message.publishTime);

    if (delayed) {
      if (!isAfter(new Date(), new Date(delayed))) {
        // not ready, put it back in the queue
        message.nack();
        return;
      }
    }

    const retries = getRetries(message.attributes.retries || handler.retries);

    // parse data payload
    const dataString = message.data.toString('utf8');
    const data = safeJSONParse(dataString);

    let ackOnStart = false;
    if (typeof message.attributes.ackOnStart === 'boolean') {
      ackOnStart = message.attributes.ackOnStart;
    } else if (typeof handler.ackOnStart === 'boolean') {
      ackOnStart = handler.ackOnStart;
    }

    if (ackOnStart) {
      message.ack();
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

      let extra = await this.runHandler(
        handler,
        data,
        message,
        ackOnStart,
        delayed
      );

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

      if (err.retry !== false && retries.count > 0) {
        let success = false;
        let extra = {};

        retryloop: for (let i = 1; i <= retries.count; i++) {
          try {
            if (success === false) {
              retryCount = i;
              await sleep(retries.delay);
              extra = await this.runHandler(
                handler,
                data,
                message,
                ackOnStart,
                delayed
              );
              success = true;
              break retryloop;
            }
          } catch (err) {
            console.log(`try #${i} failed`);
            if (err.retry === false) {
              break retryloop;
            }
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
            extra,
          });
          return;
        }
      }

      // can only reach this code path here if there's no retries, or if the retry failed
      if (!ackOnStart) {
        message.ack();
      }

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

  async runHandler(handler, data, message, ackOnStart, delayed) {
    let extra = {};

    // do the work !
    const response = await handler.work(data, message);

    if (typeof response === 'string') {
      this.handleRetry(response, message, ackOnStart, delayed);
    } else if (typeof response === 'object') {
      this.handleRetry(response.status, message, ackOnStart, delayed);

      extra = response.extra || {};
    } else if (!ackOnStart) {
      message.ack();
    }

    return extra;
  }

  handleRetry(status, message, ackOnStart, delayed) {
    const retry = status === 'put' || status === 'retry';

    if (ackOnStart) {
      if (retry) {
        // for consistency with message-level delayed,
        // make sure handler-level delayed is the same across retries
        if (delayed && message.attributes.delayed == null) {
          message.attributes.delayed = delayed;
        }

        this.topic.publish(message.data, message.attributes);
      }
    } else if (retry) {
      message.nack();
    } else {
      message.ack();
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
