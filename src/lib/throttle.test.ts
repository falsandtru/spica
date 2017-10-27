import { throttle } from './throttle';

describe('Unit: lib/throttle', () => {
  describe('throttle', () => {
    it('', (done) => {
      let step = 0;
      const call = throttle<number>(100, (last, buf) => {
        switch (step) {
          case 1:
            assert(count === 2);
            assert(last === 2);
            assert.deepStrictEqual(buf, [1, 2]);
            step = 2;
            call(++count);
            break;
          case 2:
            assert(count === 3);
            assert(last === 3);
            assert.deepStrictEqual(buf, [3]);
            done();
            break;
          default:
            throw step;
        }
      });
      let count = 0;
      step = 1;
      call(++count);
      call(++count);
    }); 
  });

});
