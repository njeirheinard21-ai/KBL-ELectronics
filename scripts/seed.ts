import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { MOCK_PRODUCTS } from "../src/data/mock-products";

dotenv.config();

const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!keyString) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.");
  process.exit(1);
}

let serviceAccount;

if (keyString.startsWith('-----BEGIN PRIVATE KEY-----')) {
  serviceAccount = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || (process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL ? (process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || "").match(/@(.+?)\.iam\.gserviceaccount\.com/)?.[1] : "kbl-electronics"),
    clientEmail: process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || "ais-sandbox@ais-europe-west2-06673853bf624.iam.gserviceaccount.com",
    privateKey: keyString.split(String.raw`\n`).join('\n'),
  };
} else if (!keyString.startsWith('{')) {
  try {
    const decoded = Buffer.from(keyString, 'base64').toString('utf8');
    if (decoded.trim().startsWith('{')) {
      serviceAccount = JSON.parse(decoded);
    } else {
      throw new Error("Invalid format");
    }
  } catch {
    console.error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable must be JSON.");
    process.exit(1);
  }
} else {
  serviceAccount = JSON.parse(keyString);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function seed() {
  console.log('Starting to seed...');
  for (const product of MOCK_PRODUCTS) {
    const docRef = db.collection('products').doc(product.id);
    // idempotent: update instead of add duplicate
    await docRef.set(product, { merge: true });
    console.log(`Seeded: ${product.name}`);
  }
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
