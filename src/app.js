const express = require("express");
const askRouter = require("./routes/ask");
const {
  isProviderQuotaError,
} = require("./utils/providerErrors");

const app = express();

app.disable("x-powered-by");

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use("/ask", askRouter);

app.use((request, response) => {
  return response.status(404).json({
    found: false,
    answer: "Endpoint not found.",
  });
});

app.use((error, request, response, next) => {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({
      found: false,
      answer: "Request body must contain valid JSON.",
    });
  }

  if (isProviderQuotaError(error)) {
    console.warn(
      "AI provider quota is currently exhausted."
    );

    return response.status(503).json({
      found: false,
      answer:
        "The AI service has reached its current usage limit. Please try again later.",
    });
  }

  console.error("Unhandled request error:", error);

  return response.status(500).json({
    found: false,
    answer:
      "Unable to process the question at this time.",
  });
});

module.exports = app;
