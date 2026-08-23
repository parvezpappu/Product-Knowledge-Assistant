


function parsePrice(value) {
  if(value===null||value===undefined||value==="") {
    return null;
  }

  if(typeof value === "number") {
    return value;
  }

  const cleanedValue = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  if (!cleanedValue) {
    return null;
  }

  return Number(cleanedValue);
}

module.exports = parsePrice;