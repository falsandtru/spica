import { AtomicPromise } from './promise';

describe('Unit: lib/promise', () => {
  describe('AtomicPromise', () => {
    it('new', async () => {
      assert(new AtomicPromise(() => undefined) instanceof AtomicPromise);
      assert(new AtomicPromise(() => undefined) instanceof Promise === false);
      assert(await new AtomicPromise<number>(res => res(0)) === 0);
      assert(await new AtomicPromise<number>((res, rej) => (res(0), res(1), rej())) === 0);
    });

    it('resolve', async () => {
      assert(AtomicPromise.resolve() instanceof AtomicPromise);
      assert(await AtomicPromise.resolve(0) === 0);
      assert(await AtomicPromise.resolve(AtomicPromise.resolve(0)) === 0);
      assert(await AtomicPromise.resolve(AtomicPromise.resolve(AtomicPromise.resolve(0))) === 0);
      assert(await AtomicPromise.resolve(AtomicPromise.resolve(Promise.resolve(0))) === 0);
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
      assert(await AtomicPromise.resolve().then(function (this: unknown) { assert(this === undefined); return true; }));
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
      AtomicPromise.resolve().then(() => assert(++cnt === 1));
      assert(++cnt === 2);
      AtomicPromise.reject().catch(() => assert(++cnt === 2));
      assert(++cnt === 4);
    });

    it('all', async () => {
      assert.deepStrictEqual(await AtomicPromise.all([]), []);
      assert.deepStrictEqual(
        await AtomicPromise.all([
          1,
          Promise.resolve(2),
          AtomicPromise.resolve(3),
        ]),
        [
          1,
          2,
          3,
        ]);
      assert.deepStrictEqual(
        await AtomicPromise.all([
          1,
          Promise.reject(2),
          3,
        ]).catch(r => [r]),
        [
          2,
        ]);
      assert.deepStrictEqual(
        await AtomicPromise.all([
          1,
          Promise.reject(2),
          AtomicPromise.reject(3),
          4,
          5,
        ]).catch(r => [r]),
        [
          3,
        ]);
    });

    it('race', async () => {
      assert(await AtomicPromise.race([1, AtomicPromise.resolve(2)]) === 1);
      assert(await AtomicPromise.race([AtomicPromise.resolve(1), 2]) === 1);
      assert(await AtomicPromise.race([Promise.resolve(1), 2]) === 2); // Incompatible!
      assert(await AtomicPromise.race([AtomicPromise.reject(1), 2]).catch(r => r) === 1);
      //assert(await AtomicPromise.race([Promise.reject(1), 2]).catch(r => r) === 2); // Incompatible!
    });

    it('allSettled', async () => {
      assert.deepStrictEqual(await AtomicPromise.allSettled([]), []);
      assert.deepStrictEqual(
        await AtomicPromise.allSettled([
          1,
          Promise.reject(2),
          Promise.resolve(3),
        ]),
        [
          { status: 'fulfilled', value: 1 },
          { status: 'rejected', reason: 2 },
          { status: 'fulfilled', value: 3 },
        ]);
    });

    it('any', async () => {
      assert.deepEqual(
        await AtomicPromise.any([]).catch((e: any) => e.errors),
        []);
      assert.deepEqual(
        await AtomicPromise.any([
          Promise.reject(1),
          AtomicPromise.reject(2),
        ]).catch((e: any) => e.errors),
        [
          1,
          2,
        ]);
      assert.deepStrictEqual(
        await AtomicPromise.any([
          Promise.reject(1),
          Promise.resolve(2),
          3,
          AtomicPromise.resolve(4),
        ]),
        3);
      assert.deepStrictEqual(
        await AtomicPromise.any([
          Promise.reject(1),
          Promise.resolve(2),
          AtomicPromise.resolve(3),
          4,
        ]),
        3);
    });

    it('promise', async () => {
      (): Promise<void> => AtomicPromise.resolve();
      assert(await Promise.resolve(AtomicPromise.resolve(0)) === 0);
      assert(await Promise.resolve(AtomicPromise.reject(1)).catch(r => ++r) === 2);
    });

  });

});
