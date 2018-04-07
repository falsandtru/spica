import {
  Not, And, Or, Eq, TEq, DEq, If, Case,
  StrictExtract, StrictExclude,
  valueof, indexof,
  Type,
  DiffStruct, OverwriteStruct,
  ExtractProp, DeepExtractProp, ExcludeProp, DeepExcludeProp,
  Partial, DeepPartial, Required, DeepRequired, Readonly, DeepReadonly,
  type
} from './type';

describe('Unit: lib/type', () => {
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
      assert((): true => true as TEq<Eq<{}, never[] | {}>, boolean>);
      assert((): true => true as TEq<Eq<never[] | {}, {}>, boolean>);
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
      assert((): true => true as TEq<{}, never[] | {}>);
      assert((): true => true as TEq<never[] | {}, {}>);
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
      assert((): true => true as TEq<Case<'0', [1]>, 1>);
      assert((): true => true as TEq<Case<'0', { 0: 1 }>, 1>);
      assert((): true => true as TEq<Case<'1', { 0: 1; [otherwise: string]: number; }>, number>);
    });

  });

  describe('StrictExtract', () => {
    it('', () => {
      assert((): true => true as TEq<StrictExtract<never[] | {}, {} | null>, {}>);
      assert((): true => true as TEq<StrictExtract<0, never>, never>);
    });

  });

  describe('StrictExclude', () => {
    it('', () => {
      assert((): true => true as TEq<StrictExclude<never[] | {}, {} | null>, never[]>);
      assert((): true => true as TEq<StrictExclude<0, never>, 0>);
    });

  });

  describe('valueof', () => {
    it('', () => {
      assert((): true => true as TEq<valueof<{ 0: 0; a: 1; }>, 0 | 1>);
      assert((): true => true as TEq<valueof<{ 0: 0; a: 1; }, '0'>, 0>);
      assert((): true => true as TEq<valueof<[0]>, 0>);
      assert((): true => true as TEq<valueof<{ [i: number]: 0; }>, 0>);
      assert((): true => true as TEq<valueof<Readonly<{ 0: 0; a: 1; }>>, 0 | 1>);
      assert((): true => true as TEq<valueof<ReadonlyArray<0>>, 0>);
    });

  });

  describe('indexof', () => {
    it('', () => {
      assert((): true => true as TEq<indexof<{ 0: 0; 1: -1 }, -1>, '1'>);
    });

  });

  describe('Type', () => {
    it('', () => {
      assert((): true => true as TEq<Type<void>, 'undefined'>);
      assert((): true => true as TEq<Type<undefined>, 'undefined'>);
      assert((): true => true as TEq<Type<boolean>, 'boolean'>);
      assert((): true => true as TEq<Type<number>, 'number'>);
      assert((): true => true as TEq<Type<string>, 'string'>);
      assert((): true => true as TEq<Type<symbol>, 'symbol'>);
      assert((): true => true as TEq<Type<() => any>, 'function'>);
      assert((): true => true as TEq<Type<(arg: any) => any>, 'function'>);
      assert((): true => true as TEq<Type<(...args: any[]) => any>, 'function'>);
      assert((): true => true as TEq<Type<() => any>, 'function'>);
      assert((): true => true as TEq<Type<new () => any>, 'function'>);
      assert((): true => true as TEq<Type<new (arg: any) => any>, 'function'>);
      assert((): true => true as TEq<Type<new (...args: any[]) => any>, 'function'>);
      assert((): true => true as TEq<Type<any[]>, 'object'>);
      assert((): true => true as TEq<Type<object>, 'object'>);
      assert((): true => true as TEq<Type<null>, 'object'>);
    });

  });

  describe('DiffStruct', () => {
    it('', () => {
      type AB = { a: boolean; b: boolean; };
      type A = { a: boolean; };
      type B = { b: boolean; };
      assert((): true => true as TEq<DiffStruct<AB, B>, A>);
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
      type AD = { a: boolean; b: { c: boolean; d: boolean[]; e: undefined; f: undefined[]; g: boolean | undefined; h: Array<boolean | undefined>; }; _: { _: undefined; }; };
      assert((): true => true as TEq<DeepExtractProp<AD, boolean>, { a: boolean; b: { c: boolean; }; }>);
      assert((): true => true as TEq<DeepExtractProp<AD, boolean | boolean[]>, { a: boolean; b: { c: boolean; d: boolean[]; }; }>);
      assert((): true => true as TEq<DeepExtractProp<AD, boolean, AD['b']>, { a: boolean; }>);
      assert((): true => true as TEq<DeepExtractProp<{ a: never; b: void; }, never>, {}>);
      assert((): true => true as TEq<DeepExtractProp<{ a: never; b: void; }, void>, { b: void; }>);
    });

  });

  describe('ExcludeProp', () => {
    it('', () => {
      type AB = { a: boolean; b: boolean | undefined; };
      type A = { a: boolean; };
      assert((): true => true as TEq<ExcludeProp<AB, undefined>, A>);
      //assert((): true => true as TEq<ExcludeProp<AB, undefined | number>, A>);
      assert((): true => true as TEq<ExcludeProp<AB, never>, AB>);
      assert((): true => true as TEq<ExcludeProp<{ a: never; b: void; }, never>, { b: void; }>);
      assert((): true => true as TEq<ExcludeProp<{ a: never; b: void; }, void>, { a: never; }>);
    });

  });

  describe('DeepExcludeProp', () => {
    it('', () => {
      type AD = { a: boolean; b: { c: boolean; d: boolean[]; e: undefined; f: undefined[]; g: boolean | undefined; h: Array<boolean | undefined>; }; _: { _: undefined; }; };
      assert((): true => true as TEq<DeepExcludeProp<AD, undefined>, { a: boolean; b: { c: boolean; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<AD, undefined, boolean[]>, { a: boolean; b: { c: boolean; d: boolean[]; }; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: never; b: void; }, never>, { b: void; }>);
      assert((): true => true as TEq<DeepExcludeProp<{ a: never; b: void; }, void>, {}>);
    });

  });

  describe('Partial', () => {
    it('', () => {
      type R = { a: number[]; b: { c: string; }; d: () => 0; e: new () => object };
      type P = { a?: number[]; b?: { c: string; }; d?: () => 0; e?: new () => object };
      assert((): true => true as TEq<Partial<R>, P>);
      assert((): true => true as TEq<Partial<Required<R>>, P>);
    });

  });

  describe('DeepPartial', () => {
    it('', () => {
      type R = { a: number; b: { c: string[]; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string[]; d?: () => 0; e?: new () => object }; };
      assert((): true => true as TEq<DeepPartial<R>, P>);
      assert((): true => true as TEq<DeepPartial<DeepRequired<R>>, P>);
      assert((): true => true as TEq<DeepPartial<R, R['b']>, Partial<R>>);
    });

  });

  describe('Required', () => {
    it('', () => {
      type R = { a: number[]; b: { c?: string; }; d: () => 0; e: new () => object };
      type P = { a?: number[]; b?: { c?: string; }; d?: () => 0; e?: new () => object };
      assert((): true => true as TEq<Required<P>, R>);
      assert((): true => true as TEq<Required<Partial<R>>, R>);
    });

  });

  describe('DeepRequired', () => {
    it('', () => {
      type R = { a: number; b: { c: string[]; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string[]; d?: () => 0; e?: new () => object }; };
      assert((): true => true as TEq<DeepRequired<P>, R>);
      assert((): true => true as TEq<DeepRequired<DeepPartial<R>>, R>);
      assert((): true => true as TEq<DeepRequired<P, P['b']>, Required<P>>);
    });

  });

  describe('Readonly', () => {
    it('', () => {
      type I = { readonly a?: number[]; readonly b: { c: string; }; readonly d: () => 0; readonly e: new () => object };
      type M = { a?: number[]; b: { c: string; }; d: () => 0; e: new () => object };
      assert((): true => true as TEq<Readonly<M>, I>);
    });

  });

  describe('DeepReadonly', () => {
    it('', () => {
      type I = { readonly a?: number; readonly b: { readonly c: ReadonlyArray<string>; readonly d: () => 0; readonly e: new () => object }; };
      type M = { a?: number; b: { c: string[]; d: () => 0; e: new () => object }; };
      assert((): true => true as TEq<DeepReadonly<M>, I>);
      assert((): true => true as TEq<DeepReadonly<M, M['b']>, Readonly<M>>);
    });

  });

  describe('type', () => {
    it('primitive', () => {
      assert(type(undefined) === 'undefined');
      assert(type(true) === 'boolean');
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
