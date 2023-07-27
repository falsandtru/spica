const dict = [
  ...[...Array(10)].map((_, i) => i),
  ...[...Array(26)].map((_, i) => String.fromCharCode(0x61 + i)),
  ...[...Array(26)].map((_, i) => String.fromCharCode(0x41 + i)),
].join('');
assert(dict.length === 62);
assert(dict[0] === '0');
assert(dict.at(-1) === 'Z');

export function counter(radix: number = 10, pad: string = '', numbers: string = dict): () => string {
  assert(radix <= numbers.length);
  return format(pad, counter$(radix, numbers));
}

function counter$(radix: number, numbers: string): () => string {
  let cnt = 0;
  if (radix === 10 && numbers.slice(0, 10) === dict.slice(0, 10)) return () => `${++cnt}`;
  let carry: () => string;
  let str = '';
  return (): string => {
    cnt = ++cnt % radix;
    if (cnt !== 0) return `${str}${numbers[cnt]}`;
    carry ??= counter$(radix, numbers);
    str = carry();
    return `${str}${numbers[cnt]}`;
  };
}

function format(pad: string, counter: () => string): () => string {
  if (pad === '') return counter;
  let len = 0;
  let str = '';
  return () => {
    const count = counter();
    assert(count.length > 0);
    if (count.length === len) return `${str}${count}`;
    len = count.length;
    str = pad.length > len ? pad.slice(0, pad.length - len) : '';
    return `${str}${count}`;
  };
}
