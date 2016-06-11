import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/scan', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('scan', () => {
    it('0', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(0)
          .read(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(1)
          .read(),
        ['a']);
    });

    it('2', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(2)
          .read(),
        ['a', 'ab']);
    });

    it('3', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(3)
          .read(),
        ['a', 'ab', 'abc']);
    });

  });

});
