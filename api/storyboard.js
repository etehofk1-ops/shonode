const { handleStoryboardProxy, sendJson } = require("../storyboard-proxy");

module.exports = async (request, response) => {
  if (process.env.SHONODE_ENABLE_HOSTED_AI_PROXY !== "true") {
    sendJson(response, 503, {
      error: "Hosted AI proxy is disabled.",
      hint: "Self-host Shonode and explicitly set SHONODE_ENABLE_HOSTED_AI_PROXY=true if you want to expose this route."
    });
    return;
  }

  await handleStoryboardProxy(request, response, {
    apiKeyHint: "Set GEMINI_API_KEY in the Vercel project environment variables."
  });
};
