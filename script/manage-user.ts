import admin, { type ServiceAccount } from "firebase-admin";
import serviceAccount from "./service-account.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

// Helper to extract flags like --uid=123
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);

const { type, uid, role } = args;

async function run() {
  if (type === "setClaims") {
    if (!uid || !role)
      return console.error("Error: --uid and --role are required");
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`✅ Success: ${uid} is now ${role}`);
  } else if (type === "list") {
    const result = await admin.auth().listUsers();
    result.users.forEach((u) =>
      console.log(`${u.email}: ${u.customClaims?.role || "user"}`),
    );
  } else {
    console.log(
      "Usage: node scripts/manage-user.ts --type=setClaims --uid=<uid> --role=admin",
    );
  }
}

run().catch(console.error);
