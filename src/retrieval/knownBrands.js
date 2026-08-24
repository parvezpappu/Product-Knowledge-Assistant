const normalizeSearchText = require("./normalizeSearchText");

function getKnownBrands(knowledgeEntries) {
  if (!Array.isArray(knowledgeEntries)) {
    throw new TypeError(
      "Knowledge-base entries must be an array."
    );
  }

  const brands = new Set();

  for (const entry of knowledgeEntries) {
    const product = entry.product ?? entry;
    const normalizedBrand = normalizeSearchText(product?.brand);

    if (normalizedBrand) {
      brands.add(normalizedBrand);
    }
  }

  return [...brands].sort();
}

function detectKnownBrands(question, knownBrands) {
  if (!Array.isArray(knownBrands)) {
    throw new TypeError("Known brands must be an array.");
  }

  const normalizedQuestion = normalizeSearchText(question);

  if (!normalizedQuestion) {
    return [];
  }

  const paddedQuestion = ` ${normalizedQuestion} `;

  return knownBrands.filter((brand) => {
    const normalizedBrand = normalizeSearchText(brand);

    if (!normalizedBrand) {
      return false;
    }

    return paddedQuestion.includes(` ${normalizedBrand} `);
  });
}

module.exports = {
  getKnownBrands,
  detectKnownBrands,
};