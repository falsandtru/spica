import { Future, AtomicFuture } from './future';

describe('Unit: lib/future', () => {
  describe('Future', () => {
    it('strict', async () => {
      const data = new Future<number>();
      assert(data instanceof Future);
      assert(data.then() instanceof Future === false);
      assert(await data.bind(0) === 0);
      assert.throws(() => data.bind(1));
    });

    it('loose', async () => {
      const data = new Future<number>(false);
      assert(data instanceof Future);
      assert(data.then() instanceof Future === false);
      assert(await data.bind(0) === 0);
      assert(await data.bind(1) === 0);
    });

  });

  describe('AtomicFuture', () => {
    it('strict', async () => {
      const data = new AtomicFuture<number>();
      assert(data instanceof AtomicFuture);
      assert(data.then() instanceof AtomicFuture === false);
      assert(await data.bind(0) === 0);
      assert.throws(() => data.bind(1));
    });

    it('loose', async () => {
      const data = new AtomicFuture<number>(false);
      assert(data instanceof AtomicFuture);
      assert(data.then() instanceof AtomicFuture === false);
      assert(await data.bind(0) === 0);
      assert(await data.bind(1) === 0);
    });

  });

});
