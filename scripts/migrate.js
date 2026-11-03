require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Question = require("../src/models/Question");
async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const filter = { status: { $exists: false } };
  const count = await Question.countDocuments(filter);
  console.log(`${count} legacy questions need additive defaults`);
  if (process.argv.includes("--apply")) {
    const result = await Question.updateMany(filter, {
      $set: {
        status: "published",
        indexRevision: 1,
        indexedRevision: 0,
        attribution: "Legacy content; provenance unverified",
      },
    });
    console.log(
      `Updated ${result.modifiedCount} records; existing IDs and content preserved`,
    );
  } else console.log("Dry run only. Back up the database before --apply.");
}
main()
  .catch((e) => {
    console.error(e.name);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
