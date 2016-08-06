import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/scan', () => {
  describe('scan', () => {
    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .scan((a, b) => a + b, '')
          .extract(),
        ['']);
    });

    it('0', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(0)
          .extract(),
        []);
    });

    it('1', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(1)
          .extract(),
        ['a']);
    });

    it('2', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(2)
          .extract(),
        ['a', 'ab']);
    });

    it('3', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(3)
          .extract(),
        ['a', 'ab', 'abc']);
    });

    it('4', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(4)
          .extract(),
        ['a', 'ab', 'abc']);
    });

  });

});
