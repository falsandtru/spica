import { tick } from './tick';

describe('Unit: lib/tick', function () {
  describe('tick', function () {
    it('return', function (done) {
      assert(tick(done) === void 0);
    });

    it('sequence', function (done) {
      let cnt = 0;
      tick(() => ++cnt);
      tick(() => assert(cnt === 1) || done());
    });

    it('async', function (done) {
      let async = false;
      tick(() => assert(async === true));
      tick(done);
      async = true;
    });

    it('grouping', function (done) {
      let interrupt = true;
      tick(() => void 0);
      setTimeout(() => interrupt = false, 0);
      tick(() => assert(interrupt === true));
      tick(done);
    });

    it('recursion', function (done) {
      tick(() => tick(done));
    });

    it('dedup', function (done) {
      let cnt = 0;
      function f() {
        ++cnt;
      }
      tick(f, true);
      tick(f, true);
      tick(() => {
        assert(cnt === 1);
        tick(f);
        tick(f);
        tick(() => {
          assert(cnt === 3);
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
