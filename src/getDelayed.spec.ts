import getDelayed from './getDelayed';

const staticDate = new Date('2020-01-01T00:00:00Z');

test('undefined', () => {
  const bla: any = {};
  expect(getDelayed(bla.delayed, staticDate)).toBe(null);
});

test('null', () => {
  expect(getDelayed(null, staticDate)).toBe(null);
});

test('string', () => {
  expect(getDelayed('2020-01-01T00:00:00Z', staticDate)).toBe(
    '2020-01-01T00:00:00.000Z'
  );
});

test('invalid string', () => {
  expect(getDelayed('wth?', staticDate)).toBe(null);
});

test('object', () => {
  expect(
    getDelayed(
      {
        unit: 'd',
        value: 1,
      },
      staticDate
    )
  ).toBe('2020-01-02T00:00:00.000Z');
});
