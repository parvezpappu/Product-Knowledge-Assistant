const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});

const app = require("./app");

const port = Number(process.env.PORT || 3000);

if (
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535
) {
  throw new Error(
    "PORT must be an integer between 1 and 65535."
  );
}

const server = app.listen(port, () => {
  console.log(
    `Product Knowledge Assistant is running on port ${port}.`
  );
});

server.on("error", (error) => {
  console.error(
    "Failed to start the server:",
    error.message
  );

  process.exitCode = 1;
});