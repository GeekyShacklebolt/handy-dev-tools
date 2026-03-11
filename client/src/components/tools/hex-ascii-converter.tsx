import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRightLeft } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { hexToAscii, asciiToHex } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function HexAsciiConverter() {
  const [state, setState] = useToolState("hex-ascii-converter", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const convertToAscii = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter hex data" });
        return;
      }

      const ascii = hexToAscii(input);
      updateState({
        output: ascii,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Hex to ASCII conversion failed",
        output: ""
      });
    }
  };

  const convertToHex = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter ASCII text" });
        return;
      }

      const hex = asciiToHex(input);
      updateState({
        output: hex,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "ASCII to Hex conversion failed",
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

  const loadHexExample = () => {
    updateState({ input: "48656C6C6F20576F726C6421" });
  };

  const loadAsciiExample = () => {
    updateState({ input: "Hello World!" });
  };

  return (
    <ToolLayout
      title="Hex ↔ ASCII Converter"
      description="Convert between hexadecimal and ASCII"
      icon={<ArrowRightLeft className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hex-ascii-input">Hex Data or ASCII Text</Label>
            <Textarea
              id="hex-ascii-input"
              placeholder="Enter hex data (e.g., 48656C6C6F) or ASCII text"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertToAscii}>Hex → ASCII</Button>
            <Button variant="outline" onClick={convertToHex}>ASCII → Hex</Button>
            <Button variant="outline" onClick={loadHexExample}>Load Hex Example</Button>
            <Button variant="outline" onClick={loadAsciiExample}>Load ASCII Example</Button>
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
            <Label>Converted Data</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>

          {input && output && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-2">Conversion Details</h4>
              <div className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <p>Input length: {input.length} characters</p>
                <p>Output length: {output.length} characters</p>
                {input.match(/^[0-9A-Fa-f\s]+$/) ? (
                  <p>Direction: Hex → ASCII</p>
                ) : (
                  <p>Direction: ASCII → Hex</p>
                )}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
