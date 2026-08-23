


function parsePrice(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleanedValue = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "");

  if (!cleanedValue) {
    return null;
  }

  const price = Number(cleanedValue);

  return Number.isFinite(price) ? price : null;
}

module.exports = parsePrice;
