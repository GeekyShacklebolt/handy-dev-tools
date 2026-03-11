import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

let x509Module: typeof import('@peculiar/x509') | null = null;

async function loadX509() {
  if (!x509Module) {
    x509Module = await import('@peculiar/x509');
  }
  return x509Module;
}

export default function CertificateDecoder() {
  const [state, setState] = useToolState("certificate-decoder", {
    input: "",
    output: "",
    error: ""
  });

  const { input, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const decodeCertificate = async () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter a certificate" });
        return;
      }

      const certContent = input.trim();

      if (!certContent.includes("-----BEGIN CERTIFICATE-----") || !certContent.includes("-----END CERTIFICATE-----")) {
        updateState({ error: "Invalid certificate format. Please provide a PEM-encoded certificate." });
        return;
      }

      const { X509Certificate } = await loadX509();
      const cert = new X509Certificate(certContent);

      const now = new Date();
      const notBefore = new Date(cert.notBefore);
      const notAfter = new Date(cert.notAfter);
      const isExpired = now > notAfter;
      const isNotYetValid = now < notBefore;
      const status = isExpired ? "EXPIRED" : isNotYetValid ? "NOT YET VALID" : "VALID";

      let info = `Certificate Information\n${'='.repeat(50)}\n\n`;
      info += `Status: ${status}\n\n`;
      info += `Subject: ${cert.subject}\n`;
      info += `Issuer: ${cert.issuer}\n`;
      info += `Serial Number: ${cert.serialNumber}\n\n`;
      info += `Validity:\n`;
      info += `  Not Before: ${notBefore.toUTCString()}\n`;
      info += `  Not After:  ${notAfter.toUTCString()}\n\n`;

      info += `Public Key:\n`;
      info += `  Algorithm: ${cert.publicKey.algorithm.name || 'Unknown'}\n`;

      info += `\nSignature Algorithm: ${cert.signatureAlgorithm.name || 'Unknown'}\n`;

      // Extensions
      if (cert.extensions && cert.extensions.length > 0) {
        info += `\nExtensions (${cert.extensions.length}):\n`;
        for (const ext of cert.extensions) {
          const critical = ext.critical ? ' [CRITICAL]' : '';
          info += `  - ${ext.type}${critical}\n`;
        }
      }

      // Try to get SANs
      try {
        const sanExt = cert.getExtension('2.5.29.17');
        if (sanExt) {
          info += `\nSubject Alternative Names:\n`;
          info += `  ${JSON.stringify(sanExt)}\n`;
        }
      } catch {
        // SANs not available
      }

      info += `\nFingerprint (SHA-256):\n`;
      try {
        const thumbprint = await cert.getThumbprint('SHA-256');
        const hex = Array.from(new Uint8Array(thumbprint))
          .map(b => b.toString(16).padStart(2, '0').toUpperCase())
          .join(':');
        info += `  ${hex}\n`;
      } catch {
        info += `  (unable to compute)\n`;
      }

      updateState({ output: info, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? `Failed to decode: ${err.message}` : "Failed to decode certificate.",
        output: ""
      });
    }
  };

  const clearAll = () => {
    updateState({ input: "", output: "", error: "" });
  };

  const loadExample = () => {
    const example = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMTMwOTI5MjMxOTMzWhcNMjMwOTI3MjMxOTMzWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAwUdO3fxEzEtcnI7ZKZL412XvZPuXuMpqB1sNrkemKcGzMn7B3DOVUD5y
Xr0TjF/WCnMhkGpjSfLYnDAU3Nk8wGoN2NrhnfnkNq/BEHd0+cfiR/0JbsaV2vb
j2TP7bRVH5VojmReBMxjOqLAx2lDp8JjXrdO7FxJH1gEQnx4g8LpSaNMWQJDRBgc
mmMBHALWXpBPnVxb8iVNNbJPBcP5GaQfBiEfPIm2nNtjQfKDFKr+lF9y4LG7v1eU
L/1bBgIR4MBbCq9OIP66wfB0leSBgKC1aXuWM8OBKMhMjCiHJkzBp1LC+bO8wmim
xJNB5DpX+VmuF3nFH8MkZtAHgTmPkwIDAQABo1AwTjAdBgNVHQ4EFgQUhqmPAHCq
TaZNPEiGKJqGc8CwG6IwHwYDVR0jBBgwFoAUhqmPAHCqTaZNPEiGKJqGc8CwG6Iw
DAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQUFAAOCAQEAe0MNMPlMIXNnIQGe+MKC
rt9kYsMMPI3kNRqzuOSBjkLghGyMnPMFMcH/UoYMqMKqE/tI8FakU5S28DkFrXgj
gMBjCHMB26JSiKjPJm2EZMJ/8dkKdwVJC+T83MQFTkmeqMEkp6M1vJIBYKFSqCq5
aKDh6YAB17Y0AbKQERhGJsA2OeKdPJao7TcNW0rhc+ID/bBf/yeAlCir8hFNccPZ
psHHsSKBc7P4fL+YEIOJ2rHqJFVbFJIlpqD1DBaEUewGhIPt1OAl0fXRqXJ5JLKZ
YLhQ8SN0lNJfMjXh5ks0kNYGG8AG0V1yqNJkU3Lq5TfpPR0Z9LQdCY6w6tMhsvh
jQ==
-----END CERTIFICATE-----`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="Certificate Decoder (X.509)"
      description="Decode and inspect X.509 PEM certificates"
      icon={<Shield className="h-5 w-5 text-blue-500" />}
      outputValue={output}
      infoContent={
        <p>
          Decodes X.509 PEM certificates to show Subject, Issuer, Validity, Serial Number,
          Public Key info, Extensions, and SHA-256 fingerprint.
        </p>
      }
    >
      <ToolInput title="Input">
        <div className="space-y-3">
          <div>
            <Label htmlFor="cert-input">X.509 Certificate (PEM)</Label>
            <Textarea
              id="cert-input"
              placeholder="Paste PEM certificate (-----BEGIN CERTIFICATE-----)"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={decodeCertificate}>Decode</Button>
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
            <Label>Certificate Information</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No certificate decoded"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
