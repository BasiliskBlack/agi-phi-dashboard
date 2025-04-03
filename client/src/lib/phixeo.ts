/**
 * Phixeo Language Core Implementation
 * This file provides the TypeScript implementation of the Phixeo language runtime
 */

import { COLORS, PHI } from './phixeo-styles';

// Types for Phixeo language constructs
export type PhixeoNodeType = 
  | 'variable_declaration'
  | 'function_declaration'
  | 'class_declaration'
  | 'component_declaration'
  | 'import_statement'
  | 'expression'
  | 'assignment'
  | 'if_statement'
  | 'for_loop'
  | 'return_statement'
  | 'function_call'
  | 'binary_operation'
  | 'object_literal'
  | 'array_literal'
  | 'jsx_element'
  | 'property_access'
  | 'method_call';

export type PhixeoNode = {
  type: PhixeoNodeType;
  value?: any;
  name?: string;
  body?: PhixeoNode[];
  params?: {name: string, type?: string}[];
  arguments?: PhixeoNode[];
  left?: PhixeoNode;
  right?: PhixeoNode;
  operator?: string;
  properties?: {name: string, value: PhixeoNode}[];
  elements?: PhixeoNode[];
  condition?: PhixeoNode;
  initialization?: PhixeoNode;
  update?: PhixeoNode;
  tagName?: string;
  attributes?: {name: string, value: PhixeoNode}[];
  children?: PhixeoNode[];
  object?: PhixeoNode;
  property?: string;
  returnType?: string;
  variableType?: string;
};

export type PhixeoScope = {
  variables: Record<string, any>;
  functions: Record<string, PhixeoFunction>;
  classes: Record<string, PhixeoClass>;
  components: Record<string, PhixeoComponent>;
  parent?: PhixeoScope;
};

export type PhixeoFunction = {
  params: {name: string, type?: string}[];
  body: PhixeoNode[];
  returnType?: string;
  scope: PhixeoScope;
};

export type PhixeoClass = {
  properties: Record<string, {type?: string, defaultValue?: any}>;
  methods: Record<string, PhixeoFunction>;
  staticMethods: Record<string, PhixeoFunction>;
};

export type PhixeoComponent = {
  props: Record<string, {type?: string, defaultValue?: any}>;
  state: Record<string, {type?: string, defaultValue?: any}>;
  render: PhixeoFunction;
  methods: Record<string, PhixeoFunction>;
};

export type PhixeoRuntime = {
  scope: PhixeoScope;
  modules: Record<string, {
    exports: Record<string, any>;
  }>;
  systemFunctions: Record<string, Function>;
};

// Lexical analysis (tokenization)
export type PhixeoToken = {
  type: string;
  value: string;
  line: number;
  column: number;
};

