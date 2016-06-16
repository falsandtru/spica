import {Sequence} from '../../../sequence';

describe('Unit: lib/monad/sequence/member/static/concat', () => {
  describe('Sequence.concat', () => {
    it('[]', () => {
      assert.deepStrictEqual(
        Sequence.concat([])
          .read(),
        []);
    });

    it('[[]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([])])
          .read(),
        []);
    });

    it('[[0]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0])])
          .read(),
        [0]);
    });

    it('[[0, 1]] 1', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0, 1])])
          .take(1)
          .read(),
        [0]);
    });

    it('[[0, 1]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0, 1])])
          .read(),
        [0, 1]);
    });

    it('[[] []]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([]), Sequence.from([])])
          .read(),
        []);
    });

    it('[[0] []]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0]), Sequence.from([])])
          .read(),
        [0]);
    });

    it('[[] [0]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([]), Sequence.from([0])])
          .read(),
        [0]);
    });

    it('[[0] [1]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0]), Sequence.from([1])])
          .read(),
        [0, 1]);
    });

    it('[[0, 1] [2, 3]]', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0, 1]), Sequence.from([2 ,3])])
          .read(),
        [0, 1, 2, 3]);
    });

    it('[[0, 1] [2, 3]] 1', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0, 1]), Sequence.from([2, 3])])
          .take(1)
          .read(),
        [0]);
    });

    it('[[0, 1] [2, 3]] 3', () => {
      assert.deepStrictEqual(
        Sequence.concat([Sequence.from([0, 1]), Sequence.from([2, 3])])
          .take(3)
          .read(),
        [0, 1, 2]);
    });

    it('Sequence<T[], S>', () => {
      assert.deepStrictEqual(
        Sequence.concat(Sequence.from([[0, 1, 2]]))
          .take(2)
          .read(),
        [0, 1]);
    });

    it('Sequence<Sequence<T, S>, S>', () => {
      assert.deepStrictEqual(
        Sequence.concat(Sequence.from([Sequence.from([0, 1, 2])]))
          .take(2)
          .read(),
        [0, 1]);
    });

  });

});
