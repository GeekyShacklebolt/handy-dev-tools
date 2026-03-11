import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "@/lib/utils/advanced-converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function ColorConverter() {
  const [state, setState] = useToolState("color-converter", {
    hexInput: "#3B82F6",
    rgbInput: { r: 59, g: 130, b: 246 },
    hslInput: { h: 217, s: 91, l: 60 },
    output: {
      hex: "#3B82F6",
      rgb: "rgb(59, 130, 246)",
      hsl: "hsl(217, 91%, 60%)"
    },
    error: ""
  });

  const { hexInput, rgbInput, hslInput, output, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const convertFromHex = () => {
    try {
      const rgb = hexToRgb(hexInput);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      updateState({
        rgbInput: rgb,
        hslInput: hsl,
        output: {
          hex: hexInput.toUpperCase(),
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        },
        error: ""
      });
    } catch (err) {
      updateState({ error: err instanceof Error ? err.message : "Invalid hex color" });
    }
  };

  const convertFromRgb = () => {
    try {
      const hex = rgbToHex(rgbInput.r, rgbInput.g, rgbInput.b);
      const hsl = rgbToHsl(rgbInput.r, rgbInput.g, rgbInput.b);

      updateState({
        hexInput: hex,
        hslInput: hsl,
        output: {
          hex: hex.toUpperCase(),
          rgb: `rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        },
        error: ""
      });
    } catch (err) {
      updateState({ error: "Invalid RGB values" });
    }
  };

  const convertFromHsl = () => {
    try {
      const rgb = hslToRgb(hslInput.h, hslInput.s, hslInput.l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

      updateState({
        hexInput: hex,
        rgbInput: rgb,
        output: {
          hex: hex.toUpperCase(),
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          hsl: `hsl(${hslInput.h}, ${hslInput.s}%, ${hslInput.l}%)`
        },
        error: ""
      });
    } catch (err) {
      updateState({ error: "Invalid HSL values" });
    }
  };

  const clearAll = () => {
    updateState({
      hexInput: "#000000",
      rgbInput: { r: 0, g: 0, b: 0 },
      hslInput: { h: 0, s: 0, l: 0 },
      output: { hex: "#000000", rgb: "rgb(0, 0, 0)", hsl: "hsl(0, 0%, 0%)" },
      error: ""
    });
  };

  const loadPreset = (color: string) => {
    updateState({ hexInput: color });
    convertFromHex();
  };

  const formatOutput = () => {
    return `HEX: ${output.hex}\nRGB: ${output.rgb}\nHSL: ${output.hsl}`;
  };

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between color formats"
      icon={<Palette className="h-6 w-6 text-blue-500" />}
      outputValue={formatOutput()}
    >
      <ToolInput title="Input">
        <div className="space-y-6">
          {/* HEX Input */}
          <div className="space-y-2">
            <Label htmlFor="hex-input">HEX Color</Label>
            <div className="flex space-x-2">
              <Input
                id="hex-input"
                type="text"
                placeholder="#3B82F6"
                value={hexInput}
                onChange={(e) => updateState({ hexInput: e.target.value })}
                className="tool-input"
              />
              <Input
                type="color"
                value={hexInput}
                onChange={(e) => updateState({ hexInput: e.target.value })}
                className="w-12 h-10"
              />
              <Button onClick={convertFromHex}>Convert</Button>
            </div>
          </div>

          {/* RGB Input */}
          <div className="space-y-2">
            <Label>RGB Values</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="R"
                value={rgbInput.r}
                onChange={(e) => updateState({ rgbInput: {...rgbInput, r: parseInt(e.target.value) || 0} })}
                className="tool-input"
              />
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="G"
                value={rgbInput.g}
                onChange={(e) => setRgbInput({...rgbInput, g: parseInt(e.target.value) || 0})}
                className="tool-input"
              />
              <Input
                type="number"
                min="0"
                max="255"
                placeholder="B"
                value={rgbInput.b}
                onChange={(e) => setRgbInput({...rgbInput, b: parseInt(e.target.value) || 0})}
                className="tool-input"
              />
              <Button onClick={convertFromRgb}>Convert</Button>
            </div>
          </div>

          {/* HSL Input */}
          <div className="space-y-2">
            <Label>HSL Values</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                max="360"
                placeholder="H"
                value={hslInput.h}
                onChange={(e) => setHslInput({...hslInput, h: parseInt(e.target.value) || 0})}
                className="tool-input"
              />
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="S%"
                value={hslInput.s}
                onChange={(e) => setHslInput({...hslInput, s: parseInt(e.target.value) || 0})}
                className="tool-input"
              />
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="L%"
                value={hslInput.l}
                onChange={(e) => setHslInput({...hslInput, l: parseInt(e.target.value) || 0})}
                className="tool-input"
              />
              <Button onClick={convertFromHsl}>Convert</Button>
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <Label>Preset Colors</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
                "#FFA500", "#800080", "#FFC0CB", "#A52A2A", "#808080", "#000000"
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => loadPreset(color)}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={formatOutput()}>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Color Preview */}
          <div>
            <Label>Color Preview</Label>
            <div
              className="w-full h-20 rounded-md border border-gray-200 dark:border-gray-700 mt-1"
              style={{ backgroundColor: output.hex }}
            />
          </div>

          {/* Color Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>HEX</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.hex}
              </div>
            </div>

            <div>
              <Label>RGB</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.rgb}
              </div>
            </div>

            <div>
              <Label>HSL</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {output.hsl}
              </div>
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
