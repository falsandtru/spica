import { clock } from './chrono';
import { suppressAsyncException } from './exception';

describe('Unit: lib/chrono', function () {
  describe('chrono', function () {
    it('sequence', async function () {
      let cnt = 0;
      assert.deepStrictEqual(
        await Promise.all([
          clock.then(() => ++cnt),
          Promise.resolve().then(() => ++cnt),
          clock.then(() => ++cnt),
        ]),
        [
          1,
          2,
          3,
        ]);
    });

  });

  describe('clock.next', function () {
    it('this', function (done) {
      clock.next(function (this: void) {
        assert(this === undefined);
        done();
      });
    });

  });

  describe('clock.now', function () {
    it('this', function (done) {
      clock.now(function (this: void) {
        assert(this === undefined);
        done();
      });
    });

    it('async', function (done) {
      let async = false;
      let cnt = 0;
      for (let i = 0; i < 10; ++i) {
        clock.now(() => assert(async === true && ++cnt));
      }
      clock.now(() => void assert(cnt === 10 && async === true) || done());
      async = true;
    });

    it('serial', function (done) {
      const size = 1e6;
      let cnt = 0;
      for (let i = 0; i < size; ++i) {
        clock.now(() => ++cnt);
      }
      let interrupt = false;
      Promise.resolve().then(() => interrupt = true);
      clock.now(() => void assert(cnt === size && interrupt === false) || done());
    });

    it('recursion', function (done) {
      clock.now(() => clock.now(done));
    });

    it.skip('separation', function (done) {
      let cnt = 0;
      Promise.resolve().then(() => ++cnt);
      clock.now(() => {
        clock.now(() => void assert(cnt === 0) || done());
      });
    });

    it('recovery', suppressAsyncException(function (done) {
      for (let i = 0; i < 10; ++i) {
        clock.now(() => { throw new Error() });
      }
      clock.now(done);
    }));

  });

});
