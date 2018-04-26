import { cofetch } from './cofetch';

describe('Unit: lib/cofetch', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('cofetch', () => {
    it('basic', async () => {
      const xhr = await cofetch('');
      assert(xhr instanceof XMLHttpRequest);
    });

    it('cancel', done => {
      const co = cofetch('');
      co.cancel();
      co.catch(reason => {
        assert(reason instanceof Event);
        assert(reason.type === 'abort');
        done();
      });
    });

    it('progress', async () => {
      const co = cofetch('');
      for await (const ev of co) {
        assert(ev instanceof ProgressEvent);
      }
    });

  });

});
