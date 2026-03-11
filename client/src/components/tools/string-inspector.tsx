import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { analyzeString } from "@/lib/utils/advanced-converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function StringInspector() {
  const [state, setState] = useToolState("string-inspector", {
    input: "",
    analysis: null as any
  });

  const { input, analysis } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const analyze = () => {
    if (!input) {
      updateState({ analysis: null });
      return;
    }

    const result = analyzeString(input);
    updateState({ analysis: result });
  };

  const clearAll = () => {
    updateState({
      input: "",
      analysis: null
    });
  };

  const loadExample = () => {
    const example = `Hello, World! 🌍
This is a sample text for analysis.
It contains multiple lines, words, and characters.
Let's see what the inspector reveals! 🚀

Unicode characters: αβγδε, 你好世界, 🎉🎊🎈
Special symbols: ©®™€£¥¢§¶†‡
Emojis: 😀😃😄😁😆😅🤣😂🙂🙃😉😊😇`;
    updateState({ input: example });
  };

  const formatAnalysis = () => {
    if (!analysis) return "";

    return `Characters: ${analysis.characters}
Characters (no spaces): ${analysis.charactersNoSpaces}
Words: ${analysis.words}
Lines: ${analysis.lines}
Sentences: ${analysis.sentences}
Average words per sentence: ${analysis.averageWordsPerSentence.toFixed(2)}
Most frequent character: "${analysis.mostFrequentChar}"
Byte size: ${analysis.byteSize} bytes`;
  };

  return (
    <ToolLayout
      title="String Inspector"
      description="Analyze string properties and characters"
      icon={<Search className="h-6 w-6 text-blue-500" />}
      outputValue={formatAnalysis()}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="string-input">Text to Analyze</Label>
            <Textarea
              id="string-input"
              placeholder="Enter text to analyze"
              value={input}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue) {
                  const result = analyzeString(newValue);
                  updateState({ input: newValue, analysis: result });
                } else {
                  updateState({ input: newValue, analysis: null });
                }
              }}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={analyze}>Analyze</Button>
            <Button variant="outline" onClick={loadExample}>Load Example</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Analysis" value={formatAnalysis()}>
        <div className="space-y-4">
          {analysis && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Characters</div>
                  <div className="text-2xl font-bold">{analysis.characters}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Words</div>
                  <div className="text-2xl font-bold">{analysis.words}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Lines</div>
                  <div className="text-2xl font-bold">{analysis.lines}</div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium text-muted-foreground">Byte Size</div>
                  <div className="text-2xl font-bold">{analysis.byteSize}</div>
                </div>
              </div>

              <div>
                <Label>Detailed Statistics</Label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                  Characters (with spaces): {analysis.characters}<br/>
                  Characters (without spaces): {analysis.charactersNoSpaces}<br/>
                  Sentences: {analysis.sentences}<br/>
                  Average words per sentence: {analysis.averageWordsPerSentence.toFixed(2)}<br/>
                  Most frequent character: "{analysis.mostFrequentChar}"<br/>
                  Byte size (UTF-8): {analysis.byteSize} bytes
                </div>
              </div>
            </>
          )}

          {!analysis && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Enter text to see analysis
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
