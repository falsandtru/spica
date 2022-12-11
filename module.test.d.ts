declare module 'zipfian-integer' {
  export default function (
    min: number,
    max: number,
    skew: number,
    rng?: () => number,
  ): () => number;
}
