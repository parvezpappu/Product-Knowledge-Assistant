function normalizeSearchText(value){
  if(value===null||value===undefined){
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")//punctuation
    .trim()
    .replace(/\s+/g, " ");//multiple whitespace k singlee ney.
}

module.exports=normalizeSearchText;
