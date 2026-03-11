import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shuffle } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { generateRandomString } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function RandomStringGenerator() {
  const [state, setState] = useToolState("random-string-generator", {
    output: "",
    length: "16",
    count: "1",
    options: {
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: false
    },
    customCharset: ""
  });

  const { output, length, count, options, customCharset } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const generateStrings = () => {
    const numLength = parseInt(length) || 16;
    const numCount = parseInt(count) || 1;

    let charset = "";

    if (customCharset) {
      charset = customCharset;
    } else {
      if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
      if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (options.numbers) charset += "0123456789";
      if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (!charset) {
      updateState({ output: "Please select at least one character type or provide a custom charset" });
      return;
    }

    const strings = [];
    for (let i = 0; i < numCount; i++) {
      strings.push(generateRandomString(numLength, charset));
    }

    updateState({ output: strings.join('\n') });
  };

  const clearAll = () => {
    updateState({
      output: "",
      length: "16",
      count: "1",
      customCharset: ""
    });
  };

  const presetPassword = () => {
    updateState({
      length: "12",
      count: "1",
      options: {
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true
      },
      customCharset: ""
    });
  };

  const presetApiKey = () => {
    updateState({
      length: "32",
      count: "1",
      options: {
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: false
      },
      customCharset: ""
    });
  };

  const presetNumeric = () => {
    updateState({
      length: "10",
      count: "1",
      options: {
        lowercase: false,
        uppercase: false,
        numbers: true,
        symbols: false
      },
      customCharset: ""
    });
  };

  return (
    <ToolLayout
      title="Random String Generator"
      description="Generate random strings with options"
      icon={<Shuffle className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Settings">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                min="1"
                max="1000"
                value={length}
                onChange={(e) => updateState({ length: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => updateState({ count: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Character Types</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lowercase"
                  checked={options.lowercase}
                  onCheckedChange={(checked) => updateState({ options: {...options, lowercase: !!checked} })}
                />
                <Label htmlFor="lowercase">Lowercase (a-z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uppercase"
                  checked={options.uppercase}
                  onCheckedChange={(checked) => updateState({ options: {...options, uppercase: !!checked} })}
                />
                <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="numbers"
                  checked={options.numbers}
                  onCheckedChange={(checked) => updateState({ options: {...options, numbers: !!checked} })}
                />
                <Label htmlFor="numbers">Numbers (0-9)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symbols"
                  checked={options.symbols}
                  onCheckedChange={(checked) => updateState({ options: {...options, symbols: !!checked} })}
                />
                <Label htmlFor="symbols">Symbols (!@#$...)</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="custom-charset">Custom Character Set (optional)</Label>
            <Input
              id="custom-charset"
              placeholder="Enter custom characters to use"
              value={customCharset}
              onChange={(e) => updateState({ customCharset: e.target.value })}
            />
          </div>

          <div>
            <Label>Quick Presets</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={presetPassword}>
                Strong Password
              </Button>
              <Button variant="outline" size="sm" onClick={presetApiKey}>
                API Key
              </Button>
              <Button variant="outline" size="sm" onClick={presetNumeric}>
                Numeric Only
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateStrings}>Generate</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          <div>
            <Label>Generated Strings</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No strings generated"}
            </div>
          </div>

          {output && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <h4 className="text-green-900 dark:text-green-200 font-medium mb-2">Generation Info</h4>
              <div className="text-green-800 dark:text-green-300 text-sm">
                <p>Length: {length} characters</p>
                <p>Count: {count} string(s)</p>
                <p>Character set: {customCharset || [
                  options.lowercase && "lowercase",
                  options.uppercase && "uppercase",
                  options.numbers && "numbers",
                  options.symbols && "symbols"
                ].filter(Boolean).join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
