import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Image, Upload, Download } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

export default function Base64Image() {
  const [state, setState] = useToolState("base64-image", {
    base64Output: "",
    imagePreview: "",
    base64Input: "",
    error: ""
  });

  const { base64Output, imagePreview, base64Input, error } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      updateState({ error: "Please select a valid image file" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateState({
        base64Output: result,
        imagePreview: result,
        error: ""
      });
    };
    reader.onerror = () => {
      updateState({ error: "Failed to read file" });
    };
    reader.readAsDataURL(file);
  };

    const convertBase64ToImage = () => {
    try {
      if (!base64Input) {
        updateState({ error: "Please enter a Base64 string" });
        return;
      }

      // Check if it's a valid Base64 image
      const isDataURL = base64Input.startsWith('data:image/');
      const imageData = isDataURL ? base64Input : `data:image/png;base64,${base64Input}`;

      // Test if it's a valid image by creating an image element
      const img = new window.Image();
      img.onload = () => {
        updateState({
          imagePreview: imageData,
          error: ""
        });
      };
      img.onerror = () => {
        updateState({ error: "Invalid Base64 image data" });
      };
      img.src = imageData;
    } catch (err) {
      updateState({ error: "Invalid Base64 string" });
    }
  };

  const downloadImage = () => {
    if (!imagePreview) return;

    const link = document.createElement('a');
    link.download = 'decoded-image.png';
    link.href = imagePreview;
    link.click();
  };

  const clearAll = () => {
    updateState({
      base64Output: "",
      imagePreview: "",
      base64Input: "",
      error: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolLayout
      title="Base64 Image Encoder/Decoder"
      description="Convert images to Base64 and vice versa"
      icon={<Image className="h-6 w-6 text-blue-500" />}
      outputValue={base64Output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-input">Upload Image</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="file-input"
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

          <div className="text-center text-gray-500 dark:text-gray-400">or</div>

          <div>
            <Label htmlFor="base64-input">Base64 String</Label>
            <Textarea
              id="base64-input"
              placeholder="Enter Base64 image string to decode"
              value={base64Input}
              onChange={(e) => updateState({ base64Input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={convertBase64ToImage}>Decode to Image</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={base64Output}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {imagePreview && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Image Preview</Label>
                <Button variant="outline" size="sm" onClick={downloadImage}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {base64Output && (
            <div>
              <Label>Base64 String</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {base64Output}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
