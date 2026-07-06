const { handleSecurityScan } = require("../security-scan-proxy");
const { sendJson } = require("../storyboard-proxy");

module.exports = async (request, response) => {
  // The passive scanner fetches arbitrary remote URLs, so it is disabled on hosted
  // deployments by default. A deployer must consciously opt in, on top of the
  // per-request token gate enforced inside handleSecurityScan.
  if (process.env.SHONODE_ENABLE_HOSTED_SECURITY_SCAN !== "true") {
    sendJson(response, 503, {
      error: "Hosted security scanner is disabled.",
      hint: "Run the scanner locally, or self-host and explicitly set SHONODE_ENABLE_HOSTED_SECURITY_SCAN=true (and SHONODE_SECURITY_SCAN_TOKEN) to expose this route."
    });
    return;
  }

  await handleSecurityScan(request, response);
};
