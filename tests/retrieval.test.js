const test = require("node:test");
const assert = require("node:assert/strict");

const cosineSimilarity = require(
  "../src/retrieval/cosineSimilarity"
);

const normalizeSearchText = require(
  "../src/retrieval/normalizeSearchText"
);

const extractSearchTokens = require(
  "../src/retrieval/extractSearchTokens"
);

const extractModelTokens = require(
  "../src/retrieval/extractModelTokens"
);

const matchProductIdentity = require(
  "../src/retrieval/identityMatcher"
);

const classifyQuestionIntent = require(
  "../src/retrieval/classifyQuestionIntent"
);

const {
  getKnownBrands,
  detectKnownBrands,
} = require("../src/retrieval/knownBrands");

const catalogue = [
  {
    product: {
      id: "P-1",
      name: "Amazfit Bip 5 Smartwatch",
      brand: "amazfit",
    },
  },
  {
    product: {
      id: "P-2",
      name: "Baseus 65W GaN Charger",
      brand: "baseus",
    },
  },
  {
    product: {
      id: "P-3",
      name: "JBL Go 3 Portable Speaker",
      brand: "jbl",
    },
  },
];

test("cosine similarity handles identical vectors", () => {
  const score = cosineSimilarity(
    [1, 2],
    [1, 2]
  );

  assert.ok(Math.abs(score - 1) < Number.EPSILON * 2);
});

test("cosine similarity handles orthogonal vectors", () => {
  const score = cosineSimilarity(
    [1, 0],
    [0, 1]
  );

  assert.equal(score, 0);
});

test("cosine similarity rejects a zero vector", () => {
  assert.throws(
    () => {
      cosineSimilarity(
        [0, 0],
        [1, 1]
      );
    },
    /zero vector/
  );
});

test("search text is normalized consistently", () => {
  const result = normalizeSearchText(
    "  Baseus, Bowie-D99! "
  );

  assert.equal(result, "baseus bowie d99");
});

test("normalized text is converted into tokens", () => {
  const tokens = extractSearchTokens(
    "Baseus Bowie D99"
  );

  assert.deepEqual(tokens, [
    "baseus",
    "bowie",
    "d99",
  ]);
});

test("model tokens are extracted from product names", () => {
  const tokens = extractModelTokens(
    "Amazfit Bip 5"
  );

  assert.deepEqual(tokens, [
    "5",
    "bip5",
  ]);
});

test("price-filter numbers are not treated as models", () => {
  const tokens = extractModelTokens(
    "Show me power banks under 2000 taka"
  );

  assert.deepEqual(tokens, []);
});

test("known brands are built dynamically from catalogue", () => {
  const brands = getKnownBrands(catalogue);

  assert.deepEqual(brands, [
    "amazfit",
    "baseus",
    "jbl",
  ]);
});

test("known brands are detected in a question", () => {
  const brands = getKnownBrands(catalogue);

  const detectedBrands = detectKnownBrands(
    "Do you have any Baseus products?",
    brands
  );

  assert.deepEqual(detectedBrands, [
    "baseus",
  ]);
});

test("identity matcher recognizes an existing model", () => {
  const identity = matchProductIdentity(
    "What is the warranty on the Amazfit Bip 5?",
    catalogue
  );

  assert.equal(
    identity.hasBrandModelConflict,
    false
  );

  assert.equal(
    identity.brandModelMatches.length,
    1
  );

  assert.equal(
    identity.brandModelMatches[0].name,
    "Amazfit Bip 5 Smartwatch"
  );
});

test("identity matcher rejects a known brand with unknown model", () => {
  const identity = matchProductIdentity(
    "Baseus Bowie D99",
    catalogue
  );

  assert.equal(
    identity.hasBrandModelConflict,
    true
  );

  assert.deepEqual(
    identity.detectedBrands,
    ["baseus"]
  );

  assert.deepEqual(
    identity.queryModelTokens,
    ["d99"]
  );
});

test("policy questions are classified separately", () => {
  const intent = classifyQuestionIntent(
    "What is your return policy?"
  );

  assert.equal(
    intent,
    "unsupported_policy"
  );
});

test("product questions remain product queries", () => {
  const intent = classifyQuestionIntent(
    "What is the warranty on the Bip 5?"
  );

  assert.equal(
    intent,
    "product_query"
  );
});