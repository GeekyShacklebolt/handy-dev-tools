import { useParams } from "wouter";
import { getToolById } from "@/lib/tools-config";

// Import all tool components
import UnixTimeConverter from "@/components/tools/unix-time-converter";
import JSONFormatter from "@/components/tools/json-formatter";
import Base64Encoder from "@/components/tools/base64-encoder";
import Base64Image from "@/components/tools/base64-image";
import JWTDebugger from "@/components/tools/jwt-debugger";
import URLEncoder from "@/components/tools/url-encoder";
import UUIDGenerator from "@/components/tools/uuid-generator";
import URLParser from "@/components/tools/url-parser";
import RegexTester from "@/components/tools/regex-tester";
import HTMLEntityEncoder from "@/components/tools/html-entity-encoder";
import BackslashEscape from "@/components/tools/backslash-escape";
import HTMLPreview from "@/components/tools/html-preview";
import TextDiff from "@/components/tools/text-diff";
import YAMLJSONConverter from "@/components/tools/yaml-json-converter";
import NumberBaseConverter from "@/components/tools/number-base-converter";
import CodeBeautifier from "@/components/tools/code-beautifier";
import LoremIpsum from "@/components/tools/lorem-ipsum";
import QRCodeTools from "@/components/tools/qr-code-tools";
import StringInspector from "@/components/tools/string-inspector";
import JSONCSVConverter from "@/components/tools/json-csv-converter";
import HashGenerator from "@/components/tools/hash-generator";
import HTMLJSXConverter from "@/components/tools/html-jsx-converter";
import MarkdownPreview from "@/components/tools/markdown-preview";
import SQLFormatter from "@/components/tools/sql-formatter";
import StringCaseConverter from "@/components/tools/string-case-converter";
import CronParser from "@/components/tools/cron-parser";
import ColorConverter from "@/components/tools/color-converter";
import PHPJSONConverter from "@/components/tools/php-json-converter";
import PHPSerializer from "@/components/tools/php-serializer";
import RandomStringGenerator from "@/components/tools/random-string-generator";
import SVGCSSConverter from "@/components/tools/svg-css-converter";
import CurlToCode from "@/components/tools/curl-to-code";
import JSONToCode from "@/components/tools/json-to-code";
import CertificateDecoder from "@/components/tools/certificate-decoder";
import HexAsciiConverter from "@/components/tools/hex-ascii-converter";
import LineSortDedupe from "@/components/tools/line-sort-dedupe";

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
  LineSortDedupe
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

  const ToolComponent = toolComponents[tool.component as keyof typeof toolComponents];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto p-4">
        <ToolComponent />
      </div>
    </div>
  );
}
