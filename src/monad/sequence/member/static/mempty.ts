import { Sequence } from '../../core';

export default class <a, z> extends Sequence<a, z> {
  public static mempty: Sequence<never, never> = new Sequence((_, cons) => cons());
}
