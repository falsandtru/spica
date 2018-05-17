import { cofetch } from './cofetch';

describe('Unit: lib/cofetch', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('cofetch', () => {
    it('basic', async () => {
      const co = cofetch('');
      const types = new Set<string>();
      for await (const ev of co) {
        assert(ev instanceof ProgressEvent);
        assert(['loadstart', 'progress', 'loadend'].includes(ev.type));
        types.add(ev.type);
        if (ev.type !== 'loadend') continue;
        for await (const _ of co) throw 1;
      }
      assert.deepStrictEqual([...types], ['loadstart', 'progress', 'loadend']);
      assert(await co instanceof XMLHttpRequest);
    });

    it('cancel', async () => {
      const co = cofetch('');
      for await (const ev of co) {
        co.cancel();
        if (ev.type !== 'loadend') continue;
        for await (const _ of co) throw 1;
        return co.then(
          () => Promise.reject(),
          reason => {
            assert(reason instanceof Event);
            assert(reason.type === 'abort');
          });
      }
      throw 1;
    });

  });

});
