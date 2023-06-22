import { cofetch } from './cofetch';
import { Cache } from './cache';

describe('Unit: lib/cofetch', () => {
  describe('cofetch', () => {
    it('basic', async () => {
      const co = cofetch('');
      const types = [];
      for await (const ev of co) {
        assert(ev instanceof ProgressEvent);
        assert(['loadstart', 'progress', 'loadend'].includes(ev.type));
        types.push(ev.type);
      }
      assert.deepStrictEqual([types[0], types.at(-1)], ['loadstart', 'loadend']);
      assert.deepStrictEqual(types.slice(1, -1), Array(types.length - 2).fill('progress'));
      assert(await co instanceof XMLHttpRequest);
    });

    it('cancel', async () => {
      const co = cofetch('');
      const types = new Set<string>();
      for await (const ev of co) {
        types.add(ev.type);
        co.cancel();
      }
      assert.deepStrictEqual([...types], ['loadstart', 'loadend']);
      assert(await co instanceof XMLHttpRequest);
    });

    it('cache', async () => {
      cofetch('', { cache: new Cache(9) });
    });

  });

});
