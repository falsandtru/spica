import { encode as encodeDelta, decode as decodeDelta } from './ascii.delta';
import { encode as encodeHuffm } from './ascii.huffman';
import { encode as encodeHPACK, decode as decodeHPACK } from './ascii.hpack';
import { encode as encodeXPACK, decode as decodeXPACK } from './ascii.xpack';
import { rnd0f, rnd0z, rnd0S, xorshift } from './random';
import zipfian from 'zipfian-integer';
import { LRU } from './lru';

describe('Unit: lib/ascii', () => {
  describe('encode/decode', () => {
    it('random number', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      const rnd = () => [
        `${random() * 10 ** 8 >>> 0}`.padStart(8, '0'),
        `${random() * 10 ** 8 >>> 0}`.padStart(8, '0'),
        `${random() * 10 ** 8 >>> 0}`.padStart(8, '0'),
        `${random() * 10 ** 8 >>> 0}`.padStart(8, '0'),
      ].join('');
      for (let i = 0; i < 1e4; ++i) {
        const input = rnd();
        assert(/^\d{32}$/.test(input));
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio random number', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('random hex', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = i & 1
          ? rnd0f(32).toUpperCase()
          : rnd0f(32).toLowerCase();
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio random hex', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('random 36', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e3; ++i) {
        const input = rnd0z(128);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio random 36', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('random 64', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e3; ++i) {
        const input = rnd0S(128);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio random 64', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('percent', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = rnd0f(8 << 1).toUpperCase().replace(/../g, '%$&');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio percent', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('entity', function () {
      this.timeout(20 * 1e3);

      const cs = Array(16).fill(0);
      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      for (let i = 0; i < 1e4; ++i) {
        const input = words[random()] + '-' + rnd0f(64);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio entity', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 3-6', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      for (let i = 0; i < 1e4; ++i) {
        let input = '';
        do {
          input = words[random()];
        } while (input.length < 3 || 6 < input.length);
        assert(input);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 3-6', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 5-10', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      for (let i = 0; i < 1e4; ++i) {
        let input = '';
        do {
          input = words[random()];
        } while (input.length < 5 || 10 < input.length);
        assert(input);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 5-10', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 1', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = words[random() * words.length | 0];
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 1', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 2', function () {
      this.timeout(20 * 1e3);

      const random = xorshift.random(1);
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(2)].map(() => words[random() * words.length | 0]).join('-');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 2', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 4', function () {
      this.timeout(20 * 1e3);

      const random = xorshift.random(1);
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(4)].map(() => words[random() * words.length | 0]).join('-');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 4', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 8', function () {
      this.timeout(20 * 1e3);

      const random = xorshift.random(1);
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(8)].map(() => words[random() * words.length | 0]).join('-');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 8', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 1 upper', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = words[random() * words.length | 0].toUpperCase();
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 1 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 2 upper', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(2)].map(() => words[random() * words.length | 0]).join('-').toUpperCase();
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 2 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 4 upper', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(4)].map(() => words[random() * words.length | 0]).join('-').toUpperCase();
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 4 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 8 upper', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(8)].map(() => words[random() * words.length | 0]).join('-').toUpperCase();
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 8 upper', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    function capitalize(str: string): string {
      return str[0].toUpperCase() + str.slice(1);
    }

    it('word 1 camel', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = capitalize(words[random() * words.length | 0]);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 1 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 2 camel', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(2)].map(() => capitalize(words[random() * words.length | 0])).join('');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 2 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 4 camel', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(4)].map(() => capitalize(words[random() * words.length | 0])).join('');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 4 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('word 8 camel', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const random = xorshift.random(1);
      for (let i = 0; i < 1e4; ++i) {
        const input = [...Array(8)].map(() => capitalize(words[random() * words.length | 0])).join('');
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio word 8 camel', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('text 100', function () {
      this.timeout(20 * 1e3);

      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e2; ++i) {
        let input = '';
        do {
          input += ' ' + words[random()];
        } while (input.length < 100);
        input = input.slice(1);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio text 100', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('text 500', function () {
      this.timeout(20 * 1e3);

      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e2; ++i) {
        let input = '';
        do {
          input += ' ' + words[random()];
        } while (input.length < 500);
        input = input.slice(1);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio text 500', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('text 1000', function () {
      this.timeout(20 * 1e3);

      const random = zipfian(0, words.length - 1, 1, xorshift.random(1));
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e2; ++i) {
        let input = '';
        do {
          input += ' ' + words[random()];
        } while (input.length < 1000);
        input = input.slice(1);
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio text 1000', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('country', function () {
      this.timeout(20 * 1e3);

      const random = zipfian(0, countries.length - 1, 1, xorshift.random(1));
      const cs = Array(16).fill(0);
      for (let i = 0; i < 1e4; ++i) {
        const input = countries[random()];
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio country', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('sample', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const input = `On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the claims of duty or the obligations of business it will frequently occur that pleasures have to be repudiated and annoyances accepted. The wise man therefore always holds in these matters to this principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures pains to avoid worse pains.`;
      {
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio sample', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    it('json', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const input = `{"time":"2022-11-08T15:28:26.000000000-05:00","level":"INFO","msg":"hello","count":3}`;
      {
        let j = 0;
        cs[j++] += input.length;
        cs[j++] += encodeHPACK(input).length;
        cs[j++] += encodeDelta(input).length;
        cs[j++] += encodeHuffm(input).length;
        cs[j++] += Math.ceil(simH2E5(input) / 8);
        cs[j++] += Math.ceil(simH3E5(input) / 8);
        cs[j++] += Math.ceil(simH2S5(input) / 8);
        cs[j++] += Math.ceil(simH3S5(input) / 8);
        cs[j++] += Math.ceil(simH2S0(input) / 8);
      }
      let j = 1;
      console.debug('HPACK   comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Huffman comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2E5 comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3E5 comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S5 comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH3S5 comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('SimH2S0 comp. ratio json', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    // www.google.com
    it('request', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const fields = `
Accept:
text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding:
gzip, deflate, br
Accept-Language:
ja,en-US;q=0.9,en;q=0.8
Cache-Control:
max-age=0
Dnt:
1
Sec-Ch-Ua:
"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"
Sec-Ch-Ua-Arch:
"x86"
Sec-Ch-Ua-Bitness:
"64"
Sec-Ch-Ua-Full-Version:
"117.0.5938.89"
Sec-Ch-Ua-Full-Version-List:
"Google Chrome";v="117.0.5938.89", "Not;A=Brand";v="8.0.0.0", "Chromium";v="117.0.5938.89"
Sec-Ch-Ua-Mobile:
?0
Sec-Ch-Ua-Model:
""
Sec-Ch-Ua-Platform:
"Windows"
Sec-Ch-Ua-Platform-Version:
"10.0.0"
Sec-Ch-Ua-Wow64:
?0
Sec-Fetch-Dest:
document
Sec-Fetch-Mode:
navigate
Sec-Fetch-Site:
same-origin
Sec-Fetch-User:
?1
Sec-Gpc:
1
Upgrade-Insecure-Requests:
1
User-Agent:
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36
X-Client-Data:
CKa1yQEIj7bJAQiltskBCKmdygEI5tTKAQieicsBCJahywEIhaDNAQjwsc0BCNy9zQEI38TNAQi1xc0BCLnKzQEI1dDNAQiR0s0BCIrTzQEIwtTNAQjJ1s0BCPnA1BUYwcvMARi4v80B
`
        .trim()
        .replace(/^\S+:$/gm, str => str.toLowerCase())
        .split(/:\s|\n/);
      for (let i = 0; i < fields.length; ++i) {
        const input = fields[i];
        const stats = { length: 0 };
        //console.debug((encodeXPACK(input, stats), stats.length) - (encodeHPACK(input, stats), stats.length), input)
        assert(input === decodeXPACK(encodeXPACK(input)));
        assert(input === decodeHPACK(encodeHPACK(input)));
        assert(input === decodeDelta(encodeDelta(input)));
        let j = 0;
        cs[j++] += input.length * 8;
        cs[j++] += encodeXPACK(input, stats) && stats.length;
        cs[j++] += encodeHPACK(input, stats) && stats.length;
        cs[j++] += encodeDelta(input).length * 8;
      }
      let j = 1;
      console.debug('XPACK   comp. ratio request', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('HPACK   comp. ratio request', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio request', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

    // www.google.com
    it('response', function () {
      this.timeout(20 * 1e4);

      const cs = Array(16).fill(0);
      const fields = `
Accept-Ch:
Sec-CH-UA-Arch
Accept-Ch:
Sec-CH-UA-Bitness
Accept-Ch:
Sec-CH-UA-Full-Version
Accept-Ch:
Sec-CH-UA-Full-Version-List
Accept-Ch:
Sec-CH-UA-Model
Accept-Ch:
Sec-CH-UA-Platform
Accept-Ch:
Sec-CH-UA-Platform-Version
Accept-Ch:
Sec-CH-UA-WoW64
Alt-Svc:
h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
Cache-Control:
private, max-age=0
Content-Encoding:
br
Content-Length:
54188
Content-Security-Policy-Report-Only:
object-src 'none';base-uri 'self';script-src 'nonce-OqX2tRcsQ42YI77KwfGMfg' 'strict-dynamic' 'report-sample' 'unsafe-eval' 'unsafe-inline' https: http:;report-uri https://csp.withgoogle.com/csp/gws/other-hp
Content-Type:
text/html; charset=UTF-8
Cross-Origin-Opener-Policy:
same-origin-allow-popups; report-to="gws"
Date:
Wed, 22 Nov 2023 18:46:19 GMT
Expires:
-1
Origin-Trial:
Ap+qNlnLzJDKSmEHjzM5ilaa908GuehlLqGb6ezME5lkhelj20qVzfv06zPmQ3LodoeujZuphAolrnhnPA8w4AIAAABfeyJvcmlnaW4iOiJodHRwczovL3d3dy5nb29nbGUuY29tOjQ0MyIsImZlYXR1cmUiOiJQZXJtaXNzaW9uc1BvbGljeVVubG9hZCIsImV4cGlyeSI6MTY4NTY2Mzk5OX0=
Origin-Trial:
AvudrjMZqL7335p1KLV2lHo1kxdMeIN0dUI15d0CPz9dovVLCcXk8OAqjho1DX4s6NbHbA/AGobuGvcZv0drGgQAAAB9eyJvcmlnaW4iOiJodHRwczovL3d3dy5nb29nbGUuY29tOjQ0MyIsImZlYXR1cmUiOiJCYWNrRm9yd2FyZENhY2hlTm90UmVzdG9yZWRSZWFzb25zIiwiZXhwaXJ5IjoxNjkxNTM5MTk5LCJpc1N1YmRvbWFpbiI6dHJ1ZX0=
P3p:
CP="This is not a P3P policy! See g.co/p3phelp for more info."
Permissions-Policy:
unload=()
Report-To:
{"group":"gws","max_age":2592000,"endpoints":[{"url":"https://csp.withgoogle.com/csp/report-to/gws/other"}]}
Server:
gws
Set-Cookie:
1P_JAR=2023-11-22-18; expires=Fri, 22-Dec-2023 18:46:19 GMT; path=/; domain=.google.com; Secure; SameSite=none
Set-Cookie:
AEC=Ackid1QH6gVXB6Rn68KWRmRtOGSW1unAfUHYsxuZh3Zs8cyWCZdKy8vrhQ; expires=Mon, 20-May-2024 18:46:19 GMT; path=/; domain=.google.com; Secure; HttpOnly; SameSite=lax
Set-Cookie:
NID=511=fx_DiN-XffVTX7QHZe7UgP5GQd0mx2HY9B0Hz6MgzEpOESnD8DldcSLyj-U6AHIo8t4-dcOKelciAyOK2j03GJE1r_31zKvXnECnKWvOQiFPO6mtTTaCZWqtn2x8m5lnzbB_CyUA-HzXz-Vw3TXC0eeW_AQlcu8CybBgyxtW5Kc; expires=Thu, 23-May-2024 18:46:19 GMT; path=/; domain=.google.com; Secure; HttpOnly; SameSite=none
Strict-Transport-Security:
max-age=31536000
X-Frame-Options:
SAMEORIGIN
X-Xss-Protection:
0
`
        .trim()
        .replace(/^\S+:$/gm, str => str.toLowerCase())
        .split(/:\s|\n/);
      for (let i = 0; i < fields.length; ++i) {
        const input = fields[i];
        const stats = { length: 0 };
        //console.debug((encodeXPACK(input, stats), stats.length) - (encodeHPACK(input, stats), stats.length), input)
        assert(input === decodeXPACK(encodeXPACK(input)));
        assert(input === decodeHPACK(encodeHPACK(input)));
        assert(input === decodeDelta(encodeDelta(input)));
        let j = 0;
        cs[j++] += input.length * 8;
        cs[j++] += encodeXPACK(input, stats) && stats.length;
        cs[j++] += encodeHPACK(input, stats) && stats.length;
        cs[j++] += encodeDelta(input).length * 8;
      }
      let j = 1;
      console.debug('XPACK   comp. ratio response', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('HPACK   comp. ratio response', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
      console.debug('Delta   comp. ratio response', 1 - cs[j] / cs[0], cs[0] / cs[j++]);
    });

  });

});

const simH2E5 = simulator(2, 5, 0, ` ,.-:`);
const simH3E5 = simulator(3, 5, 0, ` ,.-:`);
const simH2S5 = simulator(2, 0, 5, ` ,.`);
const simH3S5 = simulator(3, 0, 5, ` ,.`);
const simH2S0 = simulator(2, 0, 0, ` ,.-:;`);
function simulator(header: number, escape: number, shift: number, opts: string) {
  return (input: string): number => {
    if (input === '') return 0;
    const enum State {
      Upper = 0,
      Lower = 1,
      Number = 2,
      Symbol = 3,
      Control = 4,
    }
    let state = State.Lower;
    let count = 0;
    let cnt = 0;
    for (let i = 0; i < input.length; ++i) {
      const last = i + 1 === input.length ? 4 : 0;
      const c = input[i];
      ++cnt;
      if ('A' <= c && c <= 'Z' || state === State.Upper && opts.includes(c)) {
        if (state !== State.Upper) {
          count += shift
            ? escape + shift
            : escape + header + len();
          cnt = 0;
        }
        else if (last && !shift) {
          count += Math.min(last, len());
        }
        count += 5;
        //count -= cnt < 3 ? shift + 5 * cnt - 8 * cnt : 0;
        state = State.Upper;
      }
      else if ('a' <= c && c <= 'z' || state === State.Lower && opts.includes(c)) {
        if (state !== State.Lower) {
          count += shift
            ? escape + shift
            : escape + header + len();
          cnt = 0;
        }
        else if (last && !shift) {
          count += Math.min(last, len());
        }
        count += 5;
        //count -= cnt < 3 ? shift + 5 * cnt - 8 * cnt : 0;
        state = State.Lower;
      }
      else if ('0' <= c && c <= '9' || state === State.Number && ` ',.:;`.includes(c)) {
        if (state !== State.Number) {
          count += shift
            ? escape + shift
            : escape + header + len();
          cnt = 0;
        }
        else if (last && !shift) {
          count += Math.min(last, len());
        }
        count += 4;
        //count -= cnt < 3 ? shift + 5 * cnt - 8 * cnt : 0;
        state = State.Number;
      }
      else {
        if (state !== State.Symbol) {
          count += shift
            ? +!!escape * 5 + shift
            : +!!escape * 5 + header + len();
          cnt = 0;
        }
        else if (last && !shift) {
          count += Math.min(last, len());
        }
        count += 5;
        //count -= cnt < 3 ? shift + 6 * cnt - 8 * cnt : 0;
        state = State.Symbol;
      }
    }
    return count;

    function len(): number {
      if (escape || shift) return 0;
      if (cnt <= 2) {
        return cnt;
      }
      if (cnt <= 14) {
        return ((cnt - 2) / 3 | 0) * 2 + 4;
      }
      if (cnt <= 28) {
        return ((cnt - 14) / 15 | 0) * 4 + 14;
      }
      else {
        return ((cnt - 29) / 255 | 0) * 8 + 22;
      }
    }
  }
}
simLRU();
function simLRU() {
  return (input: string): number => {
  const lru4 = new LRU<string, number>(16);
  const lru3 = new LRU<string, number>(8);
  const lru3L = new LRU<string, number>(8);
  const lru3R = new LRU<string, number>(8);
  'fypaoeuidhtnslrc'.split('').forEach((c, i) => lru4.set(c, i));
  'aoeuifyp'.split('').forEach((c, i) => lru3.set(c, i));
  'fypaoeui'.split('').forEach((c, i) => lru3L.set(c, i));
  'dhtnslrc'.split('').forEach((c, i) => lru3R.set(c, i));
    let count = 0;
    for (let i = 0; i < input.length;) {
      let c = input[i++];
      if (lru4.has(c) === false) {
        lru4.set(c, 0);
        count += 8;
        continue;
      }
      const j = lru4.get(c)!;
      c = input[i++];
      const lru3 = j < 8 ? lru3R : lru3L;
      if (lru3.get(c) === undefined) {
        lru3.set(c, 0);
        count += 8;
        --i;
        continue;
      }
      count += 8;
    }
    return count;
  };
}

const countries =`
United States
China
Japan
Germany
India
United Kingdom
France
Italy
Canada
Brazil
Russia
South Korea
Australia
Mexico
Spain
Indonesia
Netherlands
Saudi Arabia
Turkey
Switzerland
Taiwan
Poland
Argentina
Belgium
Sweden
Ireland
Thailand
Norway
Israel
Singapore
Austria
Nigeria
United Arab Emirates
Vietnam
Malaysia
Philippines
Bangladesh
Denmark
South Africa
Hong Kong
Egypt
Pakistan
Iran
Chile
Romania
Colombia
Czech Republic
Finland
Peru
Iraq
Portugal
New Zealand
Kazakhstan
Greece
Qatar
Algeria
Hungary
Kuwait
Ethiopia
Ukraine
Morocco
Slovakia
Ecuador
Dominican Republic
Puerto Rico
Kenya
Angola
Cuba
Oman
Guatemala
Bulgaria
Venezuela
Uzbekistan
Luxembourg
Tanzania
Turkmenistan
Croatia
Lithuania
Costa Rica
Uruguay
Panama
Ivory Coast
Sri Lanka
Serbia
Belarus
Azerbaijan
DR Congo
Slovenia
Ghana
Myanmar
Jordan
Tunisia
Uganda
Cameroon
Latvia
Sudan
Libya
Bolivia
Bahrain
Paraguay
Nepal
Estonia
Macau
El Salvador
Honduras
Papua New Guinea
Senegal
Cyprus
Cambodia
Zimbabwe
Zambia
Iceland
Bosnia and Herzegovina
Trinidad and Tobago
Georgia
Haiti
Lebanon
Armenia
Guinea
Burkina Faso
Mali
Gabon
Albania
Afghanistan
Mozambique
Palestine
Botswana
Yemen
Malta
Benin
Nicaragua
Jamaica
Mongolia
Niger
Guyana
Brunei
Madagascar
North Korea
Moldova
Syria
North Macedonia
Equatorial Guinea
Mauritius
Bahamas
Laos
Namibia
Rwanda
Congo
Tajikistan
Kyrgyzstan
Chad
Malawi
Mauritania
New Caledonia
Kosovo
Togo
Somalia
Monaco
Bermuda
Montenegro
South Sudan
Maldives
Liechtenstein
Barbados
French Polynesia
Cayman Islands
Fiji
Eswatini
Liberia
Djibouti
Andorra
Aruba
Sierra Leone
Suriname
Burundi
Belize
Greenland
Central African Republic
Curaçao
Bhutan
Eritrea
Lesotho
Cape Verde
Gambia
Saint Lucia
East Timor
Seychelles
Guinea-Bissau
Antigua and Barbuda
San Marino
Zanzibar
Solomon Islands
British Virgin Islands
Comoros
Grenada
Vanuatu
Saint Kitts and Nevis
Saint Vincent and the Grenadines
Turks and Caicos Islands
Samoa
Sint Maarten
Dominica
São Tomé and Príncipe
Tonga
Micronesia
Marshall Islands
Cook Islands
Palau
Anguilla
Kiribati
Nauru
Montserrat
Tuvalu
`.trim().match(/^[a-z]+(?:[- ][a-z]+)*$/mig)!;
assert(countries.length > 180);

// https://www.wordfrequency.info/
const words = `
the
be
and
a
of
to
in
i
you
it
have
to
that
for
do
he
with
on
this
n't
we
that
not
but
they
say
at
what
his
from
go
or
by
get
she
my
can
as
know
if
me
your
all
who
about
their
will
so
would
make
just
up
think
time
there
see
her
as
out
one
come
people
take
year
him
them
some
want
how
when
which
now
like
other
could
our
into
here
then
than
look
way
more
these
no
thing
well
because
also
two
use
tell
good
first
man
day
find
give
more
new
one
us
any
those
very
her
need
back
there
should
even
only
many
really
work
life
why
right
down
on
try
let
something
too
call
woman
may
still
through
mean
after
never
no
world
in
feel
yeah
great
last
child
oh
over
ask
when
as
school
state
much
talk
out
keep
leave
put
like
help
big
where
same
all
own
while
start
three
high
every
another
become
most
between
happen
family
over
president
old
yes
house
show
again
student
so
seem
might
part
hear
its
place
problem
where
believe
country
always
week
point
hand
off
play
turn
few
group
such
against
run
guy
about
case
question
work
night
live
game
number
write
bring
without
money
lot
most
book
system
government
next
city
company
story
today
job
move
must
bad
friend
during
begin
love
each
hold
different
american
little
before
ever
word
fact
right
read
anything
nothing
sure
small
month
program
maybe
right
under
business
home
kind
stop
pay
study
since
issue
name
idea
room
percent
far
away
law
actually
large
though
provide
lose
power
kid
war
understand
head
mother
real
best
team
eye
long
long
side
water
young
wait
okay
both
yet
after
meet
service
area
important
person
hey
thank
much
someone
end
change
however
only
around
hour
everything
national
four
line
girl
around
watch
until
father
sit
create
information
car
learn
least
already
kill
minute
party
include
stand
together
back
follow
health
remember
often
reason
speak
ago
set
black
member
community
once
social
news
allow
win
body
lead
continue
whether
enough
spend
level
able
political
almost
boy
university
before
stay
add
later
change
five
probably
center
among
face
public
die
food
else
history
buy
result
morning
off
parent
office
course
send
research
walk
door
white
several
court
home
grow
better
open
moment
including
consider
both
such
little
within
second
late
street
free
better
everyone
policy
table
sorry
care
low
human
please
hope
1
process
teacher
data
offer
death
whole
experience
plan
easy
education
build
expect
fall
himself
age
hard
sense
across
show
early
college
music
appear
mind
class
police
use
effect
season
tax
heart
son
art
possible
serve
break
although
end
market
even
air
force
require
foot
up
listen
agree
according
anyone
baby
wrong
love
cut
decide
republican
full
behind
pass
interest
sometimes
security
eat
report
control
rate
local
suggest
report
nation
sell
action
support
wife
decision
receive
value
base
pick
phone
thanks
event
drive
strong
reach
remain
explain
site
hit
pull
church
model
perhaps
relationship
six
fine
movie
field
raise
less
player
couple
million
themselves
record
especially
difference
light
development
federal
former
role
pretty
myself
view
price
effort
nice
quite
along
voice
finally
department
either
toward
leader
because
photo
wear
space
project
return
position
special
million
film
need
major
type
town
article
road
form
chance
drug
economic
situation
choose
practice
cause
happy
science
join
teach
early
develop
share
yourself
carry
clear
brother
matter
dead
image
star
cost
simply
post
society
picture
piece
paper
energy
personal
building
military
open
doctor
activity
exactly
american
media
miss
evidence
product
realize
save
arm
technology
catch
comment
look
term
color
cover
describe
guess
choice
source
mom
soon
director
international
rule
campaign
ground
election
face
uh
check
page
fight
itself
test
patient
produce
certain
whatever
half
video
support
throw
third
care
rest
recent
available
step
ready
opportunity
official
oil
call
organization
character
single
current
likely
county
future
dad
whose
less
shoot
industry
second
list
general
stuff
figure
attention
forget
risk
no
focus
short
fire
dog
red
hair
point
condition
wall
daughter
before
deal
author
truth
upon
husband
period
series
order
officer
close
land
note
computer
thought
economy
goal
bank
behavior
sound
deal
certainly
nearly
increase
act
north
well
blood
culture
medical
ok
everybody
top
difficult
close
language
window
response
population
lie
tree
park
worker
draw
plan
drop
push
earth
cause
per
private
tonight
race
than
letter
other
gun
simple
course
wonder
involve
hell
poor
each
answer
nature
administration
common
no
hard
message
song
enjoy
similar
congress
attack
past
hot
seek
amount
analysis
store
defense
bill
like
cell
away
performance
hospital
bed
board
protect
century
summer
material
individual
recently
example
represent
fill
state
place
animal
fail
factor
natural
sir
agency
usually
significant
help
ability
mile
statement
entire
democrat
floor
serious
career
dollar
vote
sex
compare
south
forward
subject
financial
identify
beautiful
decade
bit
reduce
sister
quality
quickly
act
press
worry
accept
enter
mention
sound
thus
plant
movement
scene
section
treatment
wish
benefit
interesting
west
candidate
approach
determine
resource
claim
answer
prove
sort
enough
size
somebody
knowledge
rather
hang
sport
tv
loss
argue
left
note
meeting
skill
card
feeling
despite
degree
crime
that
sign
occur
imagine
vote
near
king
box
present
figure
seven
foreign
laugh
disease
lady
beyond
discuss
finish
design
concern
ball
east
recognize
apply
prepare
network
huge
success
district
cup
name
physical
growth
rise
hi
standard
force
sign
fan
theory
staff
hurt
legal
september
set
outside
et
strategy
clearly
property
lay
final
authority
perfect
method
region
since
impact
indicate
safe
committee
supposed
dream
training
shit
central
option
eight
particularly
completely
opinion
main
ten
interview
exist
remove
dark
play
union
professor
pressure
purpose
stage
blue
herself
sun
pain
artist
employee
avoid
account
release
fund
environment
treat
specific
version
shot
hate
reality
visit
club
justice
river
brain
memory
rock
talk
camera
global
various
arrive
notice
bit
detail
challenge
argument
lot
nobody
weapon
best
station
island
absolutely
instead
discussion
instead
affect
design
little
anyway
respond
control
trouble
conversation
manage
close
date
public
army
top
post
charge
seat
assume
writer
perform
credit
green
marriage
operation
indeed
sleep
necessary
reveal
agent
access
bar
debate
leg
contain
beat
cool
democratic
cold
glass
improve
adult
trade
religious
head
review
kind
address
association
measure
stock
gas
deep
lawyer
production
relate
middle
management
original
victim
cancer
speech
particular
trial
none
item
weight
tomorrow
step
positive
form
citizen
study
trip
establish
executive
politics
stick
customer
manager
rather
publish
popular
sing
ahead
conference
total
discover
fast
base
direction
sunday
maintain
past
majority
peace
dinner
partner
user
above
fly
bag
therefore
rich
individual
tough
owner
shall
inside
voter
tool
june
far
may
mountain
range
coach
fear
friday
attorney
unless
nor
expert
structure
budget
insurance
text
freedom
crazy
reader
style
through
march
machine
november
generation
income
born
admit
hello
onto
sea
okay
mouth
throughout
own
test
web
shake
threat
solution
shut
down
travel
scientist
hide
obviously
refer
alone
drink
investigation
senator
unit
photograph
july
television
key
sexual
radio
prevent
once
modern
senate
violence
touch
feature
audience
evening
whom
front
hall
task
score
skin
suffer
wide
spring
experience
civil
safety
weekend
while
worth
title
heat
normal
hope
yard
finger
tend
mission
eventually
participant
hotel
judge
pattern
break
institution
faith
professional
reflect
folk
surface
fall
client
edge
traditional
council
device
firm
environmental
responsibility
chair
internet
october
by
funny
immediately
investment
ship
effective
previous
content
consumer
element
nuclear
spirit
directly
afraid
define
handle
track
run
wind
lack
cost
announce
journal
heavy
ice
collection
feed
soldier
just
governor
fish
shoulder
cultural
successful
fair
trust
suddenly
future
interested
deliver
saturday
editor
fresh
anybody
destroy
claim
critical
agreement
powerful
researcher
concept
willing
band
marry
promise
easily
restaurant
league
senior
capital
anymore
april
potential
etc
quick
magazine
status
attend
replace
due
hill
kitchen
achieve
screen
generally
mistake
along
strike
battle
spot
basic
very
corner
target
driver
beginning
religion
crisis
count
museum
engage
communication
murder
blow
object
express
huh
encourage
matter
blog
smile
return
belief
block
debt
fire
labor
understanding
neighborhood
contract
middle
species
additional
sample
involved
inside
mostly
path
concerned
apple
conduct
god
wonderful
library
prison
hole
attempt
complete
code
sales
gift
refuse
increase
garden
introduce
roll
christian
definitely
like
lake
turn
sure
earn
plane
vehicle
examine
application
thousand
coffee
gain
result
file
billion
reform
ignore
welcome
gold
jump
planet
location
bird
amazing
principle
promote
search
nine
alive
possibility
sky
otherwise
remind
healthy
fit
horse
advantage
commercial
steal
basis
context
highly
christmas
strength
move
monday
mean
alone
beach
survey
writing
master
cry
scale
resident
football
sweet
failure
reporter
commit
fight
one
associate
vision
function
truly
sick
average
human
stupid
will
chinese
connection
camp
stone
hundred
key
truck
afternoon
responsible
secretary
apparently
smart
southern
totally
western
collect
conflict
burn
learning
wake
contribute
ride
british
following
order
share
newspaper
foundation
variety
perspective
document
presence
stare
lesson
limit
appreciate
complete
observe
currently
hundred
fun
crowd
attack
apartment
survive
guest
soul
protection
intelligence
yesterday
somewhere
border
reading
terms
leadership
present
chief
attitude
start
um
deny
website
seriously
actual
recall
fix
negative
connect
distance
regular
climate
relation
flight
dangerous
boat
aspect
grab
until
favorite
like
january
independent
volume
am
lots
front
online
theater
speed
aware
identity
demand
extra
charge
guard
demonstrate
fully
tuesday
facility
farm
mind
fun
thousand
august
hire
light
link
shoe
institute
below
living
european
quarter
basically
forest
multiple
poll
wild
measure
twice
cross
background
settle
winter
focus
presidential
operate
fuck
view
daily
shop
above
division
slowly
advice
reaction
injury
it
ticket
grade
wow
birth
painting
outcome
enemy
damage
being
storm
shape
bowl
commission
captain
ear
troop
female
wood
warm
clean
lead
minister
neighbor
tiny
mental
software
glad
finding
lord
drive
temperature
quiet
spread
bright
cut
influence
kick
annual
procedure
respect
wave
tradition
threaten
primary
strange
actor
blame
active
cat
depend
bus
clothes
affair
contact
category
topic
victory
direct
towards
map
egg
ensure
general
expression
past
session
competition
possibly
technique
mine
average
intend
impossible
moral
academic
wine
approach
somehow
gather
scientific
african
cook
participate
gay
appropriate
youth
dress
straight
weather
recommend
medicine
novel
obvious
thursday
exchange
explore
extend
bay
invite
tie
ah
belong
obtain
broad
conclusion
progress
surprise
assessment
smile
feature
cash
defend
pound
correct
married
pair
slightly
loan
village
half
suit
demand
historical
meaning
attempt
supply
lift
ourselves
honey
bone
consequence
unique
next
regulation
award
bottom
excuse
familiar
classroom
search
reference
emerge
long
lunch
judge
ad
desire
instruction
emergency
thinking
tour
french
combine
moon
sad
address
december
anywhere
chicken
fuel
train
abuse
construction
wednesday
link
deserve
famous
intervention
grand
visit
confirm
lucky
insist
coast
proud
cover
fourth
cop
angry
native
supreme
baseball
but
email
accident
front
duty
growing
struggle
revenue
expand
chief
launch
trend
ring
repeat
breath
inch
neck
core
terrible
billion
relatively
complex
press
miss
slow
soft
generate
extremely
last
drink
forever
corporate
deep
prefer
except
cheap
literature
direct
mayor
male
importance
record
danger
emotional
knee
ass
capture
traffic
fucking
outside
now
train
plate
equipment
select
file
studio
expensive
secret
engine
adopt
luck
via
pm
panel
hero
circle
critic
solve
busy
episode
back
check
requirement
politician
rain
colleague
disappear
beer
predict
exercise
tired
democracy
ultimately
setting
honor
works
unfortunately
theme
issue
male
clean
united
pool
educational
empty
comfortable
investigate
useful
pocket
digital
plenty
entirely
fear
afford
sugar
teaching
conservative
chairman
error
bridge
tall
specifically
flower
though
universe
live
acknowledge
limit
coverage
crew
locate
balance
equal
lip
lean
zone
wedding
copy
score
joke
used
clear
bear
meal
review
minority
sight
sleep
russian
dress
release
soviet
profit
challenge
careful
gender
tape
ocean
unidentified
host
grant
circumstance
late
boss
declare
domestic
tea
organize
english
neither
either
official
surround
manner
surprised
percentage
massive
cloud
winner
honest
standard
propose
rely
plus
sentence
request
appearance
regarding
excellent
criminal
salt
beauty
bottle
component
under
fee
jewish
yours
dry
dance
shirt
tip
plastic
indian
mark
tooth
meat
stress
illegal
significantly
february
constitution
definition
uncle
metal
album
self
suppose
investor
fruit
holy
desk
eastern
valley
largely
abortion
chapter
commitment
celebrate
arrest
dance
prime
urban
internal
bother
proposal
shift
capacity
guilty
warn
influence
weak
except
catholic
nose
variable
convention
jury
root
incident
climb
hearing
everywhere
payment
bear
conclude
scream
surgery
shadow
witness
increasingly
chest
amendment
paint
secret
complain
extent
pleasure
nod
holiday
super
talent
necessarily
liberal
expectation
ride
accuse
knock
previously
wing
corporation
sector
fat
experiment
match
thin
farmer
rare
english
confidence
bunch
bet
cite
northern
speaker
breast
contribution
leaf
creative
interaction
hat
doubt
promise
pursue
overall
nurse
question
long-term
gene
package
weird
difficulty
hardly
daddy
estimate
list
era
comment
aid
vs
invest
personally
notion
explanation
airport
chain
expose
lock
convince
channel
carefully
tear
estate
initial
offer
purchase
guide
forth
his
bond
birthday
travel
pray
improvement
ancient
ought
escape
trail
brown
fashion
length
sheet
funding
meanwhile
fault
barely
eliminate
motion
essential
apart
combination
limited
description
mix
snow
implement
pretty
proper
part
marketing
approve
other
bomb
slip
regional
lack
muscle
contact
rise
0
likely
creation
typically
spending
instrument
mass
far
thick
kiss
increased
inspire
separate
noise
yellow
aim
e-mail
cycle
signal
app
golden
reject
inform
perception
visitor
cast
contrast
judgment
mean
rest
representative
pass
regime
merely
producer
whoa
route
lie
typical
analyst
account
elect
smell
female
living
disability
comparison
hand
rating
campus
assess
solid
branch
mad
somewhat
gentleman
opposition
fast
suspect
land
hit
aside
athlete
opening
prayer
frequently
employ
basketball
existing
revolution
click
emotion
fuck
platform
behind
frame
appeal
quote
potential
struggle
brand
enable
legislation
addition
lab
oppose
row
immigration
asset
observation
online
taste
decline
attract
ha
for
household
separate
breathe
existence
mirror
pilot
stand
relief
milk
warning
heaven
flow
literally
quit
calorie
seed
vast
bike
german
employer
drag
technical
disaster
display
sale
bathroom
succeed
consistent
agenda
enforcement
diet
mark
silence
journalist
bible
queen
divide
expense
cream
exposure
priority
soil
angel
journey
trust
relevant
tank
cheese
schedule
bedroom
tone
selection
date
perfectly
wheel
gap
veteran
below
disagree
characteristic
protein
resolution
whole
regard
fewer
engineer
walk
dish
waste
print
depression
dude
fat
present
upper
wrap
ceo
visual
initiative
rush
gate
slow
whenever
entry
japanese
gray
assistance
height
compete
rule
due
essentially
benefit
phase
conservative
recover
criticism
faculty
achievement
alcohol
therapy
offense
touch
killer
personality
landscape
deeply
reasonable
soon
suck
transition
fairly
column
wash
button
opponent
pour
immigrant
first
distribution
golf
pregnant
unable
alternative
favorite
stop
violent
portion
acquire
suicide
stretch
deficit
symptom
solar
complaint
capable
analyze
scared
supporter
dig
twenty
pretend
philosophy
childhood
lower
well
outside
dark
wealth
welfare
poverty
prosecutor
spiritual
double
evaluate
mass
israeli
shift
reply
buck
display
knife
round
tech
detective
pack
disorder
creature
tear
closely
industrial
housing
watch
chip
regardless
numerous
tie
range
command
shooting
dozen
pop
layer
bread
exception
passion
block
highway
pure
commander
extreme
publication
vice
fellow
win
mystery
championship
install
tale
liberty
host
beneath
passenger
physician
graduate
sharp
substance
atmosphere
stir
muslim
passage
pepper
emphasize
cable
square
recipe
load
beside
roof
vegetable
accomplish
silent
habit
discovery
total
recovery
dna
gain
territory
girlfriend
consist
straight
surely
proof
nervous
immediate
parking
sin
unusual
rice
engineering
advance
interview
bury
still
cake
anonymous
flag
contemporary
good
jail
rural
match
coach
interpretation
wage
breakfast
severe
profile
saving
brief
adjust
reduction
constantly
assist
bitch
constant
permit
primarily
entertainment
shout
academy
teaspoon
dream
transfer
usual
ally
clinical
count
swear
avenue
priest
employment
waste
relax
owe
transform
grass
narrow
ethnic
scholar
edition
abandon
practical
infection
musical
suggestion
resistance
smoke
prince
illness
embrace
trade
republic
volunteer
target
general
evaluation
mine
opposite
awesome
switch
black
iraqi
iron
perceive
fundamental
phrase
assumption
sand
designer
planning
leading
mode
track
respect
widely
occasion
pose
approximately
retire
elsewhere
festival
cap
secure
attach
mechanism
intention
scenario
yell
incredible
spanish
strongly
racial
transportation
pot
boyfriend
consideration
prior
retirement
rarely
joint
doubt
preserve
enormous
cigarette
factory
valuable
clip
electric
giant
slave
submit
effectively
christian
monitor
wonder
resolve
remaining
participation
stream
rid
origin
teen
particular
congressional
bind
coat
tower
license
twitter
impose
innocent
curriculum
mail
estimate
insight
investigator
virus
hurricane
accurate
provision
strike
communicate
cross
vary
jacket
increasing
green
equally
pay
in
light
implication
fiction
protest
mama
imply
twin
pant
another
ahead
bend
shock
exercise
criteria
arab
dirty
ring
toy
potentially
assault
peak
anger
boot
dramatic
peer
enhance
math
slide
favor
pink
dust
aunt
lost
prospect
mood
mm-hmm
settlement
rather
justify
depth
juice
formal
virtually
gallery
tension
throat
draft
reputation
index
normally
mess
joy
steel
motor
enterprise
salary
moreover
giant
cousin
ordinary
graduate
dozen
evolution
so-called
helpful
competitive
lovely
fishing
anxiety
professional
carbon
essay
islamic
honor
drama
odd
evil
stranger
belt
urge
toss
fifth
formula
potato
monster
smoke
telephone
rape
palm
jet
navy
excited
plot
angle
criticize
prisoner
discipline
negotiation
damn
butter
desert
complicated
prize
blind
assign
bullet
awareness
sequence
illustrate
drop
pack
provider
fucking
minor
activist
poem
vacation
weigh
gang
privacy
clock
arrange
penalty
stomach
concert
originally
statistics
electronic
properly
bureau
wolf
and/or
classic
recommendation
exciting
maker
dear
impression
broken
battery
narrative
process
arise
kid
sake
delivery
forgive
visible
heavily
junior
rep
diversity
string
lawsuit
latter
cute
deputy
restore
buddy
psychological
besides
intense
friendly
evil
lane
hungry
bean
sauce
print
dominate
testing
trick
fantasy
absence
offensive
symbol
recognition
detect
tablespoon
construct
hmm
arrest
approval
aids
whereas
defensive
independence
apologize
top
asian
rose
ghost
involvement
permanent
wire
whisper
mouse
airline
founder
objective
nowhere
alternative
phenomenon
evolve
not
exact
silver
cent
universal
teenager
crucial
viewer
schedule
ridiculous
chocolate
sensitive
bottom
grandmother
missile
roughly
constitutional
adventure
genetic
advance
related
swing
ultimate
manufacturer
unknown
wipe
crop
survival
line
dimension
resist
request
roll
shape
darkness
guarantee
historic
educator
rough
personnel
race
confront
terrorist
royal
elite
occupy
emphasis
wet
destruction
raw
inner
proceed
violate
chart
pace
finance
champion
snap
suspect
advise
initially
advanced
unlikely
barrier
advocate
label
access
horrible
burden
violation
unlike
idiot
lifetime
working
fund
ongoing
react
routine
presentation
supply
gear
photograph
mexican
stadium
translate
mortgage
sheriff
clinic
spin
coalition
naturally
hopefully
mix
menu
smooth
advertising
interpret
plant
dismiss
muslim
apparent
arrangement
incorporate
split
brilliant
storage
framework
honestly
chase
sigh
assure
utility
taste
aggressive
cookie
terror
free
worth
wealthy
update
forum
alliance
possess
empire
curious
corn
neither
calculate
hurry
testimony
elementary
transfer
stake
precisely
bite
given
substantial
depending
glance
tissue
concentration
developer
found
ballot
consume
overcome
biological
chamber
similarly
stick
dare
developing
tiger
ratio
lover
expansion
encounter
occasionally
unemployment
pet
awful
laboratory
administrator
wind
quarterback
rocket
preparation
relative
confident
strategic
marine
quote
publisher
innovation
highlight
nut
fighter
rank
electricity
instance
fortune
freeze
variation
armed
negotiate
laughter
wisdom
correspondent
mixture
murder
assistant
retain
tomato
indian
testify
ingredient
since
galaxy
qualify
scheme
gop
shame
concentrate
contest
introduction
boundary
tube
versus
chef
regularly
ugly
screw
load
tongue
palestinian
fiscal
creek
hip
accompany
decline
terrorism
respondent
narrator
voting
refugee
assembly
fraud
limitation
house
partnership
store
crash
surprise
representation
hold
ministry
flat
wise
witness
excuse
register
comedy
purchase
tap
infrastructure
organic
islam
diverse
favor
intellectual
tight
port
fate
market
absolute
dialogue
plus
frequency
tribe
external
appointment
convert
surprising
mobile
establishment
worried
bye
shopping
celebrity
congressman
impress
taxpayer
adapt
publicly
pride
clothing
rapidly
domain
mainly
ceiling
alter
shelter
random
obligation
shower
beg
asleep
musician
extraordinary
dirt
pc
bell
smell
damage
ceremony
clue
guideline
comfort
near
pregnancy
borrow
conventional
tourist
incentive
custom
cheek
tournament
double
satellite
nearby
comprehensive
stable
medication
script
educate
efficient
risk
welcome
scare
psychology
logic
economics
update
nevertheless
devil
thirty
beat
charity
fiber
wave
ideal
friendship
net
motivation
differently
reserve
observer
humanity
survivor
fence
quietly
humor
major
funeral
spokesman
extension
loose
sink
historian
ruin
balance
chemical
singer
drunk
swim
onion
specialist
missing
white
pan
distribute
silly
deck
reflection
shortly
database
flow
remote
permission
remarkable
everyday
lifestyle
sweep
naked
sufficient
lion
consumption
capability
practice
emission
sidebar
crap
dealer
measurement
vital
impressive
bake
fantastic
adviser
yield
mere
imagination
radical
tragedy
scary
consultant
correct
lieutenant
upset
attractive
acre
drawing
defeat
newly
scandal
ambassador
ooh
spot
content
round
bench
guide
counter
chemical
odds
rat
horror
appeal
vulnerable
prevention
square
segment
ban
tail
constitute
badly
bless
literary
magic
implementation
legitimate
slight
crash
strip
desperate
distant
preference
politically
feedback
health-care
criminal
can
italian
detailed
buyer
wrong
cooperation
profession
incredibly
orange
killing
sue
photographer
running
engagement
differ
paint
pitch
extensive
salad
stair
notice
grace
divorce
vessel
pig
assignment
distinction
fit
circuit
acid
canadian
flee
efficiency
memorial
proposed
blue
entity
iphone
punishment
pause
pill
rub
romantic
myth
economist
latin
decent
assistant
craft
poetry
terrorist
thread
wooden
confuse
subject
privilege
coal
fool
cow
characterize
pie
decrease
resort
legacy
re
stress
frankly
matter
cancel
derive
dumb
scope
formation
grandfather
hence
wish
margin
wound
exhibition
legislature
furthermore
portrait
catholic
sustain
uniform
painful
loud
miracle
harm
zero
tactic
mask
calm
inflation
hunting
physically
final
flesh
temporary
fellow
nerve
lung
steady
headline
sudden
successfully
defendant
pole
satisfy
entrance
aircraft
withdraw
cabinet
relative
repeatedly
happiness
admission
correlation
proportion
dispute
candy
reward
counselor
recording
pile
explosion
appoint
couch
cognitive
furniture
significance
grateful
magic
suit
commissioner
shelf
tremendous
warrior
physics
garage
flavor
squeeze
prominent
fifty
fade
oven
satisfaction
discrimination
recession
allegation
boom
weekly
lately
restriction
diamond
document
crack
conviction
heel
fake
fame
shine
swing
playoff
actress
cheat
format
controversy
auto
grant
grocery
headquarters
rip
rank
shade
regulate
meter
olympic
pipe
patient
celebration
handful
copyright
dependent
signature
bishop
strengthen
soup
entitle
whoever
carrier
anniversary
pizza
ethics
legend
eagle
scholarship
crack
research
membership
standing
possession
treaty
partly
consciousness
manufacturing
announcement
tire
no
makeup
pop
prediction
stability
trace
norm
irish
genius
gently
operator
mall
rumor
poet
tendency
subsequent
alien
explode
cool
controversial
maintenance
courage
exceed
tight
principal
vaccine
identification
sandwich
bull
lens
twelve
mainstream
presidency
integrity
distinct
intelligent
secondary
bias
hypothesis
fifteen
nomination
delay
adjustment
sanction
render
shop
acceptable
mutual
high
examination
meaningful
communist
superior
currency
collective
tip
flame
guitar
doctrine
palestinian
float
commerce
invent
robot
rapid
plain
respectively
particle
across
glove
till
edit
moderate
jazz
infant
summary
server
leather
radiation
prompt
function
composition
operating
assert
case
discourse
loud
dump
net
wildlife
soccer
complex
mandate
monitor
downtown
nightmare
barrel
homeless
globe
uncomfortable
execute
feel
trap
gesture
pale
tent
receiver
horizon
diagnosis
considerable
gospel
automatically
fighting
stroke
wander
duck
grain
beast
concern
remark
fabric
civilization
warm
corruption
collapse
ma'am
greatly
workshop
inquiry
cd
admire
exclude
rifle
closet
reporting
curve
patch
touchdown
experimental
earnings
hunter
fly
tunnel
corps
behave
rent
german
motivate
attribute
elderly
virtual
minimum
weakness
progressive
doc
medium
virtue
ounce
collapse
delay
athletic
confusion
legislative
facilitate
midnight
deer
way
undergo
heritage
summit
sword
telescope
donate
blade
toe
agriculture
park
enforce
recruit
favor
dose
concerning
integrate
rate
pitch
prescription
retail
adoption
monthly
deadly
grave
rope
reliable
label
transaction
lawn
consistently
mount
bubble
briefly
absorb
princess
log
blanket
laugh
kingdom
anticipate
bug
primary
dedicate
nominee
transformation
temple
sense
arrival
frustration
changing
demonstration
pollution
poster
nail
nonprofit
cry
guidance
exhibit
pen
interrupt
lemon
bankruptcy
resign
dominant
invasion
sacred
replacement
portray
hunt
distinguish
melt
consensus
kiss
french
hardware
rail
cold
mate
dry
korean
cabin
dining
liberal
snake
tobacco
orientation
trigger
wherever
seize
abuse
mess
punish
sexy
depict
input
seemingly
widespread
competitor
flip
freshman
donation
administrative
donor
gradually
overlook
toilet
pleased
resemble
ideology
glory
maximum
organ
skip
starting
brush
brick
gut
reservation
rebel
disappointed
oak
valid
instructor
rescue
racism
pension
diabetes
overall
cluster
eager
marijuana
combat
praise
costume
sixth
frequent
inspiration
orange
concrete
cooking
conspiracy
trait
van
institutional
garlic
drinking
response
crystal
stretch
pro
associate
helicopter
counsel
equation
roman
sophisticated
timing
pope
opera
ethical
mount
indication
motive
porch
reinforce
gaze
ours
lap
written
reverse
starter
injure
chronic
continued
exclusive
colonel
copy
beef
abroad
thanksgiving
intensity
desire
cave
basement
associated
unlike
fascinating
interact
illustration
daily
essence
container
driving
stuff
dynamic
gym
bat
plead
promotion
uncertainty
ownership
officially
tag
documentary
stem
flood
guilt
inside
alarm
turkey
conduct
diagnose
precious
swallow
initiate
fitness
restrict
gulf
advocate
mommy
unexpected
shrug
agricultural
sacrifice
spectrum
dragon
bacteria
shore
pastor
cliff
ship
adequate
rape
addition
tackle
occupation
compose
slice
brave
military
stimulus
patent
powder
harsh
chaos
kit
this
piano
surprisingly
lend
correctly
project
govern
modest
shared
psychologist
servant
overwhelming
elevator
hispanic
divine
transmission
butt
commonly
cowboy
ease
intent
counseling
gentle
rhythm
short
complexity
nonetheless
effectiveness
lonely
statistical
longtime
strain
firm
garbage
devote
speed
venture
lock
aide
subtle
rod
top
civilian
t-shirt
endure
civilian
basket
strict
loser
franchise
saint
aim
prosecution
bite
lyrics
compound
architecture
reach
destination
cope
province
sum
lecture
spill
genuine
upstairs
protest
trading
please
acceptance
revelation
march
indicator
collaboration
rhetoric
tune
slam
inevitable
monkey
till
protocol
productive
principal
finish
jeans
companion
convict
boost
recipient
practically
array
persuade
undermine
yep
ranch
scout
medal
endless
translation
ski
conservation
habitat
contractor
trailer
pitcher
towel
goodbye
harm
bonus
dramatically
genre
caller
exit
hook
behavioral
omit
pit
volunteer
boring
hook
suspend
cholesterol
closed
advertisement
bombing
consult
encounter
expertise
creator
peaceful
upset
provided
tablet
blow
ruling
launch
warming
equity
rational
classic
utilize
pine
past
bitter
guard
surgeon
affordable
tennis
artistic
download
suffering
accuracy
literacy
treasury
talented
crown
importantly
bare
invisible
sergeant
regulatory
thumb
colony
walking
accessible
damn
integration
spouse
award
excitement
residence
bold
adolescent
greek
doll
oxygen
finance
gravity
functional
palace
echo
cotton
rescue
estimated
program
endorse
lawmaker
determination
flash
simultaneously
dynamics
shell
hint
frame
administer
rush
christianity
distract
ban
alleged
statute
value
biology
republican
follower
nasty
evident
prior
confess
eligible
picture
rock
trap
consent
pump
down
bloody
hate
occasional
trunk
prohibit
sustainable
belly
banking
asshole
journalism
flash
average
obstacle
ridge
heal
bastard
cheer
apology
tumor
architect
wrist
harbor
handsome
bullshit
realm
bet
twist
inspector
surveillance
trauma
rebuild
romance
gross
deadline
age
classical
convey
compensation
insect
debate
output
parliament
suite
opposed
fold
separation
demon
eating
structural
besides
equality
logical
probability
await
generous
acquisition
custody
compromise
greet
trash
judicial
earthquake
insane
realistic
wake
assemble
necessity
horn
parameter
grip
modify
signal
sponsor
mathematics
hallway
african-american
any
liability
crawl
theoretical
condemn
fluid
homeland
technological
exam
anchor
spell
considering
conscious
vitamin
known
hostage
reserve
actively
mill
teenage
respect
retrieve
processing
sentiment
offering
oral
convinced
photography
coin
laptop
bounce
goodness
affiliation
punch
burst
bee
blessing
command
continuous
above
landing
repair
worry
ritual
bath
sneak
historically
mud
scan
reminder
hers
slavery
supervisor
quantity
olympics
pleasant
slope
skirt
outlet
curtain
declaration
seal
immune
switch
calendar
paragraph
identical
credit
regret
quest
flat
entrepreneur
specify
stumble
clay
noon
last
strip
elbow
outstanding
uh-huh
unity
rent
manipulate
airplane
portfolio
mysterious
delicious
northwest
sweat
profound
sacrifice
treasure
flour
lightly
rally
default
alongside
plain
hug
isolate
exploration
secure
limb
enroll
outer
charter
southwest
escape
arena
witch
upcoming
forty
someday
unite
courtesy
statue
fist
castle
precise
squad
cruise
joke
legally
embassy
patience
medium
thereby
bush
purple
peer
electrical
outfit
cage
retired
shark
lobby
sidewalk
near
runner
ankle
attraction
fool
artificial
mercy
indigenous
slap
tune
dancer
candle
sexually
needle
hidden
chronicle
suburb
toxic
underlying
sensor
deploy
debut
star
magnitude
suspicion
pro
colonial
icon
grandma
info
jurisdiction
iranian
senior
parade
seal
archive
gifted
rage
outdoor
ending
loop
altogether
chase
burning
reception
local
crush
premise
deem
automatic
whale
mechanical
credibility
drain
drift
loyalty
promising
tide
traveler
grief
metaphor
skull
pursuit
therapist
backup
workplace
instinct
export
bleed
shock
seventh
fixed
broadcast
disclose
execution
pal
chuckle
pump
density
correction
representative
jump
repair
kinda
relieve
teammate
brush
corridor
russian
enthusiasm
extended
root
alright
panic
pad
bid
mild
productivity
guess
tuck
defeat
railroad
frozen
minimize
amid
inspection
cab
expected
nonsense
leap
draft
rider
theology
terrific
accent
invitation
reply
israeli
liar
oversee
awkward
registration
suburban
handle
momentum
instantly
clerk
chin
hockey
laser
proposition
rob
beam
ancestor
creativity
verse
casual
objection
clever
given
shove
revolutionary
carbohydrate
steam
reportedly
glance
forehead
resume
slide
sheep
good
carpet
cloth
interior
full-time
running
questionnaire
compromise
departure
behalf
graph
diplomatic
thief
herb
subsidy
cast
fossil
patrol
pulse
mechanic
cattle
screening
continuing
electoral
supposedly
dignity
prophet
commentary
sort
spread
serving
safely
homework
allegedly
android
alpha
insert
mortality
contend
elephant
solely
hurt
continent
attribute
ecosystem
leave
nearby
olive
syndrome
minimum
catch
abstract
accusation
coming
sock
pickup
shuttle
improved
calculation
innovative
demographic
accommodate
jaw
unfair
tragic
comprise
faster
nutrition
mentor
stance
rabbit
pause
dot
contributor
cooperate
disk
hesitate
regard
offend
exploit
compel
likelihood
sibling
southeast
gorgeous
undertake
painter
residential
counterpart
believer
lamp
inmate
thoroughly
trace
freak
filter
pillow
orbit
purse
likewise
cease
passing
feed
vanish
instructional
clause
mentally
model
left
pond
neutral
shield
popularity
cartoon
authorize
combined
exhibit
sink
graphic
darling
traditionally
vendor
poorly
conceive
opt
descend
firmly
beloved
openly
gathering
alien
stem
fever
preach
interfere
arrow
required
capitalism
kick
fork
survey
meantime
presumably
position
racist
stay
illusion
removal
anxious
arab
organism
awake
sculpture
spare
marine
harassment
drum
diminish
helmet
level
certificate
tribal
bad
mmm
sadly
cart
spy
sunlight
delete
rookie
clarify
hunger
practitioner
performer
protective
jar
programming
dawn
salmon
census
pick
accomplishment
conscience
fortunately
minimal
molecule
supportive
sole
threshold
inventory
comply
monetary
transport
shy
drill
influential
verbal
reward
ranking
gram
grasp
puzzle
envelope
heat
classify
enact
unfortunate
scatter
cure
time
dear
slice
readily
damn
discount
addiction
emerging
worthy
marker
juror
mention
blend
businessman
premium
retailer
charge
liver
pirate
protester
outlook
elder
gallon
additionally
ignorance
chemistry
sometime
weed
babe
fraction
cook
conversion
object
tolerate
trail
drown
merit
citizenship
coordinator
validity
european
lightning
turtle
ambition
worldwide
sail
added
delicate
comic
soap
hostile
instruct
shortage
useless
booth
diary
gasp
suspicious
transit
excite
publishing
curiosity
grid
rolling
bow
cruel
disclosure
rival
denial
secular
flood
speculation
sympathy
tender
inappropriate
o'clock
sodium
divorce
spring
bang
challenging
ipad
sack
barn
reliability
hormone
footage
carve
alley
ease
coastal
cafe
partial
flexible
experienced
mixed
vampire
optimistic
dessert
well-being
northeast
specialize
fleet
availability
compliance
pin
pork
astronomer
like
forbid
installation
boil
nest
exclusively
goat
shallow
equip
equivalent
betray
willingness
banker
interval
gasoline
encouraging
rain
exchange
bucket
theft
laundry
constraint
dying
hatred
jewelry
migration
invention
loving
revenge
unprecedented
outline
sheer
halloween
sweetheart
spit
lazy
intimate
defender
technically
battle
cure
peanut
unclear
piss
workout
wilderness
compelling
eleven
arm
backyard
alike
partially
transport
guardian
passionate
scripture
midst
ideological
apart
thrive
sensitivity
trigger
emotionally
ignorant
explicitly
unfold
headache
eternal
chop
ego
spectacular
deposit
verdict
regard
accountability
nominate
civic
uncover
critique
aisle
tropical
annually
eighth
blast
corrupt
compassion
scratch
verify
offender
inherit
strive
downtown
chunk
appreciation
canvas
punch
short-term
proceedings
magical
loyal
aah
desperately
throne
brutal
spite
propaganda
irony
soda
projection
dutch
parental
disabled
collector
re-election
disappointment
comic
aid
happily
steep
fancy
counter
listener
whip
public
drawer
heck
developmental
ideal
ash
socially
courtroom
stamp
solo
trainer
induce
anytime
morality
syrian
pipeline
bride
instant
spark
doorway
interface
learner
casino
placement
cord
fan
conception
flexibility
thou
tax
elegant
flaw
locker
peel
campaign
twist
spell
objective
plea
goddamn
import
stack
gosh
philosophical
junk
bicycle
vocal
chew
destiny
ambitious
unbelievable
vice
halfway
jealous
sphere
invade
sponsor
excessive
countless
sunset
interior
accounting
faithful
freely
extract
adaptation
ray
depressed
emperor
wagon
columnist
jungle
embarrassed
trillion
breeze
blame
foster
venue
discourage
disturbing
riot
isolation
explicit
commodity
attendance
tab
consequently
dough
novel
streak
silk
similarity
steak
dancing
petition
viable
breathing
mm
balloon
monument
try
cue
sleeve
toll
reluctant
warrant
stiff
tattoo
softly
sudden
graduation
japanese
deliberately
consecutive
upgrade
associate
accurately
strictly
leak
casualty
risky
banana
blank
beneficial
shrink
chat
rack
rude
usage
testament
browser
processor
thigh
perceived
yield
talking
merchant
quantum
eyebrow
surrounding
vocabulary
ashamed
eh
radar
stunning
murderer
burger
collar
align
textbook
sensation
afterward
charm
sunny
hammer
keyboard
persist
wheat
predator
bizarre
`.trim().match(/\S+/g)!;
assert(words.length > 5000);
