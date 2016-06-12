import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/write', () => {
  describe('Sequence.write', () => {
    it('array', () => {
      const stream = [0, 1, 2];
      const seq = Sequence.write(stream);
      assert.deepStrictEqual(
        seq
          .takeWhile(() => true)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        seq
          .takeWhile(() => true)
          .read(),
        []);
      stream.push(3, 4);
      assert.deepStrictEqual(
        seq
          .take(1)
          .read(),
        [3]);
      stream.length = 0;
      stream.push(5);
      assert.deepStrictEqual(
        seq
          .take(1)
          .read(),
        [5]);
    });

  });

});
