 const parsePrice = require("../utils/parsePrice");
 
  function cleanText(value) {
  if (value===null||value===undefined) {
    return null;
  }

  return String(value).trim();
 }

 function parseStock(value) {
  if (value===null||value===undefined||value==="") {
    return null;
  }

  return Number(value);
 }

 function normalizeText(value) {
  if (value===null||value===undefined) {
    return null;
  }

  return String(value).trim().toLowerCase();
 }


 function normalizeProducts(products) {
  return products.map((product) => {

    const id = cleanText(product["Product ID"]);
    const name = cleanText(product["Product Name"]);
    const category = normalizeText(product["Category"]);
    const brand = normalizeText(product["Brand"]);
    const description = cleanText(product["Short Description"]);

    const productPrice = parsePrice(product["Product Price"]);
    const salePrice = parsePrice(product["Sale Price"]);
    //sale price missing thakle product price ke effective price e nebo
    const effectivePrice =salePrice !== null ? salePrice : productPrice;




    const currency = cleanText(product["Currency"]);
    const stockQuantity = parseStock(product["Stock Quantity"]);

    const warranty = cleanText(product["Warranty"]);
    const vendor = cleanText(product["Vendor"]);
    const color = cleanText(product["Color"]);

    const productLink = cleanText(product["Product Link"]);
    const imageUrl = cleanText(product["Image URL"]);
    const dateAdded = product["Date Added"] ?? null;

    return {
  id,
  name,
  category,
  brand,
  description,
  productPrice,
  salePrice,
  effectivePrice,
  currency,
  stockQuantity,
  warranty,
  vendor,
  color,
  productLink,
  imageUrl,
  dateAdded
 };
  });
}

module.exports = normalizeProducts;