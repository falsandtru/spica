import { Observation, RegisterItem, RegisterItemType } from './observation';
import { tick } from './clock';

describe('Unit: lib/observation', function () {
  describe('Observation', function () {
    class TestEvent {
      constructor(public type: string, public namespace: string[] = []) {
      }
    }
    function throwError(err: any) {
      throw err;
    }

    it('refs', function (done) {
      const ob = new Observation<string[], void, void>();
      function id<T>(a: T): T {
        return a;
      }

      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([], id);
      const m1 = ob.monitor([], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, RegisterItemType.subscriber],
        [[], id, RegisterItemType.monitor],
      ]);

      ob.once([''], id);
      const m2 = ob.monitor([''], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, RegisterItemType.subscriber],
        [[], id, RegisterItemType.monitor],
        [[''], id, RegisterItemType.subscriber],
        [[''], id, RegisterItemType.monitor],
      ]);

      ob.on(['0'], id);
      ob.on(['a'], id);
      ob.on(['1'], id);
      ob.on(['z'], id);
      ob.on([''], id);
      ob.on([], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, RegisterItemType.subscriber],
        [[], id, RegisterItemType.monitor],
        [[''], id, RegisterItemType.subscriber],
        [[''], id, RegisterItemType.monitor],
        [['0'], id, RegisterItemType.subscriber],
        [['a'], id, RegisterItemType.subscriber],
        [['1'], id, RegisterItemType.subscriber],
        [['z'], id, RegisterItemType.subscriber],
      ]);

      ob.off([]);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, RegisterItemType.monitor],
        [[''], id, RegisterItemType.monitor],
      ]);

      m1();
      m2();
      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([''], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[''], id, RegisterItemType.subscriber],
      ]);
      ob.off([''], id);
      assert.deepStrictEqual(ob.refs([]), []);

      done();

      function convert(register: RegisterItem<any, any, any>) {
        return [
          register.namespace,
          register.listener,
          register.type,
        ];
      }
    });

    it('count', function (done) {
      const ob = new Observation<string[], void, void>();
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
      const ob = new Observation<string[], TestEvent, void>();
      ob.on([''], () => done());
      ob.emit([''], new TestEvent('TEST'));
    });

    it('emit namespace', function (done) {
      const ob = new Observation<[string, number], TestEvent, void>();
      ob.on(['', 1], () => done());
      ob.emit(['', 1], new TestEvent('TEST'));
    });

    it('emit recursive', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.once([''], () => ob.emit([''], 1, data => assert(cnt === 0 && data === 1 && ++cnt)));
      ob.emit([''], 0, data => assert(cnt === 1 && data === 0 && ++cnt) || done());
    });

    it('reflect', function (done) {
      const ob = new Observation<string[], void, void>();
      ob.on([''], _ => 1);
      ob.on([''], _ => 2);
      assert.deepStrictEqual(ob.reflect([''], undefined), [1, 2]);
      done();
    });

    it('monitor', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.monitor([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => assert(cnt === 2 && data === 0 && ++cnt) || done());
    });

    it('monitor once', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 0 && data === 1 && ++cnt), { once: true });
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      ob.monitor([''], data => assert(cnt === 2 && data === 2 && ++cnt), { once: true });
      ob.emit([''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      ob.emit([''], 3, data => assert(cnt === 4 && data === 3 && ++cnt) || done());
    });

    it('on', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => assert(cnt === 2 && data === 0 && ++cnt) || done());
    });

    it('on once', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], data => assert(cnt === 0 && data === 1 && ++cnt), { once: true });
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      ob.on([''], data => assert(cnt === 2 && data === 2 && ++cnt), { once: true });
      ob.emit([''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      ob.on([''], throwError, { once: true });
      ob.off([''], throwError);
      ob.emit([''], 3, data => assert(cnt === 4 && data === 3 && ++cnt) || done());
    });

    it('once', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.once([''], data => assert(cnt === 0 && data === 1 && ++cnt));
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      ob.once([''], data => assert(cnt === 2 && data === 2 && ++cnt));
      ob.emit([''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      ob.once([''], throwError);
      ob.off([''], throwError);
      ob.emit([''], 3, data => assert(cnt === 4 && data === 3 && ++cnt) || done());
    });

    it('off', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
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
      const ob = new Observation<string[], number, void>();
      ob.on([''], throwError);
      ob.monitor([''], data => assert(cnt === 1 && data === 0 && ++cnt) || done());
      ob.on([''], throwError);
      ob.off(['']);
      assert(ob.refs(['']).length === 1);
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.emit([''], 0);
    });

    it.skip('recovery', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], void, void>();
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], _ => assert(cnt === 0 && ++cnt));
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.emit([''], undefined, _ => assert(cnt === 1 && ++cnt) || tick(() => assert(cnt === 2 && ++cnt) || done()));
    });

    it('on namespace', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], throwError);
      ob.on(['', '0'], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0', '0'], data => assert(cnt === 2 && data === 0 && ++cnt) || done());
      ob.emit(['', '0'], 0);
    });

    it('off namespace', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 4 && data === 0 && ++cnt) || tick(done));
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

    it('dedup', function (done) {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      function inc() {
        ++cnt;
      }
      ob.on([''], inc);
      ob.on([''], inc);
      ob.on(['', '0'], inc);
      ob.on(['', '0'], inc);
      ob.on(['', '0', '0'], inc);
      ob.on(['', '0', '0'], inc);
      ob.emit(['', '0'], 0, () => assert(cnt === 2 && ++cnt) || done());
    });

    it('mixed type key', function (done) {
      let cnt = 0;
      const sym = Symbol();
      const ob = new Observation<[number, symbol], number, void>();
      ob.on([NaN, sym], data => assert(cnt === 0 && data === 1 && ++cnt));
      ob.emit([NaN, <any>Symbol().toString()], 0);
      ob.emit([<any>'NaN', sym], 0);
      ob.emit([NaN, Symbol()], 0);
      ob.emit([NaN, sym], 1);
      ob.off([NaN, sym]);
      ob.monitor([NaN, sym], data => assert(cnt === 1 && data === 2 && ++cnt) || tick(done));
      ob.emit([NaN, sym], 2);
    });

    it('relay', function (done) {
      const ob = new Observation<string[], number, void>();
      const source = new Observation<string[], number, void>();
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
