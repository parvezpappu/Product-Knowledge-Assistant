const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const {
  SYSTEM_PROMPT,
  buildUserPrompt,
} = require("./prompts");
const {
  createProviderQuotaError,
  isDailyQuotaError,
  isProviderQuotaError,
} = require("../utils/providerErrors");

dotenv.config({
  path: path.join(__dirname, "../../.env"),
  quiet: true,
});

const apiKey = process.env.GEMINI_API_KEY;
const model =
  process.env.CHAT_MODEL || "gemini-3.7-flash";

const maxAttempts = 3;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey,
});

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isRetryableError(error) {
  const status = Number(
    error?.status || error?.code
  );

  const message = String(
    error?.message || error
  ).toUpperCase();

  return (
    status === 429 ||
    status >= 500 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("UNAVAILABLE") ||
    message.includes("INTERNAL")
  );
}

function validateAnswer(response) {
  const finishReason =
    response.candidates?.[0]?.finishReason;

  if (finishReason === "MAX_TOKENS") {
    throw new Error(
      "The chat response was truncated because it reached the output-token limit."
    );
  }

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error(
      "The chat provider returned an empty answer."
    );
  }

  return answer;
}

async function generateGroundedAnswer(
  question,
  matchedProducts
) {
  const userPrompt = buildUserPrompt(
    question,
    matchedProducts
  );

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            maxOutputTokens: 1024,
          },
        });

      return validateAnswer(response);
    } catch (error) {
      if (isDailyQuotaError(error)) {
        throw createProviderQuotaError(error);
      }

      const shouldRetry =
        isRetryableError(error) &&
        attempt < maxAttempts;

      if (!shouldRetry) {
        if (isProviderQuotaError(error)) {
          throw createProviderQuotaError(error);
        }

        throw error;
      }

      const delay =
        1000 * 2 ** (attempt - 1);

      console.warn(
        `Chat request failed temporarily. Retrying in ${delay}ms (${attempt}/${maxAttempts}).`
      );

      await wait(delay);
    }
  }

  throw new Error(
    "Chat request failed unexpectedly."
  );
}

module.exports = {
  generateGroundedAnswer,

  chatConfig: Object.freeze({
    provider: "google",
    model,
  }),
};
