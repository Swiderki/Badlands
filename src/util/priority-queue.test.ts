/* eslint-disable no-undef */
import PriorityQueue from './priority-queue';

describe('PriorityQueue', () => {
    let queue: PriorityQueue<number>;

    beforeEach(() => {
        queue = new PriorityQueue<number>((a, b) => a - b);
    });

    it('should enqueue elements with priorities', () => {
        queue.enqueue(10, 2);
        queue.enqueue(20, 1);
        expect(queue.isEmpty()).toBe(false);
    });

    it('should dequeue elements in priority order', () => {
        queue.enqueue(10, 2);
        queue.enqueue(20, 1);
        expect(queue.dequeue()).toBe(20);
        expect(queue.dequeue()).toBe(10);
    });

    it('should throw an error when dequeue is called on an empty queue', () => {
        expect(() => queue.dequeue()).toThrowError('PriorityQueue is empty');
    });

    it('should handle multiple enqueue and dequeue operations', () => {
        queue.enqueue(10, 3);
        queue.enqueue(20, 1);
        queue.enqueue(30, 2);
        expect(queue.dequeue()).toBe(20);
        expect(queue.dequeue()).toBe(30);
        expect(queue.dequeue()).toBe(10);
    });

    it('should return true for isEmpty when the queue is empty', () => {
        expect(queue.isEmpty()).toBe(true);
    });

    it('should return false for isEmpty when the queue has elements', () => {
        queue.enqueue(10, 1);
        expect(queue.isEmpty()).toBe(false);
    });

    it('should maintain the correct order after multiple enqueue and dequeue operations', () => {
        queue.enqueue(10, 5);
        queue.enqueue(20, 1);
        queue.enqueue(30, 3);
        queue.dequeue();
        queue.enqueue(40, 2);
        expect(queue.dequeue()).toBe(40);
        expect(queue.dequeue()).toBe(30);
        expect(queue.dequeue()).toBe(10);
    });
});