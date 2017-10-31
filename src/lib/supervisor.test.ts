import { Supervisor } from './supervisor';
import { tick } from './tick';

declare const requestAnimationFrame: (cb: () => void) => void;

describe('Unit: lib/supervisor', function () {
  describe('Supervisor', function () {
    beforeEach(() => {
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
    });

    afterEach(() => {
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
    });

    it('extend', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }

      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);

      const sv1 = new TestSupervisor();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);

      const sv2 = new class TestSupervisor extends Supervisor<string, number, number, number> {
      }();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);

      assert(class extends TestSupervisor { }.count === 0);
      assert(class extends TestSupervisor { }.procs === 0);

      const process: Supervisor.Process<number, number, number> = {
        init: (state) => state,
        call: (n, s) => [n, ++s],
        exit: () => undefined
      };
      const kill = sv1.register('', process, 0);
      assert.deepStrictEqual(sv1.refs(), [
        ['', process, 0, kill]
      ]);
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv1.kill('');
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      sv1.terminate();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      sv2.terminate();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

    it('refs', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor();
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      const process: Supervisor.Process<number, number, number> = {
        init: (state) => state,
        call: (n, s) => [n, ++s],
        exit: () => undefined
      };
      const kill = sv.register('', process, 0);
      assert.deepStrictEqual(sv.refs(), [
        ['', process, 0, kill]
      ]);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv.kill('');
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      sv.terminate();
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

    it('lifecycle', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        name: '',
        destructor: reason => {
          assert(reason === undefined);
          assert(cnt === 12 && ++cnt);
          assert.throws(() => sv.register('', _ => [0, 0], 0));
          assert.throws(() => sv.cast('', 0));
          assert.throws(() => sv.call('', 0, () => undefined));
          assert(sv.terminate() === false);
          assert(TestSupervisor.count === 0);
          assert(TestSupervisor.procs === 0);
          done();
        }
      });
      assert(+sv.id > 0);
      assert(sv.name === '');
      sv.events.init
        .monitor([], ([name, process, state]) => {
          assert(TestSupervisor.procs === 1);
          assert(cnt === 1 && ++cnt);
          assert(name === '');
          assert(process.init instanceof Function);
          assert(process.call instanceof Function);
          assert(process.exit instanceof Function);
          assert(state === 0);
        });
      sv.events.loss
        .monitor([], ([name, param]) => {
          assert(TestSupervisor.procs === 0);
          assert(name === '');
          assert(cnt === 10 && ++cnt);
          assert(param === 4);
        });
      sv.events.exit
        .monitor([], ([name, process, state, reason]) => {
          assert(TestSupervisor.procs === 0);
          assert(cnt === 8 && ++cnt);
          assert(name === '');
          assert(process.init instanceof Function);
          assert(process.call instanceof Function);
          assert(process.exit instanceof Function);
          assert(state === 2);
          assert(reason instanceof Error);
        });
      sv.register('', {
        init(state) {
          assert(TestSupervisor.procs === 1);
          assert(cnt === 2 && ++cnt);
          assert(state === 0);
          return state;
        },
        call(n: number, state: number): [number, number] {
          assert(TestSupervisor.procs === 1);
          if (n >= 3) throw new Error();
          ++cnt; // 3, 5
          return [-n, ++state];
        },
        exit(reason, state) {
          assert(TestSupervisor.procs === 0);
          assert(cnt === 7 && ++cnt);
          assert(reason instanceof Error);
          assert(state === 2);
        }
      }, 0);
      assert(cnt === 0 && ++cnt);
      sv.call('', 1, r => assert(TestSupervisor.procs === 1) || assert(r === -1) || assert(cnt === 6 && ++cnt));
      assert(sv.cast('', 2) === true);
      sv.call('', 3, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 9 && ++cnt));
      sv.call('', 4, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 11 && ++cnt) || sv.terminate(), 100);
      assert(cnt === 4 && ++cnt);
    });

    it('register', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.events.exit.once([''], done);
      sv.register('', (_, s) => [s, s], 1);
      assert.throws(() => sv.register('', (_, s) => [s, s], 2));
      sv.register('', {
        init(s) {
          assert(cnt === 0 && ++cnt);
          assert(s === 3);
          return s;
        },
        call(p, s) {
          assert(cnt === 1 && ++cnt);
          assert(p === 1);
          assert(s === 3);
          return [p, s];
        },
        exit() {
          done(true);
        },
      }, 3, undefined);
      sv.call('', 1, () => assert(cnt === 2) || done());
    });

    it('validation for returned values', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> {
      }();
      sv.events.exit.once([''], ([, , s, r]) => {
        assert(s === 0);
        assert(r instanceof Error);
        assert(cnt === 0 && ++cnt);
        done();
      });
      sv.register('', () => new Promise<[number, number]>(resolve => void resolve()), 0);
      sv.call('', 1, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 1 && ++cnt), 100);
    });

    it('state', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', (n, s) => Promise.resolve<[number, number]>([n + s, ++s]), 0);
      sv.call('', 1, n => assert(n === 1));
      sv.call('', 2, n => assert(n === 3) || done(), 100);
    });

    it('exit', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      let inits = 0;
      let exits = 0;
      sv.register('', {
        init: () => ++inits,
        call: (n, s) => [n + s, ++s],
        exit: () => ++exits
      }, 0);
      assert(inits === exits);
      assert(inits === 0);
      sv.kill('', 0);
      assert(inits === exits);
      assert(inits === 0);
      sv.register('', {
        init: () => ++inits,
        call: (n, s) => [n + s, ++s],
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
      sv.call('', 1, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 3 && ++cnt), 100);
      sv.call('', 2, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
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
      sv.register('', () => new Promise<never>(() => undefined), 0);
      sv.call('', 1, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
    });

    it('overflow', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        size: 1
      });
      sv.events.loss.once([''], ([n, p]) => {
        assert(n === '');
        assert(p === 1);
        assert(cnt === 0 && ++cnt);
      });
      sv.register('', _ => [0, 0], 0);
      sv.call('', 1, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 1 && ++cnt));
      sv.call('', 2, (r, e) => assert(r === 0) || assert(e === undefined) || assert(cnt === 2 && ++cnt) || done(), 100);
    });

    it('async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', _ => [++cnt, 0], 0);
      sv.call('', 0, _ => assert(cnt === 1) || done());
      assert(cnt === 0);
    });

    it('block', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.events.loss.on([''], ([, param]) => assert(cnt === 0 && param === 2 && ++cnt));
      sv.register('', n => assert(sv.cast('', 2) === false) || assert(n === 1) && assert(cnt === 1 && ++cnt) || tick(() => done()) || [0 , 0], 0);
      assert(sv.cast('', 1) === true);
    });

    it('block async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
      });
      sv.register('', n => new Promise<[number, number]>(resolve => void setTimeout(() => void resolve([n, 0]), 100)), 0);
      sv.events.loss.on([''], ([, param]) => assert(cnt === 0 && param === 2 && ++cnt));
      sv.call('', 1, r => assert(r === 1) || assert(cnt === 2 && ++cnt), 1000);
      sv.call('', 2, (r, e) => assert(r === undefined) || assert(e instanceof Error) || assert(cnt === 1 && ++cnt), 0);
      sv.call('', 3, r => assert(r === 3) || assert(cnt === 3 && ++cnt) || done(), Infinity);
    });

    it('scheduler', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }({
        scheduler: requestAnimationFrame
      });
      sv.register('', _ => [++cnt, 0], 0);
      sv.call('', 0, _ => assert(cnt === 1) || done());
      assert(cnt === 0);
    });

    it('kill process', function (done) {
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({});
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      void sv.register(' ', _ => [0, 0], 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      assert(sv.kill('') === false);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      assert(sv.kill(' ') === true);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      assert(sv.terminate() === true);
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

    it('terminate', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        destructor: reason => {
          assert(reason === undefined);
          assert.throws(() => sv.register('', _ => [0, 0], 0));
          assert.throws(() => sv.cast('', 0));
          assert.throws(() => sv.call('', 0, () => undefined));
          assert(sv.terminate() === false);
          assert(TestSupervisor.count === 0);
          assert(TestSupervisor.procs === 0);
          ++cnt;
        }
      });
      const kill = sv.register('', _ => [0, 0], 0);
      assert(sv.terminate() === true);
      assert(kill() === false);
      assert(sv.terminate() === false);
      assert(cnt === 1);
      try {
        sv.register('', _ => [0, 0], 0);
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      try {
        sv.cast('', 0);
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      try {
        sv.call('', 0, () => 0);
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

  });

});
