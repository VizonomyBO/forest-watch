import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ignoredFiles = new Set(["yarn.lock"]);
const ignoredExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".mp3",
  ".mp4",
  ".pdf",
  ".png",
  ".ttf",
  ".woff",
  ".woff2",
  ".zip"
]);
const detectors = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["GitHub token", /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Slack token", /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/],
  ["Stripe live secret", /\bsk_live_[0-9A-Za-z]{20,}\b/],
  [
    "assigned high-entropy secret",
    /(?:password|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_+/.=-]{32,}["']/i
  ]
];

const trackedFiles = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  .filter(file => fs.existsSync(file))
  .filter(file => !ignoredFiles.has(file) && !ignoredExtensions.has(path.extname(file).toLowerCase()));

const findings = [];
for (const file of trackedFiles) {
  const content = fs.readFileSync(file, "utf8");
  for (const [name, detector] of detectors) {
    const match = content.match(detector);
    if (match) {
      const line = content.slice(0, match.index).split("\n").length;
      findings.push(`${file}:${line} (${name})`);
    }
  }
}

if (findings.length) {
  console.error(`Potential committed secrets detected:\n${findings.join("\n")}`);
  process.exit(1);
}

console.log(`Secret scan passed for ${trackedFiles.length} tracked text files.`);
