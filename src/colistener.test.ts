import { Colistener } from './colistener';
import { wait } from './clock';

describe('Unit: lib/colistener', () => {
  describe('Colistener', () => {
    it('basic', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      });
      document.body!.click();
      setTimeout(() => document.body!.click(), 100);
      let cnt = 0;
      for await (const ev of co) {
        assert(ev instanceof Event);
        assert(ev.type === 'click');
        ++cnt === 2 && co.close();
      }
      assert(await co === undefined);
    });

    it('size', async () => {
      const co = new Colistener<Event>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      }, { sendBufferSize: 2 });
      setTimeout(() => {
        document.body!.click();
        document.body!.click();
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
      }, { sendBufferSize: 1, resume: () => wait(100) });
      setTimeout(() => {
        document.body!.click();
        document.body!.click();
      });
      let cnt = 0;
      setTimeout(() => {
        assert(cnt === 1);
        document.body!.click();
        document.body!.click();
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

    it('close', async () => {
      const co = new Colistener<Event, number>(listener => {
        document.addEventListener('click', listener);
        return () => void document.removeEventListener('click', listener);
      }, { sendBufferSize: Infinity });
      setTimeout(() => {
        document.body!.click();
        document.body!.click();
      });
      let cnt = 0;
      for await (const _ of co) {
        assert(++cnt === 1);
        co.close(0);
      }
      assert(await co === 0);
    });

    it('terminate', async () => {
      const co = new Colistener<void>(() => {
        return () => undefined;
      });
      co[Colistener.terminate](1);
      assert(await co.catch(reason => reason) === 1);
    });

  });

});
