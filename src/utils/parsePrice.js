


function parsePrice(value){
  if (value===null||value===undefined||value==="") { // ""=0
    return null;
  }

  if (typeof value==="number") {
    return Number.isFinite(value)?value:null;
  }

  const cleanedValue=String(value)
    .replace(/,/g, "") //,remove globally..
    .replace(/[^\d.]/g, "");

  if(!cleanedValue)
    {
    return null;
    }

  const price = Number(cleanedValue);

  return Number.isFinite(price)?price:null; //IsFininte for NaN casue it is Number( accept hote pare).
}

module.exports = parsePrice;
