import { singleton, clear } from './function';

describe('Unit: lib/function', function () {
  describe('singleton', function () {
    it('', () => {
      let cnt = 0;
      const f = singleton(() => ++cnt);
      assert(cnt === 0);
      assert(f() === 1);
      assert(cnt === 1);
      assert(f() === 1);
      assert(cnt === 1);
    });

  });

  describe('clear', function () {
    it('', () => {
      assert.deepStrictEqual(
        clear(() => 0)(),
        undefined);
    });

  });

});
