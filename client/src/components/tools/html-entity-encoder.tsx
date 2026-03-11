import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { htmlEncode, htmlDecode } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function HTMLEntityEncoder() {
  const [state, setState] = useToolState("html-entity-encoder", {
    input: "",
    output: ""
  });

  const { input, output } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const encode = () => {
    const encoded = htmlEncode(input);
    updateState({ output: encoded });
  };

  const decode = () => {
    const decoded = htmlDecode(input);
    updateState({ output: decoded });
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: ""
    });
  };

  const loadExample = () => {
    updateState({ input: '<div class="example">Hello & welcome to "HTML" entities!</div>' });
  };

  return (
    <ToolLayout
      title="HTML Entity Encoder/Decoder"
      description="Encode and decode HTML entities"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="html-input">Text or HTML Entities</Label>
            <Textarea
              id="html-input"
              placeholder="Enter text to encode or HTML entities to decode"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={encode}>Encode</Button>
            <Button variant="outline" onClick={decode}>Decode</Button>
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
