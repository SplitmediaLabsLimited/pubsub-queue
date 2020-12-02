import getRetries, { defaultRetries } from './getRetries';

test('undefined', () => {
  const bla: any = {};
  expect(getRetries(bla.delayed)).toMatchObject(defaultRetries);
});

test('number', () => {
  expect(getRetries(5)).toMatchObject({
    ...defaultRetries,
    count: 5,
  });
});

test('object', () => {
  expect(
    getRetries({
      count: 10,
      delay: 2000,
    })
  ).toMatchObject({
    count: 10,
    delay: 2000,
  });
});
