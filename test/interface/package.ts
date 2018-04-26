import {
  Supervisor,
  Observation,
  Sequence,
  Cancellation,
  Maybe, Just, Nothing,
  Either, Left, Right,
  curry,
  uncurry,
  flip,
  tuple,
  NonEmptyList, Nil,
  NonEmptyHList, HNil,
  Future, Coroutine,
  cofetch,
  DataMap, AttrMap,
  Cache,
  tick,
  throttle, debounce,
  uuid,
  sqid,
  assign,
  clone,
  extend,
  concat,
  sort
} from '../../index';

describe('Interface: Package', function () {
  describe('Supervisor', function () {
    it('Supervisor', function () {
      assert(typeof Supervisor === 'function');
    });

  });

  describe('Observation', function () {
    it('Observation', function () {
      assert(typeof Observation === 'function');
    });

  });

  describe('Sequence', function () {
    it('Sequence', function () {
      assert(typeof Sequence === 'function');
    });

  });

  describe('Cancellation', function () {
    it('Cancellation', function () {
      assert(typeof Cancellation === 'function');
    });

  });

  describe('Maybe', function () {
    it('Maybe', function () {
      assert(typeof Maybe === 'object');
    });

    it('Return', function () {
      assert(typeof Maybe.Return === 'function');
    });

    it('Just', function () {
      assert(typeof Just === 'function');
    });

    it('Nothing', function () {
      assert(typeof Nothing === 'object');
    });

  });

  describe('Either', function () {
    it('Either', function () {
      assert(typeof Either === 'object');
    });

    it('Return', function () {
      assert(typeof Either.Return === 'function');
    });

    it('Left', function () {
      assert(typeof Left === 'function');
    });

    it('Right', function () {
      assert(typeof Right === 'function');
    });

  });

  describe('curry', function () {
    it('curry', function () {
      assert(typeof curry === 'function');
    });

    it('uncurry', function () {
      assert(typeof uncurry === 'function');
    });

    it('flip', function () {
      assert(typeof flip === 'function');
    });

    it('tuple', function () {
      assert(typeof tuple === 'function');
    });

  });

  describe('List', function () {
    it('List', function () {
      <NonEmptyList<number, Nil>>new Nil().push(0);
    });

  });

  describe('HList', function () {
    it('HList', function () {
      <NonEmptyHList<number, HNil>>new HNil().push(0);
    });

  });

  describe('Future', function () {
    it('Future', function () {
      assert(typeof Future === 'function');
    });

  });

  describe('Coroutine', function () {
    it('Coroutine', function () {
      assert(typeof Coroutine === 'function');
    });

    it('cofetch', function () {
      assert(typeof cofetch === 'function');
    });

  });

  describe('Collection', function () {
    it('DataMap', function () {
      assert(typeof DataMap === 'function');
    });

    it('AttrMap', function () {
      assert(typeof AttrMap === 'function');
    });

  });

  describe('Cache', function () {
    it('Cache', function () {
      assert(typeof Cache === 'function');
    });

  });

  describe('utils', function () {
    it('tick', function () {
      assert(typeof tick === 'function');
    });

    it('throttle', function () {
      assert(typeof throttle === 'function');
    });

    it('debounce', function () {
      assert(typeof debounce === 'function');
    });

    it('uuid', function () {
      assert(typeof uuid === 'function');
    });

    it('sqid', function () {
      assert(typeof sqid === 'function');
    });

    it('assign', function () {
      assert(typeof assign === 'function');
    });

    it('clone', function () {
      assert(typeof clone === 'function');
    });

    it('extend', function () {
      assert(typeof extend === 'function');
    });

    it('concat', function () {
      assert(typeof concat === 'function');
    });

    it('sort', function () {
      assert(typeof sort === 'function');
    });

  });

});
