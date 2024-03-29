import { standardize, encode } from './internal';

describe('Unit: lib/url/internal', () => {
  describe('standardize', () => {
    it('primitive', () => {
      assert(typeof standardize('', location.href) === 'string');
    });

    it('absolutization', () => {
      assert(standardize('', location.href) === window.location.href);
    });

    it('trim', () => {
      assert(standardize(' ', location.href) === window.location.href);
    });

    it('default port removing', () => {
      assert(standardize('//host:', location.href).endsWith('//host/'));
      assert(standardize('//host:/', location.href).endsWith('//host/'));
      assert(standardize('//host:80/', location.href).endsWith('//host/'));
      assert(standardize('//[80:80::80]/', location.href).endsWith('//[80:80::80]/'));
      assert(standardize('//[80:80::80]:/', location.href).endsWith('//[80:80::80]/'));
      assert(standardize('//[80:80::80]:80/', location.href).endsWith('//[80:80::80]/'));
      assert(standardize('//host/path:/', location.href).endsWith('//host/path:/'));
      assert(standardize('//host/path:80/', location.href).endsWith('//host/path:80/'));
    });

    it('root path filling', () => {
      assert(standardize('//host', location.href).endsWith('//host/'));
      assert(standardize('//host:', location.href).endsWith('//host/'));
      assert(standardize('//host:80', location.href).endsWith('//host/'));
      assert(standardize('//[80:80::80]', location.href).endsWith('//[80:80::80]/'));
      assert(standardize('//host/path', location.href).endsWith('//host/path'));
      assert(standardize('//host?', location.href).endsWith('//host/?'));
      assert(standardize('//host/?', location.href).endsWith('//host/?'));
      assert(standardize('//host/path?', location.href).endsWith('//host/path?'));
      assert(standardize('//host/path/?', location.href).endsWith('//host/path/?'));
    });

    it('verbose flag leaving', () => {
      assert(standardize('?', location.href).endsWith(`?`));
      assert(standardize('#', location.href).endsWith(`#`));
      assert(standardize('?#', location.href).endsWith(`?#`));
    });

    it('percent-encoding', () => {
      assert(standardize('?a=b+c&%%3f#/?=+&%%3f#', location.href).endsWith(`?a=b%2Bc&%25%3F#/?=+&%%3f#`));
    });

    it('multiple-encoding', () => {
      assert(standardize(standardize('/%%3f%3d', location.href) as string).endsWith('/%25%3F%3D'));
      assert(standardize(standardize('?a b#a b', location.href) as string).endsWith(`?a%20b#a%20b`));
    });

  });

  describe('encode', () => {
    it('percent-encoding', () => {
      assert(encode('/<>') === `/%3C%3E`);
      assert(encode('/%3F%3D') === `/%3F%3D`);
      assert(encode('/<%3F%3D>') === `/%3C%3F%3D%3E`);
      assert(encode('/%%FF<%3F%3D>') === `/%25%FF%3C%3F%3D%3E`);
      assert(encode('/\uD800\uDC00') === `/${encodeURI('\uD800\uDC00')}`);
      assert(encode('/\uD800\uD800\uDC00\uDC00') === `/${encodeURI('\uD800\uDC00')}`);
      assert(encode('//[2001:db8::7]/') === `//[2001:db8::7]/`);
      assert(encode('?a=b+c&%%3f#/?=+&%%3f#') === `?a=b%2Bc&%25%3F#/?=+&%%3f#`);
    });

    it('multiple-encoding', () => {
      assert(encode(encode('/%%3f%3d') as string) === `/%25%3F%3D`);
    });

  });

});
