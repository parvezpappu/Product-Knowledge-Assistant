

  function cosineSimilarity(vectorA, vectorB){
  if(!Array.isArray(vectorA)||!Array.isArray(vectorB)) {
    throw new TypeError("Both vectors must be arrays.");
  }

  if(vectorA.length ===0||vectorB.length===0){
    throw new Error("Vectors cannot be empty.");
  }

  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same length.");
  }

  let dotProduct=0;
  let magnitudeA=0;
  let magnitudeB=0;

  for(let i=0; i <vectorA.length;i+=1){
    const valueA = vectorA[i];
    const valueB = vectorB[i];

    if (!Number.isFinite(valueA) || !Number.isFinite(valueB)) {
      throw new TypeError(
        "Vectors must contain only finite numbers."
      );
    }

    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error(
      "Cosine similarity is undefined for a zero vector."
    );
  }

  const similarity =
    dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));

  //Protect against tiny floating-point errors such as 1.0000000002.
  return Math.max(-1, Math.min(1, similarity));
}

module.exports = cosineSimilarity;
