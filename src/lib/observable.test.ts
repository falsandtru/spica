import { Observable } from './observable';
import { Tick } from './tick';

describe('Unit: lib/observable', function () {
  describe('Observable', function () {
    class TestEvent {
      constructor(public type: string, public namespace: string[] = []) {
      }
    }
    function throwError(err: any) {
      throw err;
    }

    it('refs', function (done) {
      const ob = new Observable<string[], void, void>();
      function id<T>(a: T): T {
        return a;
      }

      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([], id);
      const m1 = ob.monitor([], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true],
      ]);

      ob.once([''], id);
      const m2 = ob.monitor([''], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true],
        [[''], id, false],
        [[''], id, true],
      ]);

      ob.on(['0'], id);
      ob.on(['a'], id);
      ob.on(['1'], id);
      ob.on(['z'], id);
      ob.on([''], id);
      ob.on([], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true],
        [[], id, false],
        [[''], id, false],
        [[''], id, true],
        [[''], id, false],
        [['0'], id, false],
        [['a'], id, false],
        [['1'], id, false],
        [['z'], id, false],
      ]);

      ob.off([]);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, true],
        [[''], id, true],
      ]);

      m1();
      m2();
      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([''], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[''], id, false],
      ]);
      ob.off([''], id);
      assert.deepStrictEqual(ob.refs([]), []);

      done();
    });

    it('count', function (done) {
      const ob = new Observable<string[], void, void>();
      function id<T>(a: T): T {
        return a;
      }

      assert(ob.refs([]).length === 0);

      const m1 = ob.monitor([], id);
      ob.on([], id);
      assert(ob.refs([]).length === 2);

      const m2 = ob.monitor([''], id);
      ob.on([''], id);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);

      const m3 = ob.monitor(['', ''], id);
      ob.on(['', ''], id);
      assert(ob.refs([]).length === 6);
      assert(ob.refs(['']).length === 4);
      assert(ob.refs(['', '']).length === 2);

      ob.off([''], id);
      assert(ob.refs([]).length === 5);
      assert(ob.refs(['']).length === 3);
      assert(ob.refs(['', '']).length === 2);

      ob.off(['']);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);
      assert(ob.refs(['', '']).length === 1);

      ob.off([''], id);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);
      assert(ob.refs(['', '']).length === 1);

      m3();
      assert(ob.refs([]).length === 3);
      assert(ob.refs(['']).length === 1);
      assert(ob.refs(['', '']).length === 0);

      m2();
      assert(ob.refs([]).length === 2);
      assert(ob.refs(['']).length === 0);
      assert(ob.refs(['', '']).length === 0);

      ob.off([]);
      assert(ob.refs([]).length === 1);

      m1();
      assert(ob.refs([]).length === 0);

      done();
    });

    it('emit', function (done) {
      const ob = new Observable<string[], TestEvent, void>();
      ob.on([''], () => done());
      ob.emit([''], new TestEvent('TEST'));
    });

    it('emit namespace', function (done) {
      const ob = new Observable<[string, number], TestEvent, void>();
      ob.on(['', 1], () => done());
      ob.emit(['', 1], new TestEvent('TEST'));
    });

    it('emit recursive', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.once([''], () => ob.emit([''], 1, data => assert(cnt === 0 && data === 1 && ++cnt)));
      ob.emit([''], 0, data => assert(cnt === 1 && data === 0 && ++cnt) || done());
    });

    it('reflect', function (done) {
      const ob = new Observable<string[], void, void>();
      ob.on([''], _ => 1);
      ob.on([''], _ => 2);
      assert.deepStrictEqual(ob.reflect([''], void 0), [1, 2]);
      done();
    });

    it('monitor', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.monitor([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => assert(cnt === 2 && data === 0 && ++cnt) || done());
    });

    it('on', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => assert(cnt === 2 && data === 0 && ++cnt) || done());
    });

    it('off', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 2 && data === 0 && ++cnt));
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on([''], throwError);
      ob.on([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.monitor([''], data => assert(cnt === 3 && data === 0 && ++cnt) || done());
      ob.off([''], throwError);
      ob.emit([''], 0);
    });

    it('off type', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on([''], throwError);
      ob.monitor([''], data => assert(cnt === 1 && data === 0 && ++cnt) || done());
      ob.on([''], throwError);
      ob.off(['']);
      assert(ob.refs(['']).length === 1);
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.emit([''], 0);
    });

    it('once', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.once([''], data => assert(cnt === 0 && data === 1 && ++cnt));
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      ob.once([''], data => assert(cnt === 2 && data === 2 && ++cnt));
      ob.emit([''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      ob.once([''], throwError);
      ob.off([''], throwError);
      ob.emit([''], 3, data => assert(cnt === 4 && data === 3 && ++cnt) || done());
    });

    it('recovery', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], void, void>();
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], _ => assert(cnt === 0 && ++cnt));
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.emit([''], void 0, _ => assert(cnt === 1 && ++cnt) || Tick(() => assert(cnt === 2 && ++cnt) || done()));
    });

    it('on namespace', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on([''], throwError);
      ob.on(['', '0'], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0', '0'], data => assert(cnt === 2 && data === 0 && ++cnt) || done());
      ob.emit(['', '0'], 0);
    });

    it('off namespace', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 4 && data === 0 && ++cnt) || Tick(done));
      ob.on([''], throwError);
      ob.monitor(['', '0'], data => assert(cnt === 3 && data === 0 && ++cnt));
      ob.on(['', '0'], throwError);
      ob.on(['', '0'], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.monitor(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0', '0'], data => assert(cnt === 2 && data === 0 && ++cnt));
      ob.off(['', '0'], throwError);
      ob.emit(['', '0'], 0);
    });

    it('mixed type key', function (done) {
      let cnt = 0;
      const sym = Symbol();
      const ob = new Observable<[number, symbol], number, void>();
      ob.on([NaN, sym], data => assert(cnt === 0 && data === 1 && ++cnt));
      ob.emit([NaN, <any>Symbol().toString()], 0);
      ob.emit([<any>'NaN', sym], 0);
      ob.emit([NaN, Symbol()], 0);
      ob.emit([NaN, sym], 1);
      ob.off([NaN, sym]);
      ob.monitor([NaN, sym], data => assert(cnt === 1 && data === 2 && ++cnt) || Tick(done));
      ob.emit([NaN, sym], 2);
    });

    it('relay', function (done) {
      const ob = new Observable<string[], number, void>();
      const source = new Observable<string[], number, void>();
      ob.relay(source);
      ob.once(['a'], (data, type) => {
        assert(data === 0);
        assert.deepStrictEqual(type, ['a']);
        done();
      });
      source.emit(['a'], 0);
    });

  });

});
