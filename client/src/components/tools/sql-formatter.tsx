import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "lucide-react";
import ToolLayout, { ToolInput, ToolOutput } from "@/components/ui/tool-layout";
import { useToolState } from "@/hooks/use-tool-state";

let sqlFormatterLib: any = null;

async function loadSqlFormatter() {
  if (!sqlFormatterLib) {
    sqlFormatterLib = await import('sql-formatter');
  }
  return sqlFormatterLib;
}

export default function SQLFormatter() {
  const [state, setState] = useToolState("sql-formatter", {
    input: "",
    output: "",
    dialect: "sql",
    error: ""
  });

  const { input, output, dialect, error } = state;

  const updateState = (updates: Partial<typeof state>) => {
    setState({ ...state, ...updates });
  };

  const formatSQL = async () => {
    if (!input.trim()) {
      updateState({ output: "", error: "" });
      return;
    }

    try {
      const { format } = await loadSqlFormatter();
      const formatted = format(input, {
        language: dialect as any,
        tabWidth: 2,
        keywordCase: 'upper',
        linesBetweenQueries: 2,
      });
      updateState({ output: formatted, error: "" });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Formatting failed",
        output: ""
      });
    }
  };

  const minifySQL = () => {
    if (!input.trim()) {
      updateState({ output: "", error: "" });
      return;
    }

    const minified = input
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/,\s+/g, ', ')
      .trim();

    updateState({ output: minified, error: "" });
  };

  const clearAll = () => {
    updateState({ input: "", output: "", error: "" });
  };

  const loadExample = () => {
    const example = `WITH active_users AS (SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND u.created_at >= '2024-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 5) SELECT au.name, au.email, au.order_count, CASE WHEN au.order_count > 20 THEN 'VIP' WHEN au.order_count > 10 THEN 'Regular' ELSE 'New' END as customer_tier, p.name as last_product FROM active_users au INNER JOIN orders o ON au.id = o.user_id INNER JOIN products p ON o.product_id = p.id WHERE o.id = (SELECT MAX(o2.id) FROM orders o2 WHERE o2.user_id = au.id) ORDER BY au.order_count DESC LIMIT 100`;
    updateState({ input: example });
  };

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format and beautify SQL queries"
      icon={<Database className="h-5 w-5 text-blue-500" />}
      outputValue={output}
      infoContent={
        <p>
          Formats SQL with proper indentation, keyword casing, and line breaks.
          Supports Standard SQL, MySQL, PostgreSQL, T-SQL, and more.
        </p>
      }
    >
      <ToolInput title="Input">
        <div className="space-y-3">
          <div>
            <Label htmlFor="sql-dialect">SQL Dialect</Label>
            <Select value={dialect} onValueChange={(value) => updateState({ dialect: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">Standard SQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="tsql">T-SQL (SQL Server)</SelectItem>
                <SelectItem value="mariadb">MariaDB</SelectItem>
                <SelectItem value="plsql">PL/SQL (Oracle)</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sql-input">SQL Query</Label>
            <Textarea
              id="sql-input"
              placeholder="Enter SQL query to format"
              value={input}
              onChange={(e) => updateState({ input: e.target.value })}
              className="tool-textarea"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={formatSQL}>Format</Button>
            <Button variant="outline" onClick={minifySQL}>Minify</Button>
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
            <Label>Formatted SQL</Label>
            <div className="p-2 bg-muted rounded-md font-mono text-xs mt-1 whitespace-pre-wrap max-h-96 overflow-y-auto">
              {output || "No output"}
            </div>
          </div>
        </div>
      </ToolOutput>
    </ToolLayout>
  );
}
