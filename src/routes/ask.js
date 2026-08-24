
const express = require("express");

const {
  answerQuestion,
} = require("../services/askServices");

const router = express.Router();

const maximumQuestionLength = 500;

router.post("/", async (request, response, next) => {
  const question = request.body?.question;

  if (
    typeof question !== "string" ||
    !question.trim()
  ) {
    return response.status(400).json({
      found: false,
      answer:
        "Question must be a non-empty string.",
    });
  }

  if (question.trim().length > maximumQuestionLength) {
    return response.status(400).json({
      found: false,
      answer:
        `Question must not exceed ${maximumQuestionLength} characters.`,
    });
  }

  try {
    const result = await answerQuestion(
      question.trim()
    );

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;