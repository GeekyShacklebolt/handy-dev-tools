import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2 } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

let beautifyLib: typeof import('js-beautify') | null = null;

async function loadBeautify() {
  if (!beautifyLib) {
    beautifyLib = await import('js-beautify');
  }
  return beautifyLib;
}

export default function CodeBeautifier() {
  const [state, setState] = useToolState("code-beautifier", {
    input: "",
    output: "",
    language: "javascript",
    error: ""
  });

  const { input, output, language, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const beautifyCode = async () => {
    try {
      let beautified = input;

      if (language === "json") {
        beautified = JSON.stringify(JSON.parse(input), null, 2);
      } else {
        const lib = await loadBeautify();
        const opts = { indent_size: 2, wrap_line_length: 80 };

        switch (language) {
          case "javascript":
            beautified = lib.js_beautify(input, opts);
            break;
          case "html":
            beautified = lib.html_beautify(input, { ...opts, indent_inner_html: true });
            break;
          case "css":
            beautified = lib.css_beautify(input, opts);
            break;
          case "xml":
            beautified = lib.html_beautify(input, { ...opts, indent_inner_html: true });
            break;
          default:
            beautified = lib.js_beautify(input, opts);
        }
      }

      updateState({ output: beautified, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Beautification failed",
        output: ""
      });
    }
  };

  const minifyCode = () => {
    try {
      let minified = input;

      switch (language) {
        case "javascript":
        case "json":
          minified = JSON.stringify(JSON.parse(input));
          break;
        case "html":
        case "xml":
          minified = input.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
          break;
        case "css":
          minified = input
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .replace(/\s*:\s*/g, ':')
            .trim();
          break;
        default:
          minified = input.replace(/\s+/g, ' ').trim();
      }

      updateState({ output: minified, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Minification failed",
        output: ""
      });
    }
  };

  const clearAll = () => {
    updateState({ input: "", output: "", error: "" });
  };

  const loadExample = () => {
    const examples: Record<string, string> = {
      javascript: 'function hello(name){if(name){return "Hello, "+name+"!";}else{return "Hello, World!";}}const arr=[1,2,3].map(x=>x*2);',
      json: '{"name":"John","age":30,"city":"New York","hobbies":["reading","swimming"],"address":{"street":"123 Main St","zip":"10001"}}',
      html: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="container"><h1>Hello World</h1><p>This is a test.</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>',
      css: 'body{margin:0;padding:0;font-family:Arial,sans-serif;}h1{color:#333;font-size:24px;margin-bottom:10px;}.container{max-width:1200px;margin:0 auto;padding:20px;}@media(max-width:768px){.container{padding:10px;}}',
      xml: '<?xml version="1.0"?><catalog><book id="1"><title>XML Developer Guide</title><author>John Doe</author><price>44.95</price></book><book id="2"><title>Learning XML</title><author>Jane Smith</author><price>39.95</price></book></catalog>'
    };
    updateState({ input: examples[language] || examples.javascript });
  };

  return (
    <ToolLayout
      title="Code Beautifier/Minifier"
      description="Beautify or minify code (HTML, CSS, JS, etc.)"
      icon={<Wand2 className="h-5 w-5 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-3">
          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={(value) => updateState({ language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="code-input">Code</Label>
            <Textarea
              id="code-input"
              placeholder="Enter code to beautify or minify"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={beautifyCode}>Beautify</Button>
            <Button variant="outline" onClick={minifyCode}>Minify</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-3">
          {error && (
            <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md text-xs">
              {error}
            </div>
          )}

          <div>
            <Label>Formatted Code</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
