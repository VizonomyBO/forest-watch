import { spawnSync } from "node:child_process";

const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const threshold = "high";
const yarnScript = process.env.npm_execpath;

if (!yarnScript || !/yarn(?:\.js)?$/i.test(yarnScript)) {
  console.error("Run this check through the pinned package manager: yarn audit:dependencies");
  process.exit(2);
}

const audit = spawnSync(process.execPath, [yarnScript, "audit", "--groups", "dependencies", "--json"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024
});

if (audit.error) {
  console.error(`Dependency audit could not run: ${audit.error.message}`);
  process.exit(2);
}

const messages = audit.stdout
  .split("\n")
  .filter(Boolean)
  .flatMap(line => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
const advisories = messages.filter(message => message.type === "auditAdvisory");
const summary = messages.find(message => message.type === "auditSummary");

if (!summary) {
  console.error(audit.stderr || "Dependency audit returned no summary");
  process.exit(2);
}

const blocking = advisories.filter(message => severityRank[message.data.advisory.severity] >= severityRank[threshold]);
const counts = summary.data.vulnerabilities;
console.log(
  `Production dependency audit: ${counts.critical} critical, ${counts.high} high, ${counts.moderate} moderate, ${counts.low} low.`
);

if (blocking.length) {
  blocking.forEach(message => {
    const advisory = message.data.advisory;
    console.error(`${advisory.severity}: ${advisory.module_name} — ${advisory.title}`);
  });
  process.exit(1);
}
