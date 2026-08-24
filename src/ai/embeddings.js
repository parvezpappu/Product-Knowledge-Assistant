const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config({
  path: path.join(__dirname, "../../.env"),
  quiet: true,
});

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.EMBEDDING_MODEL || "gemini-embedding-2";
const dimensions = Number(process.env.EMBEDDING_DIMENSIONS || 768);
const maxAttempts = 3;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing.");
}

if (
  !Number.isInteger(dimensions) ||
  dimensions < 128 ||
  dimensions > 3072
) {
  throw new Error(
    "EMBEDDING_DIMENSIONS must be an integer between 128 and 3072."
  );
}

const ai = new GoogleGenAI({ apiKey });

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isRetryableError(error) {
  const status = Number(error?.status || error?.code);
  const message = String(error?.message || error).toUpperCase();

  return (
    status === 429 ||
    status >= 500 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("UNAVAILABLE") ||
    message.includes("INTERNAL")
  );
}

function validateEmbedding(response) {
  const embedding = response.embeddings?.[0]?.values;

  if (!Array.isArray(embedding)) {
    throw new Error("The embedding provider returned an invalid response.");
  }

  if (embedding.length !== dimensions) {
    throw new Error(
      `Expected ${dimensions} dimensions but received ${embedding.length}.`
    );
  }

  if (!embedding.every(Number.isFinite)) {
    throw new Error("The embedding contains an invalid numeric value.");
  }

  return embedding;
}

async function generateEmbedding(text) {
  if (typeof text !== "string" || !text.trim()) {
    throw new TypeError("Embedding input must be a non-empty string.");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await ai.models.embedContent({
        model,
        contents: text.trim(),
        config: {
          outputDimensionality: dimensions,
        },
      });

      return validateEmbedding(response);
    } catch (error) {
      if (!isRetryableError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);
      console.warn(
        `Embedding request failed temporarily. Retrying in ${delay}ms (${attempt}/${maxAttempts}).`
      );
      await wait(delay);
    }
  }

  throw new Error("Embedding request failed unexpectedly.");
}

async function embedProduct(product, productText) {
  if (!product || typeof product !== "object") {
    throw new TypeError("A valid product object is required.");
  }

  if (typeof productText !== "string" || !productText.trim()) {
    throw new TypeError("Product text must be a non-empty string.");
  }

  const title = product.name || "none";
  const documentText = `title: ${title} | text: ${productText}`;

  return generateEmbedding(documentText);
}

async function embedQuestion(question) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError("Question must be a non-empty string.");
  }

  const queryText = `task: search result | query: ${question.trim()}`;

  return generateEmbedding(queryText);
}

module.exports = {
  embedProduct,
  embedQuestion,
  embeddingConfig: Object.freeze({
    provider: "google",
    model,
    dimensions,
  }),
};
