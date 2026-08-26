

 function productToText(product) {
  if(!product||typeof product!=="object") {
    throw new TypeError("A valid product object is required.");
  }

  const combine_text=[product.name ? `Product name: ${product.name}.` : null,
                 product.brand ? `Brand: ${product.brand}.` : null,
                 product.category ? `Category: ${product.category}.` : null,
                 product.description? `Description: ${product.description}.`: null,
              ];

  return combine_text.filter(Boolean).join(" ");
}

 module.exports = productToText;