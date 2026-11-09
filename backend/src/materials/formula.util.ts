/**
 * Safe arithmetic formula evaluator for BOM quantity / cut-length rules.
 *
 * Supports: numbers, + - * / , parentheses, unary minus, the variables
 * listed in FORMULA_VARIABLES and the functions min, max, ceil, floor, round.
 * Never uses eval() — formulas are entered by admins and stored in the DB.
 */

export const FORMULA_VARIABLES = {
  W: 'Overall width (inches)',
  H: 'Overall height (inches)',
  P: 'Number of panels / sashes / leaves',
  MV: 'Extra vertical bars (mullions) from the design',
  TR: 'Extra horizontal bars (transoms) from the design',
} as const;

export type FormulaVariable = keyof typeof FORMULA_VARIABLES;
export type FormulaScope = Record<FormulaVariable, number>;

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  ceil: (value) => Math.ceil(value),
  floor: (value) => Math.floor(value),
  round: (value) => Math.round(value),
};

type Token =
  | { type: 'number'; value: number }
  | { type: 'identifier'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma' };

type Node =
  | { kind: 'number'; value: number }
  | { kind: 'variable'; name: FormulaVariable }
  | { kind: 'unary'; operand: Node }
  | { kind: 'binary'; operator: '+' | '-' | '*' | '/'; left: Node; right: Node }
  | { kind: 'call'; name: string; args: Node[] };

export class FormulaError extends Error {}

const MAX_FORMULA_LENGTH = 200;

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];

    if (/\s/.test(char)) {
      index++;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      const match = /^\d*\.?\d+|^\d+\.?/.exec(source.slice(index));
      if (!match) throw new FormulaError(`Invalid number at position ${index + 1}`);
      tokens.push({ type: 'number', value: Number(match[0]) });
      index += match[0].length;
      continue;
    }

    if (/[A-Za-z]/.test(char)) {
      const match = /^[A-Za-z]+/.exec(source.slice(index))!;
      tokens.push({ type: 'identifier', value: match[0] });
      index += match[0].length;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/') {
      tokens.push({ type: 'operator', value: char });
    } else if (char === '×') {
      tokens.push({ type: 'operator', value: '*' });
    } else if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
    } else if (char === ',') {
      tokens.push({ type: 'comma' });
    } else {
      throw new FormulaError(`Unexpected character "${char}"`);
    }
    index++;
  }

  return tokens;
}

class Parser {
  private position = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Node {
    if (this.tokens.length === 0) throw new FormulaError('Formula is empty');
    const node = this.parseExpression();
    if (this.position < this.tokens.length) {
      throw new FormulaError('Unexpected extra input in formula');
    }
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }

  private next(): Token | undefined {
    return this.tokens[this.position++];
  }

  // expression := term (('+' | '-') term)*
  private parseExpression(): Node {
    let left = this.parseTerm();
    let token = this.peek();
    while (token?.type === 'operator' && (token.value === '+' || token.value === '-')) {
      this.next();
      left = { kind: 'binary', operator: token.value, left, right: this.parseTerm() };
      token = this.peek();
    }
    return left;
  }

  // term := factor (('*' | '/') factor)*
  private parseTerm(): Node {
    let left = this.parseFactor();
    let token = this.peek();
    while (token?.type === 'operator' && (token.value === '*' || token.value === '/')) {
      this.next();
      left = { kind: 'binary', operator: token.value, left, right: this.parseFactor() };
      token = this.peek();
    }
    return left;
  }

  // factor := number | variable | call | '(' expression ')' | '-' factor
  private parseFactor(): Node {
    const token = this.next();
    if (!token) throw new FormulaError('Formula ends unexpectedly');

    if (token.type === 'operator' && token.value === '-') {
      return { kind: 'unary', operand: this.parseFactor() };
    }

    if (token.type === 'number') return { kind: 'number', value: token.value };

    if (token.type === 'paren' && token.value === '(') {
      const inner = this.parseExpression();
      const closing = this.next();
      if (closing?.type !== 'paren' || closing.value !== ')') {
        throw new FormulaError('Missing closing parenthesis');
      }
      return inner;
    }

    if (token.type === 'identifier') {
      const upper = token.value.toUpperCase();
      const nextToken = this.peek();
      const isCall = nextToken?.type === 'paren' && nextToken.value === '(';
      if (upper in FORMULA_VARIABLES && !isCall) {
        return { kind: 'variable', name: upper as FormulaVariable };
      }

      const fnName = token.value.toLowerCase();
      if (fnName in FUNCTIONS) {
        const open = this.next();
        if (open?.type !== 'paren' || open.value !== '(') {
          throw new FormulaError(`Expected "(" after ${fnName}`);
        }
        const args: Node[] = [this.parseExpression()];
        while (this.peek()?.type === 'comma') {
          this.next();
          args.push(this.parseExpression());
        }
        const close = this.next();
        if (close?.type !== 'paren' || close.value !== ')') {
          throw new FormulaError(`Missing ")" after ${fnName} arguments`);
        }
        if ((fnName === 'ceil' || fnName === 'floor' || fnName === 'round') && args.length !== 1) {
          throw new FormulaError(`${fnName}() takes exactly one value`);
        }
        return { kind: 'call', name: fnName, args };
      }

      throw new FormulaError(
        `Unknown name "${token.value}". Use ${Object.keys(FORMULA_VARIABLES).join(', ')} or min/max/ceil/floor/round`,
      );
    }

    throw new FormulaError('Unexpected symbol in formula');
  }
}

function evaluateNode(node: Node, scope: FormulaScope): number {
  switch (node.kind) {
    case 'number':
      return node.value;
    case 'variable':
      return scope[node.name];
    case 'unary':
      return -evaluateNode(node.operand, scope);
    case 'call':
      return FUNCTIONS[node.name](...node.args.map((arg) => evaluateNode(arg, scope)));
    case 'binary': {
      const left = evaluateNode(node.left, scope);
      const right = evaluateNode(node.right, scope);
      switch (node.operator) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) throw new FormulaError('Division by zero');
          return left / right;
      }
    }
  }
}

const compiledCache = new Map<string, Node>();

export function compileFormula(source: string): Node {
  const trimmed = (source ?? '').trim();
  if (trimmed.length > MAX_FORMULA_LENGTH) {
    throw new FormulaError(`Formula is longer than ${MAX_FORMULA_LENGTH} characters`);
  }
  const cached = compiledCache.get(trimmed);
  if (cached) return cached;

  const node = new Parser(tokenize(trimmed)).parse();
  if (compiledCache.size > 500) compiledCache.clear();
  compiledCache.set(trimmed, node);
  return node;
}

export function evaluateFormula(source: string, scope: FormulaScope): number {
  const result = evaluateNode(compileFormula(source), scope);
  if (!Number.isFinite(result)) throw new FormulaError('Formula did not produce a number');
  return result;
}

/** Returns an error message if the formula is invalid, otherwise null. */
export function validateFormula(source: string): string | null {
  try {
    compileFormula(source);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid formula';
  }
}
