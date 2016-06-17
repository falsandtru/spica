import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/write', () => {
  describe('Sequence.write', () => {
    it('array', () => {
      const stream = [0, 1, 2];
      const seq = Sequence.write(stream);
      assert.deepStrictEqual(
        seq
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        seq
          .read(),
        []);
      stream.push(3, 4);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .read(),
        [3]);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .read(),
        [4]);
      stream.push(5);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .read(),
        [5]);
      stream.push(6);
      stream.length = 0;
      assert.deepStrictEqual(
        seq
          .read(),
        []);
    });

  });

});
