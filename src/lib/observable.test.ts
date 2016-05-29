import {Observable} from './observable';
import {Tick} from './tick';

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
      ob.monitor([], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true]
      ]);

      ob.once([''], id);
      ob.monitor([''], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true],
        [[''], id, false],
        [[''], id, true]
      ]);

      ob.on(['0'], id);
      ob.on(['a'], id);
      ob.on(['1'], id);
      ob.on(['z'], id);
      ob.on([''], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[], id, false],
        [[], id, true],
        [[''], id, false],
        [[''], id, true],
        [[''], id, false],
        [['0'], id, false],
        [['1'], id, false],
        [['a'], id, false],
        [['z'], id, false]
      ]);

      ob.off([]);
      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([''], id);
      assert.deepStrictEqual(ob.refs([]).map(reg => reg.slice(0, 3)), [
        [[''], id, false]
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

      ob.monitor([], id);
      assert(ob.refs([]).length === 1);

      ob.on([], id);
      assert(ob.refs([]).length === 2);

      ob.monitor([''], id);
      ob.on([''], id);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);

      ob.monitor(['', ''], id);
      ob.on(['', ''], id);
      assert(ob.refs([]).length === 6);
      assert(ob.refs(['']).length === 4);
      assert(ob.refs(['', '']).length === 2);

      ob.off([''], id);
      assert(ob.refs([]).length === 5);
      assert(ob.refs(['']).length === 3);
      assert(ob.refs(['', '']).length === 2);

      ob.off([''], id);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);
      assert(ob.refs(['', '']).length === 2);

      ob.off([''], id);
      assert(ob.refs([]).length === 4);
      assert(ob.refs(['']).length === 2);
      assert(ob.refs(['', '']).length === 2);

      ob.off(['']);
      assert(ob.refs([]).length === 2);
      assert(ob.refs(['']).length === 0);
      assert(ob.refs(['', '']).length === 0);

      ob.off([]);
      assert(ob.refs([]).length === 0);

      done();
    });

    it('emit', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], TestEvent, void>();
      ob.on(['test'], data => ++cnt === 1 && done());
      ob.emit(['test'], new TestEvent('TEST'));
    });

    it('emit namespace', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], TestEvent, void>();
      ob.on(['test', '0'], data => ++cnt === 2 && done());
      ob.emit(['test', '0'], new TestEvent('TEST'));
      ob.emit(['test', '0'], new TestEvent('TEST'));
    });

    it('emit recursive', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.once(['test'], data => ob.emit(['test'], 1, data => assert(++cnt === 1 && data === 1)));
      ob.emit(['test'], 0, data => assert(++cnt === 2 && data === 0) || done());
    });

    it('reflect', function (done) {
      const ob = new Observable<string[], void, void>();
      ob.on(['test'], _ => 1);
      ob.on(['test'], _ => 2);
      assert.deepStrictEqual(ob.reflect(['test'], void 0), [1, 2]);
      done();
    });

    it('monitor', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor(['test'], data => assert(++cnt === 1 && data === 0));
      ob.monitor(['test'], data => assert(++cnt === 2 && data === 0));
      ob.emit(['test'], 0, data => assert(++cnt === 3 && data === 0) || done());
    });

    it('on', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on(['test'], data => assert(++cnt === 1 && data === 0));
      ob.on(['test'], data => assert(++cnt === 2 && data === 0));
      ob.emit(['test'], 0, data => assert(++cnt === 3 && data === 0) || done());
    });

    it('off', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor(['test'], data => assert(++cnt === 3 && data === 0))
      ob.on(['test'], data => assert(++cnt === 1 && data === 0))
      ob.monitor(['test'], throwError)
      ob.on(['test'], throwError)
      ob.on(['test'], data => assert(++cnt === 2 && data === 0))
      ob.monitor(['test'], data => assert(++cnt === 4 && data === 0) || done())
      ob.off(['test'], throwError)
      ob.off(['test'], throwError)
      ob.emit(['test'], 0);
    });

    it('off type', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on(['test'], throwError);
      ob.monitor(['test'], throwError);
      ob.on(['test'], throwError);
      ob.off(['test']);
      ob.on(['test'], data => assert(++cnt === 1 && data === 0) || done());
      ob.emit(['test'], 0);
    });

    it('once', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.once(['test'], data => assert(++cnt === 1 && data === 1));
      ob.emit(['test'], 1, data => assert(++cnt === 2 && data === 1));
      ob.once(['test'], data => assert(++cnt === 3 && data === 2));
      ob.emit(['test'], 2, data => assert(++cnt === 4 && data === 2));
      ob.once(['test'], throwError);
      ob.off(['test'], throwError);
      ob.emit(['test'], 3, data => assert(++cnt === 5 && data === 3) || done());
    });

    it('recovery', function (done) {
      let cnt = 0;
      try {
        const ob = new Observable<string[], void, void>();
        ob.on(['test'], throwError);
        ob.on(['test'], throwError);
        ob.on(['test'], throwError);
        ob.on(['test'], _ => assert(++cnt === 1));
        ob.on(['test'], throwError);
        ob.on(['test'], throwError);
        ob.on(['test'], throwError);
        ob.emit(['test'], void 0, _ => assert(++cnt === 2) || Tick(_ => assert(cnt === 2) || done()));
      }
      catch (err) {
        ;
      }
    });

    it('on namespace', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.on(['test'], throwError);
      ob.on(['test', '0'], data => assert(++cnt === 1 && data === 0));
      ob.on(['test', '0', '0'], data => assert(++cnt === 2 && data === 0));
      ob.on(['test', '0', '0', '0'], data => assert(++cnt === 3 && data === 0) || done());
      ob.emit(['test', '0'], 0);
    });

    it('off namespace', function (done) {
      let cnt = 0;
      const ob = new Observable<string[], number, void>();
      ob.monitor(['test'], data => assert(++cnt === 5 && data === 0) || Tick(done));
      ob.on(['test'], throwError);
      ob.monitor(['test', '0'], data => assert(++cnt === 4 && data === 0));
      ob.on(['test', '0'], throwError);
      ob.on(['test', '0'], data => assert(++cnt === 1 && data === 0));
      ob.monitor(['test', '0', '0'], data => assert(++cnt === 0 && data === 0));
      ob.on(['test', '0', '0'], data => assert(++cnt === 2 && data === 0));
      ob.on(['test', '0', '0', '0'], data => assert(++cnt === 3 && data === 0));
      ob.off(['test', '0'], throwError);
      ob.emit(['test', '0'], 0);
    });

  });

});
