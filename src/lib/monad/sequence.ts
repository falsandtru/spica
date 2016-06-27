import {Sequence} from './sequence/core';
import from from './sequence/member/static/from';
import write from './sequence/member/static/write';
import random from './sequence/member/static/random';
import concat from './sequence/member/static/concat';
import zip from './sequence/member/static/zip';
import union from './sequence/member/static/union';
import intersect from './sequence/member/static/intersect';
import pure from './sequence/member/static/pure';
import Return from './sequence/member/static/return';
import mempty from './sequence/member/static/mempty';
import mconcat from './sequence/member/static/mconcat';
import mappend from './sequence/member/static/mappend';
import mzero from './sequence/member/static/mzero';
import mplus from './sequence/member/static/mplus';
import iterate from './sequence/member/instance/iterate';
import memoize from './sequence/member/instance/memoize';
import read from './sequence/member/instance/read';
import take from './sequence/member/instance/take';
import drop from './sequence/member/instance/drop';
import takeWhile from './sequence/member/instance/takeWhile';
import dropWhile from './sequence/member/instance/dropWhile';
import takeUntil from './sequence/member/instance/takeUntil';
import dropUntil from './sequence/member/instance/dropUntil';
import fmap from './sequence/member/instance/fmap';
import bind from './sequence/member/instance/bind';
import mapM from './sequence/member/instance/mapM';
import filterM from './sequence/member/instance/filterM';
import map from './sequence/member/instance/map';
import filter from './sequence/member/instance/filter';
import scan from './sequence/member/instance/scan';
import {compose} from '../compose';

compose(
  Sequence,
  from,
  write,
  random,
  concat,
  zip,
  union,
  intersect,
  pure,
  Return,
  mempty,
  mconcat,
  mappend,
  mzero,
  mplus,
  iterate,
  memoize,
  read,
  take,
  drop,
  takeWhile,
  dropWhile,
  takeUntil,
  dropUntil,
  fmap,
  bind,
  mapM,
  filterM,
  map,
  filter,
  scan
);

export {Sequence}
