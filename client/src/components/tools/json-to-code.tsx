import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function JSONToCode() {
  const [state, setState] = useToolState("json-to-code", {
    input: "",
    output: "",
    language: "typescript",
    className: "User",
    error: ""
  });

  const { input, output, language, className, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const convertJSON = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter JSON data" });
        return;
      }

      const jsonData = JSON.parse(input);
      let code = "";

      switch (language) {
        case "typescript":
          code = generateTypeScriptInterface(jsonData, className);
          break;
        case "javascript":
          code = generateJavaScriptClass(jsonData, className);
          break;
        case "python":
          code = generatePythonClass(jsonData, className);
          break;
        case "java":
          code = generateJavaClass(jsonData, className);
          break;
        case "csharp":
          code = generateCSharpClass(jsonData, className);
          break;
        case "go":
          code = generateGoStruct(jsonData, className);
          break;
        default:
          code = generateTypeScriptInterface(jsonData, className);
      }

      updateState({
        output: code,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Invalid JSON data",
        output: ""
      });
    }
  };

  const generateTypeScriptInterface = (data: any, name: string): string => {
    const interfaces: string[] = [];

    const getType = (value: any, key: string, parentName: string): string => {
      if (value === null) return "null";
      if (typeof value === "string") return "string";
      if (typeof value === "number") return "number";
      if (typeof value === "boolean") return "boolean";
      if (Array.isArray(value)) {
        if (value.length === 0) return "any[]";
        const itemType = getType(value[0], key, parentName);
        return `${itemType}[]`;
      }
      if (typeof value === "object") {
        const nestedName = key.charAt(0).toUpperCase() + key.slice(1);
        generateInterface(value, nestedName);
        return nestedName;
      }
      return "any";
    };

    const generateInterface = (obj: any, interfaceName: string) => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object" && !Array.isArray(obj[0])) {
          generateInterface(obj[0], interfaceName);
        }
        return;
      }

      let result = `interface ${interfaceName} {\n`;
      Object.entries(obj).forEach(([key, value]) => {
        const type = getType(value, key, interfaceName);
        result += `  ${key}: ${type};\n`;
      });
      result += "}";
      interfaces.push(result);
    };

    generateInterface(data, name);
    return interfaces.join("\n\n");
  };

  const generateJavaScriptClass = (data: any, name: string): string => {
    const obj = Array.isArray(data) ? (data[0] || {}) : data;
    const properties = Object.keys(obj).map(key => `    this.${key} = data.${key};`).join('\n');

    return `class ${name} {
  constructor(data) {
${properties}
  }

  static fromJSON(jsonString) {
    return new ${name}(JSON.parse(jsonString));
  }

  toJSON() {
    return JSON.stringify(this);
  }
}`;
  };

  const generatePythonClass = (data: any, name: string): string => {
    const classes: string[] = [];

    const generateClass = (obj: any, clsName: string) => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") generateClass(obj[0], clsName);
        return;
      }
      const properties = Object.keys(obj).map(key => `        self.${key} = data.get('${key}')`).join('\n');
      Object.entries(obj).forEach(([key, value]) => {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          generateClass(value, key.charAt(0).toUpperCase() + key.slice(1));
        } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
          generateClass(value[0], key.charAt(0).toUpperCase() + key.slice(1));
        }
      });
      classes.push(`class ${clsName}:
    def __init__(self, data):
${properties}

    @classmethod
    def from_json(cls, json_str):
        import json
        return cls(json.loads(json_str))

    def to_json(self):
        import json
        return json.dumps(self.__dict__)`);
    };

    generateClass(data, name);
    return classes.join('\n\n');
  };

  const generateJavaClass = (data: any, name: string): string => {
    const classes: string[] = [];

    const getType = (value: any, key: string): string => {
      if (value === null) return "Object";
      if (typeof value === "string") return "String";
      if (typeof value === "number") return Number.isInteger(value) ? "int" : "double";
      if (typeof value === "boolean") return "boolean";
      if (Array.isArray(value)) {
        if (value.length === 0) return "List<Object>";
        const itemType = getType(value[0], key);
        return `List<${itemType === "int" ? "Integer" : itemType === "double" ? "Double" : itemType === "boolean" ? "Boolean" : itemType}>`;
      }
      if (typeof value === "object") {
        const nestedName = key.charAt(0).toUpperCase() + key.slice(1);
        generateJavaClassInner(value, nestedName);
        return nestedName;
      }
      return "Object";
    };

    const generateJavaClassInner = (obj: any, clsName: string) => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") generateJavaClassInner(obj[0], clsName);
        return;
      }
      const fields = Object.entries(obj).map(([key, value]) => {
        return `    private ${getType(value, key)} ${key};`;
      }).join('\n');

      const getters = Object.entries(obj).map(([key, value]) => {
        const type = getType(value, key);
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        return `    public ${type} get${cap}() { return ${key}; }`;
      }).join('\n');

      const setters = Object.entries(obj).map(([key, value]) => {
        const type = getType(value, key);
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        return `    public void set${cap}(${type} ${key}) { this.${key} = ${key}; }`;
      }).join('\n');

      classes.push(`public class ${clsName} {
${fields}

    public ${clsName}() {}

${getters}

${setters}
}`);
    };

    generateJavaClassInner(data, name);
    return classes.join('\n\n');
  };

  const generateCSharpClass = (data: any, name: string): string => {
    const classes: string[] = [];

    const getType = (value: any, key: string): string => {
      if (value === null) return "object";
      if (typeof value === "string") return "string";
      if (typeof value === "number") return Number.isInteger(value) ? "int" : "double";
      if (typeof value === "boolean") return "bool";
      if (Array.isArray(value)) {
        if (value.length === 0) return "List<object>";
        return `List<${getType(value[0], key)}>`;
      }
      if (typeof value === "object") {
        const nestedName = key.charAt(0).toUpperCase() + key.slice(1);
        generateCSharpInner(value, nestedName);
        return nestedName;
      }
      return "object";
    };

    const generateCSharpInner = (obj: any, clsName: string) => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") generateCSharpInner(obj[0], clsName);
        return;
      }
      const properties = Object.entries(obj).map(([key, value]) => {
        const type = getType(value, key);
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        return `    public ${type} ${cap} { get; set; }`;
      }).join('\n');

      classes.push(`public class ${clsName}
{
${properties}
}`);
    };

    generateCSharpInner(data, name);
    return classes.join('\n\n');
  };

  const generateGoStruct = (data: any, name: string): string => {
    const structs: string[] = [];

    const getType = (value: any, key: string): string => {
      if (value === null) return "interface{}";
      if (typeof value === "string") return "string";
      if (typeof value === "number") return Number.isInteger(value) ? "int" : "float64";
      if (typeof value === "boolean") return "bool";
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]interface{}";
        return `[]${getType(value[0], key)}`;
      }
      if (typeof value === "object") {
        const nestedName = key.charAt(0).toUpperCase() + key.slice(1);
        generateGoInner(value, nestedName);
        return nestedName;
      }
      return "interface{}";
    };

    const generateGoInner = (obj: any, structName: string) => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === "object") generateGoInner(obj[0], structName);
        return;
      }
      const fields = Object.entries(obj).map(([key, value]) => {
        const type = getType(value, key);
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        return `    ${cap} ${type} \`json:"${key}"\``;
      }).join('\n');

      structs.push(`type ${structName} struct {
${fields}
}`);
    };

    generateGoInner(data, name);
    return structs.join('\n\n');
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      error: ""
    });
  };

  const loadExample = () => {
    const example = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "active": true,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "zipCode": "12345"
  },
  "hobbies": ["reading", "swimming", "coding"]
}`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="JSON to Code Generator"
      description="Generate code from JSON data"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language">Target Language</Label>
              <Select value={language} onValueChange={(value) => updateState({ language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class-name">Class/Interface Name</Label>
              <Input
                id="class-name"
                placeholder="Enter name"
                value={className}
                onChange={(e) => updateState({ className: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="json-input">JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder="Enter JSON data to generate code from"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertJSON}>Generate Code</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
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
            <Label>Generated Code ({language})</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
