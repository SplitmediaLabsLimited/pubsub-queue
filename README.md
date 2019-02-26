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

```lang=js
const PubsubQueue = require('@splitmedialabs/pubsub-queue');

const Pubsub = new PubsubQueue({
  // connection config
  projectId: 'my-gcp-project-id',
  keyFilename: '~/gcp.json',
}, {
  // topics and subscriptions config
  topicName: 'worker-test',               // name of the topic for the jobs
  buriedTopicName: 'worker-test-buried',  // name of the buried topics. When a job fails, it'll get published here
  subscriptionName: 'test-sub',           // name of the subscription under the topic
});

// minimal job publishing
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
  retries: '5', // How many times this job will be retried if it fails
  delayed: { // job will only be executed after this date
    unit: 'seconds',
    value: '10',
  },
});

```

### Workers

```lang=js
// # handlers/hello.js
module.exports = new class Hello {
  async work(payload) {
    console.log('job-handler', { payload });

    return; // any return means success
  }
}

// # handlers/hello-fail.js
module.exports = new class HelloFail {
  async work(payload) {
    console.log('job-handler', { payload });

    throw new Error("Fake Error!"); // throwing will fail the job
  }
}

// # index.js
const PubsubQueue = require('@splitmedialabs/pubsub-queue');

const Pubsub = new PubsubQueue({
  // connection config
  projectId: 'my-gcp-project-id',
  keyFilename: '~/gcp.json',
}, {
  // topics and subscriptions config
  topicName: 'worker-test',
  buriedTopicName: 'worker-test-buried',
  subscriptionName: 'test-sub',
});

const handlers = {
  hello: require('./handlers/hello'),
  "hello-fail": require('./handlers/hello-fail'),
}

Pubsub.Worker.start(handlers);

```

### Attaching events handlers to workers

This is useful for statistics

```lang=js
const handlers = {}

Pubsub.Worker.on('job.reserved', data => console.log(data)) // when a job is starting
Pubsub.Worker.on('job.handled', data => console.log(data)) // when a job is done
Pubsub.Worker.on('job.buried', data => console.log(data)) // when a job has failed

Pubsub.Worker.start(handlers);
```
