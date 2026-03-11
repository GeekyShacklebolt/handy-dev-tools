import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

// Tokenizer for PHP arrays
type TokenType = 'string' | 'number' | 'bool' | 'null' | 'arrow' | 'comma' | 'open_bracket' | 'close_bracket' | 'array_keyword';
interface Token { type: TokenType; value: string }

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  // Strip PHP tags and variable assignment
  let code = input.replace(/<\?php\s*/gi, '').replace(/\?>\s*$/gi, '').trim();
  code = code.replace(/^\$\w+\s*=\s*/g, '').replace(/;\s*$/, '').trim();

  while (i < code.length) {
    const ch = code[i];

    // Skip whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // Single-quoted string
    if (ch === "'") {
      let str = '';
      i++;
      while (i < code.length && code[i] !== "'") {
        if (code[i] === '\\' && i + 1 < code.length && code[i + 1] === "'") {
          str += "'";
          i += 2;
        } else {
          str += code[i];
          i++;
        }
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      let str = '';
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\' && i + 1 < code.length) {
          const next = code[i + 1];
          if (next === '"') { str += '"'; i += 2; }
          else if (next === '\\') { str += '\\'; i += 2; }
          else if (next === 'n') { str += '\n'; i += 2; }
          else if (next === 't') { str += '\t'; i += 2; }
          else { str += code[i]; i++; }
        } else {
          str += code[i];
          i++;
        }
      }
      i++; // skip closing quote
      tokens.push({ type: 'string', value: str });
      continue;
    }

    // Arrow =>
    if (ch === '=' && code[i + 1] === '>') {
      tokens.push({ type: 'arrow', value: '=>' });
      i += 2;
      continue;
    }

    // Comma
    if (ch === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }

    // Brackets
    if (ch === '[') { tokens.push({ type: 'open_bracket', value: '[' }); i++; continue; }
    if (ch === ']') { tokens.push({ type: 'close_bracket', value: ']' }); i++; continue; }

    // array( keyword
    if (code.substring(i, i + 5).toLowerCase() === 'array' && /\s*\(/.test(code.substring(i + 5))) {
      tokens.push({ type: 'array_keyword', value: 'array' });
      i += 5;
      while (i < code.length && code[i] !== '(') i++;
      i++; // skip (
      continue;
    }

    // Closing paren for array()
    if (ch === ')') { tokens.push({ type: 'close_bracket', value: ')' }); i++; continue; }

    // Boolean and null (case-insensitive)
    const remaining = code.substring(i).toLowerCase();
    if (remaining.startsWith('true') && !/[a-z0-9_]/i.test(code[i + 4] || '')) {
      tokens.push({ type: 'bool', value: 'true' }); i += 4; continue;
    }
    if (remaining.startsWith('false') && !/[a-z0-9_]/i.test(code[i + 5] || '')) {
      tokens.push({ type: 'bool', value: 'false' }); i += 5; continue;
    }
    if (remaining.startsWith('null') && !/[a-z0-9_]/i.test(code[i + 4] || '')) {
      tokens.push({ type: 'null', value: 'null' }); i += 4; continue;
    }

    // Number (int or float, negative)
    if (/[-\d.]/.test(ch)) {
      let num = '';
      if (ch === '-') { num += '-'; i++; }
      while (i < code.length && /[\d.eE]/.test(code[i])) {
        num += code[i]; i++;
      }
      if (num && num !== '-') {
        tokens.push({ type: 'number', value: num });
        continue;
      }
    }

    // Skip unknown characters
    i++;
  }

  return tokens;
}

