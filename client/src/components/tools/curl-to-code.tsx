import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function CurlToCode() {
  const [state, setState] = useToolState("curl-to-code", {
    input: "",
    output: "",
    language: "javascript",
    error: ""
  });

  const { input, output, language, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const convertCurl = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter a cURL command" });
        return;
      }

      const curlCommand = input.trim();

      // Tokenize: split on whitespace respecting single/double quotes and backslash continuations
      const normalized = curlCommand.replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ');
      const tokens: string[] = [];
      let current = '';
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < normalized.length; i++) {
        const ch = normalized[i];
        if (ch === '\\' && i + 1 < normalized.length && !inSingle) {
          current += normalized[i + 1];
          i++;
        } else if (ch === "'" && !inDouble) {
          inSingle = !inSingle;
        } else if (ch === '"' && !inSingle) {
          inDouble = !inDouble;
        } else if (/\s/.test(ch) && !inSingle && !inDouble) {
          if (current) { tokens.push(current); current = ''; }
        } else {
          current += ch;
        }
      }
      if (current) tokens.push(current);

      // Parse tokens into structured request
      let url = '';
      let method = 'GET';
      const headers: { [key: string]: string } = {};
      let data = '';

      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t === 'curl') continue;

        if (t === '-X' || t === '--request') {
          method = tokens[++i]?.toUpperCase() || 'GET';
        } else if (t === '-H' || t === '--header') {
          const header = tokens[++i] || '';
          const colonIdx = header.indexOf(':');
          if (colonIdx > 0) {
            headers[header.substring(0, colonIdx).trim()] = header.substring(colonIdx + 1).trim();
          }
        } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
          data = tokens[++i] || '';
          if (method === 'GET') method = 'POST';
        } else if (t === '-u' || t === '--user') {
          const creds = tokens[++i] || '';
          headers['Authorization'] = 'Basic ' + btoa(creds);
        } else if (t === '-L' || t === '--location' || t === '--compressed') {
          // flags we acknowledge but don't need to act on
        } else if (t === '-b' || t === '--cookie') {
          headers['Cookie'] = tokens[++i] || '';
        } else if (t === '-A' || t === '--user-agent') {
          headers['User-Agent'] = tokens[++i] || '';
        } else if (t.startsWith('-')) {
          // Unknown flag, skip its value if it doesn't start with -
          if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) i++;
        } else if (!url) {
          url = t;
        }
      }

      let code = "";

      switch (language) {
        case "javascript":
          code = generateJavaScriptCode(url, method, headers, data);
          break;
        case "python":
          code = generatePythonCode(url, method, headers, data);
          break;
        case "php":
          code = generatePHPCode(url, method, headers, data);
          break;
        case "go":
          code = generateGoCode(url, method, headers, data);
          break;
        case "curl":
          code = generateCurlCode(url, method, headers, data);
          break;
        default:
          code = generateJavaScriptCode(url, method, headers, data);
      }

      updateState({
        output: code,
        error: ""
      });
    } catch (err) {
      updateState({
        error: "Failed to parse cURL command",
        output: ""
      });
    }
  };

  const generateJavaScriptCode = (url: string, method: string, headers: any, data: string): string => {
    const headersStr = Object.keys(headers).length > 0
      ? JSON.stringify(headers, null, 2)
      : "{}";

    return `fetch('${url}', {
  method: '${method.toUpperCase()}',
  headers: ${headersStr},${data ? `
  body: ${JSON.stringify(data)}` : ''}
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`;
  };

  const generatePythonCode = (url: string, method: string, headers: any, data: string): string => {
    const headersStr = Object.keys(headers).length > 0
      ? JSON.stringify(headers, null, 2)
      : "{}";

    return `import requests

url = "${url}"
headers = ${headersStr}${data ? `
data = ${JSON.stringify(data)}` : ''}

response = requests.${method}(url, headers=headers${data ? ', data=data' : ''})
print(response.json())`;
  };

  const generatePHPCode = (url: string, method: string, headers: any, data: string): string => {
    const headersArray = Object.entries(headers).map(([key, value]) => `    "${key}: ${value}"`).join(',\n');

    return `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_URL => "${url}",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "${method.toUpperCase()}",${headersArray ? `
    CURLOPT_HTTPHEADER => array(
${headersArray}
    ),` : ''}${data ? `
    CURLOPT_POSTFIELDS => ${JSON.stringify(data)},` : ''}
));

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>`;
  };

  const generateGoCode = (url: string, method: string, headers: any, data: string): string => {
    const headersCode = Object.entries(headers).map(([key, value]) =>
      `    req.Header.Set("${key}", "${value}")`
    ).join('\n');

    return `package main

import (
    "fmt"
    "net/http"${data ? `
    "strings"` : ''}
)

func main() {
    url := "${url}"${data ? `
    data := strings.NewReader(${JSON.stringify(data)})

    req, err := http.NewRequest("${method.toUpperCase()}", url, data)` : `

    req, err := http.NewRequest("${method.toUpperCase()}", url, nil)`}
    if err != nil {
        panic(err)
    }
${headersCode}

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    fmt.Println(resp.Status)
}`;
  };

  const generateCurlCode = (url: string, method: string, headers: any, data: string): string => {
    const headersStr = Object.entries(headers).map(([key, value]) =>
      `-H "${key}: ${value}"`
    ).join(' ');

    return `curl -X ${method.toUpperCase()} "${url}"${headersStr ? ` ${headersStr}` : ''}${data ? ` -d ${JSON.stringify(data)}` : ''}`;
  };

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      error: ""
    });
  };

  const loadExample = () => {
    const example = `curl -X POST "https://api.example.com/users" -H "Content-Type: application/json" -H "Authorization: Bearer token123" -d '{"name": "John Doe", "email": "john@example.com"}'`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="cURL to Code Generator"
      description="Convert cURL commands to code"
      icon={<Code className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="language">Target Language</Label>
            <Select value={language} onValueChange={(value) => updateState({ language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript (Fetch)</SelectItem>
                <SelectItem value="python">Python (Requests)</SelectItem>
                <SelectItem value="php">PHP (cURL)</SelectItem>
                <SelectItem value="go">Go (net/http)</SelectItem>
                <SelectItem value="curl">cURL (formatted)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="curl-input">cURL Command</Label>
            <Textarea
              id="curl-input"
              placeholder="Enter cURL command"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertCurl}>Convert to Code</Button>
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
            <Label>Generated Code ({language})</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
