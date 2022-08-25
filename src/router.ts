import { Object } from './global';
import { Sequence } from './sequence';
import { fix } from './function';
import { memoize } from './memoize';

export function router<T>(config: Record<string, (path: string) => T>): (path: string) => T {
  const { compare } = router.helpers();
  const patterns = Object.keys(config).reverse();
  for (const pattern of patterns) {
    if (pattern[0] !== '/') throw new Error(`Spica: Router: Pattern must start with "/": ${pattern}`);
    if (/\s/.test(pattern)) throw new Error(`Spica: Router: Pattern must not have whitespace: ${pattern}`);
    // Prohibit unimplemented patterns.
    if (pattern.includes('**')) throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
  }
  return (path: string) => {
    const pathname = path.slice(0, path.search(/[?#]|$/));
    for (const pattern of patterns) {
      if (compare(pattern, pathname)) return config[pattern](path);
    }
    throw new Error(`Spica: Router: No matches found`);
  };
}
export namespace router {
  export function helpers() {
    function compare(pattern: string, path: string): boolean {
      assert(path[0] === '/');
      assert(!path.includes('?'));
      const regSegment = /\/|[^/]+\/?/g;
      const regTrailingSlash = /\/$/;
      const ss1 = path.match(regSegment)!;
      const ss2 = path.replace(regTrailingSlash, '').match(regSegment) ?? [];
      for (const pat of expand(pattern)) {
        assert(pat.match(regSegment)!.join('') === pat);
        const ps = pat.match(regSegment)!;
        const ss = pat.slice(-1) === '/'
          ? ss1
          : ss2;
        if (ps.every((_, i) => ss[i] && match(ps[i], ss[i]))) return true;
      }
      return false;
    }

    const expand = memoize(function expand(pattern: string): readonly string[] {
      return Sequence.from(
        parse(pattern)
          .map(token =>
            token[0] + token.slice(-1) === '{}'
              ? separate(token.slice(1, -1)).flatMap(expand)
              : [token]))
        .mapM(Sequence.from)
        .extract()
        .map(tokens => tokens.join(''));
    });
    function parse(pattern: string): string[] {
      const results: string[] = [];
      const stack: ('[' | '(' | '{')[] = [];
      const mirror = {
        ']': '[',
        ')': '(',
      } as const;
      let buffer = '';
      for (const token of pattern.match(/\\.?|[\[\](){}]|[^\\\[\](){}]+|$/g) ?? []) {
        switch (token) {
          case '':
            flush();
            continue;
          case '{':
            stack.length === 0 && flush();
            buffer += token;
            stack[0] !== '[' && stack.unshift(token);
            continue;
          case '}':
            stack[0] === '{' && stack.shift();
            buffer += token;
            stack.length === 0 && flush();
            continue;
          case '(':
          case '[':
            // Prohibit unimplemented patterns.
            if (1) throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
            buffer += token;
            stack[0] !== '[' && stack.unshift(token);
            continue;
          case ')':
          case ']':
            stack[0] === mirror[token] && stack.shift();
            buffer += token;
            continue;
        }
        buffer += token;
      }
      results.length === 0 && results.push('');
      return results;

      function flush(): void {
        buffer && results.push(buffer);
        buffer = '';
      }
    }
    function separate(pattern: string): string[] {
      const results: string[] = [];
      const stack: ('[' | '(' | '{')[] = [];
      const mirror = {
        ']': '[',
        ')': '(',
        '}': '{',
      } as const;
      let buffer = '';
      for (const token of pattern.match(/\\.?|[,\[\](){}]|[^\\,\[\](){}]+|$/g) ?? []) {
        switch (token) {
          case '':
            flush();
            continue;
          case ',':
            stack.length === 0
              ? flush()
              : buffer += token;
            continue;
          case '[':
          case '(':
          case '{':
            buffer += token;
            stack[0] !== '[' && stack.unshift(token);
            continue;
          case ']':
          case ')':
          case '}':
            stack[0] === mirror[token] && stack.shift();
            buffer += token;
            continue;
        }
        buffer += token;
      }
      return results;

      function flush(): void {
        results.push(buffer);
        buffer = '';
      }
    }

    function match(pattern: string, segment: string): boolean {
      assert(segment === '/' || !segment.startsWith('/'));
      if (segment[0] === '.' && ['?', '*'].includes(pattern[0])) return false;
      return match$(split(optimize(pattern)), 0, segment, 0);
    }

    function match$(ps: readonly string[], i: number, segment: string, j: number): boolean {
      for (; i < ps.length || 1; ++i) {
        const p = ps[i] ?? '';
        const s = segment.slice(j);
        switch (p) {
          case '':
            return s === '';
          case '?':
            switch (s) {
              case '':
              case '/':
                return false;
              default:
                ++j;
                continue;
            }
          case '*':
            switch (s) {
              case '':
              case '/':
                continue;
            }
            for (let k = segment.length; k >= j; --k) {
              if (match$(ps, i + 1, segment, k)) return true;
            }
            return false;
          default:
            if (s.slice(0, p.length) !== p) return false;
            j += p.length;
            continue;
        }
      }
      return true;
    }
    function split(pattern: string): string[] {
      const results: string[] = [];
      const stack: ('[' | '(' | '{')[] = [];
      const mirror = {
        ']': '[',
        ')': '(',
        '}': '{',
      } as const;
      let buffer = '';
      for (const token of pattern.match(/\\.?|[*?\[\](){}]|[^\\*?\[\](){}]+|$/g) ?? []) {
        switch (token) {
          case '':
            flush();
            continue;
          case '*':
          case '?':
            stack.length === 0 && flush();
            buffer += token;
            stack.length === 0 && flush();
            continue;
          case '{':
          case '[':
          case '(':
            buffer += token;
            stack[0] !== '[' && stack.unshift(token);
            continue;
          // @ts-expect-error
          case '}':
            if (stack[0] === '{') throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
          case ']':
          case ')':
            stack[0] === mirror[token] && stack.shift();
            buffer += token;
            continue;
        }
        buffer += token;
      }
      return results;

      function flush(): void {
        buffer && results.push(buffer);
        buffer = '';
      }
    }
    const optimize = memoize(fix((pattern: string) =>
      pattern.replace(/(\*)\*|\*(\?+)\*?(?!\*)/g, '$1$2*')));

    return {
      compare,
      expand,
      match,
    };
  }
}
