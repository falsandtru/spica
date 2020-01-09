import {
  IsNever, IsAny, IsUnknown, Not, And, Or, Eq, TEq, DEq, If, Case,
  Prepend, Append, Split, Head, Tail, Init, Last, Inits, Tails, Concat, Reverse, Member, Index, AtLeast,
  Rewrite, ExactRewrite, ExactExtract, ExactExclude,
  valueof, indexof,
  Type, StrictType,
  OverwriteStruct,
  ExtractProp, DeepExtractProp, ExcludeProp, DeepExcludeProp, RewriteProp, DeepRewriteProp,
  Partial, DeepPartial, Required, DeepRequired, Immutable, DeepImmutable, Mutable, DeepMutable,
  type
} from './type';

describe('Unit: lib/type', () => {
  describe('IsNever', () => {
    it('', () => {
      assert((): true => true as TEq<IsNever<never>, true>);
      assert((): true => true as TEq<IsNever<any>, false>);
      assert((): true => true as TEq<IsNever<unknown>, false>);
      assert((): true => true as TEq<IsNever<{}>, false>);
    });

  });

  describe('IsAny', () => {
    it('', () => {
      assert((): true => true as TEq<IsAny<any>, true>);
      assert((): true => true as TEq<IsAny<unknown>, false>);
      assert((): true => true as TEq<IsAny<never>, false>);
      assert((): true => true as TEq<IsAny<{}>, false>);
    });

  });

  describe('IsUnknown', () => {
    it('', () => {
      assert((): true => true as TEq<IsUnknown<unknown>, true>);
      assert((): true => true as TEq<IsUnknown<any>, false>);
      assert((): true => true as TEq<IsUnknown<never>, false>);
      assert((): true => true as TEq<IsUnknown<{}>, false>);
      assert((): true => true as TEq<IsUnknown<void>, false>);
      assert((): true => true as TEq<IsUnknown<undefined>, false>);
      assert((): true => true as TEq<IsUnknown<null>, false>);
      assert((): true => true as TEq<IsUnknown<0>, false>);
      assert((): true => true as TEq<IsUnknown<object>, false>);
    });

  });

  describe('Not', () => {
    it('', () => {
      assert((): true => true as TEq<Not<true>, false>);
      assert((): true => true as TEq<Not<false>, true>);
    });

  });

  describe('And', () => {
    it('', () => {
      assert((): true => true as TEq<And<true, true>, true>);
      assert((): true => true as TEq<And<true, false>, false>);
      assert((): true => true as TEq<And<false, true>, false>);
      assert((): true => true as TEq<And<false, false>, false>);
      assert((): true => true as TEq<And<true, undefined>, undefined>);
      assert((): true => true as TEq<And<false, undefined>, false>);
      assert((): true => true as TEq<And<undefined, true>, undefined>);
      assert((): true => true as TEq<And<undefined, false>, undefined>);
      assert((): true => true as TEq<And<0, 1>, 0>);
      assert((): true => true as TEq<And<'', 1>, ''>);
      assert((): true => true as TEq<And<null, 1>, null>);
      assert((): true => true as TEq<And<void, 1>, void>);
    });

  });

  describe('Or', () => {
    it('', () => {
      assert((): true => true as TEq<Or<true, true>, true>);
      assert((): true => true as TEq<Or<true, false>, true>);
      assert((): true => true as TEq<Or<false, true>, true>);
      assert((): true => true as TEq<Or<false, false>, false>);
    });

  });

  describe('Eq', () => {
    it('', () => {
      assert((): true => true as TEq<Eq<true, true>, true>);
      assert((): true => true as TEq<Eq<true, false>, false>);
      assert((): true => true as TEq<Eq<false, true>, false>);
      assert((): true => true as TEq<Eq<false, false>, true>);
      assert((): true => true as TEq<Eq<boolean, true>, boolean>);
      assert((): true => true as TEq<Eq<boolean, false>, boolean>);
      assert((): true => true as TEq<Eq<boolean, boolean>, boolean>);
      assert((): true => true as TEq<Eq<0, 0>, true>);
      assert((): true => true as TEq<Eq<0, number>, false>);
      assert((): true => true as TEq<Eq<number, 0>, false>);
      assert((): true => true as TEq<Eq<number, number>, true>);
      assert((): true => true as TEq<Eq<void, void>, true>);
      assert((): true => true as TEq<Eq<void, undefined>, false>);
      assert((): true => true as TEq<Eq<void, null>, false>);
      assert((): true => true as TEq<Eq<void, undefined | null>, false>);
      assert((): true => true as TEq<Eq<void, never>, false>);
      assert((): true => true as TEq<Eq<never, never>, true>);
      assert((): true => true as TEq<Eq<never, void>, false>);
      assert((): true => true as TEq<Eq<never, undefined>, false>);
      assert((): true => true as TEq<Eq<never, null>, false>);
      assert((): true => true as TEq<Eq<{}, [] | {}>, boolean>);
      assert((): true => true as TEq<Eq<[] | {}, {}>, boolean>);
    });

  });

  describe('TEq', () => {
    it('', () => {
      assert((): true => true as TEq<true, true>);
      assert((): false => true as TEq<true, false>);
      assert((): false => true as TEq<false, true>);
      assert((): true => true as TEq<false, false>);
      assert((): false => true as TEq<true, boolean>);
      assert((): false => true as TEq<false, boolean>);
      assert((): false => true as TEq<boolean, true>);
      assert((): false => true as TEq<boolean, false>);
      assert((): true => true as TEq<boolean, boolean>);
      assert((): false => true as TEq<boolean, never>);
      assert((): false => true as TEq<never, boolean>);
      assert((): true => true as TEq<never, never>);
      assert((): true => true as TEq<any, any>);
      assert((): false => true as TEq<any, unknown>);
      assert((): false => true as TEq<any, never>);
      assert((): false => true as TEq<unknown, any>);
      assert((): false => true as TEq<[], [] | {}>);
      assert((): false => true as TEq<[] | {}, []>);
      assert((): true => true as TEq<{}, [] | {}>);
      assert((): true => true as TEq<[] | {}, {}>);
    });

  });

  describe('DEq', () => {
    it('', () => {
      assert((): true => true as TEq<DEq<true, true>, true>);
      assert((): true => true as TEq<DEq<true, false>, false>);
      assert((): true => true as TEq<DEq<true, boolean>, undefined>);
      assert((): true => true as TEq<DEq<false, true>, false>);
      assert((): true => true as TEq<DEq<false, false>, true>);
      assert((): true => true as TEq<DEq<false, boolean>, undefined>);
      assert((): true => true as TEq<DEq<boolean, boolean>, undefined>);
    });

  });

  describe('If', () => {
    it('', () => {
      assert((): true => true as TEq<If<true, 1, 0>, 1>);
      assert((): true => true as TEq<If<false, 1, 0>, 0>);
      assert((): true => true as TEq<If<0, 1, 0>, 0>);
      assert((): true => true as TEq<If<1, 1, 0>, 1>);
    });

  });

  describe('Case', () => {
    it('', () => {
      assert((): true => true as TEq<Case<0, [1]>, 1>);
      assert((): true => true as TEq<Case<0, { 0: 1 }>, 1>);
      assert((): true => true as TEq<Case<1, { 0: 1; [otherwise: string]: number; }>, number>);
    });

  });

  describe('Prepend', () => {
    it('', () => {
      assert((): true => true as TEq<Prepend<0, []>, [0]>);
      assert((): true => true as TEq<Prepend<0, [1]>, [0, 1]>);
      assert((): true => true as TEq<Prepend<0, [1, 2]>, [0, 1, 2]>);
      assert((): true => true as TEq<Prepend<0, number[]>, [0, ...number[]]>);
      assert((): true => true as TEq<Prepend<0, [1, ...number[]]>, [0, 1, ...number[]]>);
    });

  });

  describe('Append', () => {
    it('', () => {
      assert((): true => true as TEq<Append<9, []>, [9]>);
      assert((): true => true as TEq<Append<9, [1]>, [1, 9]>);
      assert((): true => true as TEq<Append<9, [1, 2]>, [1, 2, 9]>);
    });

  });

  describe('Split', () => {
    it('', () => {
      assert((): true => true as TEq<Split<[]>, never>);
      assert((): true => true as TEq<Split<[0]>, [0, []]>);
      assert((): true => true as TEq<Split<[0, 1]>, [0, [1]]>);
      assert((): true => true as TEq<Split<[0, 1, 2]>, [0, [1, 2]]>);
      assert((): true => true as TEq<Split<number[]>, [number, number[]]>);
      assert((): true => true as TEq<Split<[0, 1, ...number[]]>, [0, [1, ...number[]]]>);
    });

  });

  describe('Head', () => {
    it('', () => {
      assert((): true => true as TEq<Head<[]>, never>);
      assert((): true => true as TEq<Head<[0]>, 0>);
      assert((): true => true as TEq<Head<[0, 1]>, 0>);
      assert((): true => true as TEq<Head<number[]>, number>);
      assert((): true => true as TEq<Head<[0, 1, ...number[]]>, 0>);
    });

  });

  describe('Tail', () => {
    it('', () => {
      assert((): true => true as TEq<Tail<[]>, never>);
      assert((): true => true as TEq<Tail<[0]>, []>);
      assert((): true => true as TEq<Tail<[0, 1]>, [1]>);
      assert((): true => true as TEq<Tail<number[]>, number[]>);
      assert((): true => true as TEq<Tail<[0, 1, ...number[]]>, [1, ...number[]]>);
    });

  });

  describe('Init', () => {
    it('', () => {
      assert((): true => true as TEq<Init<[]>, never>);
      assert((): true => true as TEq<Init<[0]>, []>);
      assert((): true => true as TEq<Init<[0, 1]>, [0]>);
      assert((): true => true as TEq<Init<number[]>, number[]>);
      assert((): true => true as TEq<Init<[0, 1, ...number[]]>, [0, 1, ...number[]]>);
    });

  });

  describe('Last', () => {
    it('', () => {
      assert((): true => true as TEq<Last<[]>, never>);
      assert((): true => true as TEq<Last<[0]>, 0>);
      assert((): true => true as TEq<Last<[0, 1]>, 1>);
      assert((): true => true as TEq<Last<number[]>, number>);
      assert((): true => true as TEq<Last<[0, 1, ...number[]]>, number>);
    });

  });

  describe('Inits', () => {
    it('', () => {
      assert((): true => true as TEq<Inits<[]>, never>);
      assert((): true => true as TEq<Inits<[0]>, [0] | []>);
      assert((): true => true as TEq<Inits<[0, 1]>, [0, 1] | [0] | []>);
      assert((): true => true as TEq<Inits<number[]>, never>);
      assert((): true => true as TEq<Inits<[0, 1, ...number[]]>, never>);
    });

  });

  describe('Tails', () => {
    it('', () => {
      assert((): true => true as TEq<Tails<[]>, never>);
      assert((): true => true as TEq<Tails<[0]>, [0] | []>);
      assert((): true => true as TEq<Tails<[0, 1]>, [0, 1] | [1] | []>);
      assert((): true => true as TEq<Tails<number[]>, never>);
      assert((): true => true as TEq<Tails<[0, 1, ...number[]]>, never>);
    });

  });

  describe('Concat', () => {
    it('', () => {
      assert((): true => true as TEq<Concat<[], []>, []>);
      assert((): true => true as TEq<Concat<[], [0]>, [0]>);
      assert((): true => true as TEq<Concat<[0], []>, [0]>);
      assert((): true => true as TEq<Concat<[0], [1]>, [0, 1]>);
      assert((): true => true as TEq<Concat<[0, 1], [2, 3]>, [0, 1, 2, 3]>);
      assert((): true => true as TEq<Concat<[0, 1], number[]>, [0, 1, ...number[]]>);
      assert((): true => true as TEq<Concat<[0, 1], [2, ...number[]]>, [0, 1, 2, ...number[]]>);
    });

  });

  describe('Reverse', () => {
    it('', () => {
      assert((): true => true as TEq<Reverse<[]>, []>);
      assert((): true => true as TEq<Reverse<[0]>, [0]>);
      assert((): true => true as TEq<Reverse<[0, 1]>, [1, 0]>);
      assert((): true => true as TEq<Reverse<[0, 1, 2]>, [2, 1, 0]>);
      assert((): true => true as TEq<Reverse<0[]>, 0[]>);
    });

  });

  describe('Member', () => {
    it('', () => {
      assert((): true => true as TEq<Member<0, []>, false>);
      assert((): true => true as TEq<Member<0, [0]>, true>);
      assert((): true => true as TEq<Member<0, [0, 1]>, true>);
      assert((): true => true as TEq<Member<1, [0, 1]>, true>);
      assert((): true => true as TEq<Member<2, [0, 1]>, false>);
      assert((): true => true as TEq<Member<0, 0[]>, true>);
      assert((): true => true as TEq<Member<0, 1[]>, false>);
    });

  });

  describe('Index', () => {
    it('', () => {
      assert((): true => true as TEq<Index<0, []>, -1>);
      assert((): true => true as TEq<Index<0, [0]>, 0>);
      assert((): true => true as TEq<Index<0, [0, 1]>, 0>);
      assert((): true => true as TEq<Index<1, [0, 1]>, 1>);
      assert((): true => true as TEq<Index<2, [0, 1]>, -1>);
      assert((): true => true as TEq<Index<0, 0[]>, number>);
      assert((): true => true as TEq<Index<0, 1[]>, -1>);
    });

  });

  describe('AtLeast', () => {
    it('', () => {
      assert((): AtLeast<0, number> => []);
      assert((): AtLeast<0, number> => [0]);
      assert((): AtLeast<1, number> => [0]);
      assert((): AtLeast<1, number> => [0, 0]);
    });

  });

  describe('Rewrite', () => {
    it('', () => {
      assert((): true => true as TEq<Rewrite<1, [1, -1]>, -1>);
      assert((): true => true as TEq<Rewrite<1, [1, -1] | [0, 0]>, -1>);
      assert((): true => true as TEq<Rewrite<0 | 1, [1, -1]>, 0 | -1>);
      assert((): true => true as TEq<Rewrite<0 | 1, [1, -1] | [0, void]>, void | -1>);
      assert((): true => true as TEq<Rewrite<void, [void, never]>, never>);
      assert((): true => true as TEq<Rewrite<never, [never, void]>, void>);
    });

  });

  describe('ExactRewrite', () => {
    it('', () => {
      assert((): true => true as TEq<ExactRewrite<[] | {}, [{}, void]>, [] | void>);
      assert((): true => true as TEq<ExactRewrite<0, [never, 1]>, 0>);
    });

  });

  describe('ExactExtract', () => {
    it('', () => {
      assert((): true => true as TEq<ExactExtract<[] | {}, {} | null>, {}>);
      assert((): true => true as TEq<ExactExtract<0, never>, never>);
    });

  });

  describe('ExactExclude', () => {
    it('', () => {
      assert((): true => true as TEq<ExactExclude<[] | {}, {} | null>, []>);
      assert((): true => true as TEq<ExactExclude<0, never>, 0>);
    });

  });

  describe('indexof', () => {
    it('', () => {
      assert((): true => true as TEq<indexof<[0, -1], -1>, 1>);
      assert((): true => true as TEq<indexof<{ 0: 0; 1: -1 }, -1>, 1>);
    });

  });

  describe('valueof', () => {
    it('', () => {
      assert((): true => true as TEq<valueof<{ 0: 0; a: 1; }>, 0 | 1>);
      assert((): true => true as TEq<valueof<{ 0: 0; a: 1; }, 0>, 0>);
      assert((): true => true as TEq<valueof<[0]>, 0>);
      assert((): true => true as TEq<valueof<{ [i: number]: 0; }>, 0>);
      assert((): true => true as TEq<valueof<Immutable<{ 0: 0; a: 1; }>>, 0 | 1>);
      assert((): true => true as TEq<valueof<ReadonlyArray<0>>, 0>);
    });

  });

  describe('Type', () => {
    it('', () => {
      assert((): true => true as TEq<Type<void>, 'undefined'>);
      assert((): true => true as TEq<Type<undefined>, 'undefined'>);
      assert((): true => true as TEq<Type<boolean>, 'boolean'>);
      assert((): true => true as TEq<Type<number>, 'number'>);
      assert((): true => true as TEq<Type<bigint>, 'bigint'>);
      assert((): true => true as TEq<Type<string>, 'string'>);
      assert((): true => true as TEq<Type<symbol>, 'symbol'>);
      assert((): true => true as TEq<Type<() => unknown>, 'function'>);
      assert((): true => true as TEq<Type<(arg: unknown) => unknown>, 'function'>);
      assert((): true => true as TEq<Type<(...args: unknown[]) => unknown>, 'function'>);
      assert((): true => true as TEq<Type<() => unknown>, 'function'>);
      assert((): true => true as TEq<Type<new () => unknown>, 'function'>);
      assert((): true => true as TEq<Type<new (arg: unknown) => unknown>, 'function'>);
      assert((): true => true as TEq<Type<new (...args: unknown[]) => unknown>, 'function'>);
      assert((): true => true as TEq<Type<unknown[]>, 'object'>);
      assert((): true => true as TEq<Type<object>, 'object'>);
      assert((): true => true as TEq<Type<null>, 'object'>);
      assert((): true => true as TEq<StrictType<never>, 'never'>);
      assert((): true => true as TEq<StrictType<any>, 'any'>);
      assert((): true => true as TEq<StrictType<unknown>, 'unknown'>);
      assert((): true => true as TEq<StrictType<void>, 'undefined'>);
      assert((): true => true as TEq<StrictType<undefined>, 'undefined'>);
      assert((): true => true as TEq<StrictType<null>, 'null'>);
    });

  });

  describe('OverwriteStruct', () => {
    it('', () => {
      type AB = { a: boolean; b: boolean; };
      type B = { b: number; };
      type Expected = { a: boolean; b: number; };
      assert((): true => true as TEq<OverwriteStruct<AB, B>, Expected>);
    });

  });

  describe('ExtractProp', () => {
    it('', () => {
      type AB = { a: boolean; b: boolean | undefined; };
      type A = { a: boolean; };
      assert((): true => true as TEq<ExtractProp<AB, boolean>, A>);
      assert((): true => true as TEq<ExtractProp<AB, boolean | number>, A>);
      assert((): true => true as TEq<ExtractProp<AB, never>, {}>);
      assert((): true => true as TEq<ExtractProp<{ a: never; b: void; }, never>, { a: never; }>);
      assert((): true => true as TEq<ExtractProp<{ a: never; b: void; }, void>, { b: void; }>);
    });

  });

  describe('DeepExtractProp', () => {
    it('', () => {
      type AD = { a: boolean; b: { a: boolean; b: boolean[]; c: undefined; d: undefined[]; e: boolean | undefined; f: Array<boolean | undefined>; }; c: { a: undefined; }; };
      assert((): true => true as TEq<DeepExtractProp<AD, boolean>, { a: boolean; b: { a: boolean; }; }>);
      assert((): true => true as TEq<DeepExtractProp<AD, boolean | boolean[]>, { a: boolean; b: { a: boolean; b: boolean[]; }; }>);
      assert((): true => true as TEq<DeepExtractProp<AD, boolean, AD['b']>, { a: boolean; }>);
      assert((): true => true as TEq<DeepExtractProp<{ a: { b: { c: 0; d: 0 | 1; e: 1; }; }; }, 0>, { a: { b: { c: 0; }; }; }>);
      assert((): true => true as TEq<DeepExtractProp<{ a: Function; }, never>, {}>);
      assert((): true => true as TEq<DeepExtractProp<{ a: never; b: void; }, never>, {}>);
      assert((): true => true as TEq<DeepExtractProp<{ a: never; b: void; }, void>, { b: void; }>);
    });

  });

  describe('ExcludeProp', () => {
    it('', () => {
      type AB = { a: boolean; b: boolean | undefined; };
      type A = { a: boolean; };
      assert((): true => true as TEq<ExcludeProp<AB, undefined>, A>);
      assert((): true => true as TEq<ExcludeProp<AB, undefined | number>, A>);
      assert((): true => true as TEq<ExcludeProp<AB, never>, AB>);
      assert((): true => true as TEq<ExcludeProp<{ a: never; b: void; }, never>, { b: void; }>);
      assert((): true => true as TEq<ExcludeProp<{ a: never; b: void; }, void>, { a: never; }>);
    });

  });

  describe('DeepExcludeProp', () => {
    it('', () => {
      type AD = { a: boolean; b: { a: boolean; b: boolean[]; c: undefined; d: undefined[]; e: boolean | undefined; f: Array<boolean | undefined>; }; c: { a: undefined; }; };
      assert((): true => true as TEq<DeepExcludeProp<AD, undefined>, { a: boolean; b: { a: boolean; b: boolean[]; d: undefined[]; f: Array<boolean | undefined>; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<AD, undefined | undefined[]>, { a: boolean; b: { a: boolean; b: boolean[]; f: Array<boolean | undefined>; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<AD, undefined, AD['b']>, ExcludeProp<AD, AD['c']>>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: { b: { c: 0; d: 0 | 1; e: 1; }; }; }, 0>, { a: { b: { e: 1; }; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: Function; }, never>, { a: Function; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: never; b: void; }, never>, { b: void; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: never; b: void; }, void>, {}>);
    });

  });

  describe('RewriteProp', () => {
    it('', () => {
      type A = { a: boolean; b: undefined; };
      type B = { a: boolean; b: number; };
      assert((): true => true as TEq<RewriteProp<A, [undefined, number]>, B>);
      assert((): true => true as TEq<RewriteProp<A, [undefined | number, number]>, B>);
      assert((): true => true as TEq<RewriteProp<A, [boolean, number] | [undefined, never]>, { a: number; b: never; }>);
      assert((): true => true as TEq<RewriteProp<A, [never, never]>, A>);
      assert((): true => true as TEq<RewriteProp<{ a: never; b: void; }, [never, null]>, { a: null; b: void; }>);
      assert((): true => true as TEq<RewriteProp<{ a: never; b: void; }, [void, null]>, { a: never; b: null; }>);
    });

  });

  describe('DeepRewriteProp', () => {
    it('', () => {
      type A = { a: { a: boolean; b: undefined; c: undefined[]; }; };
      type B = { a: { a: boolean; b: number; c: undefined[]; }; };
      assert((): true => true as TEq<DeepRewriteProp<A, [undefined, number]>, B>);
      assert((): true => true as TEq<DeepRewriteProp<A, [undefined | number, number]>, B>);
      assert((): true => true as TEq<DeepRewriteProp<A, [boolean, number] | [undefined, never]>, { a: { a: number; c: undefined[]; }; }>);
      assert((): true => true as TEq<DeepRewriteProp<A, [never, never]>, A>);
      assert((): true => true as TEq<DeepRewriteProp<{ a: { b: { c: 0; d: 0 | 1; e: 1; }; }; }, [1, -1]>, { a: { b: { c: 0; d: 0 | -1; e: -1; }; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: Function; }, [0, 0]>, { a: Function; }>);
      assert((): true => true as TEq<DeepRewriteProp<{ a: never; b: void; }, [never, null]>, { a: null; b: void; }>);
      assert((): true => true as TEq<DeepRewriteProp<{ a: never; b: void; }, [void, null]>, { b: null; }>);
    });

  });

  describe('Partial', () => {
    it('', () => {
      type R = { a: number[]; b: { c: string; }; d: () => 0; e: new () => object };
      type P = { a?: number[]; b?: { c: string; }; d?: () => 0; e?: new () => object };
      assert((): true => true as TEq<Partial<never>, never>);
      assert((): true => true as TEq<Partial<any>, any>);
      assert((): true => true as TEq<Partial<unknown>, unknown>);
      assert((): true => true as TEq<Partial<R>, P>);
      assert((): true => true as TEq<Partial<Required<R>>, P>);
    });

  });

  describe('DeepPartial', () => {
    it('', () => {
      type R = { a: number; b: { c: string[]; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string[]; d?: () => 0; e?: new () => object }; };
      assert((): true => true as TEq<DeepPartial<never>, never>);
      assert((): true => true as TEq<DeepPartial<any>, any>);
      assert((): true => true as TEq<DeepPartial<unknown>, unknown>);
      assert((): true => true as TEq<DeepPartial<R>, P>);
      assert((): true => true as TEq<DeepPartial<DeepRequired<R>>, P>);
      assert((): true => true as TEq<DeepPartial<R, R['b']>, Partial<R>>);
    });

  });

  describe('Required', () => {
    it('', () => {
      type R = { a: number[]; b: { c?: string; }; d: () => 0; e: new () => object };
      type P = { a?: number[]; b?: { c?: string; }; d?: () => 0; e?: new () => object };
      assert((): true => true as TEq<Required<never>, never>);
      assert((): true => true as TEq<Required<any>, any>);
      assert((): true => true as TEq<Required<unknown>, unknown>);
      assert((): true => true as TEq<Required<P>, R>);
      assert((): true => true as TEq<Required<Partial<R>>, R>);
    });

  });

  describe('DeepRequired', () => {
    it('', () => {
      type R = { a: number; b: { c: string[]; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string[]; d?: () => 0; e?: new () => object }; };
      assert((): true => true as TEq<DeepRequired<never>, never>);
      assert((): true => true as TEq<DeepRequired<any>, any>);
      assert((): true => true as TEq<DeepRequired<unknown>, unknown>);
      assert((): true => true as TEq<DeepRequired<P>, R>);
      assert((): true => true as TEq<DeepRequired<DeepPartial<R>>, R>);
      assert((): true => true as TEq<DeepRequired<P, P['b']>, Required<P>>);
    });

  });

  describe('Immutable', () => {
    it('', () => {
      type I = { readonly a?: [number]; readonly b: { c: string; }; readonly d: () => 0; readonly e: new () => object, f: Set<number>, g: ReadonlySet<number> };
      type M = { a?: [number]; b: { c: string; }; d: () => 0; e: new () => object, f: Set<number>, g: ReadonlySet<number> };
      assert((): true => true as TEq<Immutable<never>, never>);
      assert((): true => true as TEq<Immutable<any>, any>);
      assert((): true => true as TEq<Immutable<unknown>, unknown>);
      assert((): true => true as TEq<Immutable<M>, I>);
      assert((): true => true as TEq<Immutable<unknown[]>, ReadonlyArray<unknown>>);
      assert((): true => true as TEq<Immutable<{ a: unknown }>, { readonly a: unknown }>);
    });

  });

  describe('DeepImmutable', () => {
    it('', () => {
      type I = { readonly a?: number; readonly b: { readonly c: readonly [string]; readonly d: () => 0; readonly e: new () => object, f: ReadonlySet<number>, g: ReadonlySet<number> }; };
      type M = { a?: number; b: { c: [string]; d: () => 0; e: new () => object, f: Set<number>, g: ReadonlySet<number> }; };
      assert((): true => true as TEq<DeepImmutable<never>, never>);
      assert((): true => true as TEq<DeepImmutable<any>, any>);
      assert((): true => true as TEq<DeepImmutable<unknown>, unknown>);
      assert((): true => true as TEq<DeepImmutable<M>, I>);
      assert((): true => true as TEq<DeepImmutable<M, M['b']>, Immutable<M>>);
      assert((): true => true as TEq<DeepImmutable<unknown[]>, ReadonlyArray<unknown>>);
      assert((): true => true as TEq<DeepImmutable<{ a: unknown[] }>, { readonly a: readonly unknown[] }>);
    });

  });

  describe('Mutable', () => {
    it('', () => {
      type I = { readonly a?: [number]; readonly b: { c: string; }; readonly d: () => 0; readonly e: new () => object, f: Set<number>, g: ReadonlySet<number> };
      type M = { a?: [number]; b: { c: string; }; d: () => 0; e: new () => object, f: Set<number>, g: ReadonlySet<number> };
      assert((): true => true as TEq<Mutable<never>, never>);
      assert((): true => true as TEq<Mutable<any>, any>);
      assert((): true => true as TEq<Mutable<unknown>, unknown>);
      assert((): true => true as TEq<Mutable<I>, M>);
      assert((): true => true as TEq<Mutable<readonly unknown[]>, unknown[]>);
      assert((): true => true as TEq<Mutable<{ readonly a: unknown }>, { a: unknown }>);
    });

  });

  describe('DeepMutable', () => {
    it('', () => {
      type I = { readonly a?: number; readonly b: { readonly c: readonly [string]; readonly d: () => 0; readonly e: new () => object, f: ReadonlySet<number>, g: ReadonlySet<number> }; };
      type M = { a?: number; b: { c: [string]; d: () => 0; e: new () => object, f: Set<number>, g: Set<number> }; };
      assert((): true => true as TEq<DeepMutable<never>, never>);
      assert((): true => true as TEq<DeepMutable<any>, any>);
      assert((): true => true as TEq<DeepMutable<unknown>, unknown>);
      assert((): true => true as TEq<DeepMutable<I>, M>);
      assert((): true => true as TEq<DeepMutable<I, I['b']>, Mutable<I>>);
      assert((): true => true as TEq<DeepMutable<readonly unknown[]>, unknown[]>);
      assert((): true => true as TEq<DeepMutable<{ readonly a: readonly unknown[] }>, { a: unknown[] }>);
    });

  });

  describe('type', () => {
    it('primitive', () => {
      assert(type(undefined) === 'undefined');
      assert(type(false) === 'boolean');
      assert(type(0) === 'number');
      assert(type('') === 'string');
      assert(type(Symbol()) === 'symbol');
      assert(type(null) === 'null');
    });

    it('object', () => {
      assert(type([]) === 'Array');
      assert(type({}) === 'Object');
      assert(type(Object.create(null)) === 'Object');
      assert(type(() => 0) === 'Function');
      assert(type(new Boolean()) === 'Boolean');
      assert(type(new WeakMap()) === 'WeakMap');
    });

  });

});
