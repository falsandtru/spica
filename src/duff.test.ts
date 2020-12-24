import { duff, duffbk } from './duff';

describe('Unit: lib/duff', () => {
  describe('duff', () => {
    it('', () => {
      var count = 100;
      duff(count, i => {
        assert(i + count-- === 100);
      });
      assert(count === 0);

      var count = 100;
      duff(-count, i => {
        assert(i + - --count === 0);
      });
      assert(count === 0);
    });

  });

  describe('duffbk', () => {
    it('', () => {
      var count = 100;
      duffbk(count, i => {
        assert(i + count-- === 100);
        if (count === 50) {
          return false;
        }
      });
      assert(count === 50);

      var count = 100;
      duffbk(-count, i => {
        assert(i + - --count === 0);
        if (count === 50) {
          return false;
        }
      });
      assert(count === 50);

    });

  });

});

