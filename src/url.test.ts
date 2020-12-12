import { global, location } from './global';
import { URL, StandardURL, standardize } from './url';

describe('Unit: lib/url', () => {
  describe('URL', () => {
    const protocol = 'https:';
    const hostname = 'example.com';
    const dir = '/dir/';
    const file = 'index.html';
    const query = '?a=1&b=2';
    const fragment = '#?hash';

    const origin = protocol + '//' + hostname as `${typeof protocol}//${typeof hostname}`;
    assert(origin === 'https://example.com');

    it('relative', () => {
      // @ts-expect-error
      assert.throws(() => new URL(''));
      assert(new URL('', location.href).href === location.href);
      assert(new URL('', location.href).href === new global.URL('', location.href).href);
      assert(new URL(' ', location.href).href === location.href);
      assert(new URL(' ', location.href).href === new global.URL(' ', location.href).href);
    });

    it('origin', () => {
      assert(new URL(origin).origin === origin);
      assert(new URL(origin + ':80' as any).origin === origin + ':80');
      assert(new URL(origin + ':443' as any).origin === origin + '');
      assert(new URL('blob:').origin === new global.URL('blob:').origin);
      assert(new URL('http://[::]').origin === new global.URL('http://[::]').origin);
      assert(new URL('http://[::1]').origin === new global.URL('http://[::1]').origin);
      assert(new URL('http://[::ffff:0:0]').origin === new global.URL('http://[::ffff:0:0]').origin);
      assert(new URL('http://name:pass@domain').origin === new global.URL('http://name:pass@domain').origin);
    });

    it('scheme', () => {
      assert(new URL(origin).scheme === protocol.split(':')[0]);
    });

    it('protocol', () => {
      assert(new URL(origin).protocol === protocol);
    });

    it('host', () => {
      assert(new URL(origin).host === hostname);
      assert(new URL(origin + ':80' as any).host === hostname + ':80');
      assert(new URL(origin + ':443' as any).host === hostname + '');
    });

    it('hostname', () => {
      assert(new URL(origin).hostname === hostname);
      assert(new URL(origin + ':80' as any).hostname === hostname);
      assert(new URL(origin + ':443' as any).hostname === hostname);
    });

    it('port', () => {
      assert(new URL(origin).port === '');
      assert(new URL(origin + ':80' as any).port === '80');
      assert(new URL(origin + ':443' as any).port === '');
    });

    it('href', () => {
      assert(new URL(origin + dir + file as any).href === origin + dir + file);
      assert(new URL(origin + dir + file + query + fragment as any).href === origin + dir + file + query + fragment);
    });

    it('resource', () => {
      assert(new URL(origin + dir + file + query + fragment as any).resource === origin + dir + file + query);
      assert(new URL(origin + '/' as any).resource === origin);
      assert(new URL(origin + '/?' as any).resource === origin);
      assert(new URL(origin + '/??' as any).resource === origin + '??');
      assert(new URL(origin + '/?#' as any).resource === origin);
      assert(new URL(origin + dir + file + '?' as any).resource === origin + dir + file);
      assert(new URL(origin + dir + file + '??' as any).resource === origin + dir + file + '??');
      assert(new URL(origin + dir + file + '?#' as any).resource === origin + dir + file);
      assert(new URL('file:///' as any).resource === 'file:///');
    });

    it('path', () => {
      assert(new URL(origin).path === '/');
      assert(new URL(dir + file + query + fragment, location.href).path === dir + file + query);
      assert(new URL('/', location.href).path === '/');
    });

    it('pathname', () => {
      assert(new URL(origin).pathname === '/');
      assert(new URL(dir + file + query + fragment, location.href).pathname === dir + file);
      assert(new URL('/', location.href).pathname === '/');
    });

    it('query', () => {
      assert(new URL(dir + file + query + fragment, location.href).query === query);
      assert(new URL('', location.href).query === '');
      assert(new URL('?', location.href).query === '?');
      assert(new URL('??', location.href).query === '??');
      assert(new URL('?#', location.href).query === '?');
      assert(new URL('#?', location.href).query === '');
    });

    it('fragment', () => {
      assert(new URL(dir + file + query + fragment, location.href).fragment === fragment);
      assert(new URL('', location.href).fragment === '');
      assert(new URL('#', location.href).fragment === '#');
      assert(new URL('##', location.href).fragment === '##');
    });

    it('standard', () => {
      assert((): URL<StandardURL> => new URL(standardize('')));
      assert((): URL<StandardURL> => new URL(new URL(standardize('')).href));
      // @ts-expect-error
      assert.throws((): URL<StandardURL> => new URL(new URL(standardize('')).query));
      // @ts-expect-error
      assert((): URL<StandardURL> => new URL(new URL(standardize('')).query, location.href));
      assert((): URL<StandardURL> => new URL(new URL(standardize('')).query, standardize(location.href)));
    });

  });

});
