import { Token, TokenKind } from '../../lexer/types';
import { Expression, ExpressionValue } from '../ast/types';
import {
  AssertionResult,
  ExpressionParseResult,
  Precedence
} from '../types';

import {
  createAssertionResult,
  createExpression,
  determineOperatorPrecedence,
  isLeftParenthesisToken,
  isPrefixToken,
  isRightParenthesisToken
} from './helpers';

export function assertExpression(): AssertionResult {
  return createAssertionResult();
}

export function parseStatementExpression(tokens: Token[]): Expression {
  let cursor = 0;

  return parseExpression(tokens, cursor, Precedence.Lowest).expression;
}

function parseExpression(tokens: Token[], cursor: number, precedence: Precedence): ExpressionParseResult {
  let leftExpressionParseResult = parsePrefixExpression(tokens, cursor);
  let nextPrecedence = leftExpressionParseResult.nextPrecedence;

  cursor = leftExpressionParseResult.cursor;

  while (cursor < tokens.length && precedence < nextPrecedence) {
    leftExpressionParseResult = parseInfixExpression(tokens, leftExpressionParseResult.cursor, leftExpressionParseResult.expression);
    nextPrecedence = leftExpressionParseResult.nextPrecedence;
    cursor = leftExpressionParseResult.cursor;
  }

  return leftExpressionParseResult;
}

function parseGroupedExpression(tokens: Token[], cursor: number): ExpressionParseResult {
  let expressionParseResult = parseExpression(tokens, cursor, Precedence.Lowest);
  let nextToken = tokens[expressionParseResult.cursor];
  let index = 0;

  while (nextToken && isRightParenthesisToken(nextToken)) {
    index++;
    nextToken = tokens[expressionParseResult.cursor + index];
  }

  expressionParseResult.cursor = expressionParseResult.cursor + index;
  expressionParseResult.nextPrecedence = determineOperatorPrecedence(nextToken);

  return expressionParseResult;
}

function parseInfixExpression(tokens: Token[], cursor: number, left: Expression): ExpressionParseResult {
  let operator = tokens[cursor];
  let currentPrecedence = determineOperatorPrecedence(operator);

  let rightExpressionParseResult = parseExpression(tokens, cursor + 1, currentPrecedence);

  let expression = createExpression(left.tokens.concat([operator]).concat(rightExpressionParseResult.expression.tokens));
  expression.left = left;
  expression.operator = operator;
  expression.right = rightExpressionParseResult.expression;

  return {
    expression,
    cursor: rightExpressionParseResult.cursor,
    nextPrecedence: rightExpressionParseResult.nextPrecedence
  };
}

function parsePrefixExpression(tokens: Token[], cursor: number): ExpressionParseResult {
  let currentToken = tokens[cursor];
  let nextToken = tokens[cursor + 1];

  let expression;
  let nextCursor;
  let nextPrecedence;

  if (isLeftParenthesisToken(currentToken)) {
    let groupedExpressionParseResult = parseGroupedExpression(tokens, cursor + 1);
    expression = groupedExpressionParseResult.expression;
    nextCursor = groupedExpressionParseResult.cursor;
    nextPrecedence = groupedExpressionParseResult.nextPrecedence;
  } else if (!isPrefixToken(currentToken)) {
    expression = createExpression([currentToken]);
    expression.value = parseExpressionValue(currentToken);
    nextCursor = cursor + 1;
    nextPrecedence = determineOperatorPrecedence(nextToken);
  } else {
    let left = createExpression([currentToken]);
    left.operator = currentToken;

    let prefixExpressionParseResult = parseExpression(tokens, cursor + 1, Precedence.Prefix);
    expression = createExpression([currentToken].concat(prefixExpressionParseResult.expression.tokens));
    expression.left = left;
    expression.right = prefixExpressionParseResult.expression;

    nextCursor = prefixExpressionParseResult.cursor;
    nextPrecedence = prefixExpressionParseResult.nextPrecedence;
  }

  return {
    expression,
    cursor: nextCursor,
    nextPrecedence
  };
}

function parseExpressionValue(token: Token): ExpressionValue {
  switch (token.kind) {
    case TokenKind.Int:
      return parseInt(token.literal, 10);
    case TokenKind.True:
    case TokenKind.False:
      return token.kind === TokenKind.True ? true : false;
    default:
      return token.literal;
  }
}
