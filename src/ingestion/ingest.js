const fs = require("fs");
const path = require("path");
const readExcel = require("./readExcel");
const normalizeProducts = require("./normalizeProducts");
const removeDuplicates = require("./removeDuplicates");
const productToText = require("./productToText");
const {
  embedProduct,
  embeddingConfig,
} = require("../ai/embeddings");

const dataDirectory = path.join(__dirname, "../../data");
const cleanProductsPath = path.join(dataDirectory, "clean-products.json");
const knowledgeBasePath = path.join(dataDirectory, "knowledge-base.json");

async function ingest() {
  const products = readExcel();
  const normalizedProducts = normalizeProducts(products);
  const uniqueProducts = removeDuplicates(normalizedProducts);

  console.log(`Raw rows: ${products.length}`);
  console.log(`Normalized rows: ${normalizedProducts.length}`);
  console.log(`Unique products: ${uniqueProducts.length}`);

  fs.writeFileSync(
    cleanProductsPath,
    JSON.stringify(uniqueProducts, null, 2),
    "utf8"
  );
  console.log("Clean products saved successfully.");

  const knowledgeProducts = [];

  for (let index = 0; index < uniqueProducts.length; index += 1) {
    const product = uniqueProducts[index];
    const embeddingText = productToText(product);

    console.log(
      `Embedding ${index + 1}/${uniqueProducts.length}: ${product.name}`
    );

    const embedding = await embedProduct(product, embeddingText);

    knowledgeProducts.push({
      product,
      embeddingText,
      embedding,
    });
  }

  const knowledgeBase = {
    metadata: {
      schemaVersion: 1,
      ...embeddingConfig,
      productCount: knowledgeProducts.length,
      createdAt: new Date().toISOString(),
    },
    products: knowledgeProducts,
  };

  fs.writeFileSync(
    knowledgeBasePath,
    JSON.stringify(knowledgeBase, null, 2),
    "utf8"
  );

  console.log("Knowledge base saved successfully.");
}

ingest().catch((error) => {
  console.error("Ingestion failed:", error.message);
  process.exitCode = 1;
});
