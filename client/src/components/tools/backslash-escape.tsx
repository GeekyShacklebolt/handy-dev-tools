import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { escapeBackslashes, unescapeBackslashes } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function BackslashEscape() {
  const [state, setState] = useToolState("backslash-escape", {
    input: "",
    output: ""
  });

  const { input, output } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const escape = () => {
    const escaped = escapeBackslashes(input);
    updateState({ output: escaped });
  };

  const unescape = () => {
    const unescaped = unescapeBackslashes(input);
    updateState({ output: unescaped });
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: ""
    });
  };

  const loadExample = () => {
    updateState({ input: 'C:\\Users\\John\\Documents\\file.txt' });
  };

  return (
    <ToolLayout
      title="Backslash Escape/Unescape"
      description="Escape and unescape backslashes"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="backslash-input">Text with Backslashes</Label>
            <Textarea
              id="backslash-input"
              placeholder="Enter text with backslashes"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={escape}>Escape Backslashes</Button>
            <Button variant="outline" onClick={unescape}>Unescape Backslashes</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
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
