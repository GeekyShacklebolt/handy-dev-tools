import React, { Suspense } from "react";
import { getToolById } from "@/lib/tools-config";

// Lazy-load all tool components for faster cold start
const UnixTimeConverter = React.lazy(() => import("@/components/tools/unix-time-converter"));
const JSONFormatter = React.lazy(() => import("@/components/tools/json-formatter"));
const Base64Encoder = React.lazy(() => import("@/components/tools/base64-encoder"));
const Base64Image = React.lazy(() => import("@/components/tools/base64-image"));
const JWTDebugger = React.lazy(() => import("@/components/tools/jwt-debugger"));
const URLEncoder = React.lazy(() => import("@/components/tools/url-encoder"));
const UUIDGenerator = React.lazy(() => import("@/components/tools/uuid-generator"));
const URLParser = React.lazy(() => import("@/components/tools/url-parser"));
const RegexTester = React.lazy(() => import("@/components/tools/regex-tester"));
const HTMLEntityEncoder = React.lazy(() => import("@/components/tools/html-entity-encoder"));
const BackslashEscape = React.lazy(() => import("@/components/tools/backslash-escape"));
const HTMLPreview = React.lazy(() => import("@/components/tools/html-preview"));
const TextDiff = React.lazy(() => import("@/components/tools/text-diff"));
const YAMLJSONConverter = React.lazy(() => import("@/components/tools/yaml-json-converter"));
const NumberBaseConverter = React.lazy(() => import("@/components/tools/number-base-converter"));
const CodeBeautifier = React.lazy(() => import("@/components/tools/code-beautifier"));
const LoremIpsum = React.lazy(() => import("@/components/tools/lorem-ipsum"));
const QRCodeTools = React.lazy(() => import("@/components/tools/qr-code-tools"));
const StringInspector = React.lazy(() => import("@/components/tools/string-inspector"));
const JSONCSVConverter = React.lazy(() => import("@/components/tools/json-csv-converter"));
const HashGenerator = React.lazy(() => import("@/components/tools/hash-generator"));
const HTMLJSXConverter = React.lazy(() => import("@/components/tools/html-jsx-converter"));
const MarkdownPreview = React.lazy(() => import("@/components/tools/markdown-preview"));
const SQLFormatter = React.lazy(() => import("@/components/tools/sql-formatter"));
const StringCaseConverter = React.lazy(() => import("@/components/tools/string-case-converter"));
const CronParser = React.lazy(() => import("@/components/tools/cron-parser"));
const ColorConverter = React.lazy(() => import("@/components/tools/color-converter"));
const PHPJSONConverter = React.lazy(() => import("@/components/tools/php-json-converter"));
const PHPSerializer = React.lazy(() => import("@/components/tools/php-serializer"));
const RandomStringGenerator = React.lazy(() => import("@/components/tools/random-string-generator"));
const SVGCSSConverter = React.lazy(() => import("@/components/tools/svg-css-converter"));
const CurlToCode = React.lazy(() => import("@/components/tools/curl-to-code"));
const JSONToCode = React.lazy(() => import("@/components/tools/json-to-code"));
const CertificateDecoder = React.lazy(() => import("@/components/tools/certificate-decoder"));
const HexAsciiConverter = React.lazy(() => import("@/components/tools/hex-ascii-converter"));
const LineSortDedupe = React.lazy(() => import("@/components/tools/line-sort-dedupe"));

const toolComponents = {
  UnixTimeConverter,
  JSONFormatter,
  Base64Encoder,
  Base64Image,
  JWTDebugger,
  URLEncoder,
  UUIDGenerator,
  URLParser,
  RegexTester,
  HTMLEntityEncoder,
  BackslashEscape,
  HTMLPreview,
  TextDiff,
  YAMLJSONConverter,
  NumberBaseConverter,
  CodeBeautifier,
  LoremIpsum,
  QRCodeTools,
  StringInspector,
  JSONCSVConverter,
  HashGenerator,
  HTMLJSXConverter,
  MarkdownPreview,
  SQLFormatter,
  StringCaseConverter,
  CronParser,
  ColorConverter,
  PHPJSONConverter,
  PHPSerializer,
  RandomStringGenerator,
  SVGCSSConverter,
  CurlToCode,
  JSONToCode,
  CertificateDecoder,
  HexAsciiConverter,
  LineSortDedupe,
};

interface ToolProps {
  toolId: string;
}

export default function Tool({ toolId }: ToolProps) {
  const tool = getToolById(toolId || "");

  if (!tool) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tool not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested tool could not be found.
          </p>
        </div>
      </div>
    );
  }

  const ToolComponent =
    toolComponents[tool.component as keyof typeof toolComponents];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto p-4">
        <Suspense
          fallback={
            <div className="p-8 text-muted-foreground">Loading tool...</div>
          }
        >
          <ToolComponent />
        </Suspense>
      </div>
    </div>
  );
}
