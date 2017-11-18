import { Diff, Overwrite } from './data';

describe('Unit: lib/data', () => {
  describe('Diff', () => {
    it('', () => {
      type AB = { a: void; b: void; };
      type B = { b: void; };
      type Expected = { a: void; };
      assert((): Diff<AB, B> => ({}) as Expected);
      assert((): Expected => ({}) as Diff<AB, B>);
    });

  });

  describe('Overwrite', () => {
    it('', () => {
      type AB = { a: void; b: void; };
      type B = { b: number; };
      type Expected = { a: void; b: number; };
      assert((): Overwrite<AB, B> => ({}) as Expected);
      assert((): Expected => ({}) as Overwrite<AB, B>);
    });

  });

});
