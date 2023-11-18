import { encode, decode } from './ascii.delta';
import { xorshift } from './random';

describe('Unit: lib/ascii.delta', () => {
  describe('encode/decode', () => {
    it('basic', () => {
      let input = '';
      assert(0 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0';
      assert(1 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'A';
      assert(1 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'a';
      assert(1 === encode(input).length);
      assert(input === decode(encode(input)));

      input = ' ';
      assert(1 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '|';
      assert(1 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '00';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '02';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0A';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0|';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '||';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '|0';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '000';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '00z';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '024';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0AZ';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '00|';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '|00';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0000';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '000z';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '00000';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0000z';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '00024';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '000AZ';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'http';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'CASE';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'Cas';
      assert(2 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'lCas';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0HUD';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0FF7';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0F:F7';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0F::F7';
      assert(5 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0Dada';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '1a\x00a';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = ' Cas';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'J.Do';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 'z an';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0.00';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = ', an';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '-f f';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '0%0';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '..  ';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = 's4-0dQh-';
      assert(6 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '. o.';
      assert(4 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '7bc2';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = ' bp';
      assert(3 === encode(input).length);
      assert(input === decode(encode(input)));

      input = '6E/j7B7';
      assert(7 === encode(input).length);
      assert(input === decode(encode(input)));
    });

    it('verify', () => {
      const input = [...Array(128)]
        .reduce((acc, _, i) => acc + String.fromCharCode(i), '');
      assert(input === decode(encode(input)));
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(random() * 32 + 1 | 0)]
          .reduce(acc => acc + String.fromCharCode(random() * 128 | 0), '');
        const output = encode(input);
        assert(output.length <= input.length);
        assert(input === decode(output));
      }
    });

  });

});
