import {Supervisor} from './supervisor';
import {Tick} from './tick';

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

      const sv2 = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);

      const process: Supervisor.Process<number, number, number> = {
        init: (state) => state,
        call: (n, s) => [n, ++s],
        exit: () => void 0
      };
      const terminate = sv1.register('', process, 0);
      assert.deepStrictEqual(sv1.refs(), [
        ['', process, 0, terminate]
      ]);
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv1.terminate('');
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
        exit: () => void 0
      };
      const terminate = sv.register('', process, 0);
      assert.deepStrictEqual(sv.refs(), [
        ['', process, 0, terminate]
      ]);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv.terminate('');
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      sv.terminate();
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

    it('lifecycle', function (done) {
      let cnt = 1;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        name: '',
        destructor: reason => {
          assert(reason === void 0);
          assert(cnt === 12 && ++cnt);
          assert(TestSupervisor.count === 1);
          assert(TestSupervisor.procs === 0);
          Tick(() => {
            assert(cnt === 13 && ++cnt);
            assert(TestSupervisor.count === 0);
            assert(TestSupervisor.procs === 0);
            done();
          });
        }
      });
      assert(+sv.id > 0);
      assert(sv.name === '');
      sv.events.init
        .monitor([], ([name, process, state]) => {
          assert(TestSupervisor.procs === 1);
          assert(cnt === 2 && ++cnt);
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
          switch (param) {
            case 3: {
              assert(cnt === 10 && ++cnt);
              assert(param === 3);
              return;
            }
            case 4: {
              assert(cnt === 11 && ++cnt);
              assert(param === 4);
              sv.terminate();
              return;
            }
            default: {
              throw new Error(param + '');
            }
          }
        });
      sv.events.exit
        .monitor([], ([name, process, state, reason]) => {
          assert(TestSupervisor.procs === 0);
          assert(cnt === 9 && ++cnt);
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
          assert(cnt === 3 && ++cnt);
          assert(state === 0);
          return state;
        },
        call(n: number, state: number): [number, number] {
          assert(TestSupervisor.procs === 1);
          if (n >= 3) throw new Error();
          ++cnt; // 4, 6
          return [-n, ++state];
        },
        exit(state, reason) {
          assert(TestSupervisor.procs === 0);
          assert(cnt === 8 && ++cnt);
          assert(state === 2);
          assert(reason instanceof Error);
        }
      }, 0);
      assert(cnt === 1 && ++cnt);
      sv.call('', 1, r => assert(TestSupervisor.procs === 1) || assert(r === -1) || assert(cnt === 7 && ++cnt));
      assert(sv.cast('', 2) === true);
      sv.call('', 3, done);
      sv.call('', 4, done);
      assert(cnt === 5 && ++cnt);
    });

    it('state', function (done) {
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.register('', (n, s) => Promise.resolve<[number, number]>([n + s, ++s]), 0);
      sv.call('', 1, n => assert(n === 1));
      sv.call('', 2, n => assert(n === 3) || sv.terminate() || done(), 1e2);
    });

    it('timeout of messaging', function (done) {
      let cnt = 1;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.events.loss.once([''], ([, n]) => {
        assert(n === 2);
        assert(cnt === 1 && ++cnt);
        sv.events.loss.once([''], ([, n]) => {
          assert(n === 1);
          assert(cnt === 3 && ++cnt);
          done();
        });
      });
      sv.call('', 1, (r, e) => assert(r === void 0) || assert(e instanceof Error) || assert(cnt === 4 && ++cnt), 1e2);
      sv.call('', 2, (r, e) => assert(r === void 0) || assert(e instanceof Error) || assert(cnt === 2 && ++cnt));
    });

    it('timeout of processing', function (done) {
      let cnt = 1;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.events.exit.once([''], ([, , s, r]) => {
        assert(s === 0);
        assert(r instanceof Error);
        assert(cnt === 1 && ++cnt);
        done();
      });
      sv.register('', () => new Promise<[number, number]>(() => void 0), 0);
      sv.call('', 1, (r, e) => assert(r === void 0) || assert(e instanceof Error) || assert(cnt === 2 && ++cnt), 1e2);
    });

    it('async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.register('', _ => [++cnt, 0], 0);
      sv.call('', 0, _ => assert(cnt === 1) || sv.terminate() || done());
      assert(cnt === 0);
    });

    it('block', function (done) {
      let cnt = 1;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.events.loss.on([''], ([, param]) => assert(cnt === 1 && param === 2 && ++cnt));
      sv.register('', n => assert(sv.cast('', 2) === false) || assert(n === 1) && assert(cnt === 2 && ++cnt) || Tick(() => sv.terminate() || done()) || [0 , 0], 0);
      assert(sv.cast('', 1) === true);
    });

    it('block async', function (done) {
      let cnt = 1;
      const sv = new class TestSupervisor extends Supervisor<string, number, number, number> { }();
      sv.register('', n => new Promise<[number, number]>(resolve => void resolve([n, 0])), 0);
      sv.events.loss.on([''], ([, param]) => assert(cnt === 1 && param === 2 && ++cnt));
      sv.call('', 1, r => assert(r === 1) || assert(cnt === 2 && ++cnt));
      sv.call('', 2, done);
      sv.call('', 3, r => assert(r === 3) || assert(cnt === 3 && ++cnt) || sv.terminate() || done(), Infinity);
    });

    it('terminate', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string, number, number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        destructor: reason => {
          assert(reason === void 0);
          assert(TestSupervisor.count === 1);
          assert(TestSupervisor.procs === 0);
          ++cnt;
        }
      });
      const terminate = sv.register('', _ => [0, 0], 0);
      sv.terminate();
      terminate();
      sv.terminate();
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
