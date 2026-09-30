import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const publicOut = path.join(root, ".output", "public");
const distDir = path.join(root, "dist");

console.log("--> Preparing Capacitor assets from:", publicOut);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy .output/public into dist
if (fs.existsSync(publicOut)) {
  fs.cpSync(publicOut, distDir, { recursive: true, force: true });
  console.log("✓ Copied .output/public to dist/");
}

// 2. Identify assets
const assetsDir = path.join(distDir, "assets");
let jsFiles = [];
let cssFiles = [];

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  jsFiles = files.filter((f) => f.endsWith(".js"));
  cssFiles = files.filter((f) => f.endsWith(".css"));
}

// Find primary entry points
const mainJs = jsFiles.find((f) => f.startsWith("index-")) || jsFiles[0] || "";
const mainCss = cssFiles.find((f) => f.startsWith("styles-")) || cssFiles[0] || "";

// 3. Generate production dist/index.html
const indexHtmlContent = `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
    <title>Block Jumper: Mum Koşusu</title>
    <meta name="description" content="Canlı borsa mumlarında zıpla, dolar topla, $COIN kazan." />
    <meta name="theme-color" content="#0b0f19" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap" />
    ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ""}
  </head>
  <body class="bg-[#0b0f19] text-white">
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="/assets/${mainJs}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), indexHtmlContent, "utf-8");
console.log("✓ Generated dist/index.html with native viewport & asset links");
console.log("✓ Capacitor build preparation complete!");
