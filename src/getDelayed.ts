import { addSeconds, addMinutes, addHours, addDays } from 'date-fns';

export type DelayedConfig = {
  unit:
    | 's'
    | 'sec'
    | 'second'
    | 'seconds'
    | 'm'
    | 'min'
    | 'minute'
    | 'minutes'
    | 'h'
    | 'hour'
    | 'hours'
    | 'd'
    | 'day'
    | 'days';
  value: number;
};

function delayObjectToString(delayed: DelayedConfig, from: Date): string {
  let add;
  switch (delayed.unit) {
    case 's':
    case 'sec':
    case 'second':
    case 'seconds':
      add = addSeconds;
      break;
    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
      add = addMinutes;
      break;
    case 'h':
    case 'hour':
    case 'hours':
      add = addHours;
      break;
    case 'd':
    case 'day':
    case 'days':
      add = addDays;
      break;
  }

  return add(from, delayed.value).toISOString();
}

export default function getDelayed(
  delayed?: DelayedConfig | string | null,
  from: Date = new Date()
) {
  if (!delayed) {
    return null;
  }

  if (typeof delayed === 'string') {
    const parsed = new Date(delayed);

    // @ts-ignore
    if (isNaN(parsed)) {
      return null;
    }

    return parsed.toISOString();
  } else if (typeof delayed === 'object') {
    return delayObjectToString(delayed, from);
  }
}
