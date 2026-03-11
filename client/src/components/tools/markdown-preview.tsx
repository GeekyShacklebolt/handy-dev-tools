import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

let markedModule: typeof import('marked') | null = null;
let dompurifyModule: typeof import('dompurify') | null = null;

async function loadMarkdownLibs() {
  if (!markedModule) {
    markedModule = await import('marked');
    markedModule.marked.setOptions({ gfm: true, breaks: true });
  }
  if (!dompurifyModule) {
    dompurifyModule = await import('dompurify');
  }
  return { marked: markedModule.marked, DOMPurify: dompurifyModule.default };
}

export default function MarkdownPreview() {
  const [state, setState] = useToolState("markdown-preview", {
    input: ""
  });
  const [htmlOutput, setHtmlOutput] = useState("");

  const { input } = state;

  const updateState = useCallback(async (updates: Partial<typeof state>) => {
    const newState = { ...state, ...updates };
    setState(newState);

    const md = updates.input ?? state.input;
    if (!md) {
      setHtmlOutput("");
      return;
    }

    try {
      const { marked, DOMPurify } = await loadMarkdownLibs();
      const rawHtml = await marked.parse(md);
      const sanitized = DOMPurify.sanitize(rawHtml);
      setHtmlOutput(sanitized);
    } catch {
      setHtmlOutput("<p>Error rendering markdown</p>");
    }
  }, [state, setState]);

  const clearAll = () => {
    setState({ input: "" });
    setHtmlOutput("");
  };

  const loadExample = () => {
    const example = `# Markdown Preview Example

## Introduction
This is a **sample** markdown document to demonstrate the preview functionality.

### Features
- *Italic text*
- **Bold text**
- \`Inline code\`
- [Links](https://example.com)

### Code Block
\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### Blockquote
> This is a blockquote example.
> It can span multiple lines.

### List
1. First item
2. Second item
3. Third item

### Table
| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |
| Jane | 25  | LA   |

---

That's all folks!`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="Markdown Preview"
      description="Preview Markdown with live rendering"
      icon={<FileText className="h-5 w-5 text-blue-500" />}
      outputValue={input}
      infoContent={
        <p>
          Supports GitHub Flavored Markdown (GFM) including tables, task lists, and fenced code blocks.
          Content is sanitized to prevent XSS attacks.
        </p>
      }
    >
      <ToolInput title="Input">
        <div className="space-y-3">
          <div>
            <Label htmlFor="markdown-input">Markdown Content</Label>
            <Textarea
              id="markdown-input"
              placeholder="Enter Markdown content"
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

      <ToolOutput title="Preview" value={input} canCopy={false}>
        <div className="space-y-3">
          {input ? (
            <div>
              <Label>Rendered Preview</Label>
              <div
                className="p-3 bg-muted rounded-md mt-1 prose prose-sm max-w-none dark:prose-invert max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
                style={{ lineHeight: '1.6' }}
              />
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-xs">
              Enter Markdown content to see the preview
            </div>
          )}

          {input && (
            <div>
              <Label>Raw HTML Output</Label>
              <div className="p-2 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {htmlOutput}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
