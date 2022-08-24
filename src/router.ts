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
    if (/\*\*|[\[\]]/.test(pattern)) throw new Error(`Spica: Router: Invalid pattern: ${pattern}`);
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

    const expand = memoize((pattern: string): string[] =>
      pattern === ''
        ? [pattern]
        // Expand from innermost.
        : Sequence.from(pattern.match(/{[^{}]*}|.[^{]*/g)!)
            .map(frag =>
              frag[0] + frag.slice(-1) === '{}'
                ? frag.slice(1, -1).split(',')
                : [frag])
            .mapM(Sequence.from)
            .map(frags => frags.join(''))
            .bind(pat =>
              pat === pattern
                ? Sequence.from([pat])
                : Sequence.from(expand(pat)))
            .unique()
            .extract());

    function match(pattern: string, segment: string): boolean {
      assert(segment === '/' || !segment.startsWith('/'));
      if (segment[0] === '.' && ['?', '*'].includes(pattern[0])) return false;
      return match$([...optimize(pattern)], 0, [...segment], 0);
    }

    function match$(ps: readonly string[], i: number, ss: readonly string[], j: number): boolean {
      for (; i < ps.length || 1; ++i, ++j) {
        const p = ps[i] ?? '';
        const s = ss[j] ?? '';
        switch (p) {
          case '':
            return s === '';
          case '?':
            switch (s) {
              case '':
              case '/':
                return false;
              default:
                continue;
            }
          case '*':
            switch (s) {
              case '':
              case '/':
                --j;
                continue;
            }
            for (let k = ss.length; k >= j; --k) {
              if (match$(ps, i + 1, ss, k)) return true;
            }
            return false;
          default:
            if (s === p) continue;
            return false;
        }
      }
      return true;
    }

    return {
      compare,
      expand,
      match,
    };
  }
}

const optimize = fix((pattern: string) =>
  pattern.replace(/(\*)\*|\*(\?+)\*?(?!\*)/g, '$1$2*'));
