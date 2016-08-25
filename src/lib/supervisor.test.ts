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
      class TestSupervisor extends Supervisor<string[], number, number> {
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

      const sv2 = new class TestSupervisor extends Supervisor<string[], number, number> { }();
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);

      function id<T>(a: T): T {
        return a;
      }
      const terminate = sv1.register([], id);
      assert.deepStrictEqual(sv1.refs([]), [
        [[], id, terminate]
      ]);
      assert(Supervisor.count === 0);
      assert(Supervisor.procs === 0);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv1.terminate([]);
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
      class TestSupervisor extends Supervisor<string[], number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor();
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      function id<T>(a: T): T {
        return a;
      }
      const terminate = sv.register([], id);
      assert.deepStrictEqual(sv.refs([]), [
        [[], id, terminate]
      ]);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 1);
      sv.terminate([]);
      assert(TestSupervisor.count === 1);
      assert(TestSupervisor.procs === 0);
      sv.terminate();
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      done();
    });

    it('lifecycle', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string[], number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        name: void 0,
        destructor: reason => {
          assert(reason === void 0);
          assert(++cnt === 13);
          assert(TestSupervisor.count === 1);
          assert(TestSupervisor.procs === 0);
          Tick(() => {
            assert(++cnt === 14);
            assert(TestSupervisor.count === 0);
            assert(TestSupervisor.procs === 0);
            done();
          });
        }
      });
      assert(sv.name === '');
      sv.events.exec
        .monitor([], ([name, process]) => {
          assert.deepStrictEqual(name, []);
          assert(process instanceof Function);
          assert(++cnt === 1);
        });
      sv.events.fail
        .monitor([], ([name, data]) => {
          assert.deepStrictEqual(name, []);
          switch (data) {
            case 3: {
              assert(++cnt === 7);
              assert(data === 3);
              return;
            }
            case 4: {
              assert(++cnt === 10);
              assert(data === 4);
              return;
            }
            default: {
              throw new Error(data + '');
            }
          }
        });
      sv.events.loss
        .monitor([], ([name, data]) => {
          assert.deepStrictEqual(name, []);
          switch (data) {
            case 3: {
              assert(++cnt === 8);
              assert(data === 3);
              return;
            }
            case 4: {
              assert(++cnt === 11);
              assert(data === 4);
              return;
            }
            default: {
              throw new Error(data + '');
            }
          }
        });
      sv.events.exit
        .monitor([], ([name, process, reason]) => {
          assert(++cnt === 6);
          assert.deepStrictEqual(name, []);
          assert(process instanceof Function);
          assert(reason instanceof Error);
        });
      sv.register([], n => {
        if (n > 2) throw new Error();
        ++cnt;
        return -n;
      });
      assert(cnt === 0);
      sv.call([], 1, 0, r => assert(++cnt === 5) || assert.deepStrictEqual(r, [-1]));
      assert.deepStrictEqual(sv.cast([], 2), [-2]);
      sv.call([], 3, 0, r => assert(++cnt === 9) || assert.deepStrictEqual(r, []) || assert(TestSupervisor.procs === 0));
      sv.call([], 4, 0, r => assert(++cnt === 12) || assert.deepStrictEqual(r, []) || assert(TestSupervisor.procs === 0) || sv.terminate());
      assert(++cnt === 3);
    });

    it('dependencies', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string[], number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor({
        name: 'deps',
        dependencies: [
          [[], [
            ['a'],
            ['b']
          ]],
          [['a'], [
            [],
            ['a', 'a']
          ]],
          [['a', 'a'], [
            ['a']
          ]],
          [['b'], [
            [],
            ['a']
          ]]
        ]
      });
      sv.events.loss.monitor([], done);

      sv.register([], _ => ++cnt);
      assert.deepStrictEqual(sv.cast([], 0), []);
      assert.deepStrictEqual(sv.cast(['a'], 0), []);
      assert.deepStrictEqual(sv.cast(['a', 'a'], 0), []);
      assert.deepStrictEqual(sv.cast(['b'], 0), []);
      assert(cnt === 0);

      sv.register(['a', 'a'], _ => ++cnt);
      assert.deepStrictEqual(sv.cast([], 0), []);
      assert.deepStrictEqual(sv.cast(['a'], 0), []);
      assert.deepStrictEqual(sv.cast(['a', 'a'], 0), []);
      assert.deepStrictEqual(sv.cast(['b'], 0), []);
      assert(cnt === 0);

      sv.register(['a'], _ => ++cnt);
      assert.deepStrictEqual(sv.cast([], 0), []);
      assert.deepStrictEqual(sv.cast(['a'], 0), []);
      assert.deepStrictEqual(sv.cast(['a', 'a'], 0), []);
      assert.deepStrictEqual(sv.cast(['b'], 0), []);
      assert(cnt === 0);

      sv.register(['b'], _ => ++cnt);
      assert(TestSupervisor.procs === 4);
      assert.deepStrictEqual(sv.cast([], 0), [1, 2, 3, 4]);
      assert.deepStrictEqual(sv.cast(['a'], 0), [5, 6]);
      assert.deepStrictEqual(sv.cast(['a', 'a'], 0), [7]);
      assert.deepStrictEqual(sv.cast(['b'], 0), [8]);
      assert(cnt === 8);

      sv.terminate(['b']);
      assert(TestSupervisor.procs === 3);
      assert.deepStrictEqual(sv.cast([], 0), []);
      assert.deepStrictEqual(sv.cast(['a'], 0), []);
      assert.deepStrictEqual(sv.cast(['a', 'a'], 0), []);
      assert.deepStrictEqual(sv.cast(['b'], 0), []);
      assert(cnt === 8);

      sv.call([], 0, 0, r => {
        assert.deepStrictEqual(r, [9, 10, 11, 12]);
        assert(cnt === 12);
        sv.terminate();
        done();
      });
      assert(cnt === 8);

      sv.register(['b'], _ => ++cnt);
      assert(TestSupervisor.procs === 4);
      assert(cnt === 8);
    });

    it('retry', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string[], number, number> {
      }
      assert(TestSupervisor.count === 0);
      assert(TestSupervisor.procs === 0);
      const sv = new TestSupervisor();
      sv.events.loss.monitor([], done);
      sv.events.fail.on([], ([, data]) => assert(++cnt === 2 && data === 0));
      sv.register([], _ => +assert(++cnt === 3) || cnt);
      sv.events.exit.on([], ([name, proc, reason]) => reason && sv.register(name, proc));
      assert.deepStrictEqual(sv.cast([], 0, true), [3]);
      sv.terminate();
      done();
    });

    it('timeout', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string[], number, number> { }();
      sv.call([], 1, 1e2, r => assert(++cnt === 2 && r.length === 0) || sv.terminate() || done());
      sv.call([], 2, 0, r => assert(++cnt === 1 && r.length === 0));
    });

    it('async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string[], number, number> { }();
      sv.events.loss.monitor([], done);
      sv.register([], _ => ++cnt);
      sv.call([], 0, 0, _ => assert(cnt === 1) || sv.terminate() || done());
      assert(cnt === 0);
    });

    it('block', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string[], number, number> { }();
      sv.events.loss.monitor([], done);
      sv.events.fail.on([], ([, data]) => assert(++cnt === 1 && data === 2));
      sv.register([], n => +assert.deepStrictEqual(sv.cast([], 2), []) || +assert(++cnt === 2 && n === 1) || +Tick(() => sv.terminate() || done()));
      sv.cast([], 1);
    });

    it('block async', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string[], number, Promise<number>> { }();
      sv.register([], n => new Promise<number>(resolve => void resolve(n)));
      sv.events.loss.on([], ([, data]) => assert(++cnt === 2 && data === 2));
      sv.call([], 1, 0, r => assert(++cnt === 1 && r.length === 1) || r[0].then(n => assert(++cnt === 4 && n === 1)));
      sv.call([], 2, 0, r => assert(++cnt === 3 && r.length === 0));
      sv.call([], 3, 1e9, r => assert(++cnt === 5 && r.length === 1) || sv.terminate() || done());
    });

    it('block with dependencies', function (done) {
      let cnt = 0;
      const sv = new class TestSupervisor extends Supervisor<string[], number, void | PromiseLike<void>> { }({
        dependencies: [
          [['b'], [
            ['a']
          ]],
          [['c'], [
            ['a']
          ]]
        ]
      });
      sv.events.loss.monitor([], done);
      sv.call(['a'], 0, 1e9, r => assert(++cnt === 2 && r.length === 1));
      sv.call(['b'], 0, 1e9, r => assert(++cnt === 9 && r.length === 1));
      sv.call(['c'], 0, 1e9, r => assert(++cnt === 11 && r.length === 1) || sv.terminate() || done());
      sv.call(['d'], 0, 1e9, r => assert(++cnt === 4 && r.length === 1));
      sv.call(['e'], 0, 1e9, r => assert(++cnt === 6 && r.length === 1));
      sv.register(['a'], _ => {
        sv.register(['d'], _ => assert(++cnt === 3));
        sv.register(['b'], _ => assert(++cnt === 8));
        assert(++cnt === 1);
        return new Promise<void>(resolve => void resolve(void 0)).then(_ => assert(++cnt === 7));
      });
      sv.register(['c'], _ => assert(++cnt === 10));
      sv.register(['e'], _ => assert(++cnt === 5));
    });

    it('terminate', function (done) {
      let cnt = 0;
      class TestSupervisor extends Supervisor<string[], number, number> {
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
      const terminate = sv.register([], _ => _);
      sv.terminate();
      terminate();
      assert(cnt === 1);
      try {
        sv.register([], _ => 0);
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      try {
        sv.call([], 0);
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      try {
        sv.terminate();
        throw 0;
      }
      catch (err) {
        assert(err instanceof Error);
      }
      done();
    });

  });

});
