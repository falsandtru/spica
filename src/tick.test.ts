import { tick } from './clock';

describe('Unit: lib/clock.tick', function () {
  describe('tick', function () {
    it('async', function (done) {
      let async = false;
      tick(() => assert(async === true) || done());
      async = true;
    });

    it('serial', function (done) {
      let cnt = 0;
      let interrupt = false;
      tick(() => ++cnt);
      Promise.resolve().then(() => interrupt = true);
      tick(() => assert(cnt === 1 && interrupt === false) || done());
    });

    it('recursion', function (done) {
      tick(() => tick(done));
    });

    it('separation', function (done) {
      let cnt = 0;
      tick(() => {
        Promise.resolve().then(() => ++cnt);
        tick(() => assert(cnt === 1) || done());
      });
    });

    it('dedup', function (done) {
      let cnt = 0;
      function f() {
        ++cnt;
      }
      tick(f, true);
      tick(() => {
        assert(cnt === 1);
        tick(f);
        tick(f, true);
      });
      tick(f, true);
      tick(() => {
        assert(cnt === 1);
        tick(f);
        tick(f, true);
        tick(() => {
          assert(cnt === 4);
          done();
        });
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
