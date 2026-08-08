# Documentation

## Scripts
- \`npm run dev\`: Start the development server.
- \`npm run build\`: Build the application for production.
- \`npm run start\`: Start the production server.
- \`npm run test\`: Run Vitest test suite.
- \`npm run lint\`: Run ESLint and TypeScript checks.
- \`npm run seed\`: Populate the database with sample products.

## Security
- The Express server uses Helmet for CSP, express-rate-limit for abuse prevention, and custom CORS config.
- Authentication utilizes Firebase Auth.

*(Note: Payments and advanced Firestore rules are pending implementation)*
