import { router } from './router';
import { Sequence } from './sequence';

const { match, expand, cmp } = router.helpers();

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

  describe('match', () => {
    it('root', () => {
      assert(!match('/', ''));
      assert(match('/', '/'));
      assert(match('/', '/a'));
      assert(match('/', '/abc'));
      assert(match('/', '/a/'));
      assert(match('/', '/abc/'));
      assert(match('/', '/a/b'));
      assert(match('/', '/abc/bcd'));
    });

    it('dir', () => {
      assert(!match('/abc', '/'));
      assert(match('/abc', '/abc'));
      assert(match('/abc', '/abc/'));
      assert(!match('/abc/', '/abc'));
      assert(match('/abc/', '/abc/'));
      assert(!match('/abc', '/ab'));
      assert(!match('/ab', '/abc'));
    });

    it('file', () => {
      assert(match('/a/b/c.d', '/a/b/c.d'));
      assert(!match('/a/b/c', '/a/b/c.d'));
      assert(!match('/a/b/c.d', '/a/b/c'));
    });

    it('expand', () => {
      assert(match('/{a,b}', '/a'));
      assert(match('/{a,b}', '/b'));
      assert.throws(() => match('[]', '/'));
    });

    it('meta', () => {
      assert(!match('/*', '/'));
      assert(match('/a*b', '/ab'));
      assert(match('/a**b', '/ab'));
      assert(match('/*/{a,b}?/*/{1?3}', '/---/ac/-/103'));
      assert(match('/*/{a,b}?/*/{1?3}', '/---/bc/-/103'));
      assert(match('/**/a', '/a'));
      assert(match('/**/a', '/a/b'));
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

  describe('cmp', () => {
    it('char', () => {
      assert(cmp([''], ['']));
      assert(!cmp([''], ['a']));
      assert(cmp(['a'], ['a']));
      assert(!cmp(['a'], ['A']));
      assert(!cmp(['A'], ['a']));
      assert(!cmp(['a'], ['ab']));
      assert(!cmp(['ab'], ['a']));
      Sequence.mappend(
        Sequence.from(['a', 'b', 'c'])
          .subsequences(),
        Sequence.from(['a', 'b', 'c'])
          .permutations())
        .map(subs => subs.join(''))
        .extract()
        .forEach(subs =>
          assert(cmp(['abc'], [subs]) === (subs === 'abc')));
    });

    it('\\', () => {
      assert(cmp(['\\\\'], ['\\']));
      assert(cmp(['\\*'], ['*']));
    });

    it('?', () => {
      assert(!cmp([''], ['?']));
      assert(!cmp(['?'], ['']));
      assert(cmp(['?'], ['a']));
      assert(!cmp(['?'], ['/']));
      assert(!cmp(['a?'], ['a/']));
      assert(!cmp(['?'], ['.']));
      assert(cmp(['.?'], ['.a']));
      assert(cmp(['a?'], ['a.']));
    });

    it('*', () => {
      assert(!cmp([''], ['*']));
      assert(cmp(['*'], ['']));
      assert(cmp(['*'], ['a']));
      assert(cmp(['*'], ['abc']));
      assert(cmp(['a*'], ['a']));
      assert(cmp(['a*'], ['abc']));
      assert(cmp(['ab*'], ['abc']));
      assert(cmp(['*c'], ['c']));
      assert(cmp(['*c'], ['abc']));
      assert(cmp(['*bc'], ['abc']));
      assert(cmp(['a*c'], ['ac']));
      assert(cmp(['a*c'], ['abc']));
      assert(cmp(['*b*'], ['b']));
      assert(cmp(['*b*'], ['abc']));
      assert(cmp(['*bc'], ['abbc']));
      assert(cmp(['*c'], ['abcc']));
      assert(!cmp(['a?*c'], ['ac']));
      assert(!cmp(['a*?c'], ['ac']));
      assert(cmp(['a?*c'], ['abc']));
      assert(cmp(['a*?c'], ['abc']));
      assert(cmp(['a?*c'], ['abbc']));
      assert(cmp(['a*?c'], ['abbc']));
      assert(!cmp(['*'], ['/']));
      assert(cmp(['*/'], ['/']));
      assert(cmp(['.*'], ['.']));
      assert(!cmp(['*'], ['.']));
      assert(cmp(['*'], ['a.b']));
      assert(!cmp(['*.'], ['.']));
      assert(cmp(['*.*'], ['a.b']));
      assert(cmp(['?*.*'], ['a.b']));
    });

  });

});
