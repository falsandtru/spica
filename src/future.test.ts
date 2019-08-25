import { Future, AtomicFuture } from './future';

describe('Unit: lib/future', () => {
  describe('Future', () => {
    it('', async () => {
      setTimeout(() => data.bind(0));
      const data = new Future<number>();
      assert(data.then() instanceof Future === false);
      assert(await data === 0);
      assert.throws(() => data.bind(0));
    });

  });

  describe('AtomicFuture', () => {
    it('', async () => {
      let cnt = 0;
      new AtomicFuture().bind().then(() => assert(++cnt === 1));
      assert(++cnt === 2);
    });

  });

});
