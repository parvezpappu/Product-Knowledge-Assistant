const normalizeSearchText = require("./normalizeSearchText");
const extractModelTokens = require("./extractModelTokens");
const {getKnownBrands,detectKnownBrands,}=require("./knownBrands");

function hasSharedToken(firstTokens, secondTokens) {
  const secondTokenSet = new Set(secondTokens);

  return firstTokens.some((token) => {
    return secondTokenSet.has(token);
  });
}

function matchProductIdentity(question, knowledgeEntries) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError(
      "Question must be a non-empty string."
    );
  }

  if (!Array.isArray(knowledgeEntries)) {
    throw new TypeError(
      "Knowledge-base entries must be an array."
    );
  }

  const normalizedQuestion = normalizeSearchText(question);
  const knownBrands = getKnownBrands(knowledgeEntries);
  const detectedBrands = detectKnownBrands(
    question,
    knownBrands
  );

  const queryModelTokens = extractModelTokens(question);
  const exactNameMatches = [];
  const brandModelMatches = [];

  for (const entry of knowledgeEntries) {
    const product = entry.product ?? entry;

    if (!product?.name) {
      continue;
    }

    const normalizedProductName = normalizeSearchText(
      product.name
    );

    if(normalizedProductName &&normalizedQuestion.includes(normalizedProductName)){
      exactNameMatches.push(product);
    }

    const normalizedProductBrand = normalizeSearchText(
      product.brand
    );

    if (!detectedBrands.includes(normalizedProductBrand)) {
      continue;
    }

    const productModelTokens = extractModelTokens(
      product.name
    );

    if (
      hasSharedToken(
        queryModelTokens,
        productModelTokens
      )
    ) {
      brandModelMatches.push(product);
    }
  }

  const hasBrandModelConflict =
    detectedBrands.length > 0 &&
    queryModelTokens.length > 0 &&
    exactNameMatches.length === 0 &&
    brandModelMatches.length === 0;

  return {
    normalizedQuestion,
    detectedBrands,
    queryModelTokens,
    exactNameMatches,
    brandModelMatches,
    hasBrandModelConflict,
  };
}

module.exports = matchProductIdentity;