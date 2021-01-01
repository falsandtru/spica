import { hasOwnProperty } from './alias';

describe('Unit: lib/alias', function () {
  describe('hasOwnProperty', function () {
    it('', () => {
      assert(hasOwnProperty(Object.assign({}, { 0: 0 }), '') === false);
      assert(hasOwnProperty(Object.assign({}, { 0: 0 }), '0'));
      assert(hasOwnProperty(Object.assign({}, { 0: 0 }), 'toString') === false);
      assert(hasOwnProperty(Object.assign(Object.create({}), { 0: 0 }), '') === false);
      assert(hasOwnProperty(Object.assign(Object.create({}), { 0: 0 }), '0'));
      assert(hasOwnProperty(Object.assign(Object.create({ 0: 0 }), {}), '0') === false);
      assert(hasOwnProperty(Object.assign(Object.create({ 0: 0 }), { 0: 0 }), '0'));
      assert(hasOwnProperty(Object.assign(Object.create(null), { 0: 0 }), '') === false);
      assert(hasOwnProperty(Object.assign(Object.create(null), { 0: 0 }), '0'));
    });

  });

});

