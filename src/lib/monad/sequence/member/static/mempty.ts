import {Sequence} from '../../core';

export default class <T, S> extends Sequence<T, S> {
  public static mempty: Sequence<any, any> = new Sequence((_, cons) => cons());
}
