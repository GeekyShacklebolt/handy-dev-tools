import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function RegexTester() {
  const [state, setState] = useToolState("regex-tester", {
    pattern: "",
    testString: "",
    flags: {
      global: false,
      ignoreCase: false,
      multiline: false
    },
    matches: [] as string[],
    highlightedText: "",
    error: ""
  });

  const { pattern, testString, flags, matches, highlightedText, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const testRegex = () => {
    try {
      if (!pattern) {
        updateState({ error: "Please enter a regex pattern" });
        return;
      }

      let flagString = "";
      if (flags.global) flagString += "g";
      if (flags.ignoreCase) flagString += "i";
      if (flags.multiline) flagString += "m";

      const regex = new RegExp(pattern, flagString);
      const foundMatches = [];
      let match;

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push(match[0]);
          if (!flags.global) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          foundMatches.push(match[0]);
        }
      }

      // Highlight matches in the text
      const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      let highlighted = escapeHtml(testString);
      if (foundMatches.length > 0) {
        foundMatches.forEach(match => {
          const escapedMatch = escapeHtml(match);
          highlighted = highlighted.replace(
            new RegExp(escapedMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
            `<mark class="regex-match">${escapedMatch}</mark>`
          );
        });
      }

      updateState({
        matches: foundMatches,
        highlightedText: highlighted,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Invalid regex pattern",
        matches: [],
        highlightedText: ""
      });
    }
  };

  const clearAll = () => {
    updateState({
      pattern: "",
      testString: "",
      matches: [],
      highlightedText: "",
      error: ""
    });
  };

  const loadExample = () => {
    updateState({
      pattern: "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
      testString: "Contact us at support@example.com or admin@test.org for assistance.",
      flags: { global: true, ignoreCase: true, multiline: false }
    });
  };

  return (
    <ToolLayout
      title="RegExp Tester"
      description="Test regular expressions with highlighting"
      icon={<Search className="h-6 w-6 text-blue-500" />}
      outputValue={matches.join('\n')}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pattern">Regex Pattern</Label>
            <Input
              id="pattern"
              placeholder="Enter regex pattern"
              value={pattern}
              onChange={(e) => updateState({ pattern: e.target.value })}
              className="tool-input"
            />
          </div>

          <div>
            <Label>Flags</Label>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="global"
                  checked={flags.global}
                  onCheckedChange={(checked) => updateState({ flags: {...flags, global: !!checked} })}
                />
                <Label htmlFor="global">Global (g)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ignoreCase"
                  checked={flags.ignoreCase}
                  onCheckedChange={(checked) => updateState({ flags: {...flags, ignoreCase: !!checked} })}
                />
                <Label htmlFor="ignoreCase">Ignore Case (i)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multiline"
                  checked={flags.multiline}
                  onCheckedChange={(checked) => updateState({ flags: {...flags, multiline: !!checked} })}
                />
                <Label htmlFor="multiline">Multiline (m)</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="test-string">Test String</Label>
            <Textarea
              id="test-string"
              placeholder="Enter text to test against"
              value={testString}
              onChange={(e) => updateState({ testString: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={testRegex}>Test Regex</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={matches.join('\n')}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <Label>Matches ({matches.length})</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 max-h-32 overflow-y-auto">
              {matches.length > 0 ? matches.join('\n') : "No matches found"}
            </div>
          </div>

          <div>
            <Label>Highlighted Text</Label>
            <div
              className="p-3 bg-muted rounded-md text-sm mt-1 whitespace-pre-wrap max-h-64 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: highlightedText || testString || "No text to highlight" }}
            />
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
