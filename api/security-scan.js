const { handleSecurityScan } = require("../security-scan-proxy");

module.exports = async (request, response) => {
  await handleSecurityScan(request, response);
};
