import { Coroutine } from './coroutine';
import { never } from './promise';
import { wait } from './timer';

describe('Unit: lib/coroutine', () => {
  describe('Coroutine', () => {
    it('basic', async () => {
      assert(1 === await new Coroutine(async function* () {
        yield;
        return Promise.resolve(1);
      }));
      assert(1 === await new Coroutine(async function* () {
        yield;
        yield Promise.resolve();
        return 1;
      }));
    });

    it('terminate', done => {
      let cnt = 0;
      const co = new Coroutine(async function* () {
        assert(false);
        return;
      });
      co.finally(() => {
        assert(cnt === 0 && ++cnt);
      });
      co[Coroutine.terminate](0);
      assert(cnt === 1 && ++cnt);
      co[Coroutine.terminate](1);
      co.catch(reason => {
        assert(cnt === 2 && ++cnt);
        assert(reason === 0);
      });
      assert(cnt === 3 && ++cnt);
      new Coroutine(async function* () {
        return 0;
      }, { delay: true })
        .then(value => {
          assert(cnt === 5 && ++cnt);
          assert(value === 0);
        });
      co[Coroutine.terminate](never);
      assert(cnt === 4 && ++cnt);
      new Coroutine(async function* () {
        wait(1).then(() => this[Coroutine.terminate](0));
        return never;
      }, { delay: true })
        .catch(reason => {
          assert(cnt === 6 && ++cnt);
          assert(reason === 0);
          done();
        });
    });

    it('iterate', async () => {
      let cnt = 0;
      const co = new Coroutine(async function* () {
        assert(cnt === 1);
        assert(undefined === (yield Promise.resolve(2)));
        assert(undefined === (yield Promise.resolve(3)));
        await wait(100);
        assert(undefined === (yield Promise.resolve(4)));
        return Promise.resolve(5);
      });
      assert(cnt === 0 && ++cnt);
      for await (const n of co) {
        assert(n === ++cnt);
      }
      for await (const _ of co) {
        assert(false);
      }
      assert(await co === ++cnt);
      assert(cnt === 5);
    });

    it('autorun', async () => {
      let cnt = 0;
      for await (const _ of new Coroutine(async function* () {
        assert(cnt === 0 && ++cnt);
        yield;
      })) {
        assert(cnt === 1 && ++cnt);
      }
      assert(cnt === 2 && ++cnt);
    });

    it('trigger', async () => {
      let cnt = 0;
      class C extends Coroutine {
        trigger = '';
      }
      assert(cnt === 0 && ++cnt);
      new C(async function* () {
        assert(cnt === 1 && ++cnt);
      }, { trigger: 'trigger' });
      assert(cnt === 2 && ++cnt);
      new C(async function* () {
        assert(cnt === 3 && ++cnt);
      }, { trigger: ['trigger', 'trigger'] });
      assert(cnt === 4 && ++cnt);
      new Coroutine(async function* () {
        assert(cnt === 5 && ++cnt);
      }, { trigger: 'then' }).then;
      assert(cnt === 6 && ++cnt);
      new Coroutine(async function* () {
        assert(cnt === 7 && ++cnt);
      }, { trigger: Symbol.asyncIterator })[Symbol.asyncIterator];
      assert(cnt === 8 && ++cnt);
    });

    it('port', async () => {
      const co = new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        assert(3 === (yield Promise.resolve(2)));
        return Promise.resolve(4);
      }, { capacity: 0 });
      const port = co[Coroutine.port];
      assert.deepStrictEqual(
        await Promise.all([
          port.recv(),
          port.ask(1),
          port.ask(3),
          port.ask(5).catch(e => e instanceof Error),
          await co,
          port.ask(6).catch(e => e instanceof Error),
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
      }, { capacity: 0 })[Coroutine.port].connect(async function* () {
        assert(2 === (yield 1));
        return 3;
      }));
      assert(true === await new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield Promise.resolve(0)));
        return Promise.resolve(2);
      }, { capacity: 0 })[Coroutine.port].connect(async function* () {
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
      }, { capacity: 0 })[Coroutine.port].connect(async function* () {
        assert(2 === (yield 1));
        assert(4 === (yield 3));
        return 5;
      }));
    });

  });

});
