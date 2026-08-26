  const fs = require("fs");
  const path = require("path");
  const cosineSimilarity = require("./cosineSimilarity");
  const {embedQuestion,embeddingConfig,}=require("../ai/embeddings");

  const knowledgeBasePath=path.join(
    __dirname,
    "../../data/knowledge-base.json"
  );

  let cachedKnowledgeBase = null;

  function loadKnowledgeBase(){
    if(cachedKnowledgeBase){
      return cachedKnowledgeBase;
    }

    if(!fs.existsSync(knowledgeBasePath)){
      throw new Error(
        "Knowledge base not found. Run npm run ingest first."
      );
    }

    let knowledgeBase;

    try{
      const fileContent = fs.readFileSync(
        knowledgeBasePath,
        "utf8"
      );

      knowledgeBase = JSON.parse(fileContent);
    } catch(error){
      throw new Error(
        `Failed to load knowledge base: ${error.message}`
      );
    }

    validateKnowledgeBase(knowledgeBase);

    cachedKnowledgeBase = knowledgeBase;

    return cachedKnowledgeBase;
  }

  function validateKnowledgeBase(knowledgeBase) {
    if (!knowledgeBase || typeof knowledgeBase !== "object") {
      throw new Error("Knowledge base must be an object.");
    }

    if (!knowledgeBase.metadata) {
      throw new Error("Knowledge-base metadata is missing.");
    }

    if (!Array.isArray(knowledgeBase.products)) {
      throw new Error(
        "Knowledge base must contain a products array."
      );
    }

    if (knowledgeBase.products.length === 0) {
      throw new Error("Knowledge base contains no products.");
    }

    const {
      model,
      dimensions,
      productCount,
    } = knowledgeBase.metadata;

    if (model !== embeddingConfig.model) {
      throw new Error(
        `Knowledge base uses ${model}, but the application uses ${embeddingConfig.model}. Run npm run ingest again.`
      );
    }

    if (dimensions !== embeddingConfig.dimensions) {
      throw new Error(
        `Knowledge base uses ${dimensions} dimensions, but the application uses ${embeddingConfig.dimensions}. Run npm run ingest again.`
      );
    }

    if (productCount !== knowledgeBase.products.length) {
      throw new Error(
        "Knowledge-base product count does not match its metadata."
      );
    }

    for (const entry of knowledgeBase.products) {
      if (!entry.product || typeof entry.product !== "object") {
        throw new Error(
          "A knowledge-base entry has no valid product."
        );
      }

      if (!Array.isArray(entry.embedding)) {
        throw new Error(
          `Product ${entry.product.id} has no valid embedding.`
        );
      }

      if (entry.embedding.length !== dimensions) {
        throw new Error(
          `Product ${entry.product.id} has an incorrect embedding dimension.`
        );
      }

      if (!entry.embedding.every(Number.isFinite)) {
        throw new Error(
          `Product ${entry.product.id} has invalid embedding values.`
        );
      }
    }
  }

  async function retrieveProducts(question, options = {}) {
    if(typeof question !== "string" || !question.trim()) {
      throw new TypeError(
        "Question must be a non-empty string."
      );
    }

    const topK = options.topK ?? 3;

    if (!Number.isInteger(topK) || topK < 1) {
      throw new TypeError(
        "topK must be a positive integer."
      );
    }

    const knowledgeBase = loadKnowledgeBase();
    const questionEmbedding = await embedQuestion(
      question.trim()
    );

    if (
      questionEmbedding.length !==
      knowledgeBase.metadata.dimensions
    ) {
      throw new Error(
        "Question and product embedding dimensions do not match."
      );
    }

    const matches = knowledgeBase.products.map((entry) => {
      const score = cosineSimilarity(
        questionEmbedding,
        entry.embedding
      );

      return {
        product: entry.product,
        score,
      };
    });

    matches.sort((first,second)=>{
      return second.score-first.score;
    });

    return matches.slice(
      0,
      Math.min(topK, matches.length)
    );
  }

  module.exports = retrieveProducts;
  module.exports.loadKnowledgeBase = loadKnowledgeBase;