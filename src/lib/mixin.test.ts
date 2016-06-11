import {Mixin} from './mixin';

describe('Unit: lib/mixin', () => {
  describe('mixin', () => {
    it('1', () => {
      let cnt = 0;
      class A {
        constructor(n: number) {
          assert(++cnt === 1);
          assert(n === 0);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class X extends Mixin<A>(A) {
        constructor(n: number) {
          super(n);
          assert(++cnt === 2);
          assert(n === 0);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X(0);
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
        constructor(n: number) {
          assert(++cnt === 1);
          assert(n === 0);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class B {
        constructor(n: number) {
          assert(++cnt === 2);
          assert(n === 0);
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
        constructor(n: number) {
          super(n);
          assert(++cnt === 3);
          assert(n === 0);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X(0);
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
        constructor(n: number) {
          assert(++cnt === 1);
          assert(n === 0);
        }
        static a = 'A';
        ap = 'a';
        am() {
          return this.ap;
        }
      }
      class B {
        constructor(n: number) {
          assert(++cnt === 2);
          assert(n === 0);
        }
        static b = 'B';
        bp = 'b';
        bm() {
          return this.bp;
        }
      }
      class C {
        constructor(n: number) {
          assert(++cnt === 3);
          assert(n === 0);
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
        constructor(n: number) {
          super(n);
          assert(++cnt === 4);
        }
        static x = 'X';
        xp = 'x';
        xm() {
          return this.xp;
        }
      }
      const x = new X(0);
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
