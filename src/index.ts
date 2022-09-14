import { Stack } from './stack';

export class Index {
  private readonly stack = new Stack<number>();
  private $length = 0;
  public get length(): number {
    return this.$length;
  }
  public push(index: number): void {
    this.stack.push(index);
    --this.$length;
  }
  public pop(): number {
    const index = this.stack.pop() ?? this.$length;
    ++this.$length;
    return index;
  }
  public clear(): void {
    this.stack.clear();
    this.$length = 0;
  }
}
