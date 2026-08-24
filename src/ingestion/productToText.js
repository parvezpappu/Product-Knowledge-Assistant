

function productToText(product) {
  if(!product||typeof product!=="object") {
    throw new TypeError("A valid product object is required.");
  }

  const parts=[product.name ? `Product name: ${product.name}.` : null,
                 product.brand ? `Brand: ${product.brand}.` : null,
                 product.category ? `Category: ${product.category}.` : null,
                 product.description
      ? `Description: ${product.description}.`
      : null,
  ];

  return parts.filter(Boolean).join(" ");
}

module.exports = productToText;