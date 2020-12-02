export default {
  retries: {
    count: 5,
    delay: 5000,
  },

  async work(payload) {
    console.log('handler! do some interesting stuff here');
    console.log({ payload });

    return;
  },
};
