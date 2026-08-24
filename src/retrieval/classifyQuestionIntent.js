const normalizeSearchText = require(
  "./normalizeSearchText"
);

const unsupportedPolicyPatterns = [
  /\breturn policy\b/,
  /\brefund policy\b/,
  /\bexchange policy\b/,
  /\bshipping policy\b/,
  /\bdelivery policy\b/,
  /\bcancellation policy\b/,
  /\bpayment policy\b/,
  /\bprivacy policy\b/,
  /\bterms and conditions\b/,
];

function classifyQuestionIntent(question) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError(
      "Question must be a non-empty string."
    );
  }

  const normalizedQuestion =
    normalizeSearchText(question);

  const isUnsupportedPolicy =
    unsupportedPolicyPatterns.some((pattern) => {
      return pattern.test(normalizedQuestion);
    });

  return isUnsupportedPolicy
    ? "unsupported_policy"
    : "product_query";
}

module.exports = classifyQuestionIntent;
