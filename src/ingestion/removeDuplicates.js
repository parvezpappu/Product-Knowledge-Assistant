
function removeDuplicates(products) {
  const uniqueProducts = [];
  const seenIds = new Set();

  for (const product of products) {
    if (!product.id || !product.name) {
      const missingFields = [
        !product.id ? "Product ID" : null,
        !product.name ? "Product Name" : null,
      ].filter(Boolean);

      console.warn(
        `Invalid product skipped: missing ${missingFields.join(" and ")}`
      );
      continue;
    }

    if (seenIds.has(product.id)) {
      console.log(
        `Duplicate skipped: ${product.id} - ${product.name}`
      );
      continue;
    }

    seenIds.add(product.id);
    uniqueProducts.push(product);
  }

  return uniqueProducts;
}
module.exports = removeDuplicates;
