import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, AlertTriangle } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function HTMLPreview() {
  const [state, setState] = useToolState("html-preview", {
    input: ""
  });

  const { input } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    // Function to wrap HTML with light theme styling for dark mode visibility
  const wrapHTMLWithLightTheme = (html: string) => {
    // Check if the HTML already has a style tag with body styling
    const hasBodyStyle = /<style[^>]*>[\s\S]*body\s*\{[\s\S]*<\/style>/i.test(html);

    if (hasBodyStyle) {
      // If it has body styling, ensure it has light theme colors
      return html.replace(
        /<style[^>]*>([\s\S]*?)<\/style>/i,
        (match, styleContent) => {
          // Add light theme colors if not already present
          if (!styleContent.includes('background-color') && !styleContent.includes('background:')) {
            styleContent += '\n        body { background-color: white; color: #333; }';
          }
          return `<style>${styleContent}</style>`;
        }
      );
    } else {
      // If no style tag, add one with light theme
      const lightThemeStyle = `
    <style>
        body {
            background-color: white !important;
            color: #333 !important;
        }
        * {
            color: inherit;
        }
    </style>`;

      // Insert the style tag after the opening head tag, or create head if it doesn't exist
      if (html.includes('<head>')) {
        return html.replace('<head>', `<head>${lightThemeStyle}`);
      } else if (html.includes('<html>')) {
        return html.replace('<html>', `<html><head>${lightThemeStyle}</head>`);
      } else {
        // If no HTML structure, wrap it
        return `<!DOCTYPE html>
<html>
<head>${lightThemeStyle}</head>
<body>${html}</body>
</html>`;
      }
    }
  };

  const clearAll = () => {
    updateState({
      input: ""
    });
  };

  const loadExample = () => {
    const example = `<!DOCTYPE html>
<html>
<head>
    <title>Example Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: white;
            color: #333;
        }
        h1 { color: #333; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a <span class="highlight">highlighted</span> paragraph.</p>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</body>
</html>`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="HTML Preview"
      description="Preview HTML code in real-time"
      icon={<Eye className="h-6 w-6 text-blue-500" />}
      outputValue={input}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="html-input">HTML Code</Label>
            <Textarea
              id="html-input"
              placeholder="Enter HTML code to preview"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={input} canCopy={false}>
        <div className="space-y-4">
          {input ? (
            <div>
              <Label>HTML Preview</Label>
              <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-md">
                <iframe
                  srcDoc={wrapHTMLWithLightTheme(input)}
                  className="w-full h-96 rounded-md"
                  title="HTML Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Enter HTML code to see the preview
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
