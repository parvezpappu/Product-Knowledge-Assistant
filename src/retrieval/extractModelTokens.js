const extractSearchTokens = require("./extractSearchTokens");

const numberFilterWords = new Set([
  "under",
  "over",
  "below",
  "above",
  "less",
  "more",
  "than",
  "between",
  "price",
  "priced",
]);

const currencyWords = new Set([
  "taka",
  "tk",
  "bdt",
  "usd",
  "dollar",
  "dollars",
]);

function extractModelTokens(value) {
  const tokens = extractSearchTokens(value);
  const modelTokens = new Set();

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const previousToken = tokens[index - 1];
    const nextToken = tokens[index + 1];

    const containsLetter = /\p{L}/u.test(token);
    const containsNumber = /\p{N}/u.test(token);
    const isOnlyNumber = /^\p{N}+$/u.test(token);

    // Examples: d99, s4, p3, bip5, 10000mah, 65w.
    if (containsLetter && containsNumber) {
      modelTokens.add(token);

      // Capacity/power forms should also match a number-only query.
      if (/^\d+(?:mah|w)$/u.test(token)) {
        modelTokens.add(token.replace(/[^\d]/g, ""));
      }

      continue;
    }

    if (!isOnlyNumber) {
      continue;
    }

    const isPriceFilter =
      numberFilterWords.has(previousToken) ||
      currencyWords.has(nextToken);

    if (isPriceFilter) {
      continue;
    }

    // Preserve the number itself: "10000".
    modelTokens.add(token);

    // Join split model forms: "Bip 5" -> "bip5", "Go 4" -> "go4".
    if (
      previousToken &&
      /\p{L}/u.test(previousToken) &&
      !numberFilterWords.has(previousToken)
    ) {
      modelTokens.add(`${previousToken}${token}`);
    }
  }

  return [...modelTokens];
}

module.exports = extractModelTokens;
