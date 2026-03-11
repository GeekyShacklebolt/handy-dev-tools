import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { base64Encode, base64Decode } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function Base64Encoder() {
  const [state, setState] = useToolState("base64-encoder", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const encode = () => {
    try {
      const encoded = base64Encode(input);
      updateState({
        output: encoded,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Encoding failed",
        output: ""
      });
    }
  };

  const decode = () => {
    try {
      const decoded = base64Decode(input);
      updateState({
        output: decoded,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Decoding failed",
        output: ""
      });
    }
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      error: ""
    });
  };

  return (
    <ToolLayout
      title="Base64 String Encoder/Decoder"
      description="Encode and decode Base64 strings"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="base64-input">Text or Base64 String</Label>
            <Textarea
              id="base64-input"
              placeholder="Enter text to encode or Base64 string to decode"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={encode}>Encode to Base64</Button>
            <Button variant="outline" onClick={decode}>Decode from Base64</Button>
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
