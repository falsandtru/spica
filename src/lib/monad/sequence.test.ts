import {Sequence} from './sequence';

describe('Unit: lib/monad/sequence', () => {
  const nat = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1));
  const double = nat.map(n => n * 2);
  const triple = nat.map(n => n * 3);

  describe('Sequence', () => {
    it('iterate', () => {
      let thunk = new Sequence<number, number>((n = 0, cons) => cons()).iterate();
      assert.deepStrictEqual(thunk, [void 0, Sequence.Iterator.done, -1]);

      thunk = new Sequence<number, number>((n = 0, cons) => cons(n)).iterate();
      assert.deepStrictEqual(thunk, [0, Sequence.Thunk.iterator(thunk), 0]);

      thunk = new Sequence<number, number>((n = 1, cons) => n < 4 ? cons(n, n * 2) : cons(n)).iterate();
      assert.deepStrictEqual(thunk, [1, Sequence.Thunk.iterator(thunk), 0]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [2, Sequence.Thunk.iterator(thunk), 1]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [4, Sequence.Thunk.iterator(thunk), 2]);
      thunk = Sequence.Thunk.iterator(thunk)();
      assert.deepStrictEqual(thunk, [void 0, Sequence.Iterator.done, -1]);
    });

    it('memoize', () => {
      const seq = Sequence.write([0, 1, 2]);
      const mem = Sequence.write([0, 1, 2]).memoize();
      assert.deepStrictEqual(seq.read(), [0, 1, 2]);
      assert.deepStrictEqual(seq.read(), []);
      assert.deepStrictEqual(mem.read(), [0, 1, 2]);
      assert.deepStrictEqual(mem.read(), [0, 1, 2]);
    });

    it('take', () => {
      assert.deepStrictEqual(
        nat
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .take(1)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .take(2)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        nat
          .take(3)
          .read(),
        [0, 1, 2]);
    });

    it('drop', () => {
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .drop(0)
          .take(3)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .read(),
        [1, 2, 3]);
      assert.deepStrictEqual(
        nat
          .drop(2)
          .take(3)
          .read(),
        [2, 3, 4]);
      assert.deepStrictEqual(
        nat
          .drop(3)
          .take(3)
          .read(),
        [3, 4, 5]);
    });

    it('takeWhile', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeWhile(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .takeWhile(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons())
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 1)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 2)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 3)
          .read(),
        [0, 1, 2]);
    });

    it('dropWhile', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .dropWhile(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => false)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .dropWhile(() => false)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => false)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons())
          .dropWhile(() => false)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons())
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => false)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons(n))
          .dropWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 0)
          .take(3)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 1)
          .take(3)
          .read(),
        [1, 2, 3]);
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 2)
          .take(3)
          .read(),
        [2, 3, 4]);
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 3)
          .take(3)
          .read(),
        [3, 4, 5]);
    });

    it('until', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .until(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .until(() => false)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .until(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .until(() => false)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .until(() => false)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .until(() => false)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons())
          .until(() => false)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons(n))
          .until(() => false)
          .read(),
        [0, 1, 2]);

      assert.deepStrictEqual(
        nat
          .until(n => n === 0)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .until(n => n === 1)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        nat
          .until(n => n === 2)
          .read(),
        [0, 1, 2]);
    });

    it('fmap', () => {
      assert.deepStrictEqual(
        nat
          .fmap(String)
          .take(0)
          .read(),
        [].map(String));
      assert.deepStrictEqual(
        nat
          .fmap(String)
          .take(1)
          .read(),
        [0].map(String));
      assert.deepStrictEqual(
        nat
          .fmap(String)
          .take(2)
          .read(),
        [0, 1].map(String));
      assert.deepStrictEqual(
        nat
          .fmap(String)
          .take(3)
          .read(),
        [0, 1, 2].map(String));
    });

    it('bind', () => {
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(1)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(3)
          .read(),
        [0, 0, 1]);
      assert.deepStrictEqual(
        nat
          .bind(n => new Sequence<number, number>((m = 0, cons) => m < n ? cons(m, m + 1) : cons()))
          .take(7)
          .read(),
        [0, 0, 1, 0, 1, 2, 0]);
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(n => Sequence.from([]))
          .take(Infinity)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .take(3)
          .bind(n => Sequence.from([n, -n]))
          .take(Infinity)
          .read(),
        [0, 0, 1, -1, 2, -2]);
    });

    it('mapM', () => {
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n, -n]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([]))
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n]))
          .read(),
        [[1]]);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(1)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [[1], [-1]]);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .take(1)
          .read(),
        [[1, 2]]);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(2)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [[1, 2], [1, -2], [-1, 2], [-1, -2]]);
      assert.deepStrictEqual(
        nat
          .drop(1)
          .take(3)
          .mapM(n => Sequence.from([n, -n]))
          .read(),
        [
          [1, 2, 3], [1, 2, -3], [1, -2, 3], [1, -2, -3],
          [-1, 2, 3], [-1, 2, -3], [-1, -2, 3], [-1, -2, -3]
        ]);
    });

    it('filterM', () => {
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([false]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true, false]))
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([false]))
          .read(),
        [[]]);
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true]))
          .read(),
        [[0]]);
      assert.deepStrictEqual(
        nat
          .take(1)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0], []]);
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true, false]))
          .take(1)
          .read(),
        [[0, 1]]);
      assert.deepStrictEqual(
        nat
          .take(2)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0, 1], [0], [1], []]);
      assert.deepStrictEqual(
        nat
          .take(3)
          .filterM(() => Sequence.from([true, false]))
          .read(),
        [[0, 1, 2], [0, 1], [0, 2], [0], [1, 2], [1], [2], []]);
    });

    it('map', () => {
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(0)
          .read(),
        [].map(String));
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(1)
          .read(),
        [0].map(String));
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(2)
          .read(),
        [0, 1].map(String));
      assert.deepStrictEqual(
        nat
          .map(String)
          .take(3)
          .read(),
        [0, 1, 2].map(String));
    });

    it('filter', () => {
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(1)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(2)
          .read(),
        [0, 2]);
      assert.deepStrictEqual(
        nat
          .filter(n => n % 2 === 0)
          .take(3)
          .read(),
        [0, 2, 4]);
    });

    it('scan', () => {
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(0)
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(1)
          .read(),
        ['a']);
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(2)
          .read(),
        ['a', 'ab']);
      assert.deepStrictEqual(
        Sequence.from('abc'.split(''))
          .scan((a, b) => a + b, '')
          .take(Infinity)
          .read(),
        ['a', 'ab', 'abc']);
    });

    it('limited', () => {
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons())
          .takeWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => cons(n))
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons())
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons())
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        new Sequence<number, number>((n = 0, cons) => n < 2 ? cons(n, n + 1) : cons(n))
          .takeWhile(() => true)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .dropWhile(n => n < 3)
          .takeWhile(n => n < 6)
          .read(),
        [3, 4, 5]);
      assert.deepStrictEqual(
        nat
          .drop(3)
          .take(3)
          .dropWhile(n => n < 3)
          .takeWhile(n => n < 6)
          .map(n => n)
          .filter(() => true)
          .read(),
        [3, 4, 5]);
    });

    it('unlimited', () => {
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 0)
          .read(),
        []);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 1)
          .read(),
        [0]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 2)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => n < 3)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .take(Infinity)
          .take(3)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .takeWhile(n => true)
          .take(3)
          .read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        nat
          .drop(3)
          .take(Infinity)
          .dropWhile(n => n < 5)
          .takeWhile(n => true)
          .map(n => n)
          .filter(n => n % 2 === 1)
          .take(3)
          .read(),
        [5, 7, 9]);
    });

  });

  describe('Sequence.from', () => {
    it('array', () => {
      assert.deepStrictEqual(
        Sequence.from([])
          .takeWhile(() => true)
          .read(),
        []);
      assert.deepStrictEqual(
        Sequence.from([0])
          .takeWhile(() => true)
          .read(),
        [0]);
      assert.deepStrictEqual(
        Sequence.from([0, 1])
          .takeWhile(() => true)
          .read(),
        [0, 1]);
      assert.deepStrictEqual(
        Sequence.from([0, 1, 2])
          .takeWhile(() => true)
          .read(),
        [0, 1, 2]);
    });

  });

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

  describe('Sequence.random', () => {
    it('number', () => {
      assert.deepStrictEqual(
        Sequence.random()
          .take(9)
          .map(n => n >= 0 && n < 1)
          .read(),
        [true, true, true, true, true, true, true, true, true]);
    });

    it('array', () => {
      assert.deepStrictEqual(
        Sequence.random([0, 1, 2])
          .take(9)
          .map(n => {
            switch (n) {
              case 0:
              case 1:
              case 2:
                return true;
              default:
                return false;
            }
          })
          .read(),
        [true, true, true, true, true, true, true, true, true]);
    });

  });

  describe('Sequence.zip', () => {
    it('unlimited', () => {
      const even = nat.filter(n => n % 2 === 0);
      const odd = nat.filter(n => n % 2 === 1);
      assert.deepStrictEqual(
        Sequence.zip(odd, even).take(3).read(),
        [[1, 0], [3, 2], [5, 4]]);
    });

    it('same', () => {
      const nat = new Sequence<number, number>((n = 0, cons) => n < 3 ? cons(n, n + 1) : cons(n));
      const even = nat.filter(n => n % 2 === 0);
      const odd = nat.filter(n => n % 2 === 1);
      assert.deepStrictEqual(
        Sequence.zip(odd, even).take(3).read(),
        [[1, 0], [3, 2]]);
    });

    it('mismatch', () => {
      const neg = new Sequence<number, number>((n = 0, cons) => n < 1 ? cons(-n, n + 1) : cons(-n));
      assert.deepStrictEqual(
        Sequence.zip(nat, neg).take(3).read(),
        [[0, 0], [1, -1]]);
      assert.deepStrictEqual(
        Sequence.zip(neg, nat).take(3).read(),
        [[0, 0], [-1, 1]]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.zip(nat, Sequence.from([])).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.zip(Sequence.from([]), nat).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.zip(Sequence.from([]), Sequence.from([])).take(3).read(),
        []);
    });

  });

  describe('Sequence.union', () => {
    it('unlimited', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double, triple]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('same', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double, triple]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(7).read(),
        [0, 2, 3, 4, 6, 8, 9].map(n => -n));
    });

    it('mismatch', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [double.dropWhile(n => n < 6).until(n => n === 12), triple]).take(8).read(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [triple, double.dropWhile(n => n < 6).until(n => n === 12)]).take(8).read(),
        [0, 3, 6, 8, 9, 10, 12, 15]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [nat, Sequence.from([])]).take(3).read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [Sequence.from([]), nat]).take(3).read(),
        [0, 1, 2]);
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [Sequence.from([]), Sequence.from([])]).take(3).read(),
        []);
    });

    it('multiple', () => {
      assert.deepStrictEqual(
        Sequence.union((a, b) => a - b, [
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 2)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 3)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 5))
        ])
          .take(9).read(),
        [0, 2, 3, 4, 5, 6, 8, 9, 10]);
    });

  });

  describe('Sequence.intersect', () => {
    it('unlimited', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double, triple]).take(3).read(),
        [0, 6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(3).read(),
        [0, 6, 12].map(n => -n));
    });

    it('same', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double, triple]).take(3).read(),
        [0, 6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => b - a, [double.map(n => -n), triple.map(n => -n)]).take(3).read(),
        [0, 6, 12].map(n => -n));
    });

    it('mismatch', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [double.dropWhile(n => n < 6).until(n => n === 12), triple]).take(2).read(),
        [6, 12]);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [triple, double.dropWhile(n => n < 6).until(n => n === 12)]).take(2).read(),
        [6, 12]);
    });

    it('empty', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [nat, Sequence.from([])]).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [Sequence.from([]), nat]).take(3).read(),
        []);
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [Sequence.from([]), Sequence.from([])]).take(3).read(),
        []);
    });

    it('multiple', () => {
      assert.deepStrictEqual(
        Sequence.intersect((a, b) => a - b, [
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 2)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 3)),
          new Sequence<number, number>((n = 0, cons) => cons(n, n + 5))
        ])
          .take(3).read(),
        [0, 30, 60]);
    });

  });

});
