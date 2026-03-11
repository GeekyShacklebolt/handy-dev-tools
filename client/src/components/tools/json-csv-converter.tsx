import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { jsonToCsv, csvToJson } from "@/lib/utils/advanced-converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function JSONCSVConverter() {
  const [state, setState] = useToolState("json-csv-converter", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const convertToCSV = () => {
    try {
      const csv = jsonToCsv(input);
      updateState({
        output: csv,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "JSON to CSV conversion failed",
        output: ""
      });
    }
  };

  const convertToJSON = () => {
    try {
      const json = csvToJson(input);
      updateState({
        output: json,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "CSV to JSON conversion failed",
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

  const loadJSONExample = () => {
    const example = `[
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "email": "john@example.com"
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "city": "Los Angeles",
    "email": "jane@example.com"
  },
  {
    "name": "Bob Johnson",
    "age": 35,
    "city": "Chicago",
    "email": "bob@example.com"
  }
]`;
    updateState({ input: example });
  };

  const loadCSVExample = () => {
    const example = `name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="JSON ↔ CSV Converter"
      description="Convert between JSON and CSV formats"
      icon={<Table className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="json-csv-input">JSON Array or CSV Data</Label>
            <Textarea
              id="json-csv-input"
              placeholder="Enter JSON array or CSV data"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertToCSV}>JSON → CSV</Button>
            <Button variant="outline" onClick={convertToJSON}>CSV → JSON</Button>
            <Button variant="outline" onClick={loadJSONExample}>Load JSON Example</Button>
            <Button variant="outline" onClick={loadCSVExample}>Load CSV Example</Button>
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
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
