import { AtomicPromise } from './promise';

describe('Unit: lib/promise', () => {
  describe('AtomicPromise', () => {
    it('new', async () => {
      assert(new AtomicPromise(() => undefined) instanceof AtomicPromise);
      assert(new AtomicPromise(() => undefined) instanceof Promise === false);
      assert(await new AtomicPromise(res => res(0)) === 0);
      assert(await new AtomicPromise((res, rej) => (res(0), res(1), rej())) === 0);
    });

    it('resolve', async () => {
      assert(AtomicPromise.resolve() instanceof AtomicPromise);
      assert(await AtomicPromise.resolve(0) === 0);
      assert(await AtomicPromise.resolve(AtomicPromise.resolve(0)) === 0);
      assert(await AtomicPromise.resolve(AtomicPromise.resolve(AtomicPromise.resolve(0))) === 0);
      assert(await AtomicPromise.resolve(Promise.resolve(0)) === 0);
    });

    it('reject', async () => {
      assert(await AtomicPromise.reject(1).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.reject(AtomicPromise.resolve(0)).catch((r: AtomicPromise<Number>) => r.then()) === 0);
      assert(await AtomicPromise.reject(Promise.resolve(0)).catch((r: AtomicPromise<number>) => r.then()) === 0);
      assert(await AtomicPromise.reject(AtomicPromise.reject(1)).catch((r: AtomicPromise<number>) => r.catch((r: number) => ++r)) === 2);
      assert(await AtomicPromise.reject(Promise.reject(1)).catch((r: AtomicPromise<number>) => r.catch((r: number) => ++r)) === 2);
      assert(await AtomicPromise.resolve(AtomicPromise.reject(1)).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.resolve(Promise.reject(1)).catch((r: number) => ++r) === 2);
    });

    it('then', async () => {
      assert(AtomicPromise.resolve().then() instanceof AtomicPromise);
      assert(AtomicPromise.resolve().then(() => Promise.resolve()) instanceof AtomicPromise);
      assert(await AtomicPromise.resolve(0) === 0);
      assert(await AtomicPromise.resolve(0).then(n => ++n) === 1);
      assert(await AtomicPromise.resolve(0).then(n => AtomicPromise.resolve(++n)) === 1);
      assert(await AtomicPromise.resolve(0).then(n => AtomicPromise.resolve(AtomicPromise.resolve(++n))) === 1);
      assert(await AtomicPromise.resolve(0).then(n => Promise.resolve(++n)) === 1);
    });

    it('catch', async () => {
      assert(await new AtomicPromise(() => { throw 1; }).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.reject(1).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.resolve(0).then((n: number) => { throw ++n; }).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.reject(1).catch((n: number) => { throw ++n; }).catch((r: number) => ++r) === 3);
    });

    it('finally', async () => {
      assert(await AtomicPromise.resolve(0).finally(() => 1) === 0);
      assert(await AtomicPromise.resolve(0).finally(() => AtomicPromise.reject(1)).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.reject(0).finally(() => AtomicPromise.reject(1)).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.resolve(0).finally(() => { throw 1; }).catch((r: number) => ++r) === 2);
      assert(await AtomicPromise.reject(0).finally(() => { throw 1; }).catch((r: number) => ++r) === 2);
    });

    it('atomic', async () => {
      let cnt = 0;
      AtomicPromise.resolve().then(() => assert(cnt === 0));
      assert(++cnt === 1);
      AtomicPromise.reject().catch(() => assert(cnt === 1));
      assert(++cnt === 2);
    });

    it('all', async () => {
      assert.deepStrictEqual(await AtomicPromise.all([]), []);
      assert.deepStrictEqual(
        await AtomicPromise.all([
          1,
          AtomicPromise.resolve(2),
        ]),
        [
          1,
          2,
        ]);
    });

    it('race', async () => {
      assert(await AtomicPromise.race([AtomicPromise.resolve(1), 2]) === 1);
      assert(await AtomicPromise.race([AtomicPromise.reject(1), 2]).catch(r => r) === 1);
    });

    it('promise', async () => {
      assert(await Promise.resolve(AtomicPromise.resolve(0)) === 0);
      assert(await Promise.resolve(AtomicPromise.reject(1)).catch(r => ++r) === 2);
    });

  });

});
