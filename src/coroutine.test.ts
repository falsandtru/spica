import { Coroutine } from './coroutine';
import { wait } from './clock';

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
      let cnt = 0;
      const co = new Coroutine(async function* () {
        assert(cnt === 0 && ++cnt);
        return 0;
      });
      co.finally(() => {
        assert(cnt === 1 && ++cnt);
      });
      co[Coroutine.terminator]();
      assert(cnt === 2 && ++cnt);
      co[Coroutine.terminator](1);
      co.catch(done);
    });

    it('iterate', async () => {
      let cnt = 0;
      const co = new Coroutine<number, number>(async function* () {
        assert(++cnt === 1);
        assert(undefined === (yield Promise.resolve(2)));
        assert(undefined === (yield Promise.resolve(3)));
        await wait(100);
        assert(undefined === (yield Promise.resolve(4)));
        return Promise.resolve(5);
      });
      assert(cnt === 1);
      for await (const n of co) {
        assert(n === ++cnt);
      }
      for await (const _ of co) {
        assert(false);
      }
      assert(await co === ++cnt);
      assert(cnt === 5);
    });

    it('port', async () => {
      const co = new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        assert(3 === (yield Promise.resolve(2)));
        return Promise.resolve(4);
      }, { size: Infinity });
      const port = co[Coroutine.port];
      assert.deepStrictEqual(
        await Promise.all([
          port.recv(),
          port.send(Promise.resolve(1)),
          port.send(Promise.resolve(3)),
          port.send(Promise.resolve(5)).catch(e => e instanceof Error),
          await co,
          port.send(Promise.resolve(6)).catch(e => e instanceof Error),
        ]),
        [
          { value: 0, done: false },
          { value: 2, done: false },
          { value: 4, done: true },
          true,
          4,
          true,
        ]);
      assert(3 === await new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        yield Promise.resolve(2);
        assert(false);
        throw 1;
      }, { size: Infinity })[Coroutine.port].connect(function* () {
        assert(2 === (yield 1));
        return 3;
      }));
      assert(true === await new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        return Promise.resolve(2);
      }, { size: Infinity })[Coroutine.port].connect(function* () {
        assert(2 === (yield 1));
        try {
          yield 3;
        }
        finally {
          //assert(false);
          return NaN;
        }
      }).catch(e => e instanceof Error));
      assert(5 === await new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        assert(3 === (yield Promise.resolve(2)));
        return Promise.resolve(4);
      }, { size: Infinity })[Coroutine.port].connect(function* () {
        assert(2 === (yield 1));
        assert(4 === (yield 3));
        return 5;
      }));
    });

  });

});
