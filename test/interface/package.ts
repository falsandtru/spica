import {
  Supervisor, SupervisorSettings,
  Observable,
  Maybe, Just, Nothing,
  Either, Left, Right,
  Map, DataMap, WeakMap, AttrMap, RelationMap,
  Set, DataSet, WeakSet, AttrSet, RelationSet,
  Tick,
  FINGERPRINT,
  uuid,
  sqid,
  assign,
  clone,
  extend,
  concat
} from 'spica';

describe('Interface: Package', function () {
  describe('Supervisor', function () {
    it('Supervisor', function () {
      assert(typeof Supervisor === 'function');
    });

  });

  describe('Observable', function () {
    it('Observable', function () {
      assert(typeof Observable === 'function');
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
      assert(Maybe.Just === Just);
    });

    it('Nothing', function () {
      assert(typeof Nothing === 'object');
      assert(Maybe.Nothing === Nothing);
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
      assert(Either.Left === Left);
    });

    it('Right', function () {
      assert(typeof Right === 'function');
      assert(Either.Right === Right);
    });

  });

  describe('Map', function () {
    it('Map', function () {
      assert(typeof Map === 'function');
    });

    it('DataMap', function () {
      assert(typeof DataMap === 'function');
    });

    it('WeakMap', function () {
      assert(typeof WeakMap === 'function');
    });

    it('AttrMap', function () {
      assert(typeof AttrMap === 'function');
    });

    it('RelationMap', function () {
      assert(typeof RelationMap === 'function');
    });

  });

  describe('Set', function () {
    it('Set', function () {
      assert(typeof Set === 'function');
    });

    it('DataSet', function () {
      assert(typeof DataSet === 'function');
    });

    it('WeakSet', function () {
      assert(typeof WeakSet === 'function');
    });

    it('AttrSet', function () {
      assert(typeof AttrSet === 'function');
    });

    it('RelationSet', function () {
      assert(typeof RelationSet === 'function');
    });

  });

  describe('Tick', function () {
    it('Tick', function () {
      assert(typeof Tick === 'function');
    });

  });

  describe('utils', function () {
    it('FINGERPRINT', function () {
      assert(typeof FINGERPRINT === 'number');
      assert(!isNaN(FINGERPRINT));
      assert(FINGERPRINT === parseInt(FINGERPRINT.toString()));
      assert(0 < FINGERPRINT && FINGERPRINT < 1e15);
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

  });

  describe('power-assert', function () {
    it('assertion self-check', function (done) {
      setTimeout(function () {
        try {
          console.log(assert(false === true), assert); // LOG: undefined, function powerAssert() { ... }
        }
        catch (e) {
          done();
          return;
        }
        throw new Error('WARNING!: assert function does not work.');
      }, 1);
    });

  });

});
