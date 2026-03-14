import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Key, AlertTriangle } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function JWTDebugger() {
  // JWT input is kept in session-only state (not persisted to localStorage)
  // because JWTs are bearer tokens that should not be written to disk
  const [jwtInput, setJwtInput] = useState("");
  const [state, setState] = useToolState("jwt-debugger", {
    header: "",
    payload: "",
    signature: "",
    error: ""
  });

  const { header, payload, signature, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const decodeJWT = () => {
    try {
      const parts = jwtInput.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      // Helper function to decode base64url
      const base64UrlDecode = (str: string) => {
        // Convert base64url to base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        return atob(base64);
      };

      // Decode header
      const headerDecoded = JSON.parse(base64UrlDecode(parts[0]));
      const headerJson = JSON.stringify(headerDecoded, null, 2);

      // Decode payload
      const payloadDecoded = JSON.parse(base64UrlDecode(parts[1]));
      const payloadJson = JSON.stringify(payloadDecoded, null, 2);

      // Signature (base64url encoded)
      const signaturePart = parts[2];

      updateState({
        header: headerJson,
        payload: payloadJson,
        signature: signaturePart,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Failed to decode JWT",
        header: "",
        payload: "",
        signature: ""
      });
    }
  };

  const clearAll = () => {
    setJwtInput("");
    updateState({
      header: "",
      payload: "",
      signature: "",
      error: ""
    });
  };

    const exampleJWT = () => {
    const example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

    // Decode the example JWT directly
    try {
      const parts = example.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      // Helper function to decode base64url
      const base64UrlDecode = (str: string) => {
        // Convert base64url to base64
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        return atob(base64);
      };

      // Decode header
      const headerDecoded = JSON.parse(base64UrlDecode(parts[0]));
      const headerJson = JSON.stringify(headerDecoded, null, 2);

      // Decode payload
      const payloadDecoded = JSON.parse(base64UrlDecode(parts[1]));
      const payloadJson = JSON.stringify(payloadDecoded, null, 2);

      // Signature (base64url encoded)
      const signaturePart = parts[2];

      // Update all state at once
      setJwtInput(example);
      updateState({
        header: headerJson,
        payload: payloadJson,
        signature: signaturePart,
        error: ""
      });
    } catch (err) {
      setJwtInput(example);
      updateState({
        error: err instanceof Error ? err.message : "Failed to decode JWT",
        header: "",
        payload: "",
        signature: ""
      });
    }
  };

  return (
    <ToolLayout
      title="JWT Debugger"
      description="Debug and inspect JWT tokens"
      icon={<Key className="h-6 w-6 text-blue-500" />}
      outputValue={payload}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="jwt-input">JWT Token</Label>
            <Textarea
              id="jwt-input"
              placeholder="Paste your JWT token here"
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={decodeJWT}>Decode JWT</Button>
            <Button variant="outline" onClick={exampleJWT}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={payload}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div>
            <Label>Header</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {header || "No header decoded"}
            </div>
          </div>

          <div>
            <Label>Payload</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {payload || "No payload decoded"}
            </div>
          </div>

          <div>
            <Label>Signature</Label>
            <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 break-all">
              {signature || "No signature"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
