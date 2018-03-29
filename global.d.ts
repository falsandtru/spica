declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare var console: Console;
interface Console {
  assert(value: any, message?: string, ...optionalParams: any[]): void;
  dir(obj: any, options?: { showHidden?: boolean, depth?: number, colors?: boolean }): void;
  error(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  log(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  time(label: string): void;
  timeEnd(label: string): void;
  trace(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}
