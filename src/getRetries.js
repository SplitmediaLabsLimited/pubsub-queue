const defaultRetries = {
  count: 0,
  delay: 1000,
};

module.exports = function getRetries(retries) {
  if (retries) {
    if (typeof retries === 'object' && retries.count) {
      return {
        ...defaultRetries,
        ...retries,
      };
    } else {
      return {
        ...defaultRetries,
        count: retries,
      };
    }
  }

  return defaultRetries;
};
