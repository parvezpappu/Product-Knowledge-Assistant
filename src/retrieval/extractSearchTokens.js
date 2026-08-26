const normalizeSearchText = require("./normalizeSearchText");

 function extractSearchTokens(value){
  const normalizedText=normalizeSearchText(value);

  if(!normalizedText){
    return [];
  }

  return normalizedText.split(" ");
}

module.exports=extractSearchTokens;