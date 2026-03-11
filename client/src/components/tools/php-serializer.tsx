import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function PHPSerializer() {
  const [state, setState] = useToolState("php-serializer", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const serialize = () => {
    try {
      // Simple serialization - convert JSON to PHP serialized format
      const data = JSON.parse(input);
      const serialized = phpSerialize(data);

      updateState({
        output: serialized,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Invalid JSON input or serialization failed",
        output: ""
      });
    }
  };

  const unserialize = () => {
    try {
      const unserialized = phpUnserialize(input);
      const json = JSON.stringify(unserialized, null, 2);

      updateState({
        output: json,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Invalid PHP serialized data or unserialization failed",
        output: ""
      });
    }
  };

  const phpSerialize = (data: any): string => {
    if (data === null) {
      return 'N;';
    } else if (typeof data === 'boolean') {
      return `b:${data ? '1' : '0'};`;
    } else if (typeof data === 'number') {
      if (Number.isInteger(data)) {
        return `i:${data};`;
      } else {
        return `d:${data};`;
      }
    } else if (typeof data === 'string') {
      const byteLength = new TextEncoder().encode(data).length;
      return `s:${byteLength}:"${data}";`;
    } else if (Array.isArray(data)) {
      let result = `a:${data.length}:{`;
      data.forEach((item: any, index: number) => {
        result += `i:${index};${phpSerialize(item)}`;
      });
      result += '}';
      return result;
    } else if (typeof data === 'object') {
      const keys = Object.keys(data);
      let result = `a:${keys.length}:{`;
      keys.forEach(key => {
        const keyByteLength = new TextEncoder().encode(key).length;
        result += `s:${keyByteLength}:"${key}";${phpSerialize(data[key])}`;
      });
      result += '}';
      return result;
    }
    return '';
  };

  const phpUnserialize = (str: string): any => {
    let index = 0;

    const parseValue = (): any => {
      const type = str[index];
      index += 2; // Skip type and ':'

      switch (type) {
        case 'N':
          index++; // Skip ';'
          return null;

        case 'b':
          const boolValue = str[index] === '1';
          index += 2; // Skip value and ';'
          return boolValue;

        case 'i':
          const intEnd = str.indexOf(';', index);
          const intValue = parseInt(str.substring(index, intEnd));
          index = intEnd + 1;
          return intValue;

        case 'd':
          const doubleEnd = str.indexOf(';', index);
          const doubleValue = parseFloat(str.substring(index, doubleEnd));
          index = doubleEnd + 1;
          return doubleValue;

        case 's':
          const lengthEnd = str.indexOf(':', index);
          const byteLen = parseInt(str.substring(index, lengthEnd));
          index = lengthEnd + 2; // Skip ':' and '"'
          // Read byteLen bytes, not characters (handles multibyte UTF-8)
          const encoder = new TextEncoder();
          let strVal = '';
          let bytesRead = 0;
          let charIdx = index;
          while (bytesRead < byteLen && charIdx < str.length) {
            const char = str[charIdx];
            bytesRead += encoder.encode(char).length;
            strVal += char;
            charIdx++;
          }
          index = charIdx + 2; // Skip '";'
          return strVal;

        case 'a':
          const arrayLengthEnd = str.indexOf(':', index);
          const arrayLength = parseInt(str.substring(index, arrayLengthEnd));
          index = arrayLengthEnd + 2; // Skip ':' and '{'

          const result: any = {};
          for (let i = 0; i < arrayLength; i++) {
            const key = parseValue();
            const value = parseValue();
            result[key] = value;
          }
          index++; // Skip '}'

          // Convert to array if all keys are sequential integers starting from 0
          const keys = Object.keys(result);
          const isArray = keys.every((key, i) => key === i.toString());
          if (isArray) {
            return keys.map(key => result[key]);
          }

          return result;

        default:
          throw new Error(`Unknown type: ${type}`);
      }
    };

    return parseValue();
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      error: ""
    });
  };

  const loadJsonExample = () => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "active": true,
  "scores": [85, 92, 78],
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  }
}`;
    updateState({ input: example });
  };

  const loadSerializedExample = () => {
    const example = 'a:4:{s:4:"name";s:8:"John Doe";s:3:"age";i:30;s:6:"active";b:1;s:6:"scores";a:3:{i:0;i:85;i:1;i:92;i:2;i:78;}}';
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="PHP Serializer"
      description="Serialize and unserialize PHP data"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="php-serializer-input">JSON Data or PHP Serialized String</Label>
            <Textarea
              id="php-serializer-input"
              placeholder="Enter JSON data to serialize or PHP serialized string to unserialize"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={serialize}>Serialize (JSON → PHP)</Button>
            <Button variant="outline" onClick={unserialize}>Unserialize (PHP → JSON)</Button>
            <Button variant="outline" onClick={loadJsonExample}>Load JSON Example</Button>
            <Button variant="outline" onClick={loadSerializedExample}>Load Serialized Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <Label>Result</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
