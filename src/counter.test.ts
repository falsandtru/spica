import { counter } from './counter';

describe('Unit: lib/counter', () => {
  describe('counter', () => {
    it('10', () => {
      const count = counter();
      for (let i = 1; i < 1000; ++i) {
        assert(count() === i.toString(10));
      }
    });

    it('16', () => {
      const count = counter(16);
      for (let i = 1; i < 1000; ++i) {
        assert(count() === i.toString(16));
      }
    });

    it('32', () => {
      const count = counter(32);
      for (let i = 1; i < 1000; ++i) {
        assert(count() === i.toString(32));
      }
    });

    it('36', () => {
      const count = counter(36);
      for (let i = 1; i < 1000; ++i) {
        assert(count() === i.toString(36));
      }
    });

  });

});
