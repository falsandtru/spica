import { generative } from './collection';
import { Cache } from './cache';

describe('Unit: lib/collection', () => {
  describe('generative', () => {
    it('Map', () => {
      let cnt = 0;
      const collection = generative(new Map<number, number>(), key => key + ++cnt);
      assert(collection.get(0) === 1);
      assert(collection.get(0) === 1);
    });

    it('Cache', () => {
      let cnt = 0;
      const collection = generative(new Cache<number, number>(9), key => key + ++cnt);
      assert(collection.get(0) === 1);
      assert(collection.get(0) === 1);
    });

  });

});
