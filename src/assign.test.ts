import { assign, clone, extend, merge, inherit } from './assign';
import { type } from './type';

describe('Unit: lib/assign', () => {
  describe('type', () => {
    it('setting', () => {
      interface Setting {
        a: {
          b: 0;
        };
      };
      interface Option {
        a?: {
          b?: 0;
        };
      }
      (): Setting => extend({} as Setting, {} as Option);
      (): Setting => extend({}, {} as Setting, {} as Option);
    });

  });

  describe('assign', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        assign<object>({
          a: 1,
          b: undefined,
          c: 0
        }, {
          b: 2,
          c: undefined,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: undefined,
          d: 4,
          e: 5
        });
    });

    it('deep', () => {
      assert.deepStrictEqual(
        assign<object>({
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
        });
    });

    it('array', () => {
      assert.deepStrictEqual(
        assign<object>({
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
        });
      assert.deepStrictEqual(
        assign({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        });
    });

    it('object', () => {
      assert.deepStrictEqual(
        assign<object>({
          a: undefined,
          b: undefined,
          c: null,
          d: null
        }, {
          a: Object.freeze([0]),
          b: Object.freeze({0:0}),
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
        });
      assert(type(assign({ a: null }, { a: Object.create(null) }).a) === 'Object');
      assert.deepStrictEqual(assign({ a: { 0: 0 } }, { a: Object.create(null) }), { a: Object.create(null) });
    });

    it('mixed', () => {
      assert.deepStrictEqual(
        assign<object>({
          a: {
            a: 1,
            b: [1]
          }
        }, {
          a: {
            a: [2],
            b: 2,
            c: Object.freeze([2])
          }
        }, {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        }), {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        });
    });

  });

  describe('clone', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        clone<object>({
          a: 1,
          b: undefined,
          c: 0
        }, {
          b: 2,
          c: undefined,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: undefined,
          d: 4,
          e: 5
        });
    });

    it('deep', () => {
      assert.deepStrictEqual(
        clone<object>({
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
        });
    });

    it('array', () => {
      assert.deepStrictEqual(
        clone<object>({
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
        });
      assert.deepStrictEqual(
        clone({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        });
    });

    it('object', () => {
      assert.deepStrictEqual(
        clone<object>({
          a: undefined,
          b: undefined,
          c: null,
          d: null
        }, {
          a: Object.freeze([0]),
          b: Object.freeze({0:0}),
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
        });
      assert(type(clone({ a: null }, { a: Object.create(null) }).a) === 'Object');
      assert.deepStrictEqual(clone({ a: { 0: 0 } }, { a: Object.create(null) }), { a: Object.create(null) });
    });

    it('mixed', () => {
      assert.deepStrictEqual(
        clone<object>({
          a: {
            a: 1,
            b: [1]
          }
        }, {
          a: {
            a: [2],
            b: 2,
            c: Object.freeze([2])
          }
        }, {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        }), {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        });
    });

  });

  describe('extend', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        extend<object>({
          a: 1,
          b: undefined,
          c: 3
        }, {
          b: 2,
          c: undefined,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          e: 5
        });
    });

    it('deep', () => {
      assert.deepStrictEqual(
        extend<object>({
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
        });
    });

    it('array', () => {
      assert.deepStrictEqual(
        extend<object>({
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
        });
      assert.deepStrictEqual(
        extend({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        });
    });

    it('object', () => {
      assert.deepStrictEqual(
        extend<object>({
          a: undefined,
          b: undefined,
          c: null,
          d: null
        }, {
          a: Object.freeze([0]),
          b: Object.freeze({0:0}),
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
        });
      assert(type(extend({ a: null }, { a: Object.create(null) }).a) === 'Object');
      assert.deepStrictEqual(extend({ a: { 0: 0 } }, { a: Object.create(null) }), { a: { 0: 0 } });
    });

    it('mixed', () => {
      assert.deepStrictEqual(
        extend<object>({
          a: {
            a: 1,
            b: [1]
          }
        }, {
          a: {
            a: [2],
            b: 2,
            c: Object.freeze([2])
          }
        }, {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        }), {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        });
    });

  });

  describe('merge', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        merge<object>({
          a: 1,
          b: undefined,
          c: 3
        }, {
          b: 2,
          c: undefined,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          e: 5
        });
    });

    it('deep', () => {
      assert.deepStrictEqual(
        merge<object>({
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
        });
    });

    it('array', () => {
      assert.deepStrictEqual(
        merge<object>({
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
          c: [2, 3],
          d: [3, 4],
          e: [5]
        });
      assert.deepStrictEqual(
        merge({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [0, 2, 1]
        });
    });

    it('object', () => {
      assert.deepStrictEqual(
        merge<object>({
          a: undefined,
          b: undefined,
          c: null,
          d: null
        }, {
          a: Object.freeze([0]),
          b: Object.freeze({0:0}),
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
          a: [0, 1, 2],
          b: {0:0,1:1,2:2},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        });
      assert(type(merge({ a: null }, { a: Object.create(null) }).a) === 'Object');
      assert.deepStrictEqual(merge({ a: { 0: 0 } }, { a: Object.create(null) }), { a: { 0: 0 } });
    });

    it('mixed', () => {
      assert.deepStrictEqual(
        merge<object>({
          a: {
            a: 1,
            b: [1]
          }
        }, {
          a: {
            a: [2],
            b: 2,
            c: Object.freeze([2])
          }
        }, {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        }), {
          a: {
            a: 3,
            b: [3],
            c: [2, 3]
          }
        });
    });

  });

  describe('inherit', () => {
    it('shallow', () => {
      assert.deepStrictEqual(
        inherit<object>({
          a: 1,
          b: undefined,
          c: 3
        }, {
          b: 2,
          c: undefined,
          d: 3
        }, {
          d: 4,
          e: 5
        }), {
          a: 1,
          b: 2,
          c: 3,
          d: 4,
          e: 5
        });
    });

    it('deep', () => {
      assert.deepStrictEqual(
        inherit<object>({
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
        });
    });

    it('array', () => {
      assert.deepStrictEqual(
        inherit<object>({
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
        });
      assert.deepStrictEqual(
        inherit({
          a: [0, 2]
        }, {
          a: [1]
        }), {
          a: [1]
        });
    });

    it('object', () => {
      assert.deepEqual(
        inherit<object>({
          a: undefined,
          b: undefined,
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
        }),
        inherit<object>({
        }, {
          a: [2],
          b: {0:0},
          c: {2:2},
          d: [2],
          e: {2:2},
          f: [2]
        }, {
          b: {1:1,2:2},
        }));
      assert(type(inherit({ a: null }, { a: Object.create(null) }).a) === 'Object');
      assert.deepStrictEqual(inherit({ a: { 0: 0 } }, { a: Object.create(null) }), { a: { 0: 0 } });
    });

    it('mixed', () => {
      assert.deepStrictEqual(
        inherit<object>({
          a: {
            a: 1,
            b: [1]
          }
        }, {
          a: {
            a: [2],
            b: 2,
            c: Object.freeze([2])
          }
        }, {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        }), {
          a: {
            a: 3,
            b: [3],
            c: [3]
          }
        });
    });

  });

});
