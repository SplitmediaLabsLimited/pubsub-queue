module.exports = new class Hello {
  async work(payload) {
    console.log('handler! do some interesting stuff here');
    console.log({ payload });

    return;
  }
}();
