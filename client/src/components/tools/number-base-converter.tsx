import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { convertNumberBase } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function NumberBaseConverter() {
  const [state, setState] = useToolState("number-base-converter", {
    input: "",
    fromBase: "10",
    output: {
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: ""
    },
    error: ""
  });

  const { input, fromBase, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const convert = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter a number" });
        return;
      }

      const baseNum = parseInt(fromBase);
      const binary = convertNumberBase(input, baseNum, 2);
      const octal = convertNumberBase(input, baseNum, 8);
      const decimal = convertNumberBase(input, baseNum, 10);
      const hexadecimal = convertNumberBase(input, baseNum, 16);

      updateState({
        output: { binary, octal, decimal, hexadecimal },
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Conversion failed",
        output: { binary: "", octal: "", decimal: "", hexadecimal: "" }
      });
    }
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: { binary: "", octal: "", decimal: "", hexadecimal: "" },
      error: ""
    });
  };

  const loadExample = () => {
    updateState({
      input: "255",
      fromBase: "10"
    });
  };

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert between different number bases"
      icon={<Calculator className="h-6 w-6 text-blue-500" />}
      outputValue={`Binary: ${output.binary}\nOctal: ${output.octal}\nDecimal: ${output.decimal}\nHexadecimal: ${output.hexadecimal}`}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="number-input">Number</Label>
              <Input
                id="number-input"
                placeholder="Enter number"
                value={input}
                onChange={(e) => updateState({ input: e.target.value })}
                className="tool-input"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="from-base">From Base</Label>
              <Select value={fromBase} onValueChange={(value) => updateState({ fromBase: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Binary (2)</SelectItem>
                  <SelectItem value="8">Octal (8)</SelectItem>
                  <SelectItem value="10">Decimal (10)</SelectItem>
                  <SelectItem value="16">Hex (16)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convert}>Convert</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={`Binary: ${output.binary}\nOctal: ${output.octal}\nDecimal: ${output.decimal}\nHexadecimal: ${output.hexadecimal}`}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Binary (Base 2)</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.binary || "No output"}
              </div>
            </div>

            <div>
              <Label>Octal (Base 8)</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.octal || "No output"}
              </div>
            </div>

            <div>
              <Label>Decimal (Base 10)</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.decimal || "No output"}
              </div>
            </div>

            <div>
              <Label>Hexadecimal (Base 16)</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.hexadecimal || "No output"}
              </div>
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
