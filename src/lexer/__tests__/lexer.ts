import { tokenize } from '../index';
import { Tokens } from './fixtures';

import { Token } from '../types';

describe('Lexer', () => {
  it('should tokenize given input correctly (1)', () => {
    const actual = tokenize('=+(){},;');

    Tokens.NonLetter.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

  it('should tokenize given input correctly (2)', () => {
    const actual = tokenize(`
      let five = 5;
      let ten = 10;
      let add = fn(x, y) {
        x + y;
      };
      let _result = add(five, ten);
    `);

    Tokens.Statements.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

  it('should tokenize given input correctly (3)', () => {
    const actual = tokenize('! - / * < >');

    Tokens.Operators.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

  it('should tokenize given input correctly (4)', () => {
    const actual = tokenize('true false if else return');

    Tokens.Keywords.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

  it('should tokenize given input correctly (5)', () => {
    const actual = tokenize(`
      10 == 10;
      10 != 9;
    `);

    Tokens.StickyOperators.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

  it('should tokenize given input correctly (6)', () => {
    const actual = tokenize('!5;!true;!!true;');

    Tokens.PrefixOperator.forEach((item, index) => {
      expect(actual[index]).toEqual(item);
    });
  });

});
