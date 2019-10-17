function delayObjectToString(delayed, from) {
  let add;
  switch (delayed.unit) {
    case 's':
    case 'sec':
    case 'second':
    case 'seconds':
      add = require('date-fns/add_seconds');
      break;
    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
      add = require('date-fns/add_minutes');
      break;
    case 'h':
    case 'hour':
    case 'hours':
      add = require('date-fns/add_hours');
      break;
    case 'd':
    case 'day':
    case 'days':
      add = require('date-fns/add_days');
      break;
  }

  return add(from, delayed.value).toISOString();
}

module.exports = function getDelayed(delayed, from = new Date()) {
  if (delayed == null) {
    return null;
  } else if (typeof delayed === 'string') {
    return delayed;
  } else if (typeof delayed === 'object') {
    return delayObjectToString(delayed, from);
  }
};
