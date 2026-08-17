const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/check-security-headers.mjs <https-url>");
  process.exit(2);
}

const requiredHeaders = {
  "content-security-policy": value => value.includes("default-src 'self'") && value.includes("frame-ancestors 'none'"),
  "strict-transport-security": value => value.includes("max-age=31536000"),
  "x-content-type-options": value => value.toLowerCase() === "nosniff",
  "x-frame-options": value => value.toUpperCase() === "DENY",
  "referrer-policy": value => value === "strict-origin-when-cross-origin",
  "permissions-policy": value => value.includes("camera=()") && value.includes("microphone=()")
};

const response = await fetch(target, { redirect: "follow" });
const failures = Object.entries(requiredHeaders).flatMap(([name, validate]) => {
  const value = response.headers.get(name) || "";
  return validate(value) ? [] : [`${name}: ${value || "missing"}`];
});

if (!response.ok) failures.unshift(`HTTP status: ${response.status}`);

if (failures.length > 0) {
  console.error(`Security header check failed for ${target}:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`Security headers verified for ${target}`);
