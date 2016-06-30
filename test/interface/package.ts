import {
  Supervisor, SupervisorSettings,
  Observable,
  Sequence,
  Cancelable,
  Maybe, Just, Nothing,
  Either, Left, Right,
  curry,
  flip,
  DataMap, AttrMap, RelationMap,
  Mixin,
  Tick,
  FINGERPRINT,
  uuid,
  sqid,
  assign,
  clone,
  extend,
  concat,
  sort
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

  describe('Sequence', function () {
    it('Sequence', function () {
      assert(typeof Sequence === 'function');
    });

  });

  describe('Cancelable', function () {
    it('Cancelable', function () {
      assert(typeof Cancelable === 'function');
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

    it('flip', function () {
      assert(typeof flip === 'function');
    });

  });

  describe('Map', function () {
    it('DataMap', function () {
      assert(typeof DataMap === 'function');
    });

    it('AttrMap', function () {
      assert(typeof AttrMap === 'function');
    });

    it('RelationMap', function () {
      assert(typeof RelationMap === 'function');
    });

  });

  describe('Mixin', function () {
    it('Mixin', function () {
      assert(typeof Mixin === 'function');
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

    it('sort', function () {
      assert(typeof sort === 'function');
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
