import { router } from './router';
import { Sequence } from './sequence';

const { compare, match, expand } = router.helpers();

describe('Unit: lib/router', () => {
  describe('router', () => {
    it('router', () => {
      const route = router({
        '/'(path) {
          assert(this instanceof Object);
          assert(path === '/a');
          return '/';
        },
        '/b'(path) {
          assert(this instanceof Object);
          assert(path === '/b');
          return '/b';
        },
        '/b/'(path) {
          assert(this instanceof Object);
          assert(path === '/b/');
          return '/b/';
        },
        '/c'(path) {
          assert(this instanceof Object);
          assert(path === '/c/?q');
          return '/c';
        }
      });
      assert(route('/a') === '/');
      assert(route('/b') === '/b');
      assert(route('/b/') === '/b/');
      assert(route('/c/?q') === '/c');
    });

  });

  describe('compare', () => {
    it('root', () => {
      assert(compare('/', '/'));
      assert(compare('/', '/a'));
      assert(compare('/', '/abc'));
      assert(compare('/', '/a/'));
      assert(compare('/', '/abc/'));
      assert(compare('/', '/a/b'));
      assert(compare('/', '/abc/bcd'));
    });

    it('dir', () => {
      assert(!compare('/abc', '/'));
      assert(compare('/abc', '/abc'));
      assert(compare('/abc', '/abc/'));
      assert(!compare('/abc/', '/abc'));
      assert(compare('/abc/', '/abc/'));
      assert(!compare('/abc', '/ab'));
      assert(!compare('/ab', '/abc'));
    });

    it('file', () => {
      assert(compare('/a/b/c.d', '/a/b/c.d'));
      assert(!compare('/a/b/c', '/a/b/c.d'));
      assert(!compare('/a/b/c.d', '/a/b/c'));
    });

    it('expand', () => {
      assert(compare('/{a,b}', '/a'));
      assert(compare('/{a,b}', '/b'));
      assert.throws(() => compare('**', ''));
      assert.throws(() => compare('[]', ''));
    });

    it('match', () => {
      assert(compare('/a*b', '/ab'));
      assert(compare('/*/{a,b}?/*/{1?3}', '/---/ac/-/103'));
      assert(compare('/*/{a,b}?/*/{1?3}', '/---/bc/-/103'));
    });

  });

  describe('expand', () => {
    it('{}', () => {
      assert.deepStrictEqual(expand(''), ['']);
      assert.deepStrictEqual(expand('{}'), ['']);
      assert.deepStrictEqual(expand('{a}'), ['a']);
      assert.deepStrictEqual(expand('{a,bc,d}'), ['a', 'bc', 'd']);
      assert.deepStrictEqual(expand('{a}{b,c}d{e}{,f}'), ['abde', 'abdef', 'acde', 'acdef']);
      assert.deepStrictEqual(expand('{{}}'), ['']);
      assert.deepStrictEqual(expand('{a,{b,}c}'), ['a', 'bc', 'c']);
    });

  });

  describe('match', () => {
    it('char', () => {
      assert(match('', ''));
      assert(!match('', 'a'));
      assert(match('a', 'a'));
      assert(!match('a', 'A'));
      assert(!match('A', 'a'));
      Sequence.mappend(
        Sequence.from(['a', 'b', 'c'])
          .subsequences(),
        Sequence.from(['a', 'b', 'c'])
          .permutations())
        .map(subs => subs.join(''))
        .extract()
        .forEach(subs =>
          assert(match('abc', subs) === (subs === 'abc')));
    });

    it('?', () => {
      assert(!match('', '?'));
      assert(!match('?', ''));
      assert(match('?', 'a'));
      assert(!match('?', '/'));
      assert(!match('a?', 'a/'));
      assert(!match('?', '.'));
      assert(match('.?', '.a'));
      assert(match('a?', 'a.'));
    });

    it('*', () => {
      assert(!match('', '*'));
      assert(match('*', ''));
      assert(match('*', 'a'));
      assert(match('*', 'abc'));
      assert(match('a*', 'a'));
      assert(match('a*', 'abc'));
      assert(match('ab*', 'abc'));
      assert(match('*c', 'c'));
      assert(match('*c', 'abc'));
      assert(match('*bc', 'abc'));
      assert(match('a*c', 'ac'));
      assert(match('a*c', 'abc'));
      assert(match('*b*', 'b'));
      assert(match('*b*', 'abc'));
      assert(match('*bc', 'abbc'));
      assert(match('*c', 'abcc'));
      assert(!match('a?*c', 'ac'));
      assert(!match('a*?c', 'ac'));
      assert(match('a?*c', 'abc'));
      assert(match('a*?c', 'abc'));
      assert(match('a?*c', 'abbc'));
      assert(match('a*?c', 'abbc'));
      assert(!match('*', '/'));
      assert(match('*/', '/'));
      assert(match('.*', '.'));
      assert(!match('*', '.'));
      assert(match('*', 'a.b'));
      assert(!match('*.', '.'));
      assert(match('*.*', 'a.b'));
      assert(match('?*.*', 'a.b'));
    });

  });

});
