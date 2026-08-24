const products = require(
  "../../data/clean-products.json"
);

const {
  generateGroundedAnswer,
} = require("./chat");

async function testChat() {
  const jbl = products.find((product) => {
    return product.id === "P-1007";
  });

  if (!jbl) {
    throw new Error(
      "JBL Go 3 was not found in clean products."
    );
  }

  const question =
    "Give me the product link for the JBL Go 3.";

  console.log("Question:", question);
  console.log("Matched product:", jbl.name);
  console.log(
    "Expected link:",
    jbl.productLink
  );

  const answer = await generateGroundedAnswer(
    question,
    [jbl]
  );

  console.log("\nGrounded answer:");
  console.log(answer);

  if (!answer.includes(jbl.productLink)) {
    throw new Error(
      "The grounded answer did not contain the exact product link."
    );
  }

  console.log("\nExact link verification passed.");
}

testChat().catch((error) => {
  console.error(
    "Chat test failed:",
    error.message
  );

  process.exitCode = 1;
});