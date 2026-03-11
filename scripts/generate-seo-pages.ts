/**
 * Generates static SEO pages for each tool with rich, indexable content.
 * Run: npx tsx scripts/generate-seo-pages.ts
 */
import * as fs from 'fs';
import * as path from 'path';

// Import tool configs directly (avoid TS path aliases)
const toolCategories = [
  {
    id: "converters", name: "Conversion Tools", tools: [
      { id: "unix-time", name: "Unix Time Converter", description: "Convert between Unix timestamps and human-readable dates" },
      { id: "base64-string", name: "Base64 String", description: "Encode and decode Base64 strings" },
      { id: "base64-image", name: "Base64 Image", description: "Convert images to Base64 and vice versa" },
      { id: "url-encode", name: "URL Encode/Decode", description: "Encode and decode URLs" },
      { id: "html-entity", name: "HTML Entity", description: "Encode and decode HTML entities" },
      { id: "hex-ascii", name: "Hex ↔ ASCII", description: "Convert between hexadecimal and ASCII" },
      { id: "number-base", name: "Number Base Converter", description: "Convert between different number bases" },
    ]
  },
  {
    id: "json-data", name: "JSON & Data Tools", tools: [
      { id: "json-format", name: "JSON Format/Validate", description: "Format, validate and beautify JSON" },
      { id: "yaml-json", name: "YAML ↔ JSON", description: "Convert between YAML and JSON formats" },
      { id: "json-csv", name: "JSON ↔ CSV", description: "Convert between JSON and CSV formats" },
      { id: "json-to-code", name: "JSON to Code", description: "Generate code from JSON data" },
      { id: "php-json", name: "PHP ↔ JSON", description: "Convert between PHP and JSON formats" },
    ]
  },
  {
    id: "code-tools", name: "Code Tools", tools: [
      { id: "jwt-debugger", name: "JWT Debugger", description: "Debug and inspect JWT tokens" },
      { id: "html-jsx", name: "HTML to JSX", description: "Convert HTML to JSX format" },
      { id: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries" },
      { id: "beautify-minify", name: "Beautify/Minify", description: "Beautify or minify code (HTML, CSS, JS, etc.)" },
      { id: "curl-to-code", name: "cURL to Code", description: "Convert cURL commands to code" },
      { id: "svg-css", name: "SVG to CSS", description: "Convert SVG to CSS" },
    ]
  },
  {
    id: "text-tools", name: "Text & String Tools", tools: [
      { id: "regex-tester", name: "RegExp Tester", description: "Test regular expressions with highlighting" },
      { id: "text-diff", name: "Text Diff Checker", description: "Compare text with side-by-side diff" },
      { id: "string-case", name: "String Case Converter", description: "Convert between different string cases" },
      { id: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text" },
      { id: "string-inspector", name: "String Inspector", description: "Analyze string properties and characters" },
      { id: "backslash-escape", name: "Backslash Escape/Unescape", description: "Escape and unescape backslashes" },
      { id: "line-sort-dedupe", name: "Line Sort/Dedupe", description: "Sort lines and remove duplicates" },
    ]
  },
  {
    id: "utilities", name: "Utilities", tools: [
      { id: "uuid-generator", name: "UUID/ULID Generator", description: "Generate and decode UUIDs and ULIDs" },
      { id: "qr-code", name: "QR Code Tools", description: "Generate and read QR codes" },
      { id: "hash-generator", name: "Hash Generator", description: "Generate various hash types" },
      { id: "color-converter", name: "Color Converter", description: "Convert between color formats" },
      { id: "random-string", name: "Random String Generator", description: "Generate random strings with options" },
      { id: "url-parser", name: "URL Parser", description: "Parse URLs and extract components" },
      { id: "cron-parser", name: "Cron Job Parser", description: "Parse and explain cron expressions" },
      { id: "certificate-decoder", name: "Certificate Decoder", description: "Decode X.509 certificates" },
      { id: "php-serializer", name: "PHP Serializer", description: "Serialize and unserialize PHP data" },
    ]
  },
  {
    id: "preview-tools", name: "Preview Tools", tools: [
      { id: "html-preview", name: "HTML Preview", description: "Preview HTML code in real-time" },
      { id: "markdown-preview", name: "Markdown Preview", description: "Preview Markdown with live rendering" },
    ]
  }
];

// SEO config (duplicated to avoid import issues with TS path aliases)
const seoConfig: Record<string, {
  title: string;
  metaDescription: string;
  keywords: string[];
  features: string[];
  useCases: string[];
  faq: { q: string; a: string }[];
}> = {
  "unix-time": {
    title: "Unix Timestamp Converter - Epoch Time to Date Online",
    metaDescription: "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds and milliseconds, multiple date formats, and timezone conversion. Free online tool.",
    keywords: ["unix timestamp converter", "epoch time converter", "unix time to date", "timestamp to date online", "epoch converter", "unix epoch"],
    features: ["Convert Unix timestamps to human-readable dates instantly", "Support for both seconds and milliseconds precision", "Multiple date format outputs (ISO 8601, RFC 2822, local)", "Convert any date/time back to Unix timestamp", "Timezone-aware conversions"],
    useCases: ["Debugging API responses with epoch timestamps", "Converting log file timestamps to readable dates", "Working with database timestamp fields"],
    faq: [
      { q: "What is a Unix timestamp?", a: "A Unix timestamp (or epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. It is widely used in programming and databases to represent dates and times." },
      { q: "What is the difference between seconds and milliseconds timestamps?", a: "Unix timestamps in seconds are 10 digits (e.g., 1700000000), while millisecond timestamps are 13 digits (e.g., 1700000000000). JavaScript Date.now() returns milliseconds, while most Unix systems use seconds." },
      { q: "Is this tool accurate for all timezones?", a: "Yes, Unix timestamps are timezone-independent (always UTC). This tool correctly converts to and from your local timezone." }
    ]
  },
  "base64-string": {
    title: "Base64 Encode & Decode Online - String Converter",
    metaDescription: "Encode and decode Base64 strings instantly. Supports UTF-8 text, URL-safe Base64, and bulk conversions. Free online Base64 tool with client-side processing.",
    keywords: ["base64 encode", "base64 decode", "base64 converter", "base64 string encoder", "base64 online", "encode to base64"],
    features: ["Encode any text string to Base64 format", "Decode Base64 back to plain text", "Full UTF-8 character support", "URL-safe Base64 encoding option", "Instant real-time conversion"],
    useCases: ["Encoding API authentication tokens", "Embedding data in URLs or HTML", "Debugging encoded strings in API responses"],
    faq: [
      { q: "What is Base64 encoding?", a: "Base64 is a binary-to-text encoding scheme that converts binary data into ASCII characters. It uses 64 characters (A-Z, a-z, 0-9, +, /) to represent data, making it safe for text-based protocols like email and HTTP." },
      { q: "Is Base64 encoding the same as encryption?", a: "No. Base64 is an encoding, not encryption. It does not provide any security—anyone can decode Base64 data. Use it for data transport, not for protecting sensitive information." },
      { q: "Why does Base64 output look longer than the input?", a: "Base64 encoding increases data size by approximately 33% because it represents 3 bytes of binary data as 4 ASCII characters." }
    ]
  },
  "base64-image": {
    title: "Base64 Image Encoder & Decoder - Image to Base64 Online",
    metaDescription: "Convert images to Base64 data URIs and decode Base64 strings back to images. Supports PNG, JPG, GIF, SVG, and WebP. Free online image converter.",
    keywords: ["base64 image encoder", "image to base64", "base64 to image", "data uri generator", "base64 image converter", "inline image encoder"],
    features: ["Convert any image file to Base64 data URI", "Decode Base64 strings back to downloadable images", "Support for PNG, JPG, GIF, SVG, and WebP formats", "Generate ready-to-use CSS/HTML data URIs", "Drag and drop file upload"],
    useCases: ["Embedding images directly in HTML or CSS", "Reducing HTTP requests for small icons", "Storing image data in JSON or databases"],
    faq: [
      { q: "When should I use Base64 images?", a: "Base64 images are best for small icons, logos, or UI elements under 10KB. They reduce HTTP requests but increase file size by ~33%. For larger images, regular file references are more efficient." },
      { q: "What image formats are supported?", a: "This tool supports all common web image formats: PNG, JPEG, GIF, SVG, and WebP. The output includes the correct MIME type in the data URI." },
      { q: "Can I use Base64 images in CSS?", a: "Yes, you can use Base64 data URIs in CSS background-image properties: background-image: url(data:image/png;base64,...). This is common for small decorative elements." }
    ]
  },
  "url-encode": {
    title: "URL Encoder & Decoder Online - Percent Encoding Tool",
    metaDescription: "Encode and decode URLs with percent-encoding. Handle special characters, query parameters, and Unicode in URLs. Free online URL encoding tool.",
    keywords: ["url encoder", "url decoder", "percent encoding", "url encode online", "urlencode", "encode url characters"],
    features: ["Encode special characters to URL-safe percent-encoded format", "Decode percent-encoded URLs back to readable text", "Handle Unicode characters and international URLs", "Encode/decode individual components or full URLs", "Real-time conversion as you type"],
    useCases: ["Preparing query parameters for API calls", "Fixing broken URLs with special characters", "Debugging encoded URLs in web applications"],
    faq: [
      { q: "What is URL encoding?", a: "URL encoding (percent-encoding) replaces unsafe characters in URLs with a '%' followed by their hex value. For example, a space becomes %20. This ensures URLs are valid and can be transmitted correctly." },
      { q: "What characters need to be URL encoded?", a: "Characters like spaces, &, =, ?, #, +, and non-ASCII characters must be encoded in URLs. Reserved characters have special meanings in URLs and need encoding when used as data." },
      { q: "What is the difference between encodeURI and encodeURIComponent?", a: "encodeURI encodes a full URL but preserves valid URL characters like :, /, ?. encodeURIComponent encodes everything except letters, digits, and - _ . ~, making it suitable for encoding individual parameters." }
    ]
  },
  "html-entity": {
    title: "HTML Entity Encoder & Decoder - Special Characters Tool",
    metaDescription: "Encode and decode HTML entities. Convert special characters like <, >, &, quotes to HTML entities and back. Free online HTML entity converter.",
    keywords: ["html entity encoder", "html entity decoder", "html special characters", "html entities", "encode html", "decode html entities"],
    features: ["Convert special characters to HTML entities", "Decode HTML entities back to characters", "Support for named and numeric entities", "Handle all HTML5 named character references", "Bulk text encoding and decoding"],
    useCases: ["Preventing XSS by escaping user input", "Displaying code snippets in HTML pages", "Fixing broken characters in web content"],
    faq: [
      { q: "What are HTML entities?", a: "HTML entities are special codes that represent characters in HTML. For example, &lt; represents <, &amp; represents &. They prevent browsers from interpreting these characters as HTML markup." },
      { q: "Why do I need to encode HTML entities?", a: "Encoding HTML entities prevents cross-site scripting (XSS) attacks and ensures special characters display correctly in web pages instead of being interpreted as HTML tags." },
      { q: "What is the difference between named and numeric entities?", a: "Named entities use readable names like &amp; for &. Numeric entities use Unicode code points like &#38; or &#x26;. Named entities are more readable but numeric entities can represent any Unicode character." }
    ]
  },
  "hex-ascii": {
    title: "Hex to ASCII Converter - Hexadecimal Text Tool Online",
    metaDescription: "Convert between hexadecimal and ASCII text. Translate hex strings to readable text and vice versa. Free online hex converter for developers.",
    keywords: ["hex to ascii", "ascii to hex", "hexadecimal converter", "hex string converter", "hex to text", "text to hex online"],
    features: ["Convert hexadecimal strings to ASCII text", "Convert ASCII text to hexadecimal representation", "Support for various hex formats (with/without 0x prefix)", "Handle space-separated and continuous hex strings", "Real-time bidirectional conversion"],
    useCases: ["Reading hex dumps from network packet captures", "Debugging binary protocol data", "Working with hex-encoded data in APIs"],
    faq: [
      { q: "How does hex to ASCII conversion work?", a: "Each pair of hexadecimal digits represents one byte (0-255), which maps to an ASCII character. For example, 48 65 6C 6C 6F converts to 'Hello' because 0x48=H, 0x65=e, 0x6C=l, 0x6F=o." },
      { q: "What hex formats are supported?", a: "This tool accepts hex with or without 0x prefix, space-separated pairs (48 65 6C), continuous strings (48656C), and colon-separated (48:65:6C) formats." },
      { q: "Can this handle non-ASCII characters?", a: "This tool works with standard ASCII (0-127). For extended characters beyond ASCII, consider using a UTF-8 hex converter." }
    ]
  },
  "number-base": {
    title: "Number Base Converter - Binary, Octal, Decimal, Hex",
    metaDescription: "Convert numbers between binary, octal, decimal, and hexadecimal bases. Support for custom bases 2-36. Free online number base conversion tool.",
    keywords: ["number base converter", "binary converter", "hex to decimal", "octal converter", "base conversion", "radix converter"],
    features: ["Convert between binary, octal, decimal, and hexadecimal", "Support for any custom base from 2 to 36", "Instant conversion across all bases simultaneously", "Handle large numbers with precision", "Copy results with one click"],
    useCases: ["Converting between binary and hex for low-level programming", "Working with file permissions in octal", "Understanding memory addresses in hexadecimal"],
    faq: [
      { q: "What number bases are commonly used in programming?", a: "Binary (base 2) for bit manipulation, octal (base 8) for Unix permissions, decimal (base 10) for general use, and hexadecimal (base 16) for memory addresses and color codes." },
      { q: "How do I convert binary to decimal?", a: "Each binary digit represents a power of 2 from right to left. For example, 1010 = 1×8 + 0×4 + 1×2 + 0×1 = 10 in decimal." },
      { q: "What is base 36?", a: "Base 36 uses digits 0-9 and letters A-Z, giving 36 possible values per digit. It is the highest base that can use standard alphanumeric characters and is used for compact ID encoding." }
    ]
  },
  "json-format": {
    title: "JSON Formatter & Validator Online - Beautify & Minify JSON",
    metaDescription: "Format, validate, beautify, and minify JSON data online. Syntax highlighting, error detection, and tree view. Free JSON formatter with client-side processing.",
    keywords: ["json formatter", "json validator", "json beautifier", "json minifier", "format json online", "json pretty print", "validate json"],
    features: ["Format and beautify JSON with customizable indentation", "Validate JSON syntax with detailed error messages", "Minify JSON to reduce file size", "Syntax highlighting for easy reading", "Tree view for navigating complex JSON structures"],
    useCases: ["Formatting API response payloads for debugging", "Validating JSON configuration files", "Minifying JSON for production deployment"],
    faq: [
      { q: "What is JSON?", a: "JSON (JavaScript Object Notation) is a lightweight data interchange format. It is easy for humans to read and write, and easy for machines to parse and generate. JSON is the most common format for API data exchange." },
      { q: "How do I validate JSON?", a: "Paste your JSON into this tool and it will automatically validate the syntax. Common errors include missing commas, unquoted keys, trailing commas, and mismatched brackets." },
      { q: "What is the difference between beautify and minify?", a: "Beautifying adds indentation and line breaks for readability. Minifying removes all whitespace to reduce file size, which is useful for production APIs and configuration files." }
    ]
  },
  "yaml-json": {
    title: "YAML to JSON Converter & JSON to YAML Online",
    metaDescription: "Convert between YAML and JSON formats instantly. Handles nested structures, arrays, and comments. Free online YAML-JSON converter for developers.",
    keywords: ["yaml to json", "json to yaml", "yaml converter", "yaml json online", "convert yaml", "yaml parser"],
    features: ["Convert YAML to JSON with proper type handling", "Convert JSON to clean, readable YAML", "Preserve nested structures and arrays", "Handle YAML-specific features like anchors and aliases", "Syntax validation for both formats"],
    useCases: ["Converting Kubernetes YAML configs for API consumption", "Transforming CI/CD pipeline configs between formats", "Working with Docker Compose and CloudFormation templates"],
    faq: [
      { q: "What is the difference between YAML and JSON?", a: "YAML uses indentation for structure and supports comments, making it more human-readable. JSON uses braces and brackets, is more strict, and is better for machine parsing. Both can represent the same data." },
      { q: "Can YAML represent everything JSON can?", a: "Yes, YAML is a superset of JSON. Any valid JSON is also valid YAML. However, YAML has additional features like comments, anchors, and multi-line strings that JSON does not support." },
      { q: "Why convert between YAML and JSON?", a: "Many tools prefer one format over the other. Kubernetes uses YAML, while APIs typically use JSON. Converting between them helps bridge these ecosystems." }
    ]
  },
  "json-csv": {
    title: "JSON to CSV Converter & CSV to JSON Online",
    metaDescription: "Convert JSON arrays to CSV spreadsheet format and CSV data back to JSON. Handles nested objects and arrays. Free online JSON-CSV conversion tool.",
    keywords: ["json to csv", "csv to json", "json csv converter", "convert json to csv online", "csv converter", "json array to csv"],
    features: ["Convert JSON arrays to CSV with automatic header detection", "Convert CSV data back to JSON array format", "Handle nested objects by flattening keys", "Custom delimiter support (comma, tab, semicolon)", "Download converted files directly"],
    useCases: ["Exporting API data to spreadsheets", "Importing CSV data for API consumption", "Converting database exports between formats"],
    faq: [
      { q: "How does JSON to CSV conversion handle nested objects?", a: "Nested objects are flattened using dot notation. For example, {address: {city: 'NYC'}} becomes a column named 'address.city' with value 'NYC'." },
      { q: "What JSON structure works best for CSV?", a: "An array of objects with consistent keys works best, where each object becomes a row and each key becomes a column header." },
      { q: "Can I use custom delimiters?", a: "Yes, you can choose between comma, tab, semicolon, or pipe as the field delimiter for your CSV output." }
    ]
  },
  "json-to-code": {
    title: "JSON to Code Generator - TypeScript, Python, Go & More",
    metaDescription: "Generate type definitions and code from JSON data. Create TypeScript interfaces, Python dataclasses, Go structs, and more from any JSON structure.",
    keywords: ["json to typescript", "json to python", "json to code", "json type generator", "json to interface", "json to struct"],
    features: ["Generate TypeScript interfaces from JSON", "Create Python dataclasses and type hints", "Generate Go structs with JSON tags", "Support for multiple programming languages", "Handle nested objects and arrays automatically"],
    useCases: ["Creating TypeScript types from API responses", "Generating model classes from JSON schemas", "Quick-starting code from JSON data structures"],
    faq: [
      { q: "What languages are supported?", a: "This tool generates code for TypeScript (interfaces), Python (dataclasses), Go (structs with json tags), Rust (structs with serde), Java (classes), and more." },
      { q: "How are nested objects handled?", a: "Nested JSON objects are converted to separate type definitions that reference each other, maintaining the original structure in a type-safe way." },
      { q: "Can it handle arrays with mixed types?", a: "Yes, the tool analyzes array contents and generates union types (TypeScript) or appropriate generic types for arrays with mixed value types." }
    ]
  },
  "php-json": {
    title: "PHP Array to JSON Converter & JSON to PHP Online",
    metaDescription: "Convert between PHP arrays/objects and JSON format. Handle PHP serialized data, associative arrays, and nested structures. Free online PHP-JSON converter.",
    keywords: ["php to json", "json to php", "php array converter", "php json online", "convert php array", "php serialized to json"],
    features: ["Convert PHP arrays to JSON format", "Convert JSON to PHP array syntax", "Handle associative and indexed arrays", "Support for nested PHP data structures", "Proper handling of PHP-specific types"],
    useCases: ["Migrating PHP backend data to JSON APIs", "Converting PHP config arrays for JavaScript consumption", "Debugging PHP data structures"],
    faq: [
      { q: "How are PHP associative arrays converted to JSON?", a: "PHP associative arrays become JSON objects. For example, ['name' => 'John', 'age' => 30] becomes {\"name\": \"John\", \"age\": 30}." },
      { q: "What PHP data types are supported?", a: "Strings, integers, floats, booleans, null, indexed arrays, and associative arrays are all converted correctly to their JSON equivalents." },
      { q: "Can this handle PHP serialized data?", a: "This tool focuses on PHP array/object syntax to JSON conversion. For PHP serialize() format, use the PHP Serializer tool instead." }
    ]
  },
  "jwt-debugger": {
    title: "JWT Debugger & Decoder Online - JSON Web Token Inspector",
    metaDescription: "Decode, inspect, and debug JWT tokens. View header, payload, and verify signatures for HS256, RS256, and more. Free online JWT debugger tool.",
    keywords: ["jwt debugger", "jwt decoder", "json web token", "jwt inspector", "decode jwt", "jwt viewer online", "jwt verify"],
    features: ["Decode JWT tokens to view header and payload", "Inspect claims like expiration, issuer, and audience", "Verify token signatures (HS256, RS256, ES256)", "Color-coded token structure visualization", "Check token expiration status"],
    useCases: ["Debugging authentication issues in web apps", "Inspecting OAuth2 access and ID tokens", "Verifying JWT claims before deployment"],
    faq: [
      { q: "What is a JWT token?", a: "A JSON Web Token (JWT) is a compact, URL-safe token format used for securely transmitting information between parties. It consists of three parts: header (algorithm), payload (claims), and signature." },
      { q: "Is it safe to paste my JWT here?", a: "Yes, this tool processes everything client-side in your browser. No data is sent to any server. However, never share production tokens with untrusted tools." },
      { q: "How do I verify a JWT signature?", a: "Enter the signing secret (for HS256) or public key (for RS256/ES256) in the signature verification section. The tool will indicate whether the signature is valid." }
    ]
  },
  "html-jsx": {
    title: "HTML to JSX Converter Online - React Component Generator",
    metaDescription: "Convert HTML to JSX for React components. Automatically handles className, style objects, self-closing tags, and event handlers. Free online HTML to JSX tool.",
    keywords: ["html to jsx", "html to react", "jsx converter", "convert html to jsx online", "react component converter", "html jsx"],
    features: ["Convert HTML attributes to JSX equivalents (class → className)", "Transform inline styles to React style objects", "Handle self-closing tags correctly", "Convert event handlers to React syntax", "Preserve HTML structure and nesting"],
    useCases: ["Migrating HTML templates to React components", "Converting design mockups to JSX", "Quick-starting React components from existing HTML"],
    faq: [
      { q: "What changes does HTML to JSX conversion make?", a: "Key changes include: class → className, for → htmlFor, inline styles become objects (style={{color: 'red'}}), self-closing tags get />, and event handlers become camelCase (onclick → onClick)." },
      { q: "Does this handle SVG elements?", a: "Yes, SVG attributes like stroke-width become strokeWidth, fill-rule becomes fillRule, and other SVG-specific attributes are converted to their JSX camelCase equivalents." },
      { q: "Can I convert entire HTML pages?", a: "Yes, but typically you would convert specific sections or components rather than full pages. The tool handles any valid HTML fragment." }
    ]
  },
  "sql-formatter": {
    title: "SQL Formatter & Beautifier Online - Format SQL Queries",
    metaDescription: "Format and beautify SQL queries with proper indentation and syntax highlighting. Supports MySQL, PostgreSQL, SQL Server, and Oracle. Free online SQL formatter.",
    keywords: ["sql formatter", "sql beautifier", "format sql online", "sql pretty print", "sql query formatter", "beautify sql"],
    features: ["Format SQL queries with proper indentation", "Support for MySQL, PostgreSQL, SQL Server, and Oracle dialects", "Syntax highlighting for keywords and identifiers", "Customizable indentation and formatting options", "Handle complex queries with subqueries and joins"],
    useCases: ["Formatting messy SQL queries for code review", "Standardizing SQL style across a team", "Making complex queries readable for debugging"],
    faq: [
      { q: "What SQL dialects are supported?", a: "This formatter supports standard SQL, MySQL, PostgreSQL, SQL Server (T-SQL), Oracle PL/SQL, and other common SQL dialects." },
      { q: "Does formatting change the query behavior?", a: "No, formatting only changes whitespace and indentation. The SQL query logic, execution plan, and results remain exactly the same." },
      { q: "Can it handle stored procedures?", a: "Yes, the formatter handles complex SQL including stored procedures, CTEs (Common Table Expressions), window functions, and multi-statement queries." }
    ]
  },
  "beautify-minify": {
    title: "Code Beautifier & Minifier Online - HTML, CSS, JS, XML",
    metaDescription: "Beautify or minify HTML, CSS, JavaScript, and XML code. Format code with proper indentation or compress for production. Free online code formatter.",
    keywords: ["code beautifier", "code minifier", "html beautifier", "css minifier", "javascript formatter", "minify code online"],
    features: ["Beautify HTML, CSS, JavaScript, and XML", "Minify code to reduce file size", "Customizable indentation (spaces or tabs)", "Preserve or remove comments", "Syntax-aware formatting"],
    useCases: ["Formatting minified code for debugging", "Minifying assets for production deployment", "Standardizing code style across projects"],
    faq: [
      { q: "What is code minification?", a: "Minification removes unnecessary whitespace, comments, and formatting from code to reduce file size. This speeds up page loading without changing functionality." },
      { q: "What languages are supported?", a: "This tool supports HTML, CSS, JavaScript, JSON, XML, and SQL beautification and minification." },
      { q: "Does minification affect code functionality?", a: "No, proper minification only removes whitespace and comments. The code behavior remains identical." }
    ]
  },
  "curl-to-code": {
    title: "cURL to Code Converter - Python, JavaScript, Go & More",
    metaDescription: "Convert cURL commands to code in Python, JavaScript, Go, PHP, Ruby, and more. Generate HTTP request code from cURL syntax. Free online cURL converter.",
    keywords: ["curl to code", "curl to python", "curl to javascript", "curl converter", "curl to fetch", "curl to axios", "convert curl command"],
    features: ["Convert cURL commands to multiple programming languages", "Support for Python (requests), JavaScript (fetch/axios), Go, PHP, Ruby", "Handle headers, cookies, authentication, and request bodies", "Parse complex cURL options correctly", "Generate clean, production-ready code"],
    useCases: ["Converting API documentation cURL examples to your language", "Migrating shell scripts to application code", "Quick-starting HTTP client code from browser DevTools"],
    faq: [
      { q: "What cURL options are supported?", a: "Common options including -X (method), -H (headers), -d (data), -u (auth), --cookie, -F (form data), -k (insecure), and many more are parsed and converted correctly." },
      { q: "How do I get a cURL command from my browser?", a: "In Chrome/Firefox DevTools, go to the Network tab, right-click any request, and select 'Copy as cURL'. Then paste it here to convert to your preferred language." },
      { q: "What languages are supported?", a: "Python (requests), JavaScript (fetch/axios), Go (net/http), PHP (cURL/Guzzle), Ruby (Net::HTTP), Java (HttpClient), and more." }
    ]
  },
  "svg-css": {
    title: "SVG to CSS Background Converter - Inline SVG Data URI",
    metaDescription: "Convert SVG images to CSS background-image data URIs. Optimize and encode SVGs for inline CSS use. Free online SVG to CSS converter tool.",
    keywords: ["svg to css", "svg data uri", "svg background image", "inline svg css", "svg encoder", "svg to css background"],
    features: ["Convert SVG to CSS background-image data URI", "URL-encode SVGs for safe CSS embedding", "Optimize SVG output for smaller file size", "Generate ready-to-use CSS code snippets", "Preview the SVG before and after conversion"],
    useCases: ["Embedding icons as CSS backgrounds without HTTP requests", "Creating CSS-only decorative elements", "Optimizing small SVG assets for inline use"],
    faq: [
      { q: "Why embed SVGs in CSS?", a: "Embedding SVGs as CSS data URIs eliminates HTTP requests for small icons and decorative elements, improving page load performance." },
      { q: "Should I Base64 encode or URL encode SVGs?", a: "URL encoding is recommended for SVGs in CSS. It produces smaller output than Base64 and keeps the SVG partially readable." },
      { q: "What is the size limit for inline SVGs?", a: "There is no hard limit, but inline SVGs larger than 10KB can bloat your CSS. For larger SVGs, use external files with proper caching headers instead." }
    ]
  },
  "regex-tester": {
    title: "Regex Tester & Debugger Online - Regular Expression Tool",
    metaDescription: "Test and debug regular expressions with real-time matching, syntax highlighting, and match group extraction. Supports JavaScript regex. Free online regex tester.",
    keywords: ["regex tester", "regular expression tester", "regex debugger", "regex online", "test regex", "regexp tester", "regex validator"],
    features: ["Real-time regex matching with highlighting", "View capture groups and match details", "Support for all JavaScript regex flags (g, i, m, s, u)", "Match count and group extraction", "Common regex pattern library"],
    useCases: ["Building and testing regex patterns for form validation", "Extracting data from text using capture groups", "Debugging complex regular expressions"],
    faq: [
      { q: "What regex flavor does this tool use?", a: "This tool uses JavaScript's regular expression engine, which supports standard regex syntax including lookahead, lookbehind, named groups, and Unicode properties." },
      { q: "What are regex flags?", a: "Flags modify regex behavior: g (global - find all matches), i (case-insensitive), m (multiline - ^ and $ match line boundaries), s (dotAll - . matches newlines), u (unicode)." },
      { q: "How do capture groups work?", a: "Parentheses () create capture groups that extract matched substrings. Named groups use (?<name>...) syntax. This tool shows all groups for each match." }
    ]
  },
  "text-diff": {
    title: "Text Diff Checker Online - Compare Text Side by Side",
    metaDescription: "Compare two texts side by side with highlighted differences. Detect additions, deletions, and modifications line by line. Free online text diff tool.",
    keywords: ["text diff", "diff checker", "compare text", "text comparison", "diff tool online", "side by side diff"],
    features: ["Side-by-side text comparison with color highlighting", "Line-by-line and character-by-character diff", "Detect additions, deletions, and modifications", "Unified or split diff view", "Ignore whitespace option"],
    useCases: ["Comparing code changes before committing", "Checking configuration file differences", "Reviewing text edits and revisions"],
    faq: [
      { q: "What diff algorithm does this use?", a: "This tool uses the Myers diff algorithm, the same algorithm used by Git. It finds the minimal set of changes between two texts." },
      { q: "Can I ignore whitespace differences?", a: "Yes, you can toggle whitespace comparison to ignore differences in spaces, tabs, and line endings." },
      { q: "What do the colors mean?", a: "Green highlights indicate additions (text in the new version but not the old). Red highlights indicate deletions (text in the old version but not the new)." }
    ]
  },
  "string-case": {
    title: "String Case Converter - camelCase, snake_case & More",
    metaDescription: "Convert text between camelCase, PascalCase, snake_case, kebab-case, UPPER_CASE, and more. Free online string case conversion tool for developers.",
    keywords: ["string case converter", "camelcase converter", "snake case", "kebab case", "pascal case", "case converter online"],
    features: ["Convert between 10+ string case formats", "Support for camelCase, PascalCase, snake_case, kebab-case", "SCREAMING_SNAKE_CASE and Title Case", "Dot notation and path case", "Bulk multi-line conversion"],
    useCases: ["Converting variable names between coding conventions", "Transforming database column names to API field names", "Standardizing naming conventions across projects"],
    faq: [
      { q: "What string cases are supported?", a: "camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, dot.case, path/case, Title Case, Sentence case, UPPER CASE, lower case, and more." },
      { q: "When should I use each case?", a: "camelCase for JavaScript variables, PascalCase for classes/components, snake_case for Python/Ruby/database columns, kebab-case for CSS classes and URL slugs, SCREAMING_SNAKE_CASE for constants." },
      { q: "Can it handle acronyms correctly?", a: "Yes, the converter intelligently handles acronyms like 'HTTP' or 'API'. For example, 'httpAPIRequest' correctly converts to 'http_api_request' in snake_case." }
    ]
  },
  "lorem-ipsum": {
    title: "Lorem Ipsum Generator - Placeholder Text Tool Online",
    metaDescription: "Generate Lorem Ipsum placeholder text for designs and layouts. Create paragraphs, sentences, or words. Free online Lorem Ipsum generator with custom options.",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lorem ipsum online", "filler text", "lipsum generator"],
    features: ["Generate paragraphs, sentences, or words", "Customizable text length", "Start with 'Lorem ipsum dolor sit amet...' option", "Copy generated text with one click", "Clean, properly formatted output"],
    useCases: ["Filling design mockups with realistic text", "Testing typography and layout spacing", "Prototyping UI components with placeholder content"],
    faq: [
      { q: "What is Lorem Ipsum?", a: "Lorem Ipsum is dummy text used in the printing and typesetting industry since the 1500s. It is derived from a work by Cicero, with words altered to create meaningless but realistic-looking text." },
      { q: "Why use Lorem Ipsum instead of real text?", a: "Lorem Ipsum helps focus on visual design without the distraction of readable content. It has a fairly normal distribution of letters, making it look like real text at a glance." },
      { q: "Can I generate text in other languages?", a: "This tool generates classical Lorem Ipsum text. The generated text maintains Latin-like character distribution suitable for most Western typography testing." }
    ]
  },
  "string-inspector": {
    title: "String Inspector - Character Count, Encoding & Analysis",
    metaDescription: "Analyze strings for character count, byte size, encoding, whitespace, and special characters. Inspect Unicode, control characters, and more. Free online tool.",
    keywords: ["string inspector", "character counter", "string analyzer", "unicode inspector", "byte counter", "text analyzer online"],
    features: ["Character and word count", "Byte size in different encodings (UTF-8, UTF-16)", "Detect invisible and control characters", "Unicode code point inspection", "Whitespace and line ending analysis"],
    useCases: ["Debugging encoding issues in text data", "Checking string lengths for database column limits", "Finding hidden characters causing bugs"],
    faq: [
      { q: "Why does character count differ from byte count?", a: "In UTF-8, ASCII characters use 1 byte, but characters like emoji or CJK characters use 2-4 bytes. A string with 10 characters might be 10-40 bytes depending on content." },
      { q: "What are invisible characters?", a: "Invisible characters include zero-width spaces (U+200B), zero-width joiners (U+200D), soft hyphens (U+00AD), and various Unicode control characters that are not visible but can cause bugs." },
      { q: "How do I find hidden characters in my string?", a: "Paste your text and the inspector will highlight all non-printable, control, and zero-width characters with their Unicode code points and names." }
    ]
  },
  "backslash-escape": {
    title: "Backslash Escape & Unescape Tool - String Escaper Online",
    metaDescription: "Escape and unescape backslash characters in strings. Handle JSON strings, regex patterns, and code string literals. Free online string escaper.",
    keywords: ["backslash escape", "string escape", "unescape string", "escape characters", "json string escape", "backslash unescape online"],
    features: ["Escape special characters with backslashes", "Unescape backslash-encoded strings", "Handle common escape sequences (\\n, \\t, \\r, \\\\)", "JSON string escaping mode", "Real-time conversion"],
    useCases: ["Preparing strings for JSON embedding", "Escaping regex patterns for string literals", "Debugging escaped strings in log files"],
    faq: [
      { q: "What characters need backslash escaping?", a: "Common characters requiring escaping include: backslash (\\\\), double quote (\\\"), newline (\\n), tab (\\t), carriage return (\\r), and null (\\0)." },
      { q: "What is the difference between escape and unescape?", a: "Escaping converts special characters to their backslash representation (newline → \\n). Unescaping does the reverse, converting \\n back to an actual newline character." },
      { q: "When do I need to escape strings?", a: "When embedding strings in JSON, inserting text into code string literals, building regex patterns as strings, or working with file paths on Windows." }
    ]
  },
  "line-sort-dedupe": {
    title: "Line Sorter & Deduplicator - Sort Text Lines Online",
    metaDescription: "Sort text lines alphabetically, numerically, or by length. Remove duplicate lines and blank lines. Free online line sorting and deduplication tool.",
    keywords: ["sort lines", "remove duplicate lines", "deduplicate text", "sort text online", "unique lines", "line sorter"],
    features: ["Sort lines alphabetically (A-Z or Z-A)", "Numeric and natural sorting", "Remove duplicate lines", "Remove empty/blank lines", "Case-sensitive or case-insensitive sorting"],
    useCases: ["Cleaning up lists and data files", "Sorting configuration entries", "Removing duplicates from log files or CSV data"],
    faq: [
      { q: "What is natural sorting?", a: "Natural sorting orders strings with numbers the way humans expect: file1, file2, file10 instead of file1, file10, file2 (which is standard alphabetical order)." },
      { q: "Can I sort and deduplicate at the same time?", a: "Yes, you can combine sorting and deduplication in a single operation." },
      { q: "Is the comparison case-sensitive?", a: "By default, sorting is case-sensitive (A before a). You can toggle case-insensitive mode for sorting and deduplication." }
    ]
  },
  "uuid-generator": {
    title: "UUID & ULID Generator Online - Generate Unique IDs",
    metaDescription: "Generate UUID v1, v4, v7 and ULID identifiers. Decode existing UUIDs to extract version and timestamp info. Free online UUID/ULID generator.",
    keywords: ["uuid generator", "ulid generator", "generate uuid", "uuid v4", "uuid v7", "unique id generator", "uuid online"],
    features: ["Generate UUID v1, v4, and v7", "Generate ULID identifiers", "Bulk generation of multiple IDs", "Decode UUIDs to inspect version and variant", "Copy with one click"],
    useCases: ["Generating primary keys for databases", "Creating unique identifiers for distributed systems", "Testing with random but valid UUIDs"],
    faq: [
      { q: "What is the difference between UUID v4 and v7?", a: "UUID v4 is fully random. UUID v7 embeds a timestamp, making it sortable by creation time—ideal for database primary keys as it improves index performance." },
      { q: "What is a ULID?", a: "ULID (Universally Unique Lexicographically Sortable Identifier) is a 26-character, timestamp-first identifier. It is sortable, URL-safe, and more compact than UUID." },
      { q: "Which should I use for database primary keys?", a: "UUID v7 or ULID are best for database primary keys because their time-ordered nature improves B-tree index performance compared to random UUID v4." }
    ]
  },
  "qr-code": {
    title: "QR Code Generator & Reader Online - Create & Scan QR Codes",
    metaDescription: "Generate QR codes from text, URLs, or data. Read and decode QR codes from images. Customizable colors and sizes. Free online QR code tool.",
    keywords: ["qr code generator", "qr code reader", "create qr code", "scan qr code online", "qr code maker", "generate qr code free"],
    features: ["Generate QR codes from any text or URL", "Read and decode QR codes from uploaded images", "Customize colors, size, and error correction level", "Download QR codes as PNG or SVG", "Support for WiFi, vCard, and other QR formats"],
    useCases: ["Creating QR codes for URLs and marketing materials", "Generating WiFi login QR codes", "Reading QR codes from screenshots"],
    faq: [
      { q: "What can I encode in a QR code?", a: "QR codes can encode URLs, plain text, WiFi credentials, email addresses, phone numbers, vCards, geographic coordinates, and more." },
      { q: "What are error correction levels?", a: "QR codes have 4 error correction levels: L (7%), M (15%), Q (25%), H (30%). Higher levels allow more damage while remaining readable, but produce denser codes." },
      { q: "What is the maximum data a QR code can hold?", a: "A QR code can hold up to 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 bytes of binary data." }
    ]
  },
  "hash-generator": {
    title: "Hash Generator Online - MD5, SHA-1, SHA-256 & More",
    metaDescription: "Generate MD5, SHA-1, SHA-256, SHA-512, and other hash values from text or files. Compare hashes for integrity verification. Free online hash tool.",
    keywords: ["hash generator", "md5 generator", "sha256 hash", "sha1 generator", "hash calculator", "checksum generator online"],
    features: ["Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes", "Hash text strings or uploaded files", "Compare two hashes for verification", "HMAC generation with secret key", "Copy hash values with one click"],
    useCases: ["Verifying file integrity after downloads", "Generating password hashes for testing", "Creating checksums for data verification"],
    faq: [
      { q: "Which hash algorithm should I use?", a: "SHA-256 is recommended for most purposes. MD5 and SHA-1 are considered cryptographically broken and should only be used for non-security checksums." },
      { q: "Can a hash be reversed?", a: "No, cryptographic hash functions are one-way. You cannot derive the original input from a hash value." },
      { q: "What is HMAC?", a: "HMAC (Hash-based Message Authentication Code) combines a hash function with a secret key to verify both data integrity and authenticity." }
    ]
  },
  "color-converter": {
    title: "Color Converter - HEX, RGB, HSL, HSV Online Tool",
    metaDescription: "Convert colors between HEX, RGB, HSL, HSV, and CMYK formats. Color picker, palette generator, and contrast checker. Free online color conversion tool.",
    keywords: ["color converter", "hex to rgb", "rgb to hex", "hsl converter", "color picker online", "color format converter"],
    features: ["Convert between HEX, RGB, HSL, HSV, and CMYK", "Visual color picker for easy selection", "View all format representations simultaneously", "Copy color values in any format", "Real-time preview of selected colors"],
    useCases: ["Converting design system colors between formats", "Finding the HEX value for an RGB color", "Working with CSS color values"],
    faq: [
      { q: "What is the difference between RGB and HEX?", a: "They represent the same thing differently. RGB uses decimal values (rgb(255, 0, 0) for red), while HEX uses hexadecimal (#FF0000)." },
      { q: "When should I use HSL over RGB?", a: "HSL (Hue, Saturation, Lightness) is more intuitive for color manipulation. It is easier to create lighter/darker variants by adjusting lightness." },
      { q: "What is CMYK used for?", a: "CMYK (Cyan, Magenta, Yellow, Key/Black) is used for print design. Converting web colors to CMYK helps ensure printed materials match screen colors." }
    ]
  },
  "random-string": {
    title: "Random String Generator - Passwords, Tokens & Keys",
    metaDescription: "Generate random strings, passwords, and tokens with customizable length, character sets, and formats. Cryptographically secure generation. Free online tool.",
    keywords: ["random string generator", "password generator", "random token", "secure password", "random characters", "string generator online"],
    features: ["Generate cryptographically secure random strings", "Customizable character sets (letters, numbers, symbols)", "Adjustable string length", "Bulk generation of multiple strings", "Password strength indicator"],
    useCases: ["Creating secure passwords", "Generating API keys and tokens", "Creating test data with random values"],
    faq: [
      { q: "Are the generated strings cryptographically secure?", a: "Yes, this tool uses the Web Crypto API (crypto.getRandomValues) which provides cryptographically secure random number generation." },
      { q: "How long should a secure password be?", a: "At least 12-16 characters for most purposes, using a mix of uppercase, lowercase, numbers, and symbols. For critical systems, 20+ characters are recommended." },
      { q: "Can I exclude ambiguous characters?", a: "Yes, you can exclude characters that look similar (like 0/O, 1/l/I) to avoid confusion when manually typing generated strings." }
    ]
  },
  "url-parser": {
    title: "URL Parser & Analyzer - Extract URL Components Online",
    metaDescription: "Parse URLs and extract protocol, hostname, port, path, query parameters, and fragment. Analyze and debug URL structures. Free online URL parser tool.",
    keywords: ["url parser", "url analyzer", "parse url online", "url components", "query string parser", "url breakdown tool"],
    features: ["Parse URLs into all components", "Extract and display query parameters", "Show protocol, hostname, port, path, hash", "Decode URL-encoded parameters", "Validate URL structure"],
    useCases: ["Debugging redirect URLs with complex query strings", "Extracting tracking parameters from marketing URLs", "Analyzing API endpoint structures"],
    faq: [
      { q: "What are the parts of a URL?", a: "A URL consists of: protocol (https://), hostname (example.com), port (:443), path (/page), query string (?key=value), and fragment (#section)." },
      { q: "How are query parameters parsed?", a: "Query parameters after the ? are split by & into key=value pairs. Values are URL-decoded to show their actual content." },
      { q: "What makes a URL valid?", a: "A valid URL needs at minimum a protocol and hostname. The protocol must be known (http, https, ftp, etc.) and the hostname must follow DNS naming rules." }
    ]
  },
  "cron-parser": {
    title: "Cron Expression Parser & Generator - Cron Job Scheduler",
    metaDescription: "Parse cron expressions to human-readable descriptions. Generate cron syntax with an interactive builder. See next run times. Free online cron parser tool.",
    keywords: ["cron parser", "cron expression generator", "cron schedule", "crontab", "cron job scheduler", "parse cron expression online"],
    features: ["Parse cron expressions to plain English descriptions", "Interactive cron expression builder", "Show next 5 scheduled run times", "Support for standard 5-field and extended 6-field cron", "Common cron expression presets"],
    useCases: ["Understanding existing cron schedules", "Building new cron expressions visually", "Verifying cron timing before deployment"],
    faq: [
      { q: "What is a cron expression?", a: "A cron expression defines a schedule using 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6). For example, '0 9 * * 1' means every Monday at 9:00 AM." },
      { q: "What do the special characters mean?", a: "* means any value, , separates multiple values, - defines ranges, / defines step values. For example, */5 in the minute field means every 5 minutes." },
      { q: "What is the difference between 5-field and 6-field cron?", a: "Standard cron uses 5 fields (minute through day-of-week). Some systems add a 6th field for seconds at the beginning." }
    ]
  },
  "certificate-decoder": {
    title: "SSL Certificate Decoder - X.509 Certificate Viewer Online",
    metaDescription: "Decode and inspect X.509 SSL/TLS certificates. View subject, issuer, validity dates, SANs, and key details. Free online certificate decoder tool.",
    keywords: ["certificate decoder", "ssl certificate viewer", "x509 decoder", "pem decoder", "certificate inspector", "ssl cert decoder online"],
    features: ["Decode PEM and DER format certificates", "View subject, issuer, and validity dates", "Inspect Subject Alternative Names (SANs)", "Show public key details and algorithm", "Check certificate chain information"],
    useCases: ["Inspecting SSL certificates during troubleshooting", "Verifying certificate details before installation", "Checking certificate expiration dates"],
    faq: [
      { q: "What is a PEM certificate?", a: "PEM (Privacy-Enhanced Mail) is a Base64-encoded format for certificates. It starts with -----BEGIN CERTIFICATE----- and ends with -----END CERTIFICATE-----." },
      { q: "What are Subject Alternative Names?", a: "SANs list all domain names and IP addresses a certificate is valid for. Modern certificates use SANs instead of the Common Name (CN) for domain validation." },
      { q: "How do I check if a certificate is expired?", a: "Paste your certificate and check the 'Not Before' and 'Not After' dates. If the current date falls outside this range, the certificate is expired or not yet valid." }
    ]
  },
  "php-serializer": {
    title: "PHP Serializer & Unserializer - PHP Data Format Tool",
    metaDescription: "Serialize and unserialize PHP data. Convert between PHP serialize format and readable output. Debug PHP serialized strings. Free online PHP serializer.",
    keywords: ["php serializer", "php unserialize", "php serialize online", "php data format", "unserialize php", "php serialize decoder"],
    features: ["Serialize PHP data structures", "Unserialize PHP serialized strings", "Pretty-print unserialized data", "Handle nested arrays and objects", "Validate serialized string format"],
    useCases: ["Debugging WordPress serialized options", "Reading PHP session data", "Converting serialized data from legacy PHP applications"],
    faq: [
      { q: "What is PHP serialize format?", a: "PHP serialize() converts a PHP value to a storable string representation. For example, an array ['a', 'b'] becomes a:2:{i:0;s:1:\"a\";i:1;s:1:\"b\";} with type and length information." },
      { q: "Where is PHP serialized data commonly found?", a: "WordPress stores plugin settings, widget data, and transients in serialized format. It is also used in PHP session files and legacy database storage." },
      { q: "Is PHP unserialize safe?", a: "Unserializing untrusted data can be dangerous as it can trigger object instantiation and magic methods. This tool safely parses the data format without executing PHP code." }
    ]
  },
  "html-preview": {
    title: "HTML Preview - Live HTML Editor & Renderer Online",
    metaDescription: "Write and preview HTML code in real-time. Live rendering with CSS and JavaScript support. Free online HTML preview tool for web development.",
    keywords: ["html preview", "html editor online", "live html editor", "html renderer", "preview html code", "html viewer online"],
    features: ["Real-time HTML preview as you type", "Full CSS and inline style support", "JavaScript execution in sandboxed iframe", "Responsive preview at different screen sizes", "Full-page or component preview modes"],
    useCases: ["Prototyping HTML/CSS layouts quickly", "Testing email HTML templates", "Previewing HTML snippets from documentation"],
    faq: [
      { q: "Does this support CSS?", a: "Yes, you can include <style> tags or inline styles. External CSS frameworks can be loaded via <link> tags pointing to CDN URLs." },
      { q: "Can I run JavaScript in the preview?", a: "Yes, JavaScript runs in a sandboxed iframe for security. You can include <script> tags for interactive previews." },
      { q: "Is my code saved?", a: "No, all code exists only in your browser session. Nothing is sent to any server." }
    ]
  },
  "markdown-preview": {
    title: "Markdown Preview & Editor Online - Live Markdown Renderer",
    metaDescription: "Write and preview Markdown with live rendering. Supports GitHub Flavored Markdown, tables, code blocks, and more. Free online Markdown editor.",
    keywords: ["markdown preview", "markdown editor online", "markdown renderer", "github markdown", "preview markdown", "markdown viewer"],
    features: ["Live Markdown rendering as you type", "GitHub Flavored Markdown (GFM) support", "Syntax highlighted code blocks", "Table, task list, and emoji support", "Split editor and preview panes"],
    useCases: ["Writing and previewing README files", "Drafting GitHub issues and pull requests", "Creating documentation with Markdown"],
    faq: [
      { q: "What Markdown flavor is supported?", a: "This tool supports GitHub Flavored Markdown (GFM), including tables, task lists, strikethrough, autolinks, and fenced code blocks with syntax highlighting." },
      { q: "Can I preview code blocks with syntax highlighting?", a: "Yes, fenced code blocks with language identifiers (```javascript, ```python, etc.) are rendered with proper syntax highlighting." },
      { q: "Does this support LaTeX/math?", a: "Basic math rendering may be supported through standard Markdown extensions. For full LaTeX support, dedicated math editors are recommended." }
    ]
  }
};

const BASE_URL = 'https://www.shivasaxena.com/handy-dev-tools';
const allTools = toolCategories.flatMap(cat => cat.tools);

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getCategoryForTool(toolId: string): string {
  for (const cat of toolCategories) {
    if (cat.tools.some(t => t.id === toolId)) return cat.name;
  }
  return 'Developer Tools';
}

function generateToolPage(tool: { id: string; name: string; description: string }): string {
  const seo = seoConfig[tool.id];
  if (!seo) {
    console.warn(`No SEO config for tool: ${tool.id}`);
    return '';
  }

  const toolUrl = `${BASE_URL}/tool/${tool.id}`;
  const title = `${seo.title} | HandyDevTools`;
  const category = getCategoryForTool(tool.id);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": tool.name,
      "description": seo.metaDescription,
      "url": toolUrl,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "isPartOf": { "@type": "WebSite", "name": "HandyDevTools", "url": `${BASE_URL}/` }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": seo.faq.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "HandyDevTools", "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 2, "name": category, "item": `${BASE_URL}/` },
        { "@type": "ListItem", "position": 3, "name": tool.name, "item": toolUrl }
      ]
    }
  ];

  // Get related tools (same category, excluding self)
  const categoryTools = toolCategories.find(cat => cat.tools.some(t => t.id === tool.id))?.tools || [];
  const relatedTools = categoryTools.filter(t => t.id !== tool.id).slice(0, 4);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>

    <!-- Primary Meta Tags -->
    <meta name="description" content="${escapeHtml(seo.metaDescription)}">
    <meta name="keywords" content="${escapeHtml(seo.keywords.join(', '))}">
    <meta name="author" content="HandyDevTools">
    <meta name="robots" content="index, follow">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${toolUrl}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(seo.metaDescription)}">
    <meta property="og:image" content="${BASE_URL}/og-image.svg">
    <meta property="og:site_name" content="HandyDevTools">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${toolUrl}">
    <meta property="twitter:title" content="${escapeHtml(title)}">
    <meta property="twitter:description" content="${escapeHtml(seo.metaDescription)}">
    <meta property="twitter:image" content="${BASE_URL}/og-image.svg">

    <!-- Canonical -->
    <link rel="canonical" href="${toolUrl}">

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/handy-dev-tools/favicon.svg">

    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
        }
        .hero {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 3rem 1.5rem;
            text-align: center;
        }
        .hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.75rem; color: white; }
        .hero p { font-size: 1.1rem; opacity: 0.9; max-width: 600px; margin: 0 auto 1.5rem; color: white; }
        .cta-btn {
            display: inline-block;
            background: white;
            color: #1e40af;
            padding: 0.75rem 2rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            transition: transform 0.2s;
        }
        .cta-btn:hover { transform: translateY(-2px); }
        .content { max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem; }
        .breadcrumb { font-size: 0.875rem; color: #94a3b8; margin-bottom: 2rem; }
        .breadcrumb a { color: #60a5fa; text-decoration: none; }
        .breadcrumb a:hover { text-decoration: underline; }
        h2 { font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem; color: #f1f5f9; }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1rem 0 2rem;
        }
        .feature {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.95rem;
        }
        .feature::before { content: "\\2713 "; color: #22c55e; font-weight: bold; }
        .use-cases { list-style: none; padding: 0; }
        .use-cases li {
            background: #1e293b;
            border-left: 3px solid #3b82f6;
            padding: 0.75rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 0 0.25rem 0.25rem 0;
        }
        .faq-item { margin-bottom: 1.5rem; }
        .faq-item h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 0.5rem;
        }
        .faq-item p { color: #cbd5e1; font-size: 0.95rem; }
        .related {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .related a {
            display: block;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 0.5rem;
            padding: 1rem;
            color: #60a5fa;
            text-decoration: none;
            font-weight: 500;
            transition: border-color 0.2s;
        }
        .related a:hover { border-color: #3b82f6; }
        .related a span { display: block; font-size: 0.85rem; color: #94a3b8; font-weight: normal; margin-top: 0.25rem; }
        footer {
            text-align: center;
            padding: 2rem 1.5rem;
            color: #64748b;
            font-size: 0.875rem;
            border-top: 1px solid #1e293b;
            margin-top: 2rem;
        }
        footer a { color: #60a5fa; text-decoration: none; }
        .spinner-wrap {
            display: none;
            text-align: center;
            padding: 2rem;
        }
        .spinner {
            border: 3px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            border-top: 3px solid #3b82f6;
            width: 32px;
            height: 32px;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 0.75rem;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinner-wrap p { font-size: 0.9rem; color: #94a3b8; }
    </style>
</head>
<body>
    <section class="hero">
        <h1>${escapeHtml(tool.name)}</h1>
        <p>${escapeHtml(seo.metaDescription)}</p>
        <a href="/handy-dev-tools/tool/${tool.id}" class="cta-btn" id="launch-btn">Use ${escapeHtml(tool.name)} Now</a>
        <div class="spinner-wrap" id="spinner">
            <div class="spinner"></div>
            <p>Loading tool...</p>
        </div>
    </section>

    <div class="content">
        <nav class="breadcrumb">
            <a href="/handy-dev-tools/">HandyDevTools</a> &rsaquo;
            <a href="/handy-dev-tools/">${escapeHtml(category)}</a> &rsaquo;
            ${escapeHtml(tool.name)}
        </nav>

        <h2>Features</h2>
        <div class="features-grid">
${seo.features.map(f => `            <div class="feature">${escapeHtml(f)}</div>`).join('\n')}
        </div>

        <h2>Common Use Cases</h2>
        <ul class="use-cases">
${seo.useCases.map(u => `            <li>${escapeHtml(u)}</li>`).join('\n')}
        </ul>

        <h2>Frequently Asked Questions</h2>
${seo.faq.map(f => `        <div class="faq-item">
            <h3>${escapeHtml(f.q)}</h3>
            <p>${escapeHtml(f.a)}</p>
        </div>`).join('\n')}

${relatedTools.length > 0 ? `        <h2>Related Tools</h2>
        <div class="related">
${relatedTools.map(t => {
  const rSeo = seoConfig[t.id];
  return `            <a href="/handy-dev-tools/tool/${t.id}/">${escapeHtml(t.name)}<span>${escapeHtml(rSeo?.metaDescription?.slice(0, 80) || t.description)}...</span></a>`;
}).join('\n')}
        </div>` : ''}
    </div>

    <footer>
        <p><a href="/handy-dev-tools/">HandyDevTools</a> — 40+ free online developer tools. All processing happens client-side in your browser.</p>
    </footer>

    <script>
        // Redirect to SPA
        sessionStorage.setItem('spa-redirect', '/handy-dev-tools/tool/${tool.id}');
        window.location.replace('/handy-dev-tools/');
    </script>
    <noscript>
        <p style="text-align:center;padding:2rem;">
            <a href="/handy-dev-tools/#/tool/${tool.id}" style="color:#60a5fa;">Open ${escapeHtml(tool.name)} →</a>
        </p>
    </noscript>
</body>
</html>`;
}

// Generate all pages
const outputDir = path.resolve(process.cwd(), 'client/public/tool');

let generated = 0;
for (const tool of allTools) {
  const html = generateToolPage(tool);
  if (!html) continue;

  const toolDir = path.join(outputDir, tool.id);
  fs.mkdirSync(toolDir, { recursive: true });
  fs.writeFileSync(path.join(toolDir, 'index.html'), html, 'utf-8');
  generated++;
  console.log(`Generated: /tool/${tool.id}/index.html`);
}

console.log(`\nDone! Generated ${generated} SEO pages.`);
