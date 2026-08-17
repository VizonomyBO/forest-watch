import fs from "fs";
import path from "path";

describe("production security headers", () => {
  const staticConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "static.json"), "utf8"));
  const headers = staticConfig.headers["/**"];
  const terraform = fs.readFileSync(path.join(process.cwd(), "infrastructure", "modules", "web", "main.tf"), "utf8");

  it("defines the browser security baseline for static hosting", () => {
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Strict-Transport-Security"]).toContain("max-age=31536000");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("attaches the managed response-header policy to CloudFront", () => {
    expect(terraform).toContain('resource "aws_cloudfront_response_headers_policy" "security"');
    expect(terraform).toContain("response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id");
    expect(terraform).toContain("content_security_policy = local.content_security_policy");
  });
});
