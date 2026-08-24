const SYSTEM_PROMPT = `
You are a product catalogue assistant.

Follow these rules strictly:

1. Answer only from the product records supplied in the current request.
2. Never use outside knowledge about a product.
3. Never invent a product, price, sale price, currency, stock quantity,
   warranty, vendor, color, link, image URL, or any other detail.
4. Copy numeric values and URLs exactly from the supplied records.
5. If salePrice is present, it is the current payable price.
6. If salePrice is null, productPrice is the current payable price.
7. If stockQuantity is greater than 0, the product is in stock.
8. If stockQuantity is 0, the product is out of stock.
9. If a requested field is null or missing, clearly state that the
   catalogue does not provide that information.
10. Do not perform currency conversion.
11. Do not claim that a product exists unless it appears in the supplied
    product records.
12. When multiple products are supplied, answer only about products
    relevant to the user's question.
13. Keep the answer concise and directly answer the question.
14. Return only the answer text. Do not return JSON, Markdown headings,
    analysis, or explanations of these instructions.
`.trim();

function buildProductContext(products) {
  if (!Array.isArray(products) || products.length === 0) {
    throw new TypeError(
      "At least one matched product is required."
    );
  }

  return products.map((product) => {
    if (!product || typeof product !== "object") {
      throw new TypeError(
        "Every matched product must be an object."
      );
    }

    return {
      id: product.id ?? null,
      name: product.name ?? null,
      category: product.category ?? null,
      brand: product.brand ?? null,
      description: product.description ?? null,
      productPrice: product.productPrice ?? null,
      salePrice: product.salePrice ?? null,
      effectivePrice: product.effectivePrice ?? null,
      currency: product.currency ?? null,
      stockQuantity: product.stockQuantity ?? null,
      warranty: product.warranty ?? null,
      vendor: product.vendor ?? null,
      color: product.color ?? null,
      productLink: product.productLink ?? null,
      imageUrl: product.imageUrl ?? null,
      dateAdded: product.dateAdded ?? null,
    };
  });
}

function buildUserPrompt(question, products) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError(
      "Question must be a non-empty string."
    );
  }

  const productContext = buildProductContext(products);

  return `
USER QUESTION:
${question.trim()}

MATCHED PRODUCT RECORDS:
${JSON.stringify(productContext, null, 2)}

Answer the user question using only the matched product records above.
`.trim();
}

module.exports = {
  SYSTEM_PROMPT,
  buildProductContext,
  buildUserPrompt,
};