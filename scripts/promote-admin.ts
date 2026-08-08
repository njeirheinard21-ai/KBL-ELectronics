import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

dotenv.config();

async function promoteAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run promote-admin <email>");
    process.exit(1);
  }

  const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!keyString) {
    console.error("Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required.");
    process.exit(1);
  }

  let serviceAccount;
  if (!keyString.startsWith('{')) {
    try {
      const decoded = Buffer.from(keyString, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        serviceAccount = JSON.parse(decoded);
      } else {
        throw new Error("Invalid format");
      }
    } catch {
      console.error("Error: Invalid FIREBASE_SERVICE_ACCOUNT_KEY format.");
      process.exit(1);
    }
  } else {
    serviceAccount = JSON.parse(keyString);
  }

  initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth();
  const db = getFirestore();

  try {
    const userRecord = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(userRecord.uid, { role: "super_admin" });
    await db.collection("users").doc(userRecord.uid).set({
      role: "super_admin",
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`Successfully promoted user ${email} (${userRecord.uid}) to super_admin.`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Failed to promote user ${email}:`, err.message);
    process.exit(1);
  }
}

promoteAdmin();
