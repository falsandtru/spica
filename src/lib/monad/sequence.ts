import {Sequence} from './sequence/core';
import from from './sequence/member/static/from';
import write from './sequence/member/static/write';
import random from './sequence/member/static/random';
import zip from './sequence/member/static/zip';
import union from './sequence/member/static/union';
import intersect from './sequence/member/static/intersect';
import iterate from './sequence/member/instance/iterate';
import memoize from './sequence/member/instance/memoize';
import read from './sequence/member/instance/read';
import take from './sequence/member/instance/take';
import drop from './sequence/member/instance/drop';
import takeWhile from './sequence/member/instance/takeWhile';
import dropWhile from './sequence/member/instance/dropWhile';
import until from './sequence/member/instance/until';
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
  zip,
  union,
  intersect,
  iterate,
  memoize,
  read,
  take,
  drop,
  takeWhile,
  dropWhile,
  until,
  fmap,
  bind,
  mapM,
  filterM,
  map,
  filter,
  scan
);

export {Sequence}
