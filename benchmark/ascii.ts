import { benchmark } from './benchmark';
import { encode as encodeDelta, decode as decodeDelta } from '../src/ascii.delta';
import { encode as encodeHuffm, decode as decodeHuffm } from '../src/ascii.chuff';
import { encode as encodeHPACK, decode as decodeHPACK } from '../src/ascii.hpack';

describe('Benchmark:', function () {
  describe('ascii', function () {
    const word = 'ascii';
    const text = 'Hello, world.';

    it('encode word delta', function (done) {
      const str = word;
      benchmark('ascii encode word delta', () => encodeDelta(str), done);
    });

    it('encode word chuff', function (done) {
      const str = word;
      benchmark('ascii encode word chuff', () => encodeHuffm(str), done);
    });

    it('encode word hpack', function (done) {
      const str = word;
      benchmark('ascii encode word hpack', () => encodeHPACK(str), done);
    });

    it('encode text delta', function (done) {
      const str = text;
      benchmark('ascii encode text delta', () => encodeDelta(str), done);
    });

    it('encode text chuff', function (done) {
      const str = text;
      benchmark('ascii encode text chuff', () => encodeHuffm(str), done);
    });

    it('encode text hpack', function (done) {
      const str = text;
      benchmark('ascii encode text hpack', () => encodeHPACK(str), done);
    });

    it('decode word delta', function (done) {
      const str = encodeDelta(word);
      benchmark('ascii decode word delta', () => decodeDelta(str), done);
    });

    it('decode word chuff', function (done) {
      const str = encodeHuffm(word);
      benchmark('ascii decode word chuff', () => decodeHuffm(str), done);
    });

    it('decode word hpack', function (done) {
      const str = encodeHPACK(word);
      benchmark('ascii decode word hpack', () => decodeHPACK(str), done);
    });

    it('decode text delta', function (done) {
      const str = encodeDelta(text);
      benchmark('ascii decode text delta', () => decodeDelta(str), done);
    });

    it('decode text chuff', function (done) {
      const str = encodeHuffm(text);
      benchmark('ascii decode text chuff', () => decodeHuffm(str), done);
    });

    it('decode text hpack', function (done) {
      const str = encodeHPACK(text);
      benchmark('ascii decode text hpack', () => decodeHPACK(str), done);
    });

  });

});
