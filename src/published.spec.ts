import { PubSub } from '@google-cloud/pubsub';
import Publisher from './publisher';

const publish = jest.fn();

// @ts-ignore
const mockClient: PubSub = {
  topic: jest.fn().mockReturnValue({
    publish,
  }),
};

test('object', () => {
  const instance = new Publisher(mockClient, 'some-topic');

  instance.publish({
    type: 'some-type',
    payload: {
      hello: 'world',
    },
  });

  expect(publish).toBeCalledWith(
    Buffer.from(JSON.stringify({ hello: 'world' })),
    {
      type: 'some-type',
    }
  );
});

test('custom topic', () => {
  const instance = new Publisher(mockClient, 'some-topic');

  instance.publish('custom-topic', {
    type: 'some-type',
    payload: {
      hello: 'world',
    },
  });

  expect(mockClient.topic).toBeCalledWith('custom-topic');

  expect(publish).toBeCalledWith(
    Buffer.from(JSON.stringify({ hello: 'world' })),
    {
      type: 'some-type',
    }
  );
});
