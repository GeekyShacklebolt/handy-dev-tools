import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode, Check, X, Search, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { JSONPath } from "jsonpath-plus";
import { useToolState, clearToolState } from "@/hooks/use-tool-state";

export default function JSONFormatter() {
  const [state, setState] = useToolState("json-formatter", {
    input: "",
    output: "",
    isValid: null as boolean | null,
    indentSize: "2",
    jsonPath: "",
    pathResult: "",
    pathResultParsed: null as any,
    parsedJson: null as any,
    collapsedNodes: [] as string[],
    displayMode: "formatted" as "formatted" | "minified"
  });

  const { input, output, isValid, indentSize, jsonPath, pathResult, pathResultParsed, parsedJson, displayMode } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      updateState({
        output: formatted,
        isValid: true,
        parsedJson: parsed,
        displayMode: "formatted"
      });
    } catch (error) {
      updateState({
        output: `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        isValid: false,
        parsedJson: null
      });
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      updateState({
        output: minified,
        isValid: true,
        parsedJson: parsed,
        displayMode: "minified"
      });
    } catch (error) {
      updateState({
        output: `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        isValid: false,
        parsedJson: null
      });
    }
  };

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(input);
      updateState({
        isValid: true,
        output: "✓ Valid JSON",
        parsedJson: parsed
      });
    } catch (error) {
      updateState({
        isValid: false,
        output: `✗ Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        parsedJson: null
      });
    }
  };

  const searchJsonPath = () => {
    if (!parsedJson) {
      updateState({ pathResult: "Please format or validate JSON first", pathResultParsed: null });
      return;
    }

    if (!jsonPath.trim()) {
      updateState({ pathResult: "", pathResultParsed: null });
      return;
    }

    try {
      const result = JSONPath({ path: jsonPath, json: parsedJson });
      if (result.length === 0) {
        updateState({ pathResult: "No matches found", pathResultParsed: null });
      } else {
        updateState({ 
          pathResult: JSON.stringify(result, null, 2),
          pathResultParsed: result
        });
      }
    } catch (error) {
      updateState({ 
        pathResult: `JSONPath Error: ${error instanceof Error ? error.message : 'Invalid path'}`,
        pathResultParsed: null
      });
    }
  };

  // Auto-format JSON as user types or changes indent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.trim()) {
        formatJSON();
      } else {
        updateState({
          output: "",
          isValid: null,
          parsedJson: null
        });
      }
    }, 500); // 500ms debounce for auto-formatting

    return () => clearTimeout(timeoutId);
  }, [input, indentSize]);

  // Real-time JSONPath search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (parsedJson && jsonPath.trim()) {
        searchJsonPath();
      } else if (!jsonPath.trim()) {
        updateState({ pathResult: "" });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [jsonPath, parsedJson]);

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      isValid: null,
      jsonPath: "",
      pathResult: "",
      pathResultParsed: null,
      parsedJson: null,
      displayMode: "formatted"
    });
  };

    const renderCollapsibleJSON = (obj: any, path: string = "", indent: number = 0): string => {
    const indentStr = " ".repeat(indent * parseInt(indentSize));
    const nextIndentStr = " ".repeat((indent + 1) * parseInt(indentSize));

    if (obj === null) return `<span style="color: #8b5cf6;">null</span>`;
    if (typeof obj === "boolean") return `<span style="color: #8b5cf6;">${obj}</span>`;
    if (typeof obj === "number") return `<span style="color: #f59e0b;">${obj}</span>`;
    if (typeof obj === "string") return `<span style="color: #10b981;">"${obj}"</span>`;

        if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";

      const isCollapsed = state.collapsedNodes?.includes(path) || false;
      const toggleIcon = isCollapsed ?
        `<span class="cursor-pointer inline-block w-4 h-4 mr-1" onclick="toggleNode('${path}')">▶</span>` :
        `<span class="cursor-pointer inline-block w-4 h-4 mr-1" onclick="toggleNode('${path}')">▼</span>`;

      if (isCollapsed) {
        return `${toggleIcon}[<span style="color: #8b5cf6;">${obj.length} items</span>]`;
      }

      const items = obj.map((item, index) =>
        renderCollapsibleJSON(item, `${path}[${index}]`, indent + 1)
      ).join(`,\n${nextIndentStr}`);

      return `${toggleIcon}[\n${nextIndentStr}${items}\n${indentStr}]`;
    }

        if (typeof obj === "object") {
      const keys = Object.keys(obj);
      if (keys.length === 0) return "{}";

      const isCollapsed = state.collapsedNodes?.includes(path) || false;
      const toggleIcon = isCollapsed ?
        `<span class="cursor-pointer inline-block w-4 h-4 mr-1" onclick="toggleNode('${path}')">▶</span>` :
        `<span class="cursor-pointer inline-block w-4 h-4 mr-1" onclick="toggleNode('${path}')">▼</span>`;

      if (isCollapsed) {
        return `${toggleIcon}{<span style="color: #8b5cf6;">${keys.length} properties</span>}`;
      }

      const items = keys.map(key => {
        const keyPath = path ? `${path}.${key}` : key;
        const value = renderCollapsibleJSON(obj[key], keyPath, indent + 1);
        return `<span style="color: #ffffff;">"${key}"</span>: ${value}`;
      }).join(`,\n${nextIndentStr}`);

      return `${toggleIcon}{\n${nextIndentStr}${items}\n${indentStr}}`;
    }

    return String(obj);
  };

  const toggleNode = useCallback((path: string) => {
    const newCollapsedNodes = [...(state.collapsedNodes || [])];
    const index = newCollapsedNodes.indexOf(path);
    if (index > -1) {
      newCollapsedNodes.splice(index, 1);
    } else {
      newCollapsedNodes.push(path);
    }
    updateState({ collapsedNodes: newCollapsedNodes });
  }, [state.collapsedNodes, updateState]);

  // Make toggleNode available globally for onclick handlers
  useEffect(() => {
    (window as any).toggleNode = toggleNode;
    return () => {
      delete (window as any).toggleNode;
    };
  }, [state.collapsedNodes, toggleNode]);

  const highlightJSON = (jsonString: string) => {
    return jsonString
      .replace(/"([^"]+)":/g, '<span style="color: #ffffff;">"$1"</span>:')
      .replace(/"([^"]*)"(?=\s*[,}\]])/g, '<span style="color: #10b981;">"$1"</span>')
      .replace(/\b(true|false|null)\b/g, '<span style="color: #8b5cf6;">$1</span>')
      .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color: #f59e0b;">$1</span>');
  };

  const loadExample = () => {
    const example = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, beautify and minify JSON data"
      icon={<FileCode className="h-6 w-6 text-blue-500" />}
      outputValue={output}
      infoContent={
        <div>
          <p className="mb-3">
            JSON (JavaScript Object Notation) is a lightweight data-interchange format.
            This tool helps you format and beautify JSON data for better readability and debugging.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>JSONPath Search:</strong> Use JSONPath expressions to query and extract specific data from your JSON.
            Available after formatting your JSON.
          </p>
        </div>
      }
    >
      <ToolInput
        title="Input"
        headerActions={
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={formatJSON}>Format</Button>
            <Button variant="outline" onClick={minifyJSON}>Minify</Button>
            <Select value={indentSize} onValueChange={(value) => updateState({ indentSize: value })}>
              <SelectTrigger className="w-24">
                <SelectValue>Indent</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
                <SelectItem value="8">8 Spaces</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
          </div>

          <div>
            <Label htmlFor="json-input">JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder='{"name": "John", "age": 30}'
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea-json h-[500px] resize-none"
            />
          </div>
        </div>
      </ToolInput>

            <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          {/* JSONPath Search aligned with buttons */}
          <div>
            <Input
              id="jsonpath-input"
              placeholder="JSON Path e.g: $.store.book[*].author"
              value={jsonPath}
              onChange={(e) => updateState({ jsonPath: e.target.value })}
              className="h-10"
              disabled={!parsedJson}
            />
          </div>

          <div>
            <Label>{jsonPath.trim() ? 'JSONPath Result' : 'Formatted JSON'}</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                                          {jsonPath.trim() && pathResult ? (
                <div
                  className="text-foreground font-mono text-xs whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: pathResultParsed ? renderCollapsibleJSON(pathResultParsed, "pathResult") : highlightJSON(pathResult)
                  }}
                />
              ) : (
                <div
                  className="text-foreground font-mono text-xs whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: parsedJson && displayMode === "formatted" ? renderCollapsibleJSON(parsedJson) : (output ? highlightJSON(output) : "No output")
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
