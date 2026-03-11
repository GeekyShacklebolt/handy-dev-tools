import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Type } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { convertStringCase } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function StringCaseConverter() {
  const [state, setState] = useToolState("string-case-converter", {
    input: "",
    outputs: {
      camelCase: "",
      PascalCase: "",
      snake_case: "",
      "kebab-case": "",
      SCREAMING_SNAKE_CASE: "",
      lowercase: "",
      UPPERCASE: "",
      "Title Case": ""
    }
  });

  const { input, outputs } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  // Auto-convert when input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.trim()) {
        convertAll(input);
      } else {
        updateState({
          outputs: {
            camelCase: "",
            PascalCase: "",
            snake_case: "",
            "kebab-case": "",
            SCREAMING_SNAKE_CASE: "",
            lowercase: "",
            UPPERCASE: "",
            "Title Case": ""
          }
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input]);

  const convertAll = (inputText?: string) => {
    const textToConvert = inputText ?? input;
    if (!textToConvert.trim()) {
      updateState({
        outputs: {
          camelCase: "",
          PascalCase: "",
          snake_case: "",
          "kebab-case": "",
          SCREAMING_SNAKE_CASE: "",
          lowercase: "",
          UPPERCASE: "",
          "Title Case": ""
        }
      });
      return;
    }

    updateState({
      outputs: {
        camelCase: convertStringCase(textToConvert, 'camelCase'),
        PascalCase: convertStringCase(textToConvert, 'PascalCase'),
        snake_case: convertStringCase(textToConvert, 'snake_case'),
        "kebab-case": convertStringCase(textToConvert, 'kebab-case'),
        SCREAMING_SNAKE_CASE: convertStringCase(textToConvert, 'SCREAMING_SNAKE_CASE'),
        lowercase: convertStringCase(textToConvert, 'lowercase'),
        UPPERCASE: convertStringCase(textToConvert, 'UPPERCASE'),
        "Title Case": convertStringCase(textToConvert, 'Title Case')
      }
    });
  };

  const handleConvertAll = () => {
    convertAll();
  };

  const clearAll = () => {
    updateState({
      input: "",
      outputs: {
        camelCase: "",
        PascalCase: "",
        snake_case: "",
        "kebab-case": "",
        SCREAMING_SNAKE_CASE: "",
        lowercase: "",
        UPPERCASE: "",
        "Title Case": ""
      }
    });
  };

  const loadExample = () => {
    updateState({ input: "Hello World Example Text" });
  };

  const formatOutput = () => {
    return Object.entries(outputs)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  return (
    <ToolLayout
      title="String Case Converter"
      description="Convert between different string cases"
      icon={<Type className="h-6 w-6 text-blue-500" />}
      outputValue={formatOutput()}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="string-input">Text to Convert</Label>
            <Input
              id="string-input"
              placeholder="Enter text to convert"
              value={input}
              onChange={(e) => {
                const newValue = e.target.value;
                updateState({ input: newValue });
              }}
              className="tool-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConvertAll}>Convert All</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={formatOutput()}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>camelCase</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.camelCase || "No output"}
              </div>
            </div>

            <div>
              <Label>PascalCase</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.PascalCase || "No output"}
              </div>
            </div>

            <div>
              <Label>snake_case</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.snake_case || "No output"}
              </div>
            </div>

            <div>
              <Label>kebab-case</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs["kebab-case"] || "No output"}
              </div>
            </div>

            <div>
              <Label>SCREAMING_SNAKE_CASE</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.SCREAMING_SNAKE_CASE || "No output"}
              </div>
            </div>

            <div>
              <Label>lowercase</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.lowercase || "No output"}
              </div>
            </div>

            <div>
              <Label>UPPERCASE</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs.UPPERCASE || "No output"}
              </div>
            </div>

            <div>
              <Label>Title Case</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {outputs["Title Case"] || "No output"}
              </div>
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
