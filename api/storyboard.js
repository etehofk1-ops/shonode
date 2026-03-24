const { handleStoryboardProxy } = require("../storyboard-proxy");

module.exports = async (request, response) => {
  await handleStoryboardProxy(request, response, {
    apiKeyHint: "Set GEMINI_API_KEY in the Vercel project environment variables."
  });
};
