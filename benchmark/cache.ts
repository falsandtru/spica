import { benchmark } from './benchmark';
import { Cache } from '../';
import LRUCache from 'lru-cache';

describe('Benchmark:', function () {
  this.timeout(10 * 1e3);

  describe('Cache', function () {
    it('new', function (done) {
      benchmark('Cache new', () => new Cache(1000), done);
    });

    it('put 10 100% LRU', function (done) {
      const capacity = 10;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache put 10 100%', () => cache.set(++i % capacity, 0), done);
    });

    it('put 10 0% LRU', function (done) {
      const capacity = 10;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache put 10 0%', () => cache.set(-1, 0), done);
    });

    it('put 10 100%', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache put 10 100%', () => cache.put(++i % capacity, 0), done);
    });

    it('put 10 0%', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache put 10 0%', () => cache.put(-1, 0), done);
    });

    it('put 100 100% LRU', function (done) {
      const capacity = 100;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache put 100 100%', () => cache.set(++i % capacity, 0), done);
    });

    it('put 100 0% LRU', function (done) {
      const capacity = 100;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache put 100 0%', () => cache.set(-1, 0), done);
    });

    it('put 100 100%', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache put 100 100%', () => cache.put(++i % capacity, 0), done);
    });

    it('put 100 0%', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache put 100 0%', () => cache.put(-1, 0), done);
    });

    it('put 1,000 100% LRU', function (done) {
      const capacity = 1000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache put 1,000 100%', () => cache.set(++i % capacity, 0), done);
    });

    it('put 1,000 0% LRU', function (done) {
      const capacity = 1000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache put 1,000 0%', () => cache.set(-1, 0), done);
    });

    it('put 1,000 100%', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache put 1,000 100%', () => cache.put(++i % capacity, 0), done);
    });

    it('put 1,000 0%', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache put 1,000 0%', () => cache.put(-1, 0), done);
    });

    it('put 10,000 100% LRU', function (done) {
      const capacity = 10000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache put 10,000 100%', () => cache.set(++i % capacity, 0), done);
    });

    it('put 10,000 0% LRU', function (done) {
      const capacity = 10000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache put 10,000 0%', () => cache.set(-1, 0), done);
    });

    it('put 10,000 100%', function (done) {
      const capacity = 10000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache put 10,000 100%', () => cache.put(++i % capacity, 0), done);
    });

    it('put 10,000 0%', function (done) {
      const capacity = 10000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache put 10,000 0%', () => cache.put(-1, 0), done);
    });

    it('get 10 100% LRU', function (done) {
      const capacity = 10;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache get 10 100%', () => cache.get(++i % capacity), done);
    });

    it('get 10 0% LRU', function (done) {
      const capacity = 10;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache get 10 0%', () => cache.get(-1), done);
    });

    it('get 10 100%', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 10 100%', () => cache.get(++i % capacity), done);
    });

    it('get 10 0%', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache get 10 0%', () => cache.get(-1), done);
    });

    it('get 100 100% LRU', function (done) {
      const capacity = 100;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache get 100 100%', () => cache.get(++i % capacity), done);
    });

    it('get 100 0% LRU', function (done) {
      const capacity = 100;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache get 100 0%', () => cache.get(-1), done);
    });

    it('get 100 100%', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 100 100%', () => cache.get(++i % capacity), done);
    });

    it('get 100 0%', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache get 100 0%', () => cache.get(-1), done);
    });

    it('get 1,000 100% LRU', function (done) {
      const capacity = 1000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache get 1,000 100%', () => cache.get(++i % capacity), done);
    });

    it('get 1,000 0% LRU', function (done) {
      const capacity = 1000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache get 1,000 0%', () => cache.get(-1), done);
    });

    it('get 1,000 100%', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 1,000 100%', () => cache.get(++i % capacity), done);
    });

    it('get 1,000 0%', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache get 1,000 0%', () => cache.get(-1), done);
    });

    it('get 10,000 100% LRU', function (done) {
      const capacity = 10000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      let i = 0;
      benchmark('LRUCache get 10,000 100%', () => cache.get(++i % capacity), done);
    });

    it('get 10,000 0% LRU', function (done) {
      const capacity = 10000;
      const cache = new LRUCache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.set(i, i);
      benchmark('LRUCache get 10,000 0%', () => cache.get(-1), done);
    });

    it('get 10,000 100%', function (done) {
      const capacity = 10000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      let i = 0;
      benchmark('Cache get 10,000 100%', () => cache.get(++i % capacity), done);
    });

    it('get 10,000 0%', function (done) {
      const capacity = 10000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache get 10,000 0%', () => cache.get(-1), done);
    });

    it('has 10 0%', function (done) {
      const capacity = 10;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache has 10 0%', () => cache.has(-1), done);
    });

    it('has 100 0%', function (done) {
      const capacity = 100;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache has 100 0%', () => cache.has(-1), done);
    });

    it('has 1,000 0%', function (done) {
      const capacity = 1000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache has 1,000 0%', () => cache.has(-1), done);
    });

    it('has 10,000 0%', function (done) {
      const capacity = 10000;
      const cache = new Cache<number, number>(capacity);
      for (let i = 0; i < capacity; ++i) cache.put(i, i);
      benchmark('Cache has 10,000 0%', () => cache.has(-1), done);
    });

  });

});
