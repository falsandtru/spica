import { Observation, ListenerItem } from './observer';
import { tick } from './clock';

describe('Unit: lib/observation', function () {
  describe('Observation', function () {
    const enum ListenerType {
      Monitor,
      Subscriber,
    }
    class TestEvent {
      constructor(public type: string, public namespace: string[] = []) {
      }
    }
    function throwError(err: unknown) {
      throw err;
    }

    it('refs', function () {
      const ob = new Observation<string[], void, void>();
      function id<T>(a: T): T {
        return a;
      }

      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([], id);
      const m1 = ob.monitor([], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, ListenerType.Monitor],
        [[], id, ListenerType.Subscriber],
      ]);

      ob.once([''], id);
      const m2 = ob.monitor([''], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, ListenerType.Monitor],
        [[''], id, ListenerType.Monitor],
        [[], id, ListenerType.Subscriber],
        [[''], id, ListenerType.Subscriber],
      ]);

      ob.on(['0'], id);
      ob.on(['a'], id);
      ob.on(['1'], id);
      ob.on(['z'], id);
      ob.on([''], id);
      ob.on([], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, ListenerType.Monitor],
        [[''], id, ListenerType.Monitor],
        [[], id, ListenerType.Subscriber],
        [[], id, ListenerType.Subscriber],
        [[''], id, ListenerType.Subscriber],
        [[''], id, ListenerType.Subscriber],
        [['0'], id, ListenerType.Subscriber],
        [['a'], id, ListenerType.Subscriber],
        [['1'], id, ListenerType.Subscriber],
        [['z'], id, ListenerType.Subscriber],
      ]);

      ob.off([]);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[], id, ListenerType.Monitor],
        [[''], id, ListenerType.Monitor],
      ]);

      m1();
      m2();
      assert.deepStrictEqual(ob.refs([]), []);

      ob.on([''], id);
      assert.deepStrictEqual(ob.refs([]).map(convert), [
        [[''], id, ListenerType.Subscriber],
      ]);
      ob.off([''], id);
      assert.deepStrictEqual(ob.refs([]), []);
      return;

      function convert(register: ListenerItem<unknown[], unknown, unknown>) {
        return [
          register.namespace,
          register.listener,
          register.type,
        ];
      }
    });

    it('count', function () {
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

    it('emit recursive', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.once([''], () => ob.emit([''], 1, data => assert(cnt === 0 && data === 1 && ++cnt)));
      ob.emit([''], 0, data => void assert(cnt === 1 && data === 0 && ++cnt));
      assert(cnt === 2);
    });

    it('reflect', function () {
      const ob = new Observation<string[], void, void>();
      ob.on([''], () => 1);
      ob.on([''], () => 2);
      assert.deepStrictEqual(ob.reflect([''], undefined), [1, 2]);
    });

    it('monitor', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.monitor([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => void assert(cnt === 2 && data === 0 && ++cnt));
      assert(cnt === 3);
    });

    it('monitor once', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 0 && data === 1 && ++cnt), { once: true });
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      assert.deepStrictEqual(ob.refs([]), []);
      ob.monitor([''], data => assert(cnt === 2 && data === 2 && ++cnt), { once: true });
      ob.emit(['', ''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      assert.deepStrictEqual(ob.refs([]), []);
      ob.emit([''], 3, data => void assert(cnt === 4 && data === 3 && ++cnt));
      assert(cnt === 5);
    });

    it('on', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.emit([''], 0, data => void assert(cnt === 2 && data === 0 && ++cnt));
      assert(cnt === 3);
    });

    it('on once', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], data => assert(cnt === 0 && data === 1 && ++cnt), { once: true });
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      assert.deepStrictEqual(ob.refs([]), []);
      ob.on([''], data => assert(cnt === 2 && data === 2 && ++cnt), { once: true });
      ob.emit([], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      assert.deepStrictEqual(ob.refs([]), []);
      ob.on([''], throwError, { once: true });
      ob.off([''], throwError);
      ob.emit([''], 3, data => void assert(cnt === 4 && data === 3 && ++cnt));
      assert(cnt === 5);
    });

    it('once', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.once([''], data => assert(cnt === 0 && data === 1 && ++cnt));
      ob.emit([''], 1, data => assert(cnt === 1 && data === 1 && ++cnt));
      ob.once([''], data => assert(cnt === 2 && data === 2 && ++cnt));
      ob.emit([''], 2, data => assert(cnt === 3 && data === 2 && ++cnt));
      ob.once([''], throwError);
      ob.off([''], throwError);
      ob.emit([''], 3, data => void assert(cnt === 4 && data === 3 && ++cnt));
      assert(cnt === 5);
    });

    it('off', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => assert(cnt === 2 && data === 0 && ++cnt));
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on([''], throwError);
      ob.on([''], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.monitor([''], data => void assert(cnt === 3 && data === 0 && ++cnt));
      ob.off([''], throwError);
      ob.emit([''], 0);
      assert(cnt === 4);
    });

    it('off scope', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], throwError);
      ob.monitor([''], data => void assert(cnt === 1 && data === 0 && ++cnt));
      ob.on([''], throwError);
      ob.off(['']);
      assert(ob.refs(['']).length === 1);
      ob.on([''], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.emit([''], 0);
      assert(cnt === 2);
    });

    it('off sync', function () {
      const ob = new Observation<string[], number, void>();
      const f = () => 1;
      ob.on([], f);
      ob.on([], () => {
        ob.off([], f);
        ob.off([], g);
        ob.off(['']);
        ob.on([], () => 5);
        return 2;
      });
      ob.on([], () => 3);
      const g = () => 4;
      ob.on([], g);
      ob.on([''], () => 6);
      assert.deepStrictEqual(ob.reflect([], 0), [1, 2, 3]);
      ob.off([]);
      ob.on([], () => {
        ob.off([]);
        return 1;
      });
      assert.deepStrictEqual(ob.reflect([], 0), [1]);
    });

    it.skip('recovery', function () {
      let cnt = 0;
      const ob = new Observation<string[], void, void>();
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], () => assert(cnt === 0 && ++cnt));
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.on([''], throwError);
      ob.emit([''], undefined, () => void assert(cnt === 1 && ++cnt) || tick(() => void assert(cnt === 2 && ++cnt)));
      assert(cnt === 3);
    });

    it('on namespace', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.on([''], throwError);
      ob.on(['', '0'], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.on(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0', '0'], data => void assert(cnt === 2 && data === 0 && ++cnt));
      ob.emit(['', '0'], 0);
      assert(cnt === 3);
    });

    it('off namespace', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      ob.monitor([''], data => void assert(cnt === 4 && data === 0 && ++cnt));
      ob.on([''], throwError);
      ob.monitor(['', '0'], data => assert(cnt === 3 && data === 0 && ++cnt));
      ob.on(['', '0'], throwError);
      ob.on(['', '0'], data => assert(cnt === 0 && data === 0 && ++cnt));
      ob.monitor(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0'], data => assert(cnt === 1 && data === 0 && ++cnt));
      ob.on(['', '0', '0', '0'], data => assert(cnt === 2 && data === 0 && ++cnt));
      ob.off(['', '0'], throwError);
      ob.emit(['', '0'], 0);
      assert(cnt === 5);
    });

    it('mixed index types', function () {
      let cnt = 0;
      const sym = Symbol();
      const ob = new Observation<[number, symbol], number, void>();
      ob.on([NaN, sym], data => assert(cnt === 0 && data === 1 && ++cnt));
      // @ts-expect-error
      ob.emit([NaN, NaN], 0);
      ob.emit([NaN, Symbol()], 0);
      // @ts-expect-error
      ob.emit(['NaN', sym], 0);
      ob.emit([NaN, sym], 1);
      ob.off([NaN, sym]);
      ob.monitor([NaN, sym], data => void assert(cnt === 1 && data === 2 && ++cnt));
      ob.emit([NaN, sym], 2);
      assert(cnt === 2);
    });

    it('relay', function () {
      let cnt = 0;
      const ob = new Observation<string[], number, void>();
      const source = new Observation<string[], number, void>();
      ob.relay(source);
      ob.once(['a'], (data, index) => {
        assert(data === 0);
        assert.deepStrictEqual(index, ['a']);
        assert(cnt === 0 && ++cnt);
      });
      source.emit(['a'], 0);
      assert(cnt === 1);
    });

  });

});
