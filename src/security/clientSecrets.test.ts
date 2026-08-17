import fs from "fs";
import path from "path";

const repositoryRoot = process.cwd();
const forbiddenClientIdentifiers = [
  "REACT_APP_PLANET_API_KEY",
  "REACT_APP_API_BITLY_TOKEN",
  "REACT_APP_API_BITLY_BASE_URL",
  "REACT_APP_ALERTS_API_TOKEN",
  "REACT_APP_GFW_API_KEY"
];
const forbiddenProviderHosts = ["api.planet.com", "tiles.planet.com", "api-ssl.bitly.com"];

function filesUnder(relativePath: string): string[] {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  if (fs.statSync(absolutePath).isFile()) return [absolutePath];

  return fs.readdirSync(absolutePath).flatMap(name => filesUnder(path.join(relativePath, name)));
}

describe("public client credential boundary", () => {
  it("does not configure privileged credentials as browser environment variables", () => {
    const files = ["src", "public", "index.html", ".github/workflows", ".storybook", ".env_sample"]
      .flatMap(filesUnder)
      .filter(file => !file.endsWith("clientSecrets.test.ts"));
    const violations = files.flatMap(file => {
      const contents = fs.readFileSync(file, "utf8");
      return forbiddenClientIdentifiers
        .filter(identifier => contents.includes(identifier))
        .map(identifier => `${path.relative(repositoryRoot, file)}: ${identifier}`);
    });

    expect(violations).toEqual([]);
  });

  it("does not call privileged provider hosts from production browser code", () => {
    const files = filesUnder("src").filter(file => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"));
    const violations = files.flatMap(file => {
      const contents = fs.readFileSync(file, "utf8");
      return forbiddenProviderHosts
        .filter(host => contents.includes(host))
        .map(host => `${path.relative(repositoryRoot, file)}: ${host}`);
    });

    expect(violations).toEqual([]);
  });
});
