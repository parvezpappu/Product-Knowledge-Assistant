const retrieveProducts = require("./retrieveProducts");
const matchProductIdentity = require("./identityMatcher");

const defaultThreshold = 0.6684;

function validateThreshold(threshold) {
  if (
    typeof threshold !== "number" ||
    !Number.isFinite(threshold) ||
    threshold < -1 ||
    threshold > 1
  ) {
    throw new TypeError(
      "Similarity threshold must be a finite number between -1 and 1."
    );
  }
}

async function retrievalDecision(question, options = {}) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError(
      "Question must be a non-empty string."
    );
  }

  const threshold =
    options.threshold ?? defaultThreshold;

  const topK = options.topK ?? 3;

  validateThreshold(threshold);

  const matches = await retrieveProducts(question, {
    topK,
  });

  const knowledgeBase =
    retrieveProducts.loadKnowledgeBase();

  const identity = matchProductIdentity(
    question,
    knowledgeBase.products
  );

  const topScore = matches[0]?.score ?? -1;

  if (identity.hasBrandModelConflict) {
    return {
      accepted: false,
      reason: "known_brand_unknown_model",
      threshold,
      topScore,
      matches,
      identity,
    };
  }

  if (topScore < threshold) {
    return {
      accepted: false,
      reason: "below_semantic_threshold",
      threshold,
      topScore,
      matches,
      identity,
    };
  }

  return {
    accepted: true,
    reason:
      identity.exactNameMatches.length > 0 ||
      identity.brandModelMatches.length > 0
        ? "strong_product_match"
        : "semantic_match",
    threshold,
    topScore,
    matches,
    identity,
  };
}

module.exports = retrievalDecision;