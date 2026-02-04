import { encode, decode } from './ascii.chuff';
import { xorshift } from './random';

describe('Unit: lib/ascii.chuff', () => {
  describe('encode/decode', () => {
    it('basic', () => {
      let input = '';
      assert(input === decode(encode(input)));

      input = '0';
      assert(input === decode(encode(input)));

      input = 'A';
      assert(input === decode(encode(input)));

      input = 'a';
      assert(input === decode(encode(input)));

      input = ' ';
      assert(input === decode(encode(input)));

      input = '|';
      assert(input === decode(encode(input)));

      input = '00';
      assert(input === decode(encode(input)));

      input = '02';
      assert(input === decode(encode(input)));

      input = '0A';
      assert(input === decode(encode(input)));
    });

    for (let i = 0; i < 10; ++i) it(`verify ${i}`, function () {
      this.timeout(10 * 1e3);

      const input = [...Array(128)]
        .reduce((acc, _, i) => acc + String.fromCharCode(i), '');
      assert(input === decode(encode(input)));
      const random = xorshift.random(3 ** i);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(random() * 32 + 1 | 0)]
          .reduce(acc => acc + String.fromCharCode(random() * 128 | 0), '');
        const output = encode(input);
        assert(input === decode(output));
      }
    });

  });

});
