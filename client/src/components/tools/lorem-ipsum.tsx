import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { generateLoremIpsum } from "@/lib/utils/advanced-converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function LoremIpsum() {
  const [state, setState] = useToolState("lorem-ipsum", {
    output: "",
    paragraphs: "3",
    wordsPerParagraph: "50",
    format: "paragraphs"
  });

  const { output, paragraphs, wordsPerParagraph, format } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

    const generate = () => {
    const numParagraphs = parseInt(paragraphs) || 1;
    const numWords = parseInt(wordsPerParagraph) || 50;

    if (format === "paragraphs") {
      const lorem = generateLoremIpsum(numParagraphs, numWords);
      updateState({ output: lorem });
    } else if (format === "words") {
      const lorem = generateLoremIpsum(1, parseInt(paragraphs) || 50);
      updateState({ output: lorem.replace(/\.\s*/g, ' ').trim() });
    } else if (format === "sentences") {
      const numSentences = parseInt(paragraphs) || 1;
      const wordsPerSentence = 8; // Average words per sentence
      const totalWords = numSentences * wordsPerSentence;

      // Generate enough words for all sentences
      const lorem = generateLoremIpsum(Math.ceil(totalWords / 50), 50);
      const allWords = lorem.replace(/\./g, '').split(/\s+/).filter(w => w.trim().length > 0);

      const sentences = [];
      for (let i = 0; i < numSentences; i++) {
        const startIndex = i * wordsPerSentence;
        const endIndex = Math.min(startIndex + wordsPerSentence, allWords.length);
        const sentenceWords = allWords.slice(startIndex, endIndex);

        if (sentenceWords.length > 0) {
          // Capitalize first word
          sentenceWords[0] = sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
          sentences.push(sentenceWords.join(' ') + '.');
        }
      }

      updateState({ output: sentences.join(' ') });
    }
  };

  const clearAll = () => {
    updateState({ output: "" });
  };

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate placeholder text"
      icon={<FileText className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Settings">
        <div className="space-y-4">
          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value) => updateState({ format: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paragraphs">Paragraphs</SelectItem>
                <SelectItem value="words">Words</SelectItem>
                <SelectItem value="sentences">Sentences</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="count">
                {format === 'paragraphs' ? 'Paragraphs' :
                 format === 'words' ? 'Words' : 'Sentences'}
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={paragraphs}
                onChange={(e) => updateState({ paragraphs: e.target.value })}
              />
            </div>

            {format === 'paragraphs' && (
              <div>
                <Label htmlFor="words-per-paragraph">Words per Paragraph</Label>
                <Input
                  id="words-per-paragraph"
                  type="number"
                  min="10"
                  max="200"
                  value={wordsPerParagraph}
                  onChange={(e) => updateState({ wordsPerParagraph: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={generate}>Generate</Button>
            <Button variant="outline" onClick={clearAll}>Clear</Button>
          </div>
        </div>
      </ToolInput>

      <ToolOutput title="Output" value={output}>
        <div className="space-y-4">
          <div>
            <Label>Generated Text</Label>
            <div className="p-3 bg-muted rounded-md text-sm mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No text generated"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
