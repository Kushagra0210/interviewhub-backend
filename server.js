require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const createApp = require("./src/app");
async function main() {
  const config = require("./src/config/env")();
  await mongoose.connect(config.MONGO_URI);
  const server = createApp(config).listen(config.PORT, () =>
    console.log(`API listening on ${config.PORT}`),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      }),
    );
}
main().catch((error) => {
  console.error("Startup failed:", error.name, error.code || "", error.codeName || "");
  process.exit(1);
});
