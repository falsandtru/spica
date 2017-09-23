export function type(target: any): string {
  return (Object.prototype.toString.call(target) as string).split(' ').pop()!.slice(0, -1);
}
