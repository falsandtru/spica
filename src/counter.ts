import { max } from './alias';

const dict = [...Array(36)].map((_, i) => i.toString(36)).join('');
assert(dict.length === 36);
assert(dict[0] === '0');
assert(dict.at(-1) === 'z');

export function counter(radix: number = 10, pad: string = ''): () => string {
  assert(radix <= 36);
  let cnt0 = 0;
  let cnt1 = 0;
  let str1 = '';
  let cnt2 = 0;
  let str2 = '';
  return () => {
    const digit0 = dict[cnt0 = ++cnt0 % radix];
    const digit1 = cnt0 ? str1 : str1 = dict[cnt1 = ++cnt1 % radix];
    const digitN = cnt0 | cnt1 ? str2 : str2 = (++cnt2).toString(radix);
    const count = `${digitN}${digit1}${digit0}`;
    return pad
      ? (pad + count).slice(-max(pad.length, count.length))
      : count;
  };
}
