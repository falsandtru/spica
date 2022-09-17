import { max } from './alias';

const dict = [...Array(36)].map((_, i) => i.toString(36)).join('');
assert(dict.length === 36);
assert(dict[0] === '0');
assert(dict.at(-1) === 'z');

export function counter(radix: number = 10, pad: string = ''): () => string {
  assert(radix <= 36);
  let count = 0;
  let str = '';
  let cnt = 0;
  return () => {
    const c = `${++cnt === radix ? str = (++count).toString(radix) : str}${dict[cnt = cnt % radix]}`;
    return pad
      ? (pad + c).slice(-max(pad.length, c.length))
      : c;
  };
}
