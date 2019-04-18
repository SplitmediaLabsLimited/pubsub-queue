# PubsubQueue

A Google Cloud Pubsub client for node.js geared towards queues and jobs. Inspired by ceejbot/fivebeans

## Installation

Node 8+ required

```
yarn add @splitmedialabs/pubsub-queue
```

## Usage

### Pre-requisite

- a GCP account and project
- a Pubsub Topic for the main jobs
  - a Subscription for this topic
- a Pubsub topic for the failed jobs
- a JSON keyFilename with correct IAM permissions for PubSub

### Publishing jobs

```javascript
const PubsubQueue = require('@splitmedialabs/pubsub-queue');

const Pubsub = new PubsubQueue(
  {
    // connection config
    projectId: 'my-gcp-project-id',
    keyFilename: '~/gcp.json',
  },
  {
    // topics and subscriptions config
    topicName: 'worker-test', // name of the default topicName for the jobs
    buriedTopicName: 'worker-test-buried', // name of the buried topics. When a job fails, it'll get published here
    subscriptionName: 'test-sub', // name of the subscription under the topic
  }
);

// minimal job publishing. This will publish the job to the default topicName
Pubsub.Publisher.publish({
  type: 'hello', // name of the handler
  payload: {
    hello: 'world! simple',
  }, // arbitrary payload. Will be serialized to JSON
});

// all bells and whistle
Pubsub.Publisher.publish({
  type: 'hello-fail', // name of the handler
  payload: {
    hello: 'world delayed',
  }, // arbitrary payload. Will be serialized to JSON
  delayed: {
    // job will only be executed after this date
    unit: 'seconds',
    value: '10',
  },
});

// custom topic
Pubsub.Publisher.publish('custom-topic-name', {
  type: 'hello-fail', // name of the handler
  payload: {
    hello: 'world delayed',
  }, // arbitrary payload. Will be serialized to JSON
  // will only sttart after this date
  delayed: new Date(new Date().getTime() + 10000).toISOString(),
});
```

### Workers

```javascript
// # handlers/hello.js
module.exports = {
  async work(payload) {
    console.log('job-handler', { payload });

    return; // any return means success
  },
};

// # handlers/hello-repeat.js
module.exports = {
  async work(payload) {
    console.log('job-handler', { payload });

    return 'put'; // the job will be succesful but will be put back on the queue
  },
};

// # handlers/hello-fail.js
module.exports = {
  retries: {
    count: 5, // how many times to retry this job
    delay: 1000, // delay between each retries
  },
  async work(payload) {
    console.log('job-handler', { payload });

    throw new Error('Fake Error!'); // throwing will fail the job
  },
};

// # index.js
const PubsubQueue = require('@splitmedialabs/pubsub-queue');

const Pubsub = new PubsubQueue(
  {
    // connection config
    projectId: 'my-gcp-project-id',
    keyFilename: '~/gcp.json',
  },
  {
    // topics and subscriptions config
    topicName: 'worker-test',
    buriedTopicName: 'worker-test-buried',
    subscriptionName: 'test-sub',
  }
);

const handlers = {
  hello: require('./handlers/hello'),
  'hello-repeat': require('./handlers/hello-repeat'),
  'hello-fail': require('./handlers/hello-fail'),
};

Pubsub.Worker.start(handlers);
```

### Attaching events handlers to workers

This is useful for statistics

```javascript
const handlers = {};

Pubsub.Worker.on('job.reserved', data => console.log(data)); // when a job is starting
Pubsub.Worker.on('job.handled', data => console.log(data)); // when a job is done
Pubsub.Worker.on('job.buried', data => console.log(data)); // when a job has failed

Pubsub.Worker.start(handlers);
```
