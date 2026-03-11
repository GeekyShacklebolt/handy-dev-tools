import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fingerprint, RefreshCw } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { generateUUID } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function UUIDGenerator() {
  const [state, setState] = useToolState("uuid-generator", {
    output: "",
    count: "1",
    uuidType: "v4",
    inputUUID: "",
    uuidInfo: ""
  });

  const { output, count, uuidType, inputUUID, uuidInfo } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const generateUUIDs = () => {
    const num = parseInt(count);
    const uuids = [];

    for (let i = 0; i < num; i++) {
      uuids.push(generateUUID());
    }

    updateState({ output: uuids.join('\n') });
  };

  const analyzeUUID = () => {
    try {
      const uuid = inputUUID.trim();

      if (!uuid) {
        updateState({ uuidInfo: "Please enter a UUID" });
        return;
      }

      // Basic UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(uuid)) {
        updateState({ uuidInfo: "Invalid UUID format" });
        return;
      }

      // Extract version
      const version = uuid.charAt(14);

      let info = `UUID: ${uuid}\n`;
      info += `Version: ${version}\n`;
      info += `Length: ${uuid.length} characters\n`;

      switch (version) {
        case '1':
          info += `Type: Time-based UUID\n`;
          break;
        case '2':
          info += `Type: DCE Security UUID\n`;
          break;
        case '3':
          info += `Type: Name-based UUID (MD5)\n`;
          break;
        case '4':
          info += `Type: Random UUID\n`;
          break;
        case '5':
          info += `Type: Name-based UUID (SHA-1)\n`;
          break;
        default:
          info += `Type: Unknown version\n`;
      }

      updateState({ uuidInfo: info });
    } catch (error) {
      updateState({ uuidInfo: "Error analyzing UUID" });
    }
  };

  const clearAll = () => {
    updateState({
      output: "",
      inputUUID: "",
      uuidInfo: ""
    });
  };

  return (
    <ToolLayout
      title="UUID/ULID Generator"
      description="Generate and decode UUIDs and ULIDs"
      icon={<Fingerprint className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Generator">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
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
            <div className="flex-1">
              <Label htmlFor="uuid-type">Type</Label>
              <Select value={uuidType} onValueChange={(value) => updateState({ uuidType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v4">UUID v4 (Random)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateUUIDs}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Generate
            </Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="uuid-input">Analyze UUID</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="uuid-input"
                placeholder="Enter UUID to analyze"
                value={inputUUID}
                onChange={(e) => updateState({ inputUUID: e.target.value })}
              />
              <Button onClick={analyzeUUID}>Analyze</Button>
            </div>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          {output && (
            <div>
              <Label>Generated UUIDs</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
                {output}
              </div>
            </div>
          )}

          {uuidInfo && (
            <div>
              <Label>UUID Analysis</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap">
                {uuidInfo}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
