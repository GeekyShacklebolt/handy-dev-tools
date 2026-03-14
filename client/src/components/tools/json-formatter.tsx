import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode, Trash2, Wand2 } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { JSONPath } from "jsonpath-plus";
import { jsonrepair } from "jsonrepair";
import { useToolState } from "@/hooks/use-tool-state";

// Close unclosed strings at end of line so jsonrepair can handle them
function fixUnclosedStrings(text: string): string {
  return text.split('\n').map(line => {
    let quoteCount = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"' && (i === 0 || line[i - 1] !== '\\')) {
        quoteCount++;
      }
    }
    if (quoteCount % 2 !== 0) {
      return line.trimEnd() + '"';
    }
    return line;
  }).join('\n');
}

function smartRepair(text: string): string {
  try {
    return jsonrepair(text);
  } catch (_) {
    // jsonrepair failed — try fixing unclosed strings first, then repair again
    return jsonrepair(fixUnclosedStrings(text));
  }
}

function getErrorLines(original: string): Set<number> {
  const errorLines = new Set<number>();
  try {
    JSON.parse(original);
    return errorLines;
  } catch (_) {}

  try {
    const repaired = smartRepair(original);
    const origLines = original.split('\n');
    const repLines = repaired.split('\n');
    const maxLines = Math.max(origLines.length, repLines.length);
    for (let i = 0; i < maxLines; i++) {
      if ((origLines[i] || '') !== (repLines[i] || '')) {
        errorLines.add(i);
      }
    }
  } catch (_) {
    // If repair also fails, try to extract position from native error
    try {
      JSON.parse(original);
    } catch (e: any) {
      const match = e.message?.match(/position (\d+)/);
      if (match) {
        const pos = parseInt(match[1]);
        const before = original.slice(0, pos);
        const line = before.split('\n').length - 1;
        errorLines.add(line);
      }
    }
  }
  return errorLines;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderHighlightedInput(text: string, errorLines: Set<number>): string {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const escaped = escapeHtml(line) || ' '; // preserve empty lines
    if (errorLines.has(i)) {
      return `<span class="json-error-line">${escaped}</span>`;
    }
    // Basic JSON syntax coloring for the input
    return escaped
      .replace(/^(\s*)("(?:[^"\\]|\\.)*")(\s*:\s*)/g, '$1<span class="json-key">$2</span>$3')
      .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="json-str">$1</span>')
      .replace(/:\s*(true|false|null)\b/g, ': <span class="json-kw">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, ': <span class="json-num">$1</span>');
  }).join('\n');
}

