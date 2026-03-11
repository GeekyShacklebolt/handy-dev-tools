import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function URLParser() {
  const [state, setState] = useToolState("url-parser", {
    input: "",
    parsedURL: null as any,
    error: ""
  });

  const { input, parsedURL, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const parseURL = () => {
    try {
      const url = new URL(input);

      const parsed = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? '443' : '80'),
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        host: url.host,
        href: url.href
      };

      updateState({
        parsedURL: parsed,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Invalid URL format",
        parsedURL: null
      });
    }
  };

  const clearAll = () => {
    updateState({
      input: "",
      parsedURL: null,
      error: ""
    });
  };

  const exampleURL = () => {
    const example = "https://example.com:8080/path/to/page?param1=value1&param2=value2#section";
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="URL Parser"
      description="Parse URLs and extract components"
      icon={<Link className="h-6 w-6 text-blue-500" />}
      outputValue={parsedURL ? JSON.stringify(parsedURL, null, 2) : ""}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="url-input">URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="Enter URL to parse"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={parseURL}>Parse URL</Button>
            <Button variant="outline" onClick={exampleURL}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={parsedURL ? JSON.stringify(parsedURL, null, 2) : ""}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {parsedURL && (
            <div className="space-y-3">
              <div>
                <Label>Protocol</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.protocol}
                </div>
              </div>

              <div>
                <Label>Hostname</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.hostname}
                </div>
              </div>

              <div>
                <Label>Port</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.port}
                </div>
              </div>

              <div>
                <Label>Path</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.pathname}
                </div>
              </div>

              <div>
                <Label>Query String</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.search || "No query string"}
                </div>
              </div>

              <div>
                <Label>Fragment</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm mt-1">
                  {parsedURL.hash || "No fragment"}
                </div>
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
