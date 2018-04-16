import { Future } from './future';

describe('Unit: lib/future', () => {
  describe('Future', () => {
    it('', async () => {
      setTimeout(() => data.bind(0));
      const data = new Future<number>();
      assert(!(data.then() instanceof Future));
      assert(await data === 0);
      assert(await data.bind(0) === 0);
      assert(await data.bind(1).then(() => Promise.reject(0), () => 1));
    });

  });

});
