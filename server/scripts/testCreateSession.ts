import "dotenv/config";
import { createSession } from "../src/auth/createSession";
import { db } from "../src/db/client";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm"; 

// ⚠️ Use an existing userId from your DB
const TEST_EMAIL = "nypahe@gmail.com";


async function main() {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, TEST_EMAIL))
    .limit(1)
    .then((r) => r[0]);

  if (!user) {
    throw new Error("❌ Test user not found");
  }

  const session = await createSession(user.userId);

  console.log("✅ Session created:", session);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
