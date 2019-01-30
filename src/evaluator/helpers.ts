import { Object, ObjectKind } from './types';
import { ExpressionValue } from '../parser/ast/types';

export function createObject(kind: ObjectKind, value: ExpressionValue = 0): Object {
  switch (kind) {
    case ObjectKind.Integer:
      return {
        kind: ObjectKind.Integer,
        value
      };
    default:
      return {
        kind: ObjectKind.Null
      };
  }
}
