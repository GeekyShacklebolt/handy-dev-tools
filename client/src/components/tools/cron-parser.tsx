import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { parseCronExpression } from "@/lib/utils/advanced-converters";
import { useToolState } from "@/hooks/use-tool-state";

export default function CronParser() {
  const [state, setState] = useToolState("cron-parser", {
    input: "",
    output: "",
    error: "",
    nextRuns: [] as string[]
  });

  const { input, output, error, nextRuns } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  // Helper function to parse cron field values
  const parseCronField = (field: string, min: number, max: number): number[] => {
    if (field === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }
    
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const stepNum = parseInt(step);
      const values = [];
      
      if (range === '*') {
        for (let i = min; i <= max; i += stepNum) {
          values.push(i);
        }
      } else {
        const start = parseInt(range);
        for (let i = start; i <= max; i += stepNum) {
          values.push(i);
        }
      }
      return values;
    }
    
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    
    if (field.includes(',')) {
      return field.split(',').map(Number);
    }
    
    return [parseInt(field)];
  };

  // Optimized function to calculate next cron runs
  const calculateNextRuns = (cronExpression: string, count: number): string[] => {
    try {
      const parts = cronExpression.trim().split(/\s+/);
      if (parts.length !== 5) return [];
      
      const [minuteField, hourField, dayField, monthField, dowField] = parts;
      
      const minutes = parseCronField(minuteField, 0, 59);
      const hours = parseCronField(hourField, 0, 23);
      const days = parseCronField(dayField, 1, 31);
      const months = parseCronField(monthField, 1, 12);
      const daysOfWeek = parseCronField(dowField, 0, 6);
      
      const now = new Date();
      const runs: string[] = [];
      
      // Start from next minute
      let current = new Date(now);
      current.setSeconds(0, 0);
      current.setMinutes(current.getMinutes() + 1);
      
      // Limit search to reasonable timeframe (max 2 years)
      const maxDate = new Date(now);
      maxDate.setFullYear(maxDate.getFullYear() + 2);
      
      let found = 0;
      let iterations = 0;
      const maxIterations = 100000; // Safety limit
      
      while (found < count && current <= maxDate && iterations < maxIterations) {
        iterations++;
        
        const currentMinute = current.getMinutes();
        const currentHour = current.getHours();
        const currentDay = current.getDate();
        const currentMonth = current.getMonth() + 1;
        const currentDow = current.getDay();
        
        // Quick pre-checks to skip expensive operations
        if (!months.includes(currentMonth)) {
          // Skip to next month
          current.setMonth(current.getMonth() + 1, 1);
          current.setHours(0, 0, 0, 0);
          continue;
        }
        
        if (!hours.includes(currentHour)) {
          // Skip to next matching hour
          const nextHour = hours.find(h => h > currentHour) || hours[0];
          if (nextHour > currentHour) {
            current.setHours(nextHour, 0, 0, 0);
          } else {
            current.setDate(current.getDate() + 1);
            current.setHours(nextHour, 0, 0, 0);
          }
          continue;
        }
        
        if (!minutes.includes(currentMinute)) {
          // Skip to next matching minute
          const nextMinute = minutes.find(m => m > currentMinute) || minutes[0];
          if (nextMinute > currentMinute) {
            current.setMinutes(nextMinute, 0, 0);
          } else {
            current.setHours(current.getHours() + 1, nextMinute, 0, 0);
          }
          continue;
        }
        
        // Check day conditions
        const dayMatch = days.includes(currentDay);
        const dowMatch = daysOfWeek.includes(currentDow);
        
        const dayCondition = (dayField === '*' && dowField === '*') || 
                            (dayField === '*' && dowMatch) ||
                            (dowField === '*' && dayMatch) ||
                            (dayField !== '*' && dowField !== '*' && dayMatch && dowMatch);
        
        if (dayCondition) {
          runs.push(current.toLocaleString());
          found++;
        }
        
        // Move to next minute
        current.setMinutes(current.getMinutes() + 1);
      }
      
      return runs;
    } catch (error) {
      return [];
    }
  };

    const parseCron = () => {
    try {
      if (!input.trim()) {
        updateState({ error: "Please enter a cron expression" });
        return;
      }

      const description = parseCronExpression(input);

      // Generate next run times based on the actual cron expression
      const runs = calculateNextRuns(input, 5);

      updateState({
        output: description,
        nextRuns: runs,
        error: ""
      });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Invalid cron expression",
        output: "",
        nextRuns: []
      });
    }
  };

  // Auto-parse on input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (input.trim()) {
        parseCron();
      } else {
        updateState({ output: "", nextRuns: [], error: "" });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const clearAll = () => {
    updateState({
      input: "",
      output: "",
      nextRuns: [],
      error: ""
    });
  };

  const loadExample = (expression: string) => {
    updateState({ input: expression });
  };

  return (
    <ToolLayout
      title="Cron Job Parser"
      description="Parse and explain cron expressions"
      icon={<Clock className="h-6 w-6 text-blue-500" />}
      outputValue={output}
    >
      <ToolInput title="Input">
        <div className="space-y-4">
          <div>
            <Label htmlFor="cron-input">Cron Expression</Label>
            <Input
              id="cron-input"
              placeholder="min hour day month day-of-week"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-input"
            />
          </div>

          <div>
            <Label>Common Examples</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("0 12 * * 1-5")}
                className="justify-start text-left"
              >
                <span className="font-mono text-xs">0 12 * * 1-5</span>
                <span className="ml-2 text-xs text-muted-foreground">Weekdays at noon</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("*/15 * * * *")}
                className="justify-start text-left"
              >
                <span className="font-mono text-xs">*/15 * * * *</span>
                <span className="ml-2 text-xs text-muted-foreground">Every 15 minutes</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("0 0 1 * *")}
                className="justify-start text-left"
              >
                <span className="font-mono text-xs">0 0 1 * *</span>
                <span className="ml-2 text-xs text-muted-foreground">First day of month</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadExample("0 2 * * 0")}
                className="justify-start text-left"
              >
                <span className="font-mono text-xs">0 2 * * 0</span>
                <span className="ml-2 text-xs text-muted-foreground">Sundays at 2 AM</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Parse Expression button removed for auto-parse */}
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

          {output && (
            <div>
              <Label>Human Readable Description</Label>
              <div className="p-3 bg-muted rounded-md text-sm mt-1">
                {output}
              </div>
            </div>
          )}

          {nextRuns.length > 0 && (
            <div>
              <Label>Next Run Times (Estimated)</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm mt-1">
                {nextRuns.map((run, index) => (
                  <div key={index}>{run}</div>
                ))}
              </div>
            </div>
          )}

          {input && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-2">Field Breakdown</h4>
              <div className="text-blue-800 dark:text-blue-300 text-sm font-mono">
                {input.split(' ').map((field, index) => {
                  const labels = ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];
                  return (
                    <div key={index}>
                      {labels[index]}: {field}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
