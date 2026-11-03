require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const User = require("../src/models/User");
async function main() {
  const email = process.argv[2];
  if (!email) throw Error("Usage: node scripts/admin.js registered-email");
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } },
  );
  if (!result.matchedCount) throw Error("Register this account first");
  console.log("Admin role granted to existing account");
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
