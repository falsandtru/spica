import {HList, HNil} from './hlist';

describe('Unit: lib/hlist', () => {
  describe('HList', () => {
    it('HNil', () => {
      const nil = new HNil();
    });

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

  });

});
