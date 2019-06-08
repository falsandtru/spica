import { HList, HNil } from './hlist';

describe('Unit: lib/hlist', () => {
  describe('HList', () => {
    it('HList 0', () => {
      const list: HList<[]> = HNil;
      assert.deepStrictEqual(list.tuple(), []);
    });

    it('HList 1', () => {
      const list: HList<[number]> = HNil.push(0);
      assert(list.head === 0);
    });

    it('HList 2', () => {
      const list: HList<[string, number]> = HNil.push(0).push('');
      assert(list.head === '');
    });

    it('head', () => {
      assert(HNil.push(0).head === 0);
      assert(HNil.push(0).push('').head === '');
    });

    it('tail', () => {
      assert(HNil.push(0).push('').tail.head === 0);
      assert(HNil.push(0).push('').push(2).tail.head === '');
    });

    it('walk', () => {
      assert(HNil.push(0).push('').walk(s => assert(s === '')).head === 0);
    });

    it('modify', () => {
      assert(HNil.push(0).push(1).modify(n => n + '').head === '1');
      assert(HNil.push(0).push(1).modify(n => n + '').tail.head === 0);
    });

    it('extend', () => {
      assert(HNil.push(0).extend(n => n + '').head === '0');
      assert(HNil.push(0).extend(n => n + '').tail.head === 0);
    });

    it('compact', () => {
      {
        const l: HList<[number[]]> = HNil.push(1).push([2]).compact((ns, n) => ns.concat(n));
        assert.deepStrictEqual(l.tuple(), [[2, 1]]);
      }
      {
        const l: HList<[number[], string]> = HNil.push('').push(2).push([5]).compact((ns, n) => ns.concat(n));
        assert.deepStrictEqual(l.tuple(), [[5, 2], '']);
      }
    });

    it('reverse', () => {
        const t: [boolean, number, string] = HNil.push(false).push(0).push('').reverse();
        assert.deepStrictEqual(t, [false, 0, '']);
    });

    it('tuple', () => {
      {
        const t: [boolean] = HNil.push(false).tuple();
        assert.deepStrictEqual(t, [false]);
      }
      {
        const t: [number, boolean] = HNil.push(false).push(0).tuple();
        assert.deepStrictEqual(t, [0, false]);
      }
      {
        const t: [string, number, boolean] = HNil.push(false).push(0).push('').tuple();
        assert.deepStrictEqual(t, ['', 0, false]);
      }
    });

  });

});
