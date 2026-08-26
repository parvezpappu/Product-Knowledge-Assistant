const extractSearchTokens = require("./extractSearchTokens");

const numberFilterWords=new Set([
  "under",
  "over",
  "below",
  "above",
  "less",
  "more",
  "than",
  "between",
  "price",
  "priced",
]);

const currencyWords=new Set([
  "taka",
  "tk",
  "bdt",
  "usd",
  "dollar",
  "dollars",
]);

function extractModelTokens(value) {
  const tokens = extractSearchTokens(value);
  const modelTokens = new Set();

  for (let i=0;i<tokens.length;i+=1){
    const token=tokens[i];
    const previousToken=tokens[i-1];
    const nextToken=tokens[i+1];

    const containsLetter=/\p{L}/u.test(token);//letter ache kina (d99) but 2000 false
    const containsNumber=/\p{N}/u.test(token);//numeric character
    const isOnlyNumber=/^\p{N}+$/u.test(token);//only number

    // d99,s4
    if (containsLetter && containsNumber) {
      modelTokens.add(token);

      // Capacity/power
      if(/^\d+(?:mah|w)$/u.test(token)){
        modelTokens.add(token.replace(/[^\d]/g, ""));
      }
      continue;
    }
    if(!isOnlyNumber){
      continue;
    }

    const isPriceFilter =
      numberFilterWords.has(previousToken) ||
      currencyWords.has(nextToken);

    if(isPriceFilter){ //price na hole skip: bip 5
      continue;
    }

    modelTokens.add(token);//jodi price na hoy. maybe model

    // Bip 5"->"bip5","Go 4" ->"go4".
    if(previousToken &&/\p{L}/u.test(previousToken) &&
      !numberFilterWords.has(previousToken)
    ) {
      modelTokens.add(`${previousToken}${token}`);
    }
  }

  return [...modelTokens];
}

module.exports = extractModelTokens;
