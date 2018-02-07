import {
  Not, And, Or, Eq, If, Case, DEq,
  Type, Call, New, NonNullable, DiffProps, FilterProps, OverwriteProps,
  Partial, DeepPartial, Required, DeepRequired, Readonly, DeepReadonly,
  type
} from './type';

describe('Unit: lib/type', () => {
  describe('Not', () => {
    it('', () => {
      assert((): false => true as Not<true>);
      assert((): true => true as Not<false>);
    });

  });

  describe('And', () => {
    it('', () => {
      assert((): true => true as And<true, true>);
      assert((): false => true as And<true, false>);
      assert((): false => true as And<false, true>);
      assert((): false => true as And<false, false>);
      assert((): undefined => undefined as And<true, undefined>);
      assert((): undefined => undefined as And<undefined, true>);
      assert((): 0 => 0 as And<0, true>);
      assert((): '' => '' as And<'', true>);
      assert((): null => null as And<null, true>);
      assert((): void => undefined as And<void, true>);
    });

  });

  describe('Or', () => {
    it('', () => {
      assert((): true => true as Or<true, true>);
      assert((): true => true as Or<true, false>);
      assert((): true => true as Or<false, true>);
      assert((): false => true as Or<false, false>);
    });

  });

  describe('Eq', () => {
    it('', () => {
      assert((): true => true as Eq<true, true>);
      assert((): false => true as Eq<true, false>);
      assert((): false => true as Eq<false, true>);
      assert((): true => true as Eq<false, false>);
      assert((): Eq<true, boolean> => true as boolean);
      assert((): Eq<false, boolean> => true as boolean);
      assert((): Eq<boolean, true> => true as boolean);
      assert((): Eq<boolean, false> => true as boolean);
      assert((): Eq<boolean, boolean> => true as boolean);
      assert((): true => true as Eq<0, 0>);
      assert((): false => true as Eq<0, number>);
      assert((): true => true as Eq<number, number>);
      assert((): true => true as Eq<undefined, undefined>);
      assert((): false => true as Eq<void, undefined>);
      assert((): false => true as Eq<void, null>);
      assert((): false => true as Eq<void, undefined | null>);
      assert((): true => true as Eq<void, void>);
    });

  });

  describe('If', () => {
    it('', () => {
      assert((): 1 => 0 as If<true | 1, 1, 0>);
      assert((): 0 => 0 as If<false | 0, 1, 0>);
    });

  });

  describe('Case', () => {
    it('', () => {
      assert((): 1 => 0 as Case<'0', [1]>);
      assert((): 1 => 0 as Case<'0', { 0: 1 }>);
      assert((): number => 0 as Case<'1', { 0: 1, [otherwise: string]: number }>);
    });

  });

  describe('DEq', () => {
    it('', () => {
      assert((): true => true as DEq<true, true>);
      assert((): false => true as DEq<true, false>);
      assert((): false => true as DEq<false, true>);
      assert((): true => true as DEq<false, false>);
      assert((): false => true as DEq<true, boolean>);
      assert((): false => true as DEq<false, boolean>);
      assert((): false => true as DEq<boolean, true>);
      assert((): false => true as DEq<boolean, false>);
      assert((): true => true as DEq<boolean, boolean>);
    });

  });

  describe('Type', () => {
    it('', () => {
      assert((): 'undefined' => '' as Type<undefined>);
      assert((): 'boolean' => '' as Type<boolean>);
      assert((): 'number' => '' as Type<number>);
      assert((): 'string' => '' as Type<string>);
      assert((): 'symbol' => '' as Type<symbol>);
      assert((): 'function' => '' as Type<() => void>);
      assert((): 'function' => '' as Type<(arg: any) => void>);
      assert((): 'function' => '' as Type<(...args: any[]) => void>);
      assert((): 'object' => '' as Type<any[]>);
      assert((): 'object' => '' as Type<object>);
      assert((): 'object' => '' as Type<null>);
    });

  });

  describe('Call', () => {
    it('', () => {
      assert((): number => 0 as Call<() => number>);
      assert((): number => 0 as Call<(arg: any) => number>);
      assert((): number => 0 as Call<(...args: any[]) => number>);
    });

  });

  describe('New', () => {
    it('', () => {
      assert((): Array<any> => ({}) as New<typeof Array>);
    });

  });

  describe('NonNullable', () => {
    it('', () => {
      assert((): number => 0 as NonNullable<number | undefined>);
      assert((): NonNullable<number | undefined> => 0);
      assert((): number => 0 as NonNullable<number | null>);
      assert((): NonNullable<number | null> => 0);
    });

  });

  describe('DiffProps', () => {
    it('', () => {
      type AB = { a: void; b: void; };
      type A = { a: void; };
      type B = { b: void; };
      assert((): DiffProps<AB, B> => ({}) as A);
      assert((): A => ({}) as DiffProps<AB, B>);
    });

  });

  describe('FilterProps', () => {
    it('', () => {
      type AB = { a: void; b: void; };
      type A = { a: void; };
      assert((): FilterProps<AB, A> => ({}) as A);
      assert((): A => ({}) as FilterProps<AB, A>);
    });

  });

  describe('OverwriteProps', () => {
    it('', () => {
      type AB = { a: void; b: void; };
      type B = { b: number; };
      type Expected = { a: void; b: number; };
      assert((): OverwriteProps<AB, B> => ({}) as Expected);
      assert((): Expected => ({}) as OverwriteProps<AB, B>);
    });

  });

  describe('Partial', () => {
    it('', () => {
      type R = { a: number; b: { c: string; }; d: () => 0; e: new () => object };
      type P = { a?: number; b?: { c: string; }; d?: () => 0; e?: new () => object };
      assert((): P => ({}) as Partial<R>);
      assert((): Partial<R> => ({}) as P);
      assert((): P => ({}) as Partial<Required<R>>);
      assert((): Partial<Required<R>> => ({}) as P);
    });

  });

  describe('DeepPartial', () => {
    it('', () => {
      type R = { a: number; b: { c: string; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string; d?: () => 0; e?: new () => object }; };
      assert((): P => ({}) as DeepPartial<R>);
      assert((): DeepPartial<R> => ({}) as P);
      assert((): P => ({}) as DeepPartial<R>);
      assert((): DeepPartial<R> => ({}) as P);
      assert((): Partial<R> => ({}) as DeepPartial<R, R['b']>);
      assert((): DeepPartial<R, R['b']> => ({}) as Required<R>);
    });

  });

  describe('Required', () => {
    it('', () => {
      type R = { a: number; b: { c?: string; }; d: () => 0; e: new () => object };
      type P = { a?: number; b?: { c?: string; }; d?: () => 0; e?: new () => object };
      assert((): R => ({}) as Required<P>);
      assert((): Required<P> => ({}) as R);
      assert((): R => ({}) as Required<Partial<R>>);
      assert((): Required<Partial<R>> => ({}) as R);
    });

  });

  describe('DeepRequired', () => {
    it('', () => {
      type R = { a: number; b: { c: string; d: () => 0; e: new () => object }; };
      type P = { a?: number; b?: { c?: string; d?: () => 0; e?: new () => object }; };
      assert((): R => ({}) as DeepRequired<P>);
      assert((): DeepRequired<P> => ({}) as R);
      assert((): R => ({}) as DeepRequired<DeepPartial<R>>);
      assert((): DeepRequired<DeepPartial<R>> => ({}) as R);
      assert((): Required<P> => ({}) as DeepRequired<P, P['b']>);
      assert((): DeepRequired<P, P['b']> => ({}) as Required<P>);
    });

  });

  describe('Readonly', () => {
    it('', () => {
      type I = { readonly a?: number; readonly b: { c: string; }; readonly d: () => 0; readonly e: new () => object };
      type M = { a?: number; b: { c: string; }; d: () => 0; e: new () => object };
      assert((): I => ({}) as Readonly<M>);
      assert((): Readonly<M> => ({}) as I);
    });

  });

  describe('DeepReadonly', () => {
    it('', () => {
      type I = { readonly a?: number; readonly b: { readonly c: string; readonly d: () => 0; readonly e: new () => object }; };
      type M = { a?: number; b: { c: string; d: () => 0; e: new () => object }; };
      assert((): I => ({}) as DeepReadonly<M>);
      assert((): DeepReadonly<M> => ({}) as I);
      assert((): Readonly<M> => ({}) as DeepReadonly<M, M['b']>);
      assert((): DeepReadonly<M, M['b']> => ({}) as Readonly<M>);
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
