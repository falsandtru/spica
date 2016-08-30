import {compose} from './compose';

describe('Unit: lib/compose', () => {
  describe('compose', () => {
    it('1', () => {
      class A {
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      interface X extends A {
      }
      class X {
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      compose(X, <any>A);
      const x = new X();
      assert(x instanceof X);
      assert(X['a'] === 'A');
      assert(X.x === 'X');
      assert(x.xp === 'x');
      assert(x.am() === void 0);
      assert(x.xm() === 'x');
    });

    it('2', () => {
      class A {
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class B {
        static b = 'B';
        bp = 'b';
        bm() {
          return this.bp;
        }
      }
      interface X extends B, A {
      }
      class X {
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      compose(X, <any>A, <any>B);
      const x = new X();
      assert(x instanceof X);
      assert(X['a'] === 'A');
      assert(X['b'] === 'B');
      assert(X.x === 'X');
      assert(x.xp === 'x');
      assert(x.am() === void 0);
      assert(x.bm() === void 0);
      assert(x.xm() === 'x');
    });

  });

});
