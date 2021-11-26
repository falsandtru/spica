import { HList } from './hlist';

describe('Unit: lib/hlist', () => {
  describe('HList', () => {
    it('type', () => {
      type HNil = typeof HNil;
      const HNil = HList();
      // @ts-expect-error
      (): HNil => HList(0);
      // @ts-expect-error
      (): HList<[0]> => HNil;
    });

    it('HList 0', () => {
      const node: HList<[]> = HList();
      assert.deepStrictEqual(node.tuple(), []);
    });

    it('HList 1', () => {
      const node: HList<[number]> = HList(0);
      assert.deepStrictEqual(node.tuple(), [0]);
    });

    it('HList 2', () => {
      const node: HList<[number, string]> = HList(0, '');
      assert.deepStrictEqual(node.tuple(), [0, '']);
    });

    it('add', () => {
      const node: HList<[number, string]> = HList().add('').add(0);
      assert.deepStrictEqual(node.tuple(), HList(0, '').tuple());
    });

    it('head', () => {
      assert(HList(0).head === 0);
      assert(HList(0).add('').head === '');
    });

    it('tail', () => {
      assert.deepStrictEqual(
        ((): [] => HList(0).tail.tuple())(),
        []);
      assert.deepStrictEqual(
        ((): [string] => HList(0, '').tail.tuple())(),
        ['']);
    });

    it('modify', () => {
      assert.deepStrictEqual(
        ((): [boolean] => HList(0).modify(n => !n).tuple())(),
        [true]);
    });

    it('fold', () => {
      assert.deepStrictEqual(
        ((): [number[]] => HList([] as number[], 1).fold((ns, n) => ns.concat(n)).tuple())(),
        [[1]]);
    });

    it('unfold', () => {
      assert.deepStrictEqual(
        ((): [boolean, number] => HList(0).unfold(n => !n).tuple())(),
        [true, 0]);
    });

    it('tuple', () => {
      assert.deepStrictEqual(
        ((): [boolean, number, string] => HList(false, 0, '').tuple())(),
        [false, 0, '']);
    });

    it('reverse', () => {
      assert.deepStrictEqual(
        ((): [string, number, boolean] => HList(false, 0, '').reverse())(),
        ['', 0, false]);
      assert.deepStrictEqual(
        ((): [string, number, boolean] => HList(...HList(false, 0, '').reverse()).tuple())(),
        ['', 0, false]);
    });

  });

});
