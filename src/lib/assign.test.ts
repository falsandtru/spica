import {assign, clone, extend} from './assign';

describe('Unit: lib/assign', () => {
  describe('assign', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        assign<{}>({
          a: 1,
          b: void 0,
          c: 0
        }, {
          b: 2,
          c: void 0,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: void 0,
          d: 4,
          e: 5
        }
      );
    });

    it('deep', () => {
      assert.deepStrictEqual(
        assign({
          a: {
            a: 1,
            b: 1
          }
        }, {
          a: {
            b: 2
          }
        }), {
          a: {
            b: 2
          }
        }
      );
    });

    it('array', () => {
      assert.deepStrictEqual(
        assign<{}>({
          a: [1],
          b: [],
          c: [2]
        }, {
          b: [2],
          c: [3],
          d: [3]
        }, {
          d: [4],
          e: [5]
        }), {
          a: [1],
          b: [2],
          c: [3],
          d: [4],
          e: [5]
        }
      );
      assert.deepStrictEqual(
        assign({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        }
      );
    });

    it('object', () => {
      assert.deepStrictEqual(
        assign<{}>({
          a: void 0,
          b: void 0,
          c: null,
          d: null
        }, {
          a: [0],
          b: {0:0},
          c: [0],
          d: {0:0},
          e: [0],
          f: {0:0}
        }, {
          a: [1],
          b: {1:1},
          c: [1],
          d: {1:1},
          e: [1],
          f: {1:1}
        }, {
          a: [2],
          b: {2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }), {
          a: [2],
          b: {2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }
      );
    });

  });

  describe('clone', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        clone<{}>({
          a: 1,
          b: void 0,
          c: 0
        }, {
          b: 2,
          c: void 0,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: void 0,
          d: 4,
          e: 5
        }
      );
    });

    it('deep', () => {
      assert.deepStrictEqual(
        clone({
          a: {
            a: 1,
            b: 1
          }
        }, {
          a: {
            b: 2
          }
        }), {
          a: {
            b: 2
          }
        }
      );
    });

    it('array', () => {
      assert.deepStrictEqual(
        clone<{}>({
          a: [1],
          b: [],
          c: [2]
        }, {
          b: [2],
          c: [3],
          d: [3]
        }, {
          d: [4],
          e: [5]
        }), {
          a: [1],
          b: [2],
          c: [3],
          d: [4],
          e: [5]
        }
      );
      assert.deepStrictEqual(
        clone({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        }
      );
    });

    it('object', () => {
      assert.deepStrictEqual(
        clone<{}>({
          a: void 0,
          b: void 0,
          c: null,
          d: null
        }, {
          a: [0],
          b: {0:0},
          c: [0],
          d: {0:0},
          e: [0],
          f: {0:0}
        }, {
          a: [1],
          b: {1:1},
          c: [1],
          d: {1:1},
          e: [1],
          f: {1:1}
        }, {
          a: [2],
          b: {2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }), {
          a: [2],
          b: {2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }
      );
    });

  });

  describe('extend', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        extend<{}>({
          a: 1,
          b: void 0,
          c: 0
        }, {
          b: 2,
          c: void 0,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: void 0,
          d: 4,
          e: 5
        }
      );
    });

    it('deep', () => {
      assert.deepStrictEqual(
        extend({
          a: {
            a: 1,
            b: 1
          }
        }, {
          a: {
            b: 2
          }
        }), {
          a: {
            a: 1,
            b: 2
          }
        }
      );
    });

    it('array', () => {
      assert.deepStrictEqual(
        extend<{}>({
          a: [1],
          b: [],
          c: [2]
        }, {
          b: [2],
          c: [3],
          d: [3]
        }, {
          d: [4],
          e: [5]
        }), {
          a: [1],
          b: [2],
          c: [3],
          d: [4],
          e: [5]
        }
      );
      assert.deepStrictEqual(
        extend({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        }
      );
    });

    it('object', () => {
      assert.deepStrictEqual(
        extend<{}>({
          a: void 0,
          b: void 0,
          c: null,
          d: null
        }, {
          a: [0],
          b: {0:0},
          c: [0],
          d: {0:0},
          e: [0],
          f: {0:0}
        }, {
          a: [1],
          b: {1:1},
          c: [1],
          d: {1:1},
          e: [1],
          f: {1:1}
        }, {
          a: [2],
          b: {2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }), {
          a: [2],
          b: {0:0,1:1,2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }
      );
    });

  });

});
