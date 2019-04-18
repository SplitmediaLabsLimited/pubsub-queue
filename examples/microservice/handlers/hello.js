module.exports = {
  retries: {
    count: 5,
    delay: 5000,
  },

  work(payload) {
    console.log('handler! do some interesting stuff here');
    console.log({ payload });

    return;
  },
};
