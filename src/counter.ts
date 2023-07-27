const dict = [...Array(36)].map((_, i) => i.toString(36)).join('');
assert(dict.length === 36);
assert(dict[0] === '0');
assert(dict.at(-1) === 'z');

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
