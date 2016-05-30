export function type(target: any): string {
  return (<string>Object.prototype.toString.call(target)).split(' ').pop().slice(0, -1);
}
