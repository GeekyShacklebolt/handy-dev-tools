import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { generateHash } from "@/lib/utils/converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function HashGenerator() {
  const [state, setState] = useToolState("hash-generator", {
    input: "",
    hashes: {
      md5: "",
      sha1: "",
      sha256: "",
      sha512: ""
    },
    selectedAlgorithms: {
      md5: true,
      sha1: true,
      sha256: true,
      sha512: true
    }
  });

  const { input, hashes, selectedAlgorithms } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const generateHashes = () => {
    if (!input.trim()) {
      updateState({ hashes: { md5: "", sha1: "", sha256: "", sha512: "" } });
      return;
    }

    const results = {
      md5: selectedAlgorithms.md5 ? generateHash(input, 'md5') : "",
      sha1: selectedAlgorithms.sha1 ? generateHash(input, 'sha1') : "",
      sha256: selectedAlgorithms.sha256 ? generateHash(input, 'sha256') : "",
      sha512: selectedAlgorithms.sha512 ? generateHash(input, 'sha512') : ""
    };

    updateState({ hashes: results });
  };

  const clearAll = () => {
    updateState({
      input: "",
      hashes: { md5: "", sha1: "", sha256: "", sha512: "" }
    });
  };

  const loadExample = () => {
    updateState({ input: "Hello, World!" });
  };

  const formatOutput = () => {
    const results = [];
    if (hashes.md5) results.push(`MD5: ${hashes.md5}`);
    if (hashes.sha1) results.push(`SHA1: ${hashes.sha1}`);
    if (hashes.sha256) results.push(`SHA256: ${hashes.sha256}`);
    if (hashes.sha512) results.push(`SHA512: ${hashes.sha512}`);
    return results.join('\n');
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate various hash types"
      icon={<Lock className="h-6 w-6 text-blue-500" />}
      outputValue={formatOutput()}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hash-input">Text to Hash</Label>
            <Textarea
              id="hash-input"
              placeholder="Enter text to generate hashes"
              value={input}
              onChange={(e) => {
                const newValue = e.target.value;
                updateState({ input: newValue });
                // Auto-generate on typing
                setTimeout(() => generateHashes(), 100);
              }}
              className="tool-textarea"
            />
          </div>

          <div>
            <Label>Hash Algorithms</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="md5"
                  checked={selectedAlgorithms.md5}
                  onCheckedChange={(checked) => {
                    updateState({ selectedAlgorithms: {...selectedAlgorithms, md5: !!checked} });
                    setTimeout(() => generateHashes(), 100);
                  }}
                />
                <Label htmlFor="md5">MD5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sha1"
                  checked={selectedAlgorithms.sha1}
                  onCheckedChange={(checked) => {
                    updateState({ selectedAlgorithms: {...selectedAlgorithms, sha1: !!checked} });
                    setTimeout(() => generateHashes(), 100);
                  }}
                />
                <Label htmlFor="sha1">SHA-1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sha256"
                  checked={selectedAlgorithms.sha256}
                  onCheckedChange={(checked) => {
                    updateState({ selectedAlgorithms: {...selectedAlgorithms, sha256: !!checked} });
                    setTimeout(() => generateHashes(), 100);
                  }}
                />
                <Label htmlFor="sha256">SHA-256</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sha512"
                  checked={selectedAlgorithms.sha512}
                  onCheckedChange={(checked) => {
                    updateState({ selectedAlgorithms: {...selectedAlgorithms, sha512: !!checked} });
                    setTimeout(() => generateHashes(), 100);
                  }}
                />
                <Label htmlFor="sha512">SHA-512</Label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateHashes}>Generate Hashes</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={formatOutput()}>
        <div className="space-y-4">
          {hashes.md5 && (
            <div>
              <Label>MD5</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 break-all">
                {hashes.md5}
              </div>
            </div>
          )}

          {hashes.sha1 && (
            <div>
              <Label>SHA-1</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 break-all">
                {hashes.sha1}
              </div>
            </div>
          )}

          {hashes.sha256 && (
            <div>
              <Label>SHA-256</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 break-all">
                {hashes.sha256}
              </div>
            </div>
          )}

          {hashes.sha512 && (
            <div>
              <Label>SHA-512</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 break-all">
                {hashes.sha512}
              </div>
            </div>
          )}

          {!formatOutput() && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Enter text to generate hashes
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
