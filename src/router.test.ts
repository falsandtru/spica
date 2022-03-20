import { router, _helpers } from './router';
import { URL, standardize } from './url';
import { Sequence } from './sequence';

const { compare, match, expand } = _helpers();

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
      assert(compare('/', new URL(standardize('/', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/a', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/abc', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/a/', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/abc/', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/a/b', window.location.href)).pathname));
      assert(compare('/', new URL(standardize('/abc/bcd', window.location.href)).pathname));
    });

    it('dir', () => {
      assert(!compare('/abc', new URL(standardize('/', window.location.href)).pathname));
      assert(compare('/abc', new URL(standardize('/abc', window.location.href)).pathname));
      assert(compare('/abc', new URL(standardize('/abc/', window.location.href)).pathname));
      assert(!compare('/abc/', new URL(standardize('/abc', window.location.href)).pathname));
      assert(compare('/abc/', new URL(standardize('/abc/', window.location.href)).pathname));
      assert(!compare('/abc', new URL(standardize('/ab', window.location.href)).pathname));
      assert(!compare('/ab', new URL(standardize('/abc', window.location.href)).pathname));
    });

    it('file', () => {
      assert(compare('/a/b/c.d', new URL(standardize('/a/b/c.d', window.location.href)).pathname));
      assert(!compare('/a/b/c', new URL(standardize('/a/b/c.d', window.location.href)).pathname));
      assert(!compare('/a/b/c.d', new URL(standardize('/a/b/c', window.location.href)).pathname));
    });

    it('expand', () => {
      assert(compare('/{a,b}', new URL(standardize('/a', window.location.href)).pathname));
      assert(compare('/{a,b}', new URL(standardize('/b', window.location.href)).pathname));
    });

    it('match', () => {
      assert(compare('/*/{a,b}?/*/{1?3}', new URL(standardize('/---/ac/-/103', window.location.href)).pathname));
      assert(compare('/*/{a,b}?/*/{1?3}', new URL(standardize('/---/bc/-/103', window.location.href)).pathname));
    });

  });

  describe('expand', () => {
    it('{}', () => {
      assert.deepStrictEqual(expand('{}'), ['']);
      assert.deepStrictEqual(expand('{a}'), ['a']);
      assert.deepStrictEqual(expand('{a}{b,c}d{e}{,f}'), ['abde', 'abdef', 'acde', 'acdef']);
      assert.deepStrictEqual(expand('{ab,bc,cd}'), ['ab', 'bc', 'cd']);
      assert.deepStrictEqual(expand('{{}}'), ['']);
      assert.deepStrictEqual(expand('{a,{b,}c}'), ['a', 'bc', 'c']);
    });

    it('[]', () => {
      assert.throws(() => expand('[]'));
    });

    it('**', () => {
      assert.throws(() => expand('**'));
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
