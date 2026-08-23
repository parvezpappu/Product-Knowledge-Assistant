function removeDuplicates(products) {
  const uniqueProducts = [];
  const seenIds = new Set();

  for (const product of products) {
    if (seenIds.has(product.id)) {
      console.log(`Duplicate skipped: ${product.id} - ${product.name}`);
      continue;
    }

    seenIds.add(product.id);
    uniqueProducts.push(product);
  }

  return uniqueProducts;
}

module.exports = removeDuplicates;