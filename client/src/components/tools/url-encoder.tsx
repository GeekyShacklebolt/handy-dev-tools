import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { urlEncode, urlDecode } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function URLEncoder() {
  const [state, setState] = useToolState("url-encoder", {
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
      const encoded = urlEncode(input);
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
      const decoded = urlDecode(input);
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
      title="URL Encode/Decode"
      description="Encode and decode URLs"
      icon={<Link className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url-input">URL or Text</Label>
            <Textarea
              id="url-input"
              placeholder="Enter URL or text to encode/decode"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={encode}>Encode</Button>
            <Button variant="outline" onClick={decode}>Decode</Button>
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
