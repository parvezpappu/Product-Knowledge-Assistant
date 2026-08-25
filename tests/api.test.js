const test = require("node:test");
const assert = require("node:assert/strict");

// The validation tests do not call Gemini.
// This dummy value only allows the application modules to load.
process.env.GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "test-api-key";

const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(
      0,
      "127.0.0.1",
      resolve
    );
  });

  const address = server.address();

  baseUrl =
    `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (!server) {
    return;
  }

  if (typeof server.closeAllConnections === "function") {
    server.closeAllConnections();
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("unknown endpoint returns HTTP 404", async () => {
  const response = await fetch(
    `${baseUrl}/missing`
  );

  const body = await response.json();

  assert.equal(response.status, 404);

  assert.deepEqual(body, {
    found: false,
    answer: "Endpoint not found.",
  });
});

test("empty question returns HTTP 400", async () => {
  const response = await fetch(
    `${baseUrl}/ask`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: "   ",
      }),
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.found, false);

  assert.match(
    body.answer,
    /non-empty string/
  );
});

test("missing question returns HTTP 400", async () => {
  const response = await fetch(
    `${baseUrl}/ask`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.found, false);
});

test("malformed JSON returns HTTP 400", async () => {
  const response = await fetch(
    `${baseUrl}/ask`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: '{"question":',
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.found, false);

  assert.equal(
    body.answer,
    "Request body must contain valid JSON."
  );
});

test("question longer than 500 characters returns HTTP 400", async () => {
  const response = await fetch(
    `${baseUrl}/ask`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        question: "a".repeat(501),
      }),
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.found, false);

  assert.match(
    body.answer,
    /must not exceed 500 characters/
  );
});