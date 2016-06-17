import {benchmark} from './benchmark';
import {Sequence} from 'spica';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Sequence', function () {
    this.timeout(100 * 1e3);

    function array(n: number) {
      return (<void[]>Array.apply([], Array(n))).map((_, i) => i);
    }

    function arrTake(n: number, done: () => void) {
      const arr = array(n);
      benchmark(`Sequence take arr ${n}`, () => arr.slice(0, n), done);
    }
    function seqTake(n: number, done: () => void) {
      const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(n);
      benchmark(`Sequence take seq ${n}`, () => seq.read(), done);
    }
    function memTake(n: number, done: () => void) {
      const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1)).take(n).memoize();
      benchmark(`Sequence take mem ${n}`, () => seq.read(), done);
    }
    it('take arr 1', function (done) {
      arrTake(1, done);
    });

    it('take seq 1', function (done) {
      seqTake(1, done);
    });

    it('take mem 1', function (done) {
      memTake(1, done);
    });

    it('take arr 10', function (done) {
      arrTake(10, done);
    });

    it('take seq 10', function (done) {
      seqTake(10, done);
    });

    it('take mem 10', function (done) {
      memTake(10, done);
    });

    it('take arr 100', function (done) {
      arrTake(100, done);
    });

    it('take seq 100', function (done) {
      seqTake(100, done);
    });

    it('take mem 100', function (done) {
      memTake(100, done);
    });

    it('take arr 1000', function (done) {
      arrTake(1000, done);
    });

    it('take seq 1000', function (done) {
      seqTake(1000, done);
    });

    it('take mem 1000', function (done) {
      memTake(1000, done);
    });

    function arrMapFilter(n: number, done: () => void) {
      const arr = array(n);
      const f = <T>(n: T) => n;
      const g = () => true;
      benchmark(`Sequence map filter arr ${n}`, () => arr.map(f).filter(g).slice(0, n), done);
    }
    function seqMapFilter(n: number, done: () => void) {
      const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1))
        .map(n => n)
        .filter(n => true)
        .take(n);
      benchmark(`Sequence map filter seq ${n}`, () => seq.read(), done);
    }
    function memMapFilter(n: number, done: () => void) {
      const seq = new Sequence<number, number>((n = 0, cons) => cons(n, n + 1))
        .map(n => n)
        .filter(n => true)
        .take(n)
        .memoize();
      benchmark(`Sequence map filter mem ${n}`, () => seq.read(), done);
    }
    it('map filter arr 1', function (done) {
      arrMapFilter(1, done);
    });

    it('map filter seq 1', function (done) {
      seqMapFilter(1, done);
    });

    it('map filter mem 1', function (done) {
      memMapFilter(1, done);
    });

    it('map filter arr 10', function (done) {
      arrMapFilter(10, done);
    });

    it('map filter seq 10', function (done) {
      seqMapFilter(10, done);
    });

    it('map filter mem 10', function (done) {
      memMapFilter(10, done);
    });

    it('map filter arr 100', function (done) {
      arrMapFilter(100, done);
    });

    it('map filter seq 100', function (done) {
      seqMapFilter(100, done);
    });

    it('map filter mem 100', function (done) {
      memMapFilter(100, done);
    });

    it('map filter arr 1000', function (done) {
      arrMapFilter(1000, done);
    });

    it('map filter seq 1000', function (done) {
      seqMapFilter(1000, done);
    });

    it('map filter mem 1000', function (done) {
      memMapFilter(1000, done);
    });

  });

});
