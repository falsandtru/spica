import { encode, decode } from './ascii.delta';
import { xorshift } from './random';

describe('Unit: lib/ascii.delta', () => {
  describe('encode/decode', () => {
    it('basic', () => {
      let input = '';
      assert(input === decode(encode(input)));
      assert(0 === encode(input).length);

      input = '0';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = 'A';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = 'a';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = 'at';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = ' ';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = '|';
      assert(input === decode(encode(input)));
      assert(1 === encode(input).length);

      input = '00';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '02';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '0A';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '0|';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '||';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '|0';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '000';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '00z';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '024';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '0AZ';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '00|';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '|00';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '0000';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '000z';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '00000';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '0000z';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = '00024';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '000AZ';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = 'http';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'CASE';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'Cas';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = 'lCas';
      assert(input === decode(encode(input, false), false));
      assert(3 === encode(input, false).length);

      input = '0FF7';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '0F:F7';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = '0F::F7';
      assert(input === decode(encode(input)));
      assert(5 === encode(input).length);

      input = '0Dada';
      assert(input === decode(encode(input, false), false));
      assert(4 === encode(input, false).length);

      input = '1a\x00a';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = ' Cas';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'J.Do';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'z an';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '0.00';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = ', an';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '-f f';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = '0%0';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = '..  ';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = 's4-0dQh-';
      assert(input === decode(encode(input, false), false));
      assert(6 === encode(input, false).length);

      input = '. o.';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = '7bc2';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = ' bp';
      assert(input === decode(encode(input)));
      assert(2 === encode(input).length);

      input = '6E/j7B7';
      assert(input === decode(encode(input)));
      assert(7 === encode(input).length);

      input = 'Aa0';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'aaaaaA ';
      assert(input === decode(encode(input, false), false));
      assert(7 === encode(input, false).length);

      input = 'aaaaaAN ';
      assert(input === decode(encode(input, false), false));
      assert(8 === encode(input, false).length);

      input = 'aA A';
      assert(input === decode(encode(input)));
      assert(3 === encode(input).length);

      input = 'aA  Ur';
      assert(input === decode(encode(input)));
      assert(4 === encode(input).length);

      input = 'dKt/o esnF';
      assert(input === decode(encode(input)));
      assert(9 === encode(input).length);

      input = 'tLa6u.ps';
      assert(input === decode(encode(input)));
      assert(7 === encode(input).length);
    });

    it('verify', function () {
      this.timeout(10 * 1e3);

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
        assert(input === decode(encode(input, false), false));
      }
    });

  });

});
