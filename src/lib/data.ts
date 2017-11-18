type Compose<T, U> = Pick<T & U, keyof T | keyof U>;
export type Diff<T, U> = Pick<T, DiffKey<keyof T, keyof U>>;
export type Overwrite<T, U> = Compose<{ [P in DiffKey<keyof T, keyof U>]: T[P]; }, U>;
type DiffKey<T extends string, U extends string> = (
  & { [P in T]: P; }
  & { [P in U]: never; }
  & { [x: string]: never; }
)[T];
