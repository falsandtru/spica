import { Mixin } from './mixin';

describe('Unit: lib/mixin', () => {
  describe('mixin', () => {
    it('1', () => {
      let cnt = 0;
      class A {
        constructor() {
          assert(++cnt === 1);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class X extends Mixin<A>(A) {
        constructor() {
          super();
          assert(++cnt === 2);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X();
      assert(x instanceof A === false);
      assert(x instanceof X);
      assert(++cnt === 3);
      assert(X['a'] === 'A');
      assert(X.x === 'X');
      assert(x.ap === 'a');
      assert(x.xp === 'x');
      assert(x.am() === 'a');
      assert(x.xm() === 'x');
    });

    it('2', () => {
      let cnt = 0;
      class A {
        constructor() {
          assert(++cnt === 1);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class B {
        constructor() {
          assert(++cnt === 2);
        }
        static b = 'B';
        bp = 'b';
        bm() {
          return this.bp;
        }
      }
      interface AB extends B, A {
      }
      class X extends Mixin<AB>(B, A) {
        constructor() {
          super();
          assert(++cnt === 3);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X();
      assert(++cnt === 4);
      assert(x instanceof A === false);
      assert(x instanceof B === false);
      assert(x instanceof X);
      assert(X['a'] === 'A');
      assert(X['b'] === 'B');
      assert(X.x === 'X');
      assert(x.ap === 'a');
      assert(x.bp === 'b');
      assert(x.xp === 'x');
      assert(x.am() === 'a');
      assert(x.bm() === 'b');
      assert(x.xm() === 'x');
    });

    it('3', () => {
      let cnt = 0;
      class A {
        constructor() {
          assert(++cnt === 1);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class B {
        constructor() {
          assert(++cnt === 2);
        }
        static b = 'B';
        bp = 'b';
        bm() {
          return this.bp;
        }
      }
      class C {
        constructor() {
          assert(++cnt === 3);
        }
        static c = 'C';
        cp = 'c';
        cm() {
          return this.cp;
        }
      }
      interface ABC extends C, B, A {
      }
      class X extends Mixin<ABC>(C, B, A) {
        constructor() {
          super();
          assert(++cnt === 4);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X();
      assert(++cnt === 5);
      assert(x instanceof A === false);
      assert(x instanceof B === false);
      assert(x instanceof C === false);
      assert(x instanceof X);
      assert(X['a'] === 'A');
      assert(X['b'] === 'B');
      assert(X['c'] === 'C');
      assert(X.x === 'X');
      assert(x.ap === 'a');
      assert(x.bp === 'b');
      assert(x.cp === 'c');
      assert(x.xp === 'x');
      assert(x.am() === 'a');
      assert(x.bm() === 'b');
      assert(x.cm() === 'c');
      assert(x.xm() === 'x');
    });

  });

});
