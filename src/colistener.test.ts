import { Colistener } from './colistener';
import { wait } from './wait';

describe('Unit: lib/colistener', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Colistener', () => {
    it('basic', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      });
      setTimeout(() => document.body.click(), 100);
      setTimeout(() => document.body.click(), 200);
      let cnt = 0;
      for await (const ev of co) {
        assert(ev instanceof Event);
        assert(ev.type === 'click');
        ++cnt === 2 && co.close();
      }
      assert(await co === undefined);
    });

    it('close', async () => {
      const co = new Colistener<Event, number>(() =>
        () => undefined);
      co.close(0);
      assert(await co === 0);
    });

    it('size', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      }, { size: 2 });
      setTimeout(() => {
        document.body.click();
        document.body.click();
      });
      let cnt = 0;
      for await (const ev of co) {
        assert(ev instanceof Event);
        assert(ev.type === 'click');
        ++cnt === 2 && co.close();
      }
      assert(await co === undefined);
    });

    it('throttle', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      }, { resume: () => wait(100) });
      setTimeout(() => {
        document.body.click();
        document.body.click();
      });
      let cnt = 0;
      setTimeout(() => {
        assert(cnt === 1);
        document.body.click();
        document.body.click();
        setTimeout(() => {
          assert(cnt === 2);
          co.close();
        }, 100);
      }, 200);
      for await (const ev of co) {
        assert(ev instanceof Event);
        assert(ev.type === 'click');
        ++cnt;
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
