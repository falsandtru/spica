import {Tick} from './tick';

describe('Unit: lib/tick', function () {
  describe('Tick', function () {
    it('return', function (done) {
      assert(Tick(done) === void 0);
    });

    it('sequence', function (done) {
      let cnt = 0;
      Tick(_ => ++cnt);
      Tick(_ => assert(cnt === 1) || done());
    });

    it('async', function (done) {
      let async = false;
      Tick(_ => assert(async === true));
      Tick(done);
      async = true;
    });

    it('grouping', function (done) {
      let interrupt = true;
      Tick(_ => _);
      setTimeout(() => interrupt = false, 0);
      Tick(_ => assert(interrupt === true));
      Tick(done);
    });

    it('recursion', function (done) {
      Tick(() => Tick(done));
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
