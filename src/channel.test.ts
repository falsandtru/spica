import { Channel } from './channel';
import { wait } from './timer';

describe('Unit: lib/channel', function () {
  describe('channel', function () {
    it('buffer 0', async function () {
      assert(await Promise.race([new Channel().take(), wait(1).then(() => -1)]) === -1);
      assert(await Promise.race([new Channel().put(), wait(1).then(() => -1)]) === -1);
      await (async ch => {
        assert(await Promise.race([ch.put(0), wait(1).then(() => -1)]) === -1);
        assert(await ch.take() === 0);
        assert(await Promise.race([ch.take(), wait(1).then(() => -1)]) === -1);
      })(new Channel<number>());
      await (async ch => {
        assert(await Promise.race([ch.take(), wait(1).then(() => -1)]) === -1);
        assert(await ch.put(0) === undefined);
        assert(await Promise.race([ch.put(0), wait(1).then(() => -1)]) === -1);
      })(new Channel<number>());
    });

    it('buffer 1', async function () {
      assert(await Promise.race([new Channel(1).take(), wait(1).then(() => -1)]) === -1);
      assert(await Promise.race([new Channel(1).put(), wait(1).then(() => -1)]) === undefined);
      await (async ch => {
        assert(await Promise.race([ch.put(0), wait(1).then(() => -1)]) === undefined);
        assert(await ch.take() === 0);
        assert(await Promise.race([ch.take(), wait(1).then(() => -1)]) === -1);
      })(new Channel<number>(1));
      await (async ch => {
        assert(await Promise.race([ch.take(), wait(1).then(() => -1)]) === -1);
        assert(await ch.put(0) === undefined);
        assert(await Promise.race([ch.put(0), wait(1).then(() => -1)]) === undefined);
      })(new Channel<number>(1));
    });

  });

});
