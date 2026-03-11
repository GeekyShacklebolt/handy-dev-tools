import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { sortLines, deduplicateLines } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function LineSortDedupe() {
  const [state, setState] = useToolState("line-sort-dedupe", {
    input: "",
    output: "",
    options: {
      sort: true,
      dedupe: true,
      ascending: true,
      caseSensitive: false,
      removeEmpty: true
    }
  });

  const { input, output, options } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const processLines = () => {
    if (!input.trim()) {
      updateState({ output: "" });
      return;
    }

    let result = input;

    // Remove empty lines if requested
    if (options.removeEmpty) {
      result = result.split('\n').filter(line => line.trim() !== '').join('\n');
    }

    // Case handling
    if (!options.caseSensitive) {
      // For case insensitive operations, we need to handle this differently
      const lines = result.split('\n');
      const processedLines = lines.map(line => line.toLowerCase());

      if (options.sort) {
        const sortedIndices = processedLines
          .map((line, index) => ({ line, index }))
          .sort((a, b) => options.ascending ? a.line.localeCompare(b.line) : b.line.localeCompare(a.line))
          .map(item => item.index);

        result = sortedIndices.map(index => lines[index]).join('\n');
      }

      if (options.dedupe) {
        const seen = new Set();
        const uniqueLines = [];
        const resultLines = result.split('\n');

        for (const line of resultLines) {
          const lowerLine = line.toLowerCase();
          if (!seen.has(lowerLine)) {
            seen.add(lowerLine);
            uniqueLines.push(line);
          }
        }
        result = uniqueLines.join('\n');
      }
    } else {
      // Case sensitive operations
      if (options.sort) {
        result = sortLines(result, options.ascending);
      }

      if (options.dedupe) {
        result = deduplicateLines(result);
      }
    }

    updateState({ output: result });
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: ""
    });
  };

  const loadExample = () => {
    const example = `apple
banana
Apple
cherry
banana
date
Cherry
elderberry

fig
apple
grape`;
    updateState({ input: example });
  };

  const getStats = () => {
    if (!input && !output) return null;

    const inputLines = input.split('\n').filter(line => line.trim() !== '');
    const outputLines = output.split('\n').filter(line => line.trim() !== '');

    return {
      inputLines: inputLines.length,
      outputLines: outputLines.length,
      removed: inputLines.length - outputLines.length
    };
  };

  const stats = getStats();

  return (
    <ToolLayout
      title="Line Sort/Dedupe"
      description="Sort lines and remove duplicates"
      icon={<ArrowUpDown className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="lines-input">Lines to Process</Label>
            <Textarea
              id="lines-input"
              placeholder="Enter lines of text to sort and/or deduplicate"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div>
            <Label>Processing Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort"
                  checked={options.sort}
                  onCheckedChange={(checked) => updateState({ options: {...options, sort: !!checked} })}
                />
                <Label htmlFor="sort">Sort lines</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dedupe"
                  checked={options.dedupe}
                  onCheckedChange={(checked) => updateState({ options: {...options, dedupe: !!checked} })}
                />
                <Label htmlFor="dedupe">Remove duplicates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ascending"
                  checked={options.ascending}
                  onCheckedChange={(checked) => updateState({ options: {...options, ascending: !!checked} })}
                  disabled={!options.sort}
                />
                <Label htmlFor="ascending">Ascending order</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="case-sensitive"
                  checked={options.caseSensitive}
                  onCheckedChange={(checked) => updateState({ options: {...options, caseSensitive: !!checked} })}
                />
                <Label htmlFor="case-sensitive">Case sensitive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remove-empty"
                  checked={options.removeEmpty}
                  onCheckedChange={(checked) => updateState({ options: {...options, removeEmpty: !!checked} })}
                />
                <Label htmlFor="remove-empty">Remove empty lines</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={processLines}>Process Lines</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          <div>
            <Label>Processed Lines</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>

          {stats && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-2">Processing Statistics</h4>
              <div className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <p>Input lines: {stats.inputLines}</p>
                <p>Output lines: {stats.outputLines}</p>
                <p>Lines removed: {stats.removed}</p>
                <p>Operations: {[
                  options.sort && `Sort (${options.ascending ? 'ascending' : 'descending'})`,
                  options.dedupe && 'Deduplicate',
                  options.removeEmpty && 'Remove empty lines',
                  !options.caseSensitive && 'Case insensitive'
                ].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
