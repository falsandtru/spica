import { Tick } from './tick';

describe('Unit: lib/tick', function () {
  describe('Tick', function () {
    it('return', function (done) {
      assert(Tick(done) === void 0);
    });

    it('sequence', function (done) {
      let cnt = 0;
      Tick(() => ++cnt);
      Tick(() => assert(cnt === 1) || done());
    });

    it('async', function (done) {
      let async = false;
      Tick(() => assert(async === true));
      Tick(done);
      async = true;
    });

    it('grouping', function (done) {
      let interrupt = true;
      Tick(() => void 0);
      setTimeout(() => interrupt = false, 0);
      Tick(() => assert(interrupt === true));
      Tick(done);
    });

    it('recursion', function (done) {
      Tick(() => Tick(done));
    });

    it('dedup', function (done) {
      let cnt = 0;
      function f() {
        ++cnt;
      }
      Tick(f, true);
      Tick(f, true);
      Tick(() => {
        assert(cnt === 1);
        Tick(f);
        Tick(f);
        Tick(() => {
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
