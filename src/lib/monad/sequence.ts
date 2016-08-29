import {Sequence} from './sequence/core';
import resume from './sequence/member/static/resume';
import from from './sequence/member/static/from';
import read from './sequence/member/static/read';
import cycle from './sequence/member/static/cycle';
import random from './sequence/member/static/random';
import concat from './sequence/member/static/concat';
import zip from './sequence/member/static/zip';
import difference from './sequence/member/static/difference';
import union from './sequence/member/static/union';
import intersect from './sequence/member/static/intersect';
import pure from './sequence/member/static/pure';
import Return from './sequence/member/static/return';
import mempty from './sequence/member/static/mempty';
import mconcat from './sequence/member/static/mconcat';
import mappend from './sequence/member/static/mappend';
import mzero from './sequence/member/static/mzero';
import mplus from './sequence/member/static/mplus';
import extract from './sequence/member/instance/extract';
import iterate from './sequence/member/instance/iterate';
import memoize from './sequence/member/instance/memoize';
import take from './sequence/member/instance/take';
import drop from './sequence/member/instance/drop';
import takeWhile from './sequence/member/instance/takeWhile';
import dropWhile from './sequence/member/instance/dropWhile';
import takeUntil from './sequence/member/instance/takeUntil';
import dropUntil from './sequence/member/instance/dropUntil';
import fmap from './sequence/member/instance/fmap';
import ap from './sequence/member/instance/ap';
import bind from './sequence/member/instance/bind';
import mapM from './sequence/member/instance/mapM';
import filterM from './sequence/member/instance/filterM';
import map from './sequence/member/instance/map';
import filter from './sequence/member/instance/filter';
import scan from './sequence/member/instance/scan';
import fold from './sequence/member/instance/fold';
import group from './sequence/member/instance/group';
import subsequences from './sequence/member/instance/subsequences';
import permutations from './sequence/member/instance/permutations';
import {compose} from '../compose';

compose(
  Sequence,
  resume,
  from,
  read,
  cycle,
  random,
  concat,
  zip,
  difference,
  union,
  intersect,
  pure,
  Return,
  mempty,
  mconcat,
  mappend,
  mzero,
  mplus,
  extract,
  iterate,
  memoize,
  take,
  drop,
  takeWhile,
  dropWhile,
  takeUntil,
  dropUntil,
  fmap,
  ap,
  bind,
  mapM,
  filterM,
  map,
  filter,
  scan,
  fold,
  group,
  subsequences,
  permutations
);

export {Sequence}