function parsePhpArray(tokens: Token[]): any {
  let pos = 0;

  function parseValue(): any {
    if (pos >= tokens.length) throw new Error('Unexpected end of input');
    const token = tokens[pos];

    if (token.type === 'open_bracket' || token.type === 'array_keyword') {
      return parseArray();
    }
    if (token.type === 'string') { pos++; return token.value; }
    if (token.type === 'number') { pos++; return token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value, 10); }
    if (token.type === 'bool') { pos++; return token.value === 'true'; }
    if (token.type === 'null') { pos++; return null; }
    throw new Error(`Unexpected token: ${token.type} "${token.value}"`);
  }

  function parseArray(): any {
    pos++; // skip open bracket or array keyword

    const items: [any, any][] = [];
    let autoIndex = 0;
    let isAssociative = false;

    while (pos < tokens.length) {
      const token = tokens[pos];
      if (token.type === 'close_bracket') { pos++; break; }
      if (token.type === 'comma') { pos++; continue; }

      const firstValue = parseValue();

      // Check for arrow (associative key)
      if (pos < tokens.length && tokens[pos]?.type === 'arrow') {
        pos++; // skip arrow
        const secondValue = parseValue();
        items.push([firstValue, secondValue]);
        isAssociative = true;
      } else {
        items.push([autoIndex++, firstValue]);
      }
    }

    if (isAssociative) {
      const obj: Record<string, any> = {};
      for (const [key, value] of items) {
        obj[String(key)] = value;
      }
      return obj;
    }

    return items.map(([_, value]) => value);
  }

  return parseValue();
}

function jsonToPhpArray(obj: any, indent: number = 0): string {
  const spaces = '    '.repeat(indent);
  const inner = '    '.repeat(indent + 1);

  if (obj === null) return 'null';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') return `'${obj.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map(item => `${inner}${jsonToPhpArray(item, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${spaces}]`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return '[]';
    const items = entries.map(([key, value]) =>
      `${inner}'${key}' => ${jsonToPhpArray(value, indent + 1)}`
    );
    return `[\n${items.join(',\n')},\n${spaces}]`;
  }

  return String(obj);
}

export default function PHPJSONConverter() {
  const [state, setState] = useToolState("php-json-converter", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const phpToJson = () => {
    try {
      const tokens = tokenize(input);
      const parsed = parsePhpArray(tokens);
      const json = JSON.stringify(parsed, null, 2);
      updateState({ output: json, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Invalid PHP array syntax",
        output: ""
      });
    }
  };

  const jsonToPhp = () => {
    try {
      const parsed = JSON.parse(input);
      const php = `<?php\n$data = ${jsonToPhpArray(parsed)};\n`;
      updateState({ output: php, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Invalid JSON",
        output: ""
      });
    }
  };

  const clearAll = () => {
    updateState({ input: "", output: "", error: "" });
  };

  const loadPhpExample = () => {
    updateState({ input: `<?php
$data = [
    'name' => 'John Doe',
    'age' => 30,
    'city' => 'New York',
    'hobbies' => ['reading', 'swimming', 'coding'],
    'active' => true,
    'score' => 95.5,
    'address' => [
        'street' => '123 Main St',
        'zip' => '10001',
    ],
    'tags' => array('developer', 'gamer'),
    'metadata' => null,
];` });
  };

  const loadJsonExample = () => {
    updateState({ input: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "active": true,
  "address": {
    "street": "123 Main St",
    "zip": "10001"
  }
}` });
  };

  return (
    <ToolLayout
      title="PHP <-> JSON Converter"
      description="Convert between PHP arrays and JSON"
      icon={<ArrowRightLeft className="h-5 w-5 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-3">
          <div>
            <Label htmlFor="php-json-input">PHP Array or JSON</Label>
            <Textarea
              id="php-json-input"
              placeholder="Enter PHP array or JSON data"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={phpToJson}>PHP &rarr; JSON</Button>
            <Button variant="outline" onClick={jsonToPhp}>JSON &rarr; PHP</Button>
            <Button variant="outline" onClick={loadPhpExample}>PHP Example</Button>
            <Button variant="outline" onClick={loadJsonExample}>JSON Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-3">
          {error && (
            <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md text-xs">
              {error}
            </div>
          )}
          <div>
            <Label>Result</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
