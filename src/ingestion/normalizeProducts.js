 const parsePrice = require("../utils/parsePrice");
 
  function cleanText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const cleanedValue = String(value).trim();

  if (!cleanedValue) {
    return null;
  }

  return cleanedValue;
}

function parseStock(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const cleanedValue = String(value).trim();

  if (!cleanedValue) {
    return null;
  }

  const stock = Number(cleanedValue);

  if (!Number.isFinite(stock)) {
    return null;
  }

  return stock;
}

function normalizeText(value) {
  const text = cleanText(value);

  return text === null ? null : text.toLowerCase();
}

function normalizeDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  let date;

  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30);
    date = new Date(excelEpoch + value * 24 * 60 * 60 * 1000);
  } else {
    const text = String(value).trim();

    if (!text) {
      return null;
    }

    date = new Date(text);
  }

  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}


 function normalizeCurrency(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const currency = String(value).trim();

  if (!currency) {
    return null;
  }

  return currency.toUpperCase();
}


function normalizeCategory(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const category = String(value).trim().toLowerCase();

  if (!category) {
    return null;
  }

  if (category === "smart watch") {
    return "smartwatch";
  }

  return category;
}


 function normalizeProducts(products) {
  return products.map((product) => {

    const id = cleanText(product["Product ID"]);
    const name = cleanText(product["Product Name"]);
    const category = normalizeCategory(product["Category"]);
    const brand = normalizeText(product["Brand"]);
    const description = cleanText(product["Short Description"]);

    const productPrice = parsePrice(product["Product Price"]);
    const salePrice = parsePrice(product["Sale Price"]);
    //sale price missing thakle product price ke effective price e nebo
    const effectivePrice =salePrice !== null ? salePrice : productPrice;




    const currency = normalizeCurrency(product["Currency"]);
    const stockQuantity = parseStock(product["Stock Quantity"]);

    const warranty = cleanText(product["Warranty"]);
    const vendor = cleanText(product["Vendor"]);
    const color = cleanText(product["Color"]);

    const productLink = cleanText(product["Product Link"]);
    const imageUrl = cleanText(product["Image URL"]);
    const dateAdded = normalizeDate(product["Date Added"]);

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