export function tokenize(code: string): PhixeoToken[] {
  const tokens: PhixeoToken[] = [];
  
  // Define token patterns
  const patterns = [
    { type: 'whitespace', regex: /^\s+/ },
    { type: 'comment', regex: /^#.*/ },
    { type: 'string', regex: /^"([^"\\]|\\.)*"/ },
    { type: 'number', regex: /^-?\d+(\.\d+)?/ },
    { type: 'identifier', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: 'operator', regex: /^(\+|-|\*|\/|%|==|!=|<=|>=|<|>|\|\||&&|!)/ },
    { type: 'punctuation', regex: /^[(){}\[\],;:.]/ },
    { type: 'jsx_open', regex: /^<[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: 'jsx_close', regex: /^<\/[a-zA-Z_][a-zA-Z0-9_]*>/ },
    { type: 'jsx_self_close', regex: /^\/\s*>/ },
    { type: 'jsx_end', regex: /^>/ },
  ];
  
  // Keywords
  const keywords = [
    'import', 'from', 'class', 'func', 'var', 'const', 'if', 'else', 'for', 'while',
    'return', 'new', 'this', 'self', 'true', 'false', 'null', 'undefined',
    'component', 'prop', 'state', 'render'
  ];
  
  let line = 1;
  let column = 1;
  
  // Process the code
  let remainingCode = code;
  
  while (remainingCode.length > 0) {
    let matched = false;
    
    for (const pattern of patterns) {
      const match = remainingCode.match(pattern.regex);
      
      if (match) {
        const value = match[0];
        
        // Skip whitespace and comments
        if (pattern.type !== 'whitespace' && pattern.type !== 'comment') {
          // Check if the identifier is a keyword
          if (pattern.type === 'identifier' && keywords.includes(value)) {
            tokens.push({ type: 'keyword', value, line, column });
          } else {
            tokens.push({ type: pattern.type, value, line, column });
          }
        }
        
        // Update line and column numbers
        if (pattern.type === 'whitespace') {
          const newlines = (value.match(/\n/g) || []).length;
          if (newlines > 0) {
            line += newlines;
            const lastNewlineIndex = value.lastIndexOf('\n');
            column = value.length - lastNewlineIndex;
          } else {
            column += value.length;
          }
        } else {
          column += value.length;
        }
        
        // Remove the matched part from the remaining code
        remainingCode = remainingCode.substring(value.length);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      throw new Error(`Unexpected character at line ${line}, column ${column}: ${remainingCode[0]}`);
    }
  }
  
  return tokens;
}

// Parsing
export function parse(tokens: PhixeoToken[]): PhixeoNode[] {
  let position = 0;
  
  function peek(): PhixeoToken | null {
    return position < tokens.length ? tokens[position] : null;
  }
  
  function consume(): PhixeoToken {
    return tokens[position++];
  }
  
  function match(type: string, value?: string): boolean {
    const token = peek();
    if (!token) return false;
    
    if (token.type === type && (value === undefined || token.value === value)) {
      consume();
      return true;
    }
    
    return false;
  }
  
  function expectIdentifier(): string {
    const token = peek();
    if (token && token.type === 'identifier') {
      consume();
      return token.value;
    }
    throw new Error(`Expected identifier at line ${token?.line}, column ${token?.column}`);
  }
  
  function parseProgram(): PhixeoNode[] {
    const nodes: PhixeoNode[] = [];
    
    while (position < tokens.length) {
      nodes.push(parseStatement());
    }
    
    return nodes;
  }
  
  function parseStatement(): PhixeoNode {
    const token = peek();
    
    if (!token) {
      throw new Error('Unexpected end of input');
    }
    
    // Import statement
    if (token.type === 'keyword' && token.value === 'import') {
      return parseImportStatement();
    }
    
    // Class declaration
    if (token.type === 'keyword' && token.value === 'class') {
      return parseClassDeclaration();
    }
    
    // Component declaration
    if (token.type === 'keyword' && token.value === 'component') {
      return parseComponentDeclaration();
    }
    
    // Variable declaration
    if (token.type === 'keyword' && (token.value === 'var' || token.value === 'const')) {
      return parseVariableDeclaration();
    }
    
    // Function declaration
    if (token.type === 'keyword' && token.value === 'func') {
      return parseFunctionDeclaration();
    }
    
    // If statement
    if (token.type === 'keyword' && token.value === 'if') {
      return parseIfStatement();
    }
    
    // For loop
    if (token.type === 'keyword' && token.value === 'for') {
      return parseForLoop();
    }
    
    // Return statement
    if (token.type === 'keyword' && token.value === 'return') {
      return parseReturnStatement();
    }
    
    // Expression statement
    return parseExpressionStatement();
  }
  
  function parseImportStatement(): PhixeoNode {
    consume(); // consume 'import'
    
    // Parse the module name (string)
    const moduleToken = peek();
    
    if (!moduleToken || moduleToken.type !== 'string') {
      throw new Error(`Expected string at line ${moduleToken?.line}, column ${moduleToken?.column}`);
    }
    
    const moduleName = moduleToken.value.slice(1, -1); // Remove quotes
    consume();
    
    return {
      type: 'import_statement',
      value: moduleName
    };
  }
  
  function parseClassDeclaration(): PhixeoNode {
    consume(); // consume 'class'
    
    const className = expectIdentifier();
    
    // Parse class body
    if (!match('punctuation', '{')) {
      throw new Error('Expected { after class name');
    }
    
    const body: PhixeoNode[] = [];
    
    while (!match('punctuation', '}')) {
      body.push(parseClassMember());
    }
    
    return {
      type: 'class_declaration',
      name: className,
      body
    };
  }
  
  function parseClassMember(): PhixeoNode {
    const token = peek();
    
    if (token?.type === 'keyword') {
      if (token.value === 'var' || token.value === 'const') {
        return parseVariableDeclaration();
      } else if (token.value === 'func') {
        return parseFunctionDeclaration();
      }
    }
    
    throw new Error(`Unexpected token in class declaration at line ${token?.line}, column ${token?.column}`);
  }
  
  function parseComponentDeclaration(): PhixeoNode {
    consume(); // consume 'component'
    
    const componentName = expectIdentifier();
    
    // Parse component body
    if (!match('punctuation', '{')) {
      throw new Error('Expected { after component name');
    }
    
    const body: PhixeoNode[] = [];
    
    while (!match('punctuation', '}')) {
      body.push(parseComponentMember());
    }
    
    return {
      type: 'component_declaration',
      name: componentName,
      body
    };
  }
  
  function parseComponentMember(): PhixeoNode {
    const token = peek();
    
    if (token?.type === 'keyword') {
      if (token.value === 'prop' || token.value === 'state') {
        return parseComponentProperty(token.value);
      } else if (token.value === 'render') {
        return parseRenderFunction();
      } else if (token.value === 'func') {
        return parseFunctionDeclaration();
      }
    }
    
    throw new Error(`Unexpected token in component declaration at line ${token?.line}, column ${token?.column}`);
  }
  
  function parseComponentProperty(kind: 'prop' | 'state'): PhixeoNode {
    consume(); // consume 'prop' or 'state'
    
    const name = expectIdentifier();
    let type;
    
    // Parse optional type
    if (match('punctuation', ':')) {
      const typeToken = consume();
      type = typeToken.value;
    }
    
    let value;
    
    // Parse optional default value
    if (match('punctuation', '=')) {
      value = parseExpression();
    }
    
    return {
      type: 'variable_declaration',
      name,
      variableType: type,
      value
    };
  }
  
  function parseRenderFunction(): PhixeoNode {
    consume(); // consume 'render'
    
    // Parse parameter list
    if (!match('punctuation', '(')) {
      throw new Error('Expected ( after render');
    }
    
    const params: {name: string, type?: string}[] = [];
    
    if (!match('punctuation', ')')) {
      do {
        const paramName = expectIdentifier();
        let paramType;
        
        // Parse optional type
        if (match('punctuation', ':')) {
          const typeToken = consume();
          paramType = typeToken.value;
        }
        
        params.push({ name: paramName, type: paramType });
      } while (match('punctuation', ','));
      
      if (!match('punctuation', ')')) {
        throw new Error('Expected ) after parameters');
      }
    }
    
    // Parse optional return type
    let returnType;
    if (match('punctuation', '->')) {
      const typeToken = consume();
      returnType = typeToken.value;
    }
    
    // Parse function body
    const body: PhixeoNode[] = [];
    
    if (match('punctuation', '{')) {
      while (!match('punctuation', '}')) {
        body.push(parseStatement());
      }
    } else {
      // Single expression body
      body.push({
        type: 'return_statement',
        value: parseExpression()
      });
    }
    
    return {
      type: 'function_declaration',
      name: 'render',
      params,
      returnType,
      body
    };
  }
  
  function parseVariableDeclaration(): PhixeoNode {
    const keyword = consume().value; // consume 'var' or 'const'
    
    const name = expectIdentifier();
    let type;
    
    // Parse optional type
    if (match('punctuation', ':')) {
      const typeToken = consume();
      type = typeToken.value;
    }
    
    let value;
    
    // Parse optional value
    if (match('punctuation', '=')) {
      value = parseExpression();
    }
    
    // Expect semicolon
    if (!match('punctuation', ';')) {
      throw new Error('Expected ; after variable declaration');
    }
    
    return {
      type: 'variable_declaration',
      name,
      variableType: type,
      value
    };
  }
  
  function parseFunctionDeclaration(): PhixeoNode {
    consume(); // consume 'func'
    
    const name = expectIdentifier();
    
    // Parse parameter list
    if (!match('punctuation', '(')) {
      throw new Error('Expected ( after function name');
    }
    
    const params: {name: string, type?: string}[] = [];
    
    if (!match('punctuation', ')')) {
      do {
        const paramName = expectIdentifier();
        let paramType;
        
        // Parse optional type
        if (match('punctuation', ':')) {
          const typeToken = consume();
          paramType = typeToken.value;
        }
        
        params.push({ name: paramName, type: paramType });
      } while (match('punctuation', ','));
      
      if (!match('punctuation', ')')) {
        throw new Error('Expected ) after parameters');
      }
    }
    
    // Parse optional return type
    let returnType;
    if (match('punctuation', '->')) {
      const typeToken = consume();
      returnType = typeToken.value;
    }
    
    // Parse function body
    const body: PhixeoNode[] = [];
    
    if (match('punctuation', '{')) {
      while (!match('punctuation', '}')) {
        body.push(parseStatement());
      }
    } else {
      // Single expression body
      body.push({
        type: 'return_statement',
        value: parseExpression()
      });
    }
    
    return {
      type: 'function_declaration',
      name,
      params,
      returnType,
      body
    };
  }
  
  function parseIfStatement(): PhixeoNode {
    consume(); // consume 'if'
    
    // Parse condition
    if (!match('punctuation', '(')) {
      throw new Error('Expected ( after if');
    }
    
    const condition = parseExpression();
    
    if (!match('punctuation', ')')) {
      throw new Error('Expected ) after condition');
    }
    
    // Parse 'then' block
    const thenBlock: PhixeoNode[] = [];
    
    if (match('punctuation', '{')) {
      while (!match('punctuation', '}')) {
        thenBlock.push(parseStatement());
      }
    } else {
      thenBlock.push(parseStatement());
    }
    
    // Parse optional 'else' block
    let elseBlock: PhixeoNode[] | undefined;
    
    if (match('keyword', 'else')) {
      elseBlock = [];
      
      if (match('punctuation', '{')) {
        while (!match('punctuation', '}')) {
          elseBlock.push(parseStatement());
        }
      } else {
        elseBlock.push(parseStatement());
      }
    }
    
    return {
      type: 'if_statement',
      condition,
      body: thenBlock,
      ...(elseBlock && { value: elseBlock })
    };
  }
  
  function parseForLoop(): PhixeoNode {
    consume(); // consume 'for'
    
    // Parse loop header
    if (!match('punctuation', '(')) {
      throw new Error('Expected ( after for');
    }
    
    let initialization, condition, update;
    
    // Parse initialization
    if (!match('punctuation', ';')) {
      initialization = parseStatement();
      // The statement parser consumes the semicolon
    }
    
    // Parse condition
    if (!match('punctuation', ';')) {
      condition = parseExpression();
      
      if (!match('punctuation', ';')) {
        throw new Error('Expected ; after for loop condition');
      }
    }
    
    // Parse update
    if (!match('punctuation', ')')) {
      update = parseExpression();
      
      if (!match('punctuation', ')')) {
        throw new Error('Expected ) after for loop update');
      }
    }
    
    // Parse loop body
    const body: PhixeoNode[] = [];
    
    if (match('punctuation', '{')) {
      while (!match('punctuation', '}')) {
        body.push(parseStatement());
      }
    } else {
      body.push(parseStatement());
    }
    
    return {
      type: 'for_loop',
      initialization,
      condition,
      update,
      body
    };
  }
  
  function parseReturnStatement(): PhixeoNode {
    consume(); // consume 'return'
    
    let value;
    
    // Parse optional return value
    if (!match('punctuation', ';')) {
      value = parseExpression();
      
      if (!match('punctuation', ';')) {
        throw new Error('Expected ; after return statement');
      }
    }
    
    return {
      type: 'return_statement',
      value
    };
  }
  
  function parseExpressionStatement(): PhixeoNode {
    const expression = parseExpression();
    
    if (!match('punctuation', ';')) {
      throw new Error('Expected ; after expression statement');
    }
    
    return expression;
  }
  
  function parseExpression(): PhixeoNode {
    return parseAssignment();
  }
  
  function parseAssignment(): PhixeoNode {
    const left = parseLogicalOr();
    
    if (match('punctuation', '=')) {
      const right = parseAssignment();
      
      return {
        type: 'assignment',
        left,
        right
      };
    }
    
    return left;
  }
  
  function parseLogicalOr(): PhixeoNode {
    let left = parseLogicalAnd();
    
    while (match('operator', '||')) {
      const right = parseLogicalAnd();
      
      left = {
        type: 'binary_operation',
        left,
        operator: '||',
        right
      };
    }
    
    return left;
  }
  
  function parseLogicalAnd(): PhixeoNode {
    let left = parseEquality();
    
    while (match('operator', '&&')) {
      const right = parseEquality();
      
      left = {
        type: 'binary_operation',
        left,
        operator: '&&',
        right
      };
    }
    
    return left;
  }
  
  function parseEquality(): PhixeoNode {
    let left = parseComparison();
    
    while (match('operator', '==') || match('operator', '!=')) {
      const operator = tokens[position - 1].value;
      const right = parseComparison();
      
      left = {
        type: 'binary_operation',
        left,
        operator,
        right
      };
    }
    
    return left;
  }
  
  function parseComparison(): PhixeoNode {
    let left = parseAdditive();
    
    while (match('operator', '<') || match('operator', '>') || 
           match('operator', '<=') || match('operator', '>=')) {
      const operator = tokens[position - 1].value;
      const right = parseAdditive();
      
      left = {
        type: 'binary_operation',
        left,
        operator,
        right
      };
    }
    
    return left;
  }
  
  function parseAdditive(): PhixeoNode {
    let left = parseMultiplicative();
    
    while (match('operator', '+') || match('operator', '-')) {
      const operator = tokens[position - 1].value;
      const right = parseMultiplicative();
      
      left = {
        type: 'binary_operation',
        left,
        operator,
        right
      };
    }
    
    return left;
  }
  
  function parseMultiplicative(): PhixeoNode {
    let left = parseUnary();
    
    while (match('operator', '*') || match('operator', '/') || match('operator', '%')) {
      const operator = tokens[position - 1].value;
      const right = parseUnary();
      
      left = {
        type: 'binary_operation',
        left,
        operator,
        right
      };
    }
    
    return left;
  }
  
  function parseUnary(): PhixeoNode {
    if (match('operator', '!') || match('operator', '-')) {
      const operator = tokens[position - 1].value;
      const operand = parseUnary();
      
      return {
        type: 'binary_operation',
        operator,
        right: operand
      };
    }
    
    return parsePrimary();
  }
  
  function parsePrimary(): PhixeoNode {
    const token = peek();
    
    if (!token) {
      throw new Error('Unexpected end of input');
    }
    
    // Number literal
    if (token.type === 'number') {
      consume();
      return {
        type: 'expression',
        value: parseFloat(token.value)
      };
    }
    
    // String literal
    if (token.type === 'string') {
      consume();
      return {
        type: 'expression',
        value: token.value.slice(1, -1) // Remove quotes
      };
    }
    
    // Boolean literals
    if (token.type === 'keyword' && (token.value === 'true' || token.value === 'false')) {
      consume();
      return {
        type: 'expression',
        value: token.value === 'true'
      };
    }
    
    // Null literal
    if (token.type === 'keyword' && token.value === 'null') {
      consume();
      return {
        type: 'expression',
        value: null
      };
    }
    
    // This/self keyword
    if (token.type === 'keyword' && (token.value === 'this' || token.value === 'self')) {
      consume();
      return {
        type: 'expression',
        value: token.value
      };
    }
    
    // New expression
    if (token.type === 'keyword' && token.value === 'new') {
      consume();
      const className = expectIdentifier();
      
      // Parse constructor arguments
      if (!match('punctuation', '(')) {
        throw new Error('Expected ( after class name in new expression');
      }
      
      const args: PhixeoNode[] = [];
      
      if (!match('punctuation', ')')) {
        do {
          args.push(parseExpression());
        } while (match('punctuation', ','));
        
        if (!match('punctuation', ')')) {
          throw new Error('Expected ) after arguments in new expression');
        }
      }
      
      return {
        type: 'function_call',
        name: className,
        arguments: args
      };
    }
    
    // JSX element
    if (token.type === 'jsx_open') {
      return parseJsxElement();
    }
    
    // Object literal
    if (match('punctuation', '{')) {
      return parseObjectLiteral();
    }
    
    // Array literal
    if (match('punctuation', '[')) {
      return parseArrayLiteral();
    }
    
    // Parenthesized expression
    if (match('punctuation', '(')) {
      const expr = parseExpression();
      
      if (!match('punctuation', ')')) {
        throw new Error('Expected ) after expression');
      }
      
      return expr;
    }
    
    // Variable reference, property access, function call
    if (token.type === 'identifier') {
      consume();
      
      return parsePostfixExpression(token.value);
    }
    
    throw new Error(`Unexpected token: ${token.value} at line ${token.line}, column ${token.column}`);
  }
  
  function parsePostfixExpression(identifier: string): PhixeoNode {
    let expr: PhixeoNode = {
      type: 'expression',
      name: identifier
    };
    
    while (true) {
      // Property access: obj.prop
      if (match('punctuation', '.')) {
        const propName = expectIdentifier();
        
        expr = {
          type: 'property_access',
          object: expr,
          property: propName
        };
      } 
      // Function call: func(args)
      else if (match('punctuation', '(')) {
        const args: PhixeoNode[] = [];
        
        if (!match('punctuation', ')')) {
          do {
            args.push(parseExpression());
          } while (match('punctuation', ','));
          
          if (!match('punctuation', ')')) {
            throw new Error('Expected ) after function arguments');
          }
        }
        
        expr = {
          type: 'function_call',
          name: expr,
          arguments: args
        };
      } 
      // Array indexing: arr[idx]
      else if (match('punctuation', '[')) {
        const index = parseExpression();
        
        if (!match('punctuation', ']')) {
          throw new Error('Expected ] after array index');
        }
        
        expr = {
          type: 'binary_operation',
          left: expr,
          operator: '[]',
          right: index
        };
      } else {
        break;
      }
    }
    
    return expr;
  }
  
  function parseObjectLiteral(): PhixeoNode {
    const properties: {name: string, value: PhixeoNode}[] = [];
    
    if (!match('punctuation', '}')) {
      do {
        const propName = expectIdentifier();
        
        if (!match('punctuation', ':')) {
          throw new Error('Expected : after object property name');
        }
        
        const propValue = parseExpression();
        
        properties.push({ name: propName, value: propValue });
      } while (match('punctuation', ','));
      
      if (!match('punctuation', '}')) {
        throw new Error('Expected } after object literal');
      }
    }
    
    return {
      type: 'object_literal',
      properties
    };
  }
  
  function parseArrayLiteral(): PhixeoNode {
    const elements: PhixeoNode[] = [];
    
    if (!match('punctuation', ']')) {
      do {
        elements.push(parseExpression());
      } while (match('punctuation', ','));
      
      if (!match('punctuation', ']')) {
        throw new Error('Expected ] after array literal');
      }
    }
    
    return {
      type: 'array_literal',
      elements
    };
  }
  
  function parseJsxElement(): PhixeoNode {
    // Parse the opening tag: <TagName
    const openTag = consume().value.substring(1); // Remove '<'
    const tagName = openTag;
    
    // Parse attributes
    const attributes: {name: string, value: PhixeoNode}[] = [];
    
    while (!match('jsx_end') && !match('jsx_self_close')) {
      // Attribute name
      const attrName = expectIdentifier();
      
      // Attribute value
      let attrValue: PhixeoNode;
      
      if (match('punctuation', '=')) {
        // Parse the attribute value
        if (match('punctuation', '{')) {
          // JSX expression: prop={expr}
          attrValue = parseExpression();
          
          if (!match('punctuation', '}')) {
            throw new Error('Expected } after JSX attribute expression');
          }
        } else {
          // String literal: prop="value"
          const valueToken = consume();
          
          if (valueToken.type !== 'string') {
            throw new Error(`Expected string for JSX attribute value at line ${valueToken.line}, column ${valueToken.column}`);
          }
          
          attrValue = {
            type: 'expression',
            value: valueToken.value.slice(1, -1) // Remove quotes
          };
        }
      } else {
        // Boolean attribute: disabled
        attrValue = {
          type: 'expression',
          value: true
        };
      }
      
      attributes.push({ name: attrName, value: attrValue });
    }
    
    // Self-closing tag: <Tag ... />
    if (match('jsx_self_close')) {
      return {
        type: 'jsx_element',
        tagName,
        attributes,
        children: []
      };
    }
    
    // Regular tag: parse children until closing tag
    const children: PhixeoNode[] = [];
    
    while (!match('jsx_close')) {
      // Text content
      if (peek()?.type === 'string') {
        const textToken = consume();
        children.push({
          type: 'expression',
          value: textToken.value.slice(1, -1) // Remove quotes
        });
      } 
      // Nested JSX element
      else if (peek()?.type === 'jsx_open') {
        children.push(parseJsxElement());
      } 
      // JSX expression: {expr}
      else if (match('punctuation', '{')) {
        children.push(parseExpression());
        
        if (!match('punctuation', '}')) {
          throw new Error('Expected } after JSX expression');
        }
      } else {
        throw new Error(`Unexpected token in JSX children at line ${peek()?.line}, column ${peek()?.column}`);
      }
    }
    
    return {
      type: 'jsx_element',
      tagName,
      attributes,
      children
    };
  }
  
  return parseProgram();
}

// Interpreter
export function interpret(nodes: PhixeoNode[], runtime: PhixeoRuntime): any {
  let result: any;
  
  for (const node of nodes) {
    result = evaluateNode(node, runtime);
  }
  
  return result;
}

function evaluateNode(node: PhixeoNode, runtime: PhixeoRuntime): any {
  switch (node.type) {
    case 'variable_declaration':
      return evaluateVariableDeclaration(node, runtime);
    case 'function_declaration':
      return evaluateFunctionDeclaration(node, runtime);
    case 'class_declaration':
      return evaluateClassDeclaration(node, runtime);
    case 'component_declaration':
      return evaluateComponentDeclaration(node, runtime);
    case 'import_statement':
      return evaluateImportStatement(node, runtime);
    case 'expression':
      return evaluateExpression(node, runtime);
    case 'assignment':
      return evaluateAssignment(node, runtime);
    case 'if_statement':
      return evaluateIfStatement(node, runtime);
    case 'for_loop':
      return evaluateForLoop(node, runtime);
    case 'return_statement':
      return evaluateReturnStatement(node, runtime);
    case 'function_call':
      return evaluateFunctionCall(node, runtime);
    case 'binary_operation':
      return evaluateBinaryOperation(node, runtime);
    case 'object_literal':
      return evaluateObjectLiteral(node, runtime);
    case 'array_literal':
      return evaluateArrayLiteral(node, runtime);
    case 'jsx_element':
      return evaluateJsxElement(node, runtime);
    case 'property_access':
      return evaluatePropertyAccess(node, runtime);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

function evaluateVariableDeclaration(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const { name, value } = node;
  
  if (!name) {
    throw new Error('Variable declaration missing name');
  }
  
  const resolvedValue = value ? evaluateNode(value, runtime) : undefined;
  runtime.scope.variables[name] = resolvedValue;
  
  return resolvedValue;
}

function evaluateFunctionDeclaration(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const { name, params, body } = node;
  
  if (!name) {
    throw new Error('Function declaration missing name');
  }
  
  const func: PhixeoFunction = {
    params: params || [],
    body: body || [],
    returnType: node.returnType,
    scope: { 
      variables: {},
      functions: {},
      classes: {},
      components: {},
      parent: runtime.scope
    }
  };
  
  runtime.scope.functions[name] = func;
  
  return func;
}

function evaluateClassDeclaration(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const { name, body } = node;
  
  if (!name) {
    throw new Error('Class declaration missing name');
  }
  
  const properties: Record<string, {type?: string, defaultValue?: any}> = {};
  const methods: Record<string, PhixeoFunction> = {};
  const staticMethods: Record<string, PhixeoFunction> = {};
  
  // Process class members
  for (const member of body || []) {
    if (member.type === 'variable_declaration') {
      properties[member.name!] = {
        type: member.variableType,
        defaultValue: member.value ? evaluateNode(member.value, runtime) : undefined
      };
    } else if (member.type === 'function_declaration') {
      const method: PhixeoFunction = {
        params: member.params || [],
        body: member.body || [],
        returnType: member.returnType,
        scope: { 
          variables: {},
          functions: {},
          classes: {},
          components: {},
          parent: runtime.scope
        }
      };
      
      methods[member.name!] = method;
    }
  }
  
  const classObj: PhixeoClass = {
    properties,
    methods,
    staticMethods
  };
  
  runtime.scope.classes[name] = classObj;
  
  return classObj;
}

function evaluateComponentDeclaration(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const { name, body } = node;
  
  if (!name) {
    throw new Error('Component declaration missing name');
  }
  
  const props: Record<string, {type?: string, defaultValue?: any}> = {};
  const state: Record<string, {type?: string, defaultValue?: any}> = {};
  const methods: Record<string, PhixeoFunction> = {};
  let renderFunc: PhixeoFunction | undefined;
  
  // Process component members
  for (const member of body || []) {
    if (member.type === 'variable_declaration') {
      const varName = member.name!;
      const defaultValue = member.value ? evaluateNode(member.value, runtime) : undefined;
      
      // Check if this is a prop or state declaration
      if (varName.startsWith('prop')) {
        props[varName.substring(4)] = {
          type: member.variableType,
          defaultValue
        };
      } else if (varName.startsWith('state')) {
        state[varName.substring(5)] = {
          type: member.variableType,
          defaultValue
        };
      }
    } else if (member.type === 'function_declaration') {
      const method: PhixeoFunction = {
        params: member.params || [],
        body: member.body || [],
        returnType: member.returnType,
        scope: { 
          variables: {},
          functions: {},
          classes: {},
          components: {},
          parent: runtime.scope
        }
      };
      
      if (member.name === 'render') {
        renderFunc = method;
      } else {
        methods[member.name!] = method;
      }
    }
  }
  
  if (!renderFunc) {
    throw new Error(`Component ${name} must have a render method`);
  }
  
  const component: PhixeoComponent = {
    props,
    state,
    render: renderFunc,
    methods
  };
  
  runtime.scope.components[name] = component;
  
  return component;
}

function evaluateImportStatement(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const moduleName = node.value;
  
  // Handle standard library imports
  if (typeof moduleName === 'string' && moduleName.startsWith('std:')) {
    const libName = moduleName.substring(4);
    
    // Implement standard library modules based on the library name
    if (libName === 'system') {
      runtime.modules[moduleName] = {
        exports: {
          log: (message: string) => console.log(message),
          error: (message: string) => console.error(message),
          get_memory_usage: () => Math.random() * 100,
          get_cpu_usage: () => Math.random() * 100
        }
      };
    } else if (libName === 'optimization') {
      runtime.modules[moduleName] = {
        exports: {
          optimize: (data: any, level: number) => data * (1 - level/10),
          benchmark: (fn: Function) => {
            const start = performance.now();
            fn();
            return performance.now() - start;
          }
        }
      };
    } else if (libName === 'fractal') {
      runtime.modules[moduleName] = {
        exports: {
          compress: (data: number, ratio: number) => data / ratio,
          decompress: (data: number, ratio: number) => data * ratio,
          generate_pattern: (seed: number, iterations: number) => {
            // Simple fractal pattern generation simulation
            return { seed, iterations, pattern: `Fractal pattern with ${iterations} iterations` };
          }
        }
      };
    } else if (libName === 'ui') {
      runtime.modules[moduleName] = {
        exports: {
          render: (component: any, target: any) => {
            console.log('Rendering component to target');
            return { component, target };
          },
          get_screen_width: () => window.innerWidth,
          get_screen_height: () => window.innerHeight,
          minimize_window: (win: any) => console.log('Minimizing window', win),
          close_window: (win: any) => console.log('Closing window', win)
        }
      };
    } else if (libName === 'animation') {
      runtime.modules[moduleName] = {
        exports: {
          apply: (params: any) => {
            console.log('Applying animation', params);
            if (params.onComplete) {
              setTimeout(params.onComplete, params.duration || 300);
            }
            return params;
          },
          sequence: (animations: any[]) => {
            console.log('Animation sequence with', animations.length, 'steps');
            return animations;
          }
        }
      };
    } else if (libName === 'geometry') {
      runtime.modules[moduleName] = {
        exports: {
          distance: (x1: number, y1: number, x2: number, y2: number) => {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          },
          golden_ratio: PHI,
          optimize_layout: (elements: any[]) => {
            console.log('Optimizing layout for', elements.length, 'elements');
            return elements;
          }
        }
      };
    } else if (libName === 'neural') {
      runtime.modules[moduleName] = {
        exports: {
          create_layer: (inputSize: number, outputSize: number, activation: string) => {
            return {
              input_size: inputSize,
              output_size: outputSize,
              activation,
              weights: { rows: outputSize, cols: inputSize, values: [] },
              biases: { size: outputSize, values: [] }
            };
          },
          forward_step: (input: any, weights: any, biases: any, activation: string) => {
            return { size: weights.rows, values: [] };
          },
          backward_step: (layer: any, nextLayer: any, learningRate: number) => {
            return { gradients: {} };
          },
          mean_squared_error: (output: any, target: any) => {
            return Math.random() * 0.1; // Simulate loss
          }
        }
      };
    } else if (libName === 'math') {
      runtime.modules[moduleName] = {
        exports: {
          round: Math.round,
          sqrt: Math.sqrt,
          pow: Math.pow,
          random: Math.random,
          max: Math.max,
          min: Math.min,
          abs: Math.abs,
          fibonacci: (n: number) => {
            let a = 0, b = 1;
            for (let i = 0; i < n; i++) {
              [a, b] = [b, a + b];
            }
            return a;
          },
          isPrime: (n: number) => {
            if (n <= 1) return false;
            if (n <= 3) return true;
            if (n % 2 === 0 || n % 3 === 0) return false;
            let i = 5;
            while (i * i <= n) {
              if (n % i === 0 || n % (i + 2) === 0) return false;
              i += 6;
            }
            return true;
          }
        }
      };
    } else if (libName === 'data') {
      runtime.modules[moduleName] = {
        exports: {
          Vector: function(size: number) {
            return { size, values: Array(size).fill(0) };
          },
          Matrix: function(rows: number, cols: number) {
            return { rows, cols, values: Array(rows * cols).fill(0) };
          },
          Map: function() {
            return {};
          }
        }
      };
    }
    
    return runtime.modules[moduleName];
  }
  
  // Handle local imports
  // In a real implementation, this would load and parse the file
  return { exports: {} };
}

function evaluateExpression(node: PhixeoNode, runtime: PhixeoRuntime): any {
  if (node.value !== undefined) {
    return node.value;
  }
  
  if (node.name) {
    // Variable reference
    return lookupVariable(node.name, runtime.scope);
  }
  
  return undefined;
}

function evaluateAssignment(node: PhixeoNode, runtime: PhixeoRuntime): any {
  if (!node.left || !node.right) {
    throw new Error('Assignment missing left or right side');
  }
  
  const right = evaluateNode(node.right, runtime);
  
  if (node.left.type === 'expression' && node.left.name) {
    // Simple variable assignment
    const varName = node.left.name;
    
    // Find the scope that contains the variable
    let scope = runtime.scope;
    while (scope) {
      if (varName in scope.variables) {
        scope.variables[varName] = right;
        return right;
      }
      
      scope = scope.parent!;
    }
    
    // If not found, create in current scope
    runtime.scope.variables[varName] = right;
    return right;
  } else if (node.left.type === 'property_access') {
    // Property assignment: obj.prop = value
    const obj = evaluateNode(node.left.object!, runtime);
    const propName = node.left.property!;
    
    obj[propName] = right;
    return right;
  } else if (node.left.type === 'binary_operation' && node.left.operator === '[]') {
    // Array index assignment: arr[idx] = value
    const arr = evaluateNode(node.left.left!, runtime);
    const idx = evaluateNode(node.left.right!, runtime);
    
    arr[idx] = right;
    return right;
  }
  
  throw new Error('Invalid assignment target');
}

function evaluateIfStatement(node: PhixeoNode, runtime: PhixeoRuntime): any {
  if (!node.condition) {
    throw new Error('If statement missing condition');
  }
  
  const condition = evaluateNode(node.condition, runtime);
  
  if (condition) {
    // Execute the 'then' block
    let result;
    for (const statement of node.body || []) {
      result = evaluateNode(statement, runtime);
    }
    return result;
  } else if (node.value) {
    // Execute the 'else' block
    let result;
    for (const statement of node.value) {
      result = evaluateNode(statement, runtime);
    }
    return result;
  }
  
  return undefined;
}

function evaluateForLoop(node: PhixeoNode, runtime: PhixeoRuntime): any {
  // Create a new scope for the loop
  const loopScope: PhixeoScope = {
    variables: {},
    functions: {},
    classes: {},
    components: {},
    parent: runtime.scope
  };
  
  const originalScope = runtime.scope;
  runtime.scope = loopScope;
  
  // Initialize loop variable
  if (node.initialization) {
    evaluateNode(node.initialization, runtime);
  }
  
  let result;
  
  // Loop condition
  while (!node.condition || evaluateNode(node.condition, runtime)) {
    // Execute loop body
    for (const statement of node.body || []) {
      result = evaluateNode(statement, runtime);
    }
    
    // Update loop variable
    if (node.update) {
      evaluateNode(node.update, runtime);
    } else {
      // Prevent infinite loop if no condition or update is provided
      break;
    }
  }
  
  // Restore original scope
  runtime.scope = originalScope;
  
  return result;
}

function evaluateReturnStatement(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const value = node.value ? evaluateNode(node.value, runtime) : undefined;
  
  // In a real interpreter, this would use exceptions or a special return value
  // to handle the return statement properly
  return value;
}

function evaluateFunctionCall(node: PhixeoNode, runtime: PhixeoRuntime): any {
  let funcName: string;
  let targetObj: any = null;
  
  // Get function name and target object (if method call)
  if (typeof node.name === 'string') {
    funcName = node.name;
  } else if (node.name && node.name.type === 'property_access') {
    targetObj = evaluateNode(node.name.object!, runtime);
    funcName = node.name.property!;
  } else if (node.name && node.name.type === 'expression' && node.name.name) {
    funcName = node.name.name;
  } else {
    throw new Error('Invalid function call target');
  }
  
  // Evaluate arguments
  const args = (node.arguments || []).map(arg => evaluateNode(arg, runtime));
  
  // Method call on an object
  if (targetObj) {
    if (typeof targetObj[funcName] === 'function') {
      return targetObj[funcName](...args);
    }
    throw new Error(`Method ${funcName} not found on object`);
  }
  
  // Look for the function in the current scope
  const func = lookupFunction(funcName, runtime.scope);
  
  if (func) {
    // Create a new scope for the function call
    const functionScope: PhixeoScope = {
      variables: {},
      functions: {},
      classes: {},
      components: {},
      parent: func.scope
    };
    
    // Bind arguments to parameters
    for (let i = 0; i < func.params.length; i++) {
      const paramName = func.params[i].name;
      functionScope.variables[paramName] = i < args.length ? args[i] : undefined;
    }
    
    // Execute function body in the new scope
    const originalScope = runtime.scope;
    runtime.scope = functionScope;
    
    let result;
    
    for (const statement of func.body) {
      result = evaluateNode(statement, runtime);
      
      // In a real interpreter, we would check if this is a return statement
      // and handle it appropriately
    }
    
    // Restore original scope
    runtime.scope = originalScope;
    
    return result;
  }
  
  // Check for system functions
  if (funcName in runtime.systemFunctions) {
    return runtime.systemFunctions[funcName](...args);
  }
  
  throw new Error(`Function ${funcName} not found`);
}

function evaluateBinaryOperation(node: PhixeoNode, runtime: PhixeoRuntime): any {
  // Handle unary operations
  if (!node.left) {
    const right = evaluateNode(node.right!, runtime);
    
    switch (node.operator) {
      case '!': return !right;
      case '-': return -right;
      default: throw new Error(`Unknown unary operator: ${node.operator}`);
    }
  }
  
  const left = evaluateNode(node.left, runtime);
  const right = evaluateNode(node.right!, runtime);
  
  switch (node.operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '==': return left === right;
    case '!=': return left !== right;
    case '<': return left < right;
    case '>': return left > right;
    case '<=': return left <= right;
    case '>=': return left >= right;
    case '&&': return left && right;
    case '||': return left || right;
    case '[]': return left[right]; // Array indexing
    default: throw new Error(`Unknown binary operator: ${node.operator}`);
  }
}

function evaluateObjectLiteral(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const obj: Record<string, any> = {};
  
  for (const prop of node.properties || []) {
    obj[prop.name] = evaluateNode(prop.value, runtime);
  }
  
  return obj;
}

function evaluateArrayLiteral(node: PhixeoNode, runtime: PhixeoRuntime): any {
  return (node.elements || []).map(element => evaluateNode(element, runtime));
}

function evaluateJsxElement(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const tagName = node.tagName!;
  
  // Evaluate attributes
  const props: Record<string, any> = {};
  
  for (const attr of node.attributes || []) {
    props[attr.name] = evaluateNode(attr.value, runtime);
  }
  
  // Evaluate children
  const children = (node.children || []).map(child => evaluateNode(child, runtime));
  
  // In a real implementation, this would create React or similar virtual DOM elements
  return {
    type: tagName,
    props: {
      ...props,
      children: children.length === 0 ? undefined : children.length === 1 ? children[0] : children
    }
  };
}

function evaluatePropertyAccess(node: PhixeoNode, runtime: PhixeoRuntime): any {
  const object = evaluateNode(node.object!, runtime);
  const property = node.property!;
  
  if (object === null || object === undefined) {
    throw new Error(`Cannot read property '${property}' of ${object}`);
  }
  
  return object[property];
}

// Helper functions
function lookupVariable(name: string, scope: PhixeoScope): any {
  if (name in scope.variables) {
    return scope.variables[name];
  }
  
  if (scope.parent) {
    return lookupVariable(name, scope.parent);
  }
  
  throw new Error(`Variable ${name} not found`);
}

function lookupFunction(name: string, scope: PhixeoScope): PhixeoFunction | undefined {
  if (name in scope.functions) {
    return scope.functions[name];
  }
  
  if (scope.parent) {
    return lookupFunction(name, scope.parent);
  }
  
  return undefined;
}

// Create a new runtime environment
export function createRuntime(): PhixeoRuntime {
  return {
    scope: {
      variables: {},
      functions: {},
      classes: {},
      components: {}
    },
    modules: {},
    systemFunctions: {
      print: console.log,
      alert: (message: string) => window.alert(message),
      parseInt: (str: string) => parseInt(str, 10),
      parseFloat: (str: string) => parseFloat(str),
      toString: (value: any) => String(value)
    }
  };
}

// Load and run a Phixeo program
export async function loadPhixeoProgram(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    const code = await response.text();
    
    return runPhixeoCode(code);
  } catch (error) {
    console.error('Error loading Phixeo program:', error);
    throw error;
  }
}

// Run Phixeo code
export function runPhixeoCode(code: string): any {
  try {
    const tokens = tokenize(code);
    const ast = parse(tokens);
    const runtime = createRuntime();
    
    return interpret(ast, runtime);
  } catch (error) {
    console.error('Error running Phixeo code:', error);
    throw error;
  }
}

// Module exports
export default {
  tokenize,
  parse,
  interpret,
  createRuntime,
  loadPhixeoProgram,
  runPhixeoCode
};