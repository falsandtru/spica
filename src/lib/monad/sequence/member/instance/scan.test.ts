import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/scan', () => {
  describe('scan', () => {
    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .scan((a, b) => a + b, '')
          .read(),
        ['']);
    });

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

    it('4', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(4)
          .read(),
        ['a', 'ab', 'abc']);
    });

  });

});
