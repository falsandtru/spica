import { Supervisor } from './supervisor';
import { Coroutine } from './coroutine';
import { tick } from './clock';
import { wait } from './timer';
import { never } from './promise';
import { Sequence } from './sequence';

describe('Unit: lib/supervisor', function () {
  describe('Supervisor', function () {
    before(() => {
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
    });

    afterEach(() => {
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
    });

    it('extend', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }

      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);

      const sv1 = new TestSupervisor();
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);

      const sv2 = new class TestSupervisor extends Supervisor<string, number, number, number> {
      }();
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);

      assert(class extends TestSupervisor { }.status.instances === 0);
      assert(class extends TestSupervisor { }.status.processes === 0);

      const process: Supervisor.Process<number, number, number> = {
        init: (state) => state,
        main: (n, s) => [n, ++s],
        exit: () => undefined
      };
      const kill = sv1.register('', process, 0);
      assert.deepStrictEqual(sv1.refs(), [
        ['', process, 0, kill]
      ]);
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 1);
      sv1.kill('');
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      sv1.terminate();
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      sv2.terminate();
      assert(Supervisor.status.instances === 0);
      assert(Supervisor.status.processes === 0);
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      done();
    });

    it('refs', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      const sv = new TestSupervisor();
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      const process: Supervisor.Process<number, number, number> = {
        init: (state) => state,
        main: (n, s) => [n, ++s],
        exit: () => undefined
      };
      const kill = sv.register('', process, 0);
      assert.deepStrictEqual(sv.refs(), [
        ['', process, 0, kill]
      ]);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 1);
      sv.kill('');
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      sv.terminate();
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      done();
    });

    it('lifecycle', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      const sv = new TestSupervisor({
        name: '',
        destructor: reason => {
          assert(reason === undefined);
          assert(cnt === 13 && ++cnt);
          assert.throws(() => sv.register('', () => [0, 0], 0));
          assert.throws(() => sv.cast('', 0));
          assert.throws(() => sv.call('', 0, () => undefined));
          assert(sv.terminate() === false);
          assert(TestSupervisor.status.instances === 0);
          assert(TestSupervisor.status.processes === 0);
          done();
        }
      });
      assert(+sv.id > 0);
      assert(sv.name === '');
      sv.events.init
        .monitor([], ([name, process, state]) => {
          assert(TestSupervisor.status.processes === 1);
          assert(cnt === 1 && ++cnt);
          assert(name === '');
          assert(process.init instanceof Function);
          assert(process.main instanceof Function);
          assert(process.exit instanceof Function);
          assert(state === 0);
        });
      sv.events.loss
        .monitor([], ([name, param]) => {
          assert(TestSupervisor.status.processes === 0);
          assert(name === '');
          switch (cnt) {
            case 11:
              assert(param === 4 && ++cnt);
              break;
            case 14:
              assert(param === 0 && ++cnt);
              break;
            default:
              assert(cnt === NaN);
          }
        });
      sv.events.exit
        .monitor([], ([name, process, state, reason]) => {
          assert(TestSupervisor.status.processes === 0);
          assert(cnt === 9 && ++cnt);
          assert(name === '');
          assert(process.init instanceof Function);
          assert(process.main instanceof Function);
          assert(process.exit instanceof Function);
          assert(state === 2);
          assert(reason instanceof Error);
        });
      sv.register('', {
        init(state) {
          assert(TestSupervisor.status.processes === 1);
          assert(cnt === 2 && ++cnt);
          assert(state === 0);
          return state;
        },
        main(n: number, state: number): [number, number] {
          assert(TestSupervisor.status.processes === 1);
          switch (cnt) {
            case 3:
              assert(n === 2 && ++cnt);
              break;
            case 5:
              assert(n === 1 && ++cnt);
              break;
            case 7:
              assert(n === 3 && ++cnt);
              throw new Error();
            default:
              throw new Error();
          }
          return [-n, ++state];
        },
        exit(reason, state) {
          assert(TestSupervisor.status.processes === 0);
          assert(cnt === 8 && ++cnt);
          assert(reason instanceof Error);
          assert(state === 2);
        }
      }, 0);
      assert(cnt === 0 && ++cnt);
      sv.call('', 1, (r, _) => void assert(TestSupervisor.status.processes === 1) || void assert(r === -1) || assert(cnt === 6 && ++cnt));
      assert(sv.cast('', 2) === true);
      sv.call('', 3, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 10 && ++cnt));
      sv.call('', 4, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || void assert(cnt === 12 && ++cnt) || sv.terminate(), 100);
      assert(cnt === 4 && ++cnt);
    });

    it('register', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.events.exit.once([''], done);
      sv.register('', (_, s) => [s, s], 1);
      assert.throws(() => sv.register('', (_, s) => [s, s], 2));
      done();
    });

    it('validation of returned values', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> {
      }();
      sv.register('', () => new Promise<any>(resolve => void resolve(undefined)), 0);
      sv.call('', 0, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || done());
    });

    it('state', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', (n, s) => Promise.resolve([n + s, ++s]), 0);
      sv.call('', 1, (n, _) => assert(n === 1));
      sv.call('', 2, (n, _) => void assert(n === 3) || done(), 100);
    });

    it('exit', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      let inits = 0;
      let exits = 0;
      sv.register('', {
        init: () => ++inits,
        main: (n, s) => [n + s, ++s],
        exit: () => ++exits
      }, 0);
      assert(inits === exits);
      assert(inits === 0);
      sv.kill('', 0);
      assert(inits === exits);
      assert(inits === 0);
      sv.register('', {
        init: () => ++inits,
        main: (n, s) => [n + s, ++s],
        exit: () => ++exits
      }, 0);
      sv.cast('', 1);
      assert(inits === 1);
      assert(exits === 0);
      sv.kill('', 0);
      assert(inits === exits);
      assert(inits === 1);
      done();
    });

    it('generator', async function () {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      // This type annotation should be removed after #36053 is fixed.
      sv.register('', function* (state): Generator<number, number, number> {
        assert(state === 0);
        assert(1 === (yield 0));
        assert(2 === (yield 1));
        return 2;
      }, 0);
      assert(await sv.call('', 1) === 1);
      await wait(100);
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(await sv.call('', 2) === 2);
      await wait(100);
      assert(sv.kill('') === false);
      // This type annotation should be removed after #36053 is fixed.
      sv.register('', function* (): Generator<number, number, number> {
        throw 1;
      }, 0);
      sv.cast('', 0);
      assert(sv.refs('').length === 0);
      assert(sv.kill('') === false);
    });

    it('async generator', async function () {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', async function* (state) {
        assert(state === 0);
        assert(1 === (yield 0));
        assert(2 === (yield 1));
        return 2;
      }, 0);
      assert(await sv.call('', 1) === 1);
      await wait(100);
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(await sv.call('', 2) === 2);
      await wait(100);
      assert(sv.kill('') === false);
      sv.register('', async function* () {
        throw 1;
      }, 0);
      sv.cast('', 0);
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(sv.kill('') === false);
    });

    it('coroutine', async function () {
      const sv = new class TestSupervisor extends Supervisor<string, number, number> { }({
      });
      sv.register('', new Coroutine<number, number, number>(async function* () {
        assert(1 === (yield 0));
        assert(3 === (yield 2));
        return 4;
      }, { capacity: 0 }));
      assert(await sv.call('', 1) === 2);
      await wait(100);
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(await sv.call('', 3) === 4);
      await wait(100);
      assert(sv.kill('') === false);
      assert(sv.refs('').length === 0);
      const co = new Coroutine<number, number, number>(async function* () {
        return never;
      });
      sv.register('', co);
      await wait(100);
      assert(sv.kill('') === true);
      assert(await co.catch(() => 0) === 0);
      sv.register('', new Coroutine<number, number, number>(async function* () {
        throw 1;
      }));
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(sv.refs('').length === 0);
      assert(sv.kill('') === false);
      sv.register('', new Coroutine<number, number, number>(async function* () {
        throw 1;
      }));
      assert(sv.refs('').length === 1);
      await wait(100);
      assert(sv.kill('') === false);
      const ssv = new class TestSupervisor extends Supervisor<''> { }();
      assert(ssv instanceof Coroutine);
      ssv.register('', sv);
      assert.doesNotThrow(() => ssv[Coroutine.port]);
      assert.throws(() => ssv[Coroutine.port].recv());
      assert.throws(() => ssv[Coroutine.port].send());
      assert.throws(() => ssv[Coroutine.port].connect());
      assert(ssv.refs().length === 1);
      ssv.terminate();
      assert(sv.kill('') === false);
      assert(await sv === undefined);
      assert(await ssv === undefined);
    });

    it('timeout of messaging', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        timeout: 0
      });
      sv.events.loss.once([''], ([, n]) => {
        assert(n === 2);
        assert(cnt === 0 && ++cnt);
        sv.events.loss.once([''], ([, n]) => {
          assert(n === 1);
          assert(cnt === 2 && ++cnt);
          done();
        });
      });
      sv.call('', 1, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 3 && ++cnt), 100);
      sv.call('', 2, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
    });

    it('timeout of processing', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        timeout: 100
      });
      sv.events.exit.once([''], ([, , s, r]) => {
        assert(s === 0);
        assert(r instanceof Error);
        assert(cnt === 0 && ++cnt);
        done();
      });
      sv.register('', () => never, 0);
      sv.call('', 1, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
    });

    it('overflow', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        capacity: 1
      });
      sv.events.loss.once([''], ([n, p]) => {
        assert(n === '');
        assert(p === 1);
        assert(cnt === 0 && ++cnt);
      });
      sv.register('', () => [0, 0], 0);
      sv.call('', 1, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
      sv.call('', 2, (r, e) => void assert(r === 0) || void assert(e === undefined) || void assert(cnt === 2 && ++cnt) || done(), 100);
    });

    it('async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', () => [++cnt, 0], 0);
      sv.call('', 0, () => void assert(cnt === 1) || done());
      assert(cnt === 0);
    });

    it('await', async function () {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', n => n ? [++cnt, 0] : Promise.reject(undefined), 0);
      assert(await sv.call('', 1) === 1);
      try {
        await sv.call('', 0);
        throw 0;
      }
      catch (reason) {
        assert(reason instanceof Error);
      }
    });

    it('block', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.events.loss.on([''], ([, param]) => assert(cnt === 0 && param === 2 && ++cnt));
      sv.register('', n => void assert(sv.cast('', 2) === false) || void assert(n === 1) && void assert(cnt === 1 && ++cnt) || void tick(() => done()) || [0 , 0], 0);
      assert(sv.cast('', 1) === true);
    });

    it('block async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', n => new Promise(resolve => void setTimeout(() => void resolve([n, 0]), 100)), 0);
      sv.events.loss.on([''], ([, param]) => assert(cnt === 0 && param === 2 && ++cnt));
      sv.call('', 1, (r, _) => void assert(r === 1) || assert(cnt === 2 && ++cnt), 1000);
      sv.call('', 2, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 1 && ++cnt), 0);
      sv.call('', 3, (r, _) => void assert(r === 3) || void assert(cnt === 3 && ++cnt) || done(), Infinity);
    });

    it('scheduler', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        scheduler: requestAnimationFrame
      });
      sv.register('', () => [++cnt, 0], 0);
      sv.call('', 0, () => void assert(cnt === 1) || done());
      assert(cnt === 0);
    });

    it('pool', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('0', (_, s) => [s + ++cnt, 0], 0);
      sv.register('1', (_, s) => [s + ++cnt, 0], 1);
      sv.register('2', (_, s) => [s + ++cnt, 0], 2);
      sv.call(() => [], 0, (r, e) => void assert(r === undefined) || void assert(e instanceof Error) || assert(cnt === 0 && ++cnt), 0);
      sv.call(ns => ns, 0, (r, _) => assert(r === 2));
      sv.call(ns => ns, 0, (r, _) => assert(r === 4));
      sv.call(ns => ns, 0, (r, _) => assert(r === 6));
      sv.call(ns => ns, 0, (r, _) => void assert(r === 5) || done());
    });

    it('select', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('0', (_, s) => [s + ++cnt, 0], 0);
      sv.register('1', (_, s) => [s + ++cnt, 0], 1);
      sv.register('2', (_, s) => [s + ++cnt, 0], 2);
      sv.call(ns => Sequence.from(ns).filter(n => n === '2'), 0, (r, _) => assert(r === 3));
      sv.call(ns => Sequence.from(ns).filter(n => n === '1'), 0, (r, _) => assert(r === 5));
      sv.call(ns => Sequence.from(ns).filter(n => n === '0'), 0, (r, _) => assert(r === 6));
      sv.call(ns => ns, 0, (r, _) => void assert(r === 4) || done());
    });

    it('kill', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      const sv = new TestSupervisor({});
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      void sv.register(' ', () => [0, 0], 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 1);
      assert(sv.kill('') === false);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 1);
      assert(sv.kill(' ') === true);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      assert(sv.terminate() === true);
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      done();
    });

    it('clear', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      const sv = new TestSupervisor({});
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      void sv.register('1', () => [0, 0], 0);
      void sv.register('2', () => [0, 0], 0);
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 2);
      sv.clear();
      assert(TestSupervisor.status.instances === 1);
      assert(TestSupervisor.status.processes === 0);
      assert(sv.terminate() === true);
      sv.clear();
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      new TestSupervisor({});
      new TestSupervisor({});
      assert(TestSupervisor.status.instances === 2);
      assert(TestSupervisor.status.processes === 0);
      TestSupervisor.clear();
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      done();
    });

    it('terminate', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      const sv = new TestSupervisor({
        destructor: reason => {
          assert(reason === undefined);
          assert.throws(() => sv.register('', () => [0, 0], 0));
          assert.throws(() => sv.cast('', 0));
          assert.throws(() => sv.call('', 0, () => undefined));
          assert(sv.terminate() === false);
          assert(TestSupervisor.status.instances === 0);
          assert(TestSupervisor.status.processes === 0);
          ++cnt;
        }
      });
      const kill = sv.register('', () => [0, 0], 0);
      assert(sv.terminate() === true);
      assert(kill() === false);
      assert(sv.terminate() === false);
      assert(cnt === 1);
      try {
        sv.register('', () => [0, 0], 0);
        throw 0;
      }
      catch (reason) {
        assert(reason instanceof Error);
      }
      try {
        sv.cast('', 0);
        throw 0;
      }
      catch (reason) {
        assert(reason instanceof Error);
      }
      try {
        sv.call('', 0, () => 0);
        throw 0;
      }
      catch (reason) {
        assert(reason instanceof Error);
      }
      assert(TestSupervisor.status.instances === 0);
      assert(TestSupervisor.status.processes === 0);
      done();
    });

  });

});
