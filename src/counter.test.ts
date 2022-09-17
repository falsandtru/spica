import { counter } from './counter';

describe('Unit: lib/counter', () => {
  describe('counter', () => {
    for (const radix of [10, 16, 32, 36]) {
      it(`${radix}`, () => {
        const count = counter(radix);
        for (let i = 1; i < 1e5; ++i) {
          assert(count() === i.toString(radix));
        }
      });
    }

    it('pad', () => {
      const count = counter(10, '00');
      for (let i = 1; i < 1000; ++i) {
        assert(count() === i.toString(10).padStart(2, '0'));
      }
    });

  });

});
