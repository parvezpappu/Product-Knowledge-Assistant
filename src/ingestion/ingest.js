   const fs = require("fs");
   const path = require("path");
   const readExcel = require("./readExcel");
   const normalizeProducts = require("./normalizeProducts");
   const removeDuplicates = require("./removeDuplicates");

   const products = readExcel();

    const normalizedProducts = normalizeProducts(products);
    const uniqueProducts = removeDuplicates(normalizedProducts);

    console.log(`Raw rows: ${products.length}`);
    console.log(`Normalized rows: ${normalizedProducts.length}`);
    console.log(`Unique products: ${uniqueProducts.length}`); 


   const outputPath = path.join( __dirname,"../../data/clean-products.json");
   const jsonData = JSON.stringify(uniqueProducts, null, 2);

    fs.writeFileSync(outputPath, jsonData);

    console.log("Clean products saved successfully.");