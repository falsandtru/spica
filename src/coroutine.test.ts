import { Coroutine } from './coroutine';

describe('Unit: lib/coroutine', () => {
  if (navigator.userAgent.includes('Edge')) return;

  describe('Coroutine', () => {
    it('basic', async () => {
      assert(1 === await new Coroutine(async function* () {
        yield;
        yield Promise.resolve();
        return 1;
      }));
    });

    it('terminate', done => {
      const co = new Coroutine(async function* () {
        return 0;
      });
      co[Coroutine.terminator]();
      co[Coroutine.terminator](1);
      co.catch(done);
    });

    it('iterator', async () => {
      let cnt = 0;
      const co = new Coroutine<number, number>(async function* () {
        assert(++cnt === 1);
        assert(undefined === (yield Promise.resolve(2)));
        assert(undefined === (yield Promise.resolve(3)));
        return Promise.resolve(4);
      });
      assert(cnt === 1);
      for await (const n of co) {
        assert(n === ++cnt);
      }
      for await (const _ of co) {
        assert(false);
      }
      assert(await co === ++cnt);
      assert(++cnt === 5);
    });

    it('port', async () => {
      const co = new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        assert(2 === (yield Promise.resolve(1)));
        return Promise.resolve(2);
      }, { size: Infinity });
      const port = co[Coroutine.port];
      assert.deepStrictEqual(
        await Promise.all([
          port.recv(),
          port.send(Promise.resolve(1)),
          port.send(Promise.resolve(2)),
          port.send(Promise.resolve(3)).catch(e => e instanceof Error),
          await co,
          port.send(Promise.resolve(4)).catch(e => e instanceof Error),
        ]),
        [
          { value: 0, done: false },
          { value: 1, done: false },
          { value: undefined, done: true },
          true,
          2,
          true,
        ]);
    });

  });

});
