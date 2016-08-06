import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/read', () => {
  describe('Sequence.read', () => {
    it('array', () => {
      const stream = [0, 1, 2];
      const seq = Sequence.read(stream);
      assert.deepStrictEqual(
        seq
          .extract(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        seq
          .extract(),
        []);
      stream.push(3, 4);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .extract(),
        [3]);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .extract(),
        [4]);
      stream.push(5);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(0)
          .extract(),
        []);
      assert.deepStrictEqual(
        seq
          .drop(0)
          .take(1)
          .extract(),
        [5]);
      stream.push(6);
      stream.length = 0;
      assert.deepStrictEqual(
        seq
          .extract(),
        []);
    });

  });

});
