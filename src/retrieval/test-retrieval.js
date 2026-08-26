const retrievalDecision = require("./retrievalDecision");
const testCases = [
  {
    question: "How much is the Anker PowerCore 10000mAh?",
    expectedFound: true,
  },
  {
    question: "Do you have any Baseus products?",
    expectedFound: true,
  },
  {
    question: "Show me power banks under 2000 taka.",
    expectedFound: true,
  },
  {
    question: "What is the warranty on the Amazfit Bip 5?",
    expectedFound: true,
  },
  {
    question: "Is the Soundcore Life P3 in stock?",
    expectedFound: true,
  },
  {
    question: "Which is the cheapest smartwatch you have?",
    expectedFound: true,
  },
  {
    question: "Give me the link for the JBL Go 3.",
    expectedFound: true,
  },
  {
    question: "powerbnk anker 10000",
    expectedFound: true,
  },

  {
    question: "Do you sell washing machines?",
    expectedFound: false,
  },
  {
    question: "How much is the iPhone 17 Pro Max?",
    expectedFound: false,
  },
  {
    question: "I am looking for a gaming laptop.",
    expectedFound: false,
  },
  {
    question: "Do you have fresh milk?",
    expectedFound: false,
  },
  {
    question: "Do you stock the Samsung Galaxy Watch 7?",
    expectedFound: false,
  },
  {
    question: "Baseus Bowie D99",
    expectedFound: false,
  },
  {
    question: "Xiaomi Watch S4",
    expectedFound: false,
  },
  {
    question: "What is your return policy?",
    expectedFound: false,
  },

  // Listed as found in the brief, but absent from the spreadsheet
  {
    question: "How much is the Anker PowerCore 20000mAh?",
    expectedFound: false,
  },
  {
    question: "Give me the link for the JBL Go 4.",
    expectedFound: false,
  },
];

async function evaluateRetrieval() {
  const results = [];

  for (let index = 0; index < testCases.length; index += 1) {
    const testCase = testCases[index];

    console.log(
      `Testing ${index + 1}/${testCases.length}: ${testCase.question}`
    );

    const decision = await retrievalDecision(
      testCase.question,
      { topK: 3 }
    );

    const matches = decision.matches;

    const firstMatch = matches[0];
    const secondMatch = matches[1];

    results.push({
      question: testCase.question,
      expectedFound: testCase.expectedFound,
      actualFound: decision.accepted,
      reason: decision.reason,
      correct: decision.accepted === testCase.expectedFound,
      topProduct: firstMatch.product.name,
      topScore: firstMatch.score,
      secondProduct: secondMatch?.product.name ?? null,
      secondScore: secondMatch?.score ?? null,
      scoreGap:
        secondMatch === undefined
          ? null
          : firstMatch.score - secondMatch.score,
    });
  }

  console.log("\nRetrieval evaluation results:\n");

  console.table(
    results.map((result) => ({
      expected: result.expectedFound
        ? "FOUND"
        : "NOT FOUND",
      actual: result.actualFound
        ? "FOUND"
        : "NOT FOUND",
      correct: result.correct ? "YES" : "NO",
      reason: result.reason,
      question: result.question,
      topProduct: result.topProduct,
      topScore: result.topScore.toFixed(4),
      secondScore:
        result.secondScore === null
          ? "-"
          : result.secondScore.toFixed(4),
      scoreGap:
        result.scoreGap === null
          ? "-"
          : result.scoreGap.toFixed(4),
    }))
  );

  const expectedFoundResults = results.filter(
    (result) => result.expectedFound
  );

  const expectedNotFoundResults = results.filter(
    (result) => !result.expectedFound
  );

  const lowestFound = expectedFoundResults.reduce(
    (lowest, result) =>
      result.topScore < lowest.topScore ? result : lowest
  );

  const highestNotFound = expectedNotFoundResults.reduce(
    (highest, result) =>
      result.topScore > highest.topScore ? result : highest
  );

  console.log("\nThreshold analysis:\n");

  console.log(
    `Lowest expected-found score: ${lowestFound.topScore.toFixed(4)}`
  );
  console.log(`Question: ${lowestFound.question}`);

  console.log(
    `\nHighest expected-not-found score: ${highestNotFound.topScore.toFixed(4)}`
  );
  console.log(`Question: ${highestNotFound.question}`);

  if (lowestFound.topScore > highestNotFound.topScore) {
    const suggestedThreshold =
      (lowestFound.topScore + highestNotFound.topScore) / 2;

    console.log(
      `\nClean score separation exists. Candidate threshold: ${suggestedThreshold.toFixed(4)}`
    );
  } else {
    console.log(
      "\nNo clean threshold exists. Some invalid queries score as high as or higher than valid queries."
    );

    console.log(
      "Raw cosine scores overlap, so the identity safeguard is required."
    );
  }

  const correctResults = results.filter(
    (result) => result.correct
  );

  const incorrectResults = results.filter(
    (result) => !result.correct
  );

  console.log("\nFinal decision summary:\n");
  console.log(
    `Correct decisions: ${correctResults.length}/${results.length}`
  );

  if (incorrectResults.length > 0) {
    console.log("\nIncorrect decisions:");

    for (const result of incorrectResults) {
      console.log(
        `- ${result.question} | expected=${result.expectedFound} actual=${result.actualFound} reason=${result.reason} score=${result.topScore.toFixed(4)}`
      );
    }
  }
}

evaluateRetrieval().catch((error) => {
  console.error("Evaluation failed:", error.message);
  process.exitCode = 1;
});
