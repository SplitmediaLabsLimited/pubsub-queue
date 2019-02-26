const isAfter = require('date-fns/is_after');
const EventEmitter = require('events');

const Publisher = require('./publisher');

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
    const { type, delayed, retries } = message.attributes;

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

      // do the work !
      await handler.work(data, message);

      // ack the message
      message.ack();

      // send an event that we're done with the job
      this.emit('job.handled', {
        id: message.id,
        type,
        delayed,
        retries,
        payload: data,
      });
    } catch (err) {
      if (retries) {
        let success = false;

        retryloop: for (let i = 1; i <= retries; i++) {
          try {
            if (success === false) {
              await handler.work(data, message);
              message.ack();
              success = true;
              break retryloop;
            }
          } catch (err) {
            console.log(`retry #${i}`);
          }
        }

        if (success) {
          this.emit('job.handled', {
            id: message.id,
            type,
            delayed,
            retries,
            retried: true,
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
        delayed,
        retries,
        payload: data,
      });

      // send event that we have buried the job
      this.emit('job.buried', {
        id: message.id,
        type,
        delayed,
        retries,
        payload: data,
      });
    }
  }

  /**
   * Start the worker
   */
  start(handlers = {}) {
    this.topic
      .subscription(this.queueConfig.subscriptionName)
      .on('message', message => this.work(handlers, message));
  }
}

module.exports = PubsubWorker;
