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
            assert.deepStrictEqual(buf, [1, 2, 3]);
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

  if (!navigator.userAgent.includes('Chrome')) return;

  describe('cothrottle', function () {
    it('', async () => {
      let since = Date.now();
      for await (const count of cothrottle(async function* (count = 0) {
        since = Date.now();
        await wait(100);
        yield ++count;
      }, 200, () => wait(150))()) {
        switch (count) {
          case 1:
            assert(Date.now() - since >= 100);
            continue;
          case 2:
            assert(Date.now() - since >= 100);
            continue;
          case 3:
            assert(Date.now() - since >= 350);
            continue;
          case 4:
            assert(Date.now() - since >= 100);
            return;
        }
      }
    });
  });

});
