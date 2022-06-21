import { throttle, debounce, cothrottle } from './throttle';
import { wait } from './timer';

describe('Unit: lib/throttle', () => {
  describe('throttle', () => {
    it('', (done) => {
      let step = 0;
      const call = throttle<number>(100, (last, buf) => {
        switch (step) {
          case 1:
            assert(count === 2);
            assert(last === 2);
            assert.deepStrictEqual(buf, [2, 1]);
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
        return false;
      }, 3);
      let count = 0;
      step = 1;
      call(++count);
      call(++count);
    });
  });

  describe('debounce', () => {
    it('', (done) => {
      let step = 0;
      const call = debounce<number>(100, (last, buf) => {
        switch (step) {
          case 1:
            assert(count === 3);
            assert(last === 3);
            assert.deepStrictEqual(buf, [3, 2, 1]);
            done();
            break;
          default:
            throw step;
        }
        return false;
      }, 3);
      let count = 0;
      step = 1;
      setTimeout(() => call(++count), 100);
      setTimeout(() => call(++count), 200);
      call(++count);
    });
  });

  describe('cothrottle', () => {
    it('', async () => {
      const since = Date.now();
      for await (const count of cothrottle(async function* (count = 0) {
        await wait(50);
        yield ++count;
      }, 100, () => wait(100))()) {
        switch (count) {
          case 1:
            assert(Date.now() - since >= 50);
            continue;
          case 2:
            assert(Date.now() - since >= 100);
            continue;
          case 3:
            assert(Date.now() - since >= 200);
            continue;
          case 4:
            assert(Date.now() - since >= 250);
            return;
        }
      }
    });
  });

});