export default function JSONFormatter() {
  const [state, setState] = useToolState("json-formatter", {
    input: "",
    output: "",
    isValid: null as boolean | null,
    autoRepair: true,
    wasRepaired: false,
    indentSize: "2",
    jsonPath: "",
    pathResult: "",
    pathResultParsed: null as any,
    parsedJson: null as any,
    collapsedNodes: [] as string[],
    displayMode: "formatted" as "formatted" | "minified"
  });

  const { input, output, isValid, autoRepair, wasRepaired, indentSize, jsonPath, pathResult, pathResultParsed, parsedJson, displayMode } = state;

  // Check if repair is possible for the current input
  const [canRepair, setCanRepair] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [errorLines, setErrorLines] = useState<Set<number>>(new Set());

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  // Sync scroll between textarea and highlight overlay
  const syncScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const parseWithRepair = (text: string): { parsed: any; repaired: boolean } => {
    let nativeError: Error | null = null;
    try {
      return { parsed: JSON.parse(text), repaired: false };
    } catch (e) {
      nativeError = e as Error;
      if (!autoRepair) throw nativeError;
    }
    try {
      const repaired = smartRepair(text);
      return { parsed: JSON.parse(repaired), repaired: true };
    } catch (_) {
      // Repair also failed — throw the original native error (clearer message)
      throw nativeError;
    }
  };

  const formatJSON = () => {
    try {
      const { parsed, repaired } = parseWithRepair(input);
      const formatted = JSON.stringify(parsed, null, parseInt(indentSize));
      updateState({
        output: formatted,
        isValid: true,
        wasRepaired: repaired,
        parsedJson: parsed,
        displayMode: "formatted"
      });
    } catch (error) {
      updateState({
        output: `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        isValid: false,
        wasRepaired: false,
        parsedJson: null
      });
    }
  };

  const minifyJSON = () => {
    try {
      const { parsed, repaired } = parseWithRepair(input);
      const minified = JSON.stringify(parsed);
      updateState({
        output: minified,
        isValid: true,
        wasRepaired: repaired,
        parsedJson: parsed,
        displayMode: "minified"
      });
    } catch (error) {
      updateState({
        output: `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        isValid: false,
        wasRepaired: false,
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

  // Compute error lines for highlighting + check if repair is possible
  useEffect(() => {
    if (!input.trim()) {
      setErrorLines(new Set());
      setCanRepair(false);
      return;
    }
    const timeout = setTimeout(() => {
      setErrorLines(getErrorLines(input));
      // Check if input needs repair and if repair succeeds
      try {
        JSON.parse(input);
        setCanRepair(false); // Valid JSON, no repair needed
      } catch {
        try {
          const repaired = smartRepair(input);
          JSON.parse(repaired);
          setCanRepair(true);
          if (!autoRepair) updateState({ autoRepair: true }); // Auto-enable when fixable
        } catch {
          setCanRepair(false); // Repair also fails
        }
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [input]);

  // Auto-format JSON as user types
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
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [input, indentSize, autoRepair]);

  // Real-time JSONPath search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (parsedJson && jsonPath.trim()) {
        searchJsonPath();
      } else if (!jsonPath.trim()) {
        updateState({ pathResult: "" });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [jsonPath, parsedJson]);

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      isValid: null,
      wasRepaired: false,
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

  useEffect(() => {
    (window as any).toggleNode = toggleNode;
    return () => { delete (window as any).toggleNode; };
  }, [state.collapsedNodes, toggleNode]);

  const highlightJSON = (jsonString: string) => {
    return escapeHtml(jsonString)
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={formatJSON}>Format</Button>
            <Button size="sm" variant="outline" onClick={minifyJSON}>Minify</Button>
            <Select value={indentSize} onValueChange={(value) => updateState({ indentSize: value })}>
              <SelectTrigger className="h-8 w-[90px] text-xs px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
                <SelectItem value="8">8 Spaces</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={loadExample}>Sample</Button>
            <div className="flex items-center gap-1.5 ml-auto">
              <Switch
                id="auto-repair"
                checked={autoRepair && canRepair}
                onCheckedChange={(checked) => updateState({ autoRepair: checked })}
                disabled={!canRepair}
              />
              <Label htmlFor="auto-repair" className={`text-xs flex items-center gap-1 ${canRepair ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <Wand2 className="h-3 w-3" />
                Auto-fix
              </Label>
            </div>
          </div>

          {/* Code editor with error highlights */}
          <div className="json-editor-wrap relative h-[500px] rounded-md border border-input bg-background overflow-hidden">
            <div
              ref={highlightRef}
              className="json-editor-highlights absolute inset-0 p-3 font-mono text-xs whitespace-pre overflow-auto pointer-events-none"
              aria-hidden="true"
              dangerouslySetInnerHTML={{
                __html: renderHighlightedInput(input, errorLines) + '\n'
              }}
            />
            <textarea
              ref={textareaRef}
              id="json-input"
              placeholder='{"name": "John", "age": 30}'
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              onScroll={syncScroll}
              className="json-editor-textarea absolute inset-0 p-3 font-mono text-xs whitespace-pre bg-transparent text-transparent caret-white resize-none w-full h-full outline-none overflow-auto"
              spellCheck={false}
            />
          </div>

          {errorLines.size > 0 && (
            <div className="text-xs text-red-400">
              {errorLines.size} error{errorLines.size > 1 ? 's' : ''} detected
              {autoRepair && wasRepaired && ' (auto-fixed in output)'}
            </div>
          )}
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-3">
          <Input
            id="jsonpath-input"
            placeholder="JSONPath e.g: $.store.book[*].author"
            value={jsonPath}
            onChange={(e) => updateState({ jsonPath: e.target.value })}
            className="h-8 text-xs"
            disabled={!parsedJson}
          />

          <div className="p-3 bg-muted rounded-md font-mono text-xs whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {jsonPath.trim() && pathResult ? (
              <div
                className="text-foreground"
                dangerouslySetInnerHTML={{
                  __html: pathResultParsed ? renderCollapsibleJSON(pathResultParsed, "pathResult") : highlightJSON(pathResult)
                }}
              />
            ) : (
              <div
                className="text-foreground"
                dangerouslySetInnerHTML={{
                  __html: parsedJson && displayMode === "formatted" ? renderCollapsibleJSON(parsedJson) : (output ? highlightJSON(output) : "No output")
                }}
              />
            )}
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
