const test = require("node:test");
const assert = require("node:assert/strict");

const normalizeProducts = require(
  "../src/ingestion/normalizeProducts"
);

const removeDuplicates = require(
  "../src/ingestion/removeDuplicates"
);

const parsePrice = require(
  "../src/utils/parsePrice"
);

test("parsePrice handles valid formatted prices", () => {
  assert.equal(parsePrice("BDT 4,500"), 4500);
  assert.equal(parsePrice("1,999 taka"), 1999);
  assert.equal(parsePrice(990), 990);
});

test("parsePrice returns null for missing or invalid prices", () => {
  assert.equal(parsePrice(null), null);
  assert.equal(parsePrice(""), null);
  assert.equal(parsePrice("not provided"), null);
  assert.equal(parsePrice("12.3.4"), null);
});

test("normalizeProducts cleans product fields", () => {
  const rawProducts = [
    {
      "Product ID": " P-1 ",
      "Product Name": " Test Watch ",
      Category: " Smart Watch ",
      Brand: " ACME ",
      "Short Description": " Test description ",
      "Product Price": "BDT 5,000",
      "Sale Price": "4,500",
      Currency: " bdt ",
      "Stock Quantity": " 12 ",
      Warranty: " 6 Months ",
      Vendor: " Test Vendor ",
      Color: " Black ",
      "Product Link": " https://example.com/product ",
      "Image URL": " https://example.com/image.jpg ",
      "Date Added": "2025-08-08",
    },
  ];

  const [product] = normalizeProducts(rawProducts);

  assert.deepEqual(product, {
    id: "P-1",
    name: "Test Watch",
    category: "smartwatch",
    brand: "acme",
    description: "Test description",
    productPrice: 5000,
    salePrice: 4500,
    effectivePrice: 4500,
    currency: "BDT",
    stockQuantity: 12,
    warranty: "6 Months",
    vendor: "Test Vendor",
    color: "Black",
    productLink: "https://example.com/product",
    imageUrl: "https://example.com/image.jpg",
    dateAdded: "2025-08-08",
  });
});

test("effectivePrice uses regular price when sale price is missing", () => {
  const [product] = normalizeProducts([
    {
      "Product ID": "P-2",
      "Product Name": "Test Power Bank",
      "Product Price": "1,999",
      "Sale Price": "",
      Brand: "   ",
      "Date Added": "invalid date",
    },
  ]);

  assert.equal(product.productPrice, 1999);
  assert.equal(product.salePrice, null);
  assert.equal(product.effectivePrice, 1999);
  assert.equal(product.brand, null);
  assert.equal(product.dateAdded, null);
});

test("removeDuplicates removes duplicates and invalid products", () => {
  const originalLog = console.log;
  const originalWarn = console.warn;

  // Prevent expected skip messages from cluttering test output.
  console.log = () => {};
  console.warn = () => {};

  try {
    const result = removeDuplicates([
      {
        id: "P-1",
        name: "First Product",
      },
      {
        id: "P-1",
        name: "Duplicate Product",
      },
      {
        id: null,
        name: "Missing ID",
      },
      {
        id: "P-2",
        name: null,
      },
      {
        id: "P-3",
        name: "Third Product",
      },
    ]);

    assert.deepEqual(result, [
      {
        id: "P-1",
        name: "First Product",
      },
      {
        id: "P-3",
        name: "Third Product",
      },
    ]);
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
  }
});