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
        yield Promise.resolve(2);
        yield Promise.resolve(3);
        return 4;
      });
      assert(cnt === 1);
      for await (const n of co) {
        assert(n === ++cnt);
      }
      for await (const _ of co) {
        assert(false);
      }
      assert(await co === ++cnt);
    });

    it('port', async () => {
      const co = new Coroutine<number, number, number>(async function* () {
        assert((yield Promise.resolve(1)) === 1);
        assert((yield Promise.resolve(2)) === 2);
        return 2;
      }, { size: Infinity });
      const port = co[Coroutine.port];
      assert.deepStrictEqual(
        await Promise.all([
          port.send(Promise.resolve(0)),
          port.send(Promise.resolve(1)),
          port.send(Promise.resolve(2)),
          port.send(Promise.resolve(3)).catch(e => e instanceof Error),
          await co,
          port.send(Promise.resolve(4)).catch(e => e instanceof Error),
        ]),
        [
          { value: 1, done: false },
          { value: 2, done: false },
          { value: undefined, done: true },
          true,
          2,
          true,
        ]);
    });

    it('Skip the currect state.', async () => {
      const port = new Coroutine<number, number, number>(async function* () {
        yield Promise.resolve(1);
        yield Promise.resolve(2);
        return 2;
      }, { size: Infinity })[Coroutine.port];
      port.send(1);
      assert.deepStrictEqual(await port.recv(), { value: 1, done: false });
      port.send(2);
      assert.deepStrictEqual(await port.recv(), { value: 2, done: false });
    });

  });

});
