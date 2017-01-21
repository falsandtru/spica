import { HList, HNil } from './hlist';

describe('Unit: lib/hlist', () => {
  describe('HList', () => {
    it('HList 1', () => {
      const list: HList<number, HNil> = new HNil().push(0);
      assert(list.head() === 0);
    });

    it('HList 2', () => {
      const list: HList<string, HList<number, HNil>> = new HNil().push(0).push('');
      assert(list.head() === '');
    });

    it('HList 1+', () => {
      const list: HList<string, HNil | HList<any, any>> = new HNil().push(0).push('');
      assert(list.head() === '');
    });

    it('head', () => {
      assert(new HNil().push(0).head() === 0);
      assert(new HNil().push(0).push('').head() === '');
    });

    it('tail', () => {
      assert(new HNil().push(0).push('').tail().head() === 0);
      assert(new HNil().push(0).push('').push(2).tail().head() === '');
    });

    it('walk', () => {
      assert(new HNil().push(0).push('').walk(s => assert(s === '')).head() === 0);
    });

    it('modify', () => {
      assert(new HNil().push(0).push(1).modify(n => n + '').head() === '1');
      assert(new HNil().push(0).push(1).modify(n => n + '').tail().head() === 0);
    });

    it('extend', () => {
      assert(new HNil().push(0).extend(n => n + '').head() === '0');
      assert(new HNil().push(0).extend(n => n + '').tail().head() === 0);
    });

    it('compact', () => {
      {
        const l: HList<number[], HNil> = new HNil().push(1).push([2]).compact((ns, n) => ns.concat(n));
        assert.deepStrictEqual(l.tuple(), [[2, 1]]);
      }
      {
        const l: HList<number[], HList<string, HNil>> = new HNil().push('').push(2).push([5]).compact((ns, n) => ns.concat(n));
        assert.deepStrictEqual(l.tuple(), [[5, 2], '']);
      }
    });

    it('reverse', () => {
        const t: [boolean, number, string] = new HNil().push(false).push(0).push('').reverse().tuple();
        assert.deepStrictEqual(t, [false, 0, '']);
    });

    it('tuple', () => {
      {
        const t: [boolean] = new HNil().push(false).tuple();
        assert.deepStrictEqual(t, [false]);
      }
      {
        const t: [number, boolean] = new HNil().push(false).push(0).tuple();
        assert.deepStrictEqual(t, [0, false]);
      }
      {
        const t: [string, number, boolean] = new HNil().push(false).push(0).push('').tuple();
        assert.deepStrictEqual(t, ['', 0, false]);
      }
    });

  });

});
