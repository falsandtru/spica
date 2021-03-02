import { tick } from './clock';

describe('Unit: lib/clock', function () {
  describe('tick', function () {
    it('async', function (done) {
      let async = false;
      let cnt = 0;
      for (let i = 0; i < 10; ++i) {
        tick(() => assert(async === true && ++cnt));
      }
      tick(() => void assert(cnt === 10 && async === true) || done());
      async = true;
    });

    it('serial', function (done) {
      const size = 1000 * 1000;
      let cnt = 0;
      for (let i = 0; i < size; ++i) {
        tick(() => ++cnt);
      }
      let interrupt = false;
      Promise.resolve().then(() => interrupt = true);
      tick(() => void assert(cnt === size && interrupt === false) || done());
    });

    it('recursion', function (done) {
      tick(() => tick(done));
    });

    it('separation', function (done) {
      let cnt = 0;
      tick(() => {
        Promise.resolve().then(() => ++cnt);
        tick(() => void assert(cnt === 1) || done());
      });
    });

    /*
    it.skip('recovery', function (done) {
      for (let i = 0; i < 100; i++) {
        Tick(throwError);
      }
      Tick(done);

      function throwError() {
        throw new Error();
      }
    });
    */

  });

});
