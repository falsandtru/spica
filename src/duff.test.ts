import { duff, duffbk } from './duff';

describe('Unit: lib/duff', () => {
  describe('duff', () => {
    it('', () => {
      var count = 100;
      duff(count, function () {
        count--;
      });
      assert(count === 0);

      var count = 1000;
      duff(count, function () {
        count--;
      });
      assert(count === 0);

      var count = 100;
      duff(-count, function () {
        count--;
      });
      assert(count === 0);

      var count = 1000;
      duff(-count, function () {
        count--;
      });
      assert(count === 0);
    });

  });

  describe('duffbk', () => {
    it('', () => {
    var count = 100;
    duffbk(count, function () {
      count--;
      if (count === 50) {
        return false;
      }
    });
    assert(count === 50);

    var count = 1000;
    duffbk(count, function () {
      count--;
      if (count === 500) {
        return false;
      }
    });
    assert(count === 500);

    var count = 100;
    duffbk(-count, function () {
      count--;
      if (count === 50) {
        return false;
      }
    });
    assert(count === 50);

    var count = 1000;
    duffbk(-count, function () {
      count--;
      if (count === 500) {
        return false;
      }
    });
    assert(count === 500);

    });

  });

});

