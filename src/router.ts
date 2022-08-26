import { Object } from './global';
import { Sequence } from './sequence';
import { fix } from './function';
import { memoize } from './memoize';

export function router<T>(config: Record<string, (path: string) => T>): (path: string) => T {
  const { match } = router.helpers();
  const patterns = Object.keys(config).reverse();
  for (const pattern of patterns) {
    if (pattern[0] !== '/') throw new Error(`Spica: Router: Pattern must start with "/": ${pattern}`);
    if (/\s/.test(pattern)) throw new Error(`Spica: Router: Pattern must not have whitespace: ${pattern}`);
  }
  return (path: string) => {
    const pathname = path.slice(0, path.search(/[?#]|$/));
    for (const pattern of patterns) {
      if (match(pattern, pathname)) return config[pattern](path);
    }
    throw new Error(`Spica: Router: No matches found`);
  };
}
export namespace router {
  export function helpers() {
    function match(pattern: string, path: string): boolean {
      assert(!path.includes('?'));
      const regSegment = /\/|[^/]+\/?/g;
      const ss = path.match(regSegment) ?? [];
      for (const pat of expand(pattern)) {
        assert(pat.match(regSegment)!.join('') === pat);
        const ps = optimize(pat).match(regSegment) ?? [];
        if (cmp(ps, ss)) return true;
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
      // 先頭の加除はChromeで非常に遅いので末尾を加除する
      const stack: ('{' | '(' | '[')[] = [];
      const mirror = {
        ']': '[',
        ')': '(',
        '}': '{',
      } as const;
      const nonsyms: number[] = [];
      let inonsyms = 0;
      let len = pattern.length;
      let buffer = '';
      BT: while (len) for (const token of pattern.match(/\\.?|[\[\](){}]|[^\\\[\](){}]+|$/g) ?? []) {
        switch (token) {
          case '':
            if (stack.length !== 0) {
              assert(nonsyms[0] === buffer.length);
              assert(inonsyms === 0);
              pattern = buffer;
              stack.splice(0, stack.length);
              len = pattern.length;
              buffer = '';
              continue BT;
            }
            flush();
            continue;
          case '[':
          case '(':
            // Prohibit unimplemented patterns.
            if (1) throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
            if (len - buffer.length === nonsyms[inonsyms] && ++inonsyms) break;
            stack[stack.length - 1] !== '[' && stack.push(token) && nonsyms.push(len - buffer.length);
            buffer += token;
            continue;
          case ']':
          case ')':
            stack[stack.length - 1] === mirror[token] && stack.pop() && nonsyms.pop();
            buffer += token;
            continue;
          case '{':
            if (len - buffer.length === nonsyms[inonsyms] && ++inonsyms) break;
            stack.length === 0 && flush();
            stack[stack.length - 1] !== '[' && stack.push(token) && nonsyms.push(len - buffer.length);
            buffer += token;
            continue;
          case '}':
            stack[0] === mirror[token] && stack.pop() && nonsyms.pop();
            buffer += token;
            stack.length === 0 && flush();
            continue;
        }
        buffer += token;
      }
      results.length === 0 && results.push('');
      return results;

      function flush(): void {
        len -= buffer.length;
        buffer && results.push(buffer);
        buffer = '';
      }
    }
    assert.deepStrictEqual(parse('{'.repeat(1e6) + '}'), ['{'.repeat(1e6 - 1), '{}']);
    function separate(pattern: string): string[] {
      const results: string[] = [];
      const stack: ('{' | '(' | '[')[] = [];
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
            stack[stack.length - 1] !== '[' && stack.push(token);
            continue;
          case ']':
          case ')':
          case '}':
            stack[stack.length - 1] === mirror[token] && stack.pop();
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

    function cmp(pats: readonly string[], segs: readonly string[], i = 0, j = 0): boolean {
      assert(i <= pats.length);
      assert(j <= segs.length);
      if (i + j === 0 && pats.length > 0 && segs.length > 0) {
        assert(segs[0] === '/' || !segs[0].startsWith('/'));
        if (segs[0] === '.' && ['?', '*'].includes(pats[0][0])) return false;
      }
      for (; i < pats.length; ++i, ++j) {
        const pat = pats[i];
        if (pat === '**') return true;
        if (pat === '**/') {
          let min = pats.length - j;
          for (let k = j; k < pats.length; ++k) {
            pats[k] === '**/' && --min;
          }
          for (let k = segs.length - min; k >= j; --k) {
            if (cmp(pats, segs, i + 1, k)) return true;
          }
          return false;
        }
        else {
          if (j === segs.length) return false;
          const seg = pat.slice(-1) !== '/' && segs[j].slice(-1) === '/'
            ? segs[j].slice(0, -1) || segs[j]
            : segs[j];
          if (!cmp$(split(pat), 0, seg, 0)) return false;
        }
      }
      return true;
    }

    function cmp$(ps: readonly string[], i: number, segment: string, j: number): boolean {
      assert(i <= ps.length);
      assert(j <= segment.length);
      for (; i < ps.length; ++i) {
        const p = ps[i];
        const s = segment.slice(j);
        switch (p) {
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
              if (cmp$(ps, i + 1, segment, k)) return true;
            }
            return false;
          default:
            if (s.length < p.length || s.slice(0, p.length) !== p) return false;
            j += p.length;
            continue;
        }
      }
      return j === segment.length;
    }
    function split(pattern: string): string[] {
      const results: string[] = [];
      const stack: ('{' | '(' | '[')[] = [];
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
          case '[':
          case '(':
          case '{':
            buffer += token;
            stack[stack.length - 1] !== '[' && stack.push(token);
            continue;
          case ']':
          case ')':
          case '}':
            if (token === '}' && stack[0] === '{') throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
            stack[stack.length - 1] === mirror[token] && stack.pop();
            buffer += token;
            continue;
        }
        buffer += token[0] === '\\'
          ? token.slice(1)
          : token;
      }
      return results;

      function flush(): void {
        buffer && results.push(buffer);
        buffer = '';
      }
    }
    const optimize = memoize(fix((pattern: string) =>
      pattern.replace(/((?:^|\/)\*)\*(?:\/\*\*)*(?=\/|$)|\*+(\?+)?/g, '$1$2*')));

    return {
      match,
      expand,
      cmp,
    };
  }
}
