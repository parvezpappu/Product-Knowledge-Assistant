
    const XLSX = require("xlsx");
    const path = require("path");

    function readExcel(){
    const filePath = path.join(__dirname,"../../data/products_data.xlsx"
     );

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["Products"];

    if (!sheet) {
    throw new Error('Sheet "Products" not found');
   }

   const products = XLSX.utils.sheet_to_json(sheet, {
    defval: null
   });

   return products;
}

module.exports = readExcel;