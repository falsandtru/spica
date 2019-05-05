import { tick } from './clock';

describe('Unit: lib/clock.tick', function () {
  describe('tick', function () {
    it('async', function (done) {
      let async = false;
      tick(() => void assert(async === true) || done());
      async = true;
    });

    it('serial', function (done) {
      let cnt = 0;
      let interrupt = false;
      tick(() => ++cnt);
      Promise.resolve().then(() => interrupt = true);
      tick(() => void assert(cnt === 1 && interrupt === false) || done());
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
