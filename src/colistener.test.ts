import { Colistener } from './colistener';

describe('Unit: lib/colistener', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Colistener', () => {
    it('basic', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      });
      setTimeout(() => document.body.click());
      for await (const ev of co) {
        assert(ev instanceof Event);
        assert(ev.type === 'click');
        co.close();
      }
      assert(await co === undefined);
    });

    it('exception', async () => {
      const co = new Colistener<void>(listener => {
        setTimeout(() => listener(Promise.reject(0) as any));
        return () => undefined;
      });
      for await (const _ of co) {
      }
      await co.catch(reason => {
        assert(reason === 0);
      });
    });

  });

});
