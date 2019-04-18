const defaultRetries = {
  count: 0,
  delay: 1000,
};

module.exports = function getRetries(messageRetries, handlerRetries) {
  if (messageRetries) {
    if (typeof messageRetries === 'object' && messageRetries.count) {
      return {
        ...defaultRetries,
        ...messageRetries,
      };
    } else {
      return {
        ...defaultRetries,
        count: messageRetries,
      };
    }
  }

  if (handlerRetries) {
    if (typeof handlerRetries === 'object' && handlerRetries.count) {
      return {
        ...defaultRetries,
        ...handlerRetries,
      };
    } else {
      return {
        ...defaultRetries,
        count: handlerRetries,
      };
    }
  }

  return defaultRetries;
};
