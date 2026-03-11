import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Upload, Download } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";
import QRCode from "qrcode";
import jsQR from "jsqr";

export default function QRCodeTools() {
  const [state, setState] = useToolState("qr-code-tools", {
    text: "",
    qrCodeUrl: "",
    size: "200",
    uploadedImage: "",
    decodedText: "",
    error: ""
  });

  const { text, qrCodeUrl, size, uploadedImage, decodedText, error } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const generateQRCode = async () => {
    try {
      if (!text.trim()) {
        updateState({ error: "Please enter text to encode" });
        return;
      }

      const sizeNum = parseInt(size);
      const qrCodeDataUrl = await QRCode.toDataURL(text, {
        width: sizeNum,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      updateState({
        qrCodeUrl: qrCodeDataUrl,
        error: ""
      });
    } catch (err) {
      updateState({ error: "Failed to generate QR code" });
    }
  };

  const decodeQRCode = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    return code ? code.data : null;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      updateState({ error: "Please select a valid image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      updateState({
        uploadedImage: result,
        decodedText: "",
        error: ""
      });

      // Try to decode the QR code
      try {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            updateState({ error: "Failed to create canvas context" });
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const decodedData = decodeQRCode(imageData);

          if (decodedData) {
            updateState({
              decodedText: decodedData
            });
          } else {
            updateState({
              decodedText: "No QR code found in the uploaded image"
            });
          }
        };
        img.onerror = () => {
          updateState({ error: "Failed to load image for decoding" });
        };
        img.src = result;
      } catch (err) {
        updateState({ error: "Failed to decode QR code" });
      }
    };
    reader.onerror = () => {
      updateState({ error: "Failed to read file" });
    };
    reader.readAsDataURL(file);
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeUrl;
    link.click();
  };

  const clearAll = () => {
    updateState({
      text: "",
      qrCodeUrl: "",
      uploadedImage: "",
      decodedText: "",
      error: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolLayout
      title="QR Code Tools"
      description="Generate and read QR codes"
      icon={<QrCode className="h-6 w-6 text-blue-500" />}
      outputValue={qrCodeUrl || decodedText}
    >
      <ToolInput title="Generator & Reader">
        <div className="space-y-6">
          {/* QR Code Generator */}
          <div className="space-y-4">
            <h4 className="font-medium">Generate QR Code</h4>
            <div>
              <Label htmlFor="qr-text">Text to Encode</Label>
              <Textarea
                id="qr-text"
                placeholder="Enter text, URL, or data to encode"
                value={text}
                onChange={(e) => updateState({ text: e.target.value })}
                className="tool-textarea"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="qr-size">Size (px)</Label>
                <Select value={size} onValueChange={(value) => updateState({ size: value })}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                    <SelectItem value="400">400</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateQRCode}>Generate QR Code</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Read QR Code</h4>
            <div>
              <Label htmlFor="qr-upload">Upload QR Code Image</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" />
                  Browse
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearAll}>Clear All</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={qrCodeUrl || decodedText}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {qrCodeUrl && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated QR Code</Label>
                <Button variant="outline" size="sm" onClick={downloadQRCode}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 flex justify-center">
                <img src={qrCodeUrl} alt="Generated QR Code" className="max-w-full" />
              </div>
            </div>
          )}

          {uploadedImage && (
            <div>
              <Label>Uploaded QR Code</Label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800 flex justify-center mt-2">
                <img src={uploadedImage} alt="Uploaded QR Code" className="max-w-full max-h-64 object-contain" />
              </div>
            </div>
          )}

          {decodedText && (
            <div>
              <Label>Decoded Text</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {decodedText}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
