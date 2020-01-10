import { Future, AtomicFuture } from './future';

describe('Unit: lib/future', () => {
  describe('Future', () => {
    it('', async () => {
      const data = new Future<number>();
      assert(data.then() instanceof Future === false);
      assert(await data.bind(0) === 0);
      assert(await data.bind(1) === 0);
    });

  });

  describe('AtomicFuture', () => {
    it('', async () => {
      const data = new AtomicFuture<number>();
      assert(data.then() instanceof AtomicFuture === false);
      assert(await data.bind(0) === 0);
      assert(await data.bind(1) === 0);
    });

  });

});
