// const PubsubQueue = require('@splitmedialabs/pubsub-queue');
// import PubsubQueue from '@splitmedialabs/pubsub-queue';
import PubsubQueue from '../../lib';
import { Handlers } from '../../lib/worker';
import hello from './handlers/hello';

// obviously, change all the configs here
const Pubsub = new PubsubQueue(
  {
    // connection config
    projectId: 'my-gcp-project-id',
    keyFilename: '~/gcp.json',
  },
  {
    // topics and subscriptions config
    topicName: 'worker-test', // name of the topic for the jobs
    buriedTopicName: 'worker-test-buried', // name of the buried topics. When a job fails, it'll get published here
    subscriptionName: 'test-sub', // name of the subscription under the topic
  }
);

// This is usually sent from another microservice but for this
// example, we'll just send a job before starting the workers
Pubsub.Publisher.publish({
  type: 'hello', // name of the handler
  payload: {
    hello: 'world delayed',
  }, // arbitrary payload. Will be serialized to JSON
  delayed: {
    // job will only be executed after this date
    unit: 'seconds',
    value: 20,
  },
});

const handlers: Handlers = {
  hello,
  // can also be defined inline
  helloworld: {
    async work(payload) {
      return;
    },
  },
};

/** handlers can also be a function
 *
 * const handlers = type => ({
 *  async work(payload) {
 *    // do something meaningful
 *    return ;
 *  }
 * })
 *
 */

// when a job is done
Pubsub.Worker.on('job.handled', (data) =>
  console.log('job finished succesfully!', data)
);

// when a job failed
Pubsub.Worker.on('job.buried', (data) => console.log('job failed!', data)); // when a job has failed

Pubsub.Worker.start(handlers);
