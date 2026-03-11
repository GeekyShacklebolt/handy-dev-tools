import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function SVGCSSConverter() {
  const [state, setState] = useToolState("svg-css-converter", {
    input: "",
    output: "",
    outputType: "data-uri",
    error: ""
  });

  const { input, output, outputType, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const convertSVG = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter SVG code" });
        return;
      }

      let svgCode = input.trim();

      // Ensure SVG has proper opening tag
      if (!svgCode.startsWith('<svg')) {
        updateState({ error: "Input must be valid SVG code starting with <svg>" });
        return;
      }

      // Clean up the SVG for embedding
      svgCode = svgCode.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      let cssOutput = "";

      switch (outputType) {
        case "data-uri":
          const encodedSVG = encodeURIComponent(svgCode);
          cssOutput = `background-image: url("data:image/svg+xml,${encodedSVG}");`;
          break;

        case "base64":
          const base64SVG = btoa(unescape(encodeURIComponent(svgCode)));
          cssOutput = `background-image: url("data:image/svg+xml;base64,${base64SVG}");`;
          break;

        case "mask":
          const maskSVG = encodeURIComponent(svgCode);
          cssOutput = `-webkit-mask: url("data:image/svg+xml,${maskSVG}") no-repeat center;
mask: url("data:image/svg+xml,${maskSVG}") no-repeat center;
-webkit-mask-size: contain;
mask-size: contain;`;
          break;

        case "clip-path":
          // Extract path data for clip-path (simplified)
          const pathMatch = svgCode.match(/d="([^"]+)"/);
          if (pathMatch) {
            cssOutput = `clip-path: path('${pathMatch[1]}');`;
          } else {
            cssOutput = `/* No path data found in SVG for clip-path */`;
          }
          break;

        default:
          cssOutput = `background-image: url("data:image/svg+xml,${encodeURIComponent(svgCode)}");`;
      }

      updateState({
        output: cssOutput,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Failed to convert SVG to CSS",
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

  const loadExample = () => {
    const example = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 6v6l4 2"/>
</svg>`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="SVG to CSS Converter"
      description="Convert SVG to CSS"
      icon={<Palette className="h-6 w-6 text-blue-500" />}
      outputValue={output}
      infoContent={
        <p>
          SVG to CSS conversion allows you to embed SVG graphics directly in CSS using data URIs,
          base64 encoding, or as CSS masks and clip-paths. This eliminates the need for separate image files
          and can improve loading performance.
        </p>
      }
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="output-type">Output Type</Label>
            <Select value={outputType} onValueChange={(value) => updateState({ outputType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data-uri">Data URI (URL encoded)</SelectItem>
                <SelectItem value="base64">Base64 Data URI</SelectItem>
                <SelectItem value="mask">CSS Mask</SelectItem>
                <SelectItem value="clip-path">CSS Clip Path</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="svg-input">SVG Code</Label>
            <Textarea
              id="svg-input"
              placeholder="Enter SVG code"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertSVG}>Convert to CSS</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
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
            <Label>CSS Code</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>

          {output && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-2">Usage Example</h4>
              <div className="text-blue-800 dark:text-blue-300 text-sm font-mono">
                <div className="whitespace-pre-wrap">
{`.my-element {
  ${output}
  width: 24px;
  height: 24px;
}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
