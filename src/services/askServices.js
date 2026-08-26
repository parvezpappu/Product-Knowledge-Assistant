const retrievalDecision = require(
  "../retrieval/retrievalDecision"
);

const {
  generateGroundedAnswer,
} = require("../ai/chat");
const classifyQuestionIntent = require(
  "../retrieval/classifyQuestionIntent"
);

const NOT_AVAILABLE_MESSAGE =
  "Sorry, no matching products were found in our catalogue.";

const UNKNOWN_MODEL_MESSAGE =
  "Sorry, that exact product model is not available in our catalogue.";

const UNSUPPORTED_POLICY_MESSAGE =
  "Sorry, I can only answer questions using the supplied product catalogue.";

function getRejectionMessage(decision) {
  if (
    decision.reason === "known_brand_unknown_model" ||
    decision.reason === "model_conflict"
  ) {
    return UNKNOWN_MODEL_MESSAGE;
  }

  return NOT_AVAILABLE_MESSAGE;
}

async function answerQuestion(question) {
  if (typeof question !== "string" || !question.trim()) {
    throw new TypeError(
      "Question must be a non-empty string."
    );
  }

  const cleanQuestion = question.trim();

  const intent = classifyQuestionIntent(
    cleanQuestion
  );

  if (intent === "unsupported_policy") {
    return {
      found: false,
      answer: UNSUPPORTED_POLICY_MESSAGE,
    };
  }

  const decision = await retrievalDecision(
    cleanQuestion,
    {
      topK: 3,
    }
  );

  if (!decision.accepted) {
    return {
      found: false,
      answer: getRejectionMessage(decision),
    };
  }

  const matchedProducts = decision.matches.map(
    (match) => match.product
  );

  const answer = await generateGroundedAnswer(
    cleanQuestion,
    matchedProducts
  );

  return {
    found: true,
    answer,
  };
}

module.exports = {
  answerQuestion,
  getRejectionMessage,
  NOT_AVAILABLE_MESSAGE,
  UNKNOWN_MODEL_MESSAGE,
  UNSUPPORTED_POLICY_MESSAGE,
};
